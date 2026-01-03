import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../../api/register";
import "./RegisterPage.css";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombres: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    curp: "",
    correo: "",
    telPersonal: "",
    telCasa: "",
    password: ""
  });

  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<string | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: "" }); // Limpiar error del campo
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setOk(null);
    setLoading(true);

    let newErrors: { [key: string]: string } = {};

    // === VALIDACIONES DE FRONT ===
    if (!form.nombres.trim()) newErrors.nombres = "Los nombres son obligatorios";
    if (!form.apellidoPaterno.trim()) newErrors.apellidoPaterno = "Apellido paterno obligatorio";
    if (!form.curp.trim()) newErrors.curp = "CURP obligatorio";
    if (!form.correo.trim()) newErrors.correo = "Correo obligatorio";
    if (!form.telPersonal.trim()) newErrors.telPersonal = "Teléfono personal obligatorio";
    if (!form.password.trim()) newErrors.password = "Contraseña obligatoria";

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      await register({
        ...form,
        telPersonal: form.telPersonal,
        telCasa: form.telCasa || null
      });

      setOk("Cuenta creada correctamente. Ahora puedes iniciar sesión.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: any) {
      // Capturamos el mensaje enviado desde el backend
      const msg = err?.response?.data?.message || err?.message || "No se pudo crear la cuenta";

      // Asignamos a los campos correctos según el mensaje
      const updatedErrors: { [key: string]: string } = {};

      if (msg.includes("correo")) updatedErrors.correo = msg;
      if (msg.includes("CURP")) updatedErrors.curp = msg;
      if (msg.includes("teléfono personal")) updatedErrors.telPersonal = msg;

      // Si no coincide con ningún campo específico, es un error general
      if (Object.keys(updatedErrors).length === 0) updatedErrors.general = msg;

      setFieldErrors(updatedErrors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="agendar-page">
      <div className="agendar-card">
        <h2 className="agendar-title">Crear cuenta</h2>
        <p className="agendar-subtitle">Registra tus datos para acceder al sistema</p>

        <form className="agendar-form" onSubmit={onSubmit}>
          <div className="agendar-field">
            <label>Nombres</label>
            <input name="nombres" value={form.nombres} onChange={onChange} />
            {fieldErrors.nombres && <span className="agendar-error">{fieldErrors.nombres}</span>}
          </div>

          <div className="agendar-field">
            <label>Apellido paterno</label>
            <input name="apellidoPaterno" value={form.apellidoPaterno} onChange={onChange} />
            {fieldErrors.apellidoPaterno && <span className="agendar-error">{fieldErrors.apellidoPaterno}</span>}
          </div>

          <div className="agendar-field">
            <label>Apellido materno (opcional)</label>
            <input name="apellidoMaterno" value={form.apellidoMaterno} onChange={onChange} />
          </div>

          <div className="agendar-field">
            <label>CURP</label>
            <input name="curp" value={form.curp} onChange={onChange} style={{ textTransform: "uppercase" }} />
            {fieldErrors.curp && <span className="agendar-error">{fieldErrors.curp}</span>}
          </div>

          <div className="agendar-field">
            <label>Correo</label>
            <input type="email" name="correo" value={form.correo} onChange={onChange} />
            {fieldErrors.correo && <span className="agendar-error">{fieldErrors.correo}</span>}
          </div>

          <div className="agendar-field">
            <label>Teléfono personal</label>
            <input name="telPersonal" value={form.telPersonal} onChange={onChange} />
            {fieldErrors.telPersonal && <span className="agendar-error">{fieldErrors.telPersonal}</span>}
          </div>

          <div className="agendar-field">
            <label>Teléfono de casa (opcional)</label>
            <input name="telCasa" value={form.telCasa} onChange={onChange} />
          </div>

          <div className="agendar-field">
            <label>Contraseña</label>
            <input type="password" name="password" value={form.password} onChange={onChange} />
            {fieldErrors.password && <span className="agendar-error">{fieldErrors.password}</span>}
          </div>

          <div className="agendar-actions">
            <button className="agendar-btn" disabled={loading}>
              {loading ? "Registrando..." : "Crear cuenta"}
            </button>
          </div>

          {/* Error general */}
          {fieldErrors.general && <p className="agendar-error">{fieldErrors.general}</p>}
        </form>

        {ok && <p className="agendar-result">{ok}</p>}
      </div>
    </div>
  );
}