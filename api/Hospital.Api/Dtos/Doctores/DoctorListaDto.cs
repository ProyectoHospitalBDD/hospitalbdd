namespace Hospital.Api.Dtos.Doctores{
    public record DoctorListaDto(
        int IdDoctor,
        string NombreMostrar,
        string Cedula,
        string Consultorio
    );
}