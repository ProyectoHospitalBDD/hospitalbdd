namespace Hospital.Api.Dtos.Citas;
public record CitaResponseDto(
    int IdCita, int IdPaciente, int IdDoctor, string EstatusCita,
    DateTime FechaHoraInicio, int DuracionMin, DateTime FechaHoraFin, decimal Costo,
    DateTime? VenceEn
);
