using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Api.Persistence.Models;

[Table("horarioEmpleado")]
[Index("idUsuario", "diaSemana", Name = "UQ_horarioEmpleado", IsUnique = true)]
public partial class horarioEmpleado
{
    [Key]
    public int idHorarioE { get; set; }

    [StringLength(10)]
    public string diaSemana { get; set; } = null!;

    public TimeOnly horaInicio { get; set; }

    public TimeOnly horaFin { get; set; }

    public int idUsuario { get; set; }

    [ForeignKey("idUsuario")]
    [InverseProperty("horarioEmpleados")]
    public virtual empleado idUsuarioNavigation { get; set; } = null!;
}
