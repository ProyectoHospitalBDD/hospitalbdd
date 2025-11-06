using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Api.Persistence.Models;

public partial class recetum
{
    [Key]
    public int idReceta { get; set; }

    public int idCita { get; set; }

    public DateOnly fechaReceta { get; set; }

    [StringLength(500)]
    public string? diagnostico { get; set; }

    [StringLength(500)]
    public string? observaciones { get; set; }

    [ForeignKey("idCita")]
    [InverseProperty("receta")]
    public virtual citum idCitaNavigation { get; set; } = null!;

    [InverseProperty("idRecetaNavigation")]
    public virtual ICollection<recetaMedicamento> recetaMedicamentos { get; set; } = new List<recetaMedicamento>();

    [InverseProperty("idRecetaNavigation")]
    public virtual ICollection<recetaServicio> recetaServicios { get; set; } = new List<recetaServicio>();
}
