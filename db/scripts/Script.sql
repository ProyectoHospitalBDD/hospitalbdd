-----------------------Edificios---------------------------------------------------
INSERT INTO dbo.edificio (numPisos, superficie) 
VALUES (2, 250.00);
DECLARE @idEdificio1 INT = SCOPE_IDENTITY();

INSERT INTO dbo.edificio (numPisos, superficie) 
VALUES (2, 250.00);
DECLARE @idEdificio2 INT = SCOPE_IDENTITY();
-----------------------------------------------------------------------------------
-----------------------Especialidad------------------------------------------------
INSERT INTO dbo.especialidad (nombreEsp, anosEstu, costo) 
VALUES (N'Cardiolog�a', 12, 1500);
DECLARE @idEspecialidad1 INT = SCOPE_IDENTITY();
INSERT INTO dbo.especialidad (nombreEsp, anosEstu, costo) 
VALUES (N'Dermatolog�a', 10, 1200);
DECLARE @idEspecialidad2 INT = SCOPE_IDENTITY();
INSERT INTO dbo.especialidad (nombreEsp, anosEstu, costo) 
VALUES (N'Ginecolog�a', 10, 950);
DECLARE @idEspecialidad3 INT = SCOPE_IDENTITY();
INSERT INTO dbo.especialidad (nombreEsp, anosEstu, costo) 
VALUES (N'M�dico General', 6, 250);
DECLARE @idEspecialidad4 INT = SCOPE_IDENTITY();
INSERT INTO dbo.especialidad (nombreEsp, anosEstu, costo) 
VALUES (N'Nefrolog�a', 8, 1300);
DECLARE @idEspecialidad5 INT = SCOPE_IDENTITY();
INSERT INTO dbo.especialidad (nombreEsp, anosEstu, costo) 
VALUES (N'Nutriolog�a', 5, 800);
DECLARE @idEspecialidad6 INT = SCOPE_IDENTITY();
INSERT INTO dbo.especialidad (nombreEsp, anosEstu, costo) 
VALUES (N'Oftanmolog�a', 12, 1000);
DECLARE @idEspecialidad7 INT = SCOPE_IDENTITY();
INSERT INTO dbo.especialidad (nombreEsp, anosEstu, costo) 
VALUES (N'Oncolog�a', 14, 1700);
DECLARE @idEspecialidad8 INT = SCOPE_IDENTITY();
INSERT INTO dbo.especialidad (nombreEsp, anosEstu, costo) 
VALUES (N'Ortopedia', 10, 1250);
DECLARE @idEspecialidad9 INT = SCOPE_IDENTITY();
INSERT INTO dbo.especialidad (nombreEsp, anosEstu, costo) 
VALUES (N'Pediatr�a', 11, 1350);
DECLARE @idEspecialidad10 INT = SCOPE_IDENTITY();
INSERT INTO dbo.especialidad (nombreEsp, anosEstu, costo) 
VALUES (N'Proctolog�a', 13, 1150);
DECLARE @idEspecialidad11 INT = SCOPE_IDENTITY();
INSERT INTO dbo.especialidad (nombreEsp, anosEstu, costo) 
VALUES (N'Psiclog�a', 5, 700);
DECLARE @idEspecialidad12 INT = SCOPE_IDENTITY();
INSERT INTO dbo.especialidad (nombreEsp, anosEstu, costo) 
VALUES (N'Fisioterapia', 4, 900);
DECLARE @idEspecialidad13 INT = SCOPE_IDENTITY();
INSERT INTO dbo.especialidad (nombreEsp, anosEstu, costo) 
VALUES (N'Podolog�a', 4, 500);
DECLARE @idEspecialidad14 INT = SCOPE_IDENTITY();
INSERT INTO dbo.especialidad (nombreEsp, anosEstu, costo) 
VALUES (N'Ortodoncia', 9, 850);
DECLARE @idEspecialidad15 INT = SCOPE_IDENTITY();
INSERT INTO dbo.especialidad (nombreEsp, anosEstu, costo) 
VALUES (N'Odontolog�a', 7, 750);
DECLARE @idEspecialidad16 INT = SCOPE_IDENTITY();
INSERT INTO dbo.especialidad (nombreEsp, anosEstu, costo) 
VALUES (N'Obstetricia', 14, 1100);
DECLARE @idEspecialidad17 INT = SCOPE_IDENTITY();
-----------------------------------------------------------------------------------
-----------------------Consultorio-------------------------------------------------
INSERT INTO dbo.consultorio (numero, superficie, idEdificio) 
VALUES (N'111', 12.5, @idEdificio1);
DECLARE @idConsultorio1 INT = SCOPE_IDENTITY();
INSERT INTO dbo.consultorio (numero, superficie, idEdificio) 
VALUES (N'112', 12.5, @idEdificio1);
DECLARE @idConsultorio2 INT = SCOPE_IDENTITY();
INSERT INTO dbo.consultorio (numero, superficie, idEdificio) 
VALUES (N'113', 12.5, @idEdificio1);
DECLARE @idConsultorio3 INT = SCOPE_IDENTITY();
INSERT INTO dbo.consultorio (numero, superficie, idEdificio) 
VALUES (N'114', 12.5, @idEdificio1);
DECLARE @idConsultorio4 INT = SCOPE_IDENTITY();
INSERT INTO dbo.consultorio (numero, superficie, idEdificio) 
VALUES (N'115', 12.5, @idEdificio1);
DECLARE @idConsultorio5 INT = SCOPE_IDENTITY();
INSERT INTO dbo.consultorio (numero, superficie, idEdificio) 
VALUES (N'121', 12.5, @idEdificio1);
DECLARE @idConsultorio6 INT = SCOPE_IDENTITY();
INSERT INTO dbo.consultorio (numero, superficie, idEdificio) 
VALUES (N'122', 12.5, @idEdificio1);
DECLARE @idConsultorio7 INT = SCOPE_IDENTITY();
INSERT INTO dbo.consultorio (numero, superficie, idEdificio) 
VALUES (N'123', 12.5, @idEdificio1);
DECLARE @idConsultorio8 INT = SCOPE_IDENTITY();
INSERT INTO dbo.consultorio (numero, superficie, idEdificio) 
VALUES (N'124', 12.5, @idEdificio1);
DECLARE @idConsultorio9 INT = SCOPE_IDENTITY();
INSERT INTO dbo.consultorio (numero, superficie, idEdificio) 
VALUES (N'211', 12.5, @idEdificio2);
DECLARE @idConsultorio10 INT = SCOPE_IDENTITY();
INSERT INTO dbo.consultorio (numero, superficie, idEdificio) 
VALUES (N'212', 12.5, @idEdificio2);
DECLARE @idConsultorio11 INT = SCOPE_IDENTITY();
INSERT INTO dbo.consultorio (numero, superficie, idEdificio) 
VALUES (N'213', 12.5, @idEdificio2);
DECLARE @idConsultorio12 INT = SCOPE_IDENTITY();
INSERT INTO dbo.consultorio (numero, superficie, idEdificio) 
VALUES (N'214', 12.5, @idEdificio2);
DECLARE @idConsultorio13 INT = SCOPE_IDENTITY();
INSERT INTO dbo.consultorio (numero, superficie, idEdificio) 
VALUES (N'215', 12.5, @idEdificio2);
DECLARE @idConsultorio14 INT = SCOPE_IDENTITY();
INSERT INTO dbo.consultorio (numero, superficie, idEdificio) 
VALUES (N'221', 12.5, @idEdificio2);
DECLARE @idConsultorio15 INT = SCOPE_IDENTITY();
INSERT INTO dbo.consultorio (numero, superficie, idEdificio) 
VALUES (N'222', 12.5, @idEdificio2);
DECLARE @idConsultorio16 INT = SCOPE_IDENTITY();
INSERT INTO dbo.consultorio (numero, superficie, idEdificio) 
VALUES (N'223', 12.5, @idEdificio2);
DECLARE @idConsultorio17 INT = SCOPE_IDENTITY();
-----------------------------------------------------------------------------------
-----------------------Farmacia----------------------------------------------------
INSERT INTO dbo.farmacia (superficie,idEdificio) 
VALUES ('12.5',@idEdificio1);
DECLARE @idfarmacia1 INT = SCOPE_IDENTITY();
INSERT INTO dbo.farmacia (superficie,idEdificio) 
VALUES ('25',@idEdificio2);
DECLARE @idfarmacia2 INT = SCOPE_IDENTITY();
-----------------------------------------------------------------------------------
-----------------------Farmaceutico--------------------------------------------------
DECLARE @idFarmaceutico1 INT = (SELECT TOP 1 idUsuario FROM dbo.farmaceutico ORDER BY idUsuario ASC);
DECLARE @idFarmaceutico2 INT = (SELECT TOP 1 idUsuario FROM dbo.farmaceutico ORDER BY idUsuario DESC);
-----------------------------------------------------------------------------------
-----------------------Medicamento-------------------------------------------------
INSERT INTO dbo.medicamento (descripcion, tipo, capacidad, precio, stock, caducidad, idFarmacia)
VALUES (N'Paracetamol 500mg', N'Analg�sico', N'Caja 20 tabletas', 25.00, 100, '2026-12-31', @idFarmacia1);
DECLARE @idMedicamento1 INT = SCOPE_IDENTITY();

INSERT INTO dbo.medicamento (descripcion, tipo, capacidad, precio, stock, caducidad, idFarmacia)
VALUES (N'Amoxicilina 500mg', N'Antibi�tico', N'Caja 12 c�psulas', 85.50, 50, '2025-10-15', @idFarmacia1);
DECLARE @idMedicamento2 INT = SCOPE_IDENTITY();

INSERT INTO dbo.medicamento (descripcion, tipo, capacidad, precio, stock, caducidad, idFarmacia)
VALUES (N'Ibuprofeno 400mg', N'Antiinflamatorio', N'Caja 10 tabletas', 35.00, 80, '2026-05-20', @idFarmacia1);
DECLARE @idMedicamento3 INT = SCOPE_IDENTITY();

INSERT INTO dbo.medicamento (descripcion, tipo, capacidad, precio, stock, caducidad, idFarmacia)
VALUES (N'Metformina 850mg', N'Antidiab�tico', N'Frasco 30 tabletas', 120.00, 40, '2025-08-01', @idFarmacia1);
DECLARE @idMedicamento4 INT = SCOPE_IDENTITY();

INSERT INTO dbo.medicamento (descripcion, tipo, capacidad, precio, stock, caducidad, idFarmacia)
VALUES (N'Losart�n 50mg', N'Antihipertensivo', N'Caja 30 grageas', 150.00, 60, '2027-01-10', @idFarmacia1);
DECLARE @idMedicamento5 INT = SCOPE_IDENTITY();

INSERT INTO dbo.medicamento (descripcion, tipo, capacidad, precio, stock, caducidad, idFarmacia)
VALUES (N'Antiflu-Des', N'Antigripal', N'Caja 24 c�psulas', 95.00, 200, '2026-11-30', @idFarmacia2);
DECLARE @idMedicamento6 INT = SCOPE_IDENTITY();

INSERT INTO dbo.medicamento (descripcion, tipo, capacidad, precio, stock, caducidad, idFarmacia)
VALUES (N'Complejo B', N'Vitam�nico', N'Frasco 60 tabletas', 180.00, 30, '2025-09-25', @idFarmacia2);
DECLARE @idMedicamento7 INT = SCOPE_IDENTITY();

INSERT INTO dbo.medicamento (descripcion, tipo, capacidad, precio, stock, caducidad, idFarmacia)
VALUES (N'Omeprazol 20mg', N'Anti�cido', N'Frasco 14 c�psulas', 45.00, 90, '2026-03-15', @idFarmacia2);
DECLARE @idMedicamento8 INT = SCOPE_IDENTITY();

INSERT INTO dbo.medicamento (descripcion, tipo, capacidad, precio, stock, caducidad, idFarmacia)
VALUES (N'Loratadina 10mg', N'Antihistam�nico', N'Caja 10 tabletas', 30.00, 75, '2027-06-05', @idFarmacia2);
DECLARE @idMedicamento9 INT = SCOPE_IDENTITY();

INSERT INTO dbo.medicamento (descripcion, tipo, capacidad, precio, stock, caducidad, idFarmacia)
VALUES (N'Alcohol Et�lico', N'Antis�ptico', N'Botella 500ml', 28.00, 50, '2028-01-01', @idFarmacia2);
DECLARE @idMedicamento10 INT = SCOPE_IDENTITY();
-----------------------------------------------------------------------------------
-----------------------Ticket------------------------------------------------------
--FALTAN FARMACEUTICOS
INSERT INTO dbo.ticket (fecha,idFarmacia,idFarmaceutico) 
VALUES ('2025-11-20 13:20:40',@idfarmacia1,@idFarmaceutico1);
DECLARE @idTicket1 INT = SCOPE_IDENTITY();
INSERT INTO dbo.ticket (fecha,idFarmacia,idFarmaceutico) 
VALUES ('2025-04-11 10:54:12',@idfarmacia1,@idFarmaceutico1);
DECLARE @idTicket2 INT = SCOPE_IDENTITY();
INSERT INTO dbo.ticket (fecha,idFarmacia,idFarmaceutico) 
VALUES ('2025-09-30 18:17:33',@idfarmacia1,@idFarmaceutico1);
DECLARE @idTicket3 INT = SCOPE_IDENTITY();
INSERT INTO dbo.ticket (fecha,idFarmacia,idFarmaceutico) 
VALUES ('2025-01-06 15:34:02',@idfarmacia1,@idFarmaceutico1);
DECLARE @idTicket4 INT = SCOPE_IDENTITY();
INSERT INTO dbo.ticket (fecha,idFarmacia,idFarmaceutico) 
VALUES ('2025-03-12 09:14:27',@idfarmacia1,@idFarmaceutico1);
DECLARE @idTicket5 INT = SCOPE_IDENTITY();
INSERT INTO dbo.ticket (fecha,idFarmacia,idFarmaceutico) 
VALUES ('2025-10-09 12:46:19',@idfarmacia2,@idFarmaceutico2);
DECLARE @idTicket6 INT = SCOPE_IDENTITY();
INSERT INTO dbo.ticket (fecha,idFarmacia,idFarmaceutico) 
VALUES ('2025-02-24 08:24:57',@idfarmacia2,@idFarmaceutico2);
DECLARE @idTicket7 INT = SCOPE_IDENTITY();
INSERT INTO dbo.ticket (fecha,idFarmacia,idFarmaceutico) 
VALUES ('2025-04-30 19:53:05',@idfarmacia2,@idFarmaceutico2);
DECLARE @idTicket8 INT = SCOPE_IDENTITY();
INSERT INTO dbo.ticket (fecha,idFarmacia,idFarmaceutico) 
VALUES ('2025-07-18 16:41:52',@idfarmacia2,@idFarmaceutico2);
DECLARE @idTicket9 INT = SCOPE_IDENTITY();
INSERT INTO dbo.ticket (fecha,idFarmacia,idFarmaceutico) 
VALUES ('2025-09-27 21:18:35',@idfarmacia2,@idFarmaceutico2);
DECLARE @idTicket10 INT = SCOPE_IDENTITY();
-----------------------------------------------------------------------------------
-----------------------PAGO TICKET-------------------------------------------------
--FALTAN FARMACEUTICOS
INSERT INTO dbo.pagoTicket (estatusPago, fechaPago,horaPago,idTicket,idFarmaceutico) 
VALUES ('Pagado','2025-10-22','12:34:52',@idTicket1,@idFarmaceutico1);
DECLARE @idpagoTicket1 INT = SCOPE_IDENTITY();
INSERT INTO dbo.pagoTicket (estatusPago, fechaPago,horaPago,idTicket,idFarmaceutico) 
VALUES ('Pagado','2025-08-13','17:20:30',@idTicket2,@idFarmaceutico1);
DECLARE @idpagoTicket2 INT = SCOPE_IDENTITY();
INSERT INTO dbo.pagoTicket (estatusPago, fechaPago,horaPago,idTicket,idFarmaceutico) 
VALUES ('Pendiente','2025-11-15','08:19:40',@idTicket3,@idFarmaceutico1);
DECLARE @idpagoTicket3 INT = SCOPE_IDENTITY();
INSERT INTO dbo.pagoTicket (estatusPago, fechaPago,horaPago,idTicket,idFarmaceutico) 
VALUES ('Pagado','2025-01-08','16:15:01',@idTicket4,@idFarmaceutico1);
DECLARE @idpagoTicket4 INT = SCOPE_IDENTITY();
INSERT INTO dbo.pagoTicket (estatusPago, fechaPago,horaPago,idTicket,idFarmaceutico) 
VALUES ('Pendiente','2025-06-29','11:54:40',@idTicket5,@idFarmaceutico1);
DECLARE @idpagoTicket5 INT = SCOPE_IDENTITY();
INSERT INTO dbo.pagoTicket (estatusPago, fechaPago,horaPago,idTicket,idFarmaceutico) 
VALUES ('Cancelado','2025-03-01','19:08:33',@idTicket6,@idFarmaceutico2);
DECLARE @idpagoTicket6 INT = SCOPE_IDENTITY();
INSERT INTO dbo.pagoTicket (estatusPago, fechaPago,horaPago,idTicket,idFarmaceutico) 
VALUES ('Pagado','2025-09-30','10:30:54',@idTicket7,@idFarmaceutico2);
DECLARE @idpagoTicket7 INT = SCOPE_IDENTITY();
INSERT INTO dbo.pagoTicket (estatusPago, fechaPago,horaPago,idTicket,idFarmaceutico) 
VALUES ('Cancelado','2025-02-28','15:00:27',@idTicket8,@idFarmaceutico2);
DECLARE @idpagoTicket8 INT = SCOPE_IDENTITY();
INSERT INTO dbo.pagoTicket (estatusPago, fechaPago,horaPago,idTicket,idFarmaceutico) 
VALUES ('Pagado','2025-04-13','20:52:16',@idTicket9,@idFarmaceutico2);
DECLARE @idpagoTicket9 INT = SCOPE_IDENTITY();
INSERT INTO dbo.pagoTicket (estatusPago, fechaPago,horaPago,idTicket,idFarmaceutico) 
VALUES ('Pendiente','2025-05-03','11:24:08',@idTicket10,@idFarmaceutico2);
DECLARE @idpagoTicket10 INT = SCOPE_IDENTITY();
-----------------------------------------------------------------------------------
-----------------------ticketMedicamento-------------------------------------------
INSERT INTO dbo.ticketMedicamento(idTicket, idMedicamento,cantidad,precioUnitario) 
VALUES (@idTicket1,@idMedicamento1,2,120.00);
INSERT INTO dbo.ticketMedicamento(idTicket, idMedicamento,cantidad,precioUnitario) 
VALUES (@idTicket2,@idMedicamento2,1,100.00);
INSERT INTO dbo.ticketMedicamento(idTicket, idMedicamento,cantidad,precioUnitario) 
VALUES (@idTicket3,@idMedicamento3,3,50.00);
INSERT INTO dbo.ticketMedicamento(idTicket, idMedicamento,cantidad,precioUnitario) 
VALUES (@idTicket4,@idMedicamento4,1,200.00);
INSERT INTO dbo.ticketMedicamento(idTicket, idMedicamento,cantidad,precioUnitario) 
VALUES (@idTicket5,@idMedicamento5,1,64.00);
INSERT INTO dbo.ticketMedicamento(idTicket, idMedicamento,cantidad,precioUnitario) 
VALUES (@idTicket6,@idMedicamento6,3,100.00);
INSERT INTO dbo.ticketMedicamento(idTicket, idMedicamento,cantidad,precioUnitario) 
VALUES (@idTicket7,@idMedicamento7,1,400.00);
INSERT INTO dbo.ticketMedicamento(idTicket, idMedicamento,cantidad,precioUnitario) 
VALUES (@idTicket8,@idMedicamento8,2,130.00);
INSERT INTO dbo.ticketMedicamento(idTicket, idMedicamento,cantidad,precioUnitario) 
VALUES (@idTicket9,@idMedicamento9,1,175.00);
INSERT INTO dbo.ticketMedicamento(idTicket, idMedicamento,cantidad,precioUnitario) 
VALUES (@idTicket10,@idMedicamento10,2,210.00);
-----------------------------------------------------------------------------------
-----------------------Enfermeras--------------------------------------------------
DECLARE @idEnfermera1 INT = (SELECT TOP 1 idUsuario FROM dbo.enfermera ORDER BY idUsuario ASC);
DECLARE @idEnfermera2 INT = (SELECT TOP 1 idUsuario FROM dbo.enfermera ORDER BY idUsuario DESC);
-----------------------------------------------------------------------------------
-----------------------Servicio----------------------------------------------------
INSERT INTO dbo.servicio (descripcion, tipo, precio, stock, idEnfermera)
VALUES (N'Inyecci�n Intramuscular', N'Aplicaci�n', 50.00, NULL, @idEnfermera1);
DECLARE @idServicio1 INT = SCOPE_IDENTITY();

INSERT INTO dbo.servicio (descripcion, tipo, precio, stock, idEnfermera)
VALUES (N'Curaci�n de Herida Menor', N'Curaci�n', 250.00, 50, @idEnfermera1);
DECLARE @idServicio2 INT = SCOPE_IDENTITY();

INSERT INTO dbo.servicio (descripcion, tipo, precio, stock, idEnfermera)
VALUES (N'Toma de Presi�n Arterial', N'Monitoreo', 30.00, NULL, @idEnfermera1);
DECLARE @idServicio3 INT = SCOPE_IDENTITY();

INSERT INTO dbo.servicio (descripcion, tipo, precio, stock, idEnfermera)
VALUES (N'Nebulizaci�n (Sesi�n 20 min)', N'Tratamiento', 150.00, NULL, @idEnfermera1);
DECLARE @idServicio4 INT = SCOPE_IDENTITY();

INSERT INTO dbo.servicio (descripcion, tipo, precio, stock, idEnfermera)
VALUES (N'Retiro de Puntos/Suturas', N'Procedimiento', 200.00, 20, @idEnfermera1);
DECLARE @idServicio5 INT = SCOPE_IDENTITY();

INSERT INTO dbo.servicio (descripcion, tipo, precio, stock, idEnfermera)
VALUES (N'Colocaci�n de Venoclisis (Suero)', N'Procedimiento', 350.00, 30, @idEnfermera2);
DECLARE @idServicio6 INT = SCOPE_IDENTITY();

INSERT INTO dbo.servicio (descripcion, tipo, precio, stock, idEnfermera)
VALUES (N'Prueba de Glucosa Capilar', N'Laboratorio', 80.00, 100, @idEnfermera2);
DECLARE @idServicio7 INT = SCOPE_IDENTITY();

INSERT INTO dbo.servicio (descripcion, tipo, precio, stock, idEnfermera)
VALUES (N'Lavado �tico (O�do)', N'Curaci�n', 300.00, 15, @idEnfermera2);
DECLARE @idServicio8 INT = SCOPE_IDENTITY();

INSERT INTO dbo.servicio (descripcion, tipo, precio, stock, idEnfermera)
VALUES (N'Electrocardiograma Simple', N'Estudio', 600.00, NULL, @idEnfermera2);
DECLARE @idServicio9 INT = SCOPE_IDENTITY();

INSERT INTO dbo.servicio (descripcion, tipo, precio, stock, idEnfermera)
VALUES (N'Aplicaci�n de Vacuna T�tanos', N'Vacunaci�n', 120.00, 10, @idEnfermera2);
DECLARE @idServicio10 INT = SCOPE_IDENTITY();
-----------------------ticketServicio----------------------------------------------
INSERT INTO dbo.ticketServicio(idTicket, idServicio, cantidad, precioUnitario)
VALUES (@idTicket1,@idservicio1,1,50.00);
INSERT INTO dbo.ticketServicio(idTicket, idServicio, cantidad, precioUnitario)
VALUES (@idTicket2,@idservicio2,1,250.00);
INSERT INTO dbo.ticketServicio(idTicket, idServicio, cantidad, precioUnitario)
VALUES (@idTicket3,@idservicio3,1,30.00);
INSERT INTO dbo.ticketServicio(idTicket, idServicio, cantidad, precioUnitario)
VALUES (@idTicket4,@idservicio4,1,150.00);
INSERT INTO dbo.ticketServicio(idTicket, idServicio, cantidad, precioUnitario)
VALUES (@idTicket5,@idservicio5,1,200.00);
INSERT INTO dbo.ticketServicio(idTicket, idServicio, cantidad, precioUnitario)
VALUES (@idTicket6,@idservicio6,1,350.00);
INSERT INTO dbo.ticketServicio(idTicket, idServicio, cantidad, precioUnitario)
VALUES (@idTicket7,@idservicio7,1,80.00);
INSERT INTO dbo.ticketServicio(idTicket, idServicio, cantidad, precioUnitario)
VALUES (@idTicket8,@idservicio8,1,300.00);
INSERT INTO dbo.ticketServicio(idTicket, idServicio, cantidad, precioUnitario)
VALUES (@idTicket9,@idservicio9,1,600.00);
INSERT INTO dbo.ticketServicio(idTicket, idServicio, cantidad, precioUnitario)
VALUES (@idTicket10,@idservicio10,1,120.00);
-----------------------------------------------------------------------------------