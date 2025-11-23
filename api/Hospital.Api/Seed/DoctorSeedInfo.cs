// api/Hospital.Api/Seed/DoctorSeedInfo.cs
using System;

namespace Hospital.Api.Seed
{
    public class HorarioSeedInfo
    {
        public string DiaSemana { get; set; } = "";
        public TimeSpan HoraInicio { get; set; }
        public TimeSpan HoraFin { get; set; }
    }

    public class DoctorSeedInfo
    {
        // Datos de usuarioSistema
        public string Nombre { get; set; } = default!;
        public string ApPat { get; set; } = default!;
        public string ApMat { get; set; } = default!;
        public string Curp { get; set; } = default!;
        public string TipoUsuario { get; set; } = "Doctor";

        // Datos de contacto
        public string TelPersonal { get; set; } = default!;
        public string CorreoPersonal { get; set; } = default!;

        // Datos de doctor
        public string Cedula { get; set; } = default!;
        public int IdConsultorio { get; set; }
        public int IdEspecialidad { get; set; }

        // Password en texto plano SOLO para el seeding
        public string PasswordPlano { get; set; } = "Doc1234";

        public decimal Salario { get; set; }

        // Horarios
        public List<HorarioSeedInfo> Horarios { get; set; } = new();
    }
}
