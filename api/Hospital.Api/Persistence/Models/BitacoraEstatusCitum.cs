using System;
using System.Collections.Generic;

namespace Hospital.Api.Persistence.Models;

public partial class BitacoraEstatusCitum
{
    public int IdBitacora { get; set; }

    public int IdCita { get; set; }

    public string EstatusCita { get; set; } = null!;

    public DateTime FechaMov { get; set; }

    public DateTime? FechaCitaInicio { get; set; }

    public DateTime? FechaCitaFin { get; set; }

    public int? IdPaciente { get; set; }

    public int? IdDoctor { get; set; }

    public decimal? Costo { get; set; }

    public string? Politica { get; set; }

    public decimal? MontoDevuelto { get; set; }
}
