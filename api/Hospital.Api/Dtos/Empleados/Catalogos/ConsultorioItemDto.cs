namespace Hospital.Api.Dtos.Empleados.Catalogos;

public record ConsultorioItemDto(
    int IdConsultorio,
    string Numero,
    int IdEdificio,
    int? NumPisos,     
    string? EdificioLabel 
);