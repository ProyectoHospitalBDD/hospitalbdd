use hospitalBD

CREATE OR ALTER PROCEDURE dbo.sp_Empleado_Listar
  @tipoUsuario NVARCHAR(30) = NULL,
  @estatus BIT = NULL,
  @texto NVARCHAR(100) = NULL
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @q NVARCHAR(100) = NULLIF(LTRIM(RTRIM(@texto)), N'');

  SELECT
    u.idUsuario,
    u.tipoUsuario,
    u.nombre,
    u.apPat,
    u.apMat,
    u.curp,
    c.correoPersonal,
    c.telPersonal,
    c.telCasa,
    e.estatus,
    e.salario,

   
    d.cedula,
    d.idEspecialidad,
    d.idConsultorio
  FROM dbo.usuarioSistema u
  INNER JOIN dbo.empleado e ON e.idUsuario = u.idUsuario
  LEFT  JOIN dbo.contacto c ON c.idContacto = u.idContacto
  LEFT  JOIN dbo.doctor d ON d.idUsuario = u.idUsuario
  WHERE
    (@tipoUsuario IS NULL OR u.tipoUsuario = @tipoUsuario)
    AND (@estatus IS NULL OR e.estatus = @estatus)
    AND (
      @q IS NULL OR
      (u.nombre + N' ' + u.apPat + N' ' + ISNULL(u.apMat,N'')) LIKE N'%' + @q + N'%' OR
      u.curp LIKE N'%' + @q + N'%' OR
      ISNULL(c.correoPersonal,N'') LIKE N'%' + @q + N'%'
    )
  ORDER BY u.tipoUsuario, u.apPat, u.apMat, u.nombre;
END
GO





CREATE OR ALTER PROCEDURE dbo.sp_Empleado_CambiarEstatus
  @idUsuario INT,
  @estatus BIT
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;

  IF NOT EXISTS (SELECT 1 FROM dbo.empleado WHERE idUsuario = @idUsuario)
    THROW 52001, 'EmpleadoNoExiste', 1;

  DECLARE @tipo NVARCHAR(30);
  SELECT @tipo = tipoUsuario
  FROM dbo.usuarioSistema
  WHERE idUsuario = @idUsuario;

  IF @tipo IS NULL
    THROW 52002, 'UsuarioNoExiste', 1;

  -- Si vamos a desactivar y es Doctor: validar citas futuras asignadas
  IF (@estatus = 0 AND @tipo = N'Doctor')
  BEGIN
    DECLARE @ahora DATETIME2 = SYSUTCDATETIME();

    IF EXISTS (
      SELECT 1
      FROM dbo.cita
      WHERE idDoctor = @idUsuario
        AND fechaHoraInicio >= @ahora
        AND estatusCita IN (
          N'AgendadaPendPago',
          N'PagadaPendAtender',
          N'CancelacionSolicitadaDoctor'

        )
    )
      THROW 52010, 'DoctorConCitasAsignadas', 1;
  END

  BEGIN TRY
    BEGIN TRAN;

    UPDATE dbo.empleado
      SET estatus = @estatus
    WHERE idUsuario = @idUsuario;

    COMMIT;
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    THROW;
  END CATCH
END
GO
