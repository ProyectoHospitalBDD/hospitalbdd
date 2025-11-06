using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Api.Persistence.Models;

[Table("contacto")]
[Index("correoPersonal", Name = "UQ_contactoCorreo", IsUnique = true)]
public partial class contacto
{
    [Key]
    public int idContacto { get; set; }

    [StringLength(20)]
    public string? telCasa { get; set; }

    [StringLength(20)]
    public string telPersonal { get; set; } = null!;

    [StringLength(256)]
    public string correoPersonal { get; set; } = null!;

    [InverseProperty("idContactoNavigation")]
    public virtual ICollection<usuarioSistema> usuarioSistemas { get; set; } = new List<usuarioSistema>();
}
