--TABLAS DE COMPRA EN LINÉA QUE CONECTARAN CON EL TICKET GENERAL 

--TABLA CompraWeb que obtiene los datos del carrito del paciente
CREATE TABLE compraWeb (
    idCompra INT IDENTITY(1,1) PRIMARY KEY,
    
    -- DATOS DEL CLIENTE
    -- Si es paciente registrado, usamos su ID.
    idPaciente INT NULL, 
    -- Si es invitado, guardamos el nombre que escriba en el formulario.
    nombreClienteInvitado NVARCHAR(100) NULL, 
    CorreoContacto NVARCHAR(100) NULL, -- Importante para invitados
    
    -- DATOS GENERALES
    fechaCompra DATETIME DEFAULT GETDATE(),
    totalGeneral DECIMAL(10,2) NOT NULL DEFAULT 0,
 
    Estatus NVARCHAR(20) DEFAULT 'Carrito', 
    
    -- Relación con Paciente (si existe)
    CONSTRAINT FK_CompraWeb_Paciente FOREIGN KEY (IdPaciente) REFERENCES Paciente(idUsuario)
);


--TABLA que simula el ticket web  
CREATE TABLE detalleCompraWeb (
    idDetalleWeb INT IDENTITY(1,1) PRIMARY KEY,
    
    -- VINCULACIÓN CON LA TABLA DE ARRIBA
    IdCompra INT NOT NULL, 
    
    -- Uno u otro 
    IdMedicamento INT NULL,
    IdServicio INT NULL,
    
    -- CANTIDAD Y PRECIO
    cantidad INT NOT NULL,
    precioUnitario DECIMAL(10,2) NOT NULL, -- Guardamos el precio al momento de la compra 

    importe AS (cantidad * precioUnitario),

    -- LLAVES FORÁNEAS
    CONSTRAINT FK_Detalle_Compra FOREIGN KEY (IdCompra) REFERENCES compraWeb(idCompra),
    CONSTRAINT FK_Detalle_Medicamento FOREIGN KEY (IdMedicamento) REFERENCES medicamento(idMedicamento),
    CONSTRAINT FK_Detalle_Servicio FOREIGN KEY (IdServicio) REFERENCES servicio(idServicio),

    -- VALIDACIÓN (Constraint): Asegura que sea Medicamento O Servicio, no ambos ni ninguno.
    CONSTRAINT CK_SoloUno CHECK (
        (idMedicamento IS NOT NULL AND idServicio IS NULL) OR 
        (idMedicamento IS NULL AND idServicio IS NOT NULL)
    )
);