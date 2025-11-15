using System;
using System.Collections.Generic;

namespace Hospital.Api.Persistence.Models;

public partial class Farmacium
{
    public int IdFarmacia { get; set; }

    public decimal Superficie { get; set; }

    public int? IdEdificio { get; set; }

    public virtual Edificio? IdEdificioNavigation { get; set; }

    public virtual ICollection<Medicamento> Medicamentos { get; set; } = new List<Medicamento>();

    public virtual ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
}
