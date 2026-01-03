--USE hospitalBD;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Admin_VencerCitas
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;

  DECLARE @ahora DATETIME2 = SYSUTCDATETIME();

  BEGIN TRY
    BEGIN TRAN;

    -- 1) Guardamos las citas afectadas en una tabla variable
    DECLARE @V TABLE (idCita INT PRIMARY KEY);

    INSERT INTO @V(idCita)
    SELECT c.idCita
    FROM dbo.cita c
    JOIN dbo.pago p ON p.idCita = c.idCita
    WHERE c.estatusCita = N'AgendadaPendPago'
      AND p.estatusPago = N'Pendiente'
      AND p.venceEn < @ahora;

    -- Si no hay nada que vencer, salimos
    IF NOT EXISTS (SELECT 1 FROM @V)
    BEGIN
      COMMIT;
      RETURN;
    END

    -- 2) Pago pasa a Cancelado
    UPDATE p
      SET estatusPago = N'Cancelado'
    FROM dbo.pago p
    JOIN @V v ON v.idCita = p.idCita;

    -- 3) Cita pasa a CanceladaFaltaPago
    UPDATE c
      SET estatusCita = N'CanceladaFaltaPago'
    FROM dbo.cita c
    JOIN @V v ON v.idCita = c.idCita;

    COMMIT;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    THROW;
  END CATCH
END
GO
