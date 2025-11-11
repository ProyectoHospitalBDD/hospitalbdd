using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Api.Persistence.Models;
[Table("cita")]
public partial class Cita
{
    [Key] [Column("idCita")] public int IdCita { get; set; }
    [Column("estatusCita")] public string EstatusCita { get; set; } = null!;
    [Column("fechaHoraInicio")] public DateTime FechaHoraInicio { get; set; }
    [Column("fechaHoraFin")] public DateTime FechaHoraFin { get; set; }
    [Column("idDoctor")] public int IdDoctor { get; set; }
    [Column("idPaciente")] public int IdPaciente { get; set; }
    [Column("costo", TypeName="money")] public decimal Costo { get; set; }

    [ForeignKey(nameof(IdDoctor))] [InverseProperty(nameof(Doctor.Citas))]
    public Doctor Doctor { get; set; } = null!;

    [ForeignKey(nameof(IdPaciente))] [InverseProperty(nameof(Paciente.Citas))]
    public Paciente Paciente { get; set; } = null!;

    [InverseProperty(nameof(Pago.Cita))]   public ICollection<Pago> Pagos { get; set; } = new List<Pago>();
    [InverseProperty(nameof(Receta.Cita))] public ICollection<Receta> Recetas { get; set; } = new List<Receta>();
}
