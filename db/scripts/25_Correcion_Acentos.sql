--Select * from servicio;

-- =============================================
-- SCRIPT DE SANITIZACI�N DE CARACTERES
-- Elimina acentos y caracteres especiales para evitar bugs en UI
--TABLAS MEDICAMENTO Y SERVICIO
-- =============================================

--USE hospitalBD; -- Aseg�rate de estar en tu base de datos
GO

PRINT 'Iniciando limpieza de la tabla MEDICAMENTO...';

-- 1. Limpiar tabla MEDICAMENTO
-- Reemplazamos vocales acentuadas por normales en Descripci�n
UPDATE medicamento SET descripcion = REPLACE(descripcion, '�', 'a');
UPDATE medicamento SET descripcion = REPLACE(descripcion, '�', 'e');
UPDATE medicamento SET descripcion = REPLACE(descripcion, '�', 'i');
UPDATE medicamento SET descripcion = REPLACE(descripcion, '�', 'o');
UPDATE medicamento SET descripcion = REPLACE(descripcion, '�', 'u');
UPDATE medicamento SET descripcion = REPLACE(descripcion, '�', 'A');
UPDATE medicamento SET descripcion = REPLACE(descripcion, '�', 'E');
UPDATE medicamento SET descripcion = REPLACE(descripcion, '�', 'I');
UPDATE medicamento SET descripcion = REPLACE(descripcion, '�', 'O');
UPDATE medicamento SET descripcion = REPLACE(descripcion, '�', 'U');
UPDATE medicamento SET descripcion = REPLACE(descripcion, '�', 'n');
UPDATE medicamento SET descripcion = REPLACE(descripcion, '�', 'N');

-- Reemplazamos en Tipo
UPDATE medicamento SET tipo = REPLACE(tipo, '�', 'a');
UPDATE medicamento SET tipo = REPLACE(tipo, '�', 'e');
UPDATE medicamento SET tipo = REPLACE(tipo, '�', 'i');
UPDATE medicamento SET tipo = REPLACE(tipo, '�', 'o');
UPDATE medicamento SET tipo = REPLACE(tipo, '�', 'u');
UPDATE medicamento SET tipo = REPLACE(tipo, '�', 'A');
UPDATE medicamento SET tipo = REPLACE(tipo, '�', 'E');
UPDATE medicamento SET tipo = REPLACE(tipo, '�', 'I');
UPDATE medicamento SET tipo = REPLACE(tipo, '�', 'O');
UPDATE medicamento SET tipo = REPLACE(tipo, '�', 'U');

-- Reemplazamos en Capacidad
UPDATE medicamento SET capacidad = REPLACE(capacidad, '�', 'a');
UPDATE medicamento SET capacidad = REPLACE(capacidad, '�', 'e');
UPDATE medicamento SET capacidad = REPLACE(capacidad, '�', 'i');
UPDATE medicamento SET capacidad = REPLACE(capacidad, '�', 'o');
UPDATE medicamento SET capacidad = REPLACE(capacidad, '�', 'u');



-- 2. Limpiar tabla SERVICIO
-- Reemplazamos en Descripci�n
UPDATE servicio SET descripcion = REPLACE(descripcion, '�', 'a');
UPDATE servicio SET descripcion = REPLACE(descripcion, '�', 'e');
UPDATE servicio SET descripcion = REPLACE(descripcion, '�', 'i');
UPDATE servicio SET descripcion = REPLACE(descripcion, '�', 'o');
UPDATE servicio SET descripcion = REPLACE(descripcion, '�', 'u');
UPDATE servicio SET descripcion = REPLACE(descripcion, '�', 'A');
UPDATE servicio SET descripcion = REPLACE(descripcion, '�', 'E');
UPDATE servicio SET descripcion = REPLACE(descripcion, '�', 'I');
UPDATE servicio SET descripcion = REPLACE(descripcion, '�', 'O');
UPDATE servicio SET descripcion = REPLACE(descripcion, '�', 'U');
UPDATE servicio SET descripcion = REPLACE(descripcion, '�', 'n');
UPDATE servicio SET descripcion = REPLACE(descripcion, '�', 'N');

-- Reemplazamos en Tipo
UPDATE servicio SET tipo = REPLACE(tipo, '�', 'a');
UPDATE servicio SET tipo = REPLACE(tipo, '�', 'e');
UPDATE servicio SET tipo = REPLACE(tipo, '�', 'i');
UPDATE servicio SET tipo = REPLACE(tipo, '�', 'o');
UPDATE servicio SET tipo = REPLACE(tipo, '�', 'u');
UPDATE servicio SET tipo = REPLACE(tipo, '�', 'A');
UPDATE servicio SET tipo = REPLACE(tipo, '�', 'E');
UPDATE servicio SET tipo = REPLACE(tipo, '�', 'I');
UPDATE servicio SET tipo = REPLACE(tipo, '�', 'O');
UPDATE servicio SET tipo = REPLACE(tipo, '�', 'U');

GO

SELECT * FROM servicio