using System;

namespace Hospital.Api.Dtos.Caja
{
    public class CobroItemDto
    {
        public int IdReferencia { get; set; }   
        public string Origen { get; set; } = string.Empty; 
        public string Paciente { get; set; } = string.Empty;
        public string Concepto { get; set; } = string.Empty; 
        public decimal MontoTotal { get; set; }
        public DateTime Fecha { get; set; }
        public string Estatus { get; set; } = string.Empty;
        
        public bool EsPagado 
        {
            get 
            {
                var s = Estatus.ToLower();
                return s.Contains("pagada") || 
                       s.Contains("atendida") || 
                       s.Contains("entregado") ||
                       s == "pagado";
            }
        }
    }
}