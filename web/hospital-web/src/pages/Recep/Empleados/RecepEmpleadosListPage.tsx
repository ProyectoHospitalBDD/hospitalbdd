import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RecepEmpleadosListPage.css";

import {
  listarEmpleados,
  cambiarEstatusEmpleado,
  type EmpleadoListItem,
  type TipoEmpleado,
} from "../../../api/recepEmpleadosApi";

const TIPOS: TipoEmpleado[] = ["Doctor", "Recepcionista", "Enfermera", "Farmaceutico"];

export default function RecepEmpleadosListPage() {
  const nav = useNavigate();

  const [fTexto, setFTexto] = useState("");
  const [fTipo, setFTipo] = useState<string>("");
  const [fEstatus, setFEstatus] = useState<string>("1"); // default: Activos

  const [empleados, setEmpleados] = useState<EmpleadoListItem[]>([]);
  const [loadingLista, setLoadingLista] = useState(false);
  const [accionandoEmp, setAccionandoEmp] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  async function cargarLista() {
    setError(null);
    setOkMsg(null);
    setLoadingLista(true);
    try {
      const data = await listarEmpleados({
        texto: fTexto.trim() || undefined,
        tipoUsuario: fTipo || undefined,
        estatus: fEstatus === "" ? undefined : fEstatus === "1",
      });
      setEmpleados(data);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ??
        e?.response?.data ??
        e?.message ??
        "No se pudieron cargar los empleados.";
      setError(String(msg));
    } finally {
      setLoadingLista(false);
    }
  }

  useEffect(() => {
    cargarLista();
  }, []);

  async function onToggleEstatus(emp: EmpleadoListItem) {
    setError(null);
    setOkMsg(null);

    const nuevo = !emp.estatus;

    const ok = window.confirm(
      `${nuevo ? "¿Activar" : "¿Desactivar"} al empleado #${emp.idUsuario}?\n` +
        `${emp.tipoUsuario}: ${emp.nombre} ${emp.apPat} ${emp.apMat ?? ""}`.trim()
    );
    if (!ok) return;

    setAccionandoEmp(emp.idUsuario);
    try {
      await cambiarEstatusEmpleado(emp.idUsuario, nuevo);

      setEmpleados(prev =>
        prev.map(x => (x.idUsuario === emp.idUsuario ? { ...x, estatus: nuevo } : x))
      );

      setOkMsg(`Empleado #${emp.idUsuario} ${nuevo ? "activado" : "desactivado"}.`);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ??
        e?.response?.data ??
        e?.message ??
        "No se pudo cambiar el estatus.";
      setError(String(msg));
    } finally {
      setAccionandoEmp(null);
    }
  }

  return (
    <div className="recep-emp-list">
      <div className="recep-emp-list__hero">
        <div>
          <h1>Administrar empleados</h1>
          <p>Consulta empleados y activa/desactiva su estatus.</p>
        </div>

        <button className="btn btn-ok" type="button" onClick={() => nav("/recep/empleados/crear")}>
          Alta de empleado
        </button>
      </div>

      {error && <div className="recep-emp-list__error">{error}</div>}
      {okMsg && <div className="recep-emp-list__ok">{okMsg}</div>}

      <div className="recep-emp-list__card">
        <div className="recep-emp-list__filters">
          <div className="recep-emp-list__field">
            <label>Búsqueda</label>
            <input
              className="recep-emp-list__input"
              value={fTexto}
              onChange={(e) => setFTexto(e.target.value)}
              placeholder="Nombre, CURP o correo..."
            />
          </div>

          <div className="recep-emp-list__field">
            <label>Tipo</label>
            <select
              className="recep-emp-list__select"
              value={fTipo}
              onChange={(e) => setFTipo(e.target.value)}
            >
              <option value="">(Cualquiera)</option>
              {TIPOS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="recep-emp-list__field">
            <label>Estatus</label>
            <select
              className="recep-emp-list__select"
              value={fEstatus}
              onChange={(e) => setFEstatus(e.target.value)}
            >
              <option value="">(Cualquiera)</option>
              <option value="1">Activos</option>
              <option value="0">Inactivos</option>
            </select>
          </div>

          <button className="btn btn-ghost" type="button" onClick={cargarLista} disabled={loadingLista}>
            {loadingLista ? "Cargando..." : "Buscar"}
          </button>
        </div>

        {empleados.length === 0 ? (
          <p style={{ marginTop: 10, color: "rgba(0,0,0,0.65)", fontWeight: 600 }}>
            Sin resultados.
          </p>
        ) : (
          <div className="recep-emp-list__tableWrap">
            <table className="recep-emp-list__table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tipo</th>
                  <th>Nombre</th>
                  <th>CURP</th>
                  <th>Estatus</th>
                  <th>Salario</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {empleados.map(emp => (
                  <tr key={emp.idUsuario}>
                    <td>{emp.idUsuario}</td>
                    <td>{emp.tipoUsuario}</td>
                    <td>{emp.nombre} {emp.apPat} {emp.apMat ?? ""}</td>
                    <td>{emp.curp}</td>
                    <td>
                      <span
                        className={
                          "recep-emp-list__badge " +
                          (emp.estatus ? "recep-emp-list__badge--ok" : "recep-emp-list__badge--off")
                        }
                      >
                        {emp.estatus ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td>${Number(emp.salario).toFixed(2)}</td>
                    <td className="recep-emp-list__actions">
                      <button
                        className={emp.estatus ? "btn btn-bad" : "btn btn-ok"}
                        disabled={accionandoEmp === emp.idUsuario}
                        onClick={() => onToggleEstatus(emp)}
                        title={emp.estatus ? "Desactivar" : "Activar"}
                      >
                        {accionandoEmp === emp.idUsuario
                          ? "Guardando..."
                          : emp.estatus ? "Desactivar" : "Activar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}
      </div>
    </div>
  );
}
