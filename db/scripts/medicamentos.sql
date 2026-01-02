USE hospitalBD;
GO

-- 1. VINCULAR CON EDIFICIO EXISTENTE
DECLARE @idEdificioFarmacia INT = 1; 

-- Validación de seguridad: Si por alguna razón no existe el 1, agarramos el primero que encuentre
IF NOT EXISTS (SELECT 1 FROM dbo.edificio WHERE idEdificio = @idEdificioFarmacia)
BEGIN
    SELECT TOP 1 @idEdificioFarmacia = idEdificio FROM dbo.edificio;
END


-- Insertamos la Farmacia en ese edificio
INSERT INTO dbo.farmacia (superficie, idEdificio)
VALUES (50.00, @idEdificioFarmacia);


DECLARE @idFarmaciaPrincipal INT = SCOPE_IDENTITY();


-- 1. Analgésico
INSERT INTO dbo.medicamento (descripcion, tipo, capacidad, precio, stock, caducidad, idFarmacia)
VALUES (N'Paracetamol 500mg', N'Analgésico', N'Caja 20 tabletas', 25.00, 100, '2026-12-31', @idFarmaciaPrincipal);

-- 2. Antibiótico
INSERT INTO dbo.medicamento (descripcion, tipo, capacidad, precio, stock, caducidad, idFarmacia)
VALUES (N'Amoxicilina 500mg', N'Antibiótico', N'Caja 12 cápsulas', 85.50, 50, '2025-10-15', @idFarmaciaPrincipal);

-- 3. Antiinflamatorio
INSERT INTO dbo.medicamento (descripcion, tipo, capacidad, precio, stock, caducidad, idFarmacia)
VALUES (N'Ibuprofeno 400mg', N'Antiinflamatorio', N'Caja 10 tabletas', 35.00, 80, '2026-05-20', @idFarmaciaPrincipal);

-- 4. Diabetes
INSERT INTO dbo.medicamento (descripcion, tipo, capacidad, precio, stock, caducidad, idFarmacia)
VALUES (N'Metformina 850mg', N'Antidiabético', N'Frasco 30 tabletas', 120.00, 40, '2025-08-01', @idFarmaciaPrincipal);

-- 5. Hipertensión
INSERT INTO dbo.medicamento (descripcion, tipo, capacidad, precio, stock, caducidad, idFarmacia)
VALUES (N'Losartán 50mg', N'Antihipertensivo', N'Caja 30 grageas', 150.00, 60, '2027-01-10', @idFarmaciaPrincipal);

-- 6. Antigripal
INSERT INTO dbo.medicamento (descripcion, tipo, capacidad, precio, stock, caducidad, idFarmacia)
VALUES (N'Antiflu-Des', N'Antigripal', N'Caja 24 cápsulas', 95.00, 200, '2026-11-30', @idFarmaciaPrincipal);

-- 7. Vitaminas
INSERT INTO dbo.medicamento (descripcion, tipo, capacidad, precio, stock, caducidad, idFarmacia)
VALUES (N'Complejo B', N'Vitamínico', N'Frasco 60 tabletas', 180.00, 30, '2025-09-25', @idFarmaciaPrincipal);

-- 8. Estomacal
INSERT INTO dbo.medicamento (descripcion, tipo, capacidad, precio, stock, caducidad, idFarmacia)
VALUES (N'Omeprazol 20mg', N'Antiácido', N'Frasco 14 cápsulas', 45.00, 90, '2026-03-15', @idFarmaciaPrincipal);

-- 9. Alergias
INSERT INTO dbo.medicamento (descripcion, tipo, capacidad, precio, stock, caducidad, idFarmacia)
VALUES (N'Loratadina 10mg', N'Antihistamínico', N'Caja 10 tabletas', 30.00, 75, '2027-06-05', @idFarmaciaPrincipal);

-- 10. Curación
INSERT INTO dbo.medicamento (descripcion, tipo, capacidad, precio, stock, caducidad, idFarmacia)
VALUES (N'Alcohol Etílico', N'Antiséptico', N'Botella 500ml', 28.00, 50, '2028-01-01', @idFarmaciaPrincipal);

SELECT * FROM dbo.medicamento;