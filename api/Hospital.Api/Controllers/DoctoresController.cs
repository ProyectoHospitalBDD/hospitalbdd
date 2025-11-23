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

        public DoctoresController(HospitalContext db){
            _db = db;
        }

        [HttpGet]
        public async Task<ActionResult<List<DoctorListaDto>>> GetPorEspecialidad([FromQuery] int especialidadId){
            
            if(especialidadId <= 0){
                return BadRequest("especialidadId debe ser mayor que 0.");
            }

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

        [HttpGet("{doctorId}/horarios-disponibles")]
        public async Task<ActionResult<List<HorarioDisponibleDto>>> GetHorariosDisponibles(
            int doctorId,
            [FromQuery] DateTime fecha)
        {
            if(fecha == default)
                return BadRequest("Debes enviar una fecha válida (yyyy-MM-dd)");
            //normalizar fecha
            var fechaSolo = fecha.Date;
            //dia en español
            var cultura = new CultureInfo("es-ES");
            var diaSemana = cultura.DateTimeFormat.GetDayName(fechaSolo.DayOfWeek);
            //ajuste dia
            diaSemana = char.ToUpper(diaSemana[0]) + diaSemana.Substring(1);    //ej. Lunes
            //buscar horario de ese dia
            var horario = await _db.HorarioEmpleados
                .FirstOrDefaultAsync (h => h.IdUsuario == doctorId && h.DiaSemana == diaSemana);
            //no trabaja ese dia
            if(horario == null){
                return Ok(new List<HorarioDisponibleDto>());
            }    

            //construir jornada
            var inicioJornada = fechaSolo.Add(horario.HoraInicio.ToTimeSpan());
            var finJornada    = fechaSolo.Add(horario.HoraFin.ToTimeSpan());

            //filtramos las citas para evitar solapamientos
            var citasDia = await _db.Cita
                .Where(c=>
                    c.IdDoctor == doctorId && (c.EstatusCita == "AgendadaPendPago" || c.EstatusCita == "PagadaPendAtender") &&
                    c.FechaHoraInicio.Date == fechaSolo)
                .ToListAsync();
            var ahoraUtc = DateTime.UtcNow;
            var slots = new List<HorarioDisponibleDto>();

            //slots de 1 hora
            var actual = inicioJornada;
            while(actual.AddHours(1) <= finJornada)
            {
                var inicioSlot = actual;
                var finSlot = actual.AddHours(1);

                //3 meses y 48 horas
                if(inicioSlot < ahoraUtc.AddHours(48)){
                    actual = actual.AddHours(1);
                    continue;
                }    
                if(inicioSlot > ahoraUtc.AddMonths(3)){
                    actual = actual.AddHours(1);
                    continue;
                }

                var solapa = citasDia.Any(c =>
                    c.FechaHoraFin > inicioSlot &&
                    c.FechaHoraInicio < finSlot
                );

                if(!solapa){
                    slots.Add(new HorarioDisponibleDto(inicioSlot, finSlot));
                }

                actual = actual.AddHours(1);
            }
            return Ok(slots);
        }

        
        [HttpGet("{doctorId}/fechas-disponibles")]
        public async Task<ActionResult<List<DateTime>>> GetFechasDisponibles(
            int doctorId,
            [FromQuery] DateTime? desde,
            [FromQuery] DateTime? hasta)
        {
            // reglas generales
            var ahora = DateTime.UtcNow;
            var inicio = (desde ?? ahora.AddHours(48)).Date;
            var fin = (hasta ?? ahora.AddMonths(3)).Date;

            if (inicio >= fin)
                return BadRequest("Rango inválido");

            // obtener horarios del doctor
            var horarios = await _db.HorarioEmpleados
                .Where(h => h.IdUsuario == doctorId)
                .ToListAsync();

            if (horarios.Count == 0)
                return Ok(new List<DateTime>()); // doctor sin horarios

            var cultura = new CultureInfo("es-ES");
            var fechasValidas = new List<DateTime>();

            for (var dia = inicio; dia <= fin; dia = dia.AddDays(1))
            {
                var diaSemana = cultura.DateTimeFormat.GetDayName(dia.DayOfWeek);
                diaSemana = char.ToUpper(diaSemana[0]) + diaSemana.Substring(1);

                // ¿Trabaja este día?
                var horario = horarios.FirstOrDefault(h => h.DiaSemana == diaSemana);
                if (horario == null)
                    continue;

                // Revisar si hay al menos un slot disponible
                var inicioJornada = dia + horario.HoraInicio.ToTimeSpan();
                var finJornada = dia + horario.HoraFin.ToTimeSpan();

                var citasDia = await _db.Cita
                    .Where(c =>
                        c.IdDoctor == doctorId &&
                        (c.EstatusCita == "AgendadaPendPago" || c.EstatusCita == "AgendadaPendAtender") &&
                        c.FechaHoraInicio.Date == dia)
                    .ToListAsync();

                var actual = inicioJornada;

                bool haySlot = false;

                while (actual.AddHours(1) <= finJornada)
                {
                    var inicioSlot = actual;
                    var finSlot = actual.AddHours(1);

                    // reglas de tiempo
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

    }
}

