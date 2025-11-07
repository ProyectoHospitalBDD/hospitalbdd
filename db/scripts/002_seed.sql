USE hospitalBD;

-- Contacto + usuario (paciente)
INSERT INTO dbo.contacto (telPersonal, correoPersonal)
VALUES (N'5551112222', N'paciente@demo.com');

INSERT INTO dbo.usuarioSistema (nombre, apPat, contrasena, tipoUsuario, curp, idContacto)
VALUES (N'Juan', N'Pérez', N'1234', N'Paciente', N'AAAA010101HDFXXX00', SCOPE_IDENTITY());

DECLARE @idPaciente INT = SCOPE_IDENTITY();
INSERT INTO dbo.paciente (idUsuario) VALUES (@idPaciente);

-- Contacto + usuario (empleado → doctor)
INSERT INTO dbo.contacto (telPersonal, correoPersonal)
VALUES (N'5553334444', N'dr.house@demo.com');

INSERT INTO dbo.usuarioSistema (nombre, apPat, contrasena, tipoUsuario, curp, idContacto)
VALUES (N'Gregory', N'House', N'1234', N'Doctor', N'BBBB010101HDFXXX00', SCOPE_IDENTITY());
DECLARE @idUsuarioDoc INT = SCOPE_IDENTITY();

INSERT INTO dbo.empleado (idUsuario, estatus, salario) VALUES (@idUsuarioDoc, 1, 50000);

INSERT INTO dbo.edificio (numPisos, superficie) VALUES (3, 250.00);
DECLARE @idEdificio INT = SCOPE_IDENTITY();

INSERT INTO dbo.consultorio (numero, superficie, idEdificio) VALUES (N'101', 12.5, @idEdificio);
DECLARE @idConsultorio INT = SCOPE_IDENTITY();

INSERT INTO dbo.especialidad (nombreEsp, anosEstu, costo) VALUES (N'Diagnóstico', 4, 800);
DECLARE @idEspecialidad INT = SCOPE_IDENTITY();

INSERT INTO dbo.doctor (idUsuario, cedula, idConsultorio, idEspecialidad)
VALUES (@idUsuarioDoc, N'CED123', @idConsultorio, @idEspecialidad);

-- Horario (Lunes 09:00-13:00)
INSERT INTO dbo.horarioEmpleado (diaSemana, horaInicio, horaFin, idUsuario)
VALUES (N'Lunes', '09:00', '13:00', @idUsuarioDoc);
