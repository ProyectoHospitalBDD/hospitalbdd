using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Hospital.Api.Dtos.Empleados;
using Hospital.Api.Persistence;
using Hospital.Api.Services.Auth;

namespace Hospital.Api.Services.Empleados;

public class EmpleadosService
{
    private readonly HospitalContext _db;
    private readonly PasswordService _password;

    public EmpleadosService(HospitalContext db, PasswordService password)
    {
        _db = db;
        _password = password;
    }

    public async Task<List<EmpleadoListItemDto>> ListarAsync(string? tipoUsuario, bool? estatus, string? texto)
    {
        var p = new[]
        {
            new SqlParameter("@tipoUsuario", (object?)tipoUsuario ?? DBNull.Value),
            new SqlParameter("@estatus", (object?)estatus ?? DBNull.Value),
            new SqlParameter("@texto", (object?)texto ?? DBNull.Value),
        };

        var rows = await _db.Set<_EmpleadoListSpRow>()
            .FromSqlRaw(@"EXEC dbo.sp_Empleado_Listar @tipoUsuario, @estatus, @texto", p)
            .AsNoTracking()
            .ToListAsync();

        return rows.Select(x => new EmpleadoListItemDto(
            x.IdUsuario,
            x.TipoUsuario,
            x.Nombre,
            x.ApPat,
            x.ApMat,
            x.Curp,
            x.CorreoPersonal,
            x.TelPersonal,
            x.TelCasa,
            x.Estatus,
            x.Salario,
            x.Cedula,
            x.IdEspecialidad,
            x.IdConsultorio
        )).ToList();
    }

    public async Task CambiarEstatusAsync(int idUsuario, bool estatus)
    {
        var p = new[]
        {
            new SqlParameter("@idUsuario", idUsuario),
            new SqlParameter("@estatus", estatus),
        };

        // No regresa filas; solo ejecuta
        await _db.Database.ExecuteSqlRawAsync(
            @"EXEC dbo.sp_Empleado_CambiarEstatus @idUsuario, @estatus",
            p
        );
    }


    public async Task<CreateEmpleadoResponseDto> CrearAsync(CreateEmpleadoDto dto)
    {
        var (hash, salt, iterations) = _password.HashPassword(dto.Password);

        var p = new[]
        {
            new SqlParameter("@tipoUsuario", dto.TipoUsuario),
            new SqlParameter("@nombre", dto.Nombre),
            new SqlParameter("@apPat", dto.ApPat),
            new SqlParameter("@apMat", (object?)dto.ApMat ?? DBNull.Value),
            new SqlParameter("@curp", dto.Curp),

            new SqlParameter("@correoPersonal", dto.CorreoPersonal),
            new SqlParameter("@telPersonal", (object?)dto.TelPersonal ?? DBNull.Value),
            new SqlParameter("@telCasa", (object?)dto.TelCasa ?? DBNull.Value),

            new SqlParameter("@salario", dto.Salario),
            new SqlParameter("@estatus", dto.Estatus),

            new SqlParameter("@passwordHash", hash),
            new SqlParameter("@passwordSalt", salt),
            new SqlParameter("@passwordIteraciones", iterations),

            new SqlParameter("@cedula", (object?)dto.Cedula ?? DBNull.Value),
            new SqlParameter("@idEspecialidad", (object?)dto.IdEspecialidad ?? DBNull.Value),
            new SqlParameter("@idConsultorio", (object?)dto.IdConsultorio ?? DBNull.Value),
        };

        var rows = await _db.Set<_EmpleadoCrearSpRow>()
            .FromSqlRaw(
                @"EXEC dbo.sp_Empleado_Crear
                    @tipoUsuario, @nombre, @apPat, @apMat, @curp,
                    @correoPersonal, @telPersonal, @telCasa,
                    @salario, @estatus,
                    @passwordHash, @passwordSalt, @passwordIteraciones,
                    @cedula, @idEspecialidad, @idConsultorio",
                p
            )
            .AsNoTracking()
            .ToListAsync();

        var id = rows.Single().IdUsuario;
        return new CreateEmpleadoResponseDto(id);
    }
}
