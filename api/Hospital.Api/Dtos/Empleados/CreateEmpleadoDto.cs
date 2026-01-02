namespace Hospital.Api.Dtos.Empleados;

public class CreateEmpleadoDto
{
    public string TipoUsuario { get; set; } = default!; // Doctor | Recepcionista | Enfermera | Farmaceutico

    public string Nombre { get; set; } = default!;
    public string ApPat { get; set; } = default!;
    public string ApMat { get; set; } = default!;
    public string Curp { get; set; } = default!;

    public string CorreoPersonal { get; set; } = default!;
    public string? TelPersonal { get; set; }
    public string? TelCasa { get; set; }

    public decimal Salario { get; set; }
    public bool Estatus { get; set; } = true;

    public string Password { get; set; } = default!;

    // SOLO DOCTOR
    public string? Cedula { get; set; }
    public int? IdEspecialidad { get; set; }
    public int? IdConsultorio { get; set; }
}
