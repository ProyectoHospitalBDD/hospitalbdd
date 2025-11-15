using System;
using System.Collections.Generic;

namespace Hospital.Api.Persistence.Models;

public partial class HistorialMedico
{
    public int IdHistorialMedico { get; set; }

    public int IdPaciente { get; set; }

    public string TipoSangre { get; set; } = null!;

    public decimal? PesoKg { get; set; }

    public decimal? EstaturaM { get; set; }

    public virtual Paciente IdPacienteNavigation { get; set; } = null!;
}
