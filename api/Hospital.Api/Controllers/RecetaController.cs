using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Hospital.Api.Persistence;
using Hospital.Api.Dtos.Recetas;

namespace Hospital.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // <-- importante si no está global
public class RecetaController : ControllerBase
{
    private readonly HospitalContext _db;

    public RecetaController(HospitalContext db)
    {
        _db = db;
    }

    private int? GetUserIdFromClaims()
    {
        var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier)
                 ?? User.FindFirstValue("nameid")
                 ?? User.FindFirstValue("sub");
        if (int.TryParse(idStr, out var id)) return id;
        return null;
    }

    [HttpPost]
    public async Task<ActionResult<RecetaCreadaDto>> CrearReceta(CrearRecetaDto dto)
    {
        var idDoctor = GetUserIdFromClaims();
        if (idDoctor == null) return Unauthorized("No se pudo identificar al usuario.");

        
        var nombreDoctor = await _db.UsuarioSistemas
            .Where(u => u.IdUsuario == idDoctor.Value)
            .Select(u => (u.Nombre + " " + u.ApPat + " " + (u.ApMat ?? "")))
            .FirstOrDefaultAsync();

        if (string.IsNullOrWhiteSpace(nombreDoctor))
            nombreDoctor = $"DoctorId:{idDoctor.Value}"; // fallback, por si acaso


        using var connection = (SqlConnection)_db.Database.GetDbConnection();
        await connection.OpenAsync();

        using (var setCtx = new SqlCommand(
            "EXEC sp_set_session_context @key=N'UsuarioNombre', @value=@nombre;",
            connection))
        {
            setCtx.Parameters.Add(new SqlParameter("@nombre", SqlDbType.NVarChar, 200)
            {
                Value = nombreDoctor
            });

            await setCtx.ExecuteNonQueryAsync();
        }

        
        using var command = new SqlCommand("dbo.sp_CrearReceta", connection);
        command.CommandType = CommandType.StoredProcedure;

        command.Parameters.AddWithValue("@idCita", dto.IdCita);
        command.Parameters.AddWithValue("@fechaReceta", dto.FechaReceta.Date);
        command.Parameters.AddWithValue("@diagnostico", (object?)dto.Diagnostico ?? DBNull.Value);
        command.Parameters.AddWithValue("@observaciones", (object?)dto.Observaciones ?? DBNull.Value);

        var medTable = new DataTable();
        medTable.Columns.Add("idMedicamento", typeof(int));
        medTable.Columns.Add("indicaciones", typeof(string));
        medTable.Columns.Add("cantidad", typeof(int));

        foreach (var med in dto.Medicamentos)
            medTable.Rows.Add(med.IdMedicamento, med.Indicaciones ?? (object)DBNull.Value, med.Cantidad);

        var medParam = command.Parameters.AddWithValue("@medicamentos", medTable);
        medParam.SqlDbType = SqlDbType.Structured;
        medParam.TypeName = "dbo.MedicamentoRecetaType";

        var servTable = new DataTable();
        servTable.Columns.Add("idServicio", typeof(int));
        servTable.Columns.Add("indicaciones", typeof(string));

        foreach (var serv in dto.Servicios)
            servTable.Rows.Add(serv.IdServicio, serv.Indicaciones ?? (object)DBNull.Value);

        var servParam = command.Parameters.AddWithValue("@servicios", servTable);
        servParam.SqlDbType = SqlDbType.Structured;
        servParam.TypeName = "dbo.ServicioRecetaType";

        using var reader = await command.ExecuteReaderAsync();
        if (await reader.ReadAsync())
        {
            var idReceta = reader.GetInt32(0);
            return Ok(new RecetaCreadaDto { IdRecetaGenerado = idReceta });
        }

        return BadRequest("No se pudo crear la receta");
    }
}
