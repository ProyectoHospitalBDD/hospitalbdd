using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Hospital.Api.Persistence;
using Hospital.Api.Persistence.Models;
using Hospital.Api.Dtos;

namespace Hospital.Api.Controllers
{
    [ApiController]
    [Route("api/recep/horarios")]
    [Authorize(Roles = "Recepcionista")]
    public class HorariosController : ControllerBase
    {
        private readonly HospitalContext _context;

        public HorariosController(HospitalContext context)
        {
            _context = context;
        }

        [HttpGet("pendientes")]
        public async Task<ActionResult<List<EmpleadoSinHorarioDto>>> GetEmpleadosSinHorario()
        {

            var query = from u in _context.UsuarioSistemas
                        join e in _context.Empleados on u.IdUsuario equals e.IdUsuario
                        where e.Estatus == true 
                              && (new[] { "Doctor", "Recepcionista", "Enfermera", "Farmaceutico" }.Contains(u.TipoUsuario))
                              && !_context.HorarioEmpleados.Any(h => h.IdUsuario == u.IdUsuario)
                        select new EmpleadoSinHorarioDto
                        {
                            IdUsuario = u.IdUsuario,
                            NombreCompleto = (u.Nombre + " " + u.ApPat + " " + (u.ApMat ?? "")).Trim(),
                            TipoUsuario = u.TipoUsuario
                        };

            return Ok(await query.ToListAsync());
        }

        [HttpPost("asignar")]
        public async Task<IActionResult> AsignarHorario([FromBody] AsignarHorarioRequestDto dto)
        {
            if (dto.IdUsuario <= 0) return BadRequest("Usuario inválido.");


            TimeOnly horaInicio, horaFin;

            if (dto.Turno == "Matutino")
            {
                horaInicio = new TimeOnly(7, 0);  // 07:00
                horaFin = new TimeOnly(13, 0);    // 13:00
            }
            else if (dto.Turno == "Vespertino")
            {
                horaInicio = new TimeOnly(13, 0); // 13:00
                horaFin = new TimeOnly(19, 0);    // 19:00
            }
            else
            {
                return BadRequest("El turno debe ser 'Matutino' o 'Vespertino'.");
            }

            // Definir días
            List<string> diasInsertar = new();
            if (dto.PatronDias == "LMV")
                diasInsertar.AddRange(new[] { "Lunes", "Miércoles", "Viernes" });
            else if (dto.PatronDias == "MJS")
                diasInsertar.AddRange(new[] { "Martes", "Jueves", "Sábado" });
            else
                return BadRequest("El patrón de días debe ser 'LMV' o 'MJS'.");

            // Validar duplicados
            var existe = await _context.HorarioEmpleados.AnyAsync(h => h.IdUsuario == dto.IdUsuario);
            if (existe) return BadRequest("Este empleado ya tiene un horario asignado.");

            // Crear registros
            foreach (var dia in diasInsertar)
            {
                var nuevoHorario = new HorarioEmpleado
                {
                    IdUsuario = dto.IdUsuario,
                    DiaSemana = dia,
                    HoraInicio = horaInicio, 
                    HoraFin = horaFin
                };
                _context.HorarioEmpleados.Add(nuevoHorario);
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Horario asignado correctamente." });
        }
    }
}