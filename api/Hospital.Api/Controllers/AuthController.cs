using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Hospital.Api.Persistence;
using Hospital.Api.Persistence.Models;
using Hospital.Api.Services;
using Hospital.Api.Services.Auth;
using Hospital.Api.Dtos.Auth;
using Microsoft.AspNetCore.Authorization;

namespace Hospital.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly HospitalContext _db;
    private readonly PasswordService _passwordService;
    private readonly TokenService _tokenService;

    public AuthController(HospitalContext db, PasswordService passwordService, TokenService tokenService)
    {
        _db = db;
        _passwordService = passwordService;
        _tokenService = tokenService;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginRequestDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Correo) || string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest("Debes enviar correo y contraseña.");

        // Traemos el usuario + su Contacto
        var usuario = await _db.UsuarioSistemas
        .Include(us => us.IdContactoNavigation)
        .AsNoTracking()
        .FirstOrDefaultAsync(us =>
            us.IdContactoNavigation != null &&
            us.IdContactoNavigation.CorreoPersonal == dto.Correo);

        if (usuario == null)
            return Unauthorized("Usuario o contraseña incorrectos.");

        // Validamos la contraseña
        var ok = _passwordService.VerifyPassword(
            dto.Password,
            usuario.PasswordHash!,
            usuario.PasswordSalt!,
            usuario.PasswordIteraciones!.Value
        );

        if (!ok)
            return Unauthorized("Usuario o contraseña incorrectos.");

        
        var activo = await _db.Empleados
            .AsNoTracking()
            .Where(e => e.IdUsuario == usuario.IdUsuario)
            .Select(e => e.Estatus) // BIT → bool
            .SingleOrDefaultAsync();

        // Si no existe o está inactivo → NO LOGIN
        if (!activo)
            return Unauthorized("Tu cuenta está inactiva. Contacta a recepción.");
        

        // Construir respuesta
        var nombre = $"{usuario.Nombre} {usuario.ApPat} {usuario.ApMat}";
        
        var token = _tokenService.GenerarToken(
            usuario.IdUsuario,
            nombre,
            usuario.TipoUsuario
        );

        var response = new LoginResponseDto
        {
            IdUsuario = usuario.IdUsuario,
            NombreCompleto = nombre,
            Rol = usuario.TipoUsuario,
            Token = token,
        };

        return Ok(response);
    }

    // SOLO PARA DESARROLLO / PRUEBAS
    // Llama a POST /api/Auth/seed-admin una vez 
    [HttpPost("seed-admin")]
    [AllowAnonymous]
    public async Task<IActionResult> SeedAdmin()
    {
        // 1) ¿Ya existe un usuario con este correo?
        var correo = "admin@hospital.com";

        var yaExiste = await _db.UsuarioSistemas
            .Include(us => us.IdContactoNavigation)
            .AnyAsync(us => us.IdContactoNavigation != null &&
                            us.IdContactoNavigation.CorreoPersonal == correo);

        if (yaExiste)
        {
            return BadRequest("Ya existe un usuario con el correo admin@hospital.com");
        }

        // 2) Crear contacto
        var contacto = new Contacto
        {
            TelCasa = null,
            TelPersonal = "5555555555",
            CorreoPersonal = correo
        };

        // 3) Crear hash de contraseña
        var passwordPlano = "Admin123"; // la usarás para iniciar sesión
        var hashResult = _passwordService.HashPassword(passwordPlano);

        // 4) Crear usuario 
        //    
        var usuario = new UsuarioSistema
        {
            Nombre = "Admin",
            ApPat = "General",
            ApMat = "Hospital",
            TipoUsuario = "Recepcionista",       
            Curp = "AAAAAAAAAAAAAADMIN",         // 18 caracteres cualquiera 
            PasswordHash = hashResult.hash,
            PasswordSalt = hashResult.salt,
            PasswordIteraciones = hashResult.iterations,
            IdContactoNavigation = contacto
        };

        _db.UsuarioSistemas.Add(usuario);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            Mensaje = "Usuario admin creado correctamente.",
            Correo = correo,
            Password = passwordPlano,
            TipoUsuario = usuario.TipoUsuario
        });
    }


}
