
CREATE FUNCTION dbo.fn_TicketTotales (@idTicket INT)
RETURNS TABLE
AS
RETURN
(
  SELECT
    t.idTicket,
    -- Calculamos los subtotales asegurando que no sean nulos
    ISNULL(ts.TotalServicios, 0.00) AS TotalServicios,
    ISNULL(tm.TotalMedicamentos, 0.00) AS TotalMedicamentos,
    
    -- SUMA FINAL
    (ISNULL(ts.TotalServicios, 0.00) + ISNULL(tm.TotalMedicamentos, 0.00)) AS TotalGeneral
  FROM dbo.ticket t
  -- Suma de Servicios
  OUTER APPLY (
    SELECT SUM(s.importe) AS TotalServicios
    FROM dbo.ticketServicio s
    WHERE s.idTicket = t.idTicket
  ) ts
  -- Suma de Medicamentos
  OUTER APPLY (
    SELECT SUM(m.importe) AS TotalMedicamentos
    FROM dbo.ticketMedicamento m
    WHERE m.idTicket = t.idTicket
  ) tm
  WHERE t.idTicket = @idTicket
);
GO

-- Aseguramos que la columna 'monto' exista en pagoTicket
IF COL_LENGTH('pagoTicket', 'monto') IS NULL
BEGIN
    ALTER TABLE pagoTicket ADD monto DECIMAL(10,2) NOT NULL DEFAULT 0;
END
GO