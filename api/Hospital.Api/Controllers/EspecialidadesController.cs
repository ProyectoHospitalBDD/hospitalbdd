using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Hospital.Api.Persistence;
using Hospital.Api.Dtos.Especialidades;

namespace Hospital.Api.Controllers{
    [ApiController]
    [Route("api/[controller]")]
    public class EspecialidadesController : ControllerBase{
        
        private readonly HospitalContext _db;

        public EspecialidadesController(HospitalContext db){
            _db = db;
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EspecialidadDto>>> GetTodas(){
            var items = await _db.Especialidads
                .Select(e => new EspecialidadDto(
                    e.IdEspecialidad,
                    e.NombreEsp,
                    e.Costo
                ))
                .ToListAsync();
            return Ok(items);
        }

    }
}

