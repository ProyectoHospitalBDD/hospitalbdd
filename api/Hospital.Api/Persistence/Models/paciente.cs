using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Api.Persistence.Models;

[Table("paciente")]
public partial class paciente
{
    [Key]
    public int idUsuario { get; set; }

    [InverseProperty("idPacienteNavigation")]
    public virtual ICollection<citum> cita { get; set; } = new List<citum>();

    [InverseProperty("idPacienteNavigation")]
    public virtual historialMedico? historialMedico { get; set; }

    [ForeignKey("idUsuario")]
    [InverseProperty("paciente")]
    public virtual usuarioSistema idUsuarioNavigation { get; set; } = null!;

    [InverseProperty("idPacienteNavigation")]
    public virtual ICollection<pacienteAlergiaPadecimiento> pacienteAlergiaPadecimientos { get; set; } = new List<pacienteAlergiaPadecimiento>();
}
