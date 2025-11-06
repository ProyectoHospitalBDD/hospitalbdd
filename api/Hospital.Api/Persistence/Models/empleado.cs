using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Api.Persistence.Models;

[Table("empleado")]
public partial class empleado
{
    [Key]
    public int idUsuario { get; set; }

    public bool estatus { get; set; }

    [Column(TypeName = "money")]
    public decimal salario { get; set; }

    [InverseProperty("idUsuarioNavigation")]
    public virtual doctor? doctor { get; set; }

    [InverseProperty("idUsuarioNavigation")]
    public virtual enfermera? enfermera { get; set; }

    [InverseProperty("idUsuarioNavigation")]
    public virtual farmaceutico? farmaceutico { get; set; }

    [InverseProperty("idUsuarioNavigation")]
    public virtual ICollection<horarioEmpleado> horarioEmpleados { get; set; } = new List<horarioEmpleado>();

    [ForeignKey("idUsuario")]
    [InverseProperty("empleado")]
    public virtual usuarioSistema idUsuarioNavigation { get; set; } = null!;

    [InverseProperty("idUsuarioNavigation")]
    public virtual recepcionistum? recepcionistum { get; set; }
}
