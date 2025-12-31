using Hospital.Api.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Api.Controllers;

[ApiController]
[Route("api/pacientes")]
[Authorize(Roles = "Paciente")]
public class PacientesController : ControllerBase
{
    private readonly HospitalContext _db;

    public PacientesController(HospitalContext db)
    {
        _db = db;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        var idUsuario = UserClaims.GetIdUsuario(User);

        var p = await _db.UsuarioSistemas
            .AsNoTracking()
            .Where(us => us.IdUsuario == idUsuario)
            .Select(us => new
            {
                nombreCompleto = (us.Nombre + " " + us.ApPat + " " + (us.ApMat ?? "")).Trim(),
                curp = us.Curp,
                telefono = us.IdContactoNavigation != null
                    ? (us.IdContactoNavigation.TelPersonal ?? us.IdContactoNavigation.TelCasa)
                    : null,
                email = us.IdContactoNavigation != null ? us.IdContactoNavigation.CorreoPersonal : null
            })
            .FirstOrDefaultAsync();

        if (p is null) return NotFound();
        return Ok(p);
    }

    [HttpGet("me/citas")]
    public async Task<IActionResult> GetMisCitas(
        [FromQuery] DateTime? desde,
        [FromQuery] DateTime? hasta,
        [FromQuery] string? estatus)
    {
        var idUsuario = UserClaims.GetIdUsuario(User);

        var q = _db.Cita
            .AsNoTracking()
            .Where(c => c.IdPaciente == idUsuario);

        if (desde.HasValue)
        {
            var d = desde.Value.Date;
            q = q.Where(c => c.FechaHoraInicio >= d);
        }

        if (hasta.HasValue)
        {
            var h = hasta.Value.Date.AddDays(1); // límite exclusivo
            q = q.Where(c => c.FechaHoraInicio < h);
        }

        if (!string.IsNullOrWhiteSpace(estatus))
        {
            q = q.Where(c => c.EstatusCita == estatus);
        }

        
        var rows = await q
            .OrderByDescending(c => c.FechaHoraInicio)
            .Select(c => new
            {
                c.IdCita,
                c.FechaHoraInicio,
                c.EstatusCita,

                // Doctor -> Empleado -> UsuarioSistema (null-safe)
                docNombre = c.IdDoctorNavigation != null
                    ? c.IdDoctorNavigation.IdUsuarioNavigation != null
                        ? c.IdDoctorNavigation.IdUsuarioNavigation.IdUsuarioNavigation != null
                            ? c.IdDoctorNavigation.IdUsuarioNavigation.IdUsuarioNavigation.Nombre
                            : null
                        : null
                    : null,

                docApPat = c.IdDoctorNavigation != null
                    ? c.IdDoctorNavigation.IdUsuarioNavigation != null
                        ? c.IdDoctorNavigation.IdUsuarioNavigation.IdUsuarioNavigation != null
                            ? c.IdDoctorNavigation.IdUsuarioNavigation.IdUsuarioNavigation.ApPat
                            : null
                        : null
                    : null,

                docApMat = c.IdDoctorNavigation != null
                    ? c.IdDoctorNavigation.IdUsuarioNavigation != null
                        ? c.IdDoctorNavigation.IdUsuarioNavigation.IdUsuarioNavigation != null
                            ? c.IdDoctorNavigation.IdUsuarioNavigation.IdUsuarioNavigation.ApMat
                            : null
                        : null
                    : null,

                especialidad = c.IdDoctorNavigation != null && c.IdDoctorNavigation.IdEspecialidadNavigation != null
                    ? c.IdDoctorNavigation.IdEspecialidadNavigation.NombreEsp
                    : null,

                consultorio = c.IdDoctorNavigation != null && c.IdDoctorNavigation.IdConsultorioNavigation != null
                    ? (string?)c.IdDoctorNavigation.IdConsultorioNavigation.Numero
                    : null
                    
            })
            .ToListAsync();

        
        var data = rows.Select(x => new
        {
            folioCita = x.IdCita,
            fecha = x.FechaHoraInicio.ToString("yyyy-MM-dd"),
            hora = x.FechaHoraInicio.ToString("HH:mm"),

            doctor = (x.docNombre is null || x.docApPat is null)
                ? "—"
                : $"{x.docNombre} {x.docApPat} {x.docApMat}".Trim(),

            especialidad = x.especialidad ?? "—",
            consultorio = x.consultorio,

            estatus = x.EstatusCita,

            puedeCancelar =
                x.EstatusCita == "AgendadaPendPago" ||
                x.EstatusCita == "PagadaPendAtender"
        });

        return Ok(data.ToList());
    }


    [HttpGet("me/historial-medico")]
    public async Task<IActionResult> GetMiHistorialMedico()
    {
        var idUsuario = UserClaims.GetIdUsuario(User);

        var hm = await _db.HistorialMedicos
            .AsNoTracking()
            .Where(h => h.IdPaciente == idUsuario)
            .Select(h => new
            {
                tipoSangre = h.TipoSangre,
                peso = h.PesoKg,
                estatura = h.EstaturaM
            })
            .FirstOrDefaultAsync();

        // Si todavía no existe registro, devuelve objeto vacío
        return Ok(hm ?? new { tipoSangre = "", peso = (decimal?)null, estatura = (decimal?)null });
    }
}
