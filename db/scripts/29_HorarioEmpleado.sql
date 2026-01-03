USE hospitalBD;
GO

/* =========================================================
   1. SP para el Dropdown: Empleados Activos SIN Horario
   ========================================================= */
CREATE OR ALTER PROCEDURE sp_GetEmpleadosSinHorario
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        u.idUsuario,
        u.nombre,
        u.apPat,
        u.apMat,
        u.tipoUsuario
    FROM usuarioSistema u
    INNER JOIN empleado e ON u.idUsuario = e.idUsuario -- Unimos con empleado para obtener el estatus
    WHERE e.estatus = 1
      AND u.tipoUsuario IN ('Doctor', 'Recepcionista', 'Enfermera', 'Farmaceutico')
      AND NOT EXISTS (
          SELECT 1 
          FROM horarioEmpleado h 
          WHERE h.idUsuario = u.idUsuario
      )
    ORDER BY u.tipoUsuario, u.apPat;
END
GO

/* =========================================================
   2. SP para Insertar Horario:
      Usando columnas reales: diaSemana, horaInicio, horaFin
   ========================================================= */
CREATE OR ALTER PROCEDURE sp_AsignarHorarioEmpleado
    @idUsuario INT,
    @diaSemana NVARCHAR(20), 
    @horaInicio TIME(7),     
    @horaFin TIME(7)         
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO horarioEmpleado (idUsuario, diaSemana, horaInicio, horaFin)
    VALUES (@idUsuario, @diaSemana, @horaInicio, @horaFin);
END
GO