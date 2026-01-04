namespace Hospital.Api.Dtos
{
    public class HistorialMedicoDto
    {
        public string TipoSangre { get; set; } = string.Empty;
        public decimal? Peso { get; set; }
        public decimal? Estatura { get; set; }
    }
}