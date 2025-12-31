USE hospitalBD;
GO


ALTER TABLE dbo.bitacoraEstatusCita
ALTER COLUMN estatusCita NVARCHAR(40) NOT NULL;

DROP INDEX IF EXISTS UX_CitaPtePacienteDoctor ON dbo.cita;
GO

ALTER TABLE dbo.cita
ALTER COLUMN estatusCita NVARCHAR(40) NOT NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='UX_CitaPtePacienteDoctor' AND object_id=OBJECT_ID('dbo.cita'))
BEGIN
  CREATE UNIQUE INDEX UX_CitaPtePacienteDoctor
    ON dbo.cita(idPaciente, idDoctor)
    WHERE estatusCita IN (N'AgendadaPendPago', N'PagadaPendAtender');
END
GO

ALTER TABLE dbo.cita DROP CONSTRAINT CK_Cita_Estatus;
GO

ALTER TABLE dbo.cita ADD CONSTRAINT CK_Cita_Estatus CHECK (estatusCita IN
(
 N'AgendadaPendPago', N'PagadaPendAtender',
 N'CanceladaFaltaPago', N'CanceladaPaciente',
 N'CanceladaDoctor', N'Atendida', N'NoAcudio',
 N'CancelacionSolicitadaDoctor'
));
GO


CREATE OR ALTER PROCEDURE dbo.sp_Cita_Cancelar_Doctor
  @idCita INT,
  @idDoctor INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @estatus NVARCHAR(25), @doctorCita INT;

    SELECT 
        @estatus = estatusCita,
        @doctorCita = idDoctor
    FROM dbo.cita
    WHERE idCita = @idCita;

    IF @estatus IS NULL
       THROW 51031, 'CitaNoExiste', 1;

    -- VALIDACIÓN: la cita debe ser de ese doctor
    IF @doctorCita <> @idDoctor
       THROW 51035, 'NoAutorizadoDoctorNoEsDuenioDeLaCita', 1;

    -- Si ya estaba solicitada 
    IF @estatus = N'CancelacionSolicitadaDoctor'
       THROW 51032, 'YaSolicitada', 1;

    -- Solo se puede SOLICITAR cancelación si estaba en estos estados
    IF @estatus NOT IN (N'AgendadaPendPago', N'PagadaPendAtender')
       THROW 51030, 'NoCancelable', 1;

    
    BEGIN TRY
        BEGIN TRAN;

        UPDATE dbo.cita
          SET estatusCita = N'CancelacionSolicitadaDoctor'
        WHERE idCita = @idCita;

        UPDATE b
          SET b.politica = N'Solicitud de cancelación por doctor'
        FROM (
            SELECT TOP (1) *
            FROM dbo.bitacoraEstatusCita
            WHERE idCita = @idCita
              AND estatusCita = N'CancelacionSolicitadaDoctor'
            ORDER BY fechaMov DESC, idBitacora DESC
        ) b;

        COMMIT;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        THROW;
    END CATCH
END
GO




USE hospitalBD;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Cita_Confirmar_Cancelacion_Doctor
  @idCita INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @estatus NVARCHAR(25), @monto MONEY;
    SELECT @estatus = estatusCita, @monto = costo
    FROM dbo.cita
    WHERE idCita = @idCita;

    IF @estatus IS NULL
       THROW 51031, 'CitaNoExiste', 1;

    IF @estatus <> N'CancelacionSolicitadaDoctor'
       THROW 51033, 'NoHaySolicitudCancelacion', 1;

    -- estatus previo (antes de la solicitud)
    DECLARE @estatusPrevio NVARCHAR(25);

    ;WITH movs AS (
      SELECT
        b.estatusCita,
        b.fechaMov,
        b.idBitacora,
        ROW_NUMBER() OVER (
          ORDER BY b.fechaMov DESC, b.idBitacora DESC
        ) AS rn
      FROM dbo.bitacoraEstatusCita b
      WHERE b.idCita = @idCita
    )
    SELECT @estatusPrevio = estatusCita
    FROM movs
    WHERE rn = 2;

    IF @estatusPrevio IS NULL
       THROW 51034, 'NoSePuedeDeterminarEstatusPrevio', 1;

    DECLARE @devuelto MONEY = CASE
        WHEN @estatusPrevio = N'PagadaPendAtender' THEN @monto
        ELSE 0
    END;

    BEGIN TRY
        BEGIN TRAN;

        -- pago: si estaba pendiente o pagado, se cancela; devolución depende del estatus previo
        UPDATE dbo.pago
          SET estatusPago   = N'Cancelado',
              montoDevuelto = @devuelto
        WHERE idCita = @idCita;

        UPDATE dbo.cita
          SET estatusCita = N'CanceladaDoctor'
        WHERE idCita = @idCita;

        UPDATE b
          SET b.politica = CASE WHEN @devuelto > 0 THEN N'100% aprobado por recepción' ELSE N'Cancelación aprobada (sin pago)' END,
              b.montoDevuelto = @devuelto
        FROM (
            SELECT TOP (1) *
            FROM dbo.bitacoraEstatusCita
            WHERE idCita = @idCita
              AND estatusCita = N'CanceladaDoctor'
            ORDER BY fechaMov DESC, idBitacora DESC
        ) b;

        COMMIT;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        THROW;
    END CATCH
END
GO




USE hospitalBD;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Cita_Rechazar_Cancelacion_Doctor
  @idCita INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @estatusActual NVARCHAR(25);
    SELECT @estatusActual = estatusCita
    FROM dbo.cita
    WHERE idCita = @idCita;

    IF @estatusActual IS NULL
       THROW 51031, 'CitaNoExiste', 1;

    IF @estatusActual <> N'CancelacionSolicitadaDoctor'
       THROW 51033, 'NoHaySolicitudCancelacion', 1;

    DECLARE @estatusPrevio NVARCHAR(25);

    ;WITH movs AS (
      SELECT
        b.estatusCita,
        b.fechaMov,
        b.idBitacora,
        ROW_NUMBER() OVER (
          PARTITION BY b.idCita
          ORDER BY b.fechaMov DESC, b.idBitacora DESC
        ) AS rn
      FROM dbo.bitacoraEstatusCita b
      WHERE b.idCita = @idCita
    )
    SELECT @estatusPrevio = estatusCita
    FROM movs
    WHERE rn = 2;  -- el anterior al más reciente

    IF @estatusPrevio IS NULL
       THROW 51034, 'NoSePuedeDeterminarEstatusPrevio', 1;

    BEGIN TRY
      BEGIN TRAN;

      UPDATE dbo.cita
        SET estatusCita = @estatusPrevio
      WHERE idCita = @idCita;

      -- Etiqueta la fila nueva en bitácora (la que dejó el trigger al “revertir”)
      UPDATE b
        SET b.politica = N'Rechazado por recepción (se revierte solicitud)'
      FROM (
        SELECT TOP (1) *
        FROM dbo.bitacoraEstatusCita
        WHERE idCita = @idCita
          AND estatusCita = @estatusPrevio
        ORDER BY fechaMov DESC, idBitacora DESC
      ) b;

      COMMIT;
    END TRY
    BEGIN CATCH
      IF @@TRANCOUNT > 0 ROLLBACK;
      THROW;
    END CATCH
END
GO