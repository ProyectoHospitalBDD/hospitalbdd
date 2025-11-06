using System;
using System.Collections.Generic;
using Hospital.Api.Persistence.Models;
using Microsoft.EntityFrameworkCore;

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

    public virtual DbSet<alergiaPadecimiento> alergiaPadecimientos { get; set; }

    public virtual DbSet<citum> cita { get; set; }

    public virtual DbSet<consultorio> consultorios { get; set; }

    public virtual DbSet<contacto> contactos { get; set; }

    public virtual DbSet<doctor> doctors { get; set; }

    public virtual DbSet<edificio> edificios { get; set; }

    public virtual DbSet<empleado> empleados { get; set; }

    public virtual DbSet<enfermera> enfermeras { get; set; }

    public virtual DbSet<especialidad> especialidads { get; set; }

    public virtual DbSet<farmaceutico> farmaceuticos { get; set; }

    public virtual DbSet<farmacium> farmacia { get; set; }

    public virtual DbSet<historialMedico> historialMedicos { get; set; }

    public virtual DbSet<horarioEmpleado> horarioEmpleados { get; set; }

    public virtual DbSet<medicamento> medicamentos { get; set; }

    public virtual DbSet<paciente> pacientes { get; set; }

    public virtual DbSet<pacienteAlergiaPadecimiento> pacienteAlergiaPadecimientos { get; set; }

    public virtual DbSet<pago> pagos { get; set; }

    public virtual DbSet<pagoTicket> pagoTickets { get; set; }

    public virtual DbSet<recepcionistum> recepcionista { get; set; }

    public virtual DbSet<recetaMedicamento> recetaMedicamentos { get; set; }

    public virtual DbSet<recetaServicio> recetaServicios { get; set; }

    public virtual DbSet<recetum> receta { get; set; }

    public virtual DbSet<servicio> servicios { get; set; }

    public virtual DbSet<ticket> tickets { get; set; }

    public virtual DbSet<ticketMedicamento> ticketMedicamentos { get; set; }

    public virtual DbSet<ticketServicio> ticketServicios { get; set; }

    public virtual DbSet<usuarioSistema> usuarioSistemas { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<alergiaPadecimiento>(entity =>
        {
            entity.HasKey(e => e.idAlerPade).HasName("PK__alergiaP__A9A7988EFABBAACA");

            entity.Property(e => e.nombreNormalizado).HasComputedColumnSql("(lower(ltrim(rtrim([nombre]))))", true);
        });

        modelBuilder.Entity<citum>(entity =>
        {
            entity.HasKey(e => e.idCita).HasName("PK__cita__814F3126C4E76F4C");

            entity.HasOne(d => d.idDoctorNavigation).WithMany(p => p.cita)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Cita_Doctor");

            entity.HasOne(d => d.idPacienteNavigation).WithMany(p => p.cita)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Cita_Paciente");
        });

        modelBuilder.Entity<consultorio>(entity =>
        {
            entity.HasKey(e => e.idConsultorio).HasName("PK__consulto__230EBF0F8D1D0FAB");

            entity.HasOne(d => d.idEdificioNavigation).WithMany(p => p.consultorios)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_consultorioEdificio");
        });

        modelBuilder.Entity<contacto>(entity =>
        {
            entity.HasKey(e => e.idContacto).HasName("PK__contacto__4B1329C7F5795180");
        });

        modelBuilder.Entity<doctor>(entity =>
        {
            entity.HasKey(e => e.idUsuario).HasName("PK__doctor__645723A6EFF284DE");

            entity.Property(e => e.idUsuario).ValueGeneratedNever();

            entity.HasOne(d => d.idConsultorioNavigation).WithMany(p => p.doctors)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_doctorConsultorio");

            entity.HasOne(d => d.idEspecialidadNavigation).WithMany(p => p.doctors)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_doctorEspecialidad");

            entity.HasOne(d => d.idUsuarioNavigation).WithOne(p => p.doctor).HasConstraintName("FK__doctor__idUsuari__73BA3083");
        });

        modelBuilder.Entity<edificio>(entity =>
        {
            entity.HasKey(e => e.idEdificio).HasName("PK__edificio__5A8ABE417D2BDBB6");
        });

        modelBuilder.Entity<empleado>(entity =>
        {
            entity.HasKey(e => e.idUsuario).HasName("PK__empleado__645723A64D1B00FE");

            entity.Property(e => e.idUsuario).ValueGeneratedNever();

            entity.HasOne(d => d.idUsuarioNavigation).WithOne(p => p.empleado).HasConstraintName("FK__empleado__idUsua__5165187F");
        });

        modelBuilder.Entity<enfermera>(entity =>
        {
            entity.HasKey(e => e.idUsuario).HasName("PK__enfermer__645723A603305EDA");

            entity.Property(e => e.idUsuario).ValueGeneratedNever();

            entity.HasOne(d => d.idUsuarioNavigation).WithOne(p => p.enfermera).HasConstraintName("FK__enfermera__idUsu__628FA481");
        });

        modelBuilder.Entity<especialidad>(entity =>
        {
            entity.HasKey(e => e.idEspecialidad).HasName("PK__especial__E8AB1600BA796F95");
        });

        modelBuilder.Entity<farmaceutico>(entity =>
        {
            entity.HasKey(e => e.idUsuario).HasName("PK__farmaceu__645723A6D4D3BAE8");

            entity.Property(e => e.idUsuario).ValueGeneratedNever();

            entity.HasOne(d => d.idUsuarioNavigation).WithOne(p => p.farmaceutico).HasConstraintName("FK__farmaceut__idUsu__5FB337D6");
        });

        modelBuilder.Entity<farmacium>(entity =>
        {
            entity.HasKey(e => e.idFarmacia).HasName("PK__farmacia__01183E4B1DC99543");

            entity.HasOne(d => d.idEdificioNavigation).WithMany(p => p.farmacia)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Farmacia_Edificio");
        });

        modelBuilder.Entity<historialMedico>(entity =>
        {
            entity.HasKey(e => e.idHistorialMedico).HasName("PK__historia__8C0EF98B02BFCDF3");

            entity.HasOne(d => d.idPacienteNavigation).WithOne(p => p.historialMedico).HasConstraintName("FK_historialPaciente");
        });

        modelBuilder.Entity<horarioEmpleado>(entity =>
        {
            entity.HasKey(e => e.idHorarioE).HasName("PK__horarioE__D5308F49C621946C");

            entity.HasOne(d => d.idUsuarioNavigation).WithMany(p => p.horarioEmpleados).HasConstraintName("FK_horarioEmpleado");
        });

        modelBuilder.Entity<medicamento>(entity =>
        {
            entity.HasKey(e => e.idMedicamento).HasName("PK__medicame__42B24C5853C1C0AA");

            entity.HasOne(d => d.idFarmaciaNavigation).WithMany(p => p.medicamentos)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Med_Farmacia");
        });

        modelBuilder.Entity<paciente>(entity =>
        {
            entity.HasKey(e => e.idUsuario).HasName("PK__paciente__645723A6AA22F740");

            entity.Property(e => e.idUsuario).ValueGeneratedNever();

            entity.HasOne(d => d.idUsuarioNavigation).WithOne(p => p.paciente).HasConstraintName("FK__paciente__idUsua__59FA5E80");
        });

        modelBuilder.Entity<pacienteAlergiaPadecimiento>(entity =>
        {
            entity.HasKey(e => new { e.idPaciente, e.idAlerPade }).HasName("PK_PacienteTermino");

            entity.HasOne(d => d.idAlerPadeNavigation).WithMany(p => p.pacienteAlergiaPadecimientos)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_pacienteTerminoAlerPade");

            entity.HasOne(d => d.idPacienteNavigation).WithMany(p => p.pacienteAlergiaPadecimientos).HasConstraintName("pacienteTerminoPaciente");
        });

        modelBuilder.Entity<pago>(entity =>
        {
            entity.HasKey(e => e.idPago).HasName("PK__pago__BD2295AD1A3A3B89");

            entity.HasOne(d => d.idCitaNavigation).WithMany(p => p.pagos).HasConstraintName("FK_Pago_Cita");
        });

        modelBuilder.Entity<pagoTicket>(entity =>
        {
            entity.HasKey(e => e.idPagoTicket).HasName("PK__pagoTick__266A4AAA1C8ACDAC");

            entity.HasOne(d => d.idFarmaceuticoNavigation).WithMany(p => p.pagoTickets)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Pago_Farmaceutico");

            entity.HasOne(d => d.idTicketNavigation).WithMany(p => p.pagoTickets).HasConstraintName("FK_Pago_Ticket");
        });

        modelBuilder.Entity<recepcionistum>(entity =>
        {
            entity.HasKey(e => e.idUsuario).HasName("PK__recepcio__645723A68EAA7DFD");

            entity.Property(e => e.idUsuario).ValueGeneratedNever();

            entity.HasOne(d => d.idUsuarioNavigation).WithOne(p => p.recepcionistum).HasConstraintName("FK__recepcion__idUsu__5CD6CB2B");
        });

        modelBuilder.Entity<recetaMedicamento>(entity =>
        {
            entity.HasKey(e => new { e.idReceta, e.idMedicamento }).HasName("PK_RecetaMed");

            entity.HasOne(d => d.idMedicamentoNavigation).WithMany(p => p.recetaMedicamentos)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_RecetaMed_Med");

            entity.HasOne(d => d.idRecetaNavigation).WithMany(p => p.recetaMedicamentos).HasConstraintName("FK_RecetaMed_Receta");
        });

        modelBuilder.Entity<recetaServicio>(entity =>
        {
            entity.HasKey(e => new { e.idReceta, e.idServicio }).HasName("PK_RecetaServ");

            entity.HasOne(d => d.idRecetaNavigation).WithMany(p => p.recetaServicios).HasConstraintName("FK_RecetaServ_Receta");

            entity.HasOne(d => d.idServicioNavigation).WithMany(p => p.recetaServicios)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_RecetaServ_Serv");
        });

        modelBuilder.Entity<recetum>(entity =>
        {
            entity.HasKey(e => e.idReceta).HasName("PK__receta__7D03FC818C6288C5");

            entity.HasOne(d => d.idCitaNavigation).WithMany(p => p.receta).HasConstraintName("FK_Receta_Cita");
        });

        modelBuilder.Entity<servicio>(entity =>
        {
            entity.HasKey(e => e.idServicio).HasName("PK__servicio__CEB981191FE40967");

            entity.HasOne(d => d.idEnfermeraNavigation).WithMany(p => p.servicios)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Servicio_Enfermera");
        });

        modelBuilder.Entity<ticket>(entity =>
        {
            entity.HasKey(e => e.idTicket).HasName("PK__ticket__22B1456FF34DCA0C");

            entity.Property(e => e.fecha).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.idFarmaceuticoNavigation).WithMany(p => p.tickets)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Ticket_Farmaceutico");

            entity.HasOne(d => d.idFarmaciaNavigation).WithMany(p => p.tickets)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Ticket_Farmacia");
        });

        modelBuilder.Entity<ticketMedicamento>(entity =>
        {
            entity.HasKey(e => new { e.idTicket, e.idMedicamento }).HasName("PK_TicketMed");

            entity.HasOne(d => d.idMedicamentoNavigation).WithMany(p => p.ticketMedicamentos)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_TicketMed_Med");

            entity.HasOne(d => d.idTicketNavigation).WithMany(p => p.ticketMedicamentos).HasConstraintName("FK_TicketMed_Ticket");
        });

        modelBuilder.Entity<ticketServicio>(entity =>
        {
            entity.HasKey(e => new { e.idTicket, e.idServicio }).HasName("PK_TicketServ");

            entity.HasOne(d => d.idServicioNavigation).WithMany(p => p.ticketServicios)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_TicketServ_Serv");

            entity.HasOne(d => d.idTicketNavigation).WithMany(p => p.ticketServicios).HasConstraintName("FK_TicketServ_Ticket");
        });

        modelBuilder.Entity<usuarioSistema>(entity =>
        {
            entity.HasKey(e => e.idUsuario).HasName("PK__usuarioS__645723A605BB04DE");

            entity.Property(e => e.curp).IsFixedLength();

            entity.HasOne(d => d.idContactoNavigation).WithMany(p => p.usuarioSistemas)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_usuarioContacto");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
