using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Hospital.Api.Persistence;
using Hospital.Api.Dtos.Medicamentos;
using Microsoft.AspNetCore.Authorization;

namespace Hospital.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MedicamentosController : ControllerBase
    {
        private readonly HospitalContext _db;

        public MedicamentosController(HospitalContext db)
        {
            _db = db;
        }

        // GET /api/Medicamentos
        [HttpGet]
        public async Task<ActionResult<List<MedicamentoListaDto>>> GetMedicamentos()
        {
            var medicamentos = await _db.Medicamentos
                .Select(m => new MedicamentoListaDto(
                    m.IdMedicamento,
                    m.Descripcion,
                    m.Tipo,
                    m.Capacidad,
                    m.Precio,
                    m.Stock,
                    m.Caducidad,
                    m.IdFarmacia
                ))
                .ToListAsync();

            return Ok(medicamentos);
        }
    }
}