using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Data.SqlClient;

namespace Hospital.Api.Middleware;

public class SqlExceptionMiddleware
{
    private readonly RequestDelegate _next;
    public SqlExceptionMiddleware(RequestDelegate next) => _next = next;

    public async Task Invoke(HttpContext ctx)
    {
        try { await _next(ctx); }
        catch (SqlException ex)
        {
            var (status, code) = SqlErrorMapper.Map(ex);
            ctx.Response.StatusCode = status;
            ctx.Response.ContentType = "application/json";
            await ctx.Response.WriteAsync(JsonSerializer.Serialize(new { error = code, detail = ex.Message }));
        }
    }
}
