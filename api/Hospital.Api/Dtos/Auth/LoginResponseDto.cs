// api/Hospital.Api/Dtos/Auth/LoginResponseDto.cs
namespace Hospital.Api.Dtos.Auth;

public class LoginResponseDto
{
    public int IdUsuario { get; set; }
    public string NombreCompleto { get; set; } = default!;
    public string Rol { get; set; } = default!;
    public string Token { get; set; } = default!;
}
