// api/Hospital.Api/Controllers/SeedRecepcionistaMaestraController.cs
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Hospital.Api.Persistence;
using Hospital.Api.Persistence.Models;
using Hospital.Api.Services.Auth;

namespace Hospital.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SeedRecepcionistaMaestraController : ControllerBase
    {
        private readonly HospitalContext _db;
        private readonly PasswordService _passwordService;

        public SeedRecepcionistaMaestraController(HospitalContext db, PasswordService passwordService)
        {
            _db = db;
            _passwordService = passwordService;
        }

        // SOLO PARA DESARROLLO
        // POST /api/SeedRecepcionistaMaestra/maestra
        [HttpPost("maestra")]
        [AllowAnonymous]
        public async Task<IActionResult> SeedRecepcionistaMaestra()
        {
            // 1) Si ya existe al menos UNA recepcionista, no hacemos nada
            if (await _db.Recepcionista.AnyAsync())
                return BadRequest("Ya existen recepcionistas en la BD.");

            // (Opcional pero recomendado) evitar duplicado por CURP o correo
            const string curpMaestra = "EAFO010101MDFABC01"; // AJUSTA
            if (await _db.UsuarioSistemas.AnyAsync(u => u.Curp == curpMaestra))
                return BadRequest("Ya existe un UsuarioSistema con esa CURP.");

            // 2) Contacto
            var contacto = new Contacto
            {
                TelPersonal = "5512345678",                 // AJUSTA
                CorreoPersonal = "recep.maestra@demo.com"   // AJUSTA
            };

            // 3) Hash de contraseña
            var hashResult = _passwordService.HashPassword("recep2025"); // AJUSTA

            // 4) UsuarioSistema
            var usuario = new UsuarioSistema
            {
                Nombre = "Recep",               // AJUSTA
                ApPat = "Maestra",
                ApMat = "Admin",
                TipoUsuario = "Recepcionista",  
                Curp = curpMaestra,
                PasswordHash = hashResult.hash,
                PasswordSalt = hashResult.salt,
                PasswordIteraciones = hashResult.iterations,
                IdContactoNavigation = contacto
            };

            // 5) Empleado
            var empleado = new Empleado
            {
                IdUsuarioNavigation = usuario,
                Estatus = true,
                Salario = 20000m // AJUSTA
            };

            // 6) Recepcionista (especialización de empleado)
            var recepcionista = new Recepcionistum
            {
                IdUsuarioNavigation = empleado,
                EsAdmin = true,

                // Si tu tabla tiene campos extra, ponlos aquí:
                // EsAdminMaestro = true,
            };

            _db.Recepcionista.Add(recepcionista);

            await _db.SaveChangesAsync();

            return Ok(new
            {
                Mensaje = "Recepcionista maestra sembrada correctamente.",
                Usuario = new { usuario.Nombre, usuario.ApPat, usuario.ApMat, usuario.TipoUsuario, usuario.Curp }
            });
        }
    }
}
