using System;

namespace Hospital.Api.Dtos.Farmacia;

public class MedicamentoDto
{
    public int IdMedicamento { get; set; }
    public string Descripcion { get; set; } = string.Empty; // Inicializado para evitar warning
    public string Tipo { get; set; } = string.Empty;
    public string Capacidad { get; set; } = string.Empty;
    public decimal Precio { get; set; }
    public int Stock { get; set; }
    public DateOnly Caducidad { get; set; } // <--- CAMBIO: DateOnly para coincidir con tu BD
}

public class UpdateStockDto
{
    public int Stock { get; set; }
}