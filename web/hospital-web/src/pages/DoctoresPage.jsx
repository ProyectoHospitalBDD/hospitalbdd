import { useEffect, useState, useRef } from "react";
import { api } from "../lib/api";

export default function DoctoresPage() {
  const [doctores, setDoctores] = useState([]);   // inicializa como []
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const ran = useRef(false);
  useEffect(() => {
    if (ran.current) return;   // evita doble carga en React 18 Dev
    ran.current = true;
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/doctores");

      // ✅ Forzar a arreglo, aunque el backend devuelva otra cosa
      const lista = Array.isArray(data)
        ? data
        : Array.isArray(data?.value)
          ? data.value
          : [];

      setDoctores(lista);
      if (!Array.isArray(data)) {
        setMsg("La API no devolvió un arreglo. Mostrando lista vacía.");
      } else {
        setMsg("");
      }
    } catch (e) {
      console.error(e);
      setMsg(e.response?.data ?? e.message ?? "Error al obtener doctores.");
      setDoctores([]); // ✅ evita el .map sobre algo no-array
    } finally {
      setLoading(false);
    }
  };

  const rows = Array.isArray(doctores) ? doctores : []; // ✅ cinturón y tirantes

  return (
    <div>
      <h2>Doctores</h2>
      {msg && <p style={{ color: "crimson" }}>{msg}</p>}

      {loading ? (
        <p>Cargando...</p>
      ) : rows.length === 0 ? (
        <p>No hay doctores para mostrar.</p>
      ) : (
        <table border="1" cellPadding="6">
          <thead>
            <tr>
              <th>ID</th><th>Nombre</th><th>Cédula</th><th>Especialidad</th><th>Consultorio</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d, i) => (
              <tr key={d.idUsuario ?? d.id ?? i}>
                <td>{d.idUsuario ?? d.id}</td>
                <td>{d.nombreCompleto ?? `${d.nombre} ${d.apPat ?? ""}`}</td>
                <td>{d.cedula}</td>
                <td>{d.especialidad?.nombreEsp ?? d.idEspecialidad}</td>
                <td>{d.consultorio?.numero ?? d.idConsultorio}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
