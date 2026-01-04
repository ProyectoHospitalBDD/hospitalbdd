namespace Hospital.Api.Dtos
{
    
    public class EmpleadoSinHorarioDto
    {
        public int IdUsuario { get; set; }
        public string NombreCompleto { get; set; } = string.Empty;
        public string TipoUsuario { get; set; } = string.Empty;
        public string Curp { get; set; } = string.Empty; 
    }

  
    public class AsignarHorarioRequestDto
    {
        public int IdUsuario { get; set; }
        public string PatronDias { get; set; } = string.Empty; 
        public string Turno { get; set; } = string.Empty;     
    }
}