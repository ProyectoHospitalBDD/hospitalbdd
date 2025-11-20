// api/Hospital.Api/Dtos/Auth/LoginRequestDto.cs
namespace Hospital.Api.Dtos.Auth;

public class LoginRequestDto
{
    public string Correo { get; set; } = default!;      
    public string Password { get; set; } = default!;
}
