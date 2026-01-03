/*
 * 
 * NOMBRE DEL SISTEMA:   POLIMED: Gesti�n Hospitalaria (Backend SQL)                    
 * ARCHIVO:              Procedimientos_Almacenados.sql                            
 * FECHA DE DOCUMENTACI�N: 22 de Noviembre de 2025                             
 * MOTOR DE BASE DE DATOS: SQL Server (T-SQL)                                  
 * 
 * DESCRIPCI�N GENERAL:                                                        
 * Este script contiene la l�gica central del negocio encapsulada en           
 * Procedimientos Almacenados. Abarca los flujos cr�ticos de:                  
 * 1. Gesti�n autom�tica de vencimiento de citas (Cron Jobs).                
 * 2. Cancelaciones y devoluciones (Reglas de negocio monetarias).           
 * 3. Creaci�n y validaci�n de citas (Agenda y disponibilidad).              
 * 4. Procesamiento de pagos.                                                
 * 
 * HISTORIAL DE CAMBIOS:    
 * [22/11/2025] - Documentaci�n t�cnica y revisi�n de est�ndares. 
 * [26/11/2025] - Correciones en documentaci�n t�cnica y revisi�n de est�ndares.              
 * 
*/

-- Proceso para cancelar citas pendientes de pago que ya vencieron

/*
 * NOMBRE DEL PROCEDIMIENTO ALMACENADO:       dbo.sp_Admin_VencerCitas
 * TIPO:         Procedimiento Almacenado (Mantenimiento)
 *
 * DESCRIPCI�N:
 * Libera horarios de doctores buscando citas reservadas cuyo tiempo l�mite
 * de pago ha expirado. Invalida tanto el pago como la cita.
 *
 * CARACTER�STICAS:
 * - Par�metros: Ninguno (Se basa en SYSUTCDATETIME).
 * - Tablas:     Lee y Modifica [dbo.cita] y [dbo.pago].
 * - Seguridad:  Manejo de transacciones (Atomicidad) y Try/Catch.
 *
 * ALGORITMO:
 * 1. Identifica IDs de citas vencidas y los guarda en tabla variable @V.
 * 2. Si no existen, termina la ejecuci�n.
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
        -- ALERTA: Este UPDATE disparar� el trigger 'tr_CitaLogEstatus' autom�ticamente.
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
 * DESCRIPCI�N:
 * Gestiona la cancelaci�n de una cita cuando es iniciada por el m�dico.
 * Aplica la regla de negocio "Causa imputable al hospital", lo que garantiza
 * el reembolso del 100% al paciente sin penalizaciones, independientemente
 * del tiempo restante.
 *
 * CARACTER�STICAS:
 * - Par�metros: @idCita (INT) - Identificador �nico de la cita.
 * - Tablas:     Lee [dbo.cita]. Modifica [dbo.pago], [dbo.cita], [dbo.bitacoraEstatusCita].
 * - Validaciones: Verifica que la cita est� en un estatus v�lido para cancelar
 * ('AgendadaPendPago' o 'PagadaPendAtender').
 *
 * ALGORITMO:
 * 1. Obtiene estatus y costo actual de la cita.
 * 2. Si el estatus no permite cancelaci�n, lanza Excepci�n 51030.
 * 3. Abre Transacci�n.
 * 4. Actualiza Pago: Establece 'montoDevuelto' al 100% del costo. Si estaba pendiente, lo cancela.
 * 5. Actualiza Cita: Cambia estatus a 'CanceladaDoctor'.
 * (Nota: Esto dispara el trigger de auditor�a autom�ticamente).
 * 6. Actualiza Bit�cora: Localiza el registro reci�n creado por el trigger y
 * sobrescribe la pol�tica de devoluci�n a "100% por doctor".
 * 7. Confirma Transacci�n (Commit).
 */
CREATE PROCEDURE dbo.sp_Cita_Cancelar_Doctor
    @idCita INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @estatus NVARCHAR(25), @monto MONEY;

    -- 1. Obtenci�n de datos actuales
    SELECT @estatus = estatusCita,
           @monto = costo
    FROM dbo.cita
    WHERE idCita = @idCita;

    -- 2. Validaci�n de reglas de negocio
    IF @estatus NOT IN (N'AgendadaPendPago', N'PagadaPendAtender')
        THROW 51030, 'NoCancelable', 1;

    BEGIN TRY
        BEGIN TRAN;

        -- 3. L�gica de Reembolso (100% por ser causa del Doctor)
        UPDATE dbo.pago
        SET estatusPago = CASE WHEN estatusPago = N'Pendiente' THEN N'Cancelado' ELSE estatusPago END,
            montoDevuelto = @monto
        WHERE idCita = @idCita;

        -- 4. Cambio de Estatus Principal
        UPDATE dbo.cita
        SET estatusCita = N'CanceladaDoctor'
        WHERE idCita = @idCita;

        -- 5. Ajuste de Auditor�a (Bit�cora)
        -- Se busca la �ltima entrada generada por el Trigger para especificar la pol�tica aplicada
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
 * DESCRIPCI�N:
 * Procesa la cancelaci�n solicitada por el paciente. A diferencia de la
 * cancelaci�n por doctor, esta aplica reglas de penalizaci�n monetaria
 * basadas en la anticipaci�n (tiempo restante para la cita).
 * Reglas t�picas: >48h (100%), >24h (50%), <24h (0%).
 *
 * CARACTER�STICAS:
 * - Par�metros: @idCita (INT) - Identificador �nico de la cita.
 * - Tablas:     Lee [dbo.cita]. Modifica [dbo.pago], [dbo.cita], [dbo.bitacoraEstatusCita].
 * - Dependencias: Invoca la funci�n escalar [dbo.fnPorcentajeDevolucion].
 * - Salida:     Retorna un result set con el monto devuelto y el porcentaje aplicado.
 *
 * ALGORITMO:
 * 1. Obtiene fecha inicio, estatus y costo de la cita.
 * 2. Valida si es cancelable (Si no, lanza Excepci�n 51020).
 * 3. Calcula el porcentaje de devoluci�n usando la funci�n auxiliar.
 * 4. Abre Transacci�n.
 * 5. Actualiza Pago: Registra el monto calculado. Si estaba 'Pendiente', pasa a 'Cancelado'.
 * 6. Actualiza Cita: Cambia estatus a 'CanceladaPaciente' (Dispara Trigger de Log).
 * 7. Actualiza Bit�cora: Busca el registro del trigger y documenta qu� pol�tica de
 * tiempo se aplic� (Texto expl�cito: ">=48h 100%", etc.).
 * 8. Confirma Transacci�n y retorna los valores calculados al frontend.
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

    -- 1. Obtenci�n de datos para c�lculo
    SELECT @ini = fechaHoraInicio,
           @estatus = estatusCita,
           @monto = costo
    FROM dbo.cita
    WHERE idCita = @idCita;

    -- 2. Validaci�n de estatus
    IF @estatus NOT IN (N'AgendadaPendPago', N'PagadaPendAtender')
        THROW 51020, 'NoCancelable', 1;

    -- 3. C�lculo de penalizaci�n (L�gica externa en funci�n)
    DECLARE @pct DECIMAL(4,2) = dbo.fnPorcentajeDevolucion(@ahora, @ini);
    DECLARE @dev MONEY = @monto * @pct;

    BEGIN TRY
        BEGIN TRAN;

        -- 4. Actualizaci�n del registro de Pago
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

        -- 6. Auditor�a de la Regla de Negocio Aplicada
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

        -- 7. Retorno de resultados para confirmaci�n visual
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
 * DESCRIPCI�N:
 * Motor principal para el agendamiento de citas. Orquesta todas las validaciones
 * de negocio (disponibilidad de horario, no traslapes, costos) y realiza la
 * inserci�n at�mica de la Cita, el Pago pendiente y el Log de auditor�a.
 *
 * CARACTER�STICAS:
 * - Par�metros: @PacienteId, @DoctorId, @FechaInicio, @DuracionMin.
 * - Tablas:     Lee [dbo.doctor], [dbo.especialidad].
 * Modifica [dbo.cita], [dbo.pago], [dbo.bitacoraEstatusCita].
 * - Dependencias: [dbo.fnDentroHorarioDoctor], [dbo.fnCitaSeTraslapa].
 * - Seguridad:  Usa nivel de aislamiento SERIALIZABLE para prevenir "Race Conditions"
 * (doble reserva simult�nea del mismo hueco).
 *
 * ALGORITMO:
 * 1. Validaciones Preliminares:
 * - Fecha dentro del rango permitido (48h a 3 meses).
 * - Duraci�n v�lida (30, 60, 90 min).
 * - Hora dentro del horario laboral del doctor (Funci�n auxiliar).
 * - Existencia de especialidad y costo.
 * 2. Inicio de Transacci�n (SERIALIZABLE):
 * 3. Validaciones de Integridad (Bloqueo de Lectura/Escritura):
 * - Paciente no tiene ya una cita pendiente con el mismo doctor.
 * - Paciente no tiene otra cita en ese horario (con cualquier doctor).
 * - Doctor no tiene otra cita en ese horario (traslape).
 * 4. Inserci�n de Cita ('AgendadaPendPago').
 * 5. Generaci�n del Pago ('Pendiente' con vigencia de 8 horas).
 * 6. Registro en Bit�cora de Estatus.
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

    -- 2. Validaci�n de Duraci�n Est�ndar
    IF @DuracionMin NOT IN (30,60,90)
        THROW 51006, 'DuracionNoPermitida', 1;

    DECLARE @FechaFin DATETIME2 = DATEADD(MINUTE, @DuracionMin, @FechaInicio);

    -- 3. Validaci�n de Horario Laboral (L�gica Externa)
    IF dbo.fnDentroHorarioDoctor(@DoctorId, @FechaInicio, @FechaFin) = 0
        THROW 51002, 'FueraDeHorarioLaboral', 1;

    -- 4. Obtenci�n del Costo por Especialidad
    DECLARE @Costo MONEY = (
        SELECT TOP(1) e.costo
        FROM dbo.doctor d
        JOIN dbo.especialidad e ON e.idEspecialidad = d.idEspecialidad
        WHERE d.idUsuario = @DoctorId
    );

    IF @Costo IS NULL THROW 51005, 'DoctorSinEspecialidad', 1;

    -- CR�TICO: Elevamos nivel de aislamiento para evitar doble booking
    SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

    BEGIN TRY
        BEGIN TRAN;

        -- 5. Validaci�n: Paciente no duplica tr�mite con mismo doctor
        IF EXISTS(
            SELECT 1
            FROM dbo.cita c WITH (UPDLOCK, HOLDLOCK)
            WHERE c.idPaciente = @PacienteId
              AND c.idDoctor   = @DoctorId
              AND c.estatusCita IN (N'AgendadaPendPago', N'PagadaPendAtender')
        )
            THROW 51004, 'PacientePendienteConMismoDoctor', 1;

        -- 6. Validaci�n: Paciente libre (no ocupado en otro consultorio)
        IF EXISTS(
            SELECT 1
            FROM dbo.cita c WITH (UPDLOCK, HOLDLOCK)
            WHERE c.idPaciente = @PacienteId
              -- Importante: No filtramos por DoctorId aqu�, buscamos en general
              AND c.estatusCita IN (N'AgendadaPendPago', N'PagadaPendAtender')
              -- L�gica de traslape de tiempo
              AND c.fechaHoraFin > @FechaInicio
              AND c.fechaHoraInicio < @FechaFin
        )
            THROW 51007, 'PacienteOcupadoEnOtroConsultorio', 1;

        -- 7. Validaci�n: Doctor libre (L�gica Externa e Interna)
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

        -- 8. Inserci�n de Datos Maestros (Cita)
        INSERT dbo.cita(idPaciente, idDoctor, estatusCita, fechaHoraInicio, duracionMin, costo)
        VALUES(@PacienteId, @DoctorId, N'AgendadaPendPago', @FechaInicio, @DuracionMin, @Costo);

        DECLARE @idCita INT = SCOPE_IDENTITY();

        -- 9. Inserci�n de Pago (Vigencia 8 horas)
        INSERT dbo.pago(idCita, estatusPago, monto, venceEn)
        VALUES(@idCita, N'Pendiente', @Costo, DATEADD(HOUR, 8, @ahora));

        -- 10. Inserci�n de Bit�cora Inicial
        INSERT dbo.bitacoraEstatusCita(idCita, estatusCita, fechaCitaInicio, fechaCitaFin, idPaciente, idDoctor, costo)
        SELECT idCita, N'AgendadaPendPago', fechaHoraInicio, fechaHoraFin, idPaciente, idDoctor, costo
        FROM dbo.cita WHERE idCita = @idCita;

        COMMIT;

        -- 11. Retorno de confirmaci�n
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
 * DESCRIPCI�N:
 * Registra la confirmaci�n del pago de una cita por parte del paciente.
 * Es el paso final para asegurar la reserva. Si el pago se realiza despu�s
 * del tiempo l�mite (venceEn), la operaci�n es rechazada.
 *
 * CARACTER�STICAS:
 * - Par�metros: @idCita (INT).
 * - Tablas:     Lee y Modifica [dbo.pago], [dbo.cita].
 * - Validaciones Cr�ticas:
 * 1. El pago debe existir.
 * 2. El estatus debe ser 'Pendiente' (no pagado ni cancelado previamente).
 * 3. La hora actual no debe superar la fecha l�mite (@venceEn).
 *
 * ALGORITMO:
 * 1. Obtiene fecha de vencimiento y estatus actual del pago.
 * 2. Valida condiciones (Lanza errores 51010, 51011, 51012 si fallan).
 * 3. Abre Transacci�n.
 * 4. Actualiza Pago: Cambia a 'Pagado' y registra fecha/hora exacta.
 * 5. Actualiza Cita: Cambia estatus a 'PagadaPendAtender' (Listo para consulta).
 * 6. Confirma Transacci�n.
 */
CREATE PROCEDURE dbo.sp_Cita_Pagar
    @idCita INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @ahora DATETIME2 = SYSUTCDATETIME();
    DECLARE @venceEn DATETIME2, @estatusPago NVARCHAR(15);

    -- 1. Verificaci�n de estado actual y vigencia
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

        -- 4. Actualizaci�n del flujo de la Cita
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
 * DESCRIPCI�N:
 * Procedimiento auxiliar para pruebas de desarrollo. Forza el vencimiento
 * inmediato de todos los pagos pendientes moviendo su fecha l�mite al pasado.
 * �til para probar el job 'sp_Admin_VencerCitas' sin esperar 8 horas reales.
 *
 * NOTA: NO EJECUTAR EN PRODUCCI�N A MENOS QUE SEA INTENCIONAL.
 * 
 */
CREATE PROCEDURE dbo.sp_Debug_ExpirarPagosPendientes1
AS
BEGIN
    SET NOCOUNT ON;

    -- Simula que el tiempo l�mite pas� hace 10 minutos
    UPDATE p
    SET venceEn = DATEADD(MINUTE, -10, SYSUTCDATETIME())
    FROM dbo.pago p
    JOIN dbo.cita c ON c.idCita = p.idCita
    WHERE p.estatusPago = N'Pendiente'
      AND c.estatusCita = N'AgendadaPendPago';
END
GO
