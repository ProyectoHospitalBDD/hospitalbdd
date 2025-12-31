// pages/Doctor/DoctorMisCitasPage.tsx
import { useEffect, useMemo, useState } from "react";
import "./DoctorMisCitasPage.css";
import {
  getMisCitasDoctor,
  type CitaDoctor,
  solicitarCancelacionCita,
} from "../../../api/doctorApi";

type DiaKey = string; // yyyy-mm-dd

function puedeSolicitarCancelacion(estatus: string) {
  return estatus === "AgendadaPendPago" || estatus === "PagadaPendAtender";
}

function pillByStatus(estatus: string) {
  const e = (estatus ?? "").toLowerCase();

  if (e.includes("pend") || e.includes("solicit")) return "panel-pill panel-pill--warn panel-pill--status";
  if (e.includes("atendida")) return "panel-pill panel-pill--ok panel-pill--status";
  if (e.includes("cancel") || e.includes("noacud") || e.includes("no acud")) return "panel-pill panel-pill--bad panel-pill--status";

  return "panel-pill panel-pill--neutral panel-pill--status";
}

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
  if (e.includes("pend") || e.includes("solicit")) return 3;
  if (e.includes("atendida")) return 2;
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
  const [cancelandoId, setCancelandoId] = useState<number | null>(null);
  const [mes, setMes] = useState<Date>(() => startOfMonth(new Date()));
  const [citas, setCitas] = useState<CitaDoctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [seleccion, setSeleccion] = useState<DiaKey | null>(null);

  const desde = useMemo(() => ymd(startOfMonth(mes)), [mes]);
  const hasta = useMemo(() => ymd(endOfMonth(mes)), [mes]);

  async function recargarMes() {
    const data = await getMisCitasDoctor({ desde, hasta });
    setCitas(data);
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await recargarMes();
        setSeleccion(null);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
      map.set(k, arr);
    }

    return map;
  }, [citas]);

  // Score por día
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

  const citasSeleccion = seleccion ? porDia.get(seleccion) ?? [] : [];

  return (
    <div className="doc-cal-page">
      <div className="doc-cal-card">
        <div className="doc-cal-head">
          <div>
            <h2 className="doc-cal-title">Mis citas</h2>
            <p className="doc-cal-subtitle">Calendario mensual con estado por día.</p>
          </div>

          <div className="doc-cal-nav">
            <button className="doc-btn" onClick={() => setMes(addMonths(mes, -1))} type="button">
              ◀
            </button>
            <div className="doc-cal-month">{tituloMes}</div>
            <button className="doc-btn" onClick={() => setMes(addMonths(mes, 1))} type="button">
              ▶
            </button>
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
          <h3 className="panel-title">{seleccion ? `Citas del ${seleccion}` : "Selecciona un día"}</h3>

          {seleccion && citasSeleccion.length === 0 && (
            <p className="panel-empty">No hay citas ese día.</p>
          )}

          {seleccion && citasSeleccion.length > 0 && (
            <ul className="panel-list">
              {citasSeleccion.map((c) => (
                <li key={c.idCita} className="panel-item">
                  {/* izquierda: info paciente */}
                  <div className="panel-main">
                    <div className="panel-name">{c.paciente ?? "—"}</div>
                    <div className="panel-sub">
                      Folio {c.idCita} · {c.horaInicio}{c.horaFin ? `–${c.horaFin}` : ""}
                    </div>

                    {/* estatus pegado abajo de los datos */}
                    <div className="panel-status-row">
                      <span className={pillByStatus(c.estatus)}>{c.estatus}</span>
                    </div>
                  </div>

                  {/* derecha: acciones */}
                  <div className="panel-actions">
                    {puedeSolicitarCancelacion(c.estatus) && (
                      <button
                        className="panel-pill panel-pill--warn"
                        disabled={cancelandoId === c.idCita}
                        onClick={async () => {
                          setCancelandoId(c.idCita);
                          try {
                            await solicitarCancelacionCita(c.idCita);
                            await recargarMes();
                          } finally {
                            setCancelandoId(null);
                          }
                        }}
                        type="button"
                      >
                        {cancelandoId === c.idCita ? "Solicitando…" : "Solicitar cancelación"}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
