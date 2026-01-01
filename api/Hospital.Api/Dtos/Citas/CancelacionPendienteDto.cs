namespace Hospital.Api.Dtos.Citas;

public record CancelacionPendienteDto(
    int IdCita,
    DateTime FechaHoraInicio,
    DateTime FechaHoraFin,
    decimal Costo,
    int IdPaciente,
    string PacienteNombre,
    int IdDoctor,
    string DoctorNombre
);
