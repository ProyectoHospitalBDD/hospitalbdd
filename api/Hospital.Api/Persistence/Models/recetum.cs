using System;
using System.Collections.Generic;

namespace Hospital.Api.Persistence.Models;

public partial class Recetum
{
    public int IdReceta { get; set; }

    public int IdCita { get; set; }

    public DateOnly FechaReceta { get; set; }

    public string? Diagnostico { get; set; }

    public string? Observaciones { get; set; }

    public virtual Citum IdCitaNavigation { get; set; } = null!;

    public virtual ICollection<RecetaMedicamento> RecetaMedicamentos { get; set; } = new List<RecetaMedicamento>();

    public virtual ICollection<RecetaServicio> RecetaServicios { get; set; } = new List<RecetaServicio>();
}
