namespace Hospital.Api.Seed
{
    public class PacienteSeedInfo
    {
        // Datos de usuarioSistema
        public string Nombre { get; set; } = default!;
        public string ApPat { get; set; } = default!;
        public string ApMat { get; set; } = default!;
        public string Curp { get; set; } = default!;
        public string TipoUsuario { get; set; } = "Paciente";

        // Datos de contacto
        public string TelPersonal { get; set; } = default!;
        public string CorreoPersonal { get; set; } = default!;

        // Password en texto plano SOLO para seed
        public string PasswordPlano { get; set; } = "Paciente123";
    }
}
