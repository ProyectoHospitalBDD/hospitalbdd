using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Hospital.Api.Dtos.Empleados;
using Hospital.Api.Services.Empleados;

namespace Hospital.Api.Controllers;

[ApiController]
[Route("api/recep/empleados")]
[Authorize(Roles = "Recepcionista")]
public class EmpleadosController : ControllerBase
{
    private readonly EmpleadosService _svc;
    public EmpleadosController(EmpleadosService svc) => _svc = svc;

    [HttpPost]
    public async Task<ActionResult<CreateEmpleadoResponseDto>> Crear([FromBody] CreateEmpleadoDto dto)
        => Ok(await _svc.CrearAsync(dto));

    [HttpGet]
    public async Task<ActionResult<List<EmpleadoListItemDto>>> Listar(
        [FromQuery] string? tipoUsuario,
        [FromQuery] bool? estatus,
        [FromQuery] string? texto
    )
        => Ok(await _svc.ListarAsync(tipoUsuario, estatus, texto));

    [HttpPatch("{idUsuario:int}/estatus")]
    public async Task<IActionResult> CambiarEstatus(int idUsuario, [FromBody] CambiarEstatusEmpleadoDto dto)
    {
        await _svc.CambiarEstatusAsync(idUsuario, dto.Estatus);
        return NoContent();
    }

}
