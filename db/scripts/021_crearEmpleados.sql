USE hospitalBD;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Empleado_Crear
  @TipoUsuario NVARCHAR(25),            -- 'Doctor' | 'Recepcionista' | 'Enfermera' | 'Farmaceutico'
  @Nombre     NVARCHAR(80),
  @ApPat      NVARCHAR(80),
  @ApMat      NVARCHAR(80),
  @Curp       NVARCHAR(18),

  @CorreoPersonal NVARCHAR(256),
  @TelPersonal    NVARCHAR(20) = NULL,
  @TelCasa        NVARCHAR(20) = NULL,

  @Salario MONEY,
  @Estatus BIT = 1,

  -- password (ya viene hasheado desde el API)
  @PasswordHash VARBINARY(64),
  @PasswordSalt VARBINARY(32),
  @PasswordIteraciones INT,

  -- solo Doctor
  @Cedula        NVARCHAR(20) = NULL,
  @IdEspecialidad INT = NULL,
  @IdConsultorio  INT = NULL
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;

  -- Validaciones básicas
  IF @TipoUsuario NOT IN (N'Doctor', N'Recepcionista', N'Enfermera', N'Farmaceutico')
    THROW 52001, 'TipoUsuarioInvalido', 1;

  IF @TipoUsuario = N'Doctor'
  BEGIN
    IF @Cedula IS NULL OR LTRIM(RTRIM(@Cedula)) = N'' THROW 52002, 'CedulaRequerida', 1;
    IF @IdEspecialidad IS NULL THROW 52003, 'EspecialidadRequerida', 1;
    IF @IdConsultorio  IS NULL THROW 52004, 'ConsultorioRequerido', 1;
  END

  IF EXISTS (SELECT 1 FROM dbo.contacto WHERE correoPersonal = @CorreoPersonal)
    THROW 52005, 'CorreoYaExiste', 1;

  IF EXISTS (SELECT 1 FROM dbo.usuarioSistema WHERE curp = @Curp)
    THROW 52006, 'CurpYaExiste', 1;

  IF @TipoUsuario = N'Doctor'
    IF EXISTS (SELECT 1 FROM dbo.doctor WHERE cedula = @Cedula)
      THROW 52007, 'CedulaYaExiste', 1;

  BEGIN TRY
    BEGIN TRAN;

    -- 1) Contacto
    INSERT dbo.contacto (correoPersonal, telCasa, telPersonal)
    VALUES (@CorreoPersonal, @TelCasa, @TelPersonal);

    DECLARE @IdContacto INT = SCOPE_IDENTITY();

    -- 2) Usuario
    INSERT dbo.usuarioSistema
      (nombre, apPat, apMat, tipoUsuario, curp,
       passwordHash, passwordSalt, passwordIteraciones,
       idContacto)
    VALUES
      (@Nombre, @ApPat, @ApMat, @TipoUsuario, @Curp,
       @PasswordHash, @PasswordSalt, @PasswordIteraciones,
       @IdContacto);

    DECLARE @IdUsuario INT = SCOPE_IDENTITY();

    -- 3) Empleado (salario/estatus)
    INSERT dbo.empleado (idUsuario, salario, estatus)
    VALUES (@IdUsuario, @Salario, @Estatus);

    -- 4) Tabla por rol
    IF @TipoUsuario = N'Doctor'
      INSERT dbo.doctor (idUsuario, cedula, idEspecialidad, idConsultorio)
      VALUES (@IdUsuario, @Cedula, @IdEspecialidad, @IdConsultorio);

    ELSE IF @TipoUsuario = N'Recepcionista'
      INSERT dbo.recepcionista (idUsuario) VALUES (@IdUsuario);

    ELSE IF @TipoUsuario = N'Enfermera'
      INSERT dbo.enfermera (idUsuario) VALUES (@IdUsuario);

    ELSE IF @TipoUsuario = N'Farmaceutico'
      INSERT dbo.farmaceutico (idUsuario) VALUES (@IdUsuario);

    COMMIT;

    SELECT @IdUsuario AS idUsuario;  -- salida para el API
  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK;
    THROW;
  END CATCH
END
GO
