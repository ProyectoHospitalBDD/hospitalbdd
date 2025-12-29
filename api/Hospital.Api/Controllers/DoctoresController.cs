using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Hospital.Api.Persistence;
using Hospital.Api.Dtos.Doctores;
using Hospital.Api.Persistence.Models;
using System.Globalization;
using Microsoft.AspNetCore.Authorization;

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

        [HttpGet("me/horario")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> GetMiHorario()
        {
            var idUsuario = UserClaims.GetIdUsuario(User);

            // Trae el horario del doctor logueado
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

            // Formateo en memoria 
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

                    // Doctor -> Empleado -> UsuarioSistema
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
        private string NormalizarDia(string dia)
        {
            dia = dia.ToLower();

            return dia switch
            {
                "miércoles" => "Miercoles",
                "miércoles " => "Miercoles",
                "miercoles" => "Miercoles",

                "sábado" => "Sabado",
                "sábado " => "Sabado",
                "sabado" => "Sabado",

                _ => char.ToUpper(dia[0]) + dia.Substring(1)
            };
        }


        // ==================================================
        // GET doctores por especialidad
        // ==================================================
        [HttpGet]
        public async Task<ActionResult<List<DoctorListaDto>>> GetPorEspecialidad(
            [FromQuery] int especialidadId)
        {
            if (especialidadId <= 0)
                return BadRequest("especialidadId debe ser mayor que 0.");

            var doctores = await _db.Doctors
                .Include(d => d.IdUsuarioNavigation)
                .ThenInclude(e => e.IdUsuarioNavigation)
                .Where(d => d.IdEspecialidad == especialidadId)
                .Select(d => new DoctorListaDto(
                    d.IdUsuario,
                    d.IdUsuarioNavigation.IdUsuarioNavigation.Nombre + " " +
                    d.IdUsuarioNavigation.IdUsuarioNavigation.ApPat + " " +
                    d.IdUsuarioNavigation.IdUsuarioNavigation.ApMat,
                    d.Cedula
                ))
                .ToListAsync();

            return Ok(doctores);
        }


        // ==================================================
        // GET horarios disponibles
        // ==================================================
        [HttpGet("{doctorId}/horarios-disponibles")]
        public async Task<ActionResult<List<HorarioDisponibleDto>>> GetHorariosDisponibles(
            int doctorId,
            [FromQuery] DateTime fecha)
        {
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

                bool solapa = citasDia.Any(c =>
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
        // GET fechas disponibles
        // ==================================================
        [HttpGet("{doctorId}/fechas-disponibles")]
        public async Task<ActionResult<List<DateTime>>> GetFechasDisponibles(
            int doctorId,
            [FromQuery] DateTime? desde,
            [FromQuery] DateTime? hasta)
        {
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
                bool haySlot = false;

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

                    bool solapa = citasDia.Any(c =>
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
    }
}
