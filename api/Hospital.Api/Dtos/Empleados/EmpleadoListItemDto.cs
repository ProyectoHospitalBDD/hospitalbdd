namespace Hospital.Api.Dtos.Empleados;

public sealed record EmpleadoListItemDto(
    int IdUsuario,
    string TipoUsuario,
    string Nombre,
    string ApPat,
    string? ApMat,
    string Curp,
    string? CorreoPersonal,
    string? TelPersonal,
    string? TelCasa,
    bool Estatus,
    decimal Salario,
    string? Cedula,
    int? IdEspecialidad,
    int? IdConsultorio
);
