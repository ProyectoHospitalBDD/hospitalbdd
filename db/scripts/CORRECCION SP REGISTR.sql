USE hospitalBD;
GO

CREATE OR ALTER PROCEDURE dbo.sp_Paciente_Crear  
    @tipoUsuario NVARCHAR(20),  
    @nombres NVARCHAR(100),  
    @apPat NVARCHAR(100),  
    @apMat NVARCHAR(100),  
    @curp NVARCHAR(18),  
    @correoPersonal NVARCHAR(150),  
    @telPersonal NVARCHAR(20),    
    @telCasa NVARCHAR(20) = NULL,  
    @passwordHash VARBINARY(MAX),  
    @passwordSalt VARBINARY(MAX),  
    @passwordIteraciones INT  
AS  
BEGIN  
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRAN;

        -- Validaciones rápidas
        IF @telPersonal IS NULL OR LTRIM(RTRIM(@telPersonal)) = ''
            THROW 51000, 'El teléfono personal es obligatorio', 1;

        IF EXISTS (SELECT 1 FROM dbo.contacto WHERE correoPersonal = @correoPersonal)
            THROW 51001, 'El correo ya está registrado', 1;

        IF EXISTS (SELECT 1 FROM dbo.usuarioSistema WHERE curp = @curp)
            THROW 51002, 'La CURP ya está registrada', 1;

        -- Inserta contacto
        INSERT INTO dbo.contacto (correoPersonal, telPersonal, telCasa)  
        VALUES (
            @correoPersonal,
            @telPersonal,
            NULLIF(LTRIM(RTRIM(@telCasa)), '')
        );  

        DECLARE @idContacto INT = CAST(SCOPE_IDENTITY() AS INT);  

        -- Inserta usuarioSistema
        INSERT INTO dbo.usuarioSistema  
        (  
            tipoUsuario, nombre, apPat, apMat, curp,
            passwordHash, passwordSalt, passwordIteraciones,
            idContacto  
        )  
        VALUES  
        (  
            @tipoUsuario, @nombres, @apPat, @apMat, @curp,
            @passwordHash, @passwordSalt, @passwordIteraciones,
            @idContacto  
        );  

        DECLARE @idUsuario INT = CAST(SCOPE_IDENTITY() AS INT);

        -- ***ESTO ERA LO QUE TE FALTABA***
        INSERT INTO dbo.paciente (idUsuario)
        VALUES (@idUsuario);

        COMMIT;

        SELECT @idUsuario AS IdUsuario;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        THROW; -- re-lanza el error tal cual
    END CATCH
END;
GO
