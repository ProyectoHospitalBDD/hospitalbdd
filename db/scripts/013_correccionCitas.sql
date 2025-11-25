use hospitalBD;
GO
--Correccion Pagar Cita

CREATE OR ALTER PROCEDURE dbo.sp_Cita_Pagar
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
          fechaPago   = CAST(@ahora AS DATE),
          horaPago    = CAST(@ahora AS TIME)
    WHERE idCita = @idCita;

    UPDATE dbo.cita
      SET estatusCita = N'PagadaPendAtender'
    WHERE idCita = @idCita;

    COMMIT;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    THROW;
  END CATCH
END
GO


--Correcion Cancelar Paciente

USE hospitalBD;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Cita_Cancelar_Paciente
  @idCita INT
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;

  DECLARE @ahora   DATETIME2 = SYSUTCDATETIME();
  DECLARE @ini     DATETIME2;
  DECLARE @estatus NVARCHAR(25);
  DECLARE @monto   MONEY;

  SELECT @ini = fechaHoraInicio, 
         @estatus = estatusCita, 
         @monto = costo
  FROM dbo.cita 
  WHERE idCita = @idCita;

  IF @estatus NOT IN (N'AgendadaPendPago', N'PagadaPendAtender')
     THROW 51020, 'NoCancelable', 1;

  DECLARE @pct DECIMAL(4,2) = dbo.fnPorcentajeDevolucion(@ahora, @ini);
  DECLARE @dev MONEY = @monto * @pct;

  BEGIN TRY
    BEGIN TRAN;

    -- Actualizar pago
    UPDATE dbo.pago
      SET estatusPago = CASE 
                          WHEN estatusPago = N'Pendiente' THEN N'Cancelado' 
                          ELSE estatusPago 
                        END,
          montoDevuelto = @dev
    WHERE idCita = @idCita;

    -- Actualizar cita (esto dispara el trigger y crea la fila en bitácora)
    UPDATE dbo.cita
      SET estatusCita = N'CanceladaPaciente'
    WHERE idCita = @idCita;

    -- Actualizar política y montoDevuelto en la ÚLTIMA fila CanceladaPaciente
    ;WITH UltimaBitacora AS (
      SELECT TOP (1) *
      FROM dbo.bitacoraEstatusCita
      WHERE idCita = @idCita
        AND estatusCita = N'CanceladaPaciente'
      ORDER BY fechaMov DESC
    )
    UPDATE b
      SET b.politica = CASE 
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


-- Correccion Cancelar por doctor  
USE hospitalBD;
GO
CREATE OR ALTER PROCEDURE dbo.sp_Cita_Cancelar_Doctor  
  @idCita INT  
AS  
BEGIN  
    SET NOCOUNT ON;  
    SET XACT_ABORT ON;  
  
    DECLARE @estatus NVARCHAR(25), @monto MONEY;  
  
    SELECT @estatus = estatusCita,  
           @monto = costo  
    FROM dbo.cita  
    WHERE idCita = @idCita;  
  
    IF @estatus NOT IN (N'AgendadaPendPago', N'PagadaPendAtender')  
       THROW 51030, 'NoCancelable', 1;  
  
    BEGIN TRY  
        BEGIN TRAN;  
  
        -- Cancelar pago y devolver el 100%
        UPDATE dbo.pago  
          SET estatusPago = CASE WHEN estatusPago = N'Pendiente' THEN N'Cancelado' ELSE estatusPago END,  
              montoDevuelto = @monto  
        WHERE idCita = @idCita;  
  
        -- Actualizar estatus de cita
        UPDATE dbo.cita  
            SET estatusCita = N'CanceladaDoctor'  
        WHERE idCita = @idCita;  
  
        -- Ajustar la ÚLTIMA fila en bitácora (la que dejó el trigger)
        UPDATE b
        SET b.politica = N'100% por doctor',
            b.montoDevuelto = @monto
        FROM (
            SELECT TOP (1) * 
            FROM dbo.bitacoraEstatusCita
            WHERE idCita = @idCita
              AND estatusCita = N'CanceladaDoctor'
            ORDER BY fechaMov DESC
        ) b;
  
        COMMIT;  
    END TRY  
    BEGIN CATCH  
        IF @@TRANCOUNT > 0 ROLLBACK;  
        THROW;  
    END CATCH  
END  
GO


