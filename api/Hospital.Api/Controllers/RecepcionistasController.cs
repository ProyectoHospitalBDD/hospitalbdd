using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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
    public class RecepcionistasController : ControllerBase
    {
        private readonly HospitalContext _db;

        public RecepcionistasController(HospitalContext db)
        {
            _db = db;
        }

        // ==================================================
        // GET horario del recepcionista logueado
        // ==================================================
        [HttpGet("me/horario")]
        [Authorize(Roles = "Recepcionista")]
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
        // GET perfil del recepcionista logueado
        // ==================================================
        [HttpGet("me")]
        [Authorize(Roles = "Recepcionista")]
        public async Task<IActionResult> GetMe()
        {
            var idUsuario = UserClaims.GetIdUsuario(User);

            var data = await _db.Recepcionista
                .AsNoTracking()
                .Where(r => r.IdUsuario == idUsuario)
                .Select(r => new
                {
                    idUsuario = r.IdUsuario,

                    nombreCompleto = (
                        r.IdUsuarioNavigation.IdUsuarioNavigation.Nombre + " " +
                        r.IdUsuarioNavigation.IdUsuarioNavigation.ApPat + " " +
                        (r.IdUsuarioNavigation.IdUsuarioNavigation.ApMat ?? "")
                    ).Trim(),

                    curp = r.IdUsuarioNavigation.IdUsuarioNavigation.Curp,

                    estatusEmpleado = r.IdUsuarioNavigation.Estatus,
                    salario = r.IdUsuarioNavigation.Salario,

                    tipoEmpleado = "Recepcionista"
                })
                .FirstOrDefaultAsync();

            if (data is null) return NotFound();
            return Ok(data);
        }
    }
}