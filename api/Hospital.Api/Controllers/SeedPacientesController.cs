using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Hospital.Api.Persistence;
using Hospital.Api.Persistence.Models;
using Hospital.Api.Services.Auth;
using Hospital.Api.Seed;

namespace Hospital.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SeedPacientesController : ControllerBase
{
    private readonly HospitalContext _db;
    private readonly PasswordService _password;

    public SeedPacientesController(HospitalContext db, PasswordService password)
    {
        _db = db;
        _password = password;
    }

    // POST: /api/SeedPacientes/pacientes
    [HttpPost("pacientes")]
    [AllowAnonymous]
    public async Task<IActionResult> SeedPacientes()
    {
        if (await _db.Pacientes.AnyAsync())
            return BadRequest("Ya existen pacientes en la BD.");

        var pacientes = GetPacientesSeed();

        foreach (var p in pacientes)
        {
            // Contacto
            var contacto = new Contacto
            {
                TelPersonal = p.TelPersonal,
                CorreoPersonal = p.CorreoPersonal
            };

            // Hash password
            var hashResult = _password.HashPassword(p.PasswordPlano);

            // UsuarioSistema
            var usuario = new UsuarioSistema
            {
                Nombre = p.Nombre,
                ApPat = p.ApPat,
                ApMat = p.ApMat,
                Curp = p.Curp,
                TipoUsuario = p.TipoUsuario,
                PasswordHash = hashResult.hash,
                PasswordSalt = hashResult.salt,
                PasswordIteraciones = hashResult.iterations,
                IdContactoNavigation = contacto
            };

            // Paciente
            var paciente = new Paciente
            {
                IdUsuarioNavigation = usuario,
            };

            _db.Pacientes.Add(paciente);
        }

        await _db.SaveChangesAsync();

        return Ok(new
        {
            Mensaje = "Pacientes creados correctamente",
            Cantidad = pacientes.Count
        });
    }


    private List<PacienteSeedInfo> GetPacientesSeed()
    {
        return new List<PacienteSeedInfo>
        {
            new PacienteSeedInfo
            {
                Nombre = "Jorge",
                ApPat = "Mercado",
                ApMat = "Hernández",
                Curp = "MEHJ011203HDFXRN02",
                TelPersonal = "5544552211",
                CorreoPersonal = "jorge_paciente@demo.com",
                PasswordPlano = "jorge123"
            },
            new PacienteSeedInfo
            {
                Nombre = "Carla",
                ApPat = "Torres",
                ApMat = "Gómez",
                Curp = "TOGC020499MDFXRL05",
                TelPersonal = "5549871234",
                CorreoPersonal = "carla_paciente@demo.com",
                PasswordPlano = "carla123"
            }
        };
    }
}
