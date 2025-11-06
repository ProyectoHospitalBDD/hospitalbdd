using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Api.Persistence.Models;

[Table("farmaceutico")]
public partial class farmaceutico
{
    [Key]
    public int idUsuario { get; set; }

    [ForeignKey("idUsuario")]
    [InverseProperty("farmaceutico")]
    public virtual empleado idUsuarioNavigation { get; set; } = null!;

    [InverseProperty("idFarmaceuticoNavigation")]
    public virtual ICollection<pagoTicket> pagoTickets { get; set; } = new List<pagoTicket>();

    [InverseProperty("idFarmaceuticoNavigation")]
    public virtual ICollection<ticket> tickets { get; set; } = new List<ticket>();
}
