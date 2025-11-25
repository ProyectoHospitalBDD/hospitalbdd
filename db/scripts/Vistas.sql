--USE hospitalBD
/*
VISTA 1 INFORMACION BASICA DE DOCTOR PARA SER CONSULTADA POR PACIENTES
*/
CREATE VIEW info_Doctor AS
SELECT
d.nombre+' '+d.apPat++' '+ISNULL(d.apMat,' ') AS Nombre,
ce.cedula,
es.nombreEsp AS Especialidad,
co.correoPersonal,
c.numero AS Consultorio,
h.diaSemana AS Dia,
h.horaInicio AS Desde,
h.horaFin AS Hasta
FROM usuarioSistema d
JOIN horarioEmpleado h ON d.idUsuario=h.idUsuario
JOIN doctor ce ON d.idUsuario=ce.idUsuario
JOIN consultorio c ON ce.idConsultorio=c.idConsultorio
JOIN especialidad es ON ce.idEspecialidad=es.idEspecialidad
JOIN contacto co ON co.idContacto=d.idContacto;
GO

/*
VISTA 2 CITAS CONFIRMADAS PERO QUE AÚN NO SUCEDEN
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
JOIN usuarioSistema p ON p.idUsuario = ci.idPaciente  -- paciente
JOIN especialidad es ON es.idEspecialidad = doc.idEspecialidad
JOIN consultorio c ON c.idConsultorio = doc.idConsultorio;
GO

/*
VISTA 3 PADECIMIENTOS Y ALERGIAS DEL PACIENTE
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
JOIN usuarioSistema p ON paciente.idUsuario=p.idUsuario
JOIN pacienteAlergiaPadecimiento pac ON pac.idPaciente=paciente.idUsuario
JOIN alergiaPadecimiento pa ON pa.idAlerPade=pac.idAlerPade;
GO

/*
VISTA 4 
*/
CREATE VIEW info_Servicios AS
SELECT
     en.nombre + ' ' + en.apPat + ' ' + ISNULL(en.apMat, '') AS Enfermera,
     ser.descripcion,
     ser.tipo
FROM usuarioSistema en
JOIN servicio ser ON ser.idEnfermera=en.idUsuario
GO

