using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Hospital.Api.Persistence;
using Hospital.Api.Persistence.Models; 
using Hospital.Api.Dtos.Tickets;

namespace Hospital.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] 
    public class TicketFisicoApiController : ControllerBase
    {
        private readonly HospitalContext _db;

        public TicketFisicoApiController(HospitalContext db)
        {
            _db = db;
        }

        private int? GetUserIdFromClaims()
        {
            var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier)
                      ?? User.FindFirstValue("nameid")
                      ?? User.FindFirstValue("sub");
            if (int.TryParse(idStr, out var id)) return id;
            return null;
        }

        // POST: /api/TicketFisicoApi
        [HttpPost]
        [Authorize(Roles = "Farmaceutico,Admin,Enfermera")]
        public async Task<ActionResult<TicketExitosoDto>> CrearTicket([FromBody] CrearTicketPayload payload)
        {
            if (payload.Detalles == null || payload.Detalles.Count == 0)
                return BadRequest("El ticket no puede estar vacío.");

            var idUsuario = GetUserIdFromClaims();
            if (!idUsuario.HasValue) return Unauthorized("No se pudo obtener el usuario del token.");

            var existeFarmacia = await _db.Farmacia.AnyAsync(f => f.IdFarmacia == payload.IdFarmacia);
            if (!existeFarmacia)
                return BadRequest($"La farmacia con ID {payload.IdFarmacia} no existe.");

            // Validar Paciente
            if (payload.IdUsuarioPaciente.HasValue)
            {
                var existePaciente = await _db.Pacientes.AnyAsync(p => p.IdUsuario == payload.IdUsuarioPaciente.Value);
                if (!existePaciente) return BadRequest("Paciente no existe");
            }

            using var tx = await _db.Database.BeginTransactionAsync();
            try
            {
                var ticket = new Ticket
                {
                    Fecha = DateTime.Now,
                    IdFarmacia = payload.IdFarmacia,
                    IdFarmaceutico = idUsuario.Value,
                    IdPaciente = payload.IdUsuarioPaciente,
                    NombreClienteInvitado = payload.NombreClienteInvitado,
                    CorreoContacto = payload.CorreoContacto,
                    EstatusTicket = "Pagado" 
                };

                _db.Tickets.Add(ticket);
                await _db.SaveChangesAsync();

                foreach (var item in payload.Detalles)
                {
                    if (item.IdMedicamento.HasValue)
                    {
                        int idMed = item.IdMedicamento.Value;
                        var med = await _db.Medicamentos.FindAsync(idMed);
                        if (med == null) throw new Exception($"Medicamento {idMed} no existe.");
                        if (med.Stock < item.Cantidad) throw new Exception($"Stock insuficiente para {med.Descripcion}.");
                        med.Stock -= item.Cantidad;

                        _db.TicketMedicamentos.Add(new TicketMedicamento
                        {
                            IdTicket = ticket.IdTicket,
                            IdMedicamento = idMed,
                            Cantidad = item.Cantidad,
                            PrecioUnitario = item.PrecioUnitario
                        });
                    }
                    else if (item.IdServicio.HasValue)
                    {
                        int idServ = item.IdServicio.Value;
                        var serv = await _db.Servicios.FindAsync(idServ);
                        if (serv == null) throw new Exception($"Servicio {idServ} no existe.");
                        if (serv.Stock != null) {
                            if (serv.Stock < item.Cantidad) throw new Exception($"Cupo insuficiente: {serv.Descripcion}.");
                            serv.Stock -= item.Cantidad;
                        }
                        _db.TicketServicios.Add(new TicketServicio
                        {
                            IdTicket = ticket.IdTicket,
                            IdServicio = idServ,
                            Cantidad = item.Cantidad,
                            PrecioUnitario = item.PrecioUnitario
                        });
                    }
                }
                
                await _db.SaveChangesAsync();

                // Calcular total real desde SQL
                var totalCalculado = await _db.Database
                    .SqlQuery<decimal>($"SELECT TotalGeneral AS Value FROM dbo.fn_TicketTotales({ticket.IdTicket})")
                    .FirstOrDefaultAsync();

                var pago = new PagoTicket
                {
                    EstatusPago = "Pagado",
                    FechaPago = DateOnly.FromDateTime(DateTime.Today),
                    HoraPago = TimeOnly.FromDateTime(DateTime.Now),
                    IdTicket = ticket.IdTicket,
                    IdFarmaceutico = idUsuario.Value,
                    Monto = totalCalculado
                };
                _db.PagoTickets.Add(pago);

                await _db.SaveChangesAsync();
                await tx.CommitAsync();

                return Ok(new TicketExitosoDto 
                { 
                    IdTicket = ticket.IdTicket, 
                    Mensaje = "Venta registrada con éxito",
                    TotalCalculado = totalCalculado
                });
            }
            catch (Exception ex)
            {
                await tx.RollbackAsync();
                var mensajeReal = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                return BadRequest($"Error en base de datos: {mensajeReal}");
            }
        }

        // GET Buscar Paciente EXACTO
        [HttpGet("buscar-paciente")]
        [Authorize(Roles = "Farmaceutico,Admin,Enfermera")]
        public async Task<ActionResult<PacienteLookupDto>> BuscarPaciente([FromQuery] string? curp, [FromQuery] string? email, [FromQuery] int? id)
        {
            var query = _db.UsuarioSistemas
                .Include(u => u.Paciente)
                .Include(u => u.IdContactoNavigation)
                .AsNoTracking()
                .AsQueryable();

            if (id.HasValue) { int i = id.Value; query = query.Where(u => u.IdUsuario == i); }
            else if (!string.IsNullOrWhiteSpace(curp)) query = query.Where(u => u.Curp == curp);
            else if (!string.IsNullOrWhiteSpace(email)) query = query.Where(u => u.IdContactoNavigation != null && u.IdContactoNavigation.CorreoPersonal == email);
            else return BadRequest("Ingrese criterio.");

            var usuario = await query.FirstOrDefaultAsync();
            if (usuario == null) return NotFound("Usuario no encontrado.");

            return Ok(new PacienteLookupDto
            {
                IdUsuarioPaciente = usuario.IdUsuario,
                NombreCompleto = $"{usuario.Nombre} {usuario.ApPat} {usuario.ApMat}".Trim(),
                Curp = usuario.Curp ?? "Sin CURP",
                Email = usuario.IdContactoNavigation != null ? usuario.IdContactoNavigation.CorreoPersonal : null,
                Telefono = usuario.IdContactoNavigation != null ? (usuario.IdContactoNavigation.TelPersonal ?? usuario.IdContactoNavigation.TelCasa) : null
            });
        }

        // --- NUEVO ENDPOINT PARA BÚSQUEDA PREDICTIVA ---
        // GET: /api/TicketFisicoApi/buscar-predictivo?q=Juan
        [HttpGet("buscar-predictivo")]
        [Authorize(Roles = "Farmaceutico,Admin,Enfermera")]
        public async Task<ActionResult<List<PacienteLookupDto>>> BuscarPredictivo([FromQuery] string q)
        {
            if (string.IsNullOrWhiteSpace(q) || q.Length < 3) return Ok(new List<PacienteLookupDto>());

            var usuarios = await _db.UsuarioSistemas
                .Include(u => u.Paciente)
                .Include(u => u.IdContactoNavigation)
                .AsNoTracking()
                // FILTRO CLAVE: Verificamos que tenga un registro en la tabla Pacientes
                // Esto es equivalente a "Es un Paciente" sin depender del nombre de la columna "Rol" o "TipoUsuario"
                .Where(u => u.Paciente != null) 
                .Where(u => u.Nombre.Contains(q) || u.ApPat.Contains(q) || u.Curp.Contains(q))
                .Take(7)
                .Select(u => new PacienteLookupDto
                {
                    IdUsuarioPaciente = u.IdUsuario,
                    NombreCompleto = $"{u.Nombre} {u.ApPat} {u.ApMat}".Trim(),
                    Curp = u.Curp ?? "N/A",
                    Email = u.IdContactoNavigation != null ? u.IdContactoNavigation.CorreoPersonal : ""
                })
                .ToListAsync();

            return Ok(usuarios);
        }
    }
}