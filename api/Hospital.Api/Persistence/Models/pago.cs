using System;
using System.Collections.Generic;

namespace Hospital.Api.Persistence.Models;

public partial class Pago
{
    public int IdPago { get; set; }

    public int IdCita { get; set; }

    public string EstatusPago { get; set; } = null!;

    public decimal Monto { get; set; }

    public DateOnly? FechaPago { get; set; }

    public TimeOnly? HoraPago { get; set; }

    public DateTime VenceEn { get; set; }

    public decimal? MontoDevuelto { get; set; }

    public virtual Citum IdCitaNavigation { get; set; } = null!;
}
