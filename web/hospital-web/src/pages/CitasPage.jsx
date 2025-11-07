import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function CitasPage() {
  const [doctores, setDoctores] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [citas, setCitas] = useState([]);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    idDoctor: "", idPaciente: "",
    inicio: "", fin: "", costo: 0
  });

  const load = async () => {
    try {
      const [d, p, c] = await Promise.all([
        api.get("/doctores"),
        api.get("/pacientes"),
        api.get("/citas")
      ]);
      setDoctores(d.data); setPacientes(p.data); setCitas(c.data);
      setMsg("");
    } catch {
      setMsg("Faltan endpoints /doctores, /pacientes o /citas (o falló la API).");
    }
  };

  useEffect(() => { load(); }, []);

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      await api.post("/citas", {
        idDoctor: Number(form.idDoctor),
        idPaciente: Number(form.idPaciente),
        fechaHoraInicio: form.inicio,
        fechaHoraFin: form.fin,
        costo: Number(form.costo),
        estatusCita: "AgendadaPendPago"
      });
      setMsg("Cita agendada.");
      setForm({ idDoctor:"", idPaciente:"", inicio:"", fin:"", costo:0 });
      load();
    } catch (e) {
      setMsg(e.response?.data ?? "Error al agendar (validaciones).");
    }
  };

  return (
    <div>
      <h2>Citas</h2>

      <h3>Agendar</h3>
      <form onSubmit={onSubmit} style={{display:"grid", gap:8, maxWidth:420}}>
        <select name="idDoctor" value={form.idDoctor} onChange={onChange} required>
          <option value="">-- Selecciona doctor --</option>
          {doctores.map(d => (
            <option key={d.idUsuario ?? d.id} value={d.idUsuario ?? d.id}>
              {d.nombreCompleto ?? `${d.nombre} ${d.apPat ?? ""}`} ({d.cedula})
            </option>
          ))}
        </select>

        <select name="idPaciente" value={form.idPaciente} onChange={onChange} required>
          <option value="">-- Selecciona paciente --</option>
          {pacientes.map(p => (
            <option key={p.idUsuario ?? p.id} value={p.idUsuario ?? p.id}>
              {p.nombreCompleto ?? `${p.nombre} ${p.apPat ?? ""}`}
            </option>
          ))}
        </select>

        <label>Inicio: <input type="datetime-local" name="inicio" value={form.inicio} onChange={onChange} required /></label>
        <label>Fin: <input type="datetime-local" name="fin" value={form.fin} onChange={onChange} required /></label>
        <label>Costo: <input type="number" name="costo" value={form.costo} onChange={onChange} min="0" step="0.01" required /></label>

        <button type="submit">Agendar</button>
      </form>

      <p style={{marginTop:8}}>{msg}</p>

      <h3 style={{marginTop:16}}>Próximas citas</h3>
      <ul>
        {citas.map(c => (
          <li key={c.idCita ?? c.id}>
            Doctor {c.idDoctor} · Paciente {c.idPaciente} · {c.fechaHoraInicio} → {c.fechaHoraFin} · {c.estatusCita}
          </li>
        ))}
      </ul>
    </div>
  );
}
