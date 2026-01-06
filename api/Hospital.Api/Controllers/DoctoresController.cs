using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using Hospital.Api.Dtos.Doctores;
using Hospital.Api.Persistence;
using Hospital.Api.Persistence.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DoctoresController : ControllerBase
    {
        private readonly HospitalContext _db;

        public DoctoresController(HospitalContext db)
        {
            _db = db;
        }

        // ==================================================
        // GET doctores por especialidad (solo activos)
        // ==================================================
        [HttpGet]
        public async Task<ActionResult<List<DoctorListaDto>>> GetPorEspecialidad([FromQuery] int especialidadId)
        {
            if (especialidadId <= 0)
                return BadRequest("especialidadId debe ser mayor que 0.");

            var doctores = await _db.Doctors
                .Include(d => d.IdUsuarioNavigation)
                .ThenInclude(e => e.IdUsuarioNavigation)
                .Include(d => d.IdConsultorioNavigation) // Incluimos Consultorio
                .Where(d =>
                    d.IdEspecialidad == especialidadId &&
                    d.IdUsuarioNavigation.Estatus == true
                )
                .Select(d => new DoctorListaDto(
                    d.IdUsuario,
                    (
                        d.IdUsuarioNavigation.IdUsuarioNavigation.Nombre + " " +
                        d.IdUsuarioNavigation.IdUsuarioNavigation.ApPat + " " +
                        (d.IdUsuarioNavigation.IdUsuarioNavigation.ApMat ?? "")
                    ).Trim(),
                    d.Cedula,
                    d.IdConsultorioNavigation.Numero // Mapeamos el número
                ))
                .ToListAsync();

            return Ok(doctores);
        }

        // ==================================================
        // GET citas del doctor logueado (rango por fechas)
        // ==================================================
        [HttpGet("me/citas")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> GetMisCitasDoctor([FromQuery] DateTime desde, [FromQuery] DateTime hasta)
        {
            var idUsuario = UserClaims.GetIdUsuario(User);

            var d0 = desde.Date;
            var d1 = hasta.Date.AddDays(1); // exclusivo

            var rows = await _db.Cita
                .AsNoTracking()
                .Where(c =>
                    c.IdDoctor == idUsuario &&
                    c.FechaHoraInicio >= d0 &&
                    c.FechaHoraInicio < d1
                )
                .Select(c => new
                {
                    idCita = c.IdCita,
                    fecha = c.FechaHoraInicio.ToString("yyyy-MM-dd"),
                    horaInicio = c.FechaHoraInicio.ToString("HH:mm"),
                    horaFin = c.FechaHoraFin.ToString("HH:mm"),
                    estatus = c.EstatusCita,

                    idPaciente = c.IdPaciente,

                    paciente = c.IdPacienteNavigation != null
                               && c.IdPacienteNavigation.IdUsuarioNavigation != null
                        ? (
                            c.IdPacienteNavigation.IdUsuarioNavigation.Nombre + " " +
                            c.IdPacienteNavigation.IdUsuarioNavigation.ApPat + " " +
                            (c.IdPacienteNavigation.IdUsuarioNavigation.ApMat ?? "")
                          ).Trim()
                        : "—",
                })
                .ToListAsync();

            return Ok(rows);
        }

        // ==================================================
        // GET horario del doctor logueado
        // ==================================================
        [HttpGet("me/horario")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> GetMiHorario()
        {
            var idUsuario = UserClaims.GetIdUsuario(User);

            var rows = await _db.HorarioEmpleados
                .AsNoTracking()
                .Where(h => h.IdUsuario == idUsuario)
                .Select(h => new
                {
                    h.DiaSemana,
                    h.HoraInicio,
                    h.HoraFin
                })
                .ToListAsync();

            var data = rows
                .Select(x => new
                {
                    diaSemana = x.DiaSemana,
                    horaInicio = x.HoraInicio.ToString("HH:mm"),
                    horaFin = x.HoraFin.ToString("HH:mm")
                })
                .OrderBy(x => DiaOrden(x.diaSemana))
                .ToList();

            return Ok(data);
        }

        private static int DiaOrden(string? dia)
        {
            if (string.IsNullOrWhiteSpace(dia)) return 999;

            var d = dia.Trim().ToLowerInvariant()
                .Replace("á", "a")
                .Replace("é", "e")
                .Replace("í", "i")
                .Replace("ó", "o")
                .Replace("ú", "u");

            return d switch
            {
                "lunes" => 1,
                "martes" => 2,
                "miercoles" => 3,
                "miércoles" => 3,
                "jueves" => 4,
                "viernes" => 5,
                "sabado" => 6,
                "sábado" => 6,
                "domingo" => 7,
                _ => 999
            };
        }

        // ==================================================
        // GET perfil del doctor logueado
        // ==================================================
        [HttpGet("me")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> GetMe()
        {
            var idUsuario = UserClaims.GetIdUsuario(User);

            var data = await _db.Doctors
                .AsNoTracking()
                .Where(d => d.IdUsuario == idUsuario)
                .Select(d => new
                {
                    idUsuario = d.IdUsuario,

                    nombreCompleto = (
                        d.IdUsuarioNavigation.IdUsuarioNavigation.Nombre + " " +
                        d.IdUsuarioNavigation.IdUsuarioNavigation.ApPat + " " +
                        (d.IdUsuarioNavigation.IdUsuarioNavigation.ApMat ?? "")
                    ).Trim(),

                    curp = d.IdUsuarioNavigation.IdUsuarioNavigation.Curp,

                    estatusEmpleado = d.IdUsuarioNavigation.Estatus,
                    salario = d.IdUsuarioNavigation.Salario,

                    cedula = d.Cedula,
                    especialidad = d.IdEspecialidadNavigation.NombreEsp,
                    consultorio = d.IdConsultorioNavigation.Numero
                })
                .FirstOrDefaultAsync();

            if (data is null) return NotFound();
            return Ok(data);
        }

        // ---------------------------
        // Normalización del día
        // ---------------------------
        private static string NormalizarDia(string dia)
        {
            dia = (dia ?? "").Trim().ToLowerInvariant();

            return dia switch
            {
                "miércoles" => "Miercoles",
                "miercoles" => "Miercoles",
                "sábado" => "Sabado",
                "sabado" => "Sabado",
                _ => string.IsNullOrEmpty(dia)
                    ? dia
                    : char.ToUpperInvariant(dia[0]) + dia.Substring(1)
            };
        }

        // ==================================================
        // GET horarios disponibles (bloquea si doctor inactivo)
        // ==================================================
        [HttpGet("{doctorId}/horarios-disponibles")]
        public async Task<ActionResult<List<HorarioDisponibleDto>>> GetHorariosDisponibles(
            int doctorId,
            [FromQuery] DateTime fecha)
        {
            // merge: si está inactivo, no regresa horarios (dev)
            var activo = await _db.Empleados
                .AsNoTracking()
                .Where(e => e.IdUsuario == doctorId)
                .Select(e => e.Estatus)
                .SingleOrDefaultAsync();

            if (activo != true) return Ok(new List<HorarioDisponibleDto>());

            if (fecha == default)
                return BadRequest("Debes enviar una fecha válida (yyyy-MM-dd).");

            var fechaSolo = fecha.Date;

            var cultura = new CultureInfo("es-ES");
            var diaBruto = cultura.DateTimeFormat.GetDayName(fechaSolo.DayOfWeek);
            var diaSemana = NormalizarDia(diaBruto);

            var horario = await _db.HorarioEmpleados
                .FirstOrDefaultAsync(h => h.IdUsuario == doctorId && h.DiaSemana == diaSemana);

            if (horario == null)
                return Ok(new List<HorarioDisponibleDto>());

            var inicioJornada = fechaSolo.Add(horario.HoraInicio.ToTimeSpan());
            var finJornada = fechaSolo.Add(horario.HoraFin.ToTimeSpan());

            var citasDia = await _db.Cita
                .Where(c =>
                    c.IdDoctor == doctorId &&
                    (c.EstatusCita == "AgendadaPendPago" || c.EstatusCita == "PagadaPendAtender") &&
                    c.FechaHoraInicio.Date == fechaSolo)
                .ToListAsync();

            var ahora = DateTime.UtcNow;
            var slots = new List<HorarioDisponibleDto>();

            var actual = inicioJornada;

            while (actual.AddHours(1) <= finJornada)
            {
                var inicioSlot = actual;
                var finSlot = actual.AddHours(1);

                if (inicioSlot < ahora.AddHours(48))
                {
                    actual = actual.AddHours(1);
                    continue;
                }

                if (inicioSlot > ahora.AddMonths(3))
                {
                    actual = actual.AddHours(1);
                    continue;
                }

                var solapa = citasDia.Any(c =>
                    c.FechaHoraFin > inicioSlot &&
                    c.FechaHoraInicio < finSlot
                );

                if (!solapa)
                    slots.Add(new HorarioDisponibleDto(inicioSlot, finSlot));

                actual = actual.AddHours(1);
            }

            return Ok(slots);
        }

        // ==================================================
        // GET fechas disponibles (bloquea si doctor inactivo)
        // ==================================================
        [HttpGet("{doctorId}/fechas-disponibles")]
        public async Task<ActionResult<List<DateTime>>> GetFechasDisponibles(
            int doctorId,
            [FromQuery] DateTime? desde,
            [FromQuery] DateTime? hasta)
        {
            // merge: si está inactivo, no regresa fechas (dev)
            var activo = await _db.Empleados
                .AsNoTracking()
                .Where(e => e.IdUsuario == doctorId)
                .Select(e => e.Estatus)
                .SingleOrDefaultAsync();

            if (activo != true) return Ok(new List<DateTime>());

            var ahora = DateTime.UtcNow;
            var inicio = (desde ?? ahora.AddHours(48)).Date;
            var fin = (hasta ?? ahora.AddMonths(3)).Date;

            if (inicio >= fin)
                return BadRequest("Rango inválido.");

            var horarios = await _db.HorarioEmpleados
                .Where(h => h.IdUsuario == doctorId)
                .ToListAsync();

            if (horarios.Count == 0)
                return Ok(new List<DateTime>());

            var cultura = new CultureInfo("es-ES");
            var fechasValidas = new List<DateTime>();

            for (var dia = inicio; dia <= fin; dia = dia.AddDays(1))
            {
                var diaBruto = cultura.DateTimeFormat.GetDayName(dia.DayOfWeek);
                var diaSemana = NormalizarDia(diaBruto);

                var horario = horarios.FirstOrDefault(h => h.DiaSemana == diaSemana);
                if (horario == null)
                    continue;

                var inicioJornada = dia + horario.HoraInicio.ToTimeSpan();
                var finJornada = dia + horario.HoraFin.ToTimeSpan();

                var citasDia = await _db.Cita
                    .Where(c =>
                        c.IdDoctor == doctorId &&
                        (c.EstatusCita == "AgendadaPendPago" || c.EstatusCita == "PagadaPendAtender") &&
                        c.FechaHoraInicio.Date == dia)
                    .ToListAsync();

                var actual = inicioJornada;
                var haySlot = false;

                while (actual.AddHours(1) <= finJornada)
                {
                    var inicioSlot = actual;
                    var finSlot = actual.AddHours(1);

                    if (inicioSlot < ahora.AddHours(48))
                    {
                        actual = actual.AddHours(1);
                        continue;
                    }

                    if (inicioSlot > ahora.AddMonths(3))
                        break;

                    var solapa = citasDia.Any(c =>
                        c.FechaHoraFin > inicioSlot &&
                        c.FechaHoraInicio < finSlot
                    );

                    if (!solapa)
                    {
                        haySlot = true;
                        break;
                    }

                    actual = actual.AddHours(1);
                }

                if (haySlot)
                    fechasValidas.Add(dia);
            }

            return Ok(fechasValidas);
        }

        // ==================================================
        // GET paciente por ID (para doctores)
        // ==================================================
        [HttpGet("paciente/{id}")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> GetPaciente(int id)
        {
            var p = await _db.Pacientes
                .AsNoTracking()
                .Where(pac => pac.IdUsuario == id)
                .Select(pac => pac.IdUsuarioNavigation)
                .Select(us => new
                {
                    idUsuario = us.IdUsuario,
                    nombreCompleto = (us.Nombre + " " + us.ApPat + " " + (us.ApMat ?? "")).Trim(),
                    curp = us.Curp,
                })
                .FirstOrDefaultAsync();

            if (p is null) return NotFound();
            return Ok(p);
        }

        // ==================================================
        // GET historial médico de paciente (para doctores)
        // ==================================================
        [HttpGet("pacientes/{idPaciente:int}/historial-medico")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> GetHistorialMedicoPaciente(int idPaciente)
        {
            var hm = await _db.HistorialMedicos
                .AsNoTracking()
                .Where(h => h.IdPaciente == idPaciente)
                .Select(h => new
                {
                    tipoSangre = h.TipoSangre,
                    peso = h.PesoKg,
                    estatura = h.EstaturaM
                })
                .FirstOrDefaultAsync();

            return Ok(hm ?? new { tipoSangre = "", peso = (decimal?)null, estatura = (decimal?)null });
        }
    }
}