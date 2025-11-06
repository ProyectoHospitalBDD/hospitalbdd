using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Api.Persistence.Models;

[PrimaryKey("idTicket", "idServicio")]
[Table("ticketServicio")]
public partial class ticketServicio
{
    [Key]
    public int idTicket { get; set; }

    [Key]
    public int idServicio { get; set; }

    public int cantidad { get; set; }

    [Column(TypeName = "money")]
    public decimal precioUnitario { get; set; }

    [ForeignKey("idServicio")]
    [InverseProperty("ticketServicios")]
    public virtual servicio idServicioNavigation { get; set; } = null!;

    [ForeignKey("idTicket")]
    [InverseProperty("ticketServicios")]
    public virtual ticket idTicketNavigation { get; set; } = null!;
}
