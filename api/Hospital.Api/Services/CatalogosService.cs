using Microsoft.EntityFrameworkCore;
using Hospital.Api.Dtos.Empleados.Catalogos;
using Hospital.Api.Persistence;

namespace Hospital.Api.Services.Catalogos;

public class CatalogosService
{
    private readonly HospitalContext _db;
    public CatalogosService(HospitalContext db) => _db = db;

    public async Task<List<EspecialidadItemDto>> GetEspecialidadesAsync()
    {
        return await _db.Especialidads
            .AsNoTracking()
            .OrderBy(e => e.NombreEsp)
            .Select(e => new EspecialidadItemDto(
                e.IdEspecialidad,
                e.NombreEsp,
                (decimal)e.Costo
            ))
            .ToListAsync();
    }

    public async Task<List<ConsultorioItemDto>> GetConsultoriosAsync()
    {
        
        return await _db.Consultorios
            .AsNoTracking()
            .Include(c => c.IdEdificioNavigation)
            .OrderBy(c => c.IdEdificio)
            .ThenBy(c => c.Numero)
            .Select(c => new ConsultorioItemDto(
                c.IdConsultorio,
                c.Numero,
                c.IdEdificio,
                c.IdEdificioNavigation.NumPisos,
                "Edificio " + c.IdEdificio
            ))
            .ToListAsync();
    }
}
