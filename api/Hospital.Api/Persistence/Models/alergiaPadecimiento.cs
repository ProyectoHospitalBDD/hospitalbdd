using System;
using System.Collections.Generic;

namespace Hospital.Api.Persistence.Models;

public partial class AlergiaPadecimiento
{
    public int IdAlerPade { get; set; }

    public string Nombre { get; set; } = null!;

    public string Tipo { get; set; } = null!;

    public string? NombreNormalizado { get; set; }

    public virtual ICollection<PacienteAlergiaPadecimiento> PacienteAlergiaPadecimientos { get; set; } = new List<PacienteAlergiaPadecimiento>();
}
