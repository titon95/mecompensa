# MeCompensa.es

Tu web de simuladores de decisión energética. Esto es el proyecto completo,
ya montado y probado. No necesitas tocar el código: yo (Claude) lo voy
construyendo y tú me vas guiando sesión a sesión.

## Qué hay aquí dentro (en cristiano)

- **lib/solar.js** → "el cerebro". Hace todos los cálculos (cuántas placas,
  cuánto cuesta, en cuántos años se recupera). Está separado a propósito:
  el día de mañana este mismo cerebro servirá para el simulador de coche
  eléctrico y el de aerotermia.
- **components/SimuladorSolar.jsx** → "la cara". Es lo que la gente ve y toca
  en la pantalla. Le pide los números al cerebro y los pinta bonito.
- **app/** → la estructura de la web (la portada vive en `app/page.jsx`).
- El resto son archivos de configuración. No hay que tocarlos.

## Lo que NO está hecho todavía (próximas sesiones)

1. Ponerla online de verdad (gratis, con GitHub + Vercel). ← siguiente paso
2. Conectar PVGIS para producción real según tu dirección.
3. El modo detallado (formulario por pasos) y el informe en PDF.
4. El formulario de contacto con consentimiento RGPD (el que genera dinero).
5. Base de datos de subvenciones e instaladores por zona.

## Si quieres verla en tu ordenador (opcional, no hace falta)

Necesitarías tener instalado Node.js. Luego, en una terminal dentro de esta
carpeta:

    npm install
    npm run dev

Y abrir http://localhost:3000 en el navegador.

Pero tranquilo: para PUBLICARLA en internet NO hace falta nada de esto. Eso lo
haremos subiéndola a la nube, y yo te guío clic a clic.
<!-- analytics activado -->
