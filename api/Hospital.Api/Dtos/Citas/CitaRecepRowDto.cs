namespace Hospital.Api.Dtos.Citas;

public record CitaRecepRowDto(
    int IdCita,
    string EstatusCita,
    DateTime FechaHoraInicio,
    DateTime FechaHoraFin,
    decimal Costo,
    int IdPaciente,
    string PacienteNombre,
    int IdDoctor,
    string DoctorNombre
);