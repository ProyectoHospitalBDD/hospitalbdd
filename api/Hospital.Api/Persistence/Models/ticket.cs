using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema; 

namespace Hospital.Api.Persistence.Models;

public partial class Ticket
{
    public int IdTicket { get; set; }

    public DateTime Fecha { get; set; }

    public int? IdFarmaceutico { get; set; }

    public int? IdFarmacia { get; set; }

    public int? IdPaciente { get; set; }
    
    public string? NombreClienteInvitado { get; set; }
    
    public string? CorreoContacto { get; set; }
    
    public string? EstatusTicket { get; set; }

    public int? IdPaciente { get; set; }
    public string? NombreClienteInvitado { get; set; }
    public string? CorreoContacto { get; set; }

    public string EstatusTicket { get; set; } = null!;

    public virtual Farmaceutico IdFarmaceuticoNavigation { get; set; } = null!;

    [ForeignKey("IdFarmacia")]
    public virtual Farmacium? IdFarmaciaNavigation { get; set; }

    [ForeignKey("IdPaciente")]
    public virtual Paciente? IdPacienteNavigation { get; set; } 

    public virtual ICollection<PagoTicket> PagoTickets { get; set; } = new List<PagoTicket>();

    public virtual ICollection<TicketMedicamento> TicketMedicamentos { get; set; } = new List<TicketMedicamento>();

    public virtual ICollection<TicketServicio> TicketServicios { get; set; } = new List<TicketServicio>();
}