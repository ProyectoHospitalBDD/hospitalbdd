using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Api.Persistence.Models;

[Table("medicamento")]
public partial class medicamento
{
    [Key]
    public int idMedicamento { get; set; }

    [StringLength(256)]
    public string descripcion { get; set; } = null!;

    [StringLength(50)]
    public string tipo { get; set; } = null!;

    [StringLength(50)]
    public string capacidad { get; set; } = null!;

    [Column(TypeName = "money")]
    public decimal precio { get; set; }

    public int stock { get; set; }

    public DateOnly caducidad { get; set; }

    public int? idFarmacia { get; set; }

    [ForeignKey("idFarmacia")]
    [InverseProperty("medicamentos")]
    public virtual farmacium? idFarmaciaNavigation { get; set; }

    [InverseProperty("idMedicamentoNavigation")]
    public virtual ICollection<recetaMedicamento> recetaMedicamentos { get; set; } = new List<recetaMedicamento>();

    [InverseProperty("idMedicamentoNavigation")]
    public virtual ICollection<ticketMedicamento> ticketMedicamentos { get; set; } = new List<ticketMedicamento>();
}
