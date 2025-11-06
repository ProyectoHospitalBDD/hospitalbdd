using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Api.Persistence.Models;

[Table("especialidad")]
[Index("nombreEsp", Name = "UQ_espNombre", IsUnique = true)]
public partial class especialidad
{
    [Key]
    public int idEspecialidad { get; set; }

    [StringLength(100)]
    public string nombreEsp { get; set; } = null!;

    public int anosEstu { get; set; }

    [Column(TypeName = "money")]
    public decimal costo { get; set; }

    [InverseProperty("idEspecialidadNavigation")]
    public virtual ICollection<doctor> doctors { get; set; } = new List<doctor>();
}
