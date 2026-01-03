using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Hospital.Api.Persistence;
using Hospital.Api.Models;
using Hospital.Api.Dtos.Compras; 

namespace Hospital.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // Genera ruta: /api/Compra
    public class CompraApiController : ControllerBase
    {
        private readonly HospitalContext _db;

        public CompraApiController(HospitalContext db)
        {
            _db = db;
        }

        [HttpPost]
        public async Task<ActionResult<CompraExitosaDto>> RegistrarCompra([FromBody] CrearCompraPayload payload)
        {
            // 1. Validar Paciente
            if (payload.IdPaciente.HasValue)
            {
                var existePaciente = await _db.Pacientes.AnyAsync(p => p.IdUsuario == payload.IdPaciente.Value);
                if (!existePaciente)
                {
                    return BadRequest($"El paciente con ID {payload.IdPaciente} no existe.");
                }
            }

            // 2. Transacción
            using var transaction = await _db.Database.BeginTransactionAsync();

            try
            {
                // Encabezado
                var nuevaCompra = new CompraWeb
                {
                    IdPaciente = payload.IdPaciente,
                    NombreClienteInvitado = payload.NombreClienteInvitado,
                    CorreoContacto = payload.CorreoContacto,
                    TotalGeneral = payload.TotalGeneral,
                    FechaCompra = DateTime.Now,
                    Estatus = "Pagado"
                };

                _db.CompraWebs.Add(nuevaCompra);
                await _db.SaveChangesAsync();

                // Detalles
                foreach (var item in payload.Detalles)
                {
                    var detalle = new DetalleCompraWeb
                    {
                        IdCompra = nuevaCompra.IdCompra,
                        IdMedicamento = item.IdMedicamento,
                        IdServicio = item.IdServicio,
                        Cantidad = item.Cantidad,
                        PrecioUnitario = item.PrecioUnitario
                    };

                    // Stock
                    if (item.IdMedicamento.HasValue)
                    {
                        var med = await _db.Medicamentos.FindAsync(item.IdMedicamento.Value);
                        if (med == null) throw new Exception($"Medicamento {item.IdMedicamento} no encontrado.");
                        
                        if (med.Stock < item.Cantidad) 
                            throw new Exception($"Stock insuficiente para {med.Descripcion}.");

                        med.Stock -= item.Cantidad;
                    }
                    else if (item.IdServicio.HasValue)
                    {
                        var serv = await _db.Servicios.FindAsync(item.IdServicio.Value);
                        if (serv == null) throw new Exception($"Servicio {item.IdServicio} no encontrado.");

                        if (serv.Stock != null)
                        {
                            if (serv.Stock < item.Cantidad)
                                throw new Exception($"Cupo insuficiente para {serv.Descripcion}.");
                            
                            serv.Stock -= item.Cantidad;
                        }
                    }

                    _db.DetalleCompraWebs.Add(detalle);
                }

                await _db.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new CompraExitosaDto 
                { 
                    IdCompra = nuevaCompra.IdCompra, 
                    Mensaje = "Compra registrada correctamente" 
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest($"Error: {ex.Message}");
            }
        }
    }
}