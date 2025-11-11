USE hospitalBD;
-- 1) Columnas / tablas necesarias

IF COL_LENGTH('dbo.pago','montoDevuelto') IS NULL
BEGIN
    ALTER TABLE dbo.pago 
    ADD montoDevuelto MONEY NULL 
        CONSTRAINT DF_pagoMontoDevuelto DEFAULT(0);
END
GO

IF OBJECT_ID('dbo.bitacoraEstatusCita','U') IS NULL
BEGIN
  CREATE TABLE dbo.bitacoraEstatusCita(
    idBitacora INT IDENTITY(1,1) PRIMARY KEY,
    idCita     INT NOT NULL,
    estatusCita NVARCHAR(25) NOT NULL,
    fechaMov   DATETIME2 NOT NULL CONSTRAINT DF_Bitacora_fechaMov DEFAULT (SYSUTCDATETIME()),
    fechaCitaInicio DATETIME2 NULL,
    fechaCitaFin    DATETIME2 NULL,
    idPaciente INT NULL,
    idDoctor  INT NULL,
    costo MONEY NULL,
    politica NVARCHAR(50) NULL,
    montoDevuelto MONEY NULL
  );

  CREATE INDEX IX_Bitacora_Cita 
    ON dbo.bitacoraEstatusCita(idCita, fechaMov DESC);
END
GO

-- 2) Duración + columna calculada de fin

IF COL_LENGTH('dbo.cita','duracionMin') IS NULL
BEGIN
  ALTER TABLE dbo.cita 
    ADD duracionMin INT NOT NULL 
      CONSTRAINT DF_cita_duracion DEFAULT(30);
END
GO

IF COL_LENGTH('dbo.cita','fechaHoraFin') IS NULL
BEGIN
  ALTER TABLE dbo.cita
    ADD fechaHoraFin AS DATEADD(MINUTE, duracionMin, fechaHoraInicio) PERSISTED;
END
GO

-- 3) Duraciones permitidas (30,60,90)

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name='CK_Cita_Duracion_30_60_90')
BEGIN
  ALTER TABLE dbo.cita WITH CHECK
  ADD CONSTRAINT CK_Cita_Duracion_30_60_90
  CHECK (duracionMin IN (30,60,90));
END
GO
