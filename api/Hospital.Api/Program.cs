using Microsoft.EntityFrameworkCore;
using Hospital.Api.Persistence; // <-- donde quedó tu HospitalContext

var builder = WebApplication.CreateBuilder(args);

// Controllers (API)
builder.Services.AddControllers();

// CORS para el front de React (Vite usa 5173)
builder.Services.AddCors(opt =>
{
    opt.AddPolicy("frontend", p =>
        p.WithOrigins("http://localhost:5173")
         .AllowAnyHeader()
         .AllowAnyMethod());
});

// DbContext apuntando al connection string de appsettings.json
builder.Services.AddDbContext<HospitalContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("SqlServer")));

// Swagger (útil en dev para probar los endpoints)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseCors("frontend");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapControllers();

app.Run();
