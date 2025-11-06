using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Api.Persistence.Models;

[PrimaryKey("idPaciente", "idAlerPade")]
[Table("pacienteAlergiaPadecimiento")]
public partial class pacienteAlergiaPadecimiento
{
    [Key]
    public int idPaciente { get; set; }

    [Key]
    public int idAlerPade { get; set; }

    [StringLength(20)]
    public string? severidad { get; set; }

    [StringLength(15)]
    public string? estado { get; set; }

    [StringLength(300)]
    public string? reaccion { get; set; }

    public DateOnly? fechaInicio { get; set; }

    public DateOnly? fechaFin { get; set; }

    [StringLength(500)]
    public string? observaciones { get; set; }

    [ForeignKey("idAlerPade")]
    [InverseProperty("pacienteAlergiaPadecimientos")]
    public virtual alergiaPadecimiento idAlerPadeNavigation { get; set; } = null!;

    [ForeignKey("idPaciente")]
    [InverseProperty("pacienteAlergiaPadecimientos")]
    public virtual paciente idPacienteNavigation { get; set; } = null!;
}
