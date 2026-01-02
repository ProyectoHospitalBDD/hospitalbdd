import "./ComprobanteReceta.css";
import { useLocation, useNavigate } from "react-router-dom";

interface MedicamentoReceta {
  descripcion: string;
  precio: number;
  cantidad: number;
  indicaciones: string;
}

interface ServicioReceta {
  descripcion: string;
  precio: number;
  indicaciones: string;
}

interface DatosReceta {
  idReceta: number;
  paciente: string;
  doctor: string;
  fecha: string;
  diagnostico?: string;
  observaciones?: string;
  medicamentos: MedicamentoReceta[];
  servicios: ServicioReceta[];
}

export default function ComprobanteReceta() {
  const location = useLocation();
  const navigate = useNavigate();
  const datos: DatosReceta = location.state?.datosReceta;

  if (!datos) {
    return (
      <div className="page">
        <div className="carta">
          <h2>Error</h2>
          <p>No se encontraron datos de la receta.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="comprobante">
        <div className="encabezado">
          <h1>Hospital Polimed</h1>
          <h2>Comprobante de Receta Médica</h2>
        </div>

        <div className="info-principal">
          <div className="campo">
            <label>Número de Receta:</label>
            <span>{datos.idReceta}</span>
          </div>
          <div className="campo">
            <label>Paciente:</label>
            <span>{datos.paciente}</span>
          </div>
          <div className="campo">
            <label>Doctor:</label>
            <span>{datos.doctor}</span>
          </div>
          <div className="campo">
            <label>Fecha:</label>
            <span>{datos.fecha}</span>
          </div>
        </div>

        {datos.diagnostico && (
          <div className="seccion">
            <h3>Diagnóstico</h3>
            <p>{datos.diagnostico}</p>
          </div>
        )}

        {datos.medicamentos.length > 0 && (
          <div className="seccion">
            <h3>Medicamentos</h3>
            <table className="tabla-medicamentos">
              <thead>
                <tr>
                  <th>Medicamento</th>
                  <th>Cantidad</th>
                  <th>Indicaciones</th>
                </tr>
              </thead>
              <tbody>
                {datos.medicamentos.map((med, i) => (
                  <tr key={i}>
                    <td>{med.descripcion}</td>
                    <td>{med.cantidad}</td>
                    <td>{med.indicaciones || "Sin indicaciones"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {datos.servicios.length > 0 && (
          <div className="seccion">
            <h3>Servicios</h3>
            <table className="tabla-servicios">
              <thead>
                <tr>
                  <th>Servicio</th>
                  <th>Indicaciones</th>
                </tr>
              </thead>
              <tbody>
                {datos.servicios.map((serv, i) => (
                  <tr key={i}>
                    <td>{serv.descripcion}</td>
                    <td>{serv.indicaciones || "Sin indicaciones"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {datos.observaciones && (
          <div className="seccion">
            <h3>Observaciones</h3>
            <p>{datos.observaciones}</p>
          </div>
        )}

        <div className="pie">
          <p>Receta generada correctamente. Consulte a su médico para cualquier duda.
            <br /> Sobre los medicamentos o servicios prescritos.
          </p>
          <button onClick={() => navigate('/home')} className="boton">
            Ir a Inicio
          </button>
        </div>
      </div>
    </div>
  );
}