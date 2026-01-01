using System.Linq;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Hospital.Api.Dtos.Citas;
using Hospital.Api.Persistence;
using Hospital.Api.Persistence.Models;

namespace Hospital.Api.Services;

public class CitasService
{
    private readonly HospitalContext _db;
    public CitasService(HospitalContext db) => _db = db;

    public async Task<CitaResponseDto> CrearAsync(CreateCitaDto dto)
    {
        var p1 = new SqlParameter("@PacienteId",  dto.PacienteId);
        var p2 = new SqlParameter("@DoctorId",    dto.DoctorId);
        var p3 = new SqlParameter("@FechaInicio", dto.FechaInicioUtc);
        var p4 = new SqlParameter("@DuracionMin", dto.DuracionMin);

    // ejecutamos SP y traemos el resultado como lista
        var rows = await _db.Set<_CitaSpRow>()
            .FromSqlRaw(
                "EXEC dbo.sp_Cita_Crear @PacienteId,@DoctorId,@FechaInicio,@DuracionMin",// <-- AQUÍ se ejecuta el SP
                p1, p2, p3, p4
            )
            .AsNoTracking()
            .ToListAsync();  

        var row = rows.Single();  

        return new CitaResponseDto(
            row.IdCita,
            row.IdPaciente,
            row.IdDoctor,
            row.EstatusCita,
            row.FechaHoraInicio,
            row.DuracionMin,
            row.FechaHoraFin,
            row.Costo,
            row.VenceEn
        );
    }

    public Task PagarAsync(int idCita) =>
        _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_Cita_Pagar @idCita",
            new SqlParameter("@idCita", idCita));

    public Task CancelarPacienteAsync(int idCita) =>
        _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_Cita_Cancelar_Paciente @idCita",
            new SqlParameter("@idCita", idCita));

    
    // -------------------------
    // Doctor: SOLICITAR cancelación
    // -------------------------
    public Task SolicitarCancelacionDoctorAsync(int idCita, int idDoctor) =>
        _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_Cita_Cancelar_Doctor @idCita = @idCita, @idDoctor = @idDoctor",
            new SqlParameter("@idCita", idCita),
            new SqlParameter("@idDoctor", idDoctor)
        );

    // -------------------------
    // Recepción: CONFIRMAR
    // -------------------------
    public Task ConfirmarCancelacionDoctorAsync(int idCita) =>
        _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_Cita_Confirmar_Cancelacion_Doctor @idCita",
            new SqlParameter("@idCita", idCita)
        );

    // -------------------------
    // Recepción: RECHAZAR
    // -------------------------
    public Task RechazarCancelacionDoctorAsync(int idCita) =>
        _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_Cita_Rechazar_Cancelacion_Doctor @idCita",
            new SqlParameter("@idCita", idCita)
        );

    public async Task<List<CancelacionPendienteDto>> GetPendientesCancelacionDoctorAsync()
    {
        return await _db.Cita
            .AsNoTracking()
            .Where(c => c.EstatusCita == "CancelacionSolicitadaDoctor")
            .OrderBy(c => c.FechaHoraInicio)
            .Select(c => new CancelacionPendienteDto(
                c.IdCita,
                c.FechaHoraInicio,
                c.FechaHoraFin,
                c.Costo,
                c.IdPaciente,
                (
                    c.IdPacienteNavigation.IdUsuarioNavigation.Nombre + " " +
                    c.IdPacienteNavigation.IdUsuarioNavigation.ApPat + " " +
                    c.IdPacienteNavigation.IdUsuarioNavigation.ApMat
                ).Trim(),
                c.IdDoctor,
                (
                    c.IdDoctorNavigation.IdUsuarioNavigation.IdUsuarioNavigation.Nombre + " " +
                    c.IdDoctorNavigation.IdUsuarioNavigation.IdUsuarioNavigation.ApPat + " " +
                    c.IdDoctorNavigation.IdUsuarioNavigation.IdUsuarioNavigation.ApMat
                ).Trim()
            ))
            .ToListAsync();
    }

    public async Task<List<CitaRecepRowDto>> BuscarCitasRecepcionAsync(
        string? texto,
        DateTime? desdeUtc,
        DateTime? hastaUtc,
        string? estatus
    )
    {
        texto = string.IsNullOrWhiteSpace(texto) ? null : texto.Trim().ToLower();
        estatus = string.IsNullOrWhiteSpace(estatus) ? null : estatus.Trim();

        var q = _db.Cita
            .AsNoTracking()
            .Include(c => c.IdPacienteNavigation)
                .ThenInclude(p => p.IdUsuarioNavigation)
            .Include(c => c.IdDoctorNavigation)
                .ThenInclude(d => d.IdUsuarioNavigation)
            .AsQueryable();

        // Rango fechas
        if (desdeUtc.HasValue) q = q.Where(c => c.FechaHoraInicio >= desdeUtc.Value);
        if (hastaUtc.HasValue) q = q.Where(c => c.FechaHoraInicio <= hastaUtc.Value);

        // Estatus exacto (si te sirve), o puedes hacerlo por "contains"
        if (estatus is not null) q = q.Where(c => c.EstatusCita == estatus);

        // Texto: paciente o doctor (nombre/apellidos) y también ID
        if (texto is not null)
        {
            // si es número, permite buscar por idCita directo
            if (int.TryParse(texto, out var idCita))
            {
                q = q.Where(c => c.IdCita == idCita);
            }
            else
            {
                q = q.Where(c =>
                    (c.IdPacienteNavigation.IdUsuarioNavigation.Nombre + " " +
                    c.IdPacienteNavigation.IdUsuarioNavigation.ApPat + " " +
                    c.IdPacienteNavigation.IdUsuarioNavigation.ApMat).ToLower().Contains(texto)
                    ||
                    (c.IdDoctorNavigation.IdUsuarioNavigation.IdUsuarioNavigation.Nombre + " " +
                    c.IdDoctorNavigation.IdUsuarioNavigation.IdUsuarioNavigation.ApPat + " " +
                    c.IdDoctorNavigation.IdUsuarioNavigation.IdUsuarioNavigation.ApMat).ToLower().Contains(texto)
                );
            }
        }

        // Por seguridad: ordena por fecha más cercana
        var rows = await q
            .OrderBy(c => c.FechaHoraInicio)
            .Take(200) // evita que alguien “busque vacío” y truene todo
            .Select(c => new CitaRecepRowDto(
                c.IdCita,
                c.EstatusCita,
                c.FechaHoraInicio,
                c.FechaHoraFin,
                (decimal)c.Costo,
                c.IdPaciente,
                c.IdPacienteNavigation.IdUsuarioNavigation.Nombre + " " +
                c.IdPacienteNavigation.IdUsuarioNavigation.ApPat + " " +
                c.IdPacienteNavigation.IdUsuarioNavigation.ApMat,
                c.IdDoctor,
                c.IdDoctorNavigation.IdUsuarioNavigation.IdUsuarioNavigation.Nombre + " " +
                c.IdDoctorNavigation.IdUsuarioNavigation.IdUsuarioNavigation.ApPat + " " +
                c.IdDoctorNavigation.IdUsuarioNavigation.IdUsuarioNavigation.ApMat
            ))
            .ToListAsync();

        return rows;
    }



        
}
