using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Hospital.Api.Dtos.Auth;
using Hospital.Api.Services.Auth;
using Microsoft.Data.SqlClient;

namespace Hospital.Api.Controllers;

[ApiController]
[Route("api/auth/register")]
[AllowAnonymous]
public class RegisterController : ControllerBase
{
    private readonly AuthService _auth;

    public RegisterController(AuthService auth)
    {
        _auth = auth;
    }

    [HttpPost]
public async Task<IActionResult> Registrar(RegisterPacienteDto dto)
{
    try
    {
        var idUsuario = await _auth.RegistrarPacienteAsync(dto);
        return Ok(new { idUsuario });
    }
    catch (Exception ex)
    {
        return BadRequest(new { message = ex.Message });
    }
}
}