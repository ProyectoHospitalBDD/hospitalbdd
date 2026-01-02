use hospitalBD

ALTER TABLE dbo.recepcionista
ADD CONSTRAINT DF_recepcionista_esAdmin DEFAULT (0) FOR esAdmin;
GO
