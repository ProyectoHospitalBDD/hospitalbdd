using System;
using System.Collections.Generic;

namespace Hospital.Api.Persistence.Models;

public partial class UsuarioSistema
{
    public int IdUsuario { get; set; }

    public string Nombre { get; set; } = null!;

    public string ApPat { get; set; } = null!;

    public string? ApMat { get; set; }

    public string TipoUsuario { get; set; } = null!;

    public string Curp { get; set; } = null!;

    public int? IdContacto { get; set; }

    public virtual Empleado? Empleado { get; set; }

    public virtual Contacto? IdContactoNavigation { get; set; }

    public virtual Paciente? Paciente { get; set; }

    public byte[]? PasswordHash { get; set; }
    public byte[]? PasswordSalt { get; set; }
    public int? PasswordIteraciones { get; set; }
}
