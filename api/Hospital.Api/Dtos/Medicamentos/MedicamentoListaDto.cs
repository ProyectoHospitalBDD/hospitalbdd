namespace Hospital.Api.Dtos.Medicamentos;

public record MedicamentoListaDto(
    int IdMedicamento,
    string Descripcion,
    string Tipo,
    string Capacidad,
    decimal Precio,
    int Stock,
    DateOnly Caducidad,
    int? IdFarmacia
);