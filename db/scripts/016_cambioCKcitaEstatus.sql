ALTER TABLE dbo.cita DROP CONSTRAINT CK_Cita_Estatus;

ALTER TABLE dbo.cita
ADD CONSTRAINT CK_Cita_Estatus CHECK (estatusCita IN
(
  N'AgendadaPendPago', N'PagadaPendAtender',
  N'CanceladaFaltaPago', N'CanceladaPaciente',
  N'CanceladaDoctor', N'Atendida', N'NoAcudio',
  N'CancelacionSolicitadaDoctor'
));
