namespace Hospital.Api.Dtos.Especialidades{
    public record EspecialidadDto(
        int IdEspecialidad,
        string Nombre,
        decimal Costo
    );
}