using FluentValidation;
using FluentValidation.AspNetCore;
using Hospital.Api.Middleware;
using Hospital.Api.Services;
using Hospital.Api.Services.Auth;
using Hospital.Api.Persistence;      
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;


var builder = WebApplication.CreateBuilder(args);

//configurar JWT
var jwtSettings = builder.Configuration.GetSection("Jwt");
var keyBytes = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

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

//Password
builder.Services.AddSingleton<PasswordService>();

var app = builder.Build();

// Middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("frontend");

app.UseRouting();

app.UseAuthentication();   
app.UseAuthorization();

app.UseMiddleware<SqlExceptionMiddleware>();

app.MapControllers();
app.Run();
