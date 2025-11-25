using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Hospital.Api.Persistence;
using Hospital.Api.Persistence.Models;
using Hospital.Api.Seed;
using Hospital.Api.Services.Auth;

namespace Hospital.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SeedEnfermerasController : ControllerBase
    {
        private readonly HospitalContext _db;
        private readonly PasswordService _passwords;

        public SeedEnfermerasController(HospitalContext db, PasswordService passwords)
        {
            _db = db;
            _passwords = passwords;
        }

        // POST /api/SeedEnfermeras/crear
        [HttpPost("crear")]
        [AllowAnonymous]
        public async Task<IActionResult> SeedEnfermeras()
        {
            if (await _db.Enfermeras.AnyAsync())
                return BadRequest("Ya existen enfermeras.");

            var lista = GetSeedData();

            foreach (var e in lista)
            {
                // contacto
                var contacto = new Contacto
                {
                    TelPersonal = e.TelPersonal,
                    CorreoPersonal = e.CorreoPersonal
                };

                // password
                var hash = _passwords.HashPassword(e.PasswordPlano);

                // usuarioSistema
                var usuario = new UsuarioSistema
                {
                    Nombre = e.Nombre,
                    ApPat = e.ApPat,
                    ApMat = e.ApMat,
                    Curp = e.Curp,
                    TipoUsuario = "Enfermera",
                    PasswordHash = hash.hash,
                    PasswordSalt = hash.salt,
                    PasswordIteraciones = hash.iterations,
                    IdContactoNavigation = contacto
                };

                // empleado
                var empleado = new Empleado
                {
                    IdUsuarioNavigation = usuario,
                    Estatus = true,
                    Salario = e.Salario
                };

                // enfermera
                var enfermera = new Enfermera
                {
                    IdUsuarioNavigation = empleado
                };

                _db.Enfermeras.Add(enfermera);
            }

            await _db.SaveChangesAsync();
            return Ok(new { mensaje = "Enfermeras insertadas correctamente", cantidad = lista.Count });
        }


        private List<EnfermeraSeedInfo> GetSeedData()
        {
            return new List<EnfermeraSeedInfo>
            {
                new EnfermeraSeedInfo
                {
                    Nombre = "María",
                    ApPat = "García",
                    ApMat = "Lopez",
                    Curp = "GALM900101MDFRZS09",
                    TelPersonal = "5589765432",
                    CorreoPersonal = "maria_garcia@demo.com",
                    PasswordPlano = "1234",
                    Salario = 7000m
                },

                new EnfermeraSeedInfo
                {
                    Nombre = "Luisa Fernanda",
                    ApPat = "Roldán",
                    ApMat = "Quintero",
                    Curp = "ROQL020594MDFLNS08",
                    TelPersonal = "5543982074",
                    CorreoPersonal = "luisa_roldan@demo.com",
                    PasswordPlano = "nurse123",
                    Salario = 7000m
                },
                new EnfermeraSeedInfo
                {
                    Nombre = "Patricia",
                    ApPat = "Velasco",
                    ApMat = "Jiménez",
                    Curp = "VEJP140890MDFSMT07",
                    TelPersonal = "5567019328",
                    CorreoPersonal = "paty_velasco@demo.com",
                    PasswordPlano = "enf456",
                    Salario = 7000m
                },

                new EnfermeraSeedInfo
                {
                    Nombre = "Ana",
                    ApPat = "Torres",
                    ApMat = "Martínez",
                    Curp = "TOMA950403MDFRZN12",
                    TelPersonal = "5578123401",
                    CorreoPersonal = "ana_torres@demo.com",
                    PasswordPlano = "abcd",
                    Salario = 7000m
                }
            };
        }
    }
}
