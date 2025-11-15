namespace Hospital.Api.Dtos.Citas;
public record CreateCitaDto(int PacienteId, int DoctorId, DateTime FechaInicioUtc, int DuracionMin);
