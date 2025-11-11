-- Vencer citas no pagadas (8h)
CREATE OR ALTER PROCEDURE dbo.sp_Admin_VencerCitas
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;

  DECLARE @ahora DATETIME2 = SYSUTCDATETIME();

  BEGIN TRY
    BEGIN TRAN;

    ;WITH V AS(
      SELECT c.idCita
      FROM dbo.cita c
      JOIN dbo.pago p ON p.idCita = c.idCita
      WHERE c.estatusCita = N'AgendadaPendPago'
        AND p.estatusPago = N'Pendiente'
        AND p.venceEn < @ahora
    )
    UPDATE p SET estatusPago = N'Cancelado'
    FROM dbo.pago p JOIN V ON V.idCita = p.idCita;

    UPDATE c SET estatusCita = N'CanceladaFaltaPago'
    FROM dbo.cita c JOIN V ON V.idCita = c.idCita;

    INSERT dbo.bitacoraEstatusCita(idCita, estatusCita)
    SELECT idCita, N'CanceladaFaltaPago' FROM V;

    COMMIT;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    THROW;
  END CATCH
END
GO
