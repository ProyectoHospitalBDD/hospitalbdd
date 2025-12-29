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

    public Task CancelarDoctorAsync(int idCita) =>
        _db.Database.ExecuteSqlRawAsync(
            "EXEC dbo.sp_Cita_Cancelar_Doctor @idCita",
            new SqlParameter("@idCita", idCita));
}
