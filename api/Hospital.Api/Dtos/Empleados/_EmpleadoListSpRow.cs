namespace Hospital.Api.Dtos.Empleados;

public sealed class _EmpleadoListSpRow
{
    public int IdUsuario { get; set; }
    public string TipoUsuario { get; set; } = "";
    public string Nombre { get; set; } = "";
    public string ApPat { get; set; } = "";
    public string? ApMat { get; set; }
    public string Curp { get; set; } = "";

    public string? CorreoPersonal { get; set; }
    public string? TelPersonal { get; set; }
    public string? TelCasa { get; set; }

    public bool Estatus { get; set; }
    public decimal Salario { get; set; }

    public string? Cedula { get; set; }
    public int? IdEspecialidad { get; set; }
    public int? IdConsultorio { get; set; }
}
