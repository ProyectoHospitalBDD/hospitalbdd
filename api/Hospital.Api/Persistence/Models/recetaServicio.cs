using System;
using System.Collections.Generic;

namespace Hospital.Api.Persistence.Models;

public partial class RecetaServicio
{
    public int IdReceta { get; set; }

    public int IdServicio { get; set; }

    public string? Indicaciones { get; set; }

    public virtual Recetum IdRecetaNavigation { get; set; } = null!;

    public virtual Servicio IdServicioNavigation { get; set; } = null!;
}
