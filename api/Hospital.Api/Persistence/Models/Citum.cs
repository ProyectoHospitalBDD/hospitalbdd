using System;
using System.Collections.Generic;

namespace Hospital.Api.Persistence.Models;

public partial class Citum
{
    public int IdCita { get; set; }

    public string EstatusCita { get; set; } = null!;

    public DateTime FechaHoraInicio { get; set; }

    public DateTime FechaHoraFin { get; set; }

    public int IdDoctor { get; set; }

    public int IdPaciente { get; set; }

    public decimal Costo { get; set; }

    public int DuracionMin { get; set; }

    public virtual Doctor IdDoctorNavigation { get; set; } = null!;

    public virtual Paciente IdPacienteNavigation { get; set; } = null!;

    public virtual ICollection<Pago> Pagos { get; set; } = new List<Pago>();

    public virtual ICollection<Recetum> Receta { get; set; } = new List<Recetum>();
}
