/*
 * * NOMBRE DEL SISTEMA:   POLIMED: Gestión Hospitalaria (Backend SQL)
 * ARCHIVO:              Triggers.sql
 * FECHA DE DOCUMENTACIÓN: 22 de Noviembre de 2025
 * MOTOR DE BASE DE DATOS: SQL Server (T-SQL)
 *
 * DESCRIPCIÓN GENERAL:
 * Este script contiene los disparadores (Triggers) del sistema, encargados
 * de mantener la integridad referencial y, principalmente, la auditoría de datos.
 *
 * FUNCIONES PRINCIPALES:
 * 1. Auditoría automática de cambios de estado (Ciclo de vida de la cita).
 * 2. Generación de historial inmutable para reportes y seguimiento.
 * 3. Reacción automática ante eventos DML (Update).
 *
 * HISTORIAL DE CAMBIOS:
 * [22/11/2025] - Implementación del log de estados.
 * [26/11/2025] - Documentación técnica y revisión de estándares.
 * */


/*
 * NOMBRE DEL TRIGGER:           dbo.tr_CitaLogEstatus
 * TIPO:                         DML Trigger (AFTER UPDATE)
 * TABLA OBJETIVO:               [dbo.cita]
 *
 * DESCRIPCIÓN:
 * Disparador encargado de registrar el historial completo del ciclo de vida
 * de una cita médica. Cada vez que el campo 'estatusCita' cambia, se guarda
 * una copia del estado actual en la tabla de bitácora.
 *
 * CARACTERÍSTICAS:
 * - Evento:     Se ejecuta DESPUÉS (AFTER) de un UPDATE exitoso en [cita].
 * - Eficiencia: Utiliza la función UPDATE(columna) para ejecutarse SOLO si
 * el estatus cambió. Si se actualizan otros campos (ej. costo),
 * el trigger termina silenciosamente para ahorrar recursos.
 * - Datos:      Lee de la tabla virtual [inserted] para obtener los nuevos valores.
 *
 * ALGORITMO:
 * 1. Verifica si la columna 'estatusCita' fue modificada en la transacción.
 * 2. Si no fue modificada, retorna inmediatamente (RETURN).
 * 3. Si hubo cambio, inserta en [dbo.bitacoraEstatusCita] una instantánea
 * con el ID, el nuevo estatus, fechas, paciente, doctor y costo.
 */
CREATE TRIGGER dbo.tr_CitaLogEstatus
ON dbo.cita
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Solo ejecutar SI el campo estatusCita fue modificado realmente
    -- (Optimización para evitar escrituras innecesarias en disco)
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