using System;
using System.Collections.Generic;

namespace Hospital.Api.Persistence.Models;

public partial class HorarioEmpleado
{
    public int IdHorarioE { get; set; }

    public string DiaSemana { get; set; } = null!;

    public TimeOnly HoraInicio { get; set; }

    public TimeOnly HoraFin { get; set; }

    public int IdUsuario { get; set; }

    public virtual Empleado IdUsuarioNavigation { get; set; } = null!;
}
