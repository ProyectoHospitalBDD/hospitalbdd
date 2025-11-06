using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Api.Persistence.Models;

[Table("edificio")]
public partial class edificio
{
    [Key]
    public int idEdificio { get; set; }

    public int numPisos { get; set; }

    [Column(TypeName = "decimal(10, 2)")]
    public decimal superficie { get; set; }

    [InverseProperty("idEdificioNavigation")]
    public virtual ICollection<consultorio> consultorios { get; set; } = new List<consultorio>();

    [InverseProperty("idEdificioNavigation")]
    public virtual ICollection<farmacium> farmacia { get; set; } = new List<farmacium>();
}
