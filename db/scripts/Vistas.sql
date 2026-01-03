/*
 * * NOMBRE DEL SISTEMA:   POLIMED: Gesti�n Hospitalaria (Backend SQL)
 * ARCHIVO:              Vistas.sql
 * FECHA DE DOCUMENTACI�N: 22 de Noviembre de 2025
 * MOTOR DE BASE DE DATOS: SQL Server (T-SQL)
 *
 * DESCRIPCI�N GENERAL:
 * Este script contiene las Vistas (Views) del sistema, dise�adas para
 * simplificar consultas complejas (Joins m�ltiples) y presentar informaci�n
 * consolidada a las interfaces de usuario (Frontend).
 *
 * FUNCIONES PRINCIPALES:
 * 1. Abstracci�n de la complejidad del modelo relacional.
 * 2. Seguridad (oculta columnas sensibles como passwords o salarios).
 * 3. Reportes operativos instant�neos (Directorios, Agendas, Historiales).
 *
 * HISTORIAL DE CAMBIOS:
 * [22/11/2025] - Creaci�n de vistas base para m�dulos de paciente y m�dico.
 * [26/11/2025] - Documentaci�n t�cnica y revisi�n de est�ndares.
 * */


/*
 * NOMBRE DE LA VISTA:           info_Doctor
 * TIPO:                         Vista de Directorio
 *
 * DESCRIPCI�N:
 * Provee una ficha p�blica del m�dico combinando su informaci�n personal,
 * profesional y log�stica. Es la fuente principal para que los pacientes
 * elijan doctor.
 *
 * CARACTER�STICAS:
 * - Joins: [usuarioSistema], [horarioEmpleado], [doctor], [consultorio], [especialidad], [contacto].
 * - Filtros: Muestra todos los doctores..
 *
 * CAMPOS PRINCIPALES:
 * - Nombre Completo, C�dula, Especialidad.
 * - Ubicaci�n (Consultorio) y Horarios de atenci�n (D�a, Desde, Hasta).
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
 * NOMBRE DE LA VISTA:           info_Citas
 * TIPO:                         Vista Operativa (Agenda Activa)
 *
 * DESCRIPCI�N:
 * Reporte de citas que ya han sido pagadas y confirmadas, pero que a�n no
 * han sido atendidas. Es vital para la pantalla de recepci�n y la agenda
 * diaria del m�dico.
 *
 * CARACTER�STICAS:
 * - Filtro Cr�tico: estatusCita = 'PagadaPendAtender'.
 * - Joins: Conecta Doctor, Paciente (ambos desde usuarioSistema), Cita y Consultorio.
 *
 * CAMPOS PRINCIPALES:
 * - Nombres completos de Doctor y Paciente.
 * - Fecha/Hora Inicio y Fin.
 * - Ubicaci�n f�sica.
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
JOIN usuarioSistema p ON p.idUsuario = ci.idPaciente 
JOIN especialidad es ON es.idEspecialidad = doc.idEspecialidad
JOIN consultorio c ON c.idConsultorio = doc.idConsultorio;
GO


/*
 * NOMBRE DE LA VISTA:           info_padecimientos
 * TIPO:                         Vista de Expediente Cl�nico
 *
 * DESCRIPCI�N:
 * Resumen cl�nico de alertas importantes del paciente. Muestra tanto
 * alergias como padecimientos cr�nicos registrados.
 *
 * CARACTER�STICAS:
 * - Uso: Pantalla de alerta para el m�dico antes de recetar.
 * - Joins: [paciente], [usuarioSistema], [pacienteAlergiaPadecimiento], [alergiaPadecimiento].
 *
 * CAMPOS PRINCIPALES:
 * - Paciente, Diagn�stico (Nombre de alergia/enfermedad), Tipo, Severidad, Reacci�n.
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
 * NOMBRE DE LA VISTA:           info_Servicios
 * TIPO:                         Vista de Cat�logo de Servicios
 *
 * DESCRIPCI�N:
 * Registro de servicios aplicados (enfermer�a, curaciones, etc.) disponibles,
 * vinculando directamente al personal responsable.
 *
 * CARACTER�STICAS:
 * - Joins: [usuarioSistema] (filtrado impl�citamente por la tabla servicio), [servicio].
 *
 * CAMPOS PRINCIPALES:
 * - Nombre de la Enfermera/o, Descripci�n del servicio, Tipo.
 */
CREATE VIEW info_Servicios AS
SELECT
     en.nombre + ' ' + en.apPat + ' ' + ISNULL(en.apMat, '') AS Enfermera,
     ser.descripcion,
     ser.tipo
FROM usuarioSistema en
JOIN servicio ser ON ser.idEnfermera = en.idUsuario;
GO


/*
 * NOMBRE DE LA VISTA:           info_Farmaceutico
 * TIPO:                         Vista de Directorio
 *
 * DESCRIPCIÓN:
 * Provee una ficha del farmacéutico combinando su información personal,
 * laboral y de horario. Es útil para directorios y gestión de personal.
 *
 * CARACTERÍSTICAS:
 * - Joins: [usuarioSistema], [horarioEmpleado], [farmaceutico], [empleado], [contacto].
 * - Filtros: Muestra todos los farmacéuticos.
 *
 * CAMPOS PRINCIPALES:
 * - Nombre Completo, CURP, Estatus, Salario.
 * - Horarios de atención (Día, Desde, Hasta).
 * - Contacto (Correo).
 */
CREATE VIEW info_Farmaceutico AS
SELECT
    d.nombre + ' ' + d.apPat + ' ' + ISNULL(d.apMat,' ') AS Nombre,
    d.curp AS CURP,
    e.estatus AS Estatus,
    e.salario AS Salario,
    co.correoPersonal AS Correo,
    h.diaSemana AS Dia,
    h.horaInicio AS Desde,
    h.horaFin AS Hasta
FROM usuarioSistema d
JOIN horarioEmpleado h ON d.idUsuario = h.idUsuario
JOIN farmaceutico f ON d.idUsuario = f.idUsuario
JOIN empleado e ON d.idUsuario = e.idUsuario
JOIN contacto co ON co.idContacto = d.idContacto;
GO


/*
 * NOMBRE DE LA VISTA:           info_Recepcionista
 * TIPO:                         Vista de Directorio
 *
 * DESCRIPCIÓN:
 * Provee una ficha de la recepcionista combinando su información personal,
 * laboral y de horario. Es útil para directorios y gestión de personal.
 *
 * CARACTERÍSTICAS:
 * - Joins: [usuarioSistema], [horarioEmpleado], [recepcionistum], [empleado], [contacto].
 * - Filtros: Muestra todas las recepcionistas.
 *
 * CAMPOS PRINCIPALES:
 * - Nombre Completo, CURP, Estatus, Salario.
 * - Horarios de atención (Día, Desde, Hasta).
 * - Contacto (Correo).
 */
CREATE VIEW info_Recepcionista AS
SELECT
    d.nombre + ' ' + d.apPat + ' ' + ISNULL(d.apMat,' ') AS Nombre,
    d.curp AS CURP,
    e.estatus AS Estatus,
    e.salario AS Salario,
    co.correoPersonal AS Correo,
    h.diaSemana AS Dia,
    h.horaInicio AS Desde,
    h.horaFin AS Hasta
FROM usuarioSistema d
JOIN horarioEmpleado h ON d.idUsuario = h.idUsuario
JOIN recepcionista r ON d.idUsuario = r.idUsuario
JOIN empleado e ON d.idUsuario = e.idUsuario
JOIN contacto co ON co.idContacto = d.idContacto;
GO


SELECT * FROM info_Doctor; 
SELECT * FROM info_Citas; 
SELECT * FROM info_padecimientos; 
SELECT * FROM info_Servicios;
SELECT * FROM info_Farmaceutico;
SELECT * FROM info_Recepcionista; 