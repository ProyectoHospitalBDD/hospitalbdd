namespace Hospital.Api.Dtos
{

    public class AlergiaItemDto
    {
        public int IdAlerPade { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Tipo { get; set; } = string.Empty; 
    }

    public class PacienteAlergiaDto
    {
        public int IdAlerPade { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string NombreNormalizado { get; set; } = string.Empty;
        public string Tipo { get; set; } = string.Empty;

        public string? Severidad { get; set; }
        public string? Estado { get; set; }
        public string? Reaccion { get; set; }
        public string? Observaciones { get; set; }
        public DateTime? FechaInicio { get; set; } 
    }

    public class AgregarAlergiaDto
    {
        public int IdAlerPade { get; set; }
    }
}