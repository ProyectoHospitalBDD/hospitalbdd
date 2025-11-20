using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Hospital.Api.Persistence;
using Hospital.Api.Dtos.Auth;
using Hospital.Api.Persistence.Models;

namespace Hospital.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly HospitalContext _db;

    public AuthController(HospitalContext db)
    {
        _db = db;
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginRequestDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Correo) || string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest("Debes enviar correo y contraseña.");

        // Buscar en usuarioSistema + contacto (por correoPersonal)
        var usuario = await _db.UsuarioSistemas
            .Include(us => us.IdContactoNavigation)           // Contacto
            .AsNoTracking()
            .FirstOrDefaultAsync(us =>
                us.IdContactoNavigation != null &&
                us.IdContactoNavigation.CorreoPersonal == dto.Correo);

        if (usuario == null)
            return Unauthorized("Usuario o contraseña incorrectos.");

        // Validar contraseña (por ahora en texto plano)
        if (usuario.Contrasena != dto.Password)
            return Unauthorized("Usuario o contraseña incorrectos.");

        // Construir nombre completo
        var response = new LoginResponseDto
        {
            IdUsuario = usuario.IdUsuario,
            NombreCompleto = $"{usuario.Nombre} {usuario.ApPat} {usuario.ApMat}",
            Rol = usuario.TipoUsuario      
        };

        return Ok(response);
    }

}
