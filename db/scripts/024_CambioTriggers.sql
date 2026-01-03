/*
 * * NOMBRE DEL SISTEMA:   POLIMED: Gesti�n Hospitalaria (Backend SQL)
 * ARCHIVO:              Triggers.sql
 * FECHA DE DOCUMENTACI�N: 22 de Noviembre de 2025
 * MOTOR DE BASE DE DATOS: SQL Server (T-SQL)
 *
 * DESCRIPCI�N GENERAL:
 * Este script contiene los disparadores (Triggers) del sistema, encargados
 * de mantener la integridad referencial y, principalmente, la auditor�a de datos.
 *
 * FUNCIONES PRINCIPALES:
 * 1. Auditor�a autom�tica de cambios de estado (Ciclo de vida de la cita).
 * 2. Generaci�n de historial inmutable para reportes y seguimiento.
 * 3. Reacci�n autom�tica ante eventos DML (Update).
 *
 * HISTORIAL DE CAMBIOS:
 * [22/11/2025] - Implementaci�n del log de estados.
 * [26/11/2025] - Documentaci�n t�cnica y revisi�n de est�ndares.
 * */


/*
 * NOMBRE DEL TRIGGER:           dbo.tr_CitaLogEstatus
 * TIPO:                         DML Trigger (AFTER UPDATE)
 * TABLA OBJETIVO:               [dbo.cita]
 *
 * DESCRIPCI�N:
 * Disparador encargado de registrar el historial completo del ciclo de vida
 * de una cita m�dica. Cada vez que el campo 'estatusCita' cambia, se guarda
 * una copia del estado actual en la tabla de bit�cora.
 *
 * CARACTER�STICAS:
 * - Evento:     Se ejecuta DESPU�S (AFTER) de un UPDATE exitoso en [cita].
 * - Eficiencia: Utiliza la funci�n UPDATE(columna) para ejecutarse SOLO si
 * el estatus cambi�. Si se actualizan otros campos (ej. costo),
 * el trigger termina silenciosamente para ahorrar recursos.
 * - Datos:      Lee de la tabla virtual [inserted] para obtener los nuevos valores.
 *
 * ALGORITMO:
 * 1. Verifica si la columna 'estatusCita' fue modificada en la transacci�n.
 * 2. Si no fue modificada, retorna inmediatamente (RETURN).
 * 3. Si hubo cambio, inserta en [dbo.bitacoraEstatusCita] una instant�nea
 * con el ID, el nuevo estatus, fechas, paciente, doctor y costo.
 */
CREATE TRIGGER dbo.tr_CitaLogEstatus
ON dbo.cita
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Solo ejecutar SI el campo estatusCita fue modificado realmente
    -- (Optimizaci�n para evitar escrituras innecesarias en disco)
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

/*
 * NOMBRE DEL TRIGGER:           dbo.tr_RecetaCitaAtendida
 * TIPO:                         DML Trigger (AFTER INSERT)
 * TABLA OBJETIVO:               [dbo.receta]
 *
 * DESCRIPCIÓN:
 * Disparador que cambia el estatus de la cita a 'Atendida' cuando se genera una receta.
 * Esto indica que la cita médica ha sido completada con la emisión de la receta.
 *
 * CARACTERÍSTICAS:
 * - Evento:     Se ejecuta DESPUÉS (AFTER) de un INSERT exitoso en [receta].
 * - Eficiencia: Actualiza solo la cita correspondiente usando el idCita de la receta insertada.
 *
 * ALGORITMO:
 * 1. Para cada receta insertada, actualiza el estatusCita de la cita relacionada a 'Atendida'.
 */
CREATE TRIGGER dbo.tr_RecetaCitaAtendida
ON dbo.receta
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE c
    SET c.estatusCita = N'Atendida'
    FROM dbo.cita c
    INNER JOIN inserted i ON c.idCita = i.idCita;
END;
GO

select * from receta

select * from recetaMedicamento

select * from recetaServicio

Select * from cita