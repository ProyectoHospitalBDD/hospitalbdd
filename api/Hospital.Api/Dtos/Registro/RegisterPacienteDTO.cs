namespace Hospital.Api.Dtos.Auth;

public class RegisterPacienteDto
{
    public string Nombres { get; set; } = null!;
    public string ApellidoPaterno { get; set; } = null!;
    public string? ApellidoMaterno { get; set; }
    public string Curp { get; set; } = null!;
    public string Correo { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string TelPersonal { get; set; } = null!;
    public string? TelCasa { get; set; }
}
