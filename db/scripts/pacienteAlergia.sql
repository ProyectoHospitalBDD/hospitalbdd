USE hospitalBD;
GO
SELECT* FROM especialidad
-- 1. LLENAR CATÁLOGO DE ALERGIAS Y PADECIMIENTOS (Si no existen)
-- Usamos una tabla temporal para meter los datos primero y luego insertarlos si faltan
DECLARE @Catalogo TABLE (nombre NVARCHAR(200), tipo NVARCHAR(15));

INSERT INTO @Catalogo (nombre, tipo) VALUES
(N'Polen', N'Alergia'),
(N'Penicilina', N'Alergia'),
(N'Polvo', N'Alergia'),
(N'Mariscos', N'Alergia'),
(N'Ibuprofeno', N'Alergia'),
(N'Diabetes Tipo 2', N'Padecimiento'),
(N'Hipertensión Arterial', N'Padecimiento'),
(N'Asma Bronquial', N'Padecimiento'),
(N'Gastritis Crónica', N'Padecimiento'),
(N'Migraña', N'Padecimiento');

-- Insertar solo los que no existan (para evitar duplicados por nombre)
INSERT INTO dbo.alergiaPadecimiento (nombre, tipo)
SELECT c.nombre, c.tipo
FROM @Catalogo c
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.alergiaPadecimiento ap 
    WHERE ap.nombre = c.nombre AND ap.tipo = c.tipo
);

-----------------------------------------------------------------------------------
-- 2. ASIGNAR ALERGIAS A LOS PACIENTES EXISTENTES
-----------------------------------------------------------------------------------
-- Buscamos los IDs de tus pacientes (Juan y Luis, o los que tengas)
-- Nota: Usamos TOP 2 para agarrar a un hombre y una mujer (o los primeros 2 que haya)

DECLARE @idPaciente1 INT, @idPaciente2 INT;

-- Intentamos buscar por nombre si sabemos cuáles son (del Seed anterior)
SELECT @idPaciente1 = idUsuario FROM dbo.usuarioSistema WHERE nombre = 'Jorge' AND tipoUsuario = 'Paciente';
SELECT @idPaciente2 = idUsuario FROM dbo.usuarioSistema WHERE nombre = 'Carla' AND tipoUsuario = 'Paciente';

-- Si no los encuentra por nombre (porque usaste otros seeds), agarramos los primeros 2 pacientes reales
IF @idPaciente1 IS NULL 
    SELECT TOP 1 @idPaciente1 = idUsuario FROM dbo.paciente ORDER BY idUsuario ASC;

IF @idPaciente2 IS NULL 
    SELECT TOP 1 @idPaciente2 = idUsuario FROM dbo.paciente WHERE idUsuario <> @idPaciente1 ORDER BY idUsuario DESC;

-- Validación: Solo insertar si tenemos pacientes
IF @idPaciente1 IS NOT NULL AND @idPaciente2 IS NOT NULL
BEGIN
   -- 1. Alergia a Penicilina
    INSERT INTO dbo.pacienteAlergiaPadecimiento (idPaciente, idAlerPade, severidad, estado, reaccion, fechaInicio, observaciones)
    SELECT @idPaciente1, idAlerPade, N'Severa', N'Activo', N'Choque anafiláctico', '2010-05-20', N'Evitar cualquier derivado.'
    FROM dbo.alergiaPadecimiento WHERE nombre = 'Penicilina';

    -- 2. Diabetes
    INSERT INTO dbo.pacienteAlergiaPadecimiento (idPaciente, idAlerPade, severidad, estado, fechaInicio, observaciones)
    SELECT @idPaciente1, idAlerPade, N'Moderada', N'Activo', '2018-11-01', N'Controlado con Metformina.'
    FROM dbo.alergiaPadecimiento WHERE nombre = 'Diabetes Tipo 2';


    -- 1. Alergia al Polvo
    INSERT INTO dbo.pacienteAlergiaPadecimiento (idPaciente, idAlerPade, severidad, estado, reaccion, fechaInicio)
    SELECT @idPaciente2, idAlerPade, N'Leve', N'Activo', N'Estornudos y ojos rojos', '2015-03-10'
    FROM dbo.alergiaPadecimiento WHERE nombre = 'Polvo';

    -- 2. Asma
    INSERT INTO dbo.pacienteAlergiaPadecimiento (idPaciente, idAlerPade, severidad, estado, fechaInicio, observaciones)
    SELECT @idPaciente2, idAlerPade, N'Moderada', N'Latente', '2012-08-15', N'Usa inhalador en invierno.'
    FROM dbo.alergiaPadecimiento WHERE nombre = 'Asma Bronquial';
    
    PRINT 'Historial clínico asignado a los pacientes ' + CAST(@idPaciente1 AS VARCHAR) + ' y ' + CAST(@idPaciente2 AS VARCHAR);
END
ELSE
BEGIN
    PRINT 'No se encontraron suficientes pacientes para asignar historial.';
END
--Comprobación 
SELECT 
    u.nombre + ' ' + u.apPat AS Paciente,
    ap.nombre AS Padecimiento_Alergia,
    ap.tipo,
    pap.severidad,
    pap.estado
FROM dbo.pacienteAlergiaPadecimiento pap
JOIN dbo.usuarioSistema u ON pap.idPaciente = u.idUsuario
JOIN dbo.alergiaPadecimiento ap ON pap.idAlerPade = ap.idAlerPade;