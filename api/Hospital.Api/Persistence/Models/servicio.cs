using System;
using System.Collections.Generic;

namespace Hospital.Api.Persistence.Models;

public partial class Servicio
{
    public int IdServicio { get; set; }

    public string Descripcion { get; set; } = null!;

    public string Tipo { get; set; } = null!;

    public decimal Precio { get; set; }

    public int? Stock { get; set; }

    public int? IdEnfermera { get; set; }

    public virtual Enfermera? IdEnfermeraNavigation { get; set; }

    public virtual ICollection<RecetaServicio> RecetaServicios { get; set; } = new List<RecetaServicio>();

    public virtual ICollection<TicketServicio> TicketServicios { get; set; } = new List<TicketServicio>();
}
