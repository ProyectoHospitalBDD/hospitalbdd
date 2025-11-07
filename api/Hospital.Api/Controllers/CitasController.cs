using Microsoft.AspNetCore.Mvc;

namespace Hospital.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CitasController : ControllerBase
{
    private static readonly List<object> _citas = new();

    [HttpGet]
    public IActionResult Get() => Ok(_citas);

    public record CitaPostDto(int idDoctor, int idPaciente, DateTime fechaHoraInicio, DateTime fechaHoraFin, decimal costo, string estatusCita);

    [HttpPost]
    public IActionResult Post([FromBody] CitaPostDto dto)
    {
        if (dto.fechaHoraInicio >= dto.fechaHoraFin) return BadRequest("Rango inválido.");
        var solapa = _citas.Any(x =>
        {
            dynamic c = x;
            return c.idDoctor == dto.idDoctor &&
                   dto.fechaHoraInicio < c.fechaHoraFin &&
                   c.fechaHoraInicio < dto.fechaHoraFin;
        });
        if (solapa) return BadRequest("El doctor ya tiene una cita en ese horario.");

        var created = new { idCita = _citas.Count + 1, dto.idDoctor, dto.idPaciente, dto.fechaHoraInicio, dto.fechaHoraFin, dto.costo, dto.estatusCita };
        _citas.Add(created);
        return Created($"/api/citas/{created.idCita}", created);
    }
}
