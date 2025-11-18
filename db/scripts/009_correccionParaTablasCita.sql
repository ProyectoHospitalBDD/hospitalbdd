USE hospitalBD;
GO

----------------------------------------------------
-- 1. Quitar constraint e índice que dependen de fechaHoraFin
----------------------------------------------------
IF OBJECT_ID('CK_Cita_RangoHora', 'C') IS NOT NULL
BEGIN
    ALTER TABLE dbo.cita DROP CONSTRAINT CK_Cita_RangoHora;
END
GO

IF EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_CitaDoctorFecha'
      AND object_id = OBJECT_ID('dbo.cita')
)
BEGIN
    DROP INDEX IX_CitaDoctorFecha ON dbo.cita;
END
GO

----------------------------------------------------
-- 2. Borrar la columna normal fechaHoraFin (si no es calculada)
----------------------------------------------------
IF EXISTS (
    SELECT 1
    FROM sys.columns
    WHERE object_id = OBJECT_ID('dbo.cita')
      AND name = 'fechaHoraFin'
      AND is_computed = 0
)
BEGIN
    ALTER TABLE dbo.cita DROP COLUMN fechaHoraFin;
END
GO

----------------------------------------------------
-- 3. Crear fechaHoraFin como columna calculada PERSISTED
----------------------------------------------------
IF NOT EXISTS (
    SELECT 1
    FROM sys.columns
    WHERE object_id = OBJECT_ID('dbo.cita')
      AND name = 'fechaHoraFin'
      AND is_computed = 1
)
BEGIN
    ALTER TABLE dbo.cita
    ADD fechaHoraFin AS DATEADD(MINUTE, duracionMin, fechaHoraInicio) PERSISTED;
END
GO

----------------------------------------------------
-- 4. Volver a crear el CHECK y el índice
----------------------------------------------------
IF OBJECT_ID('CK_Cita_RangoHora', 'C') IS NULL
BEGIN
    ALTER TABLE dbo.cita WITH NOCHECK
    ADD CONSTRAINT CK_Cita_RangoHora
        CHECK (fechaHoraFin > fechaHoraInicio);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_CitaDoctorFecha'
      AND object_id = OBJECT_ID('dbo.cita')
)
BEGIN
    CREATE INDEX IX_CitaDoctorFecha
      ON dbo.cita(idDoctor, fechaHoraInicio)
      INCLUDE (fechaHoraFin, estatusCita);
END
GO


--creamos otro paciente
INSERT INTO contacto (telCasa, telPersonal, correoPersonal)
VALUES (NULL, '5512345678', 'paciente2@gmail.com');

DECLARE @idContacto INT = SCOPE_IDENTITY();  -- guarda el id generado


INSERT INTO usuarioSistema
    (nombre, apPat, apMat, contrasena, tipoUsuario, curp, idContacto)
VALUES
    ('Luis', 'Pérez', NULL, '1234', 'Paciente', 'XEXX010101HNEXXXA9', @idContacto);

DECLARE @idUsuario INT = SCOPE_IDENTITY();  -- este será el usuario del paciente


INSERT INTO paciente (idUsuario)
VALUES (@idUsuario);

SELECT * FROM paciente ORDER BY idUsuario DESC;

--Comprobamos que funciona vencer citas

UPDATE pago
SET venceEn = DATEADD(HOUR, -1, SYSUTCDATETIME())
WHERE idCita = 5;

EXEC dbo.sp_Admin_VencerCitas;

SELECT estatusCita FROM cita WHERE idCita = 5;        -- debe ser 'CanceladaFaltaPago'
SELECT estatusPago FROM pago WHERE idCita = 5;        -- 'Cancelado'
SELECT * FROM bitacoraEstatusCita WHERE idCita = 5;   -- debe haber registro 'CanceladaFaltaPago'

