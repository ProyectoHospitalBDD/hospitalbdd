using FluentValidation;
using FluentValidation.AspNetCore;
using Hospital.Api.Middleware;
using Hospital.Api.Services;
using Hospital.Api.Persistence;         // Asegúrate que aquí vive HospitalContext
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Controllers + FluentValidation
builder.Services.AddControllers();
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<Hospital.Api.Validators.CreateCitaDtoValidator>();

// CORS para el front (Vite: 5173)
builder.Services.AddCors(opt =>
{
    opt.AddPolicy("frontend", p => p
        .WithOrigins("http://localhost:5173")
        .AllowAnyHeader()
        .AllowAnyMethod());
});

// DbContext (usa la cadena "SqlServer" del appsettings.json)
builder.Services.AddDbContext<HospitalContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("SqlServer")));

// Services
builder.Services.AddScoped<CitasService>();

// Swagger (útil en dev)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("frontend");
// app.UseHttpsRedirection(); // opcional si corres con HTTPS
app.UseMiddleware<SqlExceptionMiddleware>();

app.MapControllers();
app.Run();
