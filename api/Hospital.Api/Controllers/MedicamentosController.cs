using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Hospital.Api.Persistence;
using Hospital.Api.Dtos.Farmacia;

namespace Hospital.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MedicamentosController : ControllerBase
{
    private readonly HospitalContext _db;

    public MedicamentosController(HospitalContext db)
    {
        _db = db;
    }

    // GET: api/Medicamentos
    [HttpGet]
    public async Task<ActionResult<List<MedicamentoDto>>> GetMedicamentos()
    {
        var lista = await _db.Medicamentos
            .Select(m => new MedicamentoDto
            {
                IdMedicamento = m.IdMedicamento,
                Descripcion = m.Descripcion,
                Tipo = m.Tipo,
                Capacidad = m.Capacidad,
                Precio = m.Precio,
                // El error de DateOnly se arregla porque el DTO ahora usa DateOnly
                Stock = m.Stock,
                Caducidad = m.Caducidad 
            })
            .ToListAsync();

        return Ok(lista);
    }

    // GET: api/Medicamentos/5
    [HttpGet("{id}")]
    public async Task<ActionResult<MedicamentoDto>> GetMedicamento(int id)
    {
        var m = await _db.Medicamentos.FindAsync(id);
        if (m == null) return NotFound();

        return Ok(new MedicamentoDto
        {
            IdMedicamento = m.IdMedicamento,
            Descripcion = m.Descripcion,
            Tipo = m.Tipo,
            Capacidad = m.Capacidad,
            Precio = m.Precio,
            Stock = m.Stock,
            Caducidad = m.Caducidad
        });
    }

    // PUT: api/Medicamentos/5/stock
    [HttpPut("{id}/stock")]
    public async Task<IActionResult> UpdateStock(int id, [FromBody] UpdateStockDto dto)
    {
        var m = await _db.Medicamentos.FindAsync(id);
        if (m == null) return NotFound();

        m.Stock = dto.Stock;
        await _db.SaveChangesAsync();

        return NoContent();
    }
}