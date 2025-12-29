using System.Security.Claims;

public static class UserClaims
{
    public static int GetIdUsuario(ClaimsPrincipal user)
    {
        var raw = user.FindFirstValue("IdUsuario") ?? user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(raw, out var id)) throw new UnauthorizedAccessException("Token sin idPaciente");
        return id;
    }
}
