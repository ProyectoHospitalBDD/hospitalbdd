
use hospitalBD
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
      WHERE (h.diaSemana = D.diaInicio COLLATE Modern_Spanish_CI_AI)
        AND (h.diaSemana = D.diaFin    COLLATE Modern_Spanish_CI_AI)
        AND D.horaIni >= h.horaInicio
        AND D.horaFin <= h.horaFin
    ) 
    THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END;

  RETURN @ret;
END
GO
