using System;
using System.Collections.Generic;

namespace Hospital.Api.Persistence.Models;

public partial class RecetaMedicamento
{
    public int IdReceta { get; set; }

    public int IdMedicamento { get; set; }

    public string? Indicaciones { get; set; }

    public int Cantidad { get; set; }

    public virtual Medicamento IdMedicamentoNavigation { get; set; } = null!;

    public virtual Recetum IdRecetaNavigation { get; set; } = null!;
}
