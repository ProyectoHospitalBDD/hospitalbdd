using Microsoft.AspNetCore.Mvc;

namespace Hospital.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PacientesController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok(new[] {
        new { idUsuario = 10, nombre = "Juan", apPat = "Pérez" },
        new { idUsuario = 11, nombre = "Ana",  apPat = "López" },
    });
}
