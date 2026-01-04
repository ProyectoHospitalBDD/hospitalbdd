--use hospitalBD

--select name from sys.objects where type = 'P';

CREATE or alter PROCEDURE dbo.sp_ObtenerRecetaPorCita
    @citaId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        r.idReceta,
        r.idCita,
        r.fechaReceta,
        r.diagnostico,
        r.observaciones,
        m.idMedicamento,
        med.descripcion AS nombreMedicamento,   
        m.indicaciones AS indicacionesMedicamento,
        m.cantidad,
        s.idServicio,
        serv.descripcion AS nombreServicio,     
        s.indicaciones AS indicacionesServicio
    FROM receta r
    INNER JOIN cita c ON r.idCita = c.idCita
    LEFT JOIN recetaMedicamento m ON r.idReceta = m.idReceta
    LEFT JOIN medicamento med ON m.idMedicamento = med.idMedicamento
    LEFT JOIN recetaServicio s ON r.idReceta = s.idReceta
    LEFT JOIN servicio serv ON s.idServicio = serv.idServicio
    WHERE r.idCita = @citaId;
END;
GO


EXEC sp_ObtenerRecetaPorCita @citaId = 11;

--select * from servicio