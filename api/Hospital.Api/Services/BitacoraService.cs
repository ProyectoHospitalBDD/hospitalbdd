using Hospital.Api.Dtos.Bitacora;
using Hospital.Api.Persistence;
using Hospital.Api.Persistence.Models;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Api.Services;

public class BitacoraService
{
    private readonly HospitalContext _db;
    public BitacoraService(HospitalContext db) => _db = db;

    public async Task<List<BitacoraHistorialRowDto>> BuscarAsync(
        string? texto,
        DateTime? desdeUtc,
        DateTime? hastaUtc,
        string? estatus,
        int? idPaciente,
        int? idDoctor
    )
    {
        texto = string.IsNullOrWhiteSpace(texto) ? null : texto.Trim().ToLower();
        estatus = string.IsNullOrWhiteSpace(estatus) ? null : estatus.Trim();

        // Consumimos la VIEW (más flexible para filtros generales)
        var q = _db.Set<VwBitacoraHistorialCitaMp>()
        .AsNoTracking()
        .AsQueryable();

        // filtros directos
        if (desdeUtc.HasValue) q = q.Where(x => x.FechaMovimiento >= desdeUtc.Value);
        if (hastaUtc.HasValue) q = q.Where(x => x.FechaMovimiento <= hastaUtc.Value);
        if (estatus is not null) q = q.Where(x => x.EstatusConsulta == estatus);
        if (idPaciente.HasValue) q = q.Where(x => x.IdPaciente == idPaciente.Value);
        if (idDoctor.HasValue) q = q.Where(x => x.IdDoctor == idDoctor.Value);

        // texto: paciente, doctor, usuarioMov, idCita, idBitacora
        if (texto is not null)
        {
            if (int.TryParse(texto, out var num))
            {
                q = q.Where(x => x.IdCita == num || x.IdBitacora == num);
            }
            else
            {
                q = q.Where(x =>
                    (x.NombrePaciente ?? "").ToLower().Contains(texto) ||
                    (x.NombreDoctor ?? "").ToLower().Contains(texto) ||
                    (x.UsuarioMov ?? "").ToLower().Contains(texto) ||
                    (x.Especialidad ?? "").ToLower().Contains(texto) ||
                    (x.Consultorio ?? "").ToLower().Contains(texto)
                );
            }
        }

        var rows = await q
            .OrderByDescending(x => x.FechaMovimiento)
            .ThenByDescending(x => x.IdBitacora)
            .Take(300)
            .Select(x => new BitacoraHistorialRowDto(
                x.IdBitacora,
                x.FechaMovimiento,
                x.UsuarioMov,
                x.Especialidad,
                x.NombrePaciente,
                x.Diagnostico,
                x.Consultorio,
                x.EstatusConsulta,
                x.IdCita,
                x.FechaCita,
                x.HoraCita,
                x.IdReceta,
                x.IdPaciente,
                x.IdDoctor
            ))
            .ToListAsync();

        return rows;
    }

    // Mapeo KEYLESS para la VIEW dbo.vw_BitacoraHistorialCitaMP
    [Keyless]
    private class VwBitacoraRow
    {
        public int IdBitacora { get; set; }
        public DateTime FechaMovimiento { get; set; }
        public string UsuarioMov { get; set; } = null!;
        public string Especialidad { get; set; } = null!;
        public string NombrePaciente { get; set; } = null!;
        public string? Diagnostico { get; set; }
        public string Consultorio { get; set; } = null!;
        public int IdPaciente { get; set; }
        public int IdDoctor { get; set; }
        public int IdCita { get; set; }
        public int? IdReceta { get; set; }
        public string EstatusConsulta { get; set; } = null!;
        public DateTime FechaCita { get; set; }
        public TimeSpan HoraCita { get; set; }
        public string NombreDoctor { get; set; } = null!;
    }
}
