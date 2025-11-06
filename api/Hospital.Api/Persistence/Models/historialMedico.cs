using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Api.Persistence.Models;

[Table("historialMedico")]
[Index("idPaciente", Name = "UQ_historialIdPaciente", IsUnique = true)]
public partial class historialMedico
{
    [Key]
    public int idHistorialMedico { get; set; }

    public int idPaciente { get; set; }

    [StringLength(3)]
    public string tipoSangre { get; set; } = null!;

    [Column(TypeName = "decimal(6, 2)")]
    public decimal? pesoKg { get; set; }

    [Column(TypeName = "decimal(4, 2)")]
    public decimal? estaturaM { get; set; }

    [ForeignKey("idPaciente")]
    [InverseProperty("historialMedico")]
    public virtual paciente idPacienteNavigation { get; set; } = null!;
}
