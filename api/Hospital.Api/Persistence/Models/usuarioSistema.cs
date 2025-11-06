using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Api.Persistence.Models;

[Table("usuarioSistema")]
[Index("curp", Name = "UQ_usuarioCURP", IsUnique = true)]
public partial class usuarioSistema
{
    [Key]
    public int idUsuario { get; set; }

    [StringLength(20)]
    public string nombre { get; set; } = null!;

    [StringLength(20)]
    public string apPat { get; set; } = null!;

    [StringLength(20)]
    public string? apMat { get; set; }

    [StringLength(100)]
    public string contrasena { get; set; } = null!;

    [StringLength(20)]
    public string tipoUsuario { get; set; } = null!;

    [StringLength(18)]
    [Unicode(false)]
    public string curp { get; set; } = null!;

    public int? idContacto { get; set; }

    [InverseProperty("idUsuarioNavigation")]
    public virtual empleado? empleado { get; set; }

    [ForeignKey("idContacto")]
    [InverseProperty("usuarioSistemas")]
    public virtual contacto? idContactoNavigation { get; set; }

    [InverseProperty("idUsuarioNavigation")]
    public virtual paciente? paciente { get; set; }
}
