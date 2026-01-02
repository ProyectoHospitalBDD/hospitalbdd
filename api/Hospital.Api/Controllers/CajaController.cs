using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Hospital.Api.Persistence;
using Hospital.Api.Dtos.Caja; 
using System.Linq;

namespace Hospital.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CajaController : ControllerBase
    {
        private readonly HospitalContext _db;

        public CajaController(HospitalContext db)
        {
            _db = db;
        }

        [HttpGet("historial")]
        public async Task<ActionResult<List<CobroItemDto>>> GetHistorialCaja(
            [FromQuery] DateTime? fechaInicio, 
            [FromQuery] DateTime? fechaFin)
        {
            // 1. Configuración de fechas
            var hoy = DateTime.Today;
            var inicioDt = fechaInicio?.Date ?? hoy;
            var finDt = fechaFin?.Date.AddDays(1) ?? hoy.AddDays(1);

            var inicioDate = DateOnly.FromDateTime(inicioDt);
            var finDate = DateOnly.FromDateTime(finDt);

            // --- 1. INGRESOS POR CITAS (Desde tabla 'Pago') ---
            var listaPagosCitas = await _db.Pagos
                .Include(p => p.IdCitaNavigation)
                    .ThenInclude(c => c!.IdPacienteNavigation!.IdUsuarioNavigation)
                .Include(p => p.IdCitaNavigation)
                    .ThenInclude(c => c!.IdDoctorNavigation!.IdUsuarioNavigation!.IdUsuarioNavigation)
                .Include(p => p.IdCitaNavigation)
                    .ThenInclude(c => c!.IdDoctorNavigation!.IdEspecialidadNavigation)
                .Where(p => p.FechaPago >= inicioDate && p.FechaPago < finDate)
                .Where(p => p.EstatusPago == "Pagado") 
                .Select(p => new CobroItemDto
                {
                    IdReferencia = p.IdCita, 
                    Origen = "Cita",
                    Paciente = p.IdCitaNavigation != null && p.IdCitaNavigation.IdPacienteNavigation != null && p.IdCitaNavigation.IdPacienteNavigation.IdUsuarioNavigation != null
                        ? (p.IdCitaNavigation.IdPacienteNavigation.IdUsuarioNavigation.Nombre + " " + 
                           p.IdCitaNavigation.IdPacienteNavigation.IdUsuarioNavigation.ApPat).Trim()
                        : "Paciente Desconocido",
                    Concepto = p.IdCitaNavigation != null && p.IdCitaNavigation.IdDoctorNavigation != null
                        ? "Pago Cita " + (p.IdCitaNavigation.IdDoctorNavigation.IdEspecialidadNavigation != null ? p.IdCitaNavigation.IdDoctorNavigation.IdEspecialidadNavigation.NombreEsp : "Gral")
                        : "Pago Cita",
                    MontoTotal = p.Monto,
                    Fecha = p.FechaPago.HasValue 
                        ? p.FechaPago.Value.ToDateTime(p.HoraPago ?? TimeOnly.MinValue)
                        : DateTime.MinValue,
                    Estatus = p.EstatusPago ?? "Pagado"
                })
                .ToListAsync();

            // --- 2. VENTAS FARMACIA WEB (Ingresos directos) ---
            var listaFarmaciaWeb = await _db.CompraWebs
                .Include(cw => cw.IdPacienteNavigation!.IdUsuarioNavigation)
                .Where(cw => cw.FechaCompra >= inicioDt && cw.FechaCompra < finDt)
                .Where(cw => cw.Estatus != "Carrito") 
                .Select(cw => new CobroItemDto
                {
                    IdReferencia = cw.IdCompra,
                    Origen = "Farmacia Web", // Diferenciamos Web de Física
                    Paciente = cw.IdPaciente != null && cw.IdPacienteNavigation != null && cw.IdPacienteNavigation.IdUsuarioNavigation != null
                        ? (cw.IdPacienteNavigation.IdUsuarioNavigation.Nombre + " " + cw.IdPacienteNavigation.IdUsuarioNavigation.ApPat).Trim()
                        : (cw.NombreClienteInvitado ?? "Cliente Mostrador"),
                    Concepto = "Venta Farmacia Web",
                    MontoTotal = cw.TotalGeneral,
                    Fecha = cw.FechaCompra,
                    Estatus = cw.Estatus
                })
                .ToListAsync();

            // --- 3. VENTAS FARMACIA FÍSICA (Desde PagoTicket y Ticket) ---
            var listaFarmaciaFisica = await _db.PagoTickets
                .Include(pt => pt.IdTicketNavigation)
                    .ThenInclude(t => t.IdPacienteNavigation!.IdUsuarioNavigation)
                .Where(pt => pt.FechaPago >= inicioDate && pt.FechaPago < finDate)
                .Where(pt => pt.EstatusPago == "Pagado")
                .Select(pt => new CobroItemDto
                {
                    IdReferencia = pt.IdTicket,
                    Origen = "Farmacia", // O "Farmacia Local"
                    Paciente = pt.IdTicketNavigation.IdPaciente != null && pt.IdTicketNavigation.IdPacienteNavigation != null && pt.IdTicketNavigation.IdPacienteNavigation.IdUsuarioNavigation != null
                         ? (pt.IdTicketNavigation.IdPacienteNavigation.IdUsuarioNavigation.Nombre + " " + pt.IdTicketNavigation.IdPacienteNavigation.IdUsuarioNavigation.ApPat).Trim()
                         : (pt.IdTicketNavigation.NombreClienteInvitado ?? "Cliente Mostrador"),
                    Concepto = "Venta Mostrador #" + pt.IdTicket,
                    MontoTotal = pt.Monto,
                    Fecha = pt.FechaPago.ToDateTime(pt.HoraPago),
                    Estatus = pt.EstatusPago
                })
                .ToListAsync();

            // --- 4. UNIFICAR ---
            var historialUnificado = listaPagosCitas
                .Concat(listaFarmaciaWeb)
                .Concat(listaFarmaciaFisica)
                .OrderByDescending(x => x.Fecha)
                .ToList();

            return Ok(historialUnificado);
        }
    }
}