/*
 * 
 * NOMBRE DEL SISTEMA:   POLIMED: Gestión Hospitalaria (Backend SQL)                    
 * ARCHIVO:              Procedimientos_Almacenados.sql                            
 * FECHA DE DOCUMENTACIÓN: 22 de Noviembre de 2025                             
 * MOTOR DE BASE DE DATOS: SQL Server (T-SQL)                                  
 * 
 * DESCRIPCIÓN GENERAL:                                                        
 * Este script contiene la lógica central del negocio encapsulada en           
 * Procedimientos Almacenados. Abarca los flujos críticos de:                  
 * 1. Gestión automática de vencimiento de citas (Cron Jobs).                
 * 2. Cancelaciones y devoluciones (Reglas de negocio monetarias).           
 * 3. Creación y validación de citas (Agenda y disponibilidad).              
 * 4. Procesamiento de pagos.                                                
 * 
 * HISTORIAL DE CAMBIOS:    
 * [22/11/2025] - Documentación técnica y revisión de estándares. 
 * [26/11/2025] - Correciones en documentación técnica y revisión de estándares.              
 * 
*/

-- Proceso para cancelar citas pendientes de pago que ya vencieron

/*
 * NOMBRE DEL PROCEDIMIENTO ALMACENADO:       dbo.sp_Admin_VencerCitas
 * TIPO:         Procedimiento Almacenado (Mantenimiento)
 *
 * DESCRIPCIÓN:
 * Libera horarios de doctores buscando citas reservadas cuyo tiempo límite
 * de pago ha expirado. Invalida tanto el pago como la cita.
 *
 * CARACTERÍSTICAS:
 * - Parámetros: Ninguno (Se basa en SYSUTCDATETIME).
 * - Tablas:     Lee y Modifica [dbo.cita] y [dbo.pago].
 * - Seguridad:  Manejo de transacciones (Atomicidad) y Try/Catch.
 *
 * ALGORITMO:
 * 1. Identifica IDs de citas vencidas y los guarda en tabla variable @V.
 * 2. Si no existen, termina la ejecución.
 * 3. Actualiza estatusPago a 'Cancelado'.
 * 4. Actualiza estatusCita a 'CanceladaFaltaPago' (Dispara Trigger de Log).
 */
CREATE PROCEDURE dbo.sp_Admin_VencerCitas
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @ahora DATETIME2 = SYSUTCDATETIME();

    BEGIN TRY
        BEGIN TRAN;

        -- 1) Guardamos las citas afectadas en una tabla variable
        DECLARE @V TABLE (idCita INT PRIMARY KEY);

        INSERT INTO @V(idCita)
        SELECT c.idCita
        FROM dbo.cita c
        JOIN dbo.pago p ON p.idCita = c.idCita
        WHERE c.estatusCita = N'AgendadaPendPago'
          AND p.estatusPago = N'Pendiente'
          AND p.venceEn < @ahora;

        -- Si no hay nada que vencer, salimos
        IF NOT EXISTS (SELECT 1 FROM @V)
        BEGIN
            COMMIT;
            RETURN;
        END

        -- 2) Pago pasa a Cancelado
        UPDATE p
        SET estatusPago = N'Cancelado'
        FROM dbo.pago p
        JOIN @V v ON v.idCita = p.idCita;

        -- 3) Cita pasa a CanceladaFaltaPago
        -- ALERTA: Este UPDATE disparará el trigger 'tr_CitaLogEstatus' automáticamente.
        UPDATE c
        SET estatusCita = N'CanceladaFaltaPago'
        FROM dbo.cita c
        JOIN @V v ON v.idCita = c.idCita;

        COMMIT;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        THROW;
    END CATCH
END
GO

/* 
 * NOMBRE DEL PROCEDIMIENTO ALMACENADO:       dbo.sp_Cita_Cancelar_Doctor
 * TIPO:         Procedimiento Almacenado (Transaccional)
 * DESCRIPCIÓN:
 * Gestiona la cancelación de una cita cuando es iniciada por el médico.
 * Aplica la regla de negocio "Causa imputable al hospital", lo que garantiza
 * el reembolso del 100% al paciente sin penalizaciones, independientemente
 * del tiempo restante.
 *
 * CARACTERÍSTICAS:
 * - Parámetros: @idCita (INT) - Identificador único de la cita.
 * - Tablas:     Lee [dbo.cita]. Modifica [dbo.pago], [dbo.cita], [dbo.bitacoraEstatusCita].
 * - Validaciones: Verifica que la cita esté en un estatus válido para cancelar
 * ('AgendadaPendPago' o 'PagadaPendAtender').
 *
 * ALGORITMO:
 * 1. Obtiene estatus y costo actual de la cita.
 * 2. Si el estatus no permite cancelación, lanza Excepción 51030.
 * 3. Abre Transacción.
 * 4. Actualiza Pago: Establece 'montoDevuelto' al 100% del costo. Si estaba pendiente, lo cancela.
 * 5. Actualiza Cita: Cambia estatus a 'CanceladaDoctor'.
 * (Nota: Esto dispara el trigger de auditoría automáticamente).
 * 6. Actualiza Bitácora: Localiza el registro recién creado por el trigger y
 * sobrescribe la política de devolución a "100% por doctor".
 * 7. Confirma Transacción (Commit).
 */
CREATE PROCEDURE dbo.sp_Cita_Cancelar_Doctor
    @idCita INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @estatus NVARCHAR(25), @monto MONEY;

    -- 1. Obtención de datos actuales
    SELECT @estatus = estatusCita,
           @monto = costo
    FROM dbo.cita
    WHERE idCita = @idCita;

    -- 2. Validación de reglas de negocio
    IF @estatus NOT IN (N'AgendadaPendPago', N'PagadaPendAtender')
        THROW 51030, 'NoCancelable', 1;

    BEGIN TRY
        BEGIN TRAN;

        -- 3. Lógica de Reembolso (100% por ser causa del Doctor)
        UPDATE dbo.pago
        SET estatusPago = CASE WHEN estatusPago = N'Pendiente' THEN N'Cancelado' ELSE estatusPago END,
            montoDevuelto = @monto
        WHERE idCita = @idCita;

        -- 4. Cambio de Estatus Principal
        UPDATE dbo.cita
        SET estatusCita = N'CanceladaDoctor'
        WHERE idCita = @idCita;

        -- 5. Ajuste de Auditoría (Bitácora)
        -- Se busca la última entrada generada por el Trigger para especificar la política aplicada
        UPDATE b
        SET b.politica = N'100% por doctor',
            b.montoDevuelto = @monto
        FROM (
            SELECT TOP (1) *
            FROM dbo.bitacoraEstatusCita
            WHERE idCita = @idCita
              AND estatusCita = N'CanceladaDoctor'
            ORDER BY fechaMov DESC
        ) b;

        COMMIT;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        THROW;
    END CATCH
END
GO

/*
 * NOMBRE DEL PROCEDIMIENTO ALMACENADO:       dbo.sp_Cita_Cancelar_Paciente
 * TIPO:         Procedimiento Almacenado (Transaccional)
 * DESCRIPCIÓN:
 * Procesa la cancelación solicitada por el paciente. A diferencia de la
 * cancelación por doctor, esta aplica reglas de penalización monetaria
 * basadas en la anticipación (tiempo restante para la cita).
 * Reglas típicas: >48h (100%), >24h (50%), <24h (0%).
 *
 * CARACTERÍSTICAS:
 * - Parámetros: @idCita (INT) - Identificador único de la cita.
 * - Tablas:     Lee [dbo.cita]. Modifica [dbo.pago], [dbo.cita], [dbo.bitacoraEstatusCita].
 * - Dependencias: Invoca la función escalar [dbo.fnPorcentajeDevolucion].
 * - Salida:     Retorna un result set con el monto devuelto y el porcentaje aplicado.
 *
 * ALGORITMO:
 * 1. Obtiene fecha inicio, estatus y costo de la cita.
 * 2. Valida si es cancelable (Si no, lanza Excepción 51020).
 * 3. Calcula el porcentaje de devolución usando la función auxiliar.
 * 4. Abre Transacción.
 * 5. Actualiza Pago: Registra el monto calculado. Si estaba 'Pendiente', pasa a 'Cancelado'.
 * 6. Actualiza Cita: Cambia estatus a 'CanceladaPaciente' (Dispara Trigger de Log).
 * 7. Actualiza Bitácora: Busca el registro del trigger y documenta qué política de
 * tiempo se aplicó (Texto explícito: ">=48h 100%", etc.).
 * 8. Confirma Transacción y retorna los valores calculados al frontend.
 */
CREATE PROCEDURE dbo.sp_Cita_Cancelar_Paciente
    @idCita INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @ahora DATETIME2 = SYSUTCDATETIME();
    DECLARE @ini DATETIME2;
    DECLARE @estatus NVARCHAR(25);
    DECLARE @monto MONEY;

    -- 1. Obtención de datos para cálculo
    SELECT @ini = fechaHoraInicio,
           @estatus = estatusCita,
           @monto = costo
    FROM dbo.cita
    WHERE idCita = @idCita;

    -- 2. Validación de estatus
    IF @estatus NOT IN (N'AgendadaPendPago', N'PagadaPendAtender')
        THROW 51020, 'NoCancelable', 1;

    -- 3. Cálculo de penalización (Lógica externa en función)
    DECLARE @pct DECIMAL(4,2) = dbo.fnPorcentajeDevolucion(@ahora, @ini);
    DECLARE @dev MONEY = @monto * @pct;

    BEGIN TRY
        BEGIN TRAN;

        -- 4. Actualización del registro de Pago
        UPDATE dbo.pago
        SET estatusPago = CASE
                            WHEN estatusPago = N'Pendiente' THEN N'Cancelado'
                            ELSE estatusPago
                          END,
            montoDevuelto = @dev
        WHERE idCita = @idCita;

        -- 5. Cambio de Estatus Principal (Dispara Trigger)
        UPDATE dbo.cita
        SET estatusCita = N'CanceladaPaciente'
        WHERE idCita = @idCita;

        -- 6. Auditoría de la Regla de Negocio Aplicada
        ;WITH UltimaBitacora AS (
            SELECT TOP (1) *
            FROM dbo.bitacoraEstatusCita
            WHERE idCita = @idCita
              AND estatusCita = N'CanceladaPaciente'
            ORDER BY fechaMov DESC
        )
        UPDATE b
        SET b.politica = CASE
                           WHEN @pct = 1.00 THEN N'>=48h 100%'
                           WHEN @pct = 0.50 THEN N'>=24h 50%'
                           ELSE N'<24h 0%'
                         END,
            b.montoDevuelto = @dev
        FROM UltimaBitacora b;

        COMMIT;

        -- 7. Retorno de resultados para confirmación visual
        SELECT @dev AS montoDevuelto, @pct AS porcentaje;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        THROW;
    END CATCH
END
GO

/* 
 * NOMBRE DEL PROCEDIMIENTO ALMACENADO:       dbo.sp_Cita_Crear
 * TIPO:         Procedimiento Almacenado (Transaccional / Principal)
 *
 * DESCRIPCIÓN:
 * Motor principal para el agendamiento de citas. Orquesta todas las validaciones
 * de negocio (disponibilidad de horario, no traslapes, costos) y realiza la
 * inserción atómica de la Cita, el Pago pendiente y el Log de auditoría.
 *
 * CARACTERÍSTICAS:
 * - Parámetros: @PacienteId, @DoctorId, @FechaInicio, @DuracionMin.
 * - Tablas:     Lee [dbo.doctor], [dbo.especialidad].
 * Modifica [dbo.cita], [dbo.pago], [dbo.bitacoraEstatusCita].
 * - Dependencias: [dbo.fnDentroHorarioDoctor], [dbo.fnCitaSeTraslapa].
 * - Seguridad:  Usa nivel de aislamiento SERIALIZABLE para prevenir "Race Conditions"
 * (doble reserva simultánea del mismo hueco).
 *
 * ALGORITMO:
 * 1. Validaciones Preliminares:
 * - Fecha dentro del rango permitido (48h a 3 meses).
 * - Duración válida (30, 60, 90 min).
 * - Hora dentro del horario laboral del doctor (Función auxiliar).
 * - Existencia de especialidad y costo.
 * 2. Inicio de Transacción (SERIALIZABLE):
 * 3. Validaciones de Integridad (Bloqueo de Lectura/Escritura):
 * - Paciente no tiene ya una cita pendiente con el mismo doctor.
 * - Paciente no tiene otra cita en ese horario (con cualquier doctor).
 * - Doctor no tiene otra cita en ese horario (traslape).
 * 4. Inserción de Cita ('AgendadaPendPago').
 * 5. Generación del Pago ('Pendiente' con vigencia de 8 horas).
 * 6. Registro en Bitácora de Estatus.
 * 7. Commit y Retorno de datos completos de la reserva.
 */
CREATE PROCEDURE dbo.sp_Cita_Crear
    @PacienteId INT,
    @DoctorId    INT,
    @FechaInicio DATETIME2,
    @DuracionMin INT          -- 30 | 60 | 90
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @ahora DATETIME2 = SYSUTCDATETIME();

    -- 1. Validaciones de Rango de Fecha (Regla de Negocio)
    IF @FechaInicio < DATEADD(HOUR, 48, @ahora)
       OR @FechaInicio > DATEADD(MONTH, 3, CAST(@ahora AS date))
        THROW 51000, 'CitaFueraDeRango', 1;

    -- 2. Validación de Duración Estándar
    IF @DuracionMin NOT IN (30,60,90)
        THROW 51006, 'DuracionNoPermitida', 1;

    DECLARE @FechaFin DATETIME2 = DATEADD(MINUTE, @DuracionMin, @FechaInicio);

    -- 3. Validación de Horario Laboral (Lógica Externa)
    IF dbo.fnDentroHorarioDoctor(@DoctorId, @FechaInicio, @FechaFin) = 0
        THROW 51002, 'FueraDeHorarioLaboral', 1;

    -- 4. Obtención del Costo por Especialidad
    DECLARE @Costo MONEY = (
        SELECT TOP(1) e.costo
        FROM dbo.doctor d
        JOIN dbo.especialidad e ON e.idEspecialidad = d.idEspecialidad
        WHERE d.idUsuario = @DoctorId
    );

    IF @Costo IS NULL THROW 51005, 'DoctorSinEspecialidad', 1;

    -- CRÍTICO: Elevamos nivel de aislamiento para evitar doble booking
    SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

    BEGIN TRY
        BEGIN TRAN;

        -- 5. Validación: Paciente no duplica trámite con mismo doctor
        IF EXISTS(
            SELECT 1
            FROM dbo.cita c WITH (UPDLOCK, HOLDLOCK)
            WHERE c.idPaciente = @PacienteId
              AND c.idDoctor   = @DoctorId
              AND c.estatusCita IN (N'AgendadaPendPago', N'PagadaPendAtender')
        )
            THROW 51004, 'PacientePendienteConMismoDoctor', 1;

        -- 6. Validación: Paciente libre (no ocupado en otro consultorio)
        IF EXISTS(
            SELECT 1
            FROM dbo.cita c WITH (UPDLOCK, HOLDLOCK)
            WHERE c.idPaciente = @PacienteId
              -- Importante: No filtramos por DoctorId aquí, buscamos en general
              AND c.estatusCita IN (N'AgendadaPendPago', N'PagadaPendAtender')
              -- Lógica de traslape de tiempo
              AND c.fechaHoraFin > @FechaInicio
              AND c.fechaHoraInicio < @FechaFin
        )
            THROW 51007, 'PacienteOcupadoEnOtroConsultorio', 1;

        -- 7. Validación: Doctor libre (Lógica Externa e Interna)
        IF dbo.fnCitaSeTraslapa(@DoctorId, @FechaInicio, @FechaFin) = 1
            THROW 51003, 'DoctorOcupado', 1;

        IF EXISTS(
            SELECT 1
            FROM dbo.cita c WITH (UPDLOCK, HOLDLOCK)
            WHERE c.idDoctor = @DoctorId
              AND c.estatusCita IN (N'AgendadaPendPago', N'PagadaPendAtender')
              AND c.fechaHoraFin  > @FechaInicio
              AND c.fechaHoraInicio < @FechaFin
        )
            THROW 51003, 'DoctorOcupado', 2;

        -- 8. Inserción de Datos Maestros (Cita)
        INSERT dbo.cita(idPaciente, idDoctor, estatusCita, fechaHoraInicio, duracionMin, costo)
        VALUES(@PacienteId, @DoctorId, N'AgendadaPendPago', @FechaInicio, @DuracionMin, @Costo);

        DECLARE @idCita INT = SCOPE_IDENTITY();

        -- 9. Inserción de Pago (Vigencia 8 horas)
        INSERT dbo.pago(idCita, estatusPago, monto, venceEn)
        VALUES(@idCita, N'Pendiente', @Costo, DATEADD(HOUR, 8, @ahora));

        -- 10. Inserción de Bitácora Inicial
        INSERT dbo.bitacoraEstatusCita(idCita, estatusCita, fechaCitaInicio, fechaCitaFin, idPaciente, idDoctor, costo)
        SELECT idCita, N'AgendadaPendPago', fechaHoraInicio, fechaHoraFin, idPaciente, idDoctor, costo
        FROM dbo.cita WHERE idCita = @idCita;

        COMMIT;

        -- 11. Retorno de confirmación
        SELECT c.idCita,
               c.idPaciente,
               c.idDoctor,
               c.estatusCita,
               c.fechaHoraInicio,
               c.duracionMin,
               c.fechaHoraFin,
               c.costo,
               p.venceEn
        FROM dbo.cita c
        JOIN dbo.pago p ON p.idCita = c.idCita
        WHERE c.idCita = @idCita;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        THROW;
    END CATCH
END
GO

/* 
 * NOMBRE DEL PROCEDIMIENTO ALMACENADO:       dbo.sp_Cita_Pagar
 * TIPO:         Procedimiento Almacenado (Transaccional)
 *
 * DESCRIPCIÓN:
 * Registra la confirmación del pago de una cita por parte del paciente.
 * Es el paso final para asegurar la reserva. Si el pago se realiza después
 * del tiempo límite (venceEn), la operación es rechazada.
 *
 * CARACTERÍSTICAS:
 * - Parámetros: @idCita (INT).
 * - Tablas:     Lee y Modifica [dbo.pago], [dbo.cita].
 * - Validaciones Críticas:
 * 1. El pago debe existir.
 * 2. El estatus debe ser 'Pendiente' (no pagado ni cancelado previamente).
 * 3. La hora actual no debe superar la fecha límite (@venceEn).
 *
 * ALGORITMO:
 * 1. Obtiene fecha de vencimiento y estatus actual del pago.
 * 2. Valida condiciones (Lanza errores 51010, 51011, 51012 si fallan).
 * 3. Abre Transacción.
 * 4. Actualiza Pago: Cambia a 'Pagado' y registra fecha/hora exacta.
 * 5. Actualiza Cita: Cambia estatus a 'PagadaPendAtender' (Listo para consulta).
 * 6. Confirma Transacción.
 */
CREATE PROCEDURE dbo.sp_Cita_Pagar
    @idCita INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @ahora DATETIME2 = SYSUTCDATETIME();
    DECLARE @venceEn DATETIME2, @estatusPago NVARCHAR(15);

    -- 1. Verificación de estado actual y vigencia
    SELECT @venceEn = p.venceEn, @estatusPago = p.estatusPago
    FROM dbo.pago p
    WHERE p.idCita = @idCita;

    -- 2. Validaciones de Reglas de Negocio
    IF @estatusPago IS NULL THROW 51010, 'PagoNoEncontrado', 1;
    IF @estatusPago <> N'Pendiente' THROW 51011, 'PagoNoPendiente', 1;
    IF @ahora > @venceEn THROW 51012, 'CitaExpirada', 1;

    BEGIN TRY
        BEGIN TRAN;

        -- 3. Registro del ingreso (Pago)
        UPDATE dbo.pago
        SET estatusPago = N'Pagado',
            fechaPago = CAST(@ahora AS DATE),
            horaPago = CAST(@ahora AS TIME)
        WHERE idCita = @idCita;

        -- 4. Actualización del flujo de la Cita
        UPDATE dbo.cita
        SET estatusCita = N'PagadaPendAtender'
        WHERE idCita = @idCita;

        COMMIT;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        THROW;
    END CATCH
END
GO

/* 
 * NOMBRE DEL PROCEDIMIENTO ALMACENADO:       dbo.sp_Debug_ExpirarPagosPendientes1
 * TIPO:         Procedimiento Almacenado (Herramienta de Testing/Debug)
 *
 * DESCRIPCIÓN:
 * Procedimiento auxiliar para pruebas de desarrollo. Forza el vencimiento
 * inmediato de todos los pagos pendientes moviendo su fecha límite al pasado.
 * Útil para probar el job 'sp_Admin_VencerCitas' sin esperar 8 horas reales.
 *
 * NOTA: NO EJECUTAR EN PRODUCCIÓN A MENOS QUE SEA INTENCIONAL.
 * 
 */
CREATE PROCEDURE dbo.sp_Debug_ExpirarPagosPendientes1
AS
BEGIN
    SET NOCOUNT ON;

    -- Simula que el tiempo límite pasó hace 10 minutos
    UPDATE p
    SET venceEn = DATEADD(MINUTE, -10, SYSUTCDATETIME())
    FROM dbo.pago p
    JOIN dbo.cita c ON c.idCita = p.idCita
    WHERE p.estatusPago = N'Pendiente'
      AND c.estatusCita = N'AgendadaPendPago';
END
GO

