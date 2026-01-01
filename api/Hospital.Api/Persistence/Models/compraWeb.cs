using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Hospital.Api.Models
{
    [Table("compraWeb")]
    public class CompraWeb
    {
        [Key]
        public int IdCompra { get; set; }

        public int? IdPaciente { get; set; }
        public string? NombreClienteInvitado { get; set; }
        public string? CorreoContacto { get; set; }

        public DateTime FechaCompra { get; set; } = DateTime.Now;
        public decimal TotalGeneral { get; set; }
        public string Estatus { get; set; } = "Carrito";

        // Relación con los detalles
        public List<DetalleCompraWeb> Detalles { get; set; } = new();
    }

    [Table("detalleCompraWeb")]
    public class DetalleCompraWeb
    {
        [Key]
        public int IdDetalleWeb { get; set; }

        public int IdCompra { get; set; }
        [ForeignKey("IdCompra")]
        public CompraWeb Compra { get; set; } = null!;

        public int? IdMedicamento { get; set; }
        public int? IdServicio { get; set; }

        public int Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
        
        // Columna calculada en BD, pero podemos mapearla o ignorarla en la inserción
        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public decimal Importe { get; private set; }
    }
}