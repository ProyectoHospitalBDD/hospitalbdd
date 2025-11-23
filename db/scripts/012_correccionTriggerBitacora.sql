use hospitalBD

CREATE OR ALTER TRIGGER dbo.tr_CitaLogEstatus
ON dbo.cita
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Solo ejecutar SI el campo estatusCita fue modificado realmente
    IF NOT UPDATE(estatusCita)
        RETURN;

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
    FROM inserted i;
END;
GO
