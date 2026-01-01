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
            // 1. Configuración de fechas (DateTime para CompraWeb)
            var hoy = DateTime.Today;
            var inicioDt = fechaInicio?.Date ?? hoy;
            var finDt = fechaFin?.Date.AddDays(1) ?? hoy.AddDays(1);

            // 2. Configuración de fechas (DateOnly para Pago)
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
                    // CORRECCIÓN 1: IdCita ya es int (no nulo), quitamos '?? 0'
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
                    
                    // CORRECCIÓN 2: Usamos ToDateTime pasando el TimeOnly (o MinValue si es nulo)
                    Fecha = p.FechaPago.HasValue 
                        ? p.FechaPago.Value.ToDateTime(p.HoraPago ?? TimeOnly.MinValue)
                        : DateTime.MinValue,
                    
                    Estatus = p.EstatusPago ?? "Pagado"
                })
                .ToListAsync();

            // --- 2. VENTAS FARMACIA WEB (Ingresos directos) ---
            var listaFarmacia = await _db.CompraWebs
                .Include(cw => cw.IdPacienteNavigation!.IdUsuarioNavigation)
                .Where(cw => cw.FechaCompra >= inicioDt && cw.FechaCompra < finDt)
                .Where(cw => cw.Estatus != "Carrito") 
                .Select(cw => new CobroItemDto
                {
                    IdReferencia = cw.IdCompra,
                    Origen = "Farmacia",
                    Paciente = cw.IdPaciente != null && cw.IdPacienteNavigation != null && cw.IdPacienteNavigation.IdUsuarioNavigation != null
                        ? (cw.IdPacienteNavigation.IdUsuarioNavigation.Nombre + " " + cw.IdPacienteNavigation.IdUsuarioNavigation.ApPat).Trim()
                        : (cw.NombreClienteInvitado ?? "Cliente Mostrador"),
                    
                    Concepto = "Venta Farmacia Web",
                    MontoTotal = cw.TotalGeneral,
                    Fecha = cw.FechaCompra,
                    Estatus = cw.Estatus
                })
                .ToListAsync();

            // --- 3. UNIFICAR ---
            var historialUnificado = listaPagosCitas
                .Concat(listaFarmacia)
                .OrderByDescending(x => x.Fecha)
                .ToList();

            return Ok(historialUnificado);
        }
    }
}