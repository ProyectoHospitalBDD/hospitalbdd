using System;
using System.Collections.Generic;

namespace Hospital.Api.Persistence.Models;

public partial class Farmaceutico
{
    public int IdUsuario { get; set; }

    public virtual Empleado IdUsuarioNavigation { get; set; } = null!;

    public virtual ICollection<PagoTicket> PagoTickets { get; set; } = new List<PagoTicket>();

    public virtual ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
}
