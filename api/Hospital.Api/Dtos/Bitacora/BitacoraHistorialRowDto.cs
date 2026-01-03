namespace Hospital.Api.Dtos.Bitacora;

public record BitacoraHistorialRowDto(
    int IdBitacora,
    DateTime FechaMovimiento,
    string Usuario,
    string Especialidad,
    string NombrePaciente,
    string? Diagnostico,
    string Consultorio,
    string EstatusConsulta,
    int FolioCita,
    DateTime FechaCita,
    TimeSpan HoraCita,
    int? FolioReceta,
    int IdPaciente,
    int IdDoctor
);
