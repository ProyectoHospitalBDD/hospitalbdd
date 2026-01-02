using System.Collections.Generic;

namespace Hospital.Api.Dtos.Tickets
{
    public class DetalleTicketPayload
    {
        public int? IdMedicamento { get; set; }
        public int? IdServicio { get; set; }
        public int Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
    }

    public class CrearTicketPayload
    {
        // Identificación del cliente (caja)
        public int? IdPaciente { get; set; }
        public string? NombreClienteInvitado { get; set; }
        public string? CorreoContacto { get; set; }

        // Operación
        public int IdFarmacia { get; set; }
        public decimal TotalGeneral { get; set; }
        public string? MetodoPago { get; set; } 

        public List<DetalleTicketPayload> Detalles { get; set; } = new();
    }

    public class TicketExitosoDto
    {
        public int IdTicket { get; set; }
        public string Mensaje { get; set; } = string.Empty;

        // --- ESTE ES EL CAMPO QUE FALTABA ---
        public decimal TotalCalculado { get; set; }
    }

    // DTO para la búsqueda rápida en caja
    public class PacienteLookupDto
    {
        public int IdPaciente { get; set; }
        public string NombreCompleto { get; set; } = string.Empty;
        public string Curp { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Telefono { get; set; }
    }
}