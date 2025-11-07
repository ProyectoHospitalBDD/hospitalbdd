using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Hospital.Api.Persistence;

namespace Hospital.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly HospitalContext _ctx;
    public HealthController(HospitalContext ctx) => _ctx = ctx;

    [HttpGet("ping")]
    public IActionResult Ping() => Ok(new { api = "ok" });

    [HttpGet("db")]
    public async Task<IActionResult> Db()
    {
        var ok = await _ctx.Database.CanConnectAsync();

        int usuarios = 0;
        try
        {
            usuarios = await _ctx.usuarioSistemas.CountAsync();
        }
        catch { }

        return Ok(new { database = ok ? "ok" : "fail", usuarios });
    }
}
