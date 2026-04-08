// scripts/generate-og.js
// One-time OG image generator — run with: npm run generate-og
import puppeteer from 'puppeteer-core';
import { writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUTPUT_PATH = join(__dirname, '../public/og-image.webp');

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1200px;
    height: 630px;
    background: #181c20;
    font-family: system-ui, sans-serif;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    padding: 80px;
  }
  .bar {
    width: 80px;
    height: 6px;
    background: #006847;
    margin-bottom: 40px;
  }
  .title {
    font-size: 96px;
    font-weight: 800;
    color: #FFFFFF;
    line-height: 1.0;
  }
  .accent { color: #006847; }
  .tagline {
    font-size: 36px;
    font-weight: 400;
    color: #9AA5B4;
    margin-top: 24px;
    line-height: 1.4;
  }
</style>
</head>
<body>
  <div class="bar"></div>
  <div class="title"><span class="accent">No Me </span>Chinguen</div>
  <div class="tagline">¿Sabes tus derechos laborales?</div>
</body>
</html>`;

const browser = await puppeteer.launch({
  executablePath: CHROME_PATH,
  headless: true,
  defaultViewport: { width: 1200, height: 630 },
});

const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'networkidle0' });

// Try native WebP screenshot first (puppeteer-core v24+ supports it)
let buffer;
try {
  buffer = await page.screenshot({ type: 'webp', quality: 85 });
} catch {
  // Fallback: PNG screenshot, then convert with sharp
  const pngBuffer = await page.screenshot({ type: 'png' });
  const { default: sharp } = await import('sharp');
  buffer = await sharp(pngBuffer).webp({ quality: 85 }).toBuffer();
}

await browser.close();

// Ensure public/ directory exists
mkdirSync(join(__dirname, '../public'), { recursive: true });
writeFileSync(OUTPUT_PATH, buffer);

const sizeKB = (buffer.length / 1024).toFixed(1);
console.log(`Generated og-image.webp — ${buffer.length} bytes (${sizeKB} KB)`);

if (buffer.length > 300 * 1024) {
  console.error('WARNING: Image exceeds 300KB WhatsApp limit!');
  process.exit(1);
}
