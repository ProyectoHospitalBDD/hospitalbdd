using System.ComponentModel.DataAnnotations;

namespace Hospital.Api.Dtos
{
    public class UpdatePerfilDto
    {
        [Required]
        public string Nombre { get; set; } = string.Empty;
        
        [Required]
        public string ApPat { get; set; } = string.Empty;
        
        public string? ApMat { get; set; }

        [Required]
        [StringLength(18, MinimumLength = 18, ErrorMessage = "El CURP debe tener 18 caracteres.")]
        public string Curp { get; set; } = string.Empty;

        [EmailAddress]
        public string? Email { get; set; } 

        public string? Telefono { get; set; }
    }
}