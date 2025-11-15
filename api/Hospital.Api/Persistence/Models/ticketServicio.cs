using System;
using System.Collections.Generic;

namespace Hospital.Api.Persistence.Models;

public partial class TicketServicio
{
    public int IdTicket { get; set; }

    public int IdServicio { get; set; }

    public int Cantidad { get; set; }

    public decimal PrecioUnitario { get; set; }

    public virtual Servicio IdServicioNavigation { get; set; } = null!;

    public virtual Ticket IdTicketNavigation { get; set; } = null!;
}
