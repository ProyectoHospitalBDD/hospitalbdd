using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Hospital.Api.Persistence;
using Hospital.Api.Dtos.Farmacia;

namespace Hospital.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ServiciosController : ControllerBase
{
    private readonly HospitalContext _db;

    public ServiciosController(HospitalContext db)
    {
        _db = db;
    }

    // GET: api/Servicios
    [HttpGet]
    public async Task<ActionResult<List<ServicioDto>>> GetServicios()
    {
        var lista = await _db.Servicios
            .Select(s => new ServicioDto
            {
                IdServicio = s.IdServicio,
                Descripcion = s.Descripcion,
                Tipo = s.Tipo,
                Precio = s.Precio,
                Stock = s.Stock 
            })
            .ToListAsync();

        return Ok(lista);
    }

    // PUT: api/Servicios/5/stock
    [HttpPut("{id}/stock")]
    public async Task<IActionResult> UpdateStock(int id, [FromBody] UpdateStockDto dto)
    {
        var s = await _db.Servicios.FindAsync(id);
        if (s == null) return NotFound();

        s.Stock = dto.Stock;
        await _db.SaveChangesAsync();

        return NoContent();
    }
}