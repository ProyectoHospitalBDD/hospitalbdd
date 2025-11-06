using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Api.Persistence.Models;

[Table("enfermera")]
public partial class enfermera
{
    [Key]
    public int idUsuario { get; set; }

    [ForeignKey("idUsuario")]
    [InverseProperty("enfermera")]
    public virtual empleado idUsuarioNavigation { get; set; } = null!;

    [InverseProperty("idEnfermeraNavigation")]
    public virtual ICollection<servicio> servicios { get; set; } = new List<servicio>();
}
