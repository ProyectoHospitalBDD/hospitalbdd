using System;
using System.Collections.Generic;

namespace Hospital.Api.Persistence.Models;

public partial class Doctor
{
    public int IdUsuario { get; set; }

    public string Cedula { get; set; } = null!;

    public int IdConsultorio { get; set; }

    public int IdEspecialidad { get; set; }

    public virtual ICollection<Citum> Cita { get; set; } = new List<Citum>();

    public virtual Consultorio IdConsultorioNavigation { get; set; } = null!;

    public virtual Especialidad IdEspecialidadNavigation { get; set; } = null!;

    public virtual Empleado IdUsuarioNavigation { get; set; } = null!;
}
