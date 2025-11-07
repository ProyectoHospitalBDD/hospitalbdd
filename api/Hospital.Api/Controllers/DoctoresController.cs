using Microsoft.AspNetCore.Mvc;

namespace Hospital.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DoctoresController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok(new[] {
        new { idUsuario = 1, nombre = "Gregory", apPat = "House", cedula = "CED123", idEspecialidad = 1, idConsultorio = 1 },
        new { idUsuario = 2, nombre = "Meredith", apPat = "Grey",  cedula = "CED456", idEspecialidad = 2, idConsultorio = 2 },
    });

    public record DoctorPostDto(string nombre, string apPat, string cedula, int idEspecialidad, int idConsultorio);

    [HttpPost]
    public IActionResult Post([FromBody] DoctorPostDto dto)
        => Created("/api/doctores/99", new { idUsuario = 99, dto.nombre, dto.apPat, dto.cedula, dto.idEspecialidad, dto.idConsultorio });
}
