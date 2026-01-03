using Microsoft.EntityFrameworkCore;

namespace Hospital.Api.Persistence.Models;

[Keyless]
public class VwBitacoraHistorialCitaMp
{
    public int IdBitacora { get; set; }
    public DateTime FechaMovimiento { get; set; }
    public string UsuarioMov { get; set; } = null!;
    public string Especialidad { get; set; } = null!;
    public string NombrePaciente { get; set; } = null!;
    public string NombreDoctor { get; set; } = null!;   
    public string? Diagnostico { get; set; }
    public string Consultorio { get; set; } = null!;

    public int IdPaciente { get; set; }
    public int IdDoctor { get; set; }
    public int IdCita { get; set; }
    public int? IdReceta { get; set; }
    public string EstatusConsulta { get; set; } = null!;
    public DateTime FechaCita { get; set; }
    public TimeSpan HoraCita { get; set; }
}
