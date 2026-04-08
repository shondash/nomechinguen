// scripts/generate-flyer.js
// Generates public/volante.pdf — run with: npm run generate-flyer
import puppeteer from 'puppeteer-core';
import QRCode from 'qrcode';
import { writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUTPUT_PATH = join(__dirname, '../public/volante.pdf');

// Generate QR code SVG linking to the site (no tracking params — per D-04)
const qrSvg = await QRCode.toString('https://nomechinguen.com.mx', {
  type: 'svg',
  width: 120,
  margin: 0,
  color: { dark: '#1F2933', light: '#FFFFFF' },
});

const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    width: 210mm;
    min-height: 297mm;
    background: #FFFFFF;
    color: #1F2933;
    font-family: system-ui, -apple-system, Arial, sans-serif;
  }

  .hero {
    background: #0A1628;
    padding: 28px 32px 24px;
    position: relative;
    overflow: hidden;
  }

  .hero::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #006847 0%, #00A86B 50%, #006847 100%);
  }

  .hero-title {
    font-size: 36pt;
    font-weight: 900;
    color: #FFFFFF;
    line-height: 1.0;
    letter-spacing: -1px;
  }

  .hero-title .accent { color: #00C853; }

  .hero-tagline {
    font-size: 11pt;
    color: rgba(255,255,255,0.7);
    margin-top: 6px;
  }

  .hook {
    background: #006847;
    padding: 14px 32px;
    text-align: center;
  }

  .hook-text {
    font-size: 14pt;
    font-weight: 700;
    color: #FFFFFF;
  }

  .content { padding: 20px 28px 16px; }

  .section-label {
    font-size: 8pt;
    font-weight: 700;
    color: #006847;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 14px;
  }

  .violations-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 16px;
    margin-bottom: 20px;
  }

  .violation {
    background: #F7FAFC;
    border-radius: 8px;
    padding: 12px 14px;
    border-left: 4px solid #006847;
    position: relative;
  }

  .violation-num {
    position: absolute;
    top: 8px;
    right: 10px;
    font-size: 20pt;
    font-weight: 900;
    color: rgba(0,104,71,0.08);
    line-height: 1;
  }

  .violation-q {
    font-size: 10pt;
    font-weight: 700;
    color: #1F2933;
    line-height: 1.35;
    margin-bottom: 4px;
  }

  .violation-a {
    font-size: 8.5pt;
    color: #486581;
    line-height: 1.4;
  }

  .violation-ref {
    display: inline-block;
    background: #006847;
    color: #FFFFFF;
    font-size: 7pt;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 3px;
    margin-top: 4px;
    letter-spacing: 0.3px;
  }

  .cta-strip {
    background: #FFF8E1;
    border: 2px solid #F9A825;
    border-radius: 8px;
    padding: 12px 18px;
    margin-bottom: 18px;
    text-align: center;
  }

  .cta-text {
    font-size: 11pt;
    font-weight: 700;
    color: #E65100;
  }

  .cta-sub {
    font-size: 8.5pt;
    color: #795548;
    margin-top: 2px;
  }

  .bottom {
    display: flex;
    gap: 20px;
    align-items: flex-start;
    padding: 0 4px;
  }

  .phones { flex: 1; }

  .phones-title {
    font-size: 8pt;
    font-weight: 700;
    color: #006847;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 10px;
  }

  .phone-item {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
    background: #F0FAF5;
    border-radius: 6px;
    padding: 8px 12px;
  }

  .phone-badge {
    background: #006847;
    color: #FFFFFF;
    font-size: 7pt;
    font-weight: 800;
    padding: 4px 8px;
    border-radius: 4px;
    white-space: nowrap;
    min-width: 60px;
    text-align: center;
  }

  .phone-info { flex: 1; }

  .phone-number {
    font-size: 11pt;
    font-weight: 800;
    color: #1F2933;
    font-family: monospace;
  }

  .phone-desc {
    font-size: 7.5pt;
    color: #627D98;
  }

  .qr-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    background: #F7FAFC;
    border-radius: 10px;
    padding: 14px 18px;
    border: 2px dashed #CBD5E0;
  }

  .qr-section svg {
    width: 100px;
    height: 100px;
    display: block;
  }

  .qr-label {
    font-size: 7.5pt;
    color: #627D98;
    text-align: center;
    font-weight: 500;
  }

  .qr-url {
    font-size: 10pt;
    font-weight: 800;
    color: #006847;
    text-align: center;
    font-family: monospace;
  }

  .footer {
    margin-top: 14px;
    padding: 10px 28px;
    background: #F7FAFC;
    font-size: 7pt;
    color: #9AA5B4;
    text-align: center;
    line-height: 1.5;
  }
</style>
</head>
<body>

  <div class="hero">
    <div class="hero-title"><span class="accent">No Me </span>Chinguen</div>
    <div class="hero-tagline">Hecha por trabajadores, para trabajadores. Conoce tus derechos bajo la LFT.</div>
  </div>

  <div class="hook">
    <div class="hook-text">\u00bfTe suena familiar alguna de estas situaciones?</div>
  </div>

  <div class="content">

    <div class="section-label">7 se\u00f1ales de que te est\u00e1n violando tus derechos</div>

    <div class="violations-grid">
      <div class="violation">
        <div class="violation-num">1</div>
        <div class="violation-q">\u00bfTe hacen quedarte tarde sin pagar?</div>
        <div class="violation-a">Las horas extra se pagan al doble o triple. No es opcional.</div>
        <div class="violation-ref">Art. 67 LFT</div>
      </div>
      <div class="violation">
        <div class="violation-num">2</div>
        <div class="violation-q">\u00bfTe pagan por fuera de la n\u00f3mina?</div>
        <div class="violation-a">Eso reduce tu IMSS, tu retiro y tu cr\u00e9dito Infonavit.</div>
        <div class="violation-ref">Art. 804 LFT</div>
      </div>
      <div class="violation">
        <div class="violation-num">3</div>
        <div class="violation-q">\u00bfMenos de 12 d\u00edas de vacaciones?</div>
        <div class="violation-a">Desde 2023, el m\u00ednimo legal es 12 d\u00edas desde tu primer a\u00f1o.</div>
        <div class="violation-ref">Art. 76 LFT</div>
      </div>
      <div class="violation">
        <div class="violation-num">4</div>
        <div class="violation-q">\u00bfFirmaste una renuncia en blanco?</div>
        <div class="violation-a">Ning\u00fan documento en blanco tiene validez. No lo firmes jam\u00e1s.</div>
        <div class="violation-ref">Nulo de pleno derecho</div>
      </div>
      <div class="violation">
        <div class="violation-num">5</div>
        <div class="violation-q">\u00bfSin aguinaldo o menos de 15 d\u00edas?</div>
        <div class="violation-a">Es obligatorio antes del 20 de diciembre. Tienes 1 a\u00f1o para reclamar.</div>
        <div class="violation-ref">Art. 87 LFT</div>
      </div>
      <div class="violation">
        <div class="violation-num">6</div>
        <div class="violation-q">\u00bfNo recibes reparto de utilidades?</div>
        <div class="violation-a">Si la empresa tuvo ganancias, te corresponde tu parte del PTU.</div>
        <div class="violation-ref">Art. 117 LFT</div>
      </div>
      <div class="violation">
        <div class="violation-num">7</div>
        <div class="violation-q">\u00bfTe amenazan por querer sindicalizarte?</div>
        <div class="violation-a">Organizarte es un derecho constitucional. Las represalias son ilegales.</div>
        <div class="violation-ref">Art. 357 LFT</div>
      </div>
    </div>

    <div class="cta-strip">
      <div class="cta-text">Si contestaste S\u00cd a cualquiera, tienes opciones. No te quedes callado.</div>
      <div class="cta-sub">Llama gratis o escanea el c\u00f3digo para saber exactamente qu\u00e9 hacer.</div>
    </div>

    <div class="bottom">
      <div class="phones">
        <div class="phones-title">Ayuda legal gratuita</div>
        <div class="phone-item">
          <div class="phone-badge">PROFEDET</div>
          <div class="phone-info">
            <div class="phone-number">800 911 7877</div>
            <div class="phone-desc">Abogados laborales gratuitos (federal)</div>
          </div>
        </div>
        <div class="phone-item">
          <div class="phone-badge">IMSS</div>
          <div class="phone-info">
            <div class="phone-number">800 623 2323</div>
            <div class="phone-desc">Seguro social y derechos</div>
          </div>
        </div>
        <div class="phone-item">
          <div class="phone-badge">STPS</div>
          <div class="phone-info">
            <div class="phone-number">gob.mx/stps</div>
            <div class="phone-desc">Denuncia de violaciones laborales</div>
          </div>
        </div>
      </div>
      <div class="qr-section">
        ${qrSvg}
        <div class="qr-label">Escanea con tu celular</div>
        <div class="qr-url">nomechinguen.com.mx</div>
      </div>
    </div>

  </div>

  <div class="footer">
    Ley Federal del Trabajo (DOF 15/01/2026) \u00b7 Salario m\u00ednimo 2026: $315.04/d\u00eda (CONASAMI)
    \u00b7 Este volante es informativo, no es asesor\u00eda legal. \u00b7 Comp\u00e1rtelo con quien lo necesite.
  </div>

</body>
</html>`;

const browser = await puppeteer.launch({
  executablePath: CHROME_PATH,
  headless: true,
});

const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'networkidle0' });

const pdfBuffer = await page.pdf({
  format: 'A4',
  printBackground: true,
  margin: { top: '0', right: '0', bottom: '0', left: '0' },
});

await browser.close();

// Ensure public/ directory exists and write PDF
mkdirSync(join(__dirname, '../public'), { recursive: true });
writeFileSync(OUTPUT_PATH, pdfBuffer);

const sizeKB = (pdfBuffer.length / 1024).toFixed(1);
console.log(`Generated volante.pdf — ${pdfBuffer.length} bytes (${sizeKB} KB)`);

if (pdfBuffer.length > 500 * 1024) {
  console.error('WARNING: PDF exceeds 500KB limit for WhatsApp sharing!');
  process.exit(1);
}
