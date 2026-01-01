using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Hospital.Api.Persistence;

namespace Hospital.Api.Controllers;


[ApiController]
[Route("api/recep/cancelaciones")]
[Authorize(Roles = "Recepcionista")]
public class RecepCancelacionesController : ControllerBase
{
    private readonly HospitalContext _db;

    public RecepCancelacionesController(HospitalContext db)
    {
        _db = db;
    }


    // POST /api/recep/cancelaciones/{idCita}/confirmar
    [HttpPost("{idCita:int}/confirmar")]
    public async Task<IActionResult> Confirmar([FromRoute] int idCita)
    {
        await _db.Database.ExecuteSqlInterpolatedAsync(
            $"EXEC dbo.sp_Cita_Confirmar_Cancelacion_Doctor @idCita = {idCita}"
        );

        return NoContent();
    }

    // POST /api/recep/cancelaciones/{idCita}/rechazar
    [HttpPost("{idCita:int}/rechazar")]
    public async Task<IActionResult> Rechazar([FromRoute] int idCita)
    {
        await _db.Database.ExecuteSqlInterpolatedAsync(
            $"EXEC dbo.sp_Cita_Rechazar_Cancelacion_Doctor @idCita = {idCita}"
        );

        return NoContent();
    }
}
