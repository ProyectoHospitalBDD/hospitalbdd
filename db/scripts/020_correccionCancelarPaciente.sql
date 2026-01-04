CREATE OR ALTER PROCEDURE dbo.sp_Cita_Cancelar_Paciente
  @idCita INT
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;

  DECLARE @ahora   DATETIME2 = SYSUTCDATETIME();
  DECLARE @ini     DATETIME2;
  DECLARE @estatus NVARCHAR(40);
  DECLARE @monto   MONEY;

  SELECT @ini = fechaHoraInicio,
         @estatus = estatusCita,
         @monto = costo
  FROM dbo.cita
  WHERE idCita = @idCita;

  IF @estatus IS NULL
     THROW 51031, 'CitaNoExiste', 1;

  IF @estatus NOT IN (N'AgendadaPendPago', N'PagadaPendAtender')
     THROW 51020, 'NoCancelable', 1;

  -- Si NO está pagada, no hay devolución 
  DECLARE @pct DECIMAL(4,2) =
    CASE WHEN @estatus = N'PagadaPendAtender'
         THEN dbo.fnPorcentajeDevolucion(@ahora, @ini)
         ELSE 0.00
    END;

  DECLARE @dev MONEY = @monto * @pct;

  BEGIN TRY
    BEGIN TRAN;

    -- Actualizar pago:
    -- - si estaba Pendiente => Cancelado, devuelto 0
    -- - si estaba Pagado    => Cancelado, devuelto @dev
    UPDATE dbo.pago
      SET estatusPago = CASE
                          WHEN estatusPago IN (N'Pendiente', N'Pagado') THEN N'Cancelado'
                          ELSE estatusPago
                        END,
          montoDevuelto = CASE
                            WHEN estatusPago = N'Pagado' THEN @dev
                            ELSE 0
                          END
    WHERE idCita = @idCita;

    -- Actualizar cita (dispara trigger -> bitácora)
    UPDATE dbo.cita
      SET estatusCita = N'CanceladaPaciente'
    WHERE idCita = @idCita;

    -- Actualizar política y montoDevuelto en la ÚLTIMA fila CanceladaPaciente
    ;WITH UltimaBitacora AS (
      SELECT TOP (1) *
      FROM dbo.bitacoraEstatusCita
      WHERE idCita = @idCita
        AND estatusCita = N'CanceladaPaciente'
      ORDER BY fechaMov DESC, idBitacora DESC
    )
    UPDATE b
      SET b.politica = CASE
                         WHEN @estatus <> N'PagadaPendAtender' THEN N'Cancelación (sin pago)'
                         WHEN @pct = 1.00 THEN N'>=48h 100%'
                         WHEN @pct = 0.50 THEN N'>=24h 50%'
                         ELSE N'<24h 0%'
                       END,
          b.montoDevuelto = @dev
    FROM UltimaBitacora b;

    COMMIT;

    SELECT @dev AS montoDevuelto, @pct AS porcentaje;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    THROW;
  END CATCH
END
GO

use hospitalBD

select * from dbo.servicio
