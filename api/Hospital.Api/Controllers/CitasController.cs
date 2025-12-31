using Microsoft.AspNetCore.Mvc;
using Hospital.Api.Dtos.Citas;
using Hospital.Api.Services;
using Microsoft.AspNetCore.Authorization;

namespace Hospital.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
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
    [Authorize(Roles = "Paciente")]
    public async Task<IActionResult> CancelarPaciente([FromRoute] int id)
    {
        await _svc.CancelarPacienteAsync(id);
        return NoContent();
    }

    // ==================================================
    // Doctor → solicitar cancelación
    // ==================================================
    [HttpPost("{id:int}/cancelacion/solicitar")]
    [Authorize(Roles = "Doctor")]
    public async Task<IActionResult> SolicitarCancelacionDoctor(int id)
    {
        var idDoctor = UserClaims.GetIdUsuario(User);
        await _svc.SolicitarCancelacionDoctorAsync(id, idDoctor);
        return NoContent();
    }

    // ==================================================
    // Recepcionista → confirmar cancelación
    // ==================================================
    [HttpPost("{id:int}/cancelacion/confirmar")]
    [Authorize(Roles = "Recepcionista")]
    public async Task<IActionResult> ConfirmarCancelacionDoctor(int id)
    {
        await _svc.ConfirmarCancelacionDoctorAsync(id);
        return NoContent();
    }

    // ==================================================
    // Recepcionista → rechazar cancelación
    // ==================================================
    [HttpPost("{id:int}/cancelacion/rechazar")]
    [Authorize(Roles = "Recepcionista")]
    public async Task<IActionResult> RechazarCancelacionDoctor(int id)
    {
        await _svc.RechazarCancelacionDoctorAsync(id);
        return NoContent();
    }
}
