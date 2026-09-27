// Elkészíti a megosztási képet (public/assets/og.jpg) és az ikonokat (apple-touch-icon, icon-192/512, maskable).
// Futtatás:  node tools/images.js      (kell hozzá a Playwright: npm i -g playwright, vagy NODE_PATH-on elérhetően)
const path = require("path");
const fs = require("fs");
let chromium;
try { ({ chromium } = require("playwright")); } catch { ({ chromium } = require("/opt/node22/lib/node_modules/playwright")); }

const ROOT = path.join(__dirname, "..", "public");
// A betűket beágyazva adjuk át (az üres lapról a böngésző nem tölthet be helyi fájlt)
const font = (f) => `data:font/woff2;base64,${fs.readFileSync(path.join(ROOT, "assets", "fonts", f)).toString("base64")}`;

const base = `
  @font-face { font-family: Yellowtail; src: url(${font("yellowtail-latin-400-normal.woff2")}); }
  @font-face { font-family: Fraunces; font-style: italic; src: url(${font("fraunces-latin-400-italic.woff2")}); }
  @font-face { font-family: Fraunces; font-style: italic; src: url(${font("fraunces-latin-ext-400-italic.woff2")}); unicode-range: U+0100-02BA; }
  @font-face { font-family: Manrope; font-weight: 600; src: url(${font("manrope-latin-600-normal.woff2")}); }
  @font-face { font-family: Manrope; font-weight: 600; src: url(${font("manrope-latin-ext-600-normal.woff2")}); unicode-range: U+0100-02BA; }
  * { margin: 0; box-sizing: border-box; }
  html, body { width: 100%; height: 100%; }
  body { display: grid; place-content: center; text-align: center; color: #f2e6d0; overflow: hidden;
    background: radial-gradient(70% 60% at 50% 42%, rgba(255, 61, 85, .28), rgba(255, 61, 85, .06) 55%, transparent), #0f0b09; }
  .neon { font-family: Yellowtail; color: #fff1f3; line-height: 1; padding: 0 .12em .08em;
    text-shadow: 0 0 2px #fff4f5, 0 0 6px #ffd0d6, 0 0 14px #ff3d55, 0 0 30px #ff3d55, 0 0 60px rgba(255, 61, 85, .7), 0 0 110px rgba(255, 61, 85, .45); }
  .sub { font: 600 26px/1 Manrope; letter-spacing: .55em; padding-left: .55em; text-transform: uppercase; color: #fff5e0;
    text-shadow: 0 0 2px #fff, 0 0 8px #d6a54a, 0 0 20px rgba(214, 165, 74, .8); }
  .sub i { font-style: normal; color: #ff6b7d; }
  .lead { font: italic 400 40px/1.2 Fraunces; margin-top: 38px; }
  .lead em { color: #d6a54a; }
  .addr { font: 600 20px/1 Manrope; letter-spacing: .12em; color: rgba(242, 230, 208, .6); margin-top: 26px; text-transform: uppercase; }
  .wall { position: absolute; inset: 0; opacity: .5;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='60'%3E%3Cg fill='none' stroke='%23f2e6d0' stroke-opacity='.07' stroke-width='2'%3E%3Cpath d='M0 1h120M0 31h120M1 1v30M61 31v30'/%3E%3C/g%3E%3C/svg%3E");
    background-size: 96px 48px; -webkit-mask-image: radial-gradient(70% 60% at 50% 45%, #000 20%, transparent 80%); }
  .inner { position: relative; }
`;

const og = `<style>${base} .neon { font-size: 250px; }</style>
  <div class="wall"></div>
  <div class="inner">
    <div class="neon">Lutri</div>
    <div class="sub">Eszpresszó <i>·</i> Söröző</div>
    <p class="lead">Reggel kávé. Este sör. <em>Mindig telitalálat.</em></p>
    <p class="addr">Békásmegyer · Heltai Jenő tér 2.</p>
  </div>`;

// Ikon: neon "L" betű; a maskable változatnál több a szegély (a rendszer levághatja a sarkokat)
const icon = (size, pad) => `<style>${base}
  body { background: radial-gradient(60% 60% at 50% 45%, rgba(255, 61, 85, .35), transparent 75%), #0f0b09; }
  .neon { font-size: ${Math.round(size * (1 - pad) * 0.92)}px; transform: translate(-3%, 6%); }
</style><div class="neon">L</div>`;

(async () => {
  const browser = await chromium.launch();
  const shot = async (html, w, h, file, type = "png") => {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(ROOT, "assets", file), type, ...(type === "jpeg" ? { quality: 88 } : {}) });
    await page.close();
    console.log("kész:", file);
  };
  await shot(og, 1200, 630, "og.jpg", "jpeg");
  await shot(icon(180, 0.1), 180, 180, "apple-touch-icon.png");
  await shot(icon(192, 0.1), 192, 192, "icon-192.png");
  await shot(icon(512, 0.1), 512, 512, "icon-512.png");
  await shot(icon(512, 0.3), 512, 512, "icon-maskable-512.png");
  await browser.close();
})();
