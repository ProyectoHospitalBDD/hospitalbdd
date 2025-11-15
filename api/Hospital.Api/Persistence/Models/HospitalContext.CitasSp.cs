using Hospital.Api.Persistence.Models;
using Microsoft.EntityFrameworkCore;

namespace Hospital.Api.Persistence;

public partial class HospitalContext
{
    // Opcional, pero cómodo por si quieres usar _context.CitaSpRows
    public virtual DbSet<_CitaSpRow> CitaSpRows { get; set; } = null!;

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder)
    {
        // Configuración de tipo "keyless" para el resultado del SP
        modelBuilder.Entity<_CitaSpRow>(entity =>
        {
            entity.HasNoKey();      // no tiene PK en la BD
            entity.ToView(null);    // no está mapeado a una tabla/vista concreta

            entity.Property(e => e.IdCita).HasColumnName("idCita");
            entity.Property(e => e.IdPaciente).HasColumnName("idPaciente");
            entity.Property(e => e.IdDoctor).HasColumnName("idDoctor");
            entity.Property(e => e.EstatusCita).HasColumnName("estatusCita");
            entity.Property(e => e.FechaHoraInicio).HasColumnName("fechaHoraInicio");
            entity.Property(e => e.DuracionMin).HasColumnName("duracionMin");
            entity.Property(e => e.FechaHoraFin).HasColumnName("fechaHoraFin");
            entity.Property(e => e.Costo).HasColumnName("costo");
            entity.Property(e => e.VenceEn).HasColumnName("venceEn");
        });
    }
}
