namespace Hospital.Api.Persistence.Models;

public partial class Doctor
{
    public UsuarioSistema? UsuarioSistema => IdUsuarioNavigation?.IdUsuarioNavigation;
}