using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Api.Persistence.Models;

[PrimaryKey("idReceta", "idServicio")]
[Table("recetaServicio")]
public partial class recetaServicio
{
    [Key]
    public int idReceta { get; set; }

    [Key]
    public int idServicio { get; set; }

    [StringLength(300)]
    public string? indicaciones { get; set; }

    [ForeignKey("idReceta")]
    [InverseProperty("recetaServicios")]
    public virtual recetum idRecetaNavigation { get; set; } = null!;

    [ForeignKey("idServicio")]
    [InverseProperty("recetaServicios")]
    public virtual servicio idServicioNavigation { get; set; } = null!;
}
