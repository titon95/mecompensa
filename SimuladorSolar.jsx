"use client";

import React, { useState, useMemo } from "react";
import { CONFIG, fmt, eur, simular, generarRecomendacion } from "../lib/solar";

/* ------------------------------- ESTILOS -------------------------------- */
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=Public+Sans:wght@400;500;600;700&display=swap');

    .ss-root{
      --ink:#1c1b17; --muted:#6f6a5d; --paper:#f7f3ea; --card:#fffdf8;
      --line:#e7e0d1; --sun:#f5a623; --sun-deep:#d97706;
      --verde:#2f9e5b; --verde-bg:#e8f6ec;
      --amar:#caa01a; --amar-bg:#fbf3d6;
      --rojo:#d24b3e; --rojo-bg:#fbe7e4;
      font-family:'Public Sans',system-ui,sans-serif;
      color:var(--ink); background:
        radial-gradient(1200px 500px at 80% -10%, rgba(245,166,35,.18), transparent 60%),
        radial-gradient(900px 400px at -10% 0%, rgba(245,166,35,.08), transparent 55%),
        var(--paper);
      min-height:100vh; padding:clamp(16px,4vw,48px);
    }
    .ss-root *{box-sizing:border-box}
    .ss-wrap{max-width:1080px;margin:0 auto}
    .ss-display{font-family:'Bricolage Grotesque',sans-serif;letter-spacing:-.02em;line-height:1.02}
    .ss-kicker{font-size:13px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--sun-deep)}
    .ss-h1{font-size:clamp(30px,5vw,52px);font-weight:800;margin:8px 0 10px}
    .ss-sub{font-size:clamp(15px,2vw,18px);color:var(--muted);max-width:640px}
    .ss-grid{display:grid;grid-template-columns:1fr;gap:22px;margin-top:34px}
    @media(min-width:860px){.ss-grid{grid-template-columns:0.92fr 1.08fr}}

    .ss-card{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:clamp(18px,3vw,28px);box-shadow:0 1px 0 rgba(0,0,0,.02),0 18px 40px -28px rgba(60,40,10,.35)}
    .ss-card h2{font-family:'Bricolage Grotesque',sans-serif;font-size:20px;font-weight:700;margin:0 0 18px;display:flex;align-items:center;gap:9px}

    .ss-field{margin-bottom:18px}
    .ss-label{display:block;font-size:13.5px;font-weight:600;margin-bottom:7px}
    .ss-hint{font-size:12px;color:var(--muted);font-weight:400}
    .ss-input,.ss-select{width:100%;padding:12px 13px;border:1px solid var(--line);border-radius:11px;background:#fff;font:inherit;font-size:15px;color:var(--ink);outline:none;transition:border .15s, box-shadow .15s}
    .ss-input:focus,.ss-select:focus{border-color:var(--sun);box-shadow:0 0 0 3px rgba(245,166,35,.2)}

    .ss-seg{display:flex;border:1px solid var(--line);border-radius:11px;overflow:hidden;background:#fff}
    .ss-seg button{flex:1;padding:11px 8px;border:0;background:transparent;font:inherit;font-weight:600;font-size:14px;color:var(--muted);cursor:pointer;transition:.15s}
    .ss-seg button.on{background:var(--ink);color:#fff}

    .ss-toggle{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 15px;border:1px solid var(--line);border-radius:12px;background:#fff;cursor:pointer;margin-bottom:12px}
    .ss-toggle .t-txt{font-weight:600;font-size:14.5px}
    .ss-toggle .t-sub{font-size:12px;color:var(--muted);font-weight:400;margin-top:2px}
    .ss-switch{flex:0 0 auto;width:46px;height:27px;border-radius:99px;background:#dcd6c8;position:relative;transition:.2s}
    .ss-switch.on{background:var(--sun)}
    .ss-switch:after{content:"";position:absolute;top:3px;left:3px;width:21px;height:21px;border-radius:50%;background:#fff;transition:.2s;box-shadow:0 1px 3px rgba(0,0,0,.25)}
    .ss-switch.on:after{left:22px}

    .ss-adv{margin-top:6px;border-top:1px dashed var(--line);padding-top:14px}
    .ss-adv summary{cursor:pointer;font-weight:600;font-size:13.5px;color:var(--sun-deep);list-style:none}
    .ss-adv summary::-webkit-details-marker{display:none}
    .ss-advgrid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px}

    /* Veredicto */
    .ss-verdict{border-radius:16px;padding:20px 22px;margin-bottom:20px;border:1px solid}
    .ss-verdict.verde{background:var(--verde-bg);border-color:#bfe3c9}
    .ss-verdict.amarillo{background:var(--amar-bg);border-color:#ecdca0}
    .ss-verdict.rojo{background:var(--rojo-bg);border-color:#f0c4bd}
    .ss-vlabel{display:inline-flex;align-items:center;gap:8px;font-weight:800;font-size:14px;letter-spacing:.04em;text-transform:uppercase}
    .ss-vlabel.verde{color:var(--verde)} .ss-vlabel.amarillo{color:var(--amar)} .ss-vlabel.rojo{color:var(--rojo)}
    .ss-vbig{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:clamp(26px,4vw,38px);margin:8px 0 0}

    .ss-kpis{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    @media(min-width:520px){.ss-kpis{grid-template-columns:1fr 1fr 1fr}}
    .ss-kpi{background:#fff;border:1px solid var(--line);border-radius:14px;padding:14px}
    .ss-kpi .k-l{font-size:12px;color:var(--muted);font-weight:600}
    .ss-kpi .k-v{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:22px;margin-top:4px}
    .ss-kpi .k-u{font-size:12px;color:var(--muted);font-weight:500}

    .ss-bar{height:14px;border-radius:99px;background:#efe9db;overflow:hidden;display:flex;margin:10px 0 6px}
    .ss-bar .auto{background:var(--sun)} .ss-bar .exc{background:#c9d98f}
    .ss-leg{display:flex;gap:16px;font-size:12.5px;color:var(--muted);flex-wrap:wrap}
    .ss-dot{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:6px;vertical-align:middle}

    .ss-recos{list-style:none;padding:0;margin:18px 0 0;display:flex;flex-direction:column;gap:10px}
    .ss-reco{display:flex;gap:11px;background:#fff;border:1px solid var(--line);border-radius:12px;padding:12px 14px;font-size:14px;line-height:1.45}
    .ss-reco .ic{font-size:18px;flex:0 0 auto}

    .ss-foot{margin-top:26px;font-size:12px;color:var(--muted);text-align:center;line-height:1.6}
    .ss-pill{display:inline-block;background:#fff;border:1px solid var(--line);border-radius:99px;padding:4px 12px;font-size:12px;font-weight:600;color:var(--muted);margin-top:14px}
  `}</style>
);

/* ----------------------------- SUBCOMPONENTES --------------------------- */
const Toggle = ({ on, set, titulo, sub }) => (
  <div className="ss-toggle" onClick={() => set(!on)} role="button">
    <div>
      <div className="t-txt">{titulo}</div>
      {sub && <div className="t-sub">{sub}</div>}
    </div>
    <div className={"ss-switch" + (on ? " on" : "")} />
  </div>
);

const Kpi = ({ label, value, unit }) => (
  <div className="ss-kpi">
    <div className="k-l">{label}</div>
    <div className="k-v">{value}</div>
    {unit && <div className="k-u">{unit}</div>}
  </div>
);

/* ------------------------------ COMPONENTE ------------------------------ */
export default function SimuladorSolar() {
  const [zona, setZona] = useState("Castilla-La Mancha (Toledo, Albacete)");
  const [modoConsumo, setModoConsumo] = useState("anual"); // anual | factura
  const [consumoAnual, setConsumoAnual] = useState(3500);
  const [facturaMes, setFacturaMes] = useState(70);
  const [tejadoM2, setTejadoM2] = useState("");
  const [conBateria, setConBateria] = useState(false);
  const [conExcedentes, setConExcedentes] = useState(true);

  const [precioLuz, setPrecioLuz] = useState(CONFIG.precioLuzDefault);
  const [precioExcedente, setPrecioExcedente] = useState(CONFIG.precioExcedenteDefault);
  const [subv, setSubv] = useState(CONFIG.subvencionPorKwpDefault);

  // consumo efectivo
  const consumo = useMemo(() => {
    if (modoConsumo === "anual") return Math.max(500, Number(consumoAnual) || 0);
    // de factura mensual a kWh/año: factura/precio*12
    const kwhMes = (Number(facturaMes) || 0) / precioLuz;
    return Math.max(500, Math.round(kwhMes * 12));
  }, [modoConsumo, consumoAnual, facturaMes, precioLuz]);

  const input = {
    zona,
    consumoAnual: consumo,
    tejadoM2: Number(tejadoM2) || 0,
    conBateria,
    conExcedentes,
    precioLuz: Number(precioLuz) || CONFIG.precioLuzDefault,
    precioExcedente: Number(precioExcedente) || 0,
    subvencionPorKwp: Number(subv) || 0,
  };

  const r = useMemo(() => simular(input), [JSON.stringify(input)]);
  const recos = useMemo(() => generarRecomendacion(input), [JSON.stringify(input)]);

  const verdictoTxt = { verde: "Muy recomendable", amarillo: "Depende de tu caso", rojo: "Poco recomendable" };
  const verdictoIcon = { verde: "🟢", amarillo: "🟡", rojo: "🔴" };

  const pAuto = r.produccionAnual ? (r.autoconsumido / r.produccionAnual) * 100 : 0;
  const pExc = 100 - pAuto;

  return (
    <div className="ss-root">
      <Styles />
      <div className="ss-wrap">
        <header>
          <span className="ss-kicker">☀ Decisión energética</span>
          <h1 className="ss-h1 ss-display">¿Te compensan las placas solares?</h1>
          <p className="ss-sub">
            Responde tres datos y te decimos con números claros si instalar
            placas merece la pena <strong>en tu caso concreto</strong>: cuántas
            necesitas, cuánto cuesta y en cuántos años lo recuperas.
          </p>
        </header>

        <div className="ss-grid">
          {/* ----------- PANEL DE ENTRADA ----------- */}
          <section className="ss-card">
            <h2>📝 Tus datos</h2>

            <div className="ss-field">
              <label className="ss-label">¿Dónde vives?</label>
              <select className="ss-select" value={zona} onChange={(e) => setZona(e.target.value)}>
                {Object.keys(CONFIG.zonas).map((z) => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>

            <div className="ss-field">
              <label className="ss-label">¿Cómo prefieres indicar tu consumo?</label>
              <div className="ss-seg">
                <button className={modoConsumo === "anual" ? "on" : ""} onClick={() => setModoConsumo("anual")}>
                  kWh al año
                </button>
                <button className={modoConsumo === "factura" ? "on" : ""} onClick={() => setModoConsumo("factura")}>
                  Factura mensual
                </button>
              </div>
            </div>

            {modoConsumo === "anual" ? (
              <div className="ss-field">
                <label className="ss-label">
                  Consumo anual <span className="ss-hint">(lo ves en tu factura, kWh/año)</span>
                </label>
                <input className="ss-input" type="number" value={consumoAnual}
                  onChange={(e) => setConsumoAnual(e.target.value)} />
              </div>
            ) : (
              <div className="ss-field">
                <label className="ss-label">
                  Factura media al mes <span className="ss-hint">(€ solo de energía)</span>
                </label>
                <input className="ss-input" type="number" value={facturaMes}
                  onChange={(e) => setFacturaMes(e.target.value)} />
                <div className="ss-hint" style={{ marginTop: 6 }}>
                  ≈ {fmt(consumo)} kWh/año estimados
                </div>
              </div>
            )}

            <div className="ss-field">
              <label className="ss-label">
                Tejado disponible <span className="ss-hint">(opcional, m²)</span>
              </label>
              <input className="ss-input" type="number" placeholder="Ej: 40" value={tejadoM2}
                onChange={(e) => setTejadoM2(e.target.value)} />
            </div>

            <Toggle on={conExcedentes} set={setConExcedentes}
              titulo="Compensar excedentes" sub="Tu comercializadora te paga por lo que viertes a la red" />
            <Toggle on={conBateria} set={setConBateria}
              titulo="Incluir batería" sub="Almacena energía para la noche (encarece la instalación)" />

            <details className="ss-adv">
              <summary>⚙ Ajustes avanzados (precios)</summary>
              <div className="ss-advgrid">
                <div>
                  <label className="ss-label">Precio luz (€/kWh)</label>
                  <input className="ss-input" type="number" step="0.01" value={precioLuz}
                    onChange={(e) => setPrecioLuz(e.target.value)} />
                </div>
                <div>
                  <label className="ss-label">Excedente (€/kWh)</label>
                  <input className="ss-input" type="number" step="0.01" value={precioExcedente}
                    onChange={(e) => setPrecioExcedente(e.target.value)} />
                </div>
                <div>
                  <label className="ss-label">Subvención (€/kWp)</label>
                  <input className="ss-input" type="number" step="50" value={subv}
                    onChange={(e) => setSubv(e.target.value)} />
                </div>
              </div>
            </details>
          </section>

          {/* ----------- PANEL DE RESULTADOS ----------- */}
          <section className="ss-card">
            <h2>📊 Tu recomendación</h2>

            <div className={"ss-verdict " + r.nivel}>
              <span className={"ss-vlabel " + r.nivel}>
                {verdictoIcon[r.nivel]} {verdictoTxt[r.nivel]}
              </span>
              <div className="ss-vbig ss-display">
                Amortización en {r.amortizacion === Infinity ? "—" : fmt(r.amortizacion, 1)} años
              </div>
            </div>

            <div className="ss-kpis">
              <Kpi label="Placas recomendadas" value={fmt(r.numPaneles)} unit={`${fmt(r.kwp, 1)} kWp`} />
              <Kpi label="Coste estimado" value={eur(r.costeTotal)} unit={r.subvencion > 0 ? `tras subvención` : "llave en mano"} />
              <Kpi label="Producción anual" value={fmt(r.produccionAnual)} unit="kWh/año" />
              <Kpi label="Ahorro mensual" value={eur(r.ahorroMensual)} unit="de media" />
              <Kpi label="Ahorro anual" value={eur(r.ahorroAnual)} unit="en tu factura" />
              <Kpi label="Ahorro a 25 años" value={eur(r.beneficioNeto)} unit="beneficio neto" />
            </div>

            <div style={{ marginTop: 18 }}>
              <div className="ss-label" style={{ marginBottom: 4 }}>
                Qué pasa con la energía que produces
              </div>
              <div className="ss-bar">
                <div className="auto" style={{ width: pAuto + "%" }} />
                <div className="exc" style={{ width: pExc + "%" }} />
              </div>
              <div className="ss-leg">
                <span><span className="ss-dot" style={{ background: "var(--sun)" }} />
                  Autoconsumo {fmt(pAuto)}% · {fmt(r.autoconsumido)} kWh</span>
                <span><span className="ss-dot" style={{ background: "#c9d98f" }} />
                  Excedentes {fmt(pExc)}% · {fmt(r.excedentes)} kWh</span>
              </div>
            </div>

            <ul className="ss-recos">
              {recos.map((f, i) => (
                <li className="ss-reco" key={i}>
                  <span className="ic">{f.icono}</span>
                  <span>{f.txt}</span>
                </li>
              ))}
            </ul>

            <div className="ss-pill">
              Zona seleccionada: {fmt(r.yieldZona)} kWh por kWp/año
            </div>
          </section>
        </div>

        <p className="ss-foot">
          Estimación orientativa basada en precios y rendimientos medios de
          España (2025-2026). Los datos reales dependen de la orientación del
          tejado, sombras, tarifa contratada y presupuesto del instalador.
          <br />Ajusta los precios en «Ajustes avanzados» para afinar el cálculo.
        </p>
      </div>
    </div>
  );
}
