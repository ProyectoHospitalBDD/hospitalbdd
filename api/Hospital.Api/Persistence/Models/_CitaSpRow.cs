using System;

namespace Hospital.Api.Persistence.Models;

// Clase que representa la fila que regresa sp_Cita_Crear
public class _CitaSpRow
{
    public int IdCita { get; set; }
    public int IdPaciente { get; set; }
    public int IdDoctor { get; set; }
    public string EstatusCita { get; set; } = null!;
    public DateTime FechaHoraInicio { get; set; }
    public int DuracionMin { get; set; }
    public DateTime FechaHoraFin { get; set; }
    public decimal Costo { get; set; }
    public DateTime VenceEn { get; set; }
}
