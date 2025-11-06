using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Api.Persistence.Models;

[Table("alergiaPadecimiento")]
[Index("nombreNormalizado", "tipo", Name = "UQ_alergiaPadecimientoNombre", IsUnique = true)]
public partial class alergiaPadecimiento
{
    [Key]
    public int idAlerPade { get; set; }

    [StringLength(200)]
    public string nombre { get; set; } = null!;

    [StringLength(15)]
    public string tipo { get; set; } = null!;

    [StringLength(200)]
    public string? nombreNormalizado { get; set; }

    [InverseProperty("idAlerPadeNavigation")]
    public virtual ICollection<pacienteAlergiaPadecimiento> pacienteAlergiaPadecimientos { get; set; } = new List<pacienteAlergiaPadecimiento>();
}
