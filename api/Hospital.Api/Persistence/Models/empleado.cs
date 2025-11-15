using System;
using System.Collections.Generic;

namespace Hospital.Api.Persistence.Models;

public partial class Empleado
{
    public int IdUsuario { get; set; }

    public bool Estatus { get; set; }

    public decimal Salario { get; set; }

    public virtual Doctor? Doctor { get; set; }

    public virtual Enfermera? Enfermera { get; set; }

    public virtual Farmaceutico? Farmaceutico { get; set; }

    public virtual ICollection<HorarioEmpleado> HorarioEmpleados { get; set; } = new List<HorarioEmpleado>();

    public virtual UsuarioSistema IdUsuarioNavigation { get; set; } = null!;

    public virtual Recepcionistum? Recepcionistum { get; set; }
}
