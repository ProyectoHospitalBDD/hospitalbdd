using System;
using System.Collections.Generic;

namespace Hospital.Api.Persistence.Models;

public partial class Contacto
{
    public int IdContacto { get; set; }

    public string? TelCasa { get; set; }

    public string TelPersonal { get; set; } = null!;

    public string CorreoPersonal { get; set; } = null!;

    public virtual ICollection<UsuarioSistema> UsuarioSistemas { get; set; } = new List<UsuarioSistema>();
}
