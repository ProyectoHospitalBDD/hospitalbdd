// api/Hospital.Api/Controllers/SeedFarmaceuticosController.cs
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Hospital.Api.Persistence;
using Hospital.Api.Persistence.Models;
using Hospital.Api.Services.Auth;
using Hospital.Api.Seed;

namespace Hospital.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SeedFarmaceuticosController : ControllerBase
    {
        private readonly HospitalContext _db;
        private readonly PasswordService _passwordService;

        public SeedFarmaceuticosController(HospitalContext db, PasswordService passwordService)
        {
            _db = db;
            _passwordService = passwordService;
        }

        // SOLO PARA DESARROLLO
        // POST /api/SeedFarmaceuticos/farmaceuticos
        [HttpPost("farmaceuticos")]
        [AllowAnonymous]
        public async Task<IActionResult> SeedFarmaceuticos()
        {
            // Si ya hay al menos UN farmacéutico, no hacemos nada
            if (await _db.Farmaceuticos.AnyAsync())
            {
                return BadRequest("Ya existen farmacéuticos en la BD.");
            }

            var farmaceuticos = GetFarmaceuticosSeed();

            foreach (var f in farmaceuticos)
            {
                // 1) Contacto
                var contacto = new Contacto
                {
                    TelPersonal = f.TelPersonal,
                    CorreoPersonal = f.CorreoPersonal
                };

                // 2) Hash de contraseña
                var hashResult = _passwordService.HashPassword(f.PasswordPlano);

                // 3) UsuarioSistema
                var usuario = new UsuarioSistema
                {
                    Nombre = f.Nombre,
                    ApPat = f.ApPat,
                    ApMat = f.ApMat,
                    TipoUsuario = "Farmaceutico", // rol del sistema
                    Curp = f.Curp,
                    PasswordHash = hashResult.hash,
                    PasswordSalt = hashResult.salt,
                    PasswordIteraciones = hashResult.iterations,
                    IdContactoNavigation = contacto
                };

                // 4) Empleado
                var empleado = new Empleado
                {
                    IdUsuarioNavigation = usuario,
                    Estatus = true,
                    Salario = f.Salario
                };

                // 5) Farmaceutico
                var farmaceutico = new Farmaceutico
                {
                    IdUsuarioNavigation = empleado
                };

                _db.Farmaceuticos.Add(farmaceutico);
            }

            await _db.SaveChangesAsync();

            return Ok(new
            {
                Mensaje = "Farmacéuticos sembrados correctamente.",
                Cantidad = farmaceuticos.Count
            });
        }

        // Seed interno con 2 farmacéuticos
        private List<FarmaceuticoSeedInfo> GetFarmaceuticosSeed()
        {
            return new List<FarmaceuticoSeedInfo>
            {
                new FarmaceuticoSeedInfo
                {
                    Nombre = "Gabriel",
                    ApPat = "Hernández",
                    ApMat = "Soto",
                    Curp = "HESG150490HDFRNB05",
                    TelPersonal = "5527198405",
                    CorreoPersonal = "gabriel.hernandez@demo.com",
                    PasswordPlano = "farm2025",
                    Salario = 5000m
                },
                new FarmaceuticoSeedInfo
                {
                    Nombre = "Mariela",
                    ApPat = "Campos",
                    ApMat = "Delgado",
                    Curp = "CADM210892MDFLGR03",
                    TelPersonal = "5530149987",
                    CorreoPersonal = "mariela.campos@demo.com",
                    PasswordPlano = "farma123",
                    Salario = 5000m
                }
            };
        }

        // Clase interna solo para este controller
        
    }
}
