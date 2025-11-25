namespace Hospital.Api.Seed
{
    public class FarmaceuticoSeedInfo
    {
        // Datos de usuarioSistema
        public string Nombre { get; set; } = null!;
        public string ApPat { get; set; } = null!;
        public string ApMat { get; set; } = null!;
        public string Curp { get; set; } = null!;
        public string PasswordPlano { get; set; } = "far123";

        // Datos de contacto
        public string TelPersonal { get; set; } = null!;
        public string CorreoPersonal { get; set; } = null!;

        // Datos de empleado
        public decimal Salario { get; set; }
    }
}
