using System;
using System.Collections.Generic;

namespace Hospital.Api.Persistence.Models;

public partial class TicketMedicamento
{
    public int IdTicket { get; set; }

    public int IdMedicamento { get; set; }

    public int Cantidad { get; set; }

    public decimal PrecioUnitario { get; set; }

    public decimal? Importe { get; set; } 

    public virtual Medicamento IdMedicamentoNavigation { get; set; } = null!;

    public virtual Ticket IdTicketNavigation { get; set; } = null!;
}