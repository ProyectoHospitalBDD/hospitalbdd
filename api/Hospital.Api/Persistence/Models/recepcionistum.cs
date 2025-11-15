using System;
using System.Collections.Generic;

namespace Hospital.Api.Persistence.Models;

public partial class Recepcionistum
{
    public int IdUsuario { get; set; }

    public bool EsAdmin { get; set; }

    public virtual Empleado IdUsuarioNavigation { get; set; } = null!;
}
