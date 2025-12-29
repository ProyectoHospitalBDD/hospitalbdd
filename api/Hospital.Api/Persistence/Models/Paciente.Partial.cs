namespace Hospital.Api.Persistence.Models;

public partial class Paciente
{
    public UsuarioSistema UsuarioSistema => IdUsuarioNavigation;
}
