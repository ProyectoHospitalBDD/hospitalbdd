// pages/Doctor/DoctorMisCitasPage.tsx
import { useEffect, useMemo, useState } from "react";
import "./DoctorMisCitasPage.css";
import { getMisCitasDoctor, type CitaDoctor } from "../../../api/doctorApi";

type DiaKey = string; // yyyy-mm-dd

function ymd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function addMonths(d: Date, delta: number) {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}

// Prioridad de estatus (mayor = domina el color del día)
function scoreEstatus(estatus: string) {
  const e = (estatus ?? "").toLowerCase();

  // pendientes (amarillo) domina
  if (e.includes("pend")) return 3;

  // atendida (verde)
  if (e.includes("atendida")) return 2;

  // cancelaciones/no acudió (rojo)
  if (e.includes("cancel") || e.includes("noacud") || e.includes("no acud")) return 1;

  return 0;
}

function diaClass(maxScore: number) {
  if (maxScore >= 3) return "cal-day cal-day--warn";
  if (maxScore === 2) return "cal-day cal-day--ok";
  if (maxScore === 1) return "cal-day cal-day--bad";
  return "cal-day";
}

export default function DoctorMisCitasPage() {
  const [mes, setMes] = useState<Date>(() => startOfMonth(new Date()));
  const [citas, setCitas] = useState<CitaDoctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [seleccion, setSeleccion] = useState<DiaKey | null>(null);

  const desde = useMemo(() => ymd(startOfMonth(mes)), [mes]);
  const hasta = useMemo(() => ymd(endOfMonth(mes)), [mes]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getMisCitasDoctor({ desde, hasta });
        setCitas(data);
        setSeleccion(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [desde, hasta]);

  // Agrupar citas por día
  const porDia = useMemo(() => {
    const map = new Map<DiaKey, CitaDoctor[]>();
    for (const c of citas) {
      const key = c.fecha;
      const arr = map.get(key) ?? [];
      arr.push(c);
      map.set(key, arr);
    }
    // ordenar por hora
    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => a.hora.localeCompare(b.hora));
      map.set(k, arr);
    }
    return map;
  }, [citas]);

  // “color” por día basado en max score
  const scorePorDia = useMemo(() => {
    const map = new Map<DiaKey, number>();
    for (const [k, arr] of porDia.entries()) {
      let best = 0;
      for (const c of arr) best = Math.max(best, scoreEstatus(c.estatus));
      map.set(k, best);
    }
    return map;
  }, [porDia]);

  const gridDias = useMemo(() => {
    const first = startOfMonth(mes);
    const last = endOfMonth(mes);

    // Lunes=0..Domingo=6 (más “mexicano escolar”)
    const dayOfWeek = (d: Date) => (d.getDay() + 6) % 7;

    const start = new Date(first);
    start.setDate(first.getDate() - dayOfWeek(first));

    const end = new Date(last);
    end.setDate(last.getDate() + (6 - dayOfWeek(last)));

    const days: Date[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    return days;
  }, [mes]);

  const tituloMes = useMemo(() => {
    return mes.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
  }, [mes]);

  const citasSeleccion = seleccion ? (porDia.get(seleccion) ?? []) : [];

  return (
    <div className="doc-cal-page">
      <div className="doc-cal-card">
        <div className="doc-cal-head">
          <div>
            <h2 className="doc-cal-title">Mis citas</h2>
            <p className="doc-cal-subtitle">
              Calendario mensual con estado por día. Nota: Aun falta mejorar cosas del estilo pero ya funca         
            </p>
          </div>

          <div className="doc-cal-nav">
            <button className="doc-btn" onClick={() => setMes(addMonths(mes, -1))}>◀</button>
            <div className="doc-cal-month">{tituloMes}</div>
            <button className="doc-btn" onClick={() => setMes(addMonths(mes, 1))}>▶</button>
          </div>
        </div>

        {loading && <p className="doc-cal-loading">Cargando citas…</p>}

        <div className="cal-grid">
          <div className="cal-dow">Lun</div>
          <div className="cal-dow">Mar</div>
          <div className="cal-dow">Mié</div>
          <div className="cal-dow">Jue</div>
          <div className="cal-dow">Vie</div>
          <div className="cal-dow">Sáb</div>
          <div className="cal-dow">Dom</div>

          {gridDias.map((d) => {
            const key = ymd(d);
            const inMonth = d.getMonth() === mes.getMonth();
            const score = scorePorDia.get(key) ?? 0;
            const count = porDia.get(key)?.length ?? 0;

            const selected = seleccion === key;

            return (
              <button
                key={key}
                className={[
                  diaClass(score),
                  inMonth ? "" : "cal-day--muted",
                  selected ? "cal-day--selected" : "",
                ].join(" ")}
                onClick={() => setSeleccion(key)}
                type="button"
              >
                <div className="cal-day-num">{d.getDate()}</div>
                {count > 0 && <div className="cal-day-badge">{count}</div>}
              </button>
            );
          })}
        </div>

        <div className="doc-cal-legend">
          <span className="legend-item"><span className="dot dot--warn" /> Pendiente</span>
          <span className="legend-item"><span className="dot dot--ok" /> Atendida</span>
          <span className="legend-item"><span className="dot dot--bad" /> Cancelada / No acudió</span>
        </div>

        <div className="doc-cal-panel">
          <h3 className="panel-title">
            {seleccion ? `Citas del ${seleccion}` : "Selecciona un día"}
          </h3>

          {seleccion && citasSeleccion.length === 0 && (
            <p className="panel-empty">No hay citas ese día.</p>
          )}

          {seleccion && citasSeleccion.length > 0 && (
            <ul className="panel-list">
              {citasSeleccion.map((c) => (
                <li key={c.idCita} className="panel-item">
                  <span className="panel-hour">{c.hora}</span>
                  <span className="panel-id">Folio {c.idCita}</span>
                  <span className={`panel-chip ${diaClass(scoreEstatus(c.estatus))}`}>
                    {c.estatus}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
