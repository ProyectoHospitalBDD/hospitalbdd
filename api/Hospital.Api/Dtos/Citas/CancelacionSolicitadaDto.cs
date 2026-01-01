namespace Hospital.Api.Dtos.Citas;

public record CancelacionSolicitadaDto(
    int IdCita,
    int IdPaciente,
    string PacienteNombre,
    int IdDoctor,
    string DoctorNombre,
    DateTime FechaHoraInicio,
    DateTime FechaHoraFin,
    decimal Costo,
    string EstatusCita
);