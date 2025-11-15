using Microsoft.AspNetCore.Http;
using Microsoft.Data.SqlClient;

namespace Hospital.Api.Middleware;

public static class SqlErrorMapper
{
    public static (int Status, string Code) Map(SqlException ex) => ex.Number switch
    {
        51000 => (StatusCodes.Status400BadRequest, "CitaFueraDeRango"),
        51001 => (StatusCodes.Status400BadRequest, "DuracionInvalida"),
        51002 => (StatusCodes.Status400BadRequest, "FueraDeHorarioLaboral"),
        51003 => (StatusCodes.Status409Conflict,   "DoctorOcupado"),
        51004 => (StatusCodes.Status409Conflict,   "PacientePendienteConMismoDoctor"),
        51005 => (StatusCodes.Status400BadRequest, "DoctorSinEspecialidad"),
        51006 => (StatusCodes.Status400BadRequest, "DuracionNoPermitida"),
        51010 => (StatusCodes.Status404NotFound,   "PagoNoEncontrado"),
        51011 => (StatusCodes.Status409Conflict,   "PagoNoPendiente"),
        51012 => (StatusCodes.Status410Gone,       "CitaExpirada"),
        51020 => (StatusCodes.Status409Conflict,   "NoCancelable"),
        51030 => (StatusCodes.Status409Conflict,   "NoCancelable"),
        _     => (StatusCodes.Status500InternalServerError, "SqlError")
    };
}
