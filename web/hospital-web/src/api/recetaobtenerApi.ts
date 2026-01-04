import { Receta } from "./recetasApi";
import { DatosReceta } from "../pages/Receta/ComprobanteReceta";

export function mapRecetaToDatosReceta(
  receta: Receta,
  paciente: string,
  doctor: string
): DatosReceta {
  return {
    idReceta: receta.idReceta,
    paciente,
    doctor,
    fecha: new Date(receta.fechaReceta).toLocaleDateString(),
    diagnostico: receta.diagnostico,
    observaciones: receta.observaciones,
    medicamentos: receta.medicamentos.map(m => ({
      descripcion: m.nombre ?? `Medicamento #${m.idMedicamento}`,
      precio: 0, // si no lo tienes, inicializa en 0
      cantidad: m.cantidad,
      indicaciones: m.indicaciones ?? ""
    })),
    servicios: receta.servicios.map(s => ({
      descripcion: s.nombre ?? `Servicio #${s.idServicio}`,
      precio: 0, // si no lo tienes, inicializa en 0
      indicaciones: s.indicaciones ?? ""
    }))
  };
}