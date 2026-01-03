using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Hospital.Api.Dtos.Auth;
using Hospital.Api.Persistence;
using Hospital.Api.Persistence.Models;

namespace Hospital.Api.Services.Auth;

public class AuthService
{
    private readonly HospitalContext _db;
    private readonly PasswordService _password;

    public AuthService(HospitalContext db, PasswordService password)
    {
        _db = db;
        _password = password;
    }

public async Task<int> RegistrarPacienteAsync(RegisterPacienteDto dto)
{
    var (hash, salt, iterations) = _password.HashPassword(dto.Password);

    var p = new[]
    {
        new SqlParameter("@tipoUsuario", "Paciente"),
        new SqlParameter("@nombres", dto.Nombres),
        new SqlParameter("@apPat", dto.ApellidoPaterno),
        new SqlParameter("@apMat", (object?)dto.ApellidoMaterno ?? DBNull.Value),
        new SqlParameter("@curp", dto.Curp),
        new SqlParameter("@correoPersonal", dto.Correo),
        new SqlParameter("@telPersonal", dto.TelPersonal),
        new SqlParameter("@telCasa", (object?)dto.TelCasa ?? DBNull.Value),
        new SqlParameter("@passwordHash", hash),
        new SqlParameter("@passwordSalt", salt),
        new SqlParameter("@passwordIteraciones", iterations),
    };

    try
    {
        var rows = await _db.Set<_PacienteCrearSpRow>()
            .FromSqlRaw(
                @"EXEC dbo.sp_Paciente_Crear
                    @tipoUsuario, @nombres, @apPat, @apMat, @curp,
                    @correoPersonal, @telPersonal, @telCasa,
                    @passwordHash, @passwordSalt, @passwordIteraciones",
                p
            )
            .AsNoTracking()
            .ToListAsync();

        return (int)rows.Single().IdUsuario;
    }
    catch (SqlException ex)
    {
        // Duplicados
        if (ex.Number == 2627) // UNIQUE constraint
        {
            if (ex.Message.Contains("UQ_contactoCorreo"))
                throw new Exception("El correo ya está registrado");
            if (ex.Message.Contains("UQ_usuarioCURP"))
                throw new Exception("La CURP ya está registrada");
            if (ex.Message.Contains("UQ_contactoTelPersonal"))
                throw new Exception("El teléfono personal ya está registrado");
        }

        // Otros errores
        throw new Exception("Error al crear el paciente: " + ex.Message);
    }
}
}