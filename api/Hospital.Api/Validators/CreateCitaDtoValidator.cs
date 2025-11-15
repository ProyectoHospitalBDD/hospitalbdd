using FluentValidation;
using Hospital.Api.Dtos.Citas;

namespace Hospital.Api.Validators;
public class CreateCitaDtoValidator : AbstractValidator<CreateCitaDto>
{
    public CreateCitaDtoValidator()
    {
        RuleFor(x => x.PacienteId).GreaterThan(0);
        RuleFor(x => x.DoctorId).GreaterThan(0);
        RuleFor(x => x.DuracionMin).Must(d => d == 30 || d == 60 || d == 90)
            .WithMessage("Solo 30, 60 o 90 minutos.");
        RuleFor(x => x.FechaInicioUtc)
            .Must(dt => dt > DateTime.UtcNow.AddHours(48)
                     && dt <= DateTime.UtcNow.Date.AddMonths(3).AddDays(1).AddSeconds(-1))
            .WithMessage("La cita debe agendarse entre 48h y 3 meses.");
    }
}
