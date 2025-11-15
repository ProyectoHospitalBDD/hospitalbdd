using System;
using System.Collections.Generic;

namespace Hospital.Api.Persistence.Models;

public partial class Consultorio
{
    public int IdConsultorio { get; set; }

    public string Numero { get; set; } = null!;

    public decimal Superficie { get; set; }

    public int IdEdificio { get; set; }

    public virtual ICollection<Doctor> Doctors { get; set; } = new List<Doctor>();

    public virtual Edificio IdEdificioNavigation { get; set; } = null!;
}
