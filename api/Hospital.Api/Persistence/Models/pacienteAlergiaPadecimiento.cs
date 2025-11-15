using System;
using System.Collections.Generic;

namespace Hospital.Api.Persistence.Models;

public partial class PacienteAlergiaPadecimiento
{
    public int IdPaciente { get; set; }

    public int IdAlerPade { get; set; }

    public string? Severidad { get; set; }

    public string? Estado { get; set; }

    public string? Reaccion { get; set; }

    public DateOnly? FechaInicio { get; set; }

    public DateOnly? FechaFin { get; set; }

    public string? Observaciones { get; set; }

    public virtual AlergiaPadecimiento IdAlerPadeNavigation { get; set; } = null!;

    public virtual Paciente IdPacienteNavigation { get; set; } = null!;
}
