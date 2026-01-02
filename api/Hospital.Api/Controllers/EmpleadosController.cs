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
}
