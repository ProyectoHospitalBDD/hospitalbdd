--use hospitalBD

GO

/*
 * NOMBRE DEL PROCEDIMIENTO ALMACENADO:       dbo.sp_CrearReceta
 * TIPO:         Procedimiento Almacenado (Inserción)
 *
 * DESCRIPCIÓN:
 * Crea una nueva receta médica con medicamentos y servicios asociados.
 * El ID de la receta se genera automáticamente.
 *
 * CARACTERÍSTICAS:
 * - Parámetros: idCita, fechaReceta, diagnostico, observaciones, tablas de medicamentos y servicios.
 * - Tablas:     Inserta en [dbo.receta], [dbo.recetaMedicamento], [dbo.recetaServicio].
 * - Seguridad:  Manejo de transacciones implícito.
 *
 * ALGORITMO:
 * 1. Inserta la receta y obtiene el ID generado.
 * 2. Inserta los medicamentos asociados.
 * 3. Inserta los servicios asociados.
 * 4. Retorna el ID de la receta generada.
 */

 --Primero ejecutar estas dos create Type y luego el crear el procedimiento

-- Crear tipos de tabla para parámetros
CREATE TYPE dbo.MedicamentoRecetaType AS TABLE (
    idMedicamento INT,
    indicaciones NVARCHAR(300),
    cantidad INT
);

CREATE TYPE dbo.ServicioRecetaType AS TABLE (
    idServicio INT,
    indicaciones NVARCHAR(300)
);

-- Procedimiento para crear receta
CREATE PROCEDURE dbo.sp_CrearReceta
    @idCita INT,
    @fechaReceta DATE,
    @diagnostico NVARCHAR(500),
    @observaciones NVARCHAR(500),
    @medicamentos dbo.MedicamentoRecetaType READONLY,
    @servicios dbo.ServicioRecetaType READONLY
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @idReceta INT;

    -- Insertar receta
    INSERT INTO dbo.receta (idCita, fechaReceta, diagnostico, observaciones)
    VALUES (@idCita, @fechaReceta, @diagnostico, @observaciones);

    -- Obtener el ID generado
    SET @idReceta = SCOPE_IDENTITY();

    -- Insertar medicamentos
    INSERT INTO dbo.recetaMedicamento (idReceta, idMedicamento, indicaciones, cantidad)
    SELECT @idReceta, idMedicamento, indicaciones, cantidad
    FROM @medicamentos;

    -- Insertar servicios
    INSERT INTO dbo.recetaServicio (idReceta, idServicio, indicaciones)
    SELECT @idReceta, idServicio, indicaciones
    FROM @servicios;

    -- Retornar el ID de la receta generada
    SELECT @idReceta AS idRecetaGenerado;
END
GO
