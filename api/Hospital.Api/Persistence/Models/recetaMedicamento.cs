using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Api.Persistence.Models;

[PrimaryKey("idReceta", "idMedicamento")]
[Table("recetaMedicamento")]
public partial class recetaMedicamento
{
    [Key]
    public int idReceta { get; set; }

    [Key]
    public int idMedicamento { get; set; }

    [StringLength(300)]
    public string? indicaciones { get; set; }

    public int cantidad { get; set; }

    [ForeignKey("idMedicamento")]
    [InverseProperty("recetaMedicamentos")]
    public virtual medicamento idMedicamentoNavigation { get; set; } = null!;

    [ForeignKey("idReceta")]
    [InverseProperty("recetaMedicamentos")]
    public virtual recetum idRecetaNavigation { get; set; } = null!;
}
