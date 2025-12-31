import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  listarTodoElInventario,
  ProductoFarmaciaDto
} from "../../api/farmaciaApi";

// Reutilizamos el CSS del inventario para mantener el diseño
import "../Inventario/Productos.css"; 

const IMAGENES_LOCALES: Record<string, string> = {
  "Paracetamol 500mg": "../../public/imagenes/Paracetamol.png",
  "Amoxicilina 500mg": "../../public/imagenes/Amoxicilina.png",
  "Ibuprofeno 400mg": "../../public/imagenes/Ibuprofeno.png",
  "Metformina 850mg": "../../public/imagenes/Metformina.png",
  "Losartán 50mg": "../../public/imagenes/Losartan.png",
  "Antiflu-Des": "../../public/imagenes/Anit.png",
  "Complejo B": "../../public/imagenes/Complejo.png",
  "Omeprazol 20mg": "../../public/imagenes/Omeo.png",
  "Loratadina 10mg": "../../public/imagenes/Lora.png",
  "Alcohol Etílico": "../../public/imagenes/Alcohol.png",
  // Servicios:
  "Inyección Intramuscular": "../../public/imagenes/Inyeccion.png",
  "Curación de Herida Menor": "../../public/imagenes/Curacion.png",
  "Toma de Presión Arterial": "../../public/imagenes/Presion.png",
  "Nebulización (Sesión 20 min)": "../../public/imagenes/Nebuliza.png",
  "Retiro de Puntos/Suturas": "../../public/imagenes/Puntos.png",
  "Colocación de Venoclisis (Suero)": "../../public/imagenes/Suero.png",
  "Prueba de Glucosa Capilar": "../../public/imagenes/Glucosa.png",
  "Lavado Ótico (Oído)": "../../public/imagenes/Lavado.png",
  "Electrocardiograma Simple": "../../public/imagenes/Electro.png",
  "Aplicación de Vacuna Tétanos": "../../public/imagenes/Vacuna.png",
};

export default function Tienda() {
  const navigate = useNavigate();
  
  const [productos, setProductos] = useState<ProductoFarmaciaDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  
  // Estado para notificar al usuario (Toast simulado)
  const [mensajeToast, setMensajeToast] = useState<string | null>(null);

  useEffect(() => {
    cargarCatalogo();
  }, []);

  const cargarCatalogo = () => {
    setLoading(true);
    listarTodoElInventario()
      .then((data) => {
        setProductos(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar la tienda:", err);
        setError("No pudimos cargar el catálogo. Intente más tarde.");
        setLoading(false);
      });
  };

  const productosFiltrados = productos.filter(p => {
    const item = p as any; 
    const nombreReal = p.nombre || item.Descripcion || item.descripcion || item.Nombre || "";
    const tipoReal = p.tipo || item.Tipo || "";
    const termino = busqueda.toLowerCase().trim();
    if (!termino) return true; 

    return (
      nombreReal.toLowerCase().includes(termino) ||
      tipoReal.toLowerCase().includes(termino)
    );
  });

  const handleAgregarCarrito = (producto: ProductoFarmaciaDto) => {
    // Aquí irá la lógica real de tu carrito (Context o Redux)
    console.log("Agregando al carrito:", producto);
    
    // Feedback visual para el usuario
    setMensajeToast(`🛒 ${producto.nombre} agregado al carrito`);
    setTimeout(() => setMensajeToast(null), 3000);
  };

  const getImagenProducto = (prod: ProductoFarmaciaDto) => {
    const item = prod as any;
    const nombreReal = prod.nombre || item.Descripcion || item.descripcion || "";
    
    if (nombreReal && IMAGENES_LOCALES[nombreReal]) {
      return <img src={IMAGENES_LOCALES[nombreReal]} alt={nombreReal} />;
    }
    
    const icon = prod.origen === 'Medicamento' ? '💊'
               : prod.origen === 'Servicio' ? '🩺'
               : '📦';
    return <span style={{fontSize: '4rem'}}>{icon}</span>;
  };

  if (loading) return <div className="loading-screen"><div className="loader"></div> Cargando tienda...</div>;
  
  if (error) return (
    <div className="error-screen">
      <p>{error}</p>
      <button onClick={cargarCatalogo}>Recargar</button>
    </div>
  );

  return (
    <div className="inventario-page">
      <header className="top-app-bar" style={{ marginBottom: '20px' }}>
        <div className="navigation-icon" onClick={() => navigate(-1)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
        </div>
        
        <h1>Tienda de Salud</h1>
        
        <div className="search-bar-container">
            <div className="search-wrapper" style={{position: 'relative', width: '100%', maxWidth: '350px'}}>
                <div style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#7f8c8d', display: 'flex', alignItems: 'center'}}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </div>
                {/* CAMBIO: Placeholder orientado al cliente */}
                <input
                    type="text"
                    placeholder="Compre su producto o servicio..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="search-input"
                    style={{paddingLeft: '40px', width: '100%', maxWidth: '100%'}} 
                />
            </div>
        </div>
      </header>

      <main className="material-list">
        {productosFiltrados.length === 0 ? (
            <div style={{textAlign: 'center', width: '100%', padding: '40px', color: '#666', gridColumn: '1 / -1'}}>
                {busqueda ? `No encontramos resultados para "${busqueda}"` : "El catálogo está vacío por el momento."}
            </div>
        ) : (
            productosFiltrados.map((prod) => {
              const item = prod as any;
              const nombreMostrar = prod.nombre || item.Descripcion || item.descripcion || "Producto";
              const tipoMostrar = prod.tipo || item.Tipo || "General";
              
              // Verificamos si está agotado (solo si maneja stock numérico y es <= 0)
              // Si stock es null (servicio infinito), nunca está agotado.
              const agotado = prod.stock !== null && prod.stock <= 0;

              return (
                <div key={`${prod.origen}-${prod.idProducto}`} className="material-card">
                  <span className={`material-type ${tipoMostrar.toLowerCase()}`}>
                      {tipoMostrar}
                  </span>

                  <div className="material-image">
                      {getImagenProducto(prod)}
                  </div>
                  
                  <h3 className="material-name">{nombreMostrar}</h3>
                  
                  {/* Información simplificada para el cliente */}
                  {prod.detalleExtra && (
                      <div className="material-info-extra" style={{color:'#666', fontSize:'0.85rem'}}>
                          {/* Solo mostramos la primera parte (Capacidad/Presentación), ocultamos vencimiento si no es relevante */}
                          {prod.detalleExtra.split('|')[0]} 
                      </div>
                  )}

                  <div className="price-tag">${(prod.precio || 0).toFixed(2)}</div>

                  {/* CONTROLES DE CLIENTE: Botón de Carrito */}
                  <div style={{marginTop: 'auto', width: '100%'}}>
                    {agotado ? (
                        <button className="save-button" disabled style={{background: '#ccc', cursor: 'not-allowed', boxShadow: 'none'}}>
                            Agotado
                        </button>
                    ) : (
                        <button
                            className="save-button"
                            onClick={() => handleAgregarCarrito(prod)}
                            style={{
                                // Usamos un azul atractivo para diferenciar de la acción "Guardar" del inventario
                                background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            {/* Icono de Carrito */}
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="9" cy="21" r="1"></circle>
                                <circle cx="20" cy="21" r="1"></circle>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                            </svg>
                            Agregar al Carrito
                        </button>
                    )}
                  </div>

                </div>
              );
            })
        )}
      </main>

      {/* TOAST DE NOTIFICACIÓN */}
      <div className={`dialog-backdrop ${mensajeToast ? 'active' : ''}`} style={{background: 'transparent', pointerEvents: 'none'}}>
          {mensajeToast && (
            <div 
                className="dialog" 
                style={{
                    position: 'fixed', 
                    bottom: '30px', 
                    left: '50%', 
                    transform: 'translateX(-50%)', 
                    width: 'auto', 
                    padding: '12px 24px',
                    background: '#27ae60',
                    color: 'white',
                    fontWeight: '600',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                    borderRadius: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '0.95rem'
                }}
            >
                {mensajeToast}
            </div>
          )}
        </div>
    </div>
  );
}