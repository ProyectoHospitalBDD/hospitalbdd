namespace Hospital.Api.Dtos.Empleados.Catalogos;

public record EspecialidadItemDto(
    int IdEspecialidad,
    string NombreEsp,
    decimal Costo
);