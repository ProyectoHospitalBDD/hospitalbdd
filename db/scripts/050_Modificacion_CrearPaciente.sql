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
    IF @telPersonal IS NULL OR LTRIM(RTRIM(@telPersonal)) = ''
BEGIN
    RAISERROR('El teléfono personal es obligatorio', 16, 1);
    RETURN;
END

    IF EXISTS (SELECT 1 FROM contacto WHERE correoPersonal = @correoPersonal)
    BEGIN
        RAISERROR('El correo ya está registrado', 16, 1);
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM usuarioSistema WHERE curp = @curp)
    BEGIN
        RAISERROR('La CURP ya está registrada', 16, 1);
        RETURN;
    END

    INSERT INTO contacto (correoPersonal, telPersonal, telCasa)  
    VALUES (
        @correoPersonal,
        @telPersonal,
        NULLIF(@telCasa, '')
    );  

    DECLARE @idContacto INT = CAST(SCOPE_IDENTITY() AS INT);  

    INSERT INTO usuarioSistema  
    (  
        tipoUsuario,  
        nombre,  
        apPat,  
        apMat,  
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

    SELECT CAST(SCOPE_IDENTITY() AS INT) AS IdUsuario;  
END;
