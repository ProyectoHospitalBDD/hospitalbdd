using FluentValidation;
using FluentValidation.AspNetCore;
using Hospital.Api.Middleware;
using Hospital.Api.Services;
using Hospital.Api.Services.Auth;
using Hospital.Api.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;               
using System.Text;
using Hospital.Api.Jobs;

var builder = WebApplication.CreateBuilder(args);

// ================= JWT =================
var jwtSection = builder.Configuration.GetSection("Jwt");
var keyBytes = Encoding.UTF8.GetBytes(jwtSection["Key"]!);

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,
            ValidIssuer = jwtSection["Issuer"],
            ValidAudience = jwtSection["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// ============ Controllers + FluentValidation ============
builder.Services.AddControllers();
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<Hospital.Api.Validators.CreateCitaDtoValidator>();

// ================== CORS (front Vite 5173) ==================
builder.Services.AddCors(opt =>
{
    opt.AddPolicy("frontend", p => p
        .WithOrigins("http://localhost:5173")
        .AllowAnyHeader()
        .AllowAnyMethod());
});

// ================== DbContext ==================
builder.Services.AddDbContext<HospitalContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("SqlServer")));

// ================== Services ==================
builder.Services.AddScoped<CitasService>();
builder.Services.AddSingleton<PasswordService>();
builder.Services.AddSingleton<TokenService>();

builder.Services.Configure<VencerCitasJobOptions>(
    builder.Configuration.GetSection("Jobs:VencerCitas"));

builder.Services.AddHostedService<VencerCitasHostedService>();

builder.Services.AddScoped<Hospital.Api.Services.Empleados.EmpleadosService>();
builder.Services.AddScoped<Hospital.Api.Services.Auth.PasswordService>();

builder.Services.AddScoped<Hospital.Api.Services.Catalogos.CatalogosService>();

// ================== Swagger ==================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Hospital.Api",
        Version = "v1"
    });

    //Esquema de seguridad JWT para que aparezca el botón Authorize
    var securityScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Description = "Introduce el token JWT con el formato: Bearer {token}",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Reference = new OpenApiReference
        {
            Type = ReferenceType.SecurityScheme,
            Id = "Bearer"
        }
    };

    c.AddSecurityDefinition("Bearer", securityScheme);

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { securityScheme, Array.Empty<string>() }
    });
});

var app = builder.Build();

// ================== Middleware ==================
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<SqlExceptionMiddleware>();

app.UseRouting();

app.UseCors("frontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
