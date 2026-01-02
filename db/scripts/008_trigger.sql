USE hospitalBD;
Go
-- Bitácora automática de cambios de estatus
CREATE OR ALTER TRIGGER dbo.tr_CitaLogEstatus
ON dbo.cita
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;

  INSERT dbo.bitacoraEstatusCita(idCita, estatusCita, fechaCitaInicio, fechaCitaFin, idPaciente, idDoctor, costo)
  SELECT i.idCita, i.estatusCita, i.fechaHoraInicio, i.fechaHoraFin, i.idPaciente, i.idDoctor, i.costo
  FROM inserted i
  JOIN deleted d ON d.idCita = i.idCita
  WHERE ISNULL(i.estatusCita, N'') <> ISNULL(d.estatusCita, N'');
END
GO
