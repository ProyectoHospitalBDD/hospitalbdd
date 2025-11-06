using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Api.Persistence.Models;

public partial class farmacium
{
    [Key]
    public int idFarmacia { get; set; }

    [Column(TypeName = "decimal(10, 2)")]
    public decimal superficie { get; set; }

    public int? idEdificio { get; set; }

    [ForeignKey("idEdificio")]
    [InverseProperty("farmacia")]
    public virtual edificio? idEdificioNavigation { get; set; }

    [InverseProperty("idFarmaciaNavigation")]
    public virtual ICollection<medicamento> medicamentos { get; set; } = new List<medicamento>();

    [InverseProperty("idFarmaciaNavigation")]
    public virtual ICollection<ticket> tickets { get; set; } = new List<ticket>();
}
