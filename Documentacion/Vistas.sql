/*
 * * NOMBRE DEL SISTEMA:   POLIMED: Gestión Hospitalaria (Backend SQL)
 * ARCHIVO:              Vistas.sql
 * FECHA DE DOCUMENTACIÓN: 22 de Noviembre de 2025
 * MOTOR DE BASE DE DATOS: SQL Server (T-SQL)
 *
 * DESCRIPCIÓN GENERAL:
 * Este script contiene las Vistas (Views) del sistema, diseñadas para
 * simplificar consultas complejas (Joins múltiples) y presentar información
 * consolidada a las interfaces de usuario (Frontend).
 *
 * FUNCIONES PRINCIPALES:
 * 1. Abstracción de la complejidad del modelo relacional.
 * 2. Seguridad (oculta columnas sensibles como passwords o salarios).
 * 3. Reportes operativos instantáneos (Directorios, Agendas, Historiales).
 *
 * HISTORIAL DE CAMBIOS:
 * [22/11/2025] - Creación de vistas base para módulos de paciente y médico.
 * [26/11/2025] - Documentación técnica y revisión de estándares.
 * */


/*
 * NOMBRE DE LA VISTA:           dbo.info_Doctor
 * TIPO:                         Vista de Directorio
 *
 * DESCRIPCIÓN:
 * Provee una ficha pública del médico combinando su información personal,
 * profesional y logística. Es la fuente principal para que los pacientes
 * elijan doctor.
 *
 * CARACTERÍSTICAS:
 * - Joins: [usuarioSistema], [horarioEmpleado], [doctor], [consultorio], [especialidad], [contacto].
 * - Filtros: Muestra todos los doctores con horario asignado.
 *
 * CAMPOS PRINCIPALES:
 * - Nombre Completo, Cédula, Especialidad.
 * - Ubicación (Consultorio) y Horarios de atención (Día, Desde, Hasta).
 * - Contacto (Correo).
 */
CREATE VIEW info_Doctor AS
SELECT
    d.nombre + ' ' + d.apPat + ' ' + ISNULL(d.apMat,' ') AS Nombre,
    ce.cedula,
    es.nombreEsp AS Especialidad,
    co.correoPersonal,
    c.numero AS Consultorio,
    h.diaSemana AS Dia,
    h.horaInicio AS Desde,
    h.horaFin AS Hasta
FROM usuarioSistema d
JOIN horarioEmpleado h ON d.idUsuario = h.idUsuario
JOIN doctor ce ON d.idUsuario = ce.idUsuario
JOIN consultorio c ON ce.idConsultorio = c.idConsultorio
JOIN especialidad es ON ce.idEspecialidad = es.idEspecialidad
JOIN contacto co ON co.idContacto = d.idContacto;
GO

/*
 * NOMBRE DE LA VISTA:           dbo.info_Citas
 * TIPO:                         Vista Operativa (Agenda Activa)
 *
 * DESCRIPCIÓN:
 * Reporte de citas que ya han sido pagadas y confirmadas, pero que aún no
 * han sido atendidas. Es vital para la pantalla de recepción y la agenda
 * diaria del médico.
 *
 * CARACTERÍSTICAS:
 * - Filtro Crítico: estatusCita = 'PagadaPendAtender'.
 * - Joins: Conecta Doctor, Paciente (ambos desde usuarioSistema), Cita y Consultorio.
 *
 * CAMPOS PRINCIPALES:
 * - Nombres completos de Doctor y Paciente.
 * - Fecha/Hora Inicio y Fin.
 * - Ubicación física.
 */
CREATE VIEW info_Citas AS
SELECT
    d.nombre + ' ' + d.apPat + ' ' + ISNULL(d.apMat, '') AS Doctor,
    p.nombre + ' ' + p.apPat + ' ' + ISNULL(p.apMat, '') AS Paciente,
    es.nombreEsp AS Especialidad,
    ci.fechaHoraInicio AS Inicio,
    ci.fechaHoraFin AS Fin,
    c.numero AS Consultorio
FROM doctor doc
JOIN usuarioSistema d ON d.idUsuario = doc.idUsuario
JOIN cita ci ON ci.idDoctor = doc.idUsuario AND ci.estatusCita = 'PagadaPendAtender'
JOIN usuarioSistema p ON p.idUsuario = ci.idPaciente  -- Join al paciente
JOIN especialidad es ON es.idEspecialidad = doc.idEspecialidad
JOIN consultorio c ON c.idConsultorio = doc.idConsultorio;
GO


/*
 * NOMBRE DE LA VISTA:           dbo.info_padecimientos
 * TIPO:                         Vista de Expediente Clínico
 *
 * DESCRIPCIÓN:
 * Resumen clínico de alertas importantes del paciente. Muestra tanto
 * alergias como padecimientos crónicos registrados.
 *
 * CARACTERÍSTICAS:
 * - Uso: Pantalla de alerta para el médico antes de recetar.
 * - Joins: [paciente], [usuarioSistema], [pacienteAlergiaPadecimiento], [alergiaPadecimiento].
 *
 * CAMPOS PRINCIPALES:
 * - Paciente, Diagnóstico (Nombre de alergia/enfermedad), Tipo, Severidad, Reacción.
 */
CREATE VIEW info_padecimientos AS
SELECT
    p.nombre + ' ' + p.apPat + ' ' + ISNULL(p.apMat, '') AS Paciente,
    pa.nombre AS Diagnostico,
    pa.tipo AS Tipo,
    pac.severidad,
    pac.reaccion,
    pac.observaciones
FROM paciente paciente
JOIN usuarioSistema p ON paciente.idUsuario = p.idUsuario
JOIN pacienteAlergiaPadecimiento pac ON pac.idPaciente = paciente.idUsuario
JOIN alergiaPadecimiento pa ON pa.idAlerPade = pac.idAlerPade;
GO

/*
 * NOMBRE DE LA VISTA:           dbo.info_Servicios
 * TIPO:                         Vista de Catálogo de Servicios
 *
 * DESCRIPCIÓN:
 * Listado de servicios auxiliares (enfermería, curaciones, etc.) disponibles,
 * vinculando directamente al personal responsable.
 *
 * CARACTERÍSTICAS:
 * - Joins: [usuarioSistema] (filtrado implícitamente por la tabla servicio), [servicio].
 *
 * CAMPOS PRINCIPALES:
 * - Nombre de la Enfermera/o, Descripción del servicio, Tipo.
 */
CREATE VIEW info_Servicios AS
SELECT
     en.nombre + ' ' + en.apPat + ' ' + ISNULL(en.apMat, '') AS Enfermera,
     ser.descripcion,
     ser.tipo
FROM usuarioSistema en
JOIN servicio ser ON ser.idEnfermera = en.idUsuario;
GO