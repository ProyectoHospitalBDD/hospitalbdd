using System;
using System.Collections.Generic;

namespace Hospital.Api.Persistence.Models;

public partial class Especialidad
{
    public int IdEspecialidad { get; set; }

    public string NombreEsp { get; set; } = null!;

    public int AnosEstu { get; set; }

    public decimal Costo { get; set; }

    public virtual ICollection<Doctor> Doctors { get; set; } = new List<Doctor>();
}
