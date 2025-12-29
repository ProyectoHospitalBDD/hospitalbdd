namespace Hospital.Api.Persistence.Models;

public partial class Empleado
{
    public UsuarioSistema UsuarioSistema => IdUsuarioNavigation;
}
