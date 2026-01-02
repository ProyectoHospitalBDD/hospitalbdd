USE hospitalBD;
GO

DECLARE @IdUsuario INT = 85; -- << CAMBIA AQUÍ EL ID A BORRAR

BEGIN TRY
    BEGIN TRAN;

    /* =========================
       1. Tablas dependientes
       ========================= */

    -- Doctor (si aplica)
    DELETE FROM dbo.doctor
    WHERE idUsuario = @IdUsuario;

    -- Recepcionista
    DELETE FROM dbo.recepcionista
    WHERE idUsuario = @IdUsuario;

    -- Enfermera
    DELETE FROM dbo.enfermera
    WHERE idUsuario = @IdUsuario;

    -- Farmacéutico
    DELETE FROM dbo.farmaceutico
    WHERE idUsuario = @IdUsuario;

    /* =========================
       2. Empleado
       ========================= */
    DELETE FROM dbo.empleado
    WHERE idUsuario = @IdUsuario;

    /* =========================
       3. Usuario (login)
       ========================= */
    DELETE FROM dbo.usuarioSistema
    WHERE idUsuario = @IdUsuario;

    COMMIT;
    PRINT 'Usuario eliminado correctamente';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    THROW;
END CATCH;
GO