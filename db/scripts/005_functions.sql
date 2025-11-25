USE hospitalBD;
GO
-- ¿Traslape con otra cita del doctor?
CREATE OR ALTER FUNCTION dbo.fnCitaSeTraslapa
(
  @DoctorId INT,
  @Inicio   DATETIME2,
  @Fin      DATETIME2
)
RETURNS BIT
AS
BEGIN
  DECLARE @ret BIT = 0;

  IF EXISTS(
      SELECT 1
      FROM dbo.cita c
      WHERE c.idDoctor = @DoctorId
        AND c.estatusCita IN (N'AgendadaPendPago', N'PagadaPendAtender')
        AND c.fechaHoraFin  > @Inicio
        AND c.fechaHoraInicio < @Fin
  )
    SET @ret = 1;

  RETURN @ret;
END
GO

-- ¿Cae dentro del horario del doctor?
CREATE OR ALTER FUNCTION dbo.fnDentroHorarioDoctor
(
  @DoctorId INT,
  @Inicio   DATETIME2,
  @Fin      DATETIME2
)
RETURNS BIT
AS
BEGIN
  DECLARE @ret BIT;

  ;WITH D AS(
    SELECT 
      FORMAT(@Inicio, 'dddd', 'es-ES') AS diaInicio,
      CAST(@Inicio AS TIME) AS horaIni,
      FORMAT(@Fin,    'dddd', 'es-ES') AS diaFin,
      CAST(@Fin    AS TIME) AS horaFin
  )
  SELECT @ret =
    CASE WHEN EXISTS(
      SELECT 1
      FROM D
      JOIN dbo.doctor tmp ON tmp.idUsuario = @DoctorId
      JOIN dbo.horarioEmpleado h ON h.idUsuario = tmp.idUsuario
      WHERE (h.diaSemana = D.diaInicio COLLATE Modern_Spanish_CI_AS)
        AND (h.diaSemana = D.diaFin    COLLATE Modern_Spanish_CI_AS)
        AND D.horaIni >= h.horaInicio
        AND D.horaFin <= h.horaFin
    ) THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END;

  RETURN @ret;
END
GO


-- ¿Paciente ya tiene pendiente con el mismo doctor?
CREATE OR ALTER FUNCTION dbo.fnPacienteTienePendiente
(
  @PacienteId INT,
  @DoctorId   INT
)
RETURNS BIT
AS
BEGIN
  RETURN
  (
    SELECT CASE WHEN EXISTS(
      SELECT 1 FROM dbo.cita c
      WHERE c.idPaciente = @PacienteId
        AND c.idDoctor   = @DoctorId
        AND c.estatusCita IN (N'AgendadaPendPago', N'PagadaPendAtender')
    ) THEN 1 ELSE 0 END
  );
END
GO

-- % de devolución por política de cancelación
CREATE OR ALTER FUNCTION dbo.fnPorcentajeDevolucion
(
  @Ahora DATETIME2,
  @FechaCita DATETIME2
)
RETURNS DECIMAL(4,2)
AS
BEGIN
  DECLARE @hrs INT = DATEDIFF(HOUR, @Ahora, @FechaCita);
  RETURN CASE WHEN @hrs >= 48 THEN 1.00
              WHEN @hrs >= 24 THEN 0.50
              ELSE 0.00 END;
END
GO
