namespace Hospital.Api.Jobs;

public sealed class VencerCitasJobOptions
{
    public bool Enabled { get; init; } = true;
    public int IntervalMinutes { get; init; } = 5;

    // Evita ejecución doble en escenarios multi-instancia
    public bool UseDbLock { get; init; } = true;
    public string LockName { get; init; } = "job:vencer-citas";
    public int LockTimeoutSeconds { get; init; } = 5;
}
