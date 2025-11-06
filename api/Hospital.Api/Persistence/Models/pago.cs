using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Api.Persistence.Models;

[Table("pago")]
public partial class pago
{
    [Key]
    public int idPago { get; set; }

    public int idCita { get; set; }

    [StringLength(15)]
    public string estatusPago { get; set; } = null!;

    [Column(TypeName = "money")]
    public decimal monto { get; set; }

    public DateOnly? fechaPago { get; set; }

    public TimeOnly? horaPago { get; set; }

    public DateTime venceEn { get; set; }

    [ForeignKey("idCita")]
    [InverseProperty("pagos")]
    public virtual citum idCitaNavigation { get; set; } = null!;
}
