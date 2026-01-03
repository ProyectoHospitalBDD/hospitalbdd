import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  listarTodoElInventario,
  actualizarStockProducto,
  ProductoFarmaciaDto
} from "../../api/farmaciaApi";

import "./Productos.css";

// --- DICCIONARIO DE IMÁGENES ---
const IMAGENES_LOCALES: Record<string, string> = {
  "Paracetamol 500mg": "../../public/imagenes/Paracetamol.png",
  "Amoxicilina 500mg": "../../public/imagenes/Amoxicilina.png",
  "Ibuprofeno 400mg": "../../public/imagenes/Ibuprofeno.png",
  "Metformina 850mg": "../../public/imagenes/Metformina.png",
  "Losartan 50mg": "../../public/imagenes/Losartan.png",
  "Antiflu-Des": "../../public/imagenes/Anit.png",
  "Complejo B": "../../public/imagenes/Complejo.png",
  "Omeprazol 20mg": "../../public/imagenes/Omeo.png",
  "Loratadina 10mg": "../../public/imagenes/Lora.png",
  "Alcohol Etilico": "../../public/imagenes/Alcohol.png",
  //Servicios:
  "Inyeccion Intramuscular": "../../public/imagenes/Inyeccion.png",
  "Curacion de Herida Menor": "../../public/imagenes/Curacion.png",
  "Toma de Presion Arterial": "../../public/imagenes/Presion.png",
  "Nebulizacion (Sesion 20 min)": "../../public/imagenes/Nebuliza.png",
  "Retiro de Puntos/Suturas": "../../public/imagenes/Puntos.png",
  "Colocacion de Venoclisis (Suero)": "../../public/imagenes/Suero.png",
  "Prueba de Glucosa Capilar": "../../public/imagenes/Glucosa.png",
  "Lavado otico (Oido)": "../../public/imagenes/Lavado.png",
  "Electrocardiograma Simple": "../../public/imagenes/Electro.png",
  "Aplicacion de Vacuna Tetanos": "../../public/imagenes/Vacuna.png",
};

export function InventarioFarmacia() {
  const navigate = useNavigate();
  
  const [productos, setProductos] = useState<ProductoFarmaciaDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mensajeDialog, setMensajeDialog] = useState("");

  useEffect(() => {
    cargarInventario();
  }, []);

  const cargarInventario = () => {
    setLoading(true);
    listarTodoElInventario()
      .then((data) => {
        console.log("📦 Datos recibidos:", data); 
        setProductos(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar inventario:", err);
        setError("No se pudo conectar con el sistema de farmacia.");
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

  const handleStockChange = (id: number, nuevoStock: string, origen: string) => {
    const valor = parseInt(nuevoStock);
    if (isNaN(valor) || valor < 0) return;

    setProductos(prev => prev.map(p =>
      (p.idProducto === id && p.origen === origen) ? { ...p, stock: valor } : p
    ));
  };

  const handleGuardar = (producto: ProductoFarmaciaDto) => {
    // Si el stock es null, no hacemos nada (protección de lógica)
    if (producto.stock === null) return;

    actualizarStockProducto(producto.idProducto, producto.stock, producto.origen)
      .then(() => {
        setMensajeDialog(`✅ Stock actualizado correctamente`);
        setDialogOpen(true);
      })
      .catch((err) => {
        console.error("Error al guardar:", err);
        setMensajeDialog(`❌ Error al guardar en base de datos.`);
        setDialogOpen(true);
      });
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

  if (loading) return <div className="loading-screen"><div className="loader"></div> Cargando inventario...</div>;
  
  if (error) return (
    <div className="error-screen">
      <p>{error}</p>
      <button onClick={cargarInventario}>Reintentar</button>
    </div>
  );

  return (
    <div className="inventario-page">
      <header className="top-app-bar">
        <div className="navigation-icon" onClick={() => navigate(-1)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
        </div>
        <h1>Inventario de Farmacia</h1>
        <div className="search-bar-container">
            <div className="search-wrapper" style={{position: 'relative', width: '100%', maxWidth: '300px'}}>
                <div style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#7f8c8d', display: 'flex', alignItems: 'center'}}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Buscar producto..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="search-input"
                    style={{paddingLeft: '40px'}}
                />
            </div>
        </div>
      </header>

      <main className="material-list">
        {productosFiltrados.length === 0 ? (
            <div style={{textAlign: 'center', width: '100%', padding: '40px', color: '#666', gridColumn: '1 / -1'}}>
                {busqueda ? `No se encontraron resultados para "${busqueda}"` : "No hay productos disponibles."}
            </div>
        ) : (
            productosFiltrados.map((prod) => {
              const item = prod as any;
              const nombreMostrar = prod.nombre || item.Descripcion || item.descripcion || "Sin nombre";
              const tipoMostrar = prod.tipo || item.Tipo || "General";
              
              // 1. DETECTAMOS SI ES STOCK INFINITO (NULL)
              const esStockInfinito = prod.stock === null;

              return (
                <div key={`${prod.origen}-${prod.idProducto}`} className="material-card">
                  <span className={`material-type ${tipoMostrar.toLowerCase()}`}>
                      {tipoMostrar}
                  </span>

                  <div className="material-image">
                      {getImagenProducto(prod)}
                  </div>
                  
                  <h3 className="material-name">{nombreMostrar}</h3>
                  
                  {prod.detalleExtra && (
                      <div className="material-info-extra">
                          {prod.detalleExtra}
                      </div>
                  )}

                  <div className="price-tag">${(prod.precio || 0).toFixed(2)}</div>

                  {/* 2. RENDERIZADO CONDICIONAL: */}
                  {/* Si esStockInfinito es true, NO mostramos ni el input ni el botón */}
                  {!esStockInfinito ? (
                    <>
                        <div className="text-field">
                            <label htmlFor={`stock-${prod.origen}-${prod.idProducto}`}>Existencia</label>
                            <input
                              type="number"
                              id={`stock-${prod.origen}-${prod.idProducto}`}
                              // Usamos ?? 0 para seguridad, pero solo se renderiza si no es null
                              value={prod.stock ?? 0}
                              onChange={(e) => handleStockChange(prod.idProducto, e.target.value, prod.origen)}
                              min="0"
                            />
                        </div>

                        <button
                            className="save-button"
                            onClick={() => handleGuardar(prod)}
                        >
                            Guardar Stock
                        </button>
                    </>
                  ) : (
                    // 3. Espaciador para mantener el tamaño de la tarjeta uniforme
                    <div style={{ flexGrow: 1, minHeight: '80px' }}></div>
                  )}
                </div>
              );
            })
        )}
      </main>

      <div className={`dialog-backdrop ${dialogOpen ? 'active' : ''}`}>
          <div className="dialog">
            <h2 className="dialog-title">Notificación</h2>
            <p className="dialog-content">{mensajeDialog}</p>
            <div className="dialog-actions">
              <button className="dialog-button primary" onClick={() => setDialogOpen(false)}>Aceptar</button>
            </div>
          </div>
        </div>
    </div>
  );
}

export default InventarioFarmacia;