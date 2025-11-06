using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Api.Persistence.Models;

[Table("ticket")]
public partial class ticket
{
    [Key]
    public int idTicket { get; set; }

    public DateTime fecha { get; set; }

    public int? idFarmacia { get; set; }

    public int idFarmaceutico { get; set; }

    [ForeignKey("idFarmaceutico")]
    [InverseProperty("tickets")]
    public virtual farmaceutico idFarmaceuticoNavigation { get; set; } = null!;

    [ForeignKey("idFarmacia")]
    [InverseProperty("tickets")]
    public virtual farmacium? idFarmaciaNavigation { get; set; }

    [InverseProperty("idTicketNavigation")]
    public virtual ICollection<pagoTicket> pagoTickets { get; set; } = new List<pagoTicket>();

    [InverseProperty("idTicketNavigation")]
    public virtual ICollection<ticketMedicamento> ticketMedicamentos { get; set; } = new List<ticketMedicamento>();

    [InverseProperty("idTicketNavigation")]
    public virtual ICollection<ticketServicio> ticketServicios { get; set; } = new List<ticketServicio>();
}
