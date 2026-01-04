using Hospital.Api.Persistence;
using Hospital.Api.Persistence.Models;
using Hospital.Api.Dtos; 
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

    // --- 1. PERFIL (GET) ---
    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        var idUsuario = UserClaims.GetIdUsuario(User);

        var p = await _db.UsuarioSistemas
            .AsNoTracking()
            .Where(us => us.IdUsuario == idUsuario)
            .Select(us => new
            {
                nombre = us.Nombre,
                apPat = us.ApPat,
                apMat = us.ApMat,
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

    // --- 1.1 PERFIL (PUT - ACTUALIZAR) ---
    [HttpPut("me")]
    public async Task<IActionResult> ActualizarPerfil([FromBody] UpdatePerfilDto dto)
    {
        var idUsuario = UserClaims.GetIdUsuario(User);
        bool correoCambio = false;

        var usuario = await _db.UsuarioSistemas
            .Include(u => u.IdContactoNavigation) 
            .FirstOrDefaultAsync(u => u.IdUsuario == idUsuario);

        if (usuario == null) return NotFound("Usuario no encontrado.");

        // 1. Actualizar datos básicos (Nombre)
        usuario.Nombre = dto.Nombre;
        usuario.ApPat = dto.ApPat;
        usuario.ApMat = dto.ApMat;

        // 2. Actualizar CURP (con validación de duplicados)
        if (!string.Equals(usuario.Curp, dto.Curp, StringComparison.OrdinalIgnoreCase))
        {
            var curpOcupado = await _db.UsuarioSistemas.AnyAsync(u => u.Curp == dto.Curp && u.IdUsuario != idUsuario);
            if (curpOcupado) return BadRequest("El CURP ingresado ya está registrado por otro usuario.");
            
            usuario.Curp = dto.Curp;
        }

        // 3. Actualizar Contacto (Email y Teléfono)
        if (usuario.IdContactoNavigation != null)
        {
            // Verificar si cambió el correo
            if (!string.Equals(usuario.IdContactoNavigation.CorreoPersonal, dto.Email, StringComparison.OrdinalIgnoreCase))
            {
                var correoOcupado = await _db.Contactos.AnyAsync(c => c.CorreoPersonal == dto.Email && c.IdContacto != usuario.IdContacto);
                if (correoOcupado) return BadRequest("El correo electrónico ya está en uso por otro usuario.");

                usuario.IdContactoNavigation.CorreoPersonal = dto.Email;
                correoCambio = true; 
            }

            usuario.IdContactoNavigation.TelPersonal = dto.Telefono;
        }

        await _db.SaveChangesAsync();

        return Ok(new 
        { 
            message = correoCambio ? "Perfil actualizado. Al cambiar tu correo, debes iniciar sesión nuevamente." : "Perfil actualizado correctamente.",
            requireRelogin = correoCambio 
        });
    }

    // --- 2. CITAS ---
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
            var h = hasta.Value.Date.AddDays(1);
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

    // --- 3. HISTORIAL MÉDICO (GET) ---
    [HttpGet("me/historial-medico")]
    public async Task<ActionResult<HistorialMedicoDto>> GetMiHistorialMedico()
    {
        var idUsuario = UserClaims.GetIdUsuario(User);

        var hm = await _db.HistorialMedicos
            .AsNoTracking()
            .Where(h => h.IdPaciente == idUsuario)
            .Select(h => new HistorialMedicoDto
            {
                TipoSangre = h.TipoSangre,
                Peso = h.PesoKg,
                Estatura = h.EstaturaM
            })
            .FirstOrDefaultAsync();

        return Ok(hm); 
    }

    // --- 4. HISTORIAL MÉDICO (POST - Upsert) ---
    [HttpPost("me/historial-medico")]
    public async Task<IActionResult> GuardarHistorial([FromBody] HistorialMedicoDto dto)
    {
        var idUsuario = UserClaims.GetIdUsuario(User);

        try 
        {
            var existePaciente = await _db.Pacientes.AnyAsync(p => p.IdUsuario == idUsuario);
            
            if (!existePaciente)
            {
                var nuevoPaciente = new Paciente { IdUsuario = idUsuario };
                _db.Pacientes.Add(nuevoPaciente);
                await _db.SaveChangesAsync(); 
            }

            var historial = await _db.HistorialMedicos
                                    .FirstOrDefaultAsync(h => h.IdPaciente == idUsuario);

            if (historial == null)
            {
                historial = new HistorialMedico
                {
                    IdPaciente = idUsuario,
                    TipoSangre = dto.TipoSangre,
                    PesoKg = dto.Peso,
                    EstaturaM = dto.Estatura
                };
                _db.HistorialMedicos.Add(historial);
            }
            else
            {
                historial.TipoSangre = dto.TipoSangre;
                historial.PesoKg = dto.Peso;
                historial.EstaturaM = dto.Estatura;
                _db.HistorialMedicos.Update(historial);
            }

            await _db.SaveChangesAsync();
            return Ok(new { message = "Historial médico guardado correctamente." });
        }
        catch (DbUpdateException dbEx)
        {
            var sqlError = dbEx.InnerException?.Message ?? dbEx.Message;
            return StatusCode(500, new { message = $"Error de BD: {sqlError}" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Error interno: {ex.Message}" });
        }
    }

    // ====================================================================
    // --- 5. ALERGIAS Y PADECIMIENTOS ---
    // ====================================================================

    // A) Catálogo
    [HttpGet("alergias/catalogo")]
    public async Task<ActionResult<List<AlergiaItemDto>>> GetCatalogoAlergias()
    {
        var lista = await _db.AlergiaPadecimientos
            .AsNoTracking()
            .Select(a => new AlergiaItemDto
            {
                IdAlerPade = a.IdAlerPade,
                Nombre = a.Nombre,
                Tipo = a.Tipo
            })
            .ToListAsync();

        return Ok(lista);
    }

    // B) Mis Alergias
    [HttpGet("me/alergias")]
    public async Task<ActionResult<List<PacienteAlergiaDto>>> GetMisAlergias()
    {
        var idUsuario = UserClaims.GetIdUsuario(User);

        var misAlergias = await _db.PacienteAlergiaPadecimientos
            .AsNoTracking()
            .Include(pap => pap.IdAlerPadeNavigation)
            .Where(pap => pap.IdPaciente == idUsuario)
            .Select(pap => new PacienteAlergiaDto
            {
                IdAlerPade = pap.IdAlerPade,
                Nombre = pap.IdAlerPadeNavigation.Nombre,
                NombreNormalizado = pap.IdAlerPadeNavigation.NombreNormalizado ?? pap.IdAlerPadeNavigation.Nombre,
                Tipo = pap.IdAlerPadeNavigation.Tipo,
                
                Severidad = pap.Severidad,
                Estado = pap.Estado,
                Reaccion = pap.Reaccion,
                Observaciones = pap.Observaciones,
                FechaInicio = pap.FechaInicio != null 
                    ? pap.FechaInicio.Value.ToDateTime(TimeOnly.MinValue) 
                    : null
            })
            .ToListAsync();

        return Ok(misAlergias);
    }

    // C) Agregar
    [HttpPost("me/alergias")]
    public async Task<IActionResult> AgregarAlergia([FromBody] AgregarAlergiaDto dto)
    {
        var idUsuario = UserClaims.GetIdUsuario(User);

        var existePaciente = await _db.Pacientes.AnyAsync(p => p.IdUsuario == idUsuario);
        if (!existePaciente)
        {
            _db.Pacientes.Add(new Paciente { IdUsuario = idUsuario });
            await _db.SaveChangesAsync();
        }

        var yaExiste = await _db.PacienteAlergiaPadecimientos
            .AnyAsync(pap => pap.IdPaciente == idUsuario && pap.IdAlerPade == dto.IdAlerPade);
        
        if (yaExiste) return BadRequest("Ya tienes registrado este padecimiento/alergia.");

        var nuevo = new PacienteAlergiaPadecimiento
        {
            IdPaciente = idUsuario,
            IdAlerPade = dto.IdAlerPade,
            Estado = "Activo" 
        };

        _db.PacienteAlergiaPadecimientos.Add(nuevo);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Agregado correctamente." });
    }

    // D) Eliminar
    [HttpDelete("me/alergias/{idAlerPade}")]
    public async Task<IActionResult> EliminarAlergia(int idAlerPade)
    {
        var idUsuario = UserClaims.GetIdUsuario(User);

        var registro = await _db.PacienteAlergiaPadecimientos
            .FirstOrDefaultAsync(pap => pap.IdPaciente == idUsuario && pap.IdAlerPade == idAlerPade);

        if (registro == null) return NotFound("No se encontró el registro.");

        _db.PacienteAlergiaPadecimientos.Remove(registro);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Eliminado correctamente." });
    }
}