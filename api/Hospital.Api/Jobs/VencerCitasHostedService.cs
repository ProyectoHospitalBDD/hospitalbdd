using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Options;

namespace Hospital.Api.Jobs;

public sealed class VencerCitasHostedService : BackgroundService
{
    private readonly IConfiguration _cfg;
    private readonly ILogger<VencerCitasHostedService> _log;
    private readonly VencerCitasJobOptions _opt;

    public VencerCitasHostedService(
        IConfiguration cfg,
        ILogger<VencerCitasHostedService> log,
        IOptions<VencerCitasJobOptions> opt)
    {
        _cfg = cfg;
        _log = log;
        _opt = opt.Value;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (!_opt.Enabled)
        {
            _log.LogInformation("Job VencerCitas deshabilitado por configuración.");
            return;
        }

        var cs = _cfg.GetConnectionString("DefaultConnection")
                 ?? throw new InvalidOperationException("No existe ConnectionStrings:DefaultConnection");

        var intervalo = TimeSpan.FromMinutes(Math.Max(1, _opt.IntervalMinutes));

        _log.LogInformation("Job VencerCitas iniciado. Intervalo: {Interval}. Lock DB: {Lock}",
            intervalo, _opt.UseDbLock);

        // Pequeño delay inicial opcional
        await Task.Delay(TimeSpan.FromSeconds(3), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            var inicio = DateTimeOffset.UtcNow;

            try
            {
                await EjecutarAsync(cs, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                // apagado limpio
            }
            catch (Exception ex)
            {
                _log.LogError(ex, "Error ejecutando Job VencerCitas");
            }

            var duracion = DateTimeOffset.UtcNow - inicio;
            var espera = intervalo - duracion;
            if (espera < TimeSpan.FromSeconds(1)) espera = TimeSpan.FromSeconds(1);

            await Task.Delay(espera, stoppingToken);
        }

        _log.LogInformation("Job VencerCitas detenido.");
    }

    private async Task EjecutarAsync(string cs, CancellationToken ct)
    {
        await using var con = new SqlConnection(cs);
        await con.OpenAsync(ct);

        
        if (_opt.UseDbLock)
        {
            var locked = await TryAcquireAppLockAsync(con, _opt.LockName, _opt.LockTimeoutSeconds, ct);
            if (!locked)
            {
                _log.LogWarning("Job VencerCitas: no se obtuvo lock (otra instancia está corriendo).");
                return;
            }
        }

        var sw = System.Diagnostics.Stopwatch.StartNew();

        await using (var cmd = new SqlCommand("dbo.sp_Admin_VencerCitas", con))
        {
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandTimeout = 30;
            await cmd.ExecuteNonQueryAsync(ct);
        }

        sw.Stop();
        _log.LogInformation("Job VencerCitas ejecutado en {Ms} ms (UTC {UtcNow})",
            sw.ElapsedMilliseconds, DateTimeOffset.UtcNow);
    }

    private static async Task<bool> TryAcquireAppLockAsync(
        SqlConnection con,
        string lockName,
        int timeoutSeconds,
        CancellationToken ct)
    {
        
        await using var cmd = new SqlCommand("sp_getapplock", con)
        {
            CommandType = CommandType.StoredProcedure,
            CommandTimeout = Math.Max(5, timeoutSeconds + 2)
        };

        cmd.Parameters.AddWithValue("@Resource", lockName);
        cmd.Parameters.AddWithValue("@LockMode", "Exclusive");
        cmd.Parameters.AddWithValue("@LockOwner", "Session");
        cmd.Parameters.AddWithValue("@LockTimeout", timeoutSeconds * 1000);

        var ret = new SqlParameter("@return_value", SqlDbType.Int) { Direction = ParameterDirection.ReturnValue };
        cmd.Parameters.Add(ret);

        await cmd.ExecuteNonQueryAsync(ct);

        var code = (int)(ret.Value ?? -999);

       
        return code is 0 or 1;
    }
}
