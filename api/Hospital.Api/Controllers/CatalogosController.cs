using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Hospital.Api.Services.Catalogos;
using Hospital.Api.Dtos.Empleados.Catalogos;

namespace Hospital.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] 
public class CatalogosController : ControllerBase
{
    private readonly CatalogosService _svc;
    public CatalogosController(CatalogosService svc) => _svc = svc;

    [HttpGet("especialidades")]
    public async Task<ActionResult<List<EspecialidadItemDto>>> Especialidades()
        => Ok(await _svc.GetEspecialidadesAsync());

    [HttpGet("consultorios")]
    public async Task<ActionResult<List<ConsultorioItemDto>>> Consultorios()
        => Ok(await _svc.GetConsultoriosAsync());
}
