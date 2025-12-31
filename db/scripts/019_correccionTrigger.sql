USE hospitalBD;
GO

CREATE OR ALTER TRIGGER dbo.tr_CitaLogEstatus
ON dbo.cita
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Si el UPDATE no tocó la columna, salimos
    IF NOT UPDATE(estatusCita)
        RETURN;

    -- Inserta SOLO cuando realmente cambió el valor (inserted vs deleted)
    INSERT INTO dbo.bitacoraEstatusCita
        (idCita, estatusCita, fechaCitaInicio, fechaCitaFin, idPaciente, idDoctor, costo)
    SELECT
        i.idCita,
        i.estatusCita,
        i.fechaHoraInicio,
        i.fechaHoraFin,
        i.idPaciente,
        i.idDoctor,
        i.costo
    FROM inserted i
    JOIN deleted d ON d.idCita = i.idCita
    WHERE ISNULL(i.estatusCita, N'') <> ISNULL(d.estatusCita, N'');
END;
GO
