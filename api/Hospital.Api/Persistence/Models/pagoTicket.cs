using System;
using System.Collections.Generic;

namespace Hospital.Api.Persistence.Models;

public partial class PagoTicket
{
    public int IdPagoTicket { get; set; }

    public string EstatusPago { get; set; } = null!;

    public DateOnly FechaPago { get; set; }

    public TimeOnly HoraPago { get; set; }

    public int IdTicket { get; set; }

    public int? IdFarmaceutico { get; set; }

    public virtual Farmaceutico? IdFarmaceuticoNavigation { get; set; }

    public virtual Ticket IdTicketNavigation { get; set; } = null!;
}
