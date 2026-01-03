USE hospitalBD;
GO
CREATE PROCEDURE dbo.sp_Paciente_Crear
    @tipoUsuario NVARCHAR(20),
    @nombres NVARCHAR(100),
    @apPat NVARCHAR(100),
    @apMat NVARCHAR(100),
    @curp NVARCHAR(18),

    @correoPersonal NVARCHAR(150),
    @telPersonal NVARCHAR(20),
    @telCasa NVARCHAR(20),

    @passwordHash VARBINARY(MAX),
    @passwordSalt VARBINARY(MAX),
    @passwordIteraciones INT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO contactos (correoPersonal, telPersonal, telCasa)
    VALUES (@correoPersonal, @telPersonal, @telCasa);

    DECLARE @idContacto INT = SCOPE_IDENTITY();

    INSERT INTO usuarioSistemas
    (
        tipoUsuario,
        nombres,
        apellidoPaterno,
        apellidoMaterno,
        curp,
        passwordHash,
        passwordSalt,
        passwordIteraciones,
        idContacto
    )
    VALUES
    (
        @tipoUsuario,
        @nombres,
        @apPat,
        @apMat,
        @curp,
        @passwordHash,
        @passwordSalt,
        @passwordIteraciones,
        @idContacto
    );

    SELECT SCOPE_IDENTITY() AS IdUsuario;
END
