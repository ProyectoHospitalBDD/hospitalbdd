using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Api.Persistence.Models;

public partial class citum
{
    [Key]
    public int idCita { get; set; }

    [StringLength(25)]
    public string estatusCita { get; set; } = null!;

    public DateTime fechaHoraInicio { get; set; }

    public DateTime fechaHoraFin { get; set; }

    public int idDoctor { get; set; }

    public int idPaciente { get; set; }

    [Column(TypeName = "money")]
    public decimal costo { get; set; }

    [ForeignKey("idDoctor")]
    [InverseProperty("cita")]
    public virtual doctor idDoctorNavigation { get; set; } = null!;

    [ForeignKey("idPaciente")]
    [InverseProperty("cita")]
    public virtual paciente idPacienteNavigation { get; set; } = null!;

    [InverseProperty("idCitaNavigation")]
    public virtual ICollection<pago> pagos { get; set; } = new List<pago>();

    [InverseProperty("idCitaNavigation")]
    public virtual ICollection<recetum> receta { get; set; } = new List<recetum>();
}
