namespace Hospital.Api.Dtos.Empleados;

public class DoctorExtraDto
{
    public string Cedula { get; set; } = null!;
    public int IdEspecialidad { get; set; }
    public int IdConsultorio { get; set; }
}
