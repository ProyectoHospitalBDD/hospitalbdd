import {
  listarMedicamentos,
  actualizarStockMedicamento,
  MedicamentoDto
} from "./medicamentos";

import {
  listarServicios,
  actualizarStockServicio,
  ServicioDto
} from "./servicios";

// DTO Unificado
export interface ProductoFarmaciaDto {
  idProducto: number;
  origen: "Medicamento" | "Servicio";
  nombre: string;
  tipo: string;
  precio: number;
  // IMPORTANTE: Permitimos null explícitamente
  stock: number | null; 
  detalleExtra?: string;
}

// Helper para leer propiedades (Mantenemos tu helper)
const leerPropiedad = (obj: any, key: string) => {
  if (!obj) return null;
  if (obj[key] !== undefined) return obj[key];
  const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
  if (obj[pascalKey] !== undefined) return obj[pascalKey];
  return undefined;
};

export async function listarTodoElInventario(): Promise<ProductoFarmaciaDto[]> {
  try {
    const [meds, servs] = await Promise.all([
      listarMedicamentos(),
      listarServicios()
    ]);

    // Mapeo de Medicamentos
    const listaMeds: ProductoFarmaciaDto[] = meds.map((m: any) => {
      const caducidadRaw = leerPropiedad(m, 'caducidad');
      const fechaFormat = caducidadRaw ? new Date(caducidadRaw).toLocaleDateString() : 'N/A';
      
      // Obtenemos el stock. Si por alguna razón es undefined, usamos 0.
      // Pero los medicamentos SIEMPRE deben tener stock.
      const stockVal = leerPropiedad(m, 'stock');

      return {
        idProducto: leerPropiedad(m, 'idMedicamento') || 0,
        origen: "Medicamento",
        nombre: leerPropiedad(m, 'descripcion') || "Sin Descripción", 
        tipo: leerPropiedad(m, 'tipo') || "Medicamento",
        precio: leerPropiedad(m, 'precio') || 0,
        stock: stockVal !== undefined && stockVal !== null ? stockVal : 0, 
        detalleExtra: `Cap: ${leerPropiedad(m, 'capacidad') || 'N/A'} | Vence: ${fechaFormat}`
      };
    });

    // Mapeo de Servicios
    const listaServs: ProductoFarmaciaDto[] = servs.map((s: any) => {
        // AQUÍ ESTABA EL ERROR: '|| 0' convertía los nulls en 0.
        // Lo cambiamos para que respete el null.
        const rawStock = leerPropiedad(s, 'stock');
        
        return {
            idProducto: leerPropiedad(s, 'idServicio') || 0,
            origen: "Servicio",
            nombre: leerPropiedad(s, 'descripcion') || "Sin Descripción",
            tipo: leerPropiedad(s, 'tipo') || "Servicio",
            precio: leerPropiedad(s, 'precio') || 0,
            // Si rawStock es null, se queda como null. Si es undefined, lo dejamos undefined (o null).
            stock: rawStock, 
            detalleExtra: undefined
        };
    });

    return [...listaMeds, ...listaServs];
  } catch (error) {
    console.error("Error unificando inventario:", error);
    throw error;
  }
}

export async function actualizarStockProducto(id: number, nuevoStock: number, origen: "Medicamento" | "Servicio") {
  if (origen === "Servicio") {
    return await actualizarStockServicio(id, nuevoStock);
  }
  return await actualizarStockMedicamento(id, nuevoStock);
}