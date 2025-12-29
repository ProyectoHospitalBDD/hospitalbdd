USE hospitalBD;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Cita_Crear
  @PacienteId  INT,
  @DoctorId    INT,
  @FechaInicio DATETIME2,
  @DuracionMin INT          -- 30 | 60 | 90
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;

  DECLARE @ahora DATETIME2 = SYSUTCDATETIME();

  IF @FechaInicio < DATEADD(HOUR, 48, @ahora)
     OR @FechaInicio > DATEADD(MONTH, 3, CAST(@ahora AS date))
     THROW 51000, 'CitaFueraDeRango', 1;

  IF @DuracionMin NOT IN (30,60,90)
     THROW 51006, 'DuracionNoPermitida', 1;

  DECLARE @FechaFin DATETIME2 = DATEADD(MINUTE, @DuracionMin, @FechaInicio);

  IF dbo.fnDentroHorarioDoctor(@DoctorId, @FechaInicio, @FechaFin) = 0
     THROW 51002, 'FueraDeHorarioLaboral', 1;

  DECLARE @Costo MONEY =
   (SELECT TOP(1) e.costo
    FROM dbo.doctor d
    JOIN dbo.especialidad e ON e.idEspecialidad = d.idEspecialidad
    WHERE d.idUsuario = @DoctorId);
  IF @Costo IS NULL THROW 51005, 'DoctorSinEspecialidad', 1;

  SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

  BEGIN TRY
    BEGIN TRAN;

    -- 1) El paciente no puede tener otra cita pendiente con el mismo doctor (regla de negocio)
    IF EXISTS(
      SELECT 1
      FROM dbo.cita c WITH (UPDLOCK, HOLDLOCK)
      WHERE c.idPaciente = @PacienteId
        AND c.idDoctor   = @DoctorId
        AND c.estatusCita IN (N'AgendadaPendPago', N'PagadaPendAtender')
    )
      THROW 51004, 'PacientePendienteConMismoDoctor', 1;

    -- 2) El doctor no puede estar ocupado en ese rango
    IF EXISTS(
      SELECT 1
      FROM dbo.cita c WITH (UPDLOCK, HOLDLOCK)
      WHERE c.idDoctor = @DoctorId
        AND c.estatusCita IN (N'AgendadaPendPago', N'PagadaPendAtender')
        AND c.fechaHoraFin  > @FechaInicio
        AND c.fechaHoraInicio < @FechaFin
    )
      THROW 51003, 'DoctorOcupado', 1;

    -- 3) NUEVO: el paciente no puede traslaparse con nadie (aunque sea otro doctor)
    IF EXISTS(
      SELECT 1
      FROM dbo.cita c WITH (UPDLOCK, HOLDLOCK)
      WHERE c.idPaciente = @PacienteId
        AND c.estatusCita IN (N'AgendadaPendPago', N'PagadaPendAtender')
        AND c.fechaHoraFin  > @FechaInicio
        AND c.fechaHoraInicio < @FechaFin
    )
      THROW 51007, 'PacienteOcupado', 1;

    -- 4) Inserta la cita
    INSERT dbo.cita(idPaciente, idDoctor, estatusCita, fechaHoraInicio, duracionMin, costo)
    VALUES(@PacienteId, @DoctorId, N'AgendadaPendPago', @FechaInicio, @DuracionMin, @Costo);

    DECLARE @idCita INT = SCOPE_IDENTITY();

    -- 5) Inserta pago con vencimiento a 8 horas
    INSERT dbo.pago(idCita, estatusPago, monto, venceEn)
    VALUES(@idCita, N'Pendiente', @Costo, DATEADD(HOUR, 8, @ahora));

    -- 6) Bitácora
    INSERT dbo.bitacoraEstatusCita(idCita, estatusCita, fechaCitaInicio, fechaCitaFin, idPaciente, idDoctor, costo)
    SELECT idCita, N'AgendadaPendPago', fechaHoraInicio, fechaHoraFin, idPaciente, idDoctor, costo
    FROM dbo.cita WHERE idCita = @idCita;

    COMMIT;

    -- 7) Devuelve la cita creada
    SELECT
      c.idCita,
      c.idPaciente,
      c.idDoctor,
      c.estatusCita,
      c.fechaHoraInicio,
      c.duracionMin,
      c.fechaHoraFin,
      c.costo,
      p.venceEn
    FROM dbo.cita c
    JOIN dbo.pago p ON p.idCita = c.idCita
    WHERE c.idCita = @idCita;

  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    THROW;
  END CATCH
END
GO
