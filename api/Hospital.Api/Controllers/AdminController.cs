using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Hospital.Api.Persistence;
using Microsoft.AspNetCore.Authorization;

namespace Hospital.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AdminController : ControllerBase
{
    private readonly HospitalContext _db;

    public AdminController(HospitalContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Vence las citas no pagadas cuyo pago ya expiró (8 horas).
    /// </summary>
    [HttpPost("vencer-citas")]
    public async Task<IActionResult> VencerCitas()
    {
        await _db.Database.ExecuteSqlRawAsync("EXEC dbo.sp_Admin_VencerCitas");
        // 204 No Content -> operación OK, sin body
        return NoContent();
    }
}
