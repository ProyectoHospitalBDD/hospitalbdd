using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Api.Persistence.Models;

[Table("consultorio")]
[Index("idEdificio", "numero", Name = "UQ_consultorio", IsUnique = true)]
public partial class consultorio
{
    [Key]
    public int idConsultorio { get; set; }

    [StringLength(10)]
    public string numero { get; set; } = null!;

    [Column(TypeName = "decimal(10, 2)")]
    public decimal superficie { get; set; }

    public int idEdificio { get; set; }

    [InverseProperty("idConsultorioNavigation")]
    public virtual ICollection<doctor> doctors { get; set; } = new List<doctor>();

    [ForeignKey("idEdificio")]
    [InverseProperty("consultorios")]
    public virtual edificio idEdificioNavigation { get; set; } = null!;
}
