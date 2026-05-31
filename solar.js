/* =========================================================================
   MOTOR DE CÁLCULO SOLAR — módulo puro (sin React)
   -------------------------------------------------------------------------
   Aquí vive TODA la lógica y los parámetros del modelo. No hay nada de
   pantalla aquí: solo números entran y números salen. Eso permite
   reutilizar este mismo archivo para el simulador de coche eléctrico,
   el de aerotermia, las páginas SEO por ciudad, etc.

   Para afinar el realismo (precios, costes, rendimientos) solo hay que
   tocar el objeto CONFIG de abajo.
   ========================================================================= */

export const CONFIG = {
  // Rendimiento solar por zona: kWh producidos al año por cada kWp instalado
  // (orientación e inclinación razonables). Fuente orientativa: PVGIS / IDAE.
  zonas: {
    "Andalucía (Sevilla, Córdoba, Málaga)": 1650,
    "Murcia / Alicante": 1620,
    "Canarias": 1700,
    "Comunidad Valenciana": 1580,
    "Extremadura": 1620,
    "Castilla-La Mancha (Toledo, Albacete)": 1590,
    "Madrid": 1560,
    "Baleares": 1600,
    "Aragón (Zaragoza)": 1530,
    "Cataluña (Barcelona, Tarragona)": 1470,
    "Castilla y León": 1490,
    "Navarra / La Rioja": 1450,
    "País Vasco / Cantabria": 1180,
    "Asturias": 1160,
    "Galicia": 1230,
  },

  panel: {
    potenciaKwp: 0.45, // panel típico de 450 W
    areaM2: 2.0, // superficie aprox. por panel
    aprovechamientoTejado: 0.65, // % de tejado realmente usable
  },

  // El coste por kWp baja al crecer la instalación (economía de escala).
  costePorKwp(kwp) {
    if (kwp <= 2) return 1450;
    if (kwp <= 4) return 1250;
    if (kwp <= 6) return 1120;
    if (kwp <= 10) return 1020;
    return 950;
  },

  bateria: {
    costePorKwh: 580, // € por kWh de capacidad
    // dimensionado: capacidad ~ 1.3 días de consumo nocturno aproximado
    factorDimensionado: 0.35, // kWh batería por kWh de consumo diario
  },

  // Grado de autoconsumo: qué parte de lo producido usas tú directamente.
  autoconsumo: {
    sinBateria: 0.35,
    conBateria: 0.7,
  },

  // Precios editables por el usuario (valores por defecto realistas 2026)
  precioLuzDefault: 0.2, // €/kWh que dejas de comprar (precio final con peajes/impuestos)
  precioExcedenteDefault: 0.06, // €/kWh que te compensan por verter a la red
  subvencionPorKwpDefault: 0, // ayuda IDAE puede llegar a ~600 €/kWp si hay convocatoria

  // Umbrales del veredicto (años de amortización)
  veredicto: {
    verde: 7,
    amarillo: 11,
  },

  degradacionAnual: 0.005, // 0,5% de pérdida de producción al año
  vidaUtilAnios: 25,
};

/* ----------------------------- FORMATO --------------------------------- */
export const fmt = (n, dec = 0) =>
  new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  }).format(n);

export const eur = (n) => fmt(n, 0) + " €";

/* ----------------------------- MOTOR DE CÁLCULO ------------------------- */
export function simular(input) {
  const {
    zona,
    consumoAnual,
    tejadoM2,
    conBateria,
    conExcedentes,
    precioLuz,
    precioExcedente,
    subvencionPorKwp,
  } = input;

  const yieldZona = CONFIG.zonas[zona];

  // 1) Dimensionado: cubrir aprox. el consumo anual
  let kwpObjetivo = consumoAnual / yieldZona;
  let numPaneles = Math.max(1, Math.round(kwpObjetivo / CONFIG.panel.potenciaKwp));

  // 2) Límite por tejado (si se ha indicado)
  let limitadoPorTejado = false;
  if (tejadoM2 && tejadoM2 > 0) {
    const maxPaneles = Math.floor(
      (tejadoM2 * CONFIG.panel.aprovechamientoTejado) / CONFIG.panel.areaM2
    );
    if (maxPaneles >= 1 && numPaneles > maxPaneles) {
      numPaneles = maxPaneles;
      limitadoPorTejado = true;
    }
  }

  const kwp = numPaneles * CONFIG.panel.potenciaKwp;

  // 3) Producción anual
  const produccionAnual = kwp * yieldZona;

  // 4) Energía: autoconsumo directo vs excedentes
  const ratioAuto = conBateria
    ? CONFIG.autoconsumo.conBateria
    : CONFIG.autoconsumo.sinBateria;
  const autoconsumido = Math.min(produccionAnual * ratioAuto, consumoAnual);
  let excedentes = produccionAnual - autoconsumido;

  // 5) Ahorro económico anual
  const ahorroAuto = autoconsumido * precioLuz;
  // los excedentes solo se compensan hasta el valor de lo que compras a la red
  const topeCompensacion = consumoAnual * precioLuz;
  let ahorroExcedentes = 0;
  if (conExcedentes) {
    ahorroExcedentes = Math.min(excedentes * precioExcedente, topeCompensacion);
  } else {
    excedentes = 0; // se regala / no se aprovecha
  }
  const ahorroAnual = ahorroAuto + ahorroExcedentes;

  // 6) Costes
  const costeBase = kwp * CONFIG.costePorKwp(kwp);
  let costeBateria = 0;
  if (conBateria) {
    const consumoDiario = consumoAnual / 365;
    const capacidad = consumoDiario * CONFIG.bateria.factorDimensionado * 3; // ~ varios kWh
    costeBateria = capacidad * CONFIG.bateria.costePorKwh;
  }
  const subvencion = kwp * subvencionPorKwp;
  const costeTotal = Math.max(0, costeBase + costeBateria - subvencion);

  // 7) Amortización
  const amortizacion = ahorroAnual > 0 ? costeTotal / ahorroAnual : Infinity;

  // 8) Ahorro acumulado a vida útil (con degradación)
  let ahorro25 = 0;
  for (let a = 0; a < CONFIG.vidaUtilAnios; a++) {
    ahorro25 += ahorroAnual * Math.pow(1 - CONFIG.degradacionAnual, a);
  }
  const beneficioNeto = ahorro25 - costeTotal;

  // 9) Veredicto
  let nivel = "rojo";
  if (amortizacion <= CONFIG.veredicto.verde) nivel = "verde";
  else if (amortizacion <= CONFIG.veredicto.amarillo) nivel = "amarillo";

  return {
    yieldZona,
    numPaneles,
    kwp,
    produccionAnual,
    autoconsumido,
    excedentes,
    ahorroAuto,
    ahorroExcedentes,
    ahorroAnual,
    ahorroMensual: ahorroAnual / 12,
    costeBase,
    costeBateria,
    subvencion,
    costeTotal,
    amortizacion,
    ahorro25,
    beneficioNeto,
    coberturaConsumo: produccionAnual / consumoAnual,
    nivel,
    limitadoPorTejado,
  };
}

/* --------------------- RECOMENDACIÓN EN LENGUAJE NATURAL ---------------- */
export function generarRecomendacion(input) {
  // Comparamos siempre el escenario CON y SIN batería para aconsejar mejor
  const sinBat = simular({ ...input, conBateria: false });
  const conBat = simular({ ...input, conBateria: true });
  const base = input.conBateria ? conBat : sinBat;

  const frases = [];

  if (base.nivel === "verde") {
    frases.push({
      icono: "🟢",
      txt: `Sí te compensa: recuperas la inversión en unos ${fmt(base.amortizacion, 1)} años y a partir de ahí es ahorro neto.`,
    });
  } else if (base.nivel === "amarillo") {
    frases.push({
      icono: "🟡",
      txt: `Depende: la amortización ronda los ${fmt(base.amortizacion, 1)} años. Sale a cuenta si vas a vivir en la casa muchos años o si suben los precios de la luz.`,
    });
  } else {
    frases.push({
      icono: "🔴",
      txt: `Hoy no sale muy rentable: tardarías más de ${fmt(CONFIG.veredicto.amarillo, 0)} años en amortizarlo con estos datos. Revisa tu consumo o espera a una subvención.`,
    });
  }

  // Consejo sobre la batería
  if (Math.abs(conBat.amortizacion - sinBat.amortizacion) > 0.3) {
    if (conBat.amortizacion <= sinBat.amortizacion) {
      frases.push({
        icono: "🔋",
        txt: `En tu caso la batería tiene sentido: mejora la amortización (${fmt(conBat.amortizacion, 1)} años con batería frente a ${fmt(sinBat.amortizacion, 1)} sin ella).`,
      });
    } else {
      frases.push({
        icono: "🔌",
        txt: `Mejor SIN batería de momento: encarece la instalación y alarga la amortización (${fmt(conBat.amortizacion, 1)} años frente a ${fmt(sinBat.amortizacion, 1)} sin batería).`,
      });
    }
  }

  // Consejo sobre excedentes
  frases.push({
    icono: "⚡",
    txt: input.conExcedentes
      ? `Contrata una tarifa con compensación de excedentes: recuperarás parte de lo que viertes a la red (unos ${eur(base.ahorroExcedentes)}/año).`
      : `Activa la compensación de excedentes en tu comercializadora: estás regalando energía que podría descontarse de tu factura.`,
  });

  if (base.limitadoPorTejado) {
    frases.push({
      icono: "📐",
      txt: `Tu tejado limita la instalación: con más superficie cubrirías más consumo. Aun así, lo que cabe ya aporta ahorro.`,
    });
  }

  return frases;
}
