namespace Hospital.Api.Dtos.Bitacora;

public record BitacoraEstatusCitaRowDto(
    int IdBitacora,
    DateTime FechaMov,
    int IdCita,
    string EstatusCita,
    DateTime? FechaCitaInicio,
    DateTime? FechaCitaFin,
    int? IdPaciente,
    string? NombrePaciente,
    int? IdDoctor,
    string? NombreDoctor,
    decimal? Costo,
    string? Politica,
    decimal? MontoDevuelto
);