/*
 * * NOMBRE DEL SISTEMA:   POLIMED: Gestión Hospitalaria (Backend SQL)                    
 * ARCHIVO:              Funciones.sql                                    
 * FECHA DE DOCUMENTACIÓN: 26 de Noviembre de 2025                             
 * MOTOR DE BASE DE DATOS: SQL Server (T-SQL)                                       
 * * DESCRIPCIÓN GENERAL:                                                        
 * Este script contiene las funciones escalares y de validación del sistema.    
 * Encapsula reglas de negocio reutilizables para:                              
 * 1. Cálculos monetarios y porcentajes de devolución.                          
 * 2. Validaciones de disponibilidad de agenda (Horarios laborales).            
 * 3. Prevención de traslapes y conflictos de citas.                            
 * 4. Reglas de integridad de flujo (Citas pendientes).                         
 * * HISTORIAL DE CAMBIOS:    
 * [22/11/2025] - Creación inicial de lógica de negocio.
 * [26/11/2025] - Documentación técnica y revisión de estándares.               
 * */


/*
 * NOMBRE DE LA FUNCIÓN:         dbo.fnPorcentajeDevolucion
 * TIPO:                         Función Escalar (Cálculo Financiero)
 *
 * DESCRIPCIÓN:
 * Determina el porcentaje del costo de la cita que debe ser devuelto al 
 * paciente en caso de cancelación, basándose estrictamente en la anticipación 
 * con la que se realiza la solicitud (Regla de Negocio de Tiempo).
 *
 * CARACTERÍSTICAS:
 * - Parámetros: @Ahora (Momento de cancelación), @FechaCita (Momento programado).
 * - Retorno:    DECIMAL(4,2) representando el factor (1.00, 0.50, 0.00).
 * - Lógica:     No accede a tablas, es una función pura de cálculo de fechas.
 *
 * ALGORITMO / REGLAS:
 * 1. Calcula la diferencia en horas entre @Ahora y @FechaCita.
 * 2. Si la diferencia es >= 48 horas -> Devuelve 1.00 (100%).
 * 3. Si la diferencia es >= 24 horas -> Devuelve 0.50 (50%).
 * 4. En cualquier otro caso (< 24h)  -> Devuelve 0.00 (0%).
 */
CREATE FUNCTION dbo.fnPorcentajeDevolucion
(
  @Ahora DATETIME2,
  @FechaCita DATETIME2
)
RETURNS DECIMAL(4,2)
AS
BEGIN
  DECLARE @hrs INT = DATEDIFF(HOUR, @Ahora, @FechaCita);
  RETURN CASE WHEN @hrs >= 48 THEN 1.00
              WHEN @hrs >= 24 THEN 0.50
              ELSE 0.00 END;
END
GO

/*
 * NOMBRE DE LA FUNCIÓN:         dbo.fnDentroHorarioDoctor
 * TIPO:                         Función Escalar (Validación de Agenda)
 *
 * DESCRIPCIÓN:
 * Verifica si el rango de tiempo solicitado para una cita cae estrictamente
 * dentro de la jornada laboral configurada para un médico específico.
 * Utiliza configuraciones semanales (ej. Lunes de 9:00 a 14:00).
 *
 * CARACTERÍSTICAS:
 * - Parámetros: @DoctorId, @Inicio (FechaHora), @Fin (FechaHora).
 * - Retorno:    BIT (1 = Horario Válido, 0 = Fuera de Horario).
 * - Dependencias: Tablas [dbo.doctor] y [dbo.horarioEmpleado].
 *
 * ALGORITMO:
 * 1. Extrae el nombre del día de la semana (ej. 'Lunes') de la fecha inicio y fin.
 * 2. Extrae la parte de la HORA (TIME) de inicio y fin.
 * 3. Busca en [horarioEmpleado] si existe un registro que coincida con el 
 * día y cubra el rango de horas solicitado.
 */
CREATE FUNCTION dbo.fnDentroHorarioDoctor
(
  @DoctorId INT,
  @Inicio   DATETIME2,
  @Fin      DATETIME2
)
RETURNS BIT
AS
BEGIN
  DECLARE @ret BIT;

  ;WITH D AS(
    SELECT 
      FORMAT(@Inicio, 'dddd', 'es-ES') AS diaInicio,
      CAST(@Inicio AS TIME) AS horaIni,
      FORMAT(@Fin,    'dddd', 'es-ES') AS diaFin,
      CAST(@Fin    AS TIME) AS horaFin
  )
  SELECT @ret =
    CASE WHEN EXISTS(
      SELECT 1
      FROM D
      JOIN dbo.doctor tmp ON tmp.idUsuario = @DoctorId
      JOIN dbo.horarioEmpleado h ON h.idUsuario = tmp.idUsuario
      WHERE (h.diaSemana = D.diaInicio COLLATE Modern_Spanish_CI_AI)
        AND (h.diaSemana = D.diaFin    COLLATE Modern_Spanish_CI_AI)
        AND D.horaIni >= h.horaInicio
        AND D.horaFin <= h.horaFin
    ) 
    THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END;

  RETURN @ret;
END
GO

/*
 * NOMBRE DE LA FUNCIÓN:         dbo.fnCitaSeTraslapa
 * TIPO:                         Función Escalar (Integridad de Agenda)
 *
 * DESCRIPCIÓN:
 * Detecta conflictos de agenda verificando si el doctor ya tiene otra cita 
 * ocupada en el rango de tiempo solicitado. Evita el "Double Booking".
 *
 * CARACTERÍSTICAS:
 * - Parámetros: @DoctorId, @Inicio, @Fin.
 * - Retorno:    BIT (1 = Hay conflicto/Traslape, 0 = Libre).
 * - Excepciones: Ignora citas que ya han sido canceladas (por Doctor, Paciente o falta de pago).
 *
 * ALGORITMO:
 * Busca en la tabla [cita] cualquier registro del mismo doctor donde:
 * 1. El estatus sea ACTIVO (no cancelado).
 * 2. Se cumpla la lógica de intersección temporal:
 * (CitaExistente.Inicio < Nueva.Fin) Y (CitaExistente.Fin > Nueva.Inicio).
 */
CREATE FUNCTION dbo.fnCitaSeTraslapa
(
  @DoctorId INT,
  @Inicio   DATETIME2,
  @Fin      DATETIME2
)
RETURNS BIT
AS
BEGIN
  DECLARE @ret BIT = 0;

  IF EXISTS(
      SELECT 1
      FROM dbo.cita c
      WHERE c.idDoctor = @DoctorId
        AND c.estatusCita NOT IN (N'CanceladaDoctor', N'CanceladaPaciente', N'CanceladaFaltaPago')
        AND c.fechaHoraInicio < @Fin
        AND c.fechaHoraFin    > @Inicio
  )
  BEGIN
      SET @ret = 1;
  END

  RETURN @ret;
END
GO

/*
 * NOMBRE DE LA FUNCIÓN:         dbo.fnPacienteTienePendiente
 * TIPO:                         Función Escalar (Regla de Negocio)
 *
 * DESCRIPCIÓN:
 * Impide que un paciente inicie múltiples procesos de reserva simultáneos
 * con el mismo médico. Garantiza un flujo secuencial: agendar -> pagar -> atender.
 *
 * CARACTERÍSTICAS:
 * - Parámetros: @PacienteId, @DoctorId.
 * - Retorno:    BIT (1 = Tiene trámite pendiente, 0 = Libre).
 *
 * ALGORITMO:
 * Verifica si existe alguna cita para ese par Paciente-Doctor en estatus:
 * - 'AgendadaPendPago' (Esperando pago).
 * - 'PagadaPendAtender' (Esperando consulta).
 */
CREATE FUNCTION dbo.fnPacienteTienePendiente
(
  @PacienteId INT,
  @DoctorId   INT
)
RETURNS BIT
AS
BEGIN
  RETURN
  (
    SELECT CASE WHEN EXISTS(
      SELECT 1 FROM dbo.cita c
      WHERE c.idPaciente = @PacienteId
        AND c.idDoctor   = @DoctorId
        AND c.estatusCita IN (N'AgendadaPendPago', N'PagadaPendAtender')
    ) THEN 1 ELSE 0 END
  );
END
GO