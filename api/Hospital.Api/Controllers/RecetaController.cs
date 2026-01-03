using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;
using Microsoft.EntityFrameworkCore;
using Hospital.Api.Persistence;
using Hospital.Api.Dtos.Recetas;

namespace Hospital.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RecetaController : ControllerBase
{
    private readonly HospitalContext _db;

    public RecetaController(HospitalContext db)
    {
        _db = db;
    }

    // POST: api/Receta
    [HttpPost]
    public async Task<ActionResult<RecetaCreadaDto>> CrearReceta(CrearRecetaDto dto)
    {
        using var connection = (SqlConnection)_db.Database.GetDbConnection();
        await connection.OpenAsync();

        using var command = new SqlCommand("dbo.sp_CrearReceta", connection);
        command.CommandType = CommandType.StoredProcedure;

        // Parámetros simples
        command.Parameters.AddWithValue("@idCita", dto.IdCita);
        command.Parameters.AddWithValue("@fechaReceta", dto.FechaReceta.Date);
        command.Parameters.AddWithValue("@diagnostico", (object?)dto.Diagnostico ?? DBNull.Value);
        command.Parameters.AddWithValue("@observaciones", (object?)dto.Observaciones ?? DBNull.Value);

        // Table-valued parameters
        var medTable = new DataTable();
        medTable.Columns.Add("idMedicamento", typeof(int));
        medTable.Columns.Add("indicaciones", typeof(string));
        medTable.Columns.Add("cantidad", typeof(int));

        foreach (var med in dto.Medicamentos)
        {
            medTable.Rows.Add(med.IdMedicamento, med.Indicaciones ?? (object)DBNull.Value, med.Cantidad);
        }

        var medParam = command.Parameters.AddWithValue("@medicamentos", medTable);
        medParam.SqlDbType = SqlDbType.Structured;
        medParam.TypeName = "dbo.MedicamentoRecetaType";

        var servTable = new DataTable();
        servTable.Columns.Add("idServicio", typeof(int));
        servTable.Columns.Add("indicaciones", typeof(string));

        foreach (var serv in dto.Servicios)
        {
            servTable.Rows.Add(serv.IdServicio, serv.Indicaciones ?? (object)DBNull.Value);
        }

        var servParam = command.Parameters.AddWithValue("@servicios", servTable);
        servParam.SqlDbType = SqlDbType.Structured;
        servParam.TypeName = "dbo.ServicioRecetaType";

        // Ejecutar y obtener resultado
        using var reader = await command.ExecuteReaderAsync();
        if (await reader.ReadAsync())
        {
            var idReceta = reader.GetInt32(0);
            return Ok(new RecetaCreadaDto { IdRecetaGenerado = idReceta });
        }

        return BadRequest("No se pudo crear la receta");
    }
}