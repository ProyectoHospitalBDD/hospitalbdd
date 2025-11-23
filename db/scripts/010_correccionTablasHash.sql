USE hospitalBD;
GO

-- passwordHash
IF COL_LENGTH('dbo.usuarioSistema', 'passwordHash') IS NULL
BEGIN
    ALTER TABLE dbo.usuarioSistema
    ADD passwordHash VARBINARY(64) NULL;   -- 64 bytes suele ser suficiente para PBKDF2-SHA256
END
GO

-- passwordSalt
IF COL_LENGTH('dbo.usuarioSistema', 'passwordSalt') IS NULL
BEGIN
    ALTER TABLE dbo.usuarioSistema
    ADD passwordSalt VARBINARY(32) NULL;   
END
GO

-- passwordIterations
IF COL_LENGTH('dbo.usuarioSistema', 'passwordIterations') IS NULL
BEGIN
    ALTER TABLE dbo.usuarioSistema
    ADD passwordIterations INT NOT NULL
        CONSTRAINT DF_usuarioSistema_passwordIterations DEFAULT(100000); -- mismo valor para todos
END
GO
