namespace Hospital.Api.Seed
{
    public class EnfermeraSeedInfo
    {
        // Datos de usuarioSistema
        public string Nombre { get; set; } = null!;
        public string ApPat { get; set; } = null!;
        public string ApMat { get; set; } = null!;
        public string Curp { get; set; } = null!;
        public string PasswordPlano { get; set; } = "enf123";

        // Datos de contacto
        public string TelPersonal { get; set; } = null!;
        public string CorreoPersonal { get; set; } = null!;

        // Datos de empleado
        public decimal Salario { get; set; }
    }
}
