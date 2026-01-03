using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Hospital.Api.Persistence.Models;
using Hospital.Api.Dtos.Empleados;
using Hospital.Api.Models;

namespace Hospital.Api.Persistence;

public partial class HospitalContext : DbContext
{
    public HospitalContext()
    {
    }

    public HospitalContext(DbContextOptions<HospitalContext> options)
        : base(options)
    {
    }
    public DbSet<_PacienteCrearSpRow> PacienteCrearSpRows { get; set; }

    public virtual DbSet<AlergiaPadecimiento> AlergiaPadecimientos { get; set; }

    public virtual DbSet<BitacoraEstatusCitum> BitacoraEstatusCita { get; set; }

    public virtual DbSet<Citum> Cita { get; set; }

    public virtual DbSet<Consultorio> Consultorios { get; set; }

    public virtual DbSet<Contacto> Contactos { get; set; }

    public virtual DbSet<Doctor> Doctors { get; set; }

    public virtual DbSet<Edificio> Edificios { get; set; }

    public virtual DbSet<Empleado> Empleados { get; set; }

    public virtual DbSet<Enfermera> Enfermeras { get; set; }

    public virtual DbSet<Especialidad> Especialidads { get; set; }

    public virtual DbSet<Farmaceutico> Farmaceuticos { get; set; }

    public virtual DbSet<Farmacium> Farmacia { get; set; }

    public virtual DbSet<HistorialMedico> HistorialMedicos { get; set; }

    public virtual DbSet<HorarioEmpleado> HorarioEmpleados { get; set; }

    public virtual DbSet<Medicamento> Medicamentos { get; set; }

    public virtual DbSet<Paciente> Pacientes { get; set; }

    public virtual DbSet<PacienteAlergiaPadecimiento> PacienteAlergiaPadecimientos { get; set; }

    public virtual DbSet<CompraWeb> CompraWebs { get; set; }
    
    public virtual DbSet<DetalleCompraWeb> DetalleCompraWebs { get; set; }

    public virtual DbSet<Pago> Pagos { get; set; }

    public virtual DbSet<PagoTicket> PagoTickets { get; set; }

    public virtual DbSet<Recepcionistum> Recepcionista { get; set; }

    public virtual DbSet<RecetaMedicamento> RecetaMedicamentos { get; set; }

    public virtual DbSet<RecetaServicio> RecetaServicios { get; set; }

    public virtual DbSet<Recetum> Receta { get; set; }

    public virtual DbSet<Servicio> Servicios { get; set; }

    public virtual DbSet<Ticket> Tickets { get; set; }

    public virtual DbSet<TicketMedicamento> TicketMedicamentos { get; set; }

    public virtual DbSet<TicketServicio> TicketServicios { get; set; }

    public virtual DbSet<UsuarioSistema> UsuarioSistemas { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AlergiaPadecimiento>(entity =>
        {
            entity.HasKey(e => e.IdAlerPade).HasName("PK__alergiaP__A9A7988EFABBAACA");

            entity.ToTable("alergiaPadecimiento");

            entity.HasIndex(e => new { e.NombreNormalizado, e.Tipo }, "UQ_alergiaPadecimientoNombre").IsUnique();

            entity.Property(e => e.IdAlerPade).HasColumnName("idAlerPade");
            entity.Property(e => e.Nombre)
                .HasMaxLength(200)
                .HasColumnName("nombre");
            entity.Property(e => e.NombreNormalizado)
                .HasMaxLength(200)
                .HasComputedColumnSql("(lower(ltrim(rtrim([nombre]))))", true)
                .HasColumnName("nombreNormalizado");
            entity.Property(e => e.Tipo)
                .HasMaxLength(15)
                .HasColumnName("tipo");
        });

        modelBuilder.Entity<BitacoraEstatusCitum>(entity =>
        {
            entity.HasKey(e => e.IdBitacora).HasName("PK__bitacora__223FE1428D29A030");

            entity.ToTable("bitacoraEstatusCita");

            entity.HasIndex(e => new { e.IdCita, e.FechaMov }, "IX_Bitacora_Cita").IsDescending(false, true);

            entity.Property(e => e.IdBitacora).HasColumnName("idBitacora");
            entity.Property(e => e.Costo)
                .HasColumnType("money")
                .HasColumnName("costo");
            entity.Property(e => e.EstatusCita)
                .HasMaxLength(25)
                .HasColumnName("estatusCita");
            entity.Property(e => e.FechaCitaFin).HasColumnName("fechaCitaFin");
            entity.Property(e => e.FechaCitaInicio).HasColumnName("fechaCitaInicio");
            entity.Property(e => e.FechaMov)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("fechaMov");
            entity.Property(e => e.IdCita).HasColumnName("idCita");
            entity.Property(e => e.IdDoctor).HasColumnName("idDoctor");
            entity.Property(e => e.IdPaciente).HasColumnName("idPaciente");
            entity.Property(e => e.MontoDevuelto)
                .HasColumnType("money")
                .HasColumnName("montoDevuelto");
            entity.Property(e => e.Politica)
                .HasMaxLength(50)
                .HasColumnName("politica");
        });

        modelBuilder.Entity<Citum>(entity =>
        {
            entity.HasKey(e => e.IdCita).HasName("PK__cita__814F3126C4E76F4C");

            entity.ToTable("cita", tb => tb.HasTrigger("tr_CitaLogEstatus"));

            entity.HasIndex(e => new { e.IdDoctor, e.FechaHoraInicio }, "IX_CitaDoctorFecha");

            entity.HasIndex(e => new { e.IdPaciente, e.IdDoctor }, "UX_CitaPtePacienteDoctor")
                .IsUnique()
                .HasFilter("([estatusCita] IN (N'AgendadaPendPago', N'PagadaPendAtender'))");

            entity.Property(e => e.IdCita).HasColumnName("idCita");
            entity.Property(e => e.Costo)
                .HasColumnType("money")
                .HasColumnName("costo");
            entity.Property(e => e.DuracionMin)
                .HasDefaultValue(30)
                .HasColumnName("duracionMin");
            entity.Property(e => e.EstatusCita)
                .HasMaxLength(25)
                .HasColumnName("estatusCita");
            entity.Property(e => e.FechaHoraFin).HasColumnName("fechaHoraFin");
            entity.Property(e => e.FechaHoraInicio).HasColumnName("fechaHoraInicio");
            entity.Property(e => e.IdDoctor).HasColumnName("idDoctor");
            entity.Property(e => e.IdPaciente).HasColumnName("idPaciente");

            entity.HasOne(d => d.IdDoctorNavigation).WithMany(p => p.Cita)
                .HasForeignKey(d => d.IdDoctor)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Cita_Doctor");

            entity.HasOne(d => d.IdPacienteNavigation).WithMany(p => p.Cita)
                .HasForeignKey(d => d.IdPaciente)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Cita_Paciente");
        });

        modelBuilder.Entity<Consultorio>(entity =>
        {
            entity.HasKey(e => e.IdConsultorio).HasName("PK__consulto__230EBF0F8D1D0FAB");

            entity.ToTable("consultorio");

            entity.HasIndex(e => new { e.IdEdificio, e.Numero }, "UQ_consultorio").IsUnique();

            entity.Property(e => e.IdConsultorio).HasColumnName("idConsultorio");
            entity.Property(e => e.IdEdificio).HasColumnName("idEdificio");
            entity.Property(e => e.Numero)
                .HasMaxLength(10)
                .HasColumnName("numero");
            entity.Property(e => e.Superficie)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("superficie");

            entity.HasOne(d => d.IdEdificioNavigation).WithMany(p => p.Consultorios)
                .HasForeignKey(d => d.IdEdificio)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_consultorioEdificio");
        });

        modelBuilder.Entity<Contacto>(entity =>
        {
            entity.HasKey(e => e.IdContacto).HasName("PK__contacto__4B1329C7F5795180");

            entity.ToTable("contacto");

            entity.HasIndex(e => e.CorreoPersonal, "UQ_contactoCorreo").IsUnique();

            entity.Property(e => e.IdContacto).HasColumnName("idContacto");
            entity.Property(e => e.CorreoPersonal)
                .HasMaxLength(256)
                .HasColumnName("correoPersonal");
            entity.Property(e => e.TelCasa)
                .HasMaxLength(20)
                .HasColumnName("telCasa");
            entity.Property(e => e.TelPersonal)
                .HasMaxLength(20)
                .HasColumnName("telPersonal");
        });

        modelBuilder.Entity<Doctor>(entity =>
        {
            entity.HasKey(e => e.IdUsuario).HasName("PK__doctor__645723A6EFF284DE");

            entity.ToTable("doctor");

            entity.HasIndex(e => e.Cedula, "UQ_doctorCedula").IsUnique();

            entity.Property(e => e.IdUsuario)
                .ValueGeneratedNever()
                .HasColumnName("idUsuario");
            entity.Property(e => e.Cedula)
                .HasMaxLength(20)
                .HasColumnName("cedula");
            entity.Property(e => e.IdConsultorio).HasColumnName("idConsultorio");
            entity.Property(e => e.IdEspecialidad).HasColumnName("idEspecialidad");

            entity.HasOne(d => d.IdConsultorioNavigation).WithMany(p => p.Doctors)
                .HasForeignKey(d => d.IdConsultorio)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_doctorConsultorio");

            entity.HasOne(d => d.IdEspecialidadNavigation).WithMany(p => p.Doctors)
                .HasForeignKey(d => d.IdEspecialidad)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_doctorEspecialidad");

            entity.HasOne(d => d.IdUsuarioNavigation).WithOne(p => p.Doctor)
                .HasForeignKey<Doctor>(d => d.IdUsuario)
                .HasConstraintName("FK__doctor__idUsuari__73BA3083");
        });

        modelBuilder.Entity<Edificio>(entity =>
        {
            entity.HasKey(e => e.IdEdificio).HasName("PK__edificio__5A8ABE417D2BDBB6");

            entity.ToTable("edificio");

            entity.Property(e => e.IdEdificio).HasColumnName("idEdificio");
            entity.Property(e => e.NumPisos).HasColumnName("numPisos");
            entity.Property(e => e.Superficie)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("superficie");
        });

        modelBuilder.Entity<Empleado>(entity =>
        {
            entity.HasKey(e => e.IdUsuario).HasName("PK__empleado__645723A64D1B00FE");

            entity.ToTable("empleado");

            entity.Property(e => e.IdUsuario)
                .ValueGeneratedNever()
                .HasColumnName("idUsuario");
            entity.Property(e => e.Estatus).HasColumnName("estatus");
            entity.Property(e => e.Salario)
                .HasColumnType("money")
                .HasColumnName("salario");

            entity.HasOne(d => d.IdUsuarioNavigation).WithOne(p => p.Empleado)
                .HasForeignKey<Empleado>(d => d.IdUsuario)
                .HasConstraintName("FK__empleado__idUsua__5165187F");
        });

        modelBuilder.Entity<Enfermera>(entity =>
        {
            entity.HasKey(e => e.IdUsuario).HasName("PK__enfermer__645723A603305EDA");

            entity.ToTable("enfermera");

            entity.Property(e => e.IdUsuario)
                .ValueGeneratedNever()
                .HasColumnName("idUsuario");

            entity.HasOne(d => d.IdUsuarioNavigation).WithOne(p => p.Enfermera)
                .HasForeignKey<Enfermera>(d => d.IdUsuario)
                .HasConstraintName("FK__enfermera__idUsu__628FA481");
        });

        modelBuilder.Entity<Especialidad>(entity =>
        {
            entity.HasKey(e => e.IdEspecialidad).HasName("PK__especial__E8AB1600BA796F95");

            entity.ToTable("especialidad");

            entity.HasIndex(e => e.NombreEsp, "UQ_espNombre").IsUnique();

            entity.Property(e => e.IdEspecialidad).HasColumnName("idEspecialidad");
            entity.Property(e => e.AnosEstu).HasColumnName("anosEstu");
            entity.Property(e => e.Costo)
                .HasColumnType("money")
                .HasColumnName("costo");
            entity.Property(e => e.NombreEsp)
                .HasMaxLength(100)
                .HasColumnName("nombreEsp");
        });

        modelBuilder.Entity<Farmaceutico>(entity =>
        {
            entity.HasKey(e => e.IdUsuario).HasName("PK__farmaceu__645723A6D4D3BAE8");

            entity.ToTable("farmaceutico");

            entity.Property(e => e.IdUsuario)
                .ValueGeneratedNever()
                .HasColumnName("idUsuario");

            entity.HasOne(d => d.IdUsuarioNavigation).WithOne(p => p.Farmaceutico)
                .HasForeignKey<Farmaceutico>(d => d.IdUsuario)
                .HasConstraintName("FK__farmaceut__idUsu__5FB337D6");
        });

        modelBuilder.Entity<Farmacium>(entity =>
        {
            entity.HasKey(e => e.IdFarmacia).HasName("PK__farmacia__01183E4B1DC99543");

            entity.ToTable("farmacia");

            entity.Property(e => e.IdFarmacia).HasColumnName("idFarmacia");
            entity.Property(e => e.IdEdificio).HasColumnName("idEdificio");
            entity.Property(e => e.Superficie)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("superficie");

            entity.HasOne(d => d.IdEdificioNavigation).WithMany(p => p.Farmacia)
                .HasForeignKey(d => d.IdEdificio)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Farmacia_Edificio");
        });

        modelBuilder.Entity<HistorialMedico>(entity =>
        {
            entity.HasKey(e => e.IdHistorialMedico).HasName("PK__historia__8C0EF98B02BFCDF3");

            entity.ToTable("historialMedico");

            entity.HasIndex(e => e.IdPaciente, "UQ_historialIdPaciente").IsUnique();

            entity.Property(e => e.IdHistorialMedico).HasColumnName("idHistorialMedico");
            entity.Property(e => e.EstaturaM)
                .HasColumnType("decimal(4, 2)")
                .HasColumnName("estaturaM");
            entity.Property(e => e.IdPaciente).HasColumnName("idPaciente");
            entity.Property(e => e.PesoKg)
                .HasColumnType("decimal(6, 2)")
                .HasColumnName("pesoKg");
            entity.Property(e => e.TipoSangre)
                .HasMaxLength(3)
                .HasColumnName("tipoSangre");

            entity.HasOne(d => d.IdPacienteNavigation).WithOne(p => p.HistorialMedico)
                .HasForeignKey<HistorialMedico>(d => d.IdPaciente)
                .HasConstraintName("FK_historialPaciente");
        });

        modelBuilder.Entity<HorarioEmpleado>(entity =>
        {
            entity.HasKey(e => e.IdHorarioE).HasName("PK__horarioE__D5308F49C621946C");

            entity.ToTable("horarioEmpleado");

            entity.HasIndex(e => new { e.IdUsuario, e.DiaSemana }, "IX_HorarioEmpleadoUsuarioDia");

            entity.HasIndex(e => new { e.IdUsuario, e.DiaSemana }, "UQ_horarioEmpleado").IsUnique();

            entity.Property(e => e.IdHorarioE).HasColumnName("idHorarioE");
            entity.Property(e => e.DiaSemana)
                .HasMaxLength(10)
                .HasColumnName("diaSemana");
            entity.Property(e => e.HoraFin).HasColumnName("horaFin");
            entity.Property(e => e.HoraInicio).HasColumnName("horaInicio");
            entity.Property(e => e.IdUsuario).HasColumnName("idUsuario");

            entity.HasOne(d => d.IdUsuarioNavigation).WithMany(p => p.HorarioEmpleados)
                .HasForeignKey(d => d.IdUsuario)
                .HasConstraintName("FK_horarioEmpleado");
        });

        modelBuilder.Entity<Medicamento>(entity =>
        {
            entity.HasKey(e => e.IdMedicamento).HasName("PK__medicame__42B24C5853C1C0AA");

            entity.ToTable("medicamento");

            entity.Property(e => e.IdMedicamento).HasColumnName("idMedicamento");
            entity.Property(e => e.Caducidad).HasColumnName("caducidad");
            entity.Property(e => e.Capacidad)
                .HasMaxLength(50)
                .HasColumnName("capacidad");
            entity.Property(e => e.Descripcion)
                .HasMaxLength(256)
                .HasColumnName("descripcion");
            entity.Property(e => e.IdFarmacia).HasColumnName("idFarmacia");
            entity.Property(e => e.Precio)
                .HasColumnType("money")
                .HasColumnName("precio");
            entity.Property(e => e.Stock).HasColumnName("stock");
            entity.Property(e => e.Tipo)
                .HasMaxLength(50)
                .HasColumnName("tipo");

            entity.HasOne(d => d.IdFarmaciaNavigation).WithMany(p => p.Medicamentos)
                .HasForeignKey(d => d.IdFarmacia)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Med_Farmacia");
        });

        modelBuilder.Entity<Paciente>(entity =>
        {
            entity.HasKey(e => e.IdUsuario).HasName("PK__paciente__645723A6AA22F740");

            entity.ToTable("paciente");

            entity.Property(e => e.IdUsuario)
                .ValueGeneratedNever()
                .HasColumnName("idUsuario");

            entity.HasOne(d => d.IdUsuarioNavigation).WithOne(p => p.Paciente)
                .HasForeignKey<Paciente>(d => d.IdUsuario)
                .HasConstraintName("FK__paciente__idUsua__59FA5E80");
        });

        modelBuilder.Entity<PacienteAlergiaPadecimiento>(entity =>
        {
            entity.HasKey(e => new { e.IdPaciente, e.IdAlerPade }).HasName("PK_PacienteTermino");

            entity.ToTable("pacienteAlergiaPadecimiento");

            entity.Property(e => e.IdPaciente).HasColumnName("idPaciente");
            entity.Property(e => e.IdAlerPade).HasColumnName("idAlerPade");
            entity.Property(e => e.Estado)
                .HasMaxLength(15)
                .HasColumnName("estado");
            entity.Property(e => e.FechaFin).HasColumnName("fechaFin");
            entity.Property(e => e.FechaInicio).HasColumnName("fechaInicio");
            entity.Property(e => e.Observaciones)
                .HasMaxLength(500)
                .HasColumnName("observaciones");
            entity.Property(e => e.Reaccion)
                .HasMaxLength(300)
                .HasColumnName("reaccion");
            entity.Property(e => e.Severidad)
                .HasMaxLength(20)
                .HasColumnName("severidad");

            entity.HasOne(d => d.IdAlerPadeNavigation).WithMany(p => p.PacienteAlergiaPadecimientos)
                .HasForeignKey(d => d.IdAlerPade)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_pacienteTerminoAlerPade");

            entity.HasOne(d => d.IdPacienteNavigation).WithMany(p => p.PacienteAlergiaPadecimientos)
                .HasForeignKey(d => d.IdPaciente)
                .HasConstraintName("pacienteTerminoPaciente");
        });

        modelBuilder.Entity<Pago>(entity =>
        {
            entity.HasKey(e => e.IdPago).HasName("PK__pago__BD2295AD1A3A3B89");

            entity.ToTable("pago");

            entity.HasIndex(e => new { e.IdCita, e.EstatusPago, e.VenceEn }, "IX_PagoPendiente").HasFilter("([estatusPago]=N'Pendiente')");

            entity.Property(e => e.IdPago).HasColumnName("idPago");
            entity.Property(e => e.EstatusPago)
                .HasMaxLength(15)
                .HasColumnName("estatusPago");
            entity.Property(e => e.FechaPago).HasColumnName("fechaPago");
            entity.Property(e => e.HoraPago).HasColumnName("horaPago");
            entity.Property(e => e.IdCita).HasColumnName("idCita");
            entity.Property(e => e.Monto)
                .HasColumnType("money")
                .HasColumnName("monto");
            entity.Property(e => e.MontoDevuelto)
                .HasDefaultValue(0m)
                .HasColumnType("money")
                .HasColumnName("montoDevuelto");
            entity.Property(e => e.VenceEn).HasColumnName("venceEn");

            entity.HasOne(d => d.IdCitaNavigation).WithMany(p => p.Pagos)
                .HasForeignKey(d => d.IdCita)
                .HasConstraintName("FK_Pago_Cita");
        });

        modelBuilder.Entity<PagoTicket>(entity =>
        {
            entity.HasKey(e => e.IdPagoTicket).HasName("PK__pagoTick__266A4AAA1C8ACDAC");
            entity.ToTable("pagoTicket");

            entity.Property(e => e.IdPagoTicket).HasColumnName("idPagoTicket");
            entity.Property(e => e.EstatusPago).HasMaxLength(15).HasColumnName("estatusPago");
            entity.Property(e => e.FechaPago).HasColumnName("fechaPago");
            entity.Property(e => e.HoraPago).HasColumnName("horaPago");
            entity.Property(e => e.IdFarmaceutico).HasColumnName("idFarmaceutico");
            entity.Property(e => e.IdTicket).HasColumnName("idTicket");

            entity.Property(e => e.Monto)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("monto")
                .HasDefaultValue(0m);

            entity.HasOne(d => d.IdFarmaceuticoNavigation).WithMany(p => p.PagoTickets).HasForeignKey(d => d.IdFarmaceutico).OnDelete(DeleteBehavior.SetNull).HasConstraintName("FK_Pago_Farmaceutico");
            entity.HasOne(d => d.IdTicketNavigation).WithMany(p => p.PagoTickets).HasForeignKey(d => d.IdTicket).HasConstraintName("FK_Pago_Ticket");
        });

        modelBuilder.Entity<Recepcionistum>(entity =>
        {
            entity.HasKey(e => e.IdUsuario).HasName("PK__recepcio__645723A68EAA7DFD");

            entity.ToTable("recepcionista");

            entity.Property(e => e.IdUsuario)
                .ValueGeneratedNever()
                .HasColumnName("idUsuario");
            entity.Property(e => e.EsAdmin).HasColumnName("esAdmin");

            entity.HasOne(d => d.IdUsuarioNavigation).WithOne(p => p.Recepcionistum)
                .HasForeignKey<Recepcionistum>(d => d.IdUsuario)
                .HasConstraintName("FK__recepcion__idUsu__5CD6CB2B");
        });

        modelBuilder.Entity<RecetaMedicamento>(entity =>
        {
            entity.HasKey(e => new { e.IdReceta, e.IdMedicamento }).HasName("PK_RecetaMed");

            entity.ToTable("recetaMedicamento");

            entity.Property(e => e.IdReceta).HasColumnName("idReceta");
            entity.Property(e => e.IdMedicamento).HasColumnName("idMedicamento");
            entity.Property(e => e.Cantidad).HasColumnName("cantidad");
            entity.Property(e => e.Indicaciones)
                .HasMaxLength(300)
                .HasColumnName("indicaciones");

            entity.HasOne(d => d.IdMedicamentoNavigation).WithMany(p => p.RecetaMedicamentos)
                .HasForeignKey(d => d.IdMedicamento)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_RecetaMed_Med");

            entity.HasOne(d => d.IdRecetaNavigation).WithMany(p => p.RecetaMedicamentos)
                .HasForeignKey(d => d.IdReceta)
                .HasConstraintName("FK_RecetaMed_Receta");
        });

        modelBuilder.Entity<RecetaServicio>(entity =>
        {
            entity.HasKey(e => new { e.IdReceta, e.IdServicio }).HasName("PK_RecetaServ");

            entity.ToTable("recetaServicio");

            entity.Property(e => e.IdReceta).HasColumnName("idReceta");
            entity.Property(e => e.IdServicio).HasColumnName("idServicio");
            entity.Property(e => e.Indicaciones)
                .HasMaxLength(300)
                .HasColumnName("indicaciones");

            entity.HasOne(d => d.IdRecetaNavigation).WithMany(p => p.RecetaServicios)
                .HasForeignKey(d => d.IdReceta)
                .HasConstraintName("FK_RecetaServ_Receta");

            entity.HasOne(d => d.IdServicioNavigation).WithMany(p => p.RecetaServicios)
                .HasForeignKey(d => d.IdServicio)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_RecetaServ_Serv");
        });

        modelBuilder.Entity<Recetum>(entity =>
        {
            entity.HasKey(e => e.IdReceta).HasName("PK__receta__7D03FC818C6288C5");

            entity.ToTable("receta");

            entity.Property(e => e.IdReceta).HasColumnName("idReceta");
            entity.Property(e => e.Diagnostico)
                .HasMaxLength(500)
                .HasColumnName("diagnostico");
            entity.Property(e => e.FechaReceta).HasColumnName("fechaReceta");
            entity.Property(e => e.IdCita).HasColumnName("idCita");
            entity.Property(e => e.Observaciones)
                .HasMaxLength(500)
                .HasColumnName("observaciones");

            entity.HasOne(d => d.IdCitaNavigation).WithMany(p => p.Receta)
                .HasForeignKey(d => d.IdCita)
                .HasConstraintName("FK_Receta_Cita");
        });

        modelBuilder.Entity<Servicio>(entity =>
        {
            entity.HasKey(e => e.IdServicio).HasName("PK__servicio__CEB981191FE40967");

            entity.ToTable("servicio");

            entity.Property(e => e.IdServicio).HasColumnName("idServicio");
            entity.Property(e => e.Descripcion)
                .HasMaxLength(256)
                .HasColumnName("descripcion");
            entity.Property(e => e.IdEnfermera).HasColumnName("idEnfermera");
            entity.Property(e => e.Precio)
                .HasColumnType("money")
                .HasColumnName("precio");
            entity.Property(e => e.Stock).HasColumnName("stock");
            entity.Property(e => e.Tipo)
                .HasMaxLength(50)
                .HasColumnName("tipo");

            entity.HasOne(d => d.IdEnfermeraNavigation).WithMany(p => p.Servicios)
                .HasForeignKey(d => d.IdEnfermera)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Servicio_Enfermera");
        });

        modelBuilder.Entity<Ticket>(entity =>
        {
            entity.HasKey(e => e.IdTicket).HasName("PK__ticket__22B1456FF34DCA0C"); 
            entity.ToTable("ticket");

            entity.Property(e => e.IdTicket).HasColumnName("idTicket");
            
            entity.Property(e => e.Fecha)
                .HasDefaultValueSql("(sysutcdatetime())")
                .HasColumnName("fecha");

            entity.Property(e => e.IdFarmaceutico).HasColumnName("idFarmaceutico");
            entity.Property(e => e.IdFarmacia).HasColumnName("idFarmacia");
            entity.Property(e => e.IdPaciente).HasColumnName("idPaciente"); // Asegurando que exista la propiedad

            entity.HasOne(d => d.IdFarmaciaNavigation).WithMany(p => p.Tickets)
                .HasForeignKey(d => d.IdFarmacia)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Ticket_Farmacia");

            entity.HasOne(d => d.IdPacienteNavigation)
                .WithMany(p => p.Tickets) 
                .HasForeignKey(d => d.IdPaciente)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_ticket_paciente");
        });

        modelBuilder.Entity<TicketMedicamento>(entity =>
        {
            entity.HasKey(e => new { e.IdTicket, e.IdMedicamento }).HasName("PK_TicketMed");
            entity.ToTable("ticketMedicamento");

            entity.Property(e => e.IdTicket).HasColumnName("idTicket");
            entity.Property(e => e.IdMedicamento).HasColumnName("idMedicamento");
            entity.Property(e => e.Cantidad).HasColumnName("cantidad");
            
            entity.Property(e => e.PrecioUnitario)
                .HasColumnType("money") // O decimal(10,2) según tu BD
                .HasColumnName("precioUnitario");

            // --- IMPORTANTE: Configuración de Columna Calculada ---
            entity.Property(e => e.Importe)
                .HasColumnName("importe")
                .HasColumnType("decimal(10, 2)")
                .HasComputedColumnSql("(CONVERT([decimal](10,2),[cantidad])*CONVERT([decimal](10,2),[precioUnitario]))", stored: true);
            // -----------------------------------------------------

            entity.HasOne(d => d.IdTicketNavigation).WithMany(p => p.TicketMedicamentos)
                .HasForeignKey(d => d.IdTicket)
                .HasConstraintName("FK_TicketMed_Ticket");
        });

        modelBuilder.Entity<TicketServicio>(entity =>
        {
            entity.HasKey(e => new { e.IdTicket, e.IdServicio }).HasName("PK_TicketServ");
            entity.ToTable("ticketServicio");

            entity.Property(e => e.IdTicket).HasColumnName("idTicket");
            entity.Property(e => e.IdServicio).HasColumnName("idServicio");
            entity.Property(e => e.Cantidad).HasColumnName("cantidad");
            
            entity.Property(e => e.PrecioUnitario)
                .HasColumnType("money")
                .HasColumnName("precioUnitario");

            entity.Property(e => e.Importe)
                .HasColumnName("importe")
                .HasColumnType("decimal(10, 2)")
                .HasComputedColumnSql("(CONVERT([decimal](10,2),[cantidad])*CONVERT([decimal](10,2),[precioUnitario]))", stored: true);

            entity.HasOne(d => d.IdTicketNavigation).WithMany(p => p.TicketServicios)
                .HasForeignKey(d => d.IdTicket)
                .HasConstraintName("FK_TicketServ_Ticket");
        });

        modelBuilder.Entity<UsuarioSistema>(entity =>
        {
            entity.HasKey(e => e.IdUsuario).HasName("PK__usuarioS__645723A605BB04DE");

            entity.ToTable("usuarioSistema");

            entity.HasIndex(e => e.Curp, "UQ_usuarioCURP").IsUnique();

            entity.Property(e => e.IdUsuario).HasColumnName("idUsuario");
            entity.Property(e => e.ApMat)
                .HasMaxLength(20)
                .HasColumnName("apMat");
            entity.Property(e => e.ApPat)
                .HasMaxLength(20)
                .HasColumnName("apPat");
            entity.Property(e => e.Curp)
                .HasMaxLength(18)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("curp");
            entity.Property(e => e.IdContacto).HasColumnName("idContacto");
            entity.Property(e => e.Nombre)
                .HasMaxLength(20)
                .HasColumnName("nombre");
            entity.Property(e => e.TipoUsuario)
                .HasMaxLength(20)
                .HasColumnName("tipoUsuario");

            entity.HasOne(d => d.IdContactoNavigation).WithMany(p => p.UsuarioSistemas)
                .HasForeignKey(d => d.IdContacto)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_usuarioContacto");
        });

        modelBuilder.Entity<CompraWeb>(entity =>
        {
            entity.HasKey(e => e.IdCompra);
            entity.ToTable("compraWeb");
            entity.Property(e => e.TotalGeneral).HasColumnType("decimal(10, 2)");
        });

        modelBuilder.Entity<DetalleCompraWeb>(entity =>
        {
            entity.HasKey(e => e.IdDetalleWeb);
            entity.ToTable("detalleCompraWeb");
            
            entity.Property(e => e.PrecioUnitario).HasColumnType("decimal(10, 2)");
            
            entity.Property(e => e.Importe)
                  .HasComputedColumnSql("([cantidad] * [precioUnitario])", stored: false);

            entity.HasOne(d => d.Compra)
                  .WithMany(p => p.Detalles)
                  .HasForeignKey(d => d.IdCompra)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<_EmpleadoCrearSpRow>().HasNoKey();
        modelBuilder.Entity<_EmpleadoListSpRow>().HasNoKey();
        modelBuilder.Entity<_PacienteCrearSpRow>().HasNoKey();
        
        modelBuilder.Entity<VwBitacoraHistorialCitaMp>()
        .ToView("vw_BitacoraHistorialCitaMP")
        .HasNoKey();


        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}