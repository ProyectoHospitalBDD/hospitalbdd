use hospitalBD
select * from usuarioSistema

EXEC sp_rename 'dbo.usuarioSistema.passwordIterations', 'PasswordIteraciones', 'COLUMN';

ALTER TABLE dbo.usuarioSistema
DROP COLUMN contrasena;

--Borrar el campo contraseña de la clase y de hospitalContext.cs

