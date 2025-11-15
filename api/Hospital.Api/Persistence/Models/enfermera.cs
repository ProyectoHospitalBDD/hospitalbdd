using System;
using System.Collections.Generic;

namespace Hospital.Api.Persistence.Models;

public partial class Enfermera
{
    public int IdUsuario { get; set; }

    public virtual Empleado IdUsuarioNavigation { get; set; } = null!;

    public virtual ICollection<Servicio> Servicios { get; set; } = new List<Servicio>();
}
