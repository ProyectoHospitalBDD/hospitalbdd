/*
 * NOMBRE DEL SISTEMA:    POLIMED: Gestión Hospitalaria (Backend SQL)
 * ARCHIVO:               Funciones.sql
 * FECHA DE DOCUMENTACIÓN: 30 de diciembre de 2025
 * MOTOR DE BASE DE DATOS: SQL Server (T-SQL)
 *
 * DESCRIPCIÓN GENERAL:
 * Este script contiene las funciones de tabla en línea (TVF) del sistema,
 * diseñadas para realizar cálculos financieros y consolidación de datos
 * sin persistencia física, optimizando la lectura en tiempo real.
 *
 * FUNCIONES PRINCIPALES:
 * 1. Cálculo consolidado de importes por ticket (Servicios + Medicamentos).
 *
 */

/*
 * NOMBRE DE LA FUNCIÓN:  dbo.fn_TicketTotales
 * TIPO:                  Inline Table-Valued Function (TVF)
 * CONTEXTO:              [dbo.ticket]
 *
 * DESCRIPCIÓN:
 * Función encargada de calcular los importes monetarios acumulados asociados
 * a un ticket específico. Consolida la información de dos fuentes principales:
 * servicios y medicamentos, retornando los subtotales y el gran total listos
 * para facturación o reportes.
 *
 * CARACTERÍSTICAS:
 * - Tipo:        Retorna una tabla (TABLE), permitiendo su uso en JOINs y APPLYs.
 * - Eficiencia:  Utiliza OUTER APPLY en lugar de subconsultas en el SELECT para
 * calcular agregados (SUM) de forma aislada antes de unir.
 * - Seguridad:   Garantiza aritmética válida mediante ISNULL, evitando que un
 * subtotal vacío anule el total general (NULL propagation).
 *
 * ALGORITMO:
 * 1. Recibe el parámetro @idTicket.
 * 2. Realiza un OUTER APPLY a [ticketServicio] para sumar importes de servicios.
 * 3. Realiza un OUTER APPLY a [ticketMedicamento] para sumar importes de medicamentos.
 * 4. Aplica ISNULL(..., 0.00) a ambos resultados.
 * 5. Retorna la tabla con los subtotales y la suma final (TotalGeneral).
 */
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
    
    -- SUMA FINAL: Suma aritmética segura gracias a los ISNULL previos
    (ISNULL(ts.TotalServicios, 0.00) + ISNULL(tm.TotalMedicamentos, 0.00)) AS TotalGeneral
  FROM dbo.ticket t
  -- Suma de Servicios: Agrupación aislada
  OUTER APPLY (
    SELECT SUM(s.importe) AS TotalServicios
    FROM dbo.ticketServicio s
    WHERE s.idTicket = t.idTicket
  ) ts
  -- Suma de Medicamentos: Agrupación aislada
  OUTER APPLY (
    SELECT SUM(m.importe) AS TotalMedicamentos
    FROM dbo.ticketMedicamento m
    WHERE m.idTicket = t.idTicket
  ) tm
  WHERE t.idTicket = @idTicket
);
GO

/*
 * =================================================================================
 * EJEMPLO DE EJECUCIÓN
 * =================================================================================
 * Al ser una función de tabla, no se usa EXEC, sino SELECT ... FROM.
 */

-- Ejecución para un ticket específico (Ej. ID 5)
SELECT * FROM dbo.fn_TicketTotales(22);
