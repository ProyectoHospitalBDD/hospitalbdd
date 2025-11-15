using System;
using System.Collections.Generic;

namespace Hospital.Api.Persistence.Models;

public partial class Ticket
{
    public int IdTicket { get; set; }

    public DateTime Fecha { get; set; }

    public int? IdFarmacia { get; set; }

    public int IdFarmaceutico { get; set; }

    public virtual Farmaceutico IdFarmaceuticoNavigation { get; set; } = null!;

    public virtual Farmacium? IdFarmaciaNavigation { get; set; }

    public virtual ICollection<PagoTicket> PagoTickets { get; set; } = new List<PagoTicket>();

    public virtual ICollection<TicketMedicamento> TicketMedicamentos { get; set; } = new List<TicketMedicamento>();

    public virtual ICollection<TicketServicio> TicketServicios { get; set; } = new List<TicketServicio>();
}
