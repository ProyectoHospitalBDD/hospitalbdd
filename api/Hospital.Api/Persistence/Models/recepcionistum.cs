using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Api.Persistence.Models;

public partial class recepcionistum
{
    [Key]
    public int idUsuario { get; set; }

    public bool esAdmin { get; set; }

    [ForeignKey("idUsuario")]
    [InverseProperty("recepcionistum")]
    public virtual empleado idUsuarioNavigation { get; set; } = null!;
}
