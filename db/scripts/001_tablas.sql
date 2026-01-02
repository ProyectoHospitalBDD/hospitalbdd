/*CREATE DATABASE hospitalBD
*/
USE hospitalBD


CREATE TABLE dbo.contacto (
	idContacto	INT PRIMARY KEY IDENTITY (1,1),
	telCasa	NVARCHAR (20),
	telPersonal NVARCHAR (20) NOT NULL,
	correoPersonal NVARCHAR (256) NOT NULL,
	CONSTRAINT UQ_contactoCorreo UNIQUE (correoPersonal)
)

CREATE TABLE dbo.usuarioSistema (
	idUsuario INT PRIMARY KEY IDENTITY (1,1),
	nombre NVARCHAR (20) NOT NULL,
	apPat NVARCHAR (20) NOT NULL,
	apMat NVARCHAR (20) NULL,
	contrasena NVARCHAR (100) NOT NULL,
	tipoUsuario NVARCHAR (20) NOT NULL,
	curp CHAR (18) NOT NULL,
	idContacto INT,

	CONSTRAINT CK_usuarioTipo CHECK (tipoUsuario IN 
	(N'Paciente',N'Recepcionista',
	N'Doctor',N'Enfermera',N'Farmaceutico')),
	CONSTRAINT UQ_usuarioCURP UNIQUE (curp), 
	CONSTRAINT FK_usuarioContacto FOREIGN KEY (idContacto) 
	REFERENCES dbo.contacto (idContacto)
	ON DELETE SET NULL
)

CREATE TABLE dbo.empleado (
	idUsuario INT PRIMARY KEY REFERENCES dbo.usuarioSistema (idUsuario)
	ON DELETE CASCADE,
	estatus BIT NOT NULL,
	salario MONEY NOT NULL
)

CREATE TABLE dbo.horarioEmpleado (
    idHorarioE INT IDENTITY(1,1) PRIMARY KEY,
    diaSemana NVARCHAR(10) NOT NULL CHECK (diaSemana IN
        (N'Lunes', N'Martes', N'Miércoles', N'Jueves', N'Viernes', N'Sábado', N'Domingo')),
    horaInicio TIME NOT NULL,
    horaFin TIME NOT NULL,
    idUsuario INT NOT NULL,
    CONSTRAINT FK_horarioEmpleado FOREIGN KEY (idUsuario)
        REFERENCES dbo.empleado(idUsuario)
        ON DELETE CASCADE,
	CONSTRAINT CK_horarioRango CHECK (horaInicio < horaFin),
	CONSTRAINT UQ_horarioEmpleado UNIQUE (idUsuario, diaSemana)
)

CREATE TABLE dbo.paciente (
	idUsuario INT PRIMARY KEY REFERENCES dbo.usuarioSistema (idUsuario)
	ON DELETE CASCADE
)

CREATE TABLE dbo.recepcionista (
	idUsuario INT PRIMARY KEY REFERENCES dbo.empleado (idUsuario)
	ON DELETE CASCADE,
	esAdmin BIT NOT NULL
)

CREATE TABLE dbo.farmaceutico (
	idUsuario INT PRIMARY KEY REFERENCES dbo.empleado (idUsuario)
	ON DELETE CASCADE
)

CREATE TABLE dbo.enfermera (
	idUsuario INT PRIMARY KEY REFERENCES dbo.empleado (idUsuario)
	ON DELETE CASCADE
)

CREATE TABLE dbo.edificio (
	idEdificio INT IDENTITY(1,1) PRIMARY KEY,
	numPisos INT NOT NULL,
	superficie DECIMAL(10,2) NOT NULL,
	CONSTRAINT CK_edificioPisos CHECK (numPisos > 0),
    CONSTRAINT CK_edificioSuperficie CHECK (superficie > 0)
)

CREATE TABLE dbo.consultorio (
	idConsultorio INT IDENTITY(1,1) PRIMARY KEY,
	numero NVARCHAR(10) NOT NULL,
	superficie DECIMAL(10,2) NOT NULL,
	idEdificio INT NOT NULL,
	CONSTRAINT CK_consultorioSuperficie CHECK (superficie > 0),
	CONSTRAINT FK_consultorioEdificio FOREIGN KEY (idEdificio)
	    REFERENCES dbo.edificio (idEdificio),
	CONSTRAINT UQ_consultorio UNIQUE (idEdificio,numero)
)

CREATE TABLE dbo.especialidad (
	idEspecialidad INT IDENTITY(1,1) PRIMARY KEY,
	nombreEsp NVARCHAR(100) NOT NULL,
	anosEstu INT NOT NULL,
	costo MONEY NOT NULL,
	CONSTRAINT UQ_espNombre UNIQUE (nombreEsp),
	CONSTRAINT CK_anosEstu CHECK (anosEstu >= 0),
    CONSTRAINT CK_costoEsp CHECK (costo >= 0)
)

CREATE TABLE dbo.doctor (
	idUsuario INT PRIMARY KEY REFERENCES dbo.empleado (idUsuario)
	    ON DELETE CASCADE,
	cedula NVARCHAR(20) NOT NULL,
	idConsultorio INT NOT NULL,
	idEspecialidad INT NOT NULL,
	CONSTRAINT FK_doctorConsultorio FOREIGN KEY (idConsultorio)
	    REFERENCES dbo.consultorio (idConsultorio),
	CONSTRAINT FK_doctorEspecialidad FOREIGN KEY (idEspecialidad)
	    REFERENCES dbo.especialidad (idEspecialidad),
	CONSTRAINT UQ_doctorCedula UNIQUE (cedula)
)


CREATE TABLE dbo.farmacia (
    idFarmacia INT IDENTITY(1,1) PRIMARY KEY,
    superficie DECIMAL(10,2) NOT NULL,
    idEdificio INT NULL,
    CONSTRAINT CK_Farmacia_Superficie CHECK (superficie > 0),
    CONSTRAINT FK_Farmacia_Edificio FOREIGN KEY (idEdificio)
        REFERENCES dbo.edificio(idEdificio) ON DELETE SET NULL
)

CREATE TABLE dbo.medicamento (
    idMedicamento INT IDENTITY(1,1) PRIMARY KEY,
    descripcion NVARCHAR(256) NOT NULL,
    tipo NVARCHAR(50) NOT NULL,            -- opcional: normalizar a catálogo
    capacidad NVARCHAR(50) NOT NULL,       
    precio MONEY NOT NULL,
    stock INT NOT NULL,                   
    caducidad DATE NOT NULL,
    idFarmacia INT NULL,
    CONSTRAINT CK_Med_Precio CHECK (precio >= 0),
    CONSTRAINT CK_Med_Stock CHECK (stock >= 0),
    CONSTRAINT FK_Med_Farmacia FOREIGN KEY (idFarmacia)
        REFERENCES dbo.farmacia(idFarmacia) ON DELETE SET NULL
)


CREATE TABLE dbo.servicio (
    idServicio INT IDENTITY(1,1) PRIMARY KEY,
    descripcion NVARCHAR(256) NOT NULL,
    tipo NVARCHAR(50) NOT NULL,            
    precio MONEY NOT NULL,
    stock INT NULL,                         
    idEnfermera INT NULL,                   
    CONSTRAINT CK_Serv_Precio CHECK (precio >= 0),
    CONSTRAINT CK_Serv_Stock CHECK (stock IS NULL OR stock >= 0),
    CONSTRAINT FK_Servicio_Enfermera FOREIGN KEY (idEnfermera)
        REFERENCES dbo.enfermera(idUsuario) ON DELETE SET NULL
)


CREATE TABLE dbo.ticket (
    idTicket INT IDENTITY(1,1) PRIMARY KEY,
    fecha DATETIME2 NOT NULL CONSTRAINT DF_Ticket_Fecha DEFAULT SYSUTCDATETIME(),
    idFarmacia INT NULL,
    idFarmaceutico INT NOT NULL,
    CONSTRAINT FK_Ticket_Farmacia FOREIGN KEY (idFarmacia)
        REFERENCES dbo.farmacia(idFarmacia) ON DELETE SET NULL,
    CONSTRAINT FK_Ticket_Farmaceutico FOREIGN KEY (idFarmaceutico)
        REFERENCES dbo.farmaceutico(idUsuario)
)

CREATE TABLE dbo.ticketMedicamento (
    idTicket INT NOT NULL,
    idMedicamento INT NOT NULL,
    cantidad INT NOT NULL,
    precioUnitario MONEY NOT NULL,   
    CONSTRAINT PK_TicketMed PRIMARY KEY (idTicket, idMedicamento),
    CONSTRAINT CK_TicketMed_Cantidad CHECK (cantidad > 0),
    CONSTRAINT CK_TicketMed_Precio CHECK (precioUnitario >= 0),
    CONSTRAINT FK_TicketMed_Ticket FOREIGN KEY (idTicket)
        REFERENCES dbo.ticket(idTicket) ON DELETE CASCADE,
    CONSTRAINT FK_TicketMed_Med FOREIGN KEY (idMedicamento)
        REFERENCES dbo.medicamento(idMedicamento)
)


CREATE TABLE dbo.ticketServicio (
    idTicket INT NOT NULL,
    idServicio INT NOT NULL,
    cantidad INT NOT NULL,
    precioUnitario MONEY NOT NULL,
    CONSTRAINT PK_TicketServ PRIMARY KEY (idTicket, idServicio),
    CONSTRAINT CK_TicketServ_Cantidad CHECK (cantidad > 0),
    CONSTRAINT CK_TicketServ_Precio CHECK (precioUnitario >= 0),
    CONSTRAINT FK_TicketServ_Ticket FOREIGN KEY (idTicket)
        REFERENCES dbo.ticket(idTicket) ON DELETE CASCADE,
    CONSTRAINT FK_TicketServ_Serv FOREIGN KEY (idServicio)
        REFERENCES dbo.servicio(idServicio)
)


CREATE TABLE dbo.pagoTicket (
    idPagoTicket INT IDENTITY(1,1) PRIMARY KEY,
    estatusPago NVARCHAR(15) NOT NULL,
    fechaPago DATE NOT NULL,
    horaPago TIME NOT NULL,
    idTicket INT NOT NULL,
    idFarmaceutico INT NULL,
    CONSTRAINT CK_Pago_Estatus CHECK (estatusPago IN (N'Pendiente', N'Pagado', N'Cancelado')),
    CONSTRAINT FK_Pago_Ticket FOREIGN KEY (idTicket)
        REFERENCES dbo.ticket(idTicket) ON DELETE CASCADE,
    CONSTRAINT FK_Pago_Farmaceutico FOREIGN KEY (idFarmaceutico)
        REFERENCES dbo.farmaceutico(idUsuario) ON DELETE SET NULL
)

CREATE TABLE dbo.cita (
    idCita INT IDENTITY(1,1) PRIMARY KEY,
    estatusCita NVARCHAR(25) NOT NULL, 
    fechaHoraInicio DATETIME2 NOT NULL,
    fechaHoraFin DATETIME2 NOT NULL,
    idDoctor INT NOT NULL,
    idPaciente INT NOT NULL,
    costo MONEY NOT NULL,

    CONSTRAINT CK_Cita_RangoHora CHECK (fechaHoraInicio < fechaHoraFin),
    CONSTRAINT CK_Cita_Estatus CHECK (estatusCita IN
    (N'AgendadaPendPago', N'PagadaPendAtender',
     N'CanceladaFaltaPago', N'CanceladaPaciente',
     N'CanceladaDoctor', N'Atendida', N'NoAcudio')),

    CONSTRAINT FK_Cita_Doctor FOREIGN KEY (idDoctor) REFERENCES dbo.doctor(idUsuario),
    CONSTRAINT FK_Cita_Paciente FOREIGN KEY (idPaciente) REFERENCES dbo.paciente(idUsuario),
    CONSTRAINT CK_Cita_Costo CHECK (costo >= 0)
)


CREATE TABLE dbo.pago (
    idPago INT IDENTITY(1,1) PRIMARY KEY,
    idCita INT NOT NULL,
    estatusPago NVARCHAR(15) NOT NULL CHECK (estatusPago IN (N'Pendiente', N'Pagado', N'Cancelado')),
    monto MONEY NOT NULL CHECK (monto >= 0),
    fechaPago DATE NULL, 
    horaPago TIME NULL,
    venceEn DATETIME2 NOT NULL,

    CONSTRAINT FK_Pago_Cita FOREIGN KEY (idCita) REFERENCES dbo.cita(idCita) ON DELETE CASCADE
)

CREATE TABLE dbo.receta (
    idReceta INT IDENTITY(1,1) PRIMARY KEY,
    idCita INT NOT NULL, 
    fechaReceta DATE NOT NULL,
    diagnostico NVARCHAR(500) NULL,
    observaciones NVARCHAR(500) NULL,
    CONSTRAINT FK_Receta_Cita FOREIGN KEY (idCita) REFERENCES dbo.cita(idCita) ON DELETE CASCADE
)


CREATE TABLE dbo.recetaMedicamento (
    idReceta INT NOT NULL,
    idMedicamento INT NOT NULL,
    indicaciones NVARCHAR(300) NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    CONSTRAINT PK_RecetaMed PRIMARY KEY (idReceta, idMedicamento),
    CONSTRAINT FK_RecetaMed_Receta FOREIGN KEY (idReceta) REFERENCES dbo.receta(idReceta) ON DELETE CASCADE,
    CONSTRAINT FK_RecetaMed_Med FOREIGN KEY (idMedicamento) REFERENCES dbo.medicamento(idMedicamento)
)

CREATE TABLE dbo.recetaServicio (
    idReceta INT NOT NULL,
    idServicio INT NOT NULL,
    indicaciones NVARCHAR(300) NULL,
    CONSTRAINT PK_RecetaServ PRIMARY KEY (idReceta, idServicio),
    CONSTRAINT FK_RecetaServ_Receta FOREIGN KEY (idReceta) REFERENCES dbo.receta(idReceta) ON DELETE CASCADE,
    CONSTRAINT FK_RecetaServ_Serv FOREIGN KEY (idServicio) REFERENCES dbo.servicio(idServicio)
)


CREATE TABLE dbo.historialMedico (
    idHistorialMedico INT IDENTITY(1,1) PRIMARY KEY,
    idPaciente INT NOT NULL,
    tipoSangre NVARCHAR(3) NOT NULL
        CHECK (tipoSangre IN (N'A+',N'A-',N'B+',N'B-',N'AB+',N'AB-',N'O+',N'O-')),
    pesoKg DECIMAL(6,2) NULL CHECK (pesoKg > 0),
    estaturaM DECIMAL(4,2) NULL CHECK (estaturaM > 0),
    CONSTRAINT FK_historialPaciente FOREIGN KEY (idPaciente) REFERENCES dbo.paciente(idUsuario) ON DELETE CASCADE,
    CONSTRAINT UQ_historialIdPaciente UNIQUE (idPaciente)
)


CREATE TABLE dbo.alergiaPadecimiento (
    idAlerPade INT IDENTITY(1,1) PRIMARY KEY,
    nombre NVARCHAR(200) NOT NULL,
    tipo NVARCHAR(15) NOT NULL CHECK (tipo IN (N'Alergia', N'Padecimiento')),
    nombreNormalizado AS LOWER(LTRIM(RTRIM(nombre))) PERSISTED, --no mayus ni espacios
    CONSTRAINT UQ_alergiaPadecimientoNombre UNIQUE (nombreNormalizado, tipo)
)


CREATE TABLE dbo.pacienteAlergiaPadecimiento (
    idPaciente INT NOT NULL,
    idAlerPade INT NOT NULL,
    severidad NVARCHAR(20) NULL,            -- ej. Leve/Moderada/Severa
    estado NVARCHAR(15) NULL CHECK (estado IN (N'Activo',N'Resuelto',N'Latente')),
    reaccion NVARCHAR(300) NULL,            -- ej. anafilaxia, urticaria
    fechaInicio DATE NULL,
    fechaFin DATE NULL,
    observaciones NVARCHAR(500) NULL,
    CONSTRAINT FK_pacienteTerminoAlerPade FOREIGN KEY (idAlerPade) REFERENCES dbo.alergiaPadecimiento (idAlerPade),
    CONSTRAINT pacienteTerminoPaciente FOREIGN KEY (idPaciente) REFERENCES dbo.paciente(idUsuario) ON DELETE CASCADE,
    CONSTRAINT PK_PacienteTermino PRIMARY KEY (idPaciente, idAlerPade)
)

--Corecciones de las tablas 

IF COL_LENGTH('dbo.pago','montoDevuelto') IS NULL
BEGIN
    ALTER TABLE dbo.pago 
    ADD montoDevuelto MONEY NULL 
        CONSTRAINT DF_pagoMontoDevuelto DEFAULT(0);
END
GO

IF OBJECT_ID('dbo.bitacoraEstatusCita','U') IS NULL
BEGIN
  CREATE TABLE dbo.bitacoraEstatusCita(
    idBitacora INT IDENTITY(1,1) PRIMARY KEY,
    idCita     INT NOT NULL,
    estatusCita NVARCHAR(25) NOT NULL,
    fechaMov   DATETIME2 NOT NULL CONSTRAINT DF_Bitacora_fechaMov DEFAULT (SYSUTCDATETIME()),
    fechaCitaInicio DATETIME2 NULL,
    fechaCitaFin    DATETIME2 NULL,
    idPaciente INT NULL,
    idDoctor  INT NULL,
    costo MONEY NULL,
    politica NVARCHAR(50) NULL,
    montoDevuelto MONEY NULL
  );

  CREATE INDEX IX_Bitacora_Cita 
    ON dbo.bitacoraEstatusCita(idCita, fechaMov DESC);
END
GO

-- 2) Duración + columna calculada de fin

IF COL_LENGTH('dbo.cita','duracionMin') IS NULL
BEGIN
  ALTER TABLE dbo.cita 
    ADD duracionMin INT NOT NULL 
      CONSTRAINT DF_cita_duracion DEFAULT(30);
END
GO

IF COL_LENGTH('dbo.cita','fechaHoraFin') IS NULL
BEGIN
  ALTER TABLE dbo.cita
    ADD fechaHoraFin AS DATEADD(MINUTE, duracionMin, fechaHoraInicio) PERSISTED;
END
GO

-- 3) Duraciones permitidas (30,60,90)

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name='CK_Cita_Duracion_30_60_90')
BEGIN
  ALTER TABLE dbo.cita WITH CHECK
  ADD CONSTRAINT CK_Cita_Duracion_30_60_90
  CHECK (duracionMin IN (30,60,90));
END
GO

----------------------------------------------------
-- 1. Quitar constraint e índice que dependen de fechaHoraFin
----------------------------------------------------
IF OBJECT_ID('CK_Cita_RangoHora', 'C') IS NOT NULL
BEGIN
    ALTER TABLE dbo.cita DROP CONSTRAINT CK_Cita_RangoHora;
END
GO

IF EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_CitaDoctorFecha'
      AND object_id = OBJECT_ID('dbo.cita')
)
BEGIN
    DROP INDEX IX_CitaDoctorFecha ON dbo.cita;
END
GO

----------------------------------------------------
-- 2. Borrar la columna normal fechaHoraFin (si no es calculada)
----------------------------------------------------
IF EXISTS (
    SELECT 1
    FROM sys.columns
    WHERE object_id = OBJECT_ID('dbo.cita')
      AND name = 'fechaHoraFin'
      AND is_computed = 0
)
BEGIN
    ALTER TABLE dbo.cita DROP COLUMN fechaHoraFin;
END
GO

----------------------------------------------------
-- 3. Crear fechaHoraFin como columna calculada PERSISTED
----------------------------------------------------
IF NOT EXISTS (
    SELECT 1
    FROM sys.columns
    WHERE object_id = OBJECT_ID('dbo.cita')
      AND name = 'fechaHoraFin'
      AND is_computed = 1
)
BEGIN
    ALTER TABLE dbo.cita
    ADD fechaHoraFin AS DATEADD(MINUTE, duracionMin, fechaHoraInicio) PERSISTED;
END
GO

----------------------------------------------------
-- 4. Volver a crear el CHECK y el índice
----------------------------------------------------
IF OBJECT_ID('CK_Cita_RangoHora', 'C') IS NULL
BEGIN
    ALTER TABLE dbo.cita WITH NOCHECK
    ADD CONSTRAINT CK_Cita_RangoHora
        CHECK (fechaHoraFin > fechaHoraInicio);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_CitaDoctorFecha'
      AND object_id = OBJECT_ID('dbo.cita')
)
BEGIN
    CREATE INDEX IX_CitaDoctorFecha
      ON dbo.cita(idDoctor, fechaHoraInicio)
      INCLUDE (fechaHoraFin, estatusCita);
END
GO

--añadidos de hash

-- passwordHash
IF COL_LENGTH('dbo.usuarioSistema', 'passwordHash') IS NULL
BEGIN
    ALTER TABLE dbo.usuarioSistema
    ADD passwordHash VARBINARY(64) NULL;   -- 64 bytes suele ser suficiente para PBKDF2-SHA256
END
GO

-- passwordSalt
IF COL_LENGTH('dbo.usuarioSistema', 'passwordSalt') IS NULL
BEGIN
    ALTER TABLE dbo.usuarioSistema
    ADD passwordSalt VARBINARY(32) NULL;   
END
GO

-- passwordIterations
IF COL_LENGTH('dbo.usuarioSistema', 'passwordIterations') IS NULL
BEGIN
    ALTER TABLE dbo.usuarioSistema
    ADD passwordIterations INT NOT NULL
        CONSTRAINT DF_usuarioSistema_passwordIterations DEFAULT(100000); -- mismo valor para todos
END
GO
