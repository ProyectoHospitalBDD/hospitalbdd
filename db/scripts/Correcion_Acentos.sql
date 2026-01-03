--Select * from servicio;

-- =============================================
-- SCRIPT DE SANITIZACIÓN DE CARACTERES
-- Elimina acentos y caracteres especiales para evitar bugs en UI
--TABLAS MEDICAMENTO Y SERVICIO
-- =============================================

--USE hospitalBD; -- Asegúrate de estar en tu base de datos
GO

PRINT 'Iniciando limpieza de la tabla MEDICAMENTO...';

-- 1. Limpiar tabla MEDICAMENTO
-- Reemplazamos vocales acentuadas por normales en Descripción
UPDATE medicamento SET descripcion = REPLACE(descripcion, 'á', 'a');
UPDATE medicamento SET descripcion = REPLACE(descripcion, 'é', 'e');
UPDATE medicamento SET descripcion = REPLACE(descripcion, 'í', 'i');
UPDATE medicamento SET descripcion = REPLACE(descripcion, 'ó', 'o');
UPDATE medicamento SET descripcion = REPLACE(descripcion, 'ú', 'u');
UPDATE medicamento SET descripcion = REPLACE(descripcion, 'Á', 'A');
UPDATE medicamento SET descripcion = REPLACE(descripcion, 'É', 'E');
UPDATE medicamento SET descripcion = REPLACE(descripcion, 'Í', 'I');
UPDATE medicamento SET descripcion = REPLACE(descripcion, 'Ó', 'O');
UPDATE medicamento SET descripcion = REPLACE(descripcion, 'Ú', 'U');
UPDATE medicamento SET descripcion = REPLACE(descripcion, 'ñ', 'n');
UPDATE medicamento SET descripcion = REPLACE(descripcion, 'Ñ', 'N');

-- Reemplazamos en Tipo
UPDATE medicamento SET tipo = REPLACE(tipo, 'á', 'a');
UPDATE medicamento SET tipo = REPLACE(tipo, 'é', 'e');
UPDATE medicamento SET tipo = REPLACE(tipo, 'í', 'i');
UPDATE medicamento SET tipo = REPLACE(tipo, 'ó', 'o');
UPDATE medicamento SET tipo = REPLACE(tipo, 'ú', 'u');
UPDATE medicamento SET tipo = REPLACE(tipo, 'Á', 'A');
UPDATE medicamento SET tipo = REPLACE(tipo, 'É', 'E');
UPDATE medicamento SET tipo = REPLACE(tipo, 'Í', 'I');
UPDATE medicamento SET tipo = REPLACE(tipo, 'Ó', 'O');
UPDATE medicamento SET tipo = REPLACE(tipo, 'Ú', 'U');

-- Reemplazamos en Capacidad
UPDATE medicamento SET capacidad = REPLACE(capacidad, 'á', 'a');
UPDATE medicamento SET capacidad = REPLACE(capacidad, 'é', 'e');
UPDATE medicamento SET capacidad = REPLACE(capacidad, 'í', 'i');
UPDATE medicamento SET capacidad = REPLACE(capacidad, 'ó', 'o');
UPDATE medicamento SET capacidad = REPLACE(capacidad, 'ú', 'u');



-- 2. Limpiar tabla SERVICIO
-- Reemplazamos en Descripción
UPDATE servicio SET descripcion = REPLACE(descripcion, 'á', 'a');
UPDATE servicio SET descripcion = REPLACE(descripcion, 'é', 'e');
UPDATE servicio SET descripcion = REPLACE(descripcion, 'í', 'i');
UPDATE servicio SET descripcion = REPLACE(descripcion, 'ó', 'o');
UPDATE servicio SET descripcion = REPLACE(descripcion, 'ú', 'u');
UPDATE servicio SET descripcion = REPLACE(descripcion, 'Á', 'A');
UPDATE servicio SET descripcion = REPLACE(descripcion, 'É', 'E');
UPDATE servicio SET descripcion = REPLACE(descripcion, 'Í', 'I');
UPDATE servicio SET descripcion = REPLACE(descripcion, 'Ó', 'O');
UPDATE servicio SET descripcion = REPLACE(descripcion, 'Ú', 'U');
UPDATE servicio SET descripcion = REPLACE(descripcion, 'ñ', 'n');
UPDATE servicio SET descripcion = REPLACE(descripcion, 'Ñ', 'N');

-- Reemplazamos en Tipo
UPDATE servicio SET tipo = REPLACE(tipo, 'á', 'a');
UPDATE servicio SET tipo = REPLACE(tipo, 'é', 'e');
UPDATE servicio SET tipo = REPLACE(tipo, 'í', 'i');
UPDATE servicio SET tipo = REPLACE(tipo, 'ó', 'o');
UPDATE servicio SET tipo = REPLACE(tipo, 'ú', 'u');
UPDATE servicio SET tipo = REPLACE(tipo, 'Á', 'A');
UPDATE servicio SET tipo = REPLACE(tipo, 'É', 'E');
UPDATE servicio SET tipo = REPLACE(tipo, 'Í', 'I');
UPDATE servicio SET tipo = REPLACE(tipo, 'Ó', 'O');
UPDATE servicio SET tipo = REPLACE(tipo, 'Ú', 'U');

GO

SELECT * FROM servicio