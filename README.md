# No Me Chinguen

**Conoce tus derechos laborales. Defiendete.**

Una aplicacion web progresiva (PWA), gratuita y de codigo abierto, que ayuda a cada trabajador en Mexico a conocer y ejercer sus derechos bajo la [Ley Federal del Trabajo](https://mexico.justia.com/federales/leyes/ley-federal-del-trabajo/). Sin registro, sin recoleccion de datos, sin costo — solo la ley, explicada sin rodeos.

**En vivo:** [nomechinguen.com.mx](https://nomechinguen.com.mx)

---

## Por que existe esto

Millones de trabajadores en Mexico no conocen sus derechos laborales basicos. Los patrones cuentan con esa ignorancia. Esta app pone la ley en el bolsillo de cada trabajador — en cualquier celular, incluso sin internet, en un lenguaje que de verdad se entiende.

Cada referencia legal en esta app esta verificada contra el texto vigente de la LFT (ultima reforma DOF 15/01/2026), guias interpretativas de la STPS y jurisprudencia laboral.

## Funcionalidades

### Checklist interactivo ("A Ver")
13 preguntas de si/no que detectan violaciones laborales comunes. Cada respuesta genera un veredicto con el articulo especifico de la LFT que se esta violando, en dos tonos:
- **Directo** — sin filtros, sin endulzar
- **Tranquilo** — lenguaje mas suave para contextos formales (ONGs, RH)

### Guia legal
10 capitulos que cubren jornada laboral, horas extra, vacaciones, aguinaldo, PTU, liquidacion, focos rojos, plan de accion, glosario y privacidad. Cada afirmacion cita el articulo correspondiente de la LFT.

### Calculadora de compensacion
Tres modos con entrada de salario compartida:
- **Prestaciones** — Desglose anual completo: aguinaldo (Art. 87), vacaciones + prima vacacional (Art. 76, 80), prima dominical (Art. 71), SDI, PTU y prestaciones contractuales opcionales. Alterna entre vista anual y mensual.
- **Horas Extra** — Pago de horas extra a tarifa doble (primeras 9 hrs) y triple segun tipo de jornada (Art. 66-68).
- **Despido / Renuncia** — Comparacion lado a lado: lo que recibes si te despiden (3 meses Art. 48 + 20 días/año Art. 50 + prima de antiguedad Art. 162) vs. si renuncias voluntariamente. El trabajador ve las consecuencias economicas al instante.

Soporta entrada de salario bruto y neto con conversion de frecuencia (diario/semanal/quincenal/mensual).

### Preguntas frecuentes
8 preguntas comunes con interfaz tipo acordeon — respuestas verificadas contra la ley vigente.

### Directorio de recursos
Informacion de contacto directa:
- **PROFEDET** — Abogados laborales federales gratuitos
- **STPS** — Secretaria del Trabajo
- **IMSS** — Seguro Social
- **Infonavit** — Fondo de vivienda
- **Centro Federal de Conciliacion y Registro Laboral**

## Stack tecnologico

| Capa | Tecnologia | Por que |
|------|-----------|---------|
| Framework | React 19 | Rapido, arquitectura de componente unico |
| Build | Vite 6 | HMR en menos de un segundo, builds optimizados |
| Estilos | CSS-in-JS inline | Cero overhead de CSS, tokens de diseno en codigo |
| Pruebas | Vitest | Tests unitarios rapidos para funciones de calculo |
| Hosting | Cloudflare Pages | Gratis, entrega global en el edge, HTTPS incluido |
| Imagen OG | Puppeteer (build-time) | Generada por codigo, reproducible |

**Sin backend. Sin base de datos. Sin analytics. Sin cookies.** Todo corre del lado del cliente.

## Como empezar

### Requisitos previos

- Node.js 18+
- npm

### Instalar y ejecutar

```bash
git clone https://github.com/shondash/nomechinguen.git
cd nomechinguen
npm install
npm run dev
```

Abre `http://localhost:5173`

### Build de produccion

```bash
npm run build
npm run preview  # vista previa del build de produccion
```

La salida va a `dist/`.

### Ejecutar pruebas

```bash
npx vitest run
```

Las pruebas cubren todas las funciones de calculo: conversion salarial, antiguedad, aguinaldo, vacaciones, prima vacacional, prima dominical, SDI, finiquito y liquidacion.

### Generar imagen OG

```bash
npm run generate-og
```

Requiere Google Chrome instalado. Genera `public/og-image.webp` (1200x630 WebP).

## Despliegue

Se despliega en Cloudflare Pages via wrangler CLI:

```bash
npx wrangler login
npx wrangler pages deploy dist/ --project-name nomechinguen
```

### Archivos estaticos

| Archivo | Proposito |
|---------|-----------|
| `public/_headers` | Cache-Control para service worker (`no-cache, no-store` en `/sw.js`) |
| `public/robots.txt` | Permitir todos los crawlers, referencia al sitemap |
| `public/sitemap.xml` | Entrada unica de URL para la SPA |
| `public/og-image.webp` | Imagen de vista previa para WhatsApp/redes sociales |

## Fuentes legales

Todo el contenido legal esta verificado contra:

- **Ley Federal del Trabajo** — Ultima reforma DOF 15/01/2026 ([texto completo](https://mexico.justia.com/federales/leyes/ley-federal-del-trabajo/))
- **Constitucion Politica** — Art. 123, Apartado A
- **Ley del Seguro Social** — Art. 15, 27-30 (obligaciones IMSS, calculo SDI)
- **CONASAMI** — Salario minimo 2026: $315.04/dia
- **INEGI** — UMA 2026: $117.31/dia (DOF 09/01/2026)
- **STPS / PROFEDET** — Guias interpretativas y materiales de educacion laboral

### Valores monetarios

Las constantes legales estan centralizadas en `src/constants/legal.js` y etiquetadas con el año al que aplican. Cuando los valores cambian (tipicamente en enero de cada año), solo se actualiza ese archivo.

## Estructura del proyecto

```
nomechinguen/
├── src/
│   ├── main.jsx                 # Punto de entrada React
│   ├── NoMeChinguen.jsx         # Componente principal (toda la UI + logica)
│   ├── constants/
│   │   └── legal.js             # Constantes legales (salario minimo, UMA, etc.)
│   └── utils/
│       ├── calculations.js      # Funciones puras de calculo (7 exportadas)
│       └── calculations.test.js # Pruebas unitarias (Vitest)
├── public/
│   ├── _headers                 # Headers de Cloudflare Pages
│   ├── og-image.webp            # Imagen de vista previa para redes sociales
│   ├── robots.txt               # SEO
│   └── sitemap.xml              # SEO
├── scripts/
│   └── generate-og.js           # Generador de imagen OG (puppeteer)
├── index.html                   # HTML de entrada con meta tags OG
├── vite.config.js               # Configuracion de build
└── vitest.config.js             # Configuracion de pruebas
```

## Contribuir

Este proyecto existe para ayudar a los trabajadores. Las contribuciones que mejoren la precision legal, la accesibilidad o el alcance son especialmente bienvenidas.

### Antes de contribuir

1. **La precision legal es la prioridad #1.** Cada cita de articulo, cada formula, cada numero debe ser verificable contra el texto vigente de la LFT. Si cambias contenido legal, cita tu fuente.
2. **Cero recoleccion de datos.** No agregues analytics, trackers, formularios ni nada que recolecte datos personales. El compromiso de privacidad es innegociable.
3. **Todo del lado del cliente.** Sin backends, sin APIs, sin dependencias de servidor. Trabajadores con conexiones 2G en zonas rurales de Mexico necesitan que esto funcione.
4. **Prueba tus calculos.** Ejecuta `npx vitest run` antes de enviar. Si agregas un calculo nuevo, agrega pruebas.

### Como contribuir

1. Haz fork del repositorio
2. Crea una rama para tu funcionalidad (`git checkout -b feat/mi-funcionalidad`)
3. Haz tus cambios
4. Ejecuta pruebas (`npx vitest run`) y build (`npm run build`)
5. Envia un pull request con una descripcion clara de que cambio y por que

### Reportar errores

Encontraste un error legal? **Ese es el reporte de bug mas valioso posible.** Abre un issue con:
- Lo que dice la app
- Lo que realmente dice la ley
- La referencia al articulo especifico de la LFT

## Mantenimiento anual

Cada enero, cuando CONASAMI publica el nuevo salario minimo e INEGI publica la nueva UMA:

1. Actualiza `src/constants/legal.js`:
   - `SALARIO_MINIMO_DIARIO`
   - `UMA_DIARIO`
   - `LEGAL_YEAR`
2. Ejecuta pruebas: `npx vitest run`
3. Build y despliegue: `npm run build && npx wrangler pages deploy dist/`

## Licencia

Este proyecto usa licencia dual:

- **Contenido** (texto, informacion legal, traducciones): [CC BY-NC-SA 4.0](LICENSE-CONTENT)
- **Codigo** (fuente, componentes, scripts): [MIT](LICENSE-CODE)

Usalo, hazle fork, mejoralo. Ayuda a los trabajadores.

## Creditos

Hecho para los 56 millones de trabajadores formales en Mexico — y los millones mas en la economia informal que merecen conocer sus derechos tambien.

**Aviso legal:** Esta app proporciona educacion legal general basada en la Ley Federal del Trabajo. No es asesoria legal. Para casos especificos, contacta a [PROFEDET](https://www.gob.mx/profedet) (800-911-7877) — proporcionan representacion legal gratuita a trabajadores.
