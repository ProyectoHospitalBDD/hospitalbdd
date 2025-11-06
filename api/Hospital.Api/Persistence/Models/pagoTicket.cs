using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Api.Persistence.Models;

[Table("pagoTicket")]
public partial class pagoTicket
{
    [Key]
    public int idPagoTicket { get; set; }

    [StringLength(15)]
    public string estatusPago { get; set; } = null!;

    public DateOnly fechaPago { get; set; }

    public TimeOnly horaPago { get; set; }

    public int idTicket { get; set; }

    public int? idFarmaceutico { get; set; }

    [ForeignKey("idFarmaceutico")]
    [InverseProperty("pagoTickets")]
    public virtual farmaceutico? idFarmaceuticoNavigation { get; set; }

    [ForeignKey("idTicket")]
    [InverseProperty("pagoTickets")]
    public virtual ticket idTicketNavigation { get; set; } = null!;
}
