using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Api.Persistence.Models;

[Table("horarioEmpleado")]
[Index(nameof(IdUsuario), nameof(DiaSemana), Name = "UQ_horarioEmpleado", IsUnique = true)]
public partial class HorarioEmpleado
{
    [Key]
    [Column("idHorarioE")]
    public int IdHorarioE { get; set; }

    [Required]
    [StringLength(10)]
    [Column("diaSemana")]
    public string DiaSemana { get; set; } = null!; // ej. "lunes"

    [Column("horaInicio")]
    public TimeOnly HoraInicio { get; set; }

    [Column("horaFin")]
    public TimeOnly HoraFin { get; set; }

    [Column("idUsuario")]
    public int IdUsuario { get; set; }

    [ForeignKey(nameof(IdUsuario))]
    [InverseProperty(nameof(Empleado.HorarioEmpleados))]
    public virtual Empleado Usuario { get; set; } = null!;
}