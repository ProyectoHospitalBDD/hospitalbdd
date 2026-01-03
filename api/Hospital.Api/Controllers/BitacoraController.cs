using Hospital.Api.Dtos.Bitacora;
using Hospital.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Hospital.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Recepcionista")]
public class BitacoraController : ControllerBase
{
    private readonly BitacoraService _svc;
    public BitacoraController(BitacoraService svc) => _svc = svc;

    // GET: /api/Bitacora/recepcion/buscar?texto=...&desdeUtc=...&hastaUtc=...&estatus=...&idPaciente=...&idDoctor=...
    [HttpGet("recepcion/buscar")]
    public async Task<ActionResult<List<BitacoraHistorialRowDto>>> Buscar(
        [FromQuery] string? texto,
        [FromQuery] DateTime? desdeUtc,
        [FromQuery] DateTime? hastaUtc,
        [FromQuery] string? estatus,
        [FromQuery] int? idPaciente,
        [FromQuery] int? idDoctor
    )
    {
        var res = await _svc.BuscarAsync(texto, desdeUtc, hastaUtc, estatus, idPaciente, idDoctor);
        return Ok(res);
    }
}
