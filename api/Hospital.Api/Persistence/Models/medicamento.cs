using System;
using System.Collections.Generic;

namespace Hospital.Api.Persistence.Models;

public partial class Medicamento
{
    public int IdMedicamento { get; set; }

    public string Descripcion { get; set; } = null!;

    public string Tipo { get; set; } = null!;

    public string Capacidad { get; set; } = null!;

    public decimal Precio { get; set; }

    public int Stock { get; set; }

    public DateOnly Caducidad { get; set; }

    public int? IdFarmacia { get; set; }

    public virtual Farmacium? IdFarmaciaNavigation { get; set; }

    public virtual ICollection<RecetaMedicamento> RecetaMedicamentos { get; set; } = new List<RecetaMedicamento>();

    public virtual ICollection<TicketMedicamento> TicketMedicamentos { get; set; } = new List<TicketMedicamento>();
}
