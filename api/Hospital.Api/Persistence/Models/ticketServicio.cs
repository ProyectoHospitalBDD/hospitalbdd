using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Hospital.Api.Persistence.Models;

public partial class TicketServicio
{
    public int IdTicket { get; set; }

    public int IdServicio { get; set; }

    public int Cantidad { get; set; }

    public decimal PrecioUnitario { get; set; }

    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    public decimal Importe { get; private set; }

    public virtual Servicio IdServicioNavigation { get; set; } = null!;

    public virtual Ticket IdTicketNavigation { get; set; } = null!;
}
