using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Api.Persistence.Models;

[Table("servicio")]
public partial class servicio
{
    [Key]
    public int idServicio { get; set; }

    [StringLength(256)]
    public string descripcion { get; set; } = null!;

    [StringLength(50)]
    public string tipo { get; set; } = null!;

    [Column(TypeName = "money")]
    public decimal precio { get; set; }

    public int? stock { get; set; }

    public int? idEnfermera { get; set; }

    [ForeignKey("idEnfermera")]
    [InverseProperty("servicios")]
    public virtual enfermera? idEnfermeraNavigation { get; set; }

    [InverseProperty("idServicioNavigation")]
    public virtual ICollection<recetaServicio> recetaServicios { get; set; } = new List<recetaServicio>();

    [InverseProperty("idServicioNavigation")]
    public virtual ICollection<ticketServicio> ticketServicios { get; set; } = new List<ticketServicio>();
}
