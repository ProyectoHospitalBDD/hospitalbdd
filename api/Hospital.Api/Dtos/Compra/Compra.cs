using System.Collections.Generic;

// Namespace en PLURAL para coincidir con el using del controller
namespace Hospital.Api.Dtos.Compras 
{
    public class DetalleCompraPayload
    {
        public int? IdMedicamento { get; set; }
        public int? IdServicio { get; set; }
        public int Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
    }

    public class CrearCompraPayload
    {
        public int? IdPaciente { get; set; }
        public string? NombreClienteInvitado { get; set; }
        public string? CorreoContacto { get; set; }
        public decimal TotalGeneral { get; set; }
        public List<DetalleCompraPayload> Detalles { get; set; } = new();
    }
    
    public class CompraExitosaDto
    {
        public int IdCompra { get; set; }
        public string Mensaje { get; set; } = string.Empty;
    }
}