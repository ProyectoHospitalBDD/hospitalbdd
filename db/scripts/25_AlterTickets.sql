USE hospitalBD;
GO
SET NOCOUNT ON;
GO

/* =========================================================
   1) Agregar columnas a dbo.ticket
   ========================================================= */

IF COL_LENGTH('dbo.ticket', 'idPaciente') IS NULL
  ALTER TABLE dbo.ticket ADD idPaciente INT NULL;
GO

IF COL_LENGTH('dbo.ticket', 'nombreClienteInvitado') IS NULL
  ALTER TABLE dbo.ticket ADD nombreClienteInvitado NVARCHAR(100) NULL;
GO

IF COL_LENGTH('dbo.ticket', 'correoContacto') IS NULL
  ALTER TABLE dbo.ticket ADD correoContacto NVARCHAR(100) NULL;
GO

IF COL_LENGTH('dbo.ticket', 'estatusTicket') IS NULL
  ALTER TABLE dbo.ticket
  ADD estatusTicket NVARCHAR(20) NOT NULL
      CONSTRAINT DF_ticket_estatusTicket DEFAULT(N'Abierto');
GO

/* =========================================================
   2) Constraints (FK + CHECK) ya en otro batch
   ========================================================= */

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_ticket_paciente')
BEGIN
  ALTER TABLE dbo.ticket WITH CHECK
  ADD CONSTRAINT FK_ticket_paciente
  FOREIGN KEY (idPaciente) REFERENCES dbo.paciente(idPaciente);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_ticket_cliente')
BEGIN
  ALTER TABLE dbo.ticket
  ADD CONSTRAINT CK_ticket_cliente
  CHECK (
    (idPaciente IS NOT NULL AND nombreClienteInvitado IS NULL AND correoContacto IS NULL)
    OR
    (idPaciente IS NULL AND nombreClienteInvitado IS NOT NULL)
  );
END
GO

/* =========================================================
   3) Columnas calculadas importe (PERSISTED)
   ========================================================= */

IF COL_LENGTH('dbo.ticketServicio', 'importe') IS NULL
BEGIN
  ALTER TABLE dbo.ticketServicio
  ADD importe AS (
    CONVERT(DECIMAL(10,2), cantidad) * CONVERT(DECIMAL(10,2), precioUnitario)
  ) PERSISTED;
END
GO

IF COL_LENGTH('dbo.ticketMedicamento', 'importe') IS NULL
BEGIN
  ALTER TABLE dbo.ticketMedicamento
  ADD importe AS (
    CONVERT(DECIMAL(10,2), cantidad) * CONVERT(DECIMAL(10,2), precioUnitario)
  ) PERSISTED;
END
GO

/* =========================================================
   4) PKs compuestas (si no existen)
   ========================================================= */

IF NOT EXISTS (
  SELECT 1 FROM sys.key_constraints
  WHERE name = 'PK_ticketServicio' AND parent_object_id = OBJECT_ID('dbo.ticketServicio')
)
BEGIN
  ALTER TABLE dbo.ticketServicio
  ADD CONSTRAINT PK_ticketServicio PRIMARY KEY (idTicket, idServicio);
END
GO

IF NOT EXISTS (
  SELECT 1 FROM sys.key_constraints
  WHERE name = 'PK_ticketMedicamento' AND parent_object_id = OBJECT_ID('dbo.ticketMedicamento')
)
BEGIN
  ALTER TABLE dbo.ticketMedicamento
  ADD CONSTRAINT PK_ticketMedicamento PRIMARY KEY (idTicket, idMedicamento);
END
GO

/* =========================================================
   5) FKs principales (si no existen)
   ========================================================= */

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_ticketServicio_ticket')
BEGIN
  ALTER TABLE dbo.ticketServicio WITH CHECK
  ADD CONSTRAINT FK_ticketServicio_ticket
  FOREIGN KEY (idTicket) REFERENCES dbo.ticket(idTicket)
  ON DELETE CASCADE;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_ticketMedicamento_ticket')
BEGIN
  ALTER TABLE dbo.ticketMedicamento WITH CHECK
  ADD CONSTRAINT FK_ticketMedicamento_ticket
  FOREIGN KEY (idTicket) REFERENCES dbo.ticket(idTicket)
  ON DELETE CASCADE;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_ticketServicio_servicio')
BEGIN
  ALTER TABLE dbo.ticketServicio WITH CHECK
  ADD CONSTRAINT FK_ticketServicio_servicio
  FOREIGN KEY (idServicio) REFERENCES dbo.servicio(idServicio);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_ticketMedicamento_medicamento')
BEGIN
  ALTER TABLE dbo.ticketMedicamento WITH CHECK
  ADD CONSTRAINT FK_ticketMedicamento_medicamento
  FOREIGN KEY (idMedicamento) REFERENCES dbo.medicamento(idMedicamento);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_pagoTicket_ticket')
BEGIN
  ALTER TABLE dbo.pagoTicket WITH CHECK
  ADD CONSTRAINT FK_pagoTicket_ticket
  FOREIGN KEY (idTicket) REFERENCES dbo.ticket(idTicket);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_pagoTicket_farmaceutico')
BEGIN
  ALTER TABLE dbo.pagoTicket WITH CHECK
  ADD CONSTRAINT FK_pagoTicket_farmaceutico
  FOREIGN KEY (idFarmaceutico) REFERENCES dbo.farmaceutico(idUsuario);
END
GO

/* =========================================================
   6) Índices
   ========================================================= */

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_ticket_fecha' AND object_id=OBJECT_ID('dbo.ticket'))
  CREATE INDEX IX_ticket_fecha ON dbo.ticket(fecha);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_pagoTicket_ticket' AND object_id=OBJECT_ID('dbo.pagoTicket'))
  CREATE INDEX IX_pagoTicket_ticket ON dbo.pagoTicket(idTicket, fechaPago, horaPago);
GO
-- agregamos columna monto para pago ticket: 

-- Agregamos la columna 'monto' si no existe
IF COL_LENGTH('pagoTicket', 'monto') IS NULL
BEGIN
    ALTER TABLE pagoTicket
    ADD monto DECIMAL(10,2) NOT NULL DEFAULT 0;
    
    PRINT 'Columna monto agregada a pagoTicket.';
END
ELSE
BEGIN
    PRINT 'La columna monto ya existe.';
END
GO

select * from pagoTicket