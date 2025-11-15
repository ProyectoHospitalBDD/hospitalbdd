using Microsoft.AspNetCore.Mvc;
using Hospital.Api.Dtos.Citas;
using Hospital.Api.Services;

namespace Hospital.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CitasController : ControllerBase
{
    private readonly CitasService _svc;
    public CitasController(CitasService svc) => _svc = svc;

    [HttpPost]
    public async Task<ActionResult<CitaResponseDto>> Crear([FromBody] CreateCitaDto dto)
        => Ok(await _svc.CrearAsync(dto));

    [HttpPost("{id:int}/pagar")]
    public async Task<IActionResult> Pagar([FromRoute] int id)
    {
        await _svc.PagarAsync(id);
        return NoContent();
    }

    [HttpPost("{id:int}/cancelar/paciente")]
    public async Task<IActionResult> CancelarPaciente([FromRoute] int id)
    {
        await _svc.CancelarPacienteAsync(id);
        return NoContent();
    }

    [HttpPost("{id:int}/cancelar/doctor")]
    public async Task<IActionResult> CancelarDoctor([FromRoute] int id)
    {
        await _svc.CancelarDoctorAsync(id);
        return NoContent();
    }
}
