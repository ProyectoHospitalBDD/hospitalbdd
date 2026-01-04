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
    public class FarmaceuticosController : ControllerBase
    {
        private readonly HospitalContext _db;

        public FarmaceuticosController(HospitalContext db)
        {
            _db = db;
        }

        // ==================================================
        // GET horario del farmaceutico logueado
        // ==================================================
        [HttpGet("me/horario")]
        [Authorize(Roles = "Farmaceutico")]
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
        // GET perfil del farmaceutico logueado
        // ==================================================
        [HttpGet("me")]
        [Authorize(Roles = "Farmaceutico")]
        public async Task<IActionResult> GetMe()
        {
            var idUsuario = UserClaims.GetIdUsuario(User);

            var data = await _db.Farmaceuticos
                .AsNoTracking()
                .Where(f => f.IdUsuario == idUsuario)
                .Select(f => new
                {
                    idUsuario = f.IdUsuario,

                    nombreCompleto = (
                        f.IdUsuarioNavigation.IdUsuarioNavigation.Nombre + " " +
                        f.IdUsuarioNavigation.IdUsuarioNavigation.ApPat + " " +
                        (f.IdUsuarioNavigation.IdUsuarioNavigation.ApMat ?? "")
                    ).Trim(),

                    curp = f.IdUsuarioNavigation.IdUsuarioNavigation.Curp,

                    estatusEmpleado = f.IdUsuarioNavigation.Estatus,
                    salario = f.IdUsuarioNavigation.Salario,

                    tipoEmpleado = "Farmaceutico"
                })
                .FirstOrDefaultAsync();

            if (data is null) return NotFound();
            return Ok(data);
        }
    }
}