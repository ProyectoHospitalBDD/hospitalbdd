// api/Hospital.Api/Controllers/SeedDoctoresController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Hospital.Api.Persistence;
using Hospital.Api.Persistence.Models;
using Hospital.Api.Seed;
using Hospital.Api.Services.Auth;

namespace Hospital.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SeedDoctoresController : ControllerBase
    {
        private readonly HospitalContext _db;
        private readonly PasswordService _passwordService;

        public SeedDoctoresController(HospitalContext db, PasswordService passwordService)
        {
            _db = db;
            _passwordService = passwordService;
        }

        // SOLO PARA DESARROLLO
        // POST /api/SeedDoctores/doctores
        [HttpPost("doctores")]
        [AllowAnonymous]
        public async Task<IActionResult> SeedDoctores()
        {
            /*
            // Para este primer paso: si ya hay al menos UN doctor, no hacemos nada
            if (await _db.Doctors.AnyAsync())
            {
                return BadRequest("Ya existen doctores en la BD.");
            }
            */
            var doctores = GetDoctoresSeed();

            foreach (var d in doctores)
            {
                // 1) Contacto
                var contacto = new Contacto
                {
                    TelPersonal = d.TelPersonal,
                    CorreoPersonal = d.CorreoPersonal
                };

                // 2) Hash de contraseña
                var hashResult = _passwordService.HashPassword(d.PasswordPlano);

                // 3) UsuarioSistema
                var usuario = new UsuarioSistema
                {
                    Nombre = d.Nombre,
                    ApPat = d.ApPat,
                    ApMat = d.ApMat,
                    TipoUsuario = d.TipoUsuario, // "Doctor"
                    Curp = d.Curp,
                    PasswordHash = hashResult.hash,
                    PasswordSalt = hashResult.salt,
                    PasswordIteraciones = hashResult.iterations,
                    IdContactoNavigation = contacto
                };

                // 4) Empleado
                var empleado = new Empleado
                {
                    IdUsuarioNavigation = usuario,
                    Estatus = true,
                    Salario = d.Salario 
                };

                // 5) Doctor
                var doctor = new Doctor
                {
                    IdUsuarioNavigation = empleado,
                    Cedula = d.Cedula,
                    IdConsultorio = d.IdConsultorio,
                    IdEspecialidad = d.IdEspecialidad
                };

                // 6) Horarios
                foreach (var h in d.Horarios)
                    {
                        var horario = new HorarioEmpleado
                        {
                            IdUsuarioNavigation = empleado,
                            DiaSemana = h.DiaSemana,
                            HoraInicio = TimeOnly.FromTimeSpan(h.HoraInicio),
                            HoraFin    = TimeOnly.FromTimeSpan(h.HoraFin)
                        };

                        _db.HorarioEmpleados.Add(horario);
                    }

                _db.Doctors.Add(doctor);
            }

            await _db.SaveChangesAsync();

            return Ok(new
            {
                Mensaje = "Doctores sembrados correctamente.",
                Cantidad = doctores.Count
            });
        }

        private List<DoctorSeedInfo> GetDoctoresSeed()
        {
            var doctores = new List<DoctorSeedInfo>();

            void AddDoctor(
                string nombre,
                string apPat,
                string apMat,
                string curp,
                string tel,
                string correo,
                string passwordPlano,
                string cedula,
                int idConsultorio,
                int idEspecialidad,
                decimal salario,
                params (string Dia, bool TurnoMatutino)[] horarios)
            {
                var d = new DoctorSeedInfo
                {
                    Nombre = nombre,
                    ApPat = apPat,
                    ApMat = apMat,
                    Curp = curp,
                    TelPersonal = tel,
                    CorreoPersonal = correo,
                    PasswordPlano = passwordPlano,
                    Cedula = cedula,
                    IdConsultorio = idConsultorio,
                    IdEspecialidad = idEspecialidad,
                    Salario = salario,
                    Horarios = new List<HorarioSeedInfo>()
                };

                foreach (var (dia, turnoMatutino) in horarios)
                {
                    d.Horarios.Add(new HorarioSeedInfo
                    {
                        DiaSemana = dia,
                        HoraInicio = turnoMatutino ? new TimeSpan(7, 0, 0) : new TimeSpan(15, 0, 0),
                        HoraFin = turnoMatutino ? new TimeSpan(15, 0, 0) : new TimeSpan(23, 0, 0)
                    });
                }

                doctores.Add(d);
            }
            //Doc 1 -  Julieta Robles Morales
            AddDoctor(
                "Julieta", "Robles", "Morales",
                "ROMJ010396MDFXRA01",
                "5545897524", "Juli_Robles@demo.com",
                "1234",           // password plana
                "5761834",        // cédula
                idConsultorio: 1,
                idEspecialidad: 1,
                salario: 20000m,
                ("Lunes", true),
                ("Miercoles", true),
                ("Viernes", true)
            );
            // Doc 2 - Esteban Solís García
            AddDoctor(
                "Esteban", "Solís", "García",
                "SOGE230793HDFXRA05",
                "5548912587", "Esteban_Solis@demo.com",
                "0000",
                "5724794",
                idConsultorio: 1,
                idEspecialidad: 1,
                salario: 18000m,
                ("Lunes", false),
                ("Miercoles", false),
                ("Viernes", false)
            );

            // Doc 3 - Andrés Román Villanueva
            AddDoctor(
                "Andrés", "Román", "Villanueva",
                "ROVA031191HDFXRB35",
                "5521384520", "Andy_Roman@demo.com",
                "1503",
                "1409724",
                idConsultorio: 1,
                idEspecialidad: 1,
                salario: 18000m,
                ("Martes", true),
                ("Jueves", true),
                ("Sabado", true)
            );

            // Doc 4 - Juan Manuel Dominguez López
            AddDoctor(
                "Juan Manuel", "Dominguez", "López",
                "DOLJ010295HDFXRA23",
                "5587201564", "Dominguez_JuanM@demo.com",
                "7851",
                "3205497",
                idConsultorio: 1,
                idEspecialidad: 1,
                salario: 13000m,
                ("Martes", false),
                ("Jueves", false),
                ("Sabado", false)
            );

            // Doc 5 - Andrea Pérez Grande
            AddDoctor(
                "Andrea", "Pérez", "Grande",
                "PEGA110997MDFXRA87",
                "5521879530", "Perez_Andrea34@demo.com",
                "6354",
                "6509873",
                idConsultorio: 2,
                idEspecialidad: 2,
                salario: 16000m,
                ("Lunes", true),
                ("Miercoles", true),
                ("Viernes", true)
            );

            // Doc 6 - Jorge Boyzo Martinez
            AddDoctor(
                "Jorge", "Boyzo", "Martinez",
                "BOMJ280199HDFXRA41",
                "5503648297", "Boyzo_JM@demo.com",
                "9874",
                "1094814",
                idConsultorio: 2,
                idEspecialidad: 2,
                salario: 15000m,
                ("Lunes", false),
                ("Miercoles", false),
                ("Viernes", false)
            );

            // Doc 7 - Romina Sánchez Salinas
            AddDoctor(
                "Romina", "Sánchez", "Salinas",
                "SASR181296MDFXWE45",
                "5587624108", "Sanchez_Romy12@demo.com",
                "3560",
                "16105489",
                idConsultorio: 2,
                idEspecialidad: 2,
                salario: 11000m,
                ("Martes", true),
                ("Jueves", true),
                ("Sabado", true)
            );

            // Doc 8 - Héctor Pastrana Ayala
            AddDoctor(
                "Héctor", "Pastrana", "Ayala",
                "PAAH160495HDFXCQ83",
                "5564035781", "Pastrana_Hect@demo.com",
                "5555",
                "8134089",
                idConsultorio: 2,
                idEspecialidad: 2,
                salario: 19000m,
                ("Martes", false),
                ("Jueves", false),
                ("Sabado", false)
            );

            // Doc 9 - Enrique Zamora Salazar
            AddDoctor(
                "Enrique", "Zamora", "Salazar",
                "ZASE200694HDFXCQ23",
                "5521479350", "Zamora_Kike@demo.com",
                "6655",
                "7962048",
                idConsultorio: 3,
                idEspecialidad: 3,
                salario: 22000m,
                ("Lunes", true),
                ("Miercoles", true),
                ("Viernes", true)
            );

            // Doc 10 - Javier Hernandez Pérez
            AddDoctor(
                "Javier", "Hernandez", "Pérez",
                "HEPJ090596HDFXRA99",
                "5565089735", "Hernandez_Javier23@demo.com",
                "2200",
                "8170632",
                idConsultorio: 3,
                idEspecialidad: 3,
                salario: 21000m,
                ("Lunes", false),
                ("Miercoles", false),
                ("Viernes", false)
            );

            // Doc 11 - Susana Ortega Estrada
            AddDoctor(
                "Susana", "Ortega", "Estrada",
                "ORES301298MDFXRL84",
                "5546210678", "Ortega_Susana@demo.com",
                "7810",
                "3257980",
                idConsultorio: 3,
                idEspecialidad: 3,
                salario: 14000m,
                ("Martes", true),
                ("Jueves", true),
                ("Sabado", true)
            );

            // Doc 12 - Eduardo Marín Hernandez
            AddDoctor(
                "Eduardo", "Marín", "Hernandez",
                "MAHE160695HDFXRE12",
                "5568203489", "Marín_Eduardo@demo.com",
                "5403",
                "8540673",
                idConsultorio: 3,
                idEspecialidad: 3,
                salario: 17500m,
                ("Martes", false),
                ("Jueves", false),
                ("Sabado", false)
            );

            // Doc 13 - Daniel Valenzuela Paredes
            AddDoctor(
                "Daniel", "Valenzuela", "Paredes",
                "VAPD081201HDFXCQ65",
                "5581300254", "Valenzuela_Daniel@demo.com",
                "3048",
                "8750349",
                idConsultorio: 4,
                idEspecialidad: 4,
                salario: 7000m,
                ("Lunes", true),
                ("Miercoles", true),
                ("Viernes", true)
            );

            // Doc 14 - Rodrigo Ponce Morrón
            AddDoctor(
                "Rodrigo", "Ponce", "Morrón",
                "POMR120798HDFXRA30",
                "5566720384", "Ponce_Rodrigo@demo.com",
                "4097",
                "9550231",
                idConsultorio: 4,
                idEspecialidad: 4,
                salario: 11000m,
                ("Lunes", false),
                ("Miercoles", false),
                ("Viernes", false)
            );

            // Doc 15 - Saúl Rodríguez Zapata
            AddDoctor(
                "Saúl", "Rodríguez", "Zapata",
                "ROZS260998HDFXRP10",
                "5532004892", "Rodriguez_Saul@demo.com",
                "3033",
                "9750318",
                idConsultorio: 4,
                idEspecialidad: 4,
                salario: 12500m,
                ("Martes", true),
                ("Jueves", true),
                ("Sabado", true)
            );

            // Doc 16 - Jazmin Maza Ramos
            AddDoctor(
                "Jazmin", "Maza", "Ramos",
                "MARJ091099HDFXRZ21",
                "5513077648", "Maza_Jazmin@demo.com",
                "4507",
                "4307529",
                idConsultorio: 4,
                idEspecialidad: 4,
                salario: 13000m,
                ("Martes", false),
                ("Jueves", false),
                ("Sabado", false)
            );

            // Doc 17 - Alejandro Tolentino Martinez
            AddDoctor(
                "Alejandro", "Tolentino", "Martinez",
                "TOMA011297HDFXCQ71",
                "5512305578", "Tolentino_Alejandro@demo.com",
                "3304",
                "2013465",
                idConsultorio: 5,
                idEspecialidad: 5,
                salario: 9000m,
                ("Lunes", true),
                ("Miercoles", true),
                ("Viernes", true)
            );

            // Doc 18 - Emanuel Cruz González
            AddDoctor(
                "Emanuel", "Cruz", "González",
                "CRGE070398HDFXRM71",
                "5506497538", "Cruz_Emanuel@demo.com",
                "2249",
                "8042106",
                idConsultorio: 5,
                idEspecialidad: 5,
                salario: 14000m,
                ("Lunes", false),
                ("Miercoles", false),
                ("Viernes", false)
            );

            // Doc 19 - Roberto Chavez Barajas
            AddDoctor(
                "Roberto", "Chavez", "Barajas",
                "CHBR311097HDFXRP02",
                "5511305791", "Chavez_Roberto@demo.com",
                "4406",
                "8034597",
                idConsultorio: 5,
                idEspecialidad: 5,
                salario: 14500m,
                ("Martes", true),
                ("Jueves", true),
                ("Sabado", true)
            );

            // Doc 20 - Valeria Arciniega Buenrostro
            AddDoctor(
                "Valeria", "Arciniega", "Buenrostro",
                "ARBV040194MDFXRV27",
                "5544365082", "Arciniega_Valeria@demo.com",
                "7709",
                "6403124",
                idConsultorio: 5,
                idEspecialidad: 5,
                salario: 10000m,
                ("Martes", false),
                ("Jueves", false),
                ("Sabado", false)
            );

            // Doc 21 - Barbara Pineda Luna
            AddDoctor(
                "Barbara", "Pineda", "Luna",
                "PILB070199MDFXCN12",
                "5599054317", "Pinea_Barbara@demo.com",
                "9408",
                "3302147",
                idConsultorio: 6,
                idEspecialidad: 6,
                salario: 19000m,
                ("Lunes", true),
                ("Miercoles", true),
                ("Viernes", true)
            );

            // Doc 22 - Natalia Hernández Macías
            AddDoctor(
                "Natalia", "Hernández", "Macías",
                "HEMN221101MDFXRJ91",
                "5582660148", "Hernandez_Natalia@demo.com",
                "0317",
                "8807216",
                idConsultorio: 6,
                idEspecialidad: 6,
                salario: 6000m,
                ("Lunes", false),
                ("Miercoles", false),
                ("Viernes", false)
            );

            // Doc 23 - Mario Castañeda Gómez
            AddDoctor(
                "Mario", "Castañeda", "Gómez",
                "CAGM160795HDFXRP05",
                "5621079831", "Castañeda_Mario@demo.com",
                "0022",
                "6422508",
                idConsultorio: 6,
                idEspecialidad: 6,
                salario: 10500m,
                ("Martes", true),
                ("Jueves", true),
                ("Sabado", true)
            );

            // Doc 24 - Gustavo Mancillas Hernández
            AddDoctor(
                "Gustavo", "Mancillas", "Hernández",
                "MAHG190497HDFXRO01",
                "5511409768", "Mancillas_Gustavo@demo.com",
                "4407",
                "7243365",
                idConsultorio: 6,
                idEspecialidad: 6,
                salario: 16000m,
                ("Martes", false),
                ("Jueves", false),
                ("Sabado", false)
            );

            // Doc 25 - Marcos Olivares Lopez
            AddDoctor(
                "Marcos", "Olivares", "Lopez",
                "OLLM280180HDFXCE55",
                "5542108762", "Olivares_Marcos@demo.com",
                "9999",
                "9632507",
                idConsultorio: 7,
                idEspecialidad: 7,
                salario: 12000m,
                ("Lunes", true),
                ("Miercoles", true),
                ("Viernes", true)
            );

            // Doc 26 - Cesar Juárez Libertad
            AddDoctor(
                "Cesar", "Juárez", "Libertad",
                "JULC220492HDFXRJ11",
                "5620178934", "Juarez_Cesar@demo.com",
                "3108",
                "2308435",
                idConsultorio: 7,
                idEspecialidad: 7,
                salario: 15000m,
                ("Lunes", false),
                ("Miercoles", false),
                ("Viernes", false)
            );

            // Doc 27 - Evelin Marqués Sánchez
            AddDoctor(
                "Evelin", "Marqués", "Sánchez",
                "MASE240497MDFXRP04",
                "5540972050", "Marques_Evelin@demo.com",
                "5708",
                "7705315",
                idConsultorio: 7,
                idEspecialidad: 7,
                salario: 11000m,
                ("Martes", true),
                ("Jueves", true),
                ("Sabado", true)
            );

            // Doc 28 - Karen Marrufo Castillo
            AddDoctor(
                "Karen", "Marrufo", "Castillo",
                "MACK290699MDFXRY03",
                "5681209734", "Marrufo_Karen@demo.com",
                "2870",
                "4031572",
                idConsultorio: 7,
                idEspecialidad: 7,
                salario: 14500m,
                ("Martes", false),
                ("Jueves", false),
                ("Sabado", false)
            );

            // Doc 29 - Jorge Zuñiga Murillo
            AddDoctor(
                "Jorge", "Zuñiga", "Murillo",
                "ZUMJ070785HDFXCE01",
                "5690482133", "Zuñiga_Jorge@demo.com",
                "1708",
                "8137709",
                idConsultorio: 8,
                idEspecialidad: 8,
                salario: 20000m,
                ("Lunes", true),
                ("Miercoles", true),
                ("Viernes", true)
            );

            // Doc 30 - Gregorio Martinez Casas
            AddDoctor(
                "Gregorio", "Martinez", "Casas",
                "MACG090575HDFXRJ13",
                "5541228790", "Martinez_Gregorio@demo.com",
                "6640",
                "0031472",
                idConsultorio: 8,
                idEspecialidad: 8,
                salario: 26000m,
                ("Lunes", false),
                ("Miercoles", false),
                ("Viernes", false)
            );

            // Doc 31 - Juan Pablo Herrera Espinosa
            AddDoctor(
                "Juan Pablo", "Herrera", "Espinosa",
                "HEEJ151197HDFXRP04",
                "5699042153", "Herrera_Juan@demo.com",
                "4208",
                "6405279",
                idConsultorio: 8,
                idEspecialidad: 8,
                salario: 19000m,
                ("Martes", true),
                ("Jueves", true),
                ("Sabado", true)
            );

            // Doc 32 - James Evan Wilson (sin ApMat)
            AddDoctor(
                "James Evan", "Wilson", "",
                "WIXJ050890HDFXRY03",
                "5630178254", "Wilson_James@demo.com",
                "2010",
                "7742064",
                idConsultorio: 8,
                idEspecialidad: 8,
                salario: 25000m,
                ("Martes", false),
                ("Jueves", false),
                ("Sabado", false)
            );

            // Doc 33 - Rodolfo Belmonte Galicia
            AddDoctor(
                "Rodolfo", "Belmonte", "Galicia",
                "BEGR291285HDFXCW01",
                "5520148760", "Belmonte_Rodolfo@demo.com",
                "5400",
                "3120457",
                idConsultorio: 9,
                idEspecialidad: 9,
                salario: 17000m,
                ("Lunes", true),
                ("Miercoles", true),
                ("Viernes", true)
            );

            // Doc 34 - Emilio Cortés Alvarado
            AddDoctor(
                "Emilio", "Cortés", "Alvarado",
                "COAE210193HDFXRJ13",
                "5622301487", "Cortes_Emilio@demo.com",
                "7504",
                "2106457",
                idConsultorio: 9,
                idEspecialidad: 9,
                salario: 16000m,
                ("Lunes", false),
                ("Miercoles", false),
                ("Viernes", false)
            );

            // Doc 35 - Daniel Palacio Meléndez
            AddDoctor(
                "Daniel", "Palacio", "Meléndez",
                "PAMD080394HDFXRP04",
                "5572049807", "Palacio_Daniel@demo.com",
                "2020",
                "6403027",
                idConsultorio: 9,
                idEspecialidad: 9,
                salario: 19000m,
                ("Martes", true),
                ("Jueves", true),
                ("Sabado", true)
            );

            // Doc 36 - Elmy Flores González
            AddDoctor(
                "Elmy", "Flores", "González",
                "FLGE091299MDFXRY03",
                "5680472306", "Flores_Elmy@demo.com",
                "5512",
                "6503127",
                idConsultorio: 9,
                idEspecialidad: 9,
                salario: 15000m,
                ("Martes", false),
                ("Jueves", false),
                ("Sabado", false)
            );

            // Doc 37 - Enrique Mogollón Pineda
            AddDoctor(
                "Enrique", "Mogollón", "Pineda",
                "MOPE241070HDFXCW01",
                "5514829703", "Mogollon_Enrique@demo.com",
                "0044",
                "2405798",
                idConsultorio: 10,
                idEspecialidad: 10,
                salario: 27000m,
                ("Lunes", true),
                ("Miercoles", true),
                ("Viernes", true)
            );

            // Doc 38 - Omar Montijo Díaz
            AddDoctor(
                "Omar", "Montijo", "Díaz",
                "MODO030885HDFXRJ13",
                "5640321187", "Montijo_Omar@demo.com",
                "7777",
                "9985041",
                idConsultorio: 10,
                idEspecialidad: 10,
                salario: 26000m,
                ("Lunes", false),
                ("Miercoles", false),
                ("Viernes", false)
            );

            // Doc 39 - Jose Manuel Ayala Jaimes
            AddDoctor(
                "Jose Manuel", "Ayala", "Jaimes",
                "AYJJ210892HDFXRP04",
                "5516229708", "Ayala_Jose@demo.com",
                "3131",
                "6403127",
                idConsultorio: 10,
                idEspecialidad: 10,
                salario: 29000m,
                ("Martes", true),
                ("Jueves", true),
                ("Sabado", true)
            );

            // Doc 40 - Graciela Gallardo García
            AddDoctor(
                "Graciela", "Gallardo", "García",
                "GAGG191194MDFXRY03",
                "5514203055", "Gallardo_Graciela@demo.com",
                "7784",
                "3105446",
                idConsultorio: 10,
                idEspecialidad: 10,
                salario: 25500m,
                ("Martes", false),
                ("Jueves", false),
                ("Sabado", false)
            );

            // Doc 41 - Mariana Velázquez Ríos
            AddDoctor(
                "Mariana", "Velázquez", "Ríos",
                "VERM121080MDFXCW01",
                "5582213450", "Velazquez_Mariana@demo.com",
                "6710",
                "8157209",
                idConsultorio: 11,
                idEspecialidad: 11,
                salario: 21000m,
                ("Lunes", true),
                ("Miercoles", true),
                ("Viernes", true)
            );

            // Doc 42 - Gerrardo Maya Vacio
            AddDoctor(
                "Gerrardo", "Maya", "Vacio",
                "MAVG180585HDFXRJ13",
                "5622178931", "Maya_Gerardo@demo.com",
                "0205",
                "5050217",
                idConsultorio: 11,
                idEspecialidad: 11,
                salario: 22000m,
                ("Lunes", false),
                ("Miercoles", false),
                ("Viernes", false)
            );

            // Doc 43 - Jose Fernando Díaz Sobrino
            AddDoctor(
                "Jose Fernando", "Díaz", "Sobrino",
                "DISJ270392HDFXRP04",
                "5633048790", "Diaz_Jose@demo.com",
                "4048",
                "8754542",
                idConsultorio: 11,
                idEspecialidad: 11,
                salario: 23000m,
                ("Martes", true),
                ("Jueves", true),
                ("Sabado", true)
            );

            // Doc 44 - Abel Peña Díaz
            AddDoctor(
                "Abel", "Peña", "Díaz",
                "PEDA070692HDFXRY03",
                "5620441887", "Peña_Abel@demo.com",
                "8884",
                "1130247",
                idConsultorio: 11,
                idEspecialidad: 11,
                salario: 20000m,
                ("Martes", false),
                ("Jueves", false),
                ("Sabado", false)
            );

            // Doc 45 - Alejandra Sarahí Lara Godínez
            AddDoctor(
                "Alejandra Sarahí", "Lara", "Godínez",
                "LAGA210204MDFXCW01",
                "5588210064", "Lara_Alejandra@demo.com",
                "4540",
                "2206457",
                idConsultorio: 12,
                idEspecialidad: 12,
                salario: 12000m,
                ("Lunes", true),
                ("Miercoles", true),
                ("Viernes", true)
            );

            // Doc 46 - Eloísa Morales Espino
            AddDoctor(
                "Eloísa", "Morales", "Espino",
                "MOEE280987MDFXRJ13",
                "563107842", "Morales_Eloisa@demo.com",
                "2050",
                "2140973",
                idConsultorio: 12,
                idEspecialidad: 12,
                salario: 11000m,
                ("Lunes", false),
                ("Miercoles", false),
                ("Viernes", false)
            );

            // Doc 47 - Fernanda Vázquez Flores
            AddDoctor(
                "Fernanda", "Vázquez", "Flores",
                "VAFF170892MDFXRP04",
                "5582131348", "Vazquez_Fernanda@demo.com",
                "7001",
                "02021348",
                idConsultorio: 12,
                idEspecialidad: 12,
                salario: 13000m,
                ("Martes", true),
                ("Jueves", true),
                ("Sabado", true)
            );

            // Doc 48 - Diego García Borja
            AddDoctor(
                "Diego", "García", "Borja",
                "GABD121285HDFXRY03",
                "5688707016", "Garcia_Diego@demo.com",
                "8950",
                "5052537",
                idConsultorio: 12,
                idEspecialidad: 12,
                salario: 10000m,
                ("Martes", false),
                ("Jueves", false),
                ("Sabado", false)
            );

            // Doc 49 - Alberto Nieto Esquivel
            AddDoctor(
                "Alberto", "Nieto", "Esquivel",
                "NIEA050296HDFXCW01",
                "5579798120", "Nieto_Alberto@demo.com",
                "2615",
                "9753048",
                idConsultorio: 13,
                idEspecialidad: 13,
                salario: 22000m,
                ("Lunes", true),
                ("Miercoles", true),
                ("Viernes", true)
            );

            // Doc 50 - Ivan Zavala Hernández
            AddDoctor(
                "Ivan", "Zavala", "Hernández",
                "ZAHI180989HDFXRJ13",
                "5521279092", "Zavala_Ivan@demo.com",
                "6208",
                "3034387",
                idConsultorio: 13,
                idEspecialidad: 13,
                salario: 21000m,
                ("Lunes", false),
                ("Miercoles", false),
                ("Viernes", false)
            );

            // Doc 51 - Pascual Olivares Vergara
            AddDoctor(
                "Pascual", "Olivares", "Vergara",
                "OLVP200298HDFXRP04",
                "5656212497", "Olivares_Pascual@demo.com",
                "7479",
                "9898705",
                idConsultorio: 13,
                idEspecialidad: 13,
                salario: 23000m,
                ("Martes", true),
                ("Jueves", true),
                ("Sabado", true)
            );

            // Doc 52 - Brenda Mosso Rojas
            AddDoctor(
                "Brenda", "Mosso", "Rojas",
                "MORB071095MDFXRY03",
                "5681273948", "Mosso_Brenda@demo.com",
                "5665",
                "3738190",
                idConsultorio: 13,
                idEspecialidad: 13,
                salario: 17000m,
                ("Martes", false),
                ("Jueves", false),
                ("Sabado", false)
            );

            // Doc 53 - Adrián Funesto Morales
            AddDoctor(
                "Adrián", "Funesto", "Morales",
                "FUMA251299HDFXCW01",
                "5623230781", "Funesto_Adrian@demo.com",
                "9097",
                "0102547",
                idConsultorio: 14,
                idEspecialidad: 14,
                salario: 12000m,
                ("Lunes", true),
                ("Miercoles", true),
                ("Viernes", true)
            );

            // Doc 54 - Roberto Cuellar Mar
            AddDoctor(
                "Roberto", "Cuellar", "Mar",
                "CUMR030999HDFXRJ13",
                "5517025817", "Cuellar_Roberto@demo.com",
                "0011",
                "8057690",
                idConsultorio: 14,
                idEspecialidad: 14,
                salario: 11000m,
                ("Lunes", false),
                ("Miercoles", false),
                ("Viernes", false)
            );

            // Doc 55 - Carla Daniela Morales Zúñiga
            AddDoctor(
                "Carla Daniela", "Morales", "Zúñiga",
                "MOZC040892MDFXRP04",
                "5639392804", "Morales_Carla@demo.com",
                "1350",
                "2234097",
                idConsultorio: 14,
                idEspecialidad: 14,
                salario: 13000m,
                ("Martes", true),
                ("Jueves", true),
                ("Sabado", true)
            );

            // Doc 56 - Jorge Villalobos López
            AddDoctor(
                "Jorge", "Villalobos", "López",
                "VILJ1710795HDFXRY0",
                "5555003174", "Villalobos_Jorge@demo.com",
                "7089",
                "8787021",
                idConsultorio: 14,
                idEspecialidad: 14,
                salario: 10000m,
                ("Martes", false),
                ("Jueves", false),
                ("Sabado", false)
            );

            // Doc 57 - Ingrid Sandoval Guzmán
            AddDoctor(
                "Ingrid", "Sandoval", "Guzmán",
                "SAGI150390MDFXCW01",
                "2228107510", "Sandoval_Ingrid@demo.com",
                "0181",
                "8704229",
                idConsultorio: 15,
                idEspecialidad: 15,
                salario: 22000m,
                ("Lunes", true),
                ("Miercoles", true),
                ("Viernes", true)
            );

            // Doc 58 - Alondra Moreno González
            AddDoctor(
                "Alondra", "Moreno", "González",
                "MOGA230491MDFXRJ13",
                "2220719207", "Moreno_Alondra@demo.com",
                "8781",
                "80112400",
                idConsultorio: 15,
                idEspecialidad: 15,
                salario: 21000m,
                ("Lunes", false),
                ("Miercoles", false),
                ("Viernes", false)
            );

            // Doc 59 - Raúl Martínez Vázquez
            AddDoctor(
                "Raúl", "Martínez", "Vázquez",
                "MAVR140192HDFXRP16",
                "5531312027", "Martinez_Raul@demo.com",
                "3105",
                "9731640",
                idConsultorio: 15,
                idEspecialidad: 15,
                salario: 23000m,
                ("Martes", true),
                ("Jueves", true),
                ("Sabado", true)
            );

            // Doc 60 - Mariana Bretón Mora
            AddDoctor(
                "Mariana", "Bretón", "Mora",
                "BRMM2711995MDFXRY0",
                "2228090371", "Breton_Mariana@demo.com",
                "9990",
                "88880214",
                idConsultorio: 15,
                idEspecialidad: 15,
                salario: 20000m,
                ("Martes", false),
                ("Jueves", false),
                ("Sabado", false)
            );

            // Doc 61 - Ruth Mancera Castellanos
            AddDoctor(
                "Ruth", "Mancera", "Castellanos",
                "MACR030394MDFXCW01",
                "5622204197", "Mancera_Ruth@demo.com",
                "1018",
                "0022344",
                idConsultorio: 16,
                idEspecialidad: 16,
                salario: 25000m,
                ("Lunes", true),
                ("Miercoles", true),
                ("Viernes", true)
            );

            // Doc 62 - Julian Tinoco Alvarado
            AddDoctor(
                "Julian", "Tinoco", "Alvarado",
                "TIAJ130891HDFXRJ13",
                "5510101037", "Tinoco_Julian@demo.com",
                "0323",
                "2424503",
                idConsultorio: 16,
                idEspecialidad: 16,
                salario: 21000m,
                ("Lunes", false),
                ("Miercoles", false),
                ("Viernes", false)
            );

            // Doc 63 - Gilberto Bautista Macías
            AddDoctor(
                "Gilberto", "Bautista", "Macías",
                "BAMG090592HDFXRP16",
                "5581720647", "Bautista_Gilberto@demo.com",
                "4056",
                "5421037",
                idConsultorio: 16,
                idEspecialidad: 16,
                salario: 27000m,
                ("Martes", true),
                ("Jueves", true),
                ("Sabado", true)
            );

            // Doc 64 - Marian Cervantes Gama
            AddDoctor(
                "Marian", "Cervantes", "Gama",
                "CEGM3112995MDFXRY0",
                "2223408713", "Cervantes_Marian@demo.com",
                "0017",
                "3334709",
                idConsultorio: 16,
                idEspecialidad: 16,
                salario: 23000m,
                ("Martes", false),
                ("Jueves", false),
                ("Sabado", false)
            );

            // Doc 65 - Karina Villareal Domínguez
            AddDoctor(
                "Karina", "Villareal", "Domínguez",
                "VIDK130897MDFXCW01",
                "5581273490", "Villareal_Karina@demo.com",
                "8742",
                "5421157",
                idConsultorio: 17,
                idEspecialidad: 17,
                salario: 29000m,
                ("Lunes", true),
                ("Miercoles", true),
                ("Viernes", true)
            );

            // Doc 66 - Consuelo Alcántara Muñiz
            AddDoctor(
                "Consuelo", "Alcántara", "Muñiz",
                "ALMC130297MDFXRJ13",
                "2229143708", "Alcantara_Consuelo@demo.com",
                "3108",
                "0744035",
                idConsultorio: 17,
                idEspecialidad: 17,
                salario: 29000m,
                ("Lunes", false),
                ("Miercoles", false),
                ("Viernes", false)
            );

            // Doc 67 - Janeth Mota Hernández
            AddDoctor(
                "Janeth", "Mota", "Hernández",
                "MOHJ291280MDFXRP16",
                "5631323480", "Mota_Janeth@demo.com",
                "0465",
                "2121067",
                idConsultorio: 17,
                idEspecialidad: 17,
                salario: 27000m,
                ("Martes", true),
                ("Jueves", true),
                ("Sabado", true)
            );

            // Doc 68 - Alonso Ródríguez Pérez
            AddDoctor(
                "Alonso", "Ródríguez", "Pérez",
                "ROPA091094HDFXRY03",
                "2224141973", "Rodriguez_Alonso@demo.com",
                "9507",
                "8035447",
                idConsultorio: 17,
                idEspecialidad: 17,
                salario: 25000m,
                ("Martes", false),
                ("Jueves", false),
                ("Sabado", false)
            );

            return doctores;
        }

        
    }
}
