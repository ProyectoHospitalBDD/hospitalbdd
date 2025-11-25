USE hospitalBD;
GO

-- 1. OBTENER LAS 2 ENFERMERAS PARA ASIGNARLES EL TRABAJO
-- Buscamos las primeras 2 enfermeras disponibles en la base de datos
DECLARE @idEnfermera1 INT = (SELECT TOP 1 idUsuario FROM dbo.enfermera ORDER BY idUsuario ASC);
DECLARE @idEnfermera2 INT = (SELECT TOP 1 idUsuario FROM dbo.enfermera ORDER BY idUsuario DESC);

-- Validación de seguridad: Si por alguna razón no hay enfermeras, detenemos el script (o creamos dummy)
IF @idEnfermera1 IS NULL
BEGIN
    PRINT 'No se encontraron enfermeras. Por favor crea primero las enfermeras (Swagger o Script anterior).';
    -- Para que el script no falle, usamos NULL, pero lo ideal es tener enfermeras.
    SET @idEnfermera1 = NULL; 
    SET @idEnfermera2 = NULL;
END

-- Asegurarnos de que sean diferentes (si solo hay 1 enfermera, usamos la misma para todo)
IF @idEnfermera1 = @idEnfermera2
    PRINT 'ℹSolo se encontró 1 enfermera. Se le asignarán todos los servicios.';

-----------------------------------------------------------------------------------
-- 2. LIMPIEZA DE LA TABLA SERVICIOS
-----------------------------------------------------------------------------------
-- Borramos datos previos para evitar duplicados y reiniciar el contador ID a 1
DELETE FROM dbo.servicio;
DBCC CHECKIDENT ('dbo.servicio', RESEED, 0);

PRINT 'Tabla de servicios limpiada.';

-- 3. INSERTAR 10 SERVICIOS (Repartidos entre las 2 enfermeras)
-- === ASIGNADOS A ENFERMERA 1 ===

-- 1. Inyección (Básico)
INSERT INTO dbo.servicio (descripcion, tipo, precio, stock, idEnfermera)
VALUES (N'Inyección Intramuscular', N'Aplicación', 50.00, NULL, @idEnfermera1);

-- 2. Curación (Material)
INSERT INTO dbo.servicio (descripcion, tipo, precio, stock, idEnfermera)
VALUES (N'Curación de Herida Menor', N'Curación', 250.00, 50, @idEnfermera1);

-- 3. Signos Vitales (Monitoreo)
INSERT INTO dbo.servicio (descripcion, tipo, precio, stock, idEnfermera)
VALUES (N'Toma de Presión Arterial', N'Monitoreo', 30.00, NULL, @idEnfermera1);

-- 4. Nebulización (Tratamiento)
INSERT INTO dbo.servicio (descripcion, tipo, precio, stock, idEnfermera)
VALUES (N'Nebulización (Sesión 20 min)', N'Tratamiento', 150.00, NULL, @idEnfermera1);

-- 5. Retiro de Puntos (Procedimiento)
INSERT INTO dbo.servicio (descripcion, tipo, precio, stock, idEnfermera)
VALUES (N'Retiro de Puntos/Suturas', N'Procedimiento', 200.00, 20, @idEnfermera1);


-- === ASIGNADOS A ENFERMERA 2 ===

-- 6. Suero (Procedimiento con insumo)
INSERT INTO dbo.servicio (descripcion, tipo, precio, stock, idEnfermera)
VALUES (N'Colocación de Venoclisis (Suero)', N'Procedimiento', 350.00, 30, @idEnfermera2);

-- 7. Prueba Rápida (Laboratorio)
INSERT INTO dbo.servicio (descripcion, tipo, precio, stock, idEnfermera)
VALUES (N'Prueba de Glucosa Capilar', N'Laboratorio', 80.00, 100, @idEnfermera2);

-- 8. Lavado de Oído (Higiene/Curación)
INSERT INTO dbo.servicio (descripcion, tipo, precio, stock, idEnfermera)
VALUES (N'Lavado Ótico (Oído)', N'Curación', 300.00, 15, @idEnfermera2);

-- 9. Electro (Estudio simple)
INSERT INTO dbo.servicio (descripcion, tipo, precio, stock, idEnfermera)
VALUES (N'Electrocardiograma Simple', N'Estudio', 600.00, NULL, @idEnfermera2);

-- 10. Vacuna (Preventivo)
INSERT INTO dbo.servicio (descripcion, tipo, precio, stock, idEnfermera)
VALUES (N'Aplicación de Vacuna Tétanos', N'Vacunación', 120.00, 10, @idEnfermera2);


-----------------------------------------------------------------------------------
-- 4. VALIDACIÓN FINAL
-----------------------------------------------------------------------------------
SELECT idServicio, descripcion, tipo, precio, idEnfermera FROM dbo.servicio;