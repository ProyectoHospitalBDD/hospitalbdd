USE hospitalBD;
GO
-- Crear cita
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

    IF EXISTS(
      SELECT 1
      FROM dbo.cita c WITH (UPDLOCK, HOLDLOCK)
      WHERE c.idPaciente = @PacienteId
        AND c.idDoctor   = @DoctorId
        AND c.estatusCita IN (N'AgendadaPendPago', N'PagadaPendAtender')
    )
      THROW 51004, 'PacientePendienteConMismoDoctor', 1;

      IF EXISTS(
      SELECT 1
      FROM dbo.cita c WITH (UPDLOCK, HOLDLOCK)
      WHERE c.idPaciente = @PacienteId
        -- Importante: No filtramos por DoctorId aquí, buscamos en general
        AND c.estatusCita IN (N'AgendadaPendPago', N'PagadaPendAtender') 
        -- Lógica de traslape de tiempo
        AND c.fechaHoraFin > @FechaInicio 
        AND c.fechaHoraInicio < @FechaFin
    )
      THROW 51007, 'PacienteOcupadoEnOtroConsultorio', 1;

    IF dbo.fnCitaSeTraslapa(@DoctorId, @FechaInicio, @FechaFin) = 1
      THROW 51003, 'DoctorOcupado', 1;

    IF EXISTS(
      SELECT 1
      FROM dbo.cita c WITH (UPDLOCK, HOLDLOCK)
      WHERE c.idDoctor = @DoctorId
        AND c.estatusCita IN (N'AgendadaPendPago', N'PagadaPendAtender')
        AND c.fechaHoraFin  > @FechaInicio
        AND c.fechaHoraInicio < @FechaFin
    )
      THROW 51003, 'DoctorOcupado', 2;

    INSERT dbo.cita(idPaciente, idDoctor, estatusCita, fechaHoraInicio, duracionMin, costo)
    VALUES(@PacienteId, @DoctorId, N'AgendadaPendPago', @FechaInicio, @DuracionMin, @Costo);

    DECLARE @idCita INT = SCOPE_IDENTITY();

    INSERT dbo.pago(idCita, estatusPago, monto, venceEn)
    VALUES(@idCita, N'Pendiente', @Costo, DATEADD(HOUR, 8, @ahora));

    INSERT dbo.bitacoraEstatusCita(idCita, estatusCita, fechaCitaInicio, fechaCitaFin, idPaciente, idDoctor, costo)
    SELECT idCita, N'AgendadaPendPago', fechaHoraInicio, fechaHoraFin, idPaciente, idDoctor, costo
    FROM dbo.cita WHERE idCita = @idCita;

    COMMIT;

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


-- Pagar cita
CREATE OR ALTER PROCEDURE dbo.sp_Cita_Pagar_v1
  @idCita INT
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;

  DECLARE @ahora DATETIME2 = SYSUTCDATETIME();
  DECLARE @venceEn DATETIME2, @estatusPago NVARCHAR(15);

  SELECT @venceEn = p.venceEn, @estatusPago = p.estatusPago
  FROM dbo.pago p WHERE p.idCita = @idCita;

  IF @estatusPago IS NULL THROW 51010, 'PagoNoEncontrado', 1;
  IF @estatusPago <> N'Pendiente' THROW 51011, 'PagoNoPendiente', 1;
  IF @ahora > @venceEn THROW 51012, 'CitaExpirada', 1;

  BEGIN TRY
    BEGIN TRAN;

    UPDATE dbo.pago
      SET estatusPago = N'Pagado',
          fechaPago = CAST(@ahora AS DATE),
          horaPago  = CAST(@ahora AS TIME)
    WHERE idCita = @idCita;

    UPDATE dbo.cita
      SET estatusCita = N'PagadaPendAtender'
    WHERE idCita = @idCita;

    INSERT dbo.bitacoraEstatusCita(idCita, estatusCita)
    VALUES(@idCita, N'PagadaPendAtender');

    COMMIT;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    THROW;
  END CATCH
END
GO

-- Cancelar por paciente
CREATE OR ALTER PROCEDURE dbo.sp_Cita_Cancelar_Paciente
  @idCita INT
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;

  DECLARE @ahora DATETIME2 = SYSUTCDATETIME();
  DECLARE @ini DATETIME2, @estatus NVARCHAR(25), @monto MONEY;

  SELECT @ini = fechaHoraInicio, @estatus = estatusCita, @monto = costo
  FROM dbo.cita WHERE idCita = @idCita;

  IF @estatus NOT IN (N'AgendadaPendPago', N'PagadaPendAtender')
     THROW 51020, 'NoCancelable', 1;

  DECLARE @pct DECIMAL(4,2) = dbo.fnPorcentajeDevolucion(@ahora, @ini);
  DECLARE @dev MONEY = @monto * @pct;

  BEGIN TRY
    BEGIN TRAN;

    UPDATE dbo.pago
      SET estatusPago = CASE WHEN estatusPago = N'Pendiente' THEN N'Cancelado' ELSE estatusPago END,
          montoDevuelto = @dev
    WHERE idCita = @idCita;

    UPDATE dbo.cita
      SET estatusCita = N'CanceladaPaciente'
    WHERE idCita = @idCita;

    INSERT dbo.bitacoraEstatusCita(idCita, estatusCita, politica, montoDevuelto)
    VALUES(@idCita, N'CanceladaPaciente',
           CASE WHEN @pct=1.00 THEN N'>=48h 100%' 
                WHEN @pct=0.50 THEN N'>=24h 50%' 
                ELSE N'<24h 0%' END,
           @dev);

    COMMIT;

    SELECT @dev AS montoDevuelto, @pct AS porcentaje;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    THROW;
  END CATCH
END
GO

--Expirar Cita 

CREATE OR ALTER PROCEDURE dbo.sp_Debug_ExpirarPagosPendientes1
AS
BEGIN
  SET NOCOUNT ON;

  UPDATE p
  SET venceEn = DATEADD(MINUTE, -10, SYSUTCDATETIME())  -- 10 min en el pasado
  FROM dbo.pago p
  JOIN dbo.cita c ON c.idCita = p.idCita
  WHERE p.estatusPago = N'Pendiente'
    AND c.estatusCita = N'AgendadaPendPago';
END
GO

SELECT * FROM bitacoraEstatusCita

