-- Doctor por fecha (detectar traslapes)
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_CitaDoctorFecha' AND object_id=OBJECT_ID('dbo.cita'))
BEGIN
  CREATE INDEX IX_CitaDoctorFecha
    ON dbo.cita(idDoctor, fechaHoraInicio)
    INCLUDE (fechaHoraFin, estatusCita);
END
GO

-- Único filtrado: paciente+doctor con cita pendiente (candado contra duplicados)
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_CitaPtePacienteDoctor' AND object_id=OBJECT_ID('dbo.cita'))
BEGIN
  DROP INDEX IX_CitaPtePacienteDoctor ON dbo.cita;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='UX_CitaPtePacienteDoctor' AND object_id=OBJECT_ID('dbo.cita'))
BEGIN
  CREATE UNIQUE INDEX UX_CitaPtePacienteDoctor
    ON dbo.cita(idPaciente, idDoctor)
    WHERE estatusCita IN (N'AgendadaPendPago', N'PagadaPendAtender');
END
GO

-- Horario del empleado (doctor) por día
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_HorarioEmpleadoUsuarioDia' AND object_id=OBJECT_ID('dbo.horarioEmpleado'))
BEGIN
  CREATE INDEX IX_HorarioEmpleadoUsuarioDia
    ON dbo.horarioEmpleado(idUsuario, diaSemana);
END
GO

-- Pagos pendientes (para vencer)
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_PagoPendiente' AND object_id=OBJECT_ID('dbo.pago'))
BEGIN
  CREATE INDEX IX_PagoPendiente
    ON dbo.pago(idCita, estatusPago, venceEn)
    WHERE estatusPago = N'Pendiente';
END
GO