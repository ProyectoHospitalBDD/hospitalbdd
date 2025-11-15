using System;
using System.Collections.Generic;

namespace Hospital.Api.Persistence.Models;

public partial class Edificio
{
    public int IdEdificio { get; set; }

    public int NumPisos { get; set; }

    public decimal Superficie { get; set; }

    public virtual ICollection<Consultorio> Consultorios { get; set; } = new List<Consultorio>();

    public virtual ICollection<Farmacium> Farmacia { get; set; } = new List<Farmacium>();
}
