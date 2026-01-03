USE hospitalBD;
GO

/* =========================================================
   1) TABLA BITÁCORA HISTORIAL CITAS MÉDICO–PACIENTE
   ========================================================= */
CREATE TABLE dbo.bitacoraHistorialCitaMP
(
    idBitacora       INT IDENTITY(1,1) PRIMARY KEY,
    fechaMovimiento  DATETIME2 NOT NULL CONSTRAINT DF_BitHist_fechaMov DEFAULT SYSUTCDATETIME(),

    -- Quién hizo el movimiento (ideal: nombre completo del médico; si no, cae a session/user)
    usuarioMov       NVARCHAR(200) NOT NULL,

    -- Datos de la cita/relaciones
    idCita           INT NOT NULL,
    fechaCita        DATE NOT NULL,
    horaCita         TIME(0) NOT NULL,
    idPaciente       INT NOT NULL,
    idDoctor         INT NOT NULL,
    idReceta         INT NULL,

    estatusConsulta  NVARCHAR(20) NOT NULL
        CONSTRAINT CK_BitHist_estatus CHECK (estatusConsulta IN (N'Atendida', N'NoAsistio')),

    
    especialidad     NVARCHAR(100) NOT NULL,
    consultorio      NVARCHAR(50)  NOT NULL,
    nombrePaciente   NVARCHAR(200) NOT NULL,
    nombreDoctor     NVARCHAR(200) NOT NULL,

    diagnostico      NVARCHAR(500) NULL
);

-- FKs (para integridad; si prefieres no bloquear por borrados, puedes quitarlas)
ALTER TABLE dbo.bitacoraHistorialCitaMP
ADD CONSTRAINT FK_BitHist_Cita FOREIGN KEY (idCita) REFERENCES dbo.cita(idCita),
    CONSTRAINT FK_BitHist_Paciente FOREIGN KEY (idPaciente) REFERENCES dbo.paciente(idUsuario),
    CONSTRAINT FK_BitHist_Doctor FOREIGN KEY (idDoctor) REFERENCES dbo.doctor(idUsuario);
GO

-- Índices típicos (consultas por paciente / por doctor / por fecha)
CREATE INDEX IX_BitHist_Paciente_Fecha
ON dbo.bitacoraHistorialCitaMP (idPaciente, fechaCita DESC, horaCita DESC);

CREATE INDEX IX_BitHist_Doctor_Fecha
ON dbo.bitacoraHistorialCitaMP (idDoctor, fechaCita DESC, horaCita DESC);
GO


/* =========================================================
   2) TRIGGER INSERT: al crear RECETA => log Atendida
   ========================================================= */
CREATE OR ALTER TRIGGER dbo.tr_Receta_BitacoraHistorial_INS
ON dbo.receta
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    /*
      Nota importante:
      - Usuario: idealmente tu API debe setear SESSION_CONTEXT('UsuarioNombre')
        con el nombre del médico que está emitiendo la receta.
      - Si no existe, usamos SUSER_SNAME().
    */

    INSERT INTO dbo.bitacoraHistorialCitaMP
    (
        usuarioMov,
        idCita, fechaCita, horaCita,
        idPaciente, idDoctor, idReceta,
        estatusConsulta,
        especialidad, consultorio,
        nombrePaciente, nombreDoctor,
        diagnostico
    )
    SELECT
        COALESCE(
            TRY_CAST(SESSION_CONTEXT(N'UsuarioNombre') AS NVARCHAR(200)),
            SUSER_SNAME()
        ) AS usuarioMov,

        c.idCita,
        CAST(c.fechaHoraInicio AS DATE) AS fechaCita,
        CAST(c.fechaHoraInicio AS TIME(0)) AS horaCita,

        c.idPaciente,
        c.idDoctor,
        i.idReceta,

        N'Atendida' AS estatusConsulta,

        e.nombreEsp AS especialidad,
        CONCAT(N'Edif ', ed.idEdificio, N' - Cons ', co.numero) AS consultorio,

        CONCAT(pus.nombre, N' ', pus.apPat, N' ', COALESCE(pus.apMat, N'')) AS nombrePaciente,
        CONCAT(dus.nombre, N' ', dus.apPat, N' ', COALESCE(dus.apMat, N'')) AS nombreDoctor,

        i.diagnostico
    FROM inserted i
    INNER JOIN dbo.cita c ON c.idCita = i.idCita
    INNER JOIN dbo.doctor d ON d.idUsuario = c.idDoctor
    INNER JOIN dbo.especialidad e ON e.idEspecialidad = d.idEspecialidad
    INNER JOIN dbo.consultorio co ON co.idConsultorio = d.idConsultorio
    INNER JOIN dbo.edificio ed ON ed.idEdificio = co.idEdificio
    INNER JOIN dbo.usuarioSistema pus ON pus.idUsuario = c.idPaciente
    INNER JOIN dbo.usuarioSistema dus ON dus.idUsuario = c.idDoctor;
END;
GO


/* =========================================================
   3) TRIGGER UPDATE: si la CITA cambia a NoAcudio => log NoAsistio
   ========================================================= */
CREATE OR ALTER TRIGGER dbo.tr_Cita_BitacoraHistorial_UPD
ON dbo.cita
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT UPDATE(estatusCita)
        RETURN;

    -- Insertamos solo cuando el cambio efectivo llega a NoAcudio
    INSERT INTO dbo.bitacoraHistorialCitaMP
    (
        usuarioMov,
        idCita, fechaCita, horaCita,
        idPaciente, idDoctor, idReceta,
        estatusConsulta,
        especialidad, consultorio,
        nombrePaciente, nombreDoctor,
        diagnostico
    )
    SELECT
        COALESCE(
            TRY_CAST(SESSION_CONTEXT(N'UsuarioNombre') AS NVARCHAR(200)),
            SUSER_SNAME()
        ) AS usuarioMov,
        i.idCita,
        CAST(i.fechaHoraInicio AS DATE) AS fechaCita,
        CAST(i.fechaHoraInicio AS TIME(0)) AS horaCita,

        i.idPaciente,
        i.idDoctor,
        r.idReceta, -- normalmente NULL si no acudió, pero por si tu flujo lo permite

        N'NoAsistio' AS estatusConsulta,

        e.nombreEsp AS especialidad,
        CONCAT(N'Edif ', ed.idEdificio, N' - Cons ', co.numero) AS consultorio,

        CONCAT(pus.nombre, N' ', pus.apPat, N' ', COALESCE(pus.apMat, N'')) AS nombrePaciente,
        CONCAT(dus.nombre, N' ', dus.apPat, N' ', COALESCE(dus.apMat, N'')) AS nombreDoctor,

        NULL AS diagnostico
    FROM inserted i
    INNER JOIN deleted d0 ON d0.idCita = i.idCita
    INNER JOIN dbo.doctor doc ON doc.idUsuario = i.idDoctor
    INNER JOIN dbo.especialidad e ON e.idEspecialidad = doc.idEspecialidad
    INNER JOIN dbo.consultorio co ON co.idConsultorio = doc.idConsultorio
    INNER JOIN dbo.edificio ed ON ed.idEdificio = co.idEdificio
    INNER JOIN dbo.usuarioSistema pus ON pus.idUsuario = i.idPaciente
    INNER JOIN dbo.usuarioSistema dus ON dus.idUsuario = i.idDoctor
    LEFT JOIN dbo.receta r ON r.idCita = i.idCita
    WHERE d0.estatusCita <> i.estatusCita
      AND i.estatusCita = N'NoAcudio'
      -- evita duplicar por si hacen updates repetidos a NoAcudio
      AND NOT EXISTS
      (
        SELECT 1
        FROM dbo.bitacoraHistorialCitaMP b
        WHERE b.idCita = i.idCita AND b.estatusConsulta = N'NoAsistio'
      );
END;
GO


/* =========================================================
   5) VISTA para consumo en API (lo que pide el profe)
   ========================================================= */
CREATE OR ALTER VIEW dbo.vw_BitacoraHistorialCitaMP
AS
SELECT
    b.idBitacora,
    b.fechaMovimiento,
    b.usuarioMov,
    b.especialidad,
    b.nombrePaciente,
    b.diagnostico,
    b.consultorio,
    b.idPaciente,
    b.idDoctor,
    b.idCita,
    b.idReceta,
    b.estatusConsulta,
    b.fechaCita,
    b.horaCita
FROM dbo.bitacoraHistorialCitaMP b;
GO


/* =========================================================
   6) SP: “pasando el id_paciente” (y opcional filtrar por doctor)
   ========================================================= */
CREATE OR ALTER PROCEDURE dbo.sp_Doctor_BitacoraHistorialPorPaciente
    @IdPaciente INT,
    @IdDoctor   INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        idBitacora,
        fechaMovimiento,
        usuarioMov AS usuario,
        especialidad,
        nombrePaciente,
        diagnostico,
        consultorio,
        estatusConsulta,
        idCita AS folio_cita,
        fechaCita,
        horaCita,
        idReceta AS folio_receta,
        idDoctor
    FROM dbo.vw_BitacoraHistorialCitaMP
    WHERE idPaciente = @IdPaciente
      AND (@IdDoctor IS NULL OR idDoctor = @IdDoctor)
    ORDER BY fechaMovimiento DESC, idBitacora DESC;
END;
GO

