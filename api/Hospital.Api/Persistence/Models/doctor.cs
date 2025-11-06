using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Api.Persistence.Models;

[Table("doctor")]
[Index("cedula", Name = "UQ_doctorCedula", IsUnique = true)]
public partial class doctor
{
    [Key]
    public int idUsuario { get; set; }

    [StringLength(20)]
    public string cedula { get; set; } = null!;

    public int idConsultorio { get; set; }

    public int idEspecialidad { get; set; }

    [InverseProperty("idDoctorNavigation")]
    public virtual ICollection<citum> cita { get; set; } = new List<citum>();

    [ForeignKey("idConsultorio")]
    [InverseProperty("doctors")]
    public virtual consultorio idConsultorioNavigation { get; set; } = null!;

    [ForeignKey("idEspecialidad")]
    [InverseProperty("doctors")]
    public virtual especialidad idEspecialidadNavigation { get; set; } = null!;

    [ForeignKey("idUsuario")]
    [InverseProperty("doctor")]
    public virtual empleado idUsuarioNavigation { get; set; } = null!;
}
