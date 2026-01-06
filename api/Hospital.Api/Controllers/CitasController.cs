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

    // ==================================================
    // Recepcionista → ver pendientes de cancelación doctor
    // ==================================================
    [HttpGet("cancelacion/pendientes")]
    [Authorize(Roles = "Recepcionista")]
    public async Task<ActionResult<List<CancelacionPendienteDto>>> PendientesCancelacionDoctor()
    {
        var data = await _svc.GetPendientesCancelacionDoctorAsync();
        return Ok(data);
    }

    // Recepcionista → cancelar cita (manual)
    [HttpPost("{id:int}/cancelar/recepcion")]
    [Authorize(Roles = "Recepcionista")]
    public async Task<IActionResult> CancelarPorRecepcion([FromRoute] int id)
    {
        await _svc.CancelarPacienteAsync(id); 
        return NoContent();
    }

    // ==================================================
    // Recepcionista → buscar citas (para cancelar)
    // ==================================================
    [HttpGet("recepcion/buscar")]
    [Authorize(Roles = "Recepcionista")]
    public async Task<ActionResult<List<CitaRecepRowDto>>> BuscarCitasRecepcion(
        [FromQuery] string? texto,
        [FromQuery] DateTime? desdeUtc,
        [FromQuery] DateTime? hastaUtc,
        [FromQuery] string? estatus
    )
    {
        var res = await _svc.BuscarCitasRecepcionAsync(texto, desdeUtc, hastaUtc, estatus);
        return Ok(res);
    }

    // ==================================================
    // Doctor → marcar No Acudió
    // ==================================================
    [HttpPost("{id:int}/no-acudio")]
    [Authorize(Roles = "Doctor")]
    public async Task<IActionResult> MarcarNoAcudio([FromRoute] int id)
    {
        var idDoctor = UserClaims.GetIdUsuario(User);
        await _svc.MarcarNoAcudioAsync(id, idDoctor);
        return NoContent();
    }





}
