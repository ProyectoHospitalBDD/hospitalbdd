namespace Hospital.Api.Dtos.Farmacia;

public class ServicioDto
{
    public int IdServicio { get; set; }
    public string Descripcion { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty;
    public decimal Precio { get; set; }
    public int? Stock { get; set; } 
}