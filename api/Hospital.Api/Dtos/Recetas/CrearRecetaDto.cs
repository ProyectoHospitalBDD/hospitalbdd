using System.ComponentModel.DataAnnotations;

namespace Hospital.Api.Dtos.Recetas;

// DTOs para CREAR (entrada POST)
public class MedicamentoRecetaDto
{
    [Required]
    public int IdMedicamento { get; set; }
    public string? Indicaciones { get; set; }

    [Required]
    [Range(1, int.MaxValue)]
    public int Cantidad { get; set; }
}

public class ServicioRecetaDto
{
    [Required]
    public int IdServicio { get; set; }
    public string? Indicaciones { get; set; }
}

public class CrearRecetaDto
{
    [Required]
    public int IdCita { get; set; }

    [Required]
    public DateTime FechaReceta { get; set; }

    public string? Diagnostico { get; set; }
    public string? Observaciones { get; set; }

    [Required]
    public List<MedicamentoRecetaDto> Medicamentos { get; set; } = new();

    [Required]
    public List<ServicioRecetaDto> Servicios { get; set; } = new();
}

public class RecetaCreadaDto
{
    public int IdRecetaGenerado { get; set; }
}

// DTOs para LEER (salida GET)
public class MedicamentoDto
{
    public int IdMedicamento { get; set; }
    public string? Nombre { get; set; }          // nombreMedicamento del SP
    public string? Indicaciones { get; set; }
    public int Cantidad { get; set; }
}

public class ServicioDto
{
    public int IdServicio { get; set; }
    public string? Nombre { get; set; }          // nombreServicio del SP
    public string? Indicaciones { get; set; }
}

public class RecetaDto
{
    public int IdReceta { get; set; }
    public int IdCita { get; set; }
    public DateTime FechaReceta { get; set; }
    public string? Diagnostico { get; set; }
    public string? Observaciones { get; set; }
    public List<MedicamentoDto> Medicamentos { get; set; } = new(); // ← corregido
    public List<ServicioDto> Servicios { get; set; } = new();       // ← corregido
}