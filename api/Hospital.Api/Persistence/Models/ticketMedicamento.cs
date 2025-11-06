using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Api.Persistence.Models;

[PrimaryKey("idTicket", "idMedicamento")]
[Table("ticketMedicamento")]
public partial class ticketMedicamento
{
    [Key]
    public int idTicket { get; set; }

    [Key]
    public int idMedicamento { get; set; }

    public int cantidad { get; set; }

    [Column(TypeName = "money")]
    public decimal precioUnitario { get; set; }

    [ForeignKey("idMedicamento")]
    [InverseProperty("ticketMedicamentos")]
    public virtual medicamento idMedicamentoNavigation { get; set; } = null!;

    [ForeignKey("idTicket")]
    [InverseProperty("ticketMedicamentos")]
    public virtual ticket idTicketNavigation { get; set; } = null!;
}
