using System;
using System.Collections.Generic;

namespace Hospital.Api.Persistence.Models;

public partial class Paciente
{
    public int IdUsuario { get; set; }

    public virtual ICollection<Citum> Cita { get; set; } = new List<Citum>();

    public virtual HistorialMedico? HistorialMedico { get; set; }

    public virtual UsuarioSistema IdUsuarioNavigation { get; set; } = null!;

    public virtual ICollection<PacienteAlergiaPadecimiento> PacienteAlergiaPadecimientos { get; set; } = new List<PacienteAlergiaPadecimiento>();
}
