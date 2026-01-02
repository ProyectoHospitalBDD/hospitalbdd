import { useEffect, useMemo, useState } from "react";
import "./RecepEmpleadosPage.css";

import {
  crearEmpleado,
  getEspecialidades,
  getConsultorios,
  type EspecialidadItem,
  type ConsultorioItem,
  type CreateEmpleadoDto,
  type TipoEmpleado
} from "../../../api/recepEmpleadosApi";

const TIPOS: TipoEmpleado[] = ["Doctor", "Recepcionista", "Enfermera", "Farmaceutico"];

export default function RecepEmpleadosPage() {
  const [tipoUsuario, setTipoUsuario] = useState<TipoEmpleado>("Doctor");

  const [nombre, setNombre] = useState("");
  const [apPat, setApPat] = useState("");
  const [apMat, setApMat] = useState("");
  const [curp, setCurp] = useState("");

  const [correoPersonal, setCorreoPersonal] = useState("");
  const [telPersonal, setTelPersonal] = useState("");
  const [telCasa, setTelCasa] = useState("");

  const [salario, setSalario] = useState<number>(0);
  const [estatus, setEstatus] = useState(true);

  const [password, setPassword] = useState("");

  const [especialidades, setEspecialidades] = useState<EspecialidadItem[]>([]);
  const [consultorios, setConsultorios] = useState<ConsultorioItem[]>([]);
  const [cargandoCatalogos, setCargandoCatalogos] = useState(false);

  // Doctor extra
  const [cedula, setCedula] = useState("");
  const [idEspecialidad, setIdEspecialidad] = useState<number | "">("");
  const [idConsultorio, setIdConsultorio] = useState<number | "">("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const esDoctor = tipoUsuario === "Doctor";

  // =========================
  // Cargar catálogos
  // =========================
  useEffect(() => {
    (async () => {
      setCargandoCatalogos(true);
      try {
        const [esp, cons] = await Promise.all([getEspecialidades(), getConsultorios()]);
        setEspecialidades(esp);
        setConsultorios(cons);
      } catch (e: any) {
        const msg =
          e?.response?.data?.message ??
          e?.response?.data ??
          e?.message ??
          "No se pudieron cargar especialidades/consultorios.";
        setError(String(msg));
      } finally {
        setCargandoCatalogos(false);
      }
    })();
  }, []);

  const dto = useMemo<CreateEmpleadoDto>(() => {
    return {
      tipoUsuario,
      nombre: nombre.trim(),
      apPat: apPat.trim(),
      apMat: apMat.trim() || null,
      curp: curp.trim().toUpperCase(),

      correoPersonal: correoPersonal.trim(),
      telPersonal: telPersonal.trim() || null,
      telCasa: telCasa.trim() || null,

      salario: Number(salario),
      estatus,

      password,

      // Solo doctor
      cedula: esDoctor ? (cedula.trim() || null) : null,
      idEspecialidad: esDoctor && idEspecialidad !== "" ? Number(idEspecialidad) : null,
      idConsultorio: esDoctor && idConsultorio !== "" ? Number(idConsultorio) : null,
    };
  }, [
    tipoUsuario, nombre, apPat, apMat, curp,
    correoPersonal, telPersonal, telCasa,
    salario, estatus, password,
    esDoctor, cedula, idEspecialidad, idConsultorio
  ]);

  function validar(): string | null {
    if (!dto.nombre) return "Falta nombre.";
    if (!dto.apPat) return "Falta apellido paterno.";
    if (!dto.curp || dto.curp.length !== 18) return "CURP inválida (debe tener 18 caracteres).";
    if (!dto.correoPersonal) return "Falta correo.";
    if (!dto.password || dto.password.length < 6) return "Password muy corto (mínimo 6).";
    if (!dto.salario || dto.salario <= 0) return "Salario inválido.";

    if (esDoctor) {
      if (!dto.cedula) return "Falta cédula.";
      if (!dto.idEspecialidad) return "Falta especialidad.";
      if (!dto.idConsultorio) return "Falta consultorio.";
    }
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOkMsg(null);

    const v = validar();
    if (v) {
      setError(v);
      return;
    }

    setLoading(true);
    try {
      const r = await crearEmpleado(dto);
      setOkMsg(`Empleado creado. ID: ${r.idUsuario}`);

      // Limpieza ligera
      setNombre(""); setApPat(""); setApMat(""); setCurp("");
      setCorreoPersonal(""); setTelPersonal(""); setTelCasa("");
      setSalario(0); setPassword("");
      setCedula(""); setIdEspecialidad(""); setIdConsultorio("");
      setEstatus(true);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ??
        e?.response?.data ??
        e?.message ??
        "No se pudo crear el empleado.";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="recep-empleados">
      <div className="recep-empleados__hero">
        <h1>Alta de empleados</h1>
        <p>Crea Doctor, Recepcionista, Enfermera o Farmacéutico.</p>
      </div>

      {error && <div className="recep-empleados__error">{error}</div>}
      {okMsg && <div className="recep-empleados__ok">{okMsg}</div>}

      <form className="recep-empleados__card" onSubmit={onSubmit}>
        <div className="recep-empleados__grid">
          <div className="field">
            <label>Tipo</label>
            <select
              value={tipoUsuario}
              onChange={(e) => {
                const t = e.target.value as TipoEmpleado;
                setTipoUsuario(t);
                setError(null);
                setOkMsg(null);

                // Si deja de ser doctor, limpiamos extras
                if (t !== "Doctor") {
                  setCedula("");
                  setIdEspecialidad("");
                  setIdConsultorio("");
                }
              }}
            >
              {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="field">
            <label>Nombre</label>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>

          <div className="field">
            <label>Apellido paterno</label>
            <input value={apPat} onChange={(e) => setApPat(e.target.value)} />
          </div>

          <div className="field">
            <label>Apellido materno</label>
            <input value={apMat} onChange={(e) => setApMat(e.target.value)} />
          </div>

          <div className="field">
            <label>CURP</label>
            <input value={curp} onChange={(e) => setCurp(e.target.value)} placeholder="18 caracteres" />
          </div>

          <div className="field">
            <label>Correo</label>
            <input value={correoPersonal} onChange={(e) => setCorreoPersonal(e.target.value)} />
          </div>

          <div className="field">
            <label>Tel. personal</label>
            <input value={telPersonal} onChange={(e) => setTelPersonal(e.target.value)} />
          </div>

          <div className="field">
            <label>Tel. casa</label>
            <input value={telCasa} onChange={(e) => setTelCasa(e.target.value)} />
          </div>

          <div className="field">
            <label>Salario</label>
            <input
              type="number"
              value={salario}
              onChange={(e) => setSalario(Number(e.target.value))}
              min={0}
            />
          </div>

          <div className="field">
            <label>Estatus</label>
            <select value={estatus ? "1" : "0"} onChange={(e) => setEstatus(e.target.value === "1")}>
              <option value="1">Activo</option>
              <option value="0">Inactivo</option>
            </select>
          </div>

          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <div
            className={
              "recep-empleados__doctorExtra " +
              (!esDoctor ? "recep-empleados__doctorExtraHidden" : "")
            }
          >
            <div className="field">
              <label>Cédula</label>
              <input
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                disabled={!esDoctor}
              />
            </div>

            <div className="field">
              <label>Especialidad</label>
              <select
                value={idEspecialidad}
                onChange={(e) => setIdEspecialidad(e.target.value === "" ? "" : Number(e.target.value))}
                disabled={!esDoctor || cargandoCatalogos}
              >
                <option value="">Selecciona…</option>
                {especialidades.map(e => (
                  <option key={e.idEspecialidad} value={e.idEspecialidad}>
                    {e.nombreEsp} (${e.costo.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Consultorio</label>
              <select
                value={idConsultorio}
                onChange={(e) => setIdConsultorio(e.target.value === "" ? "" : Number(e.target.value))}
                disabled={!esDoctor || cargandoCatalogos}
              >
                <option value="">Selecciona…</option>
                {consultorios.map(c => (
                  <option key={c.idConsultorio} value={c.idConsultorio}>
                    {c.numero} — {c.edificioLabel}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="recep-empleados__actions">
          <button className="btn btn-ok" disabled={loading}>
            {loading ? "Creando..." : "Crear empleado"}
          </button>
        </div>
      </form>
    </div>
  );
}
