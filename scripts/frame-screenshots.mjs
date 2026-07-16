#!/usr/bin/env node
/**
 * Wraps each app screenshot in an authentic Pixel 10 device frame (with Android
 * status bar) and composites it onto a 16:9 canvas — sized for embedding in a
 * Medium article without eating the full vertical height.
 *
 * Renders via headless Chrome at 2x. Source screenshots are read from
 * docs/screenshots/, framed output is written to docs/screenshots-framed/.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "docs/screenshots");
const OUT = join(ROOT, "docs/screenshots-framed");
const CHROME =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const SHOTS = ["constellation", "stream", "capture", "develop", "settings", "detail"];

// 16:9 canvas in CSS px; rendered at 2x -> 1920x1080.
const CANVAS_W = 960;
const CANVAS_H = 540;

const html = (b64) => `<!doctype html><html><head><meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${CANVAS_W}px; height: ${CANVAS_H}px; overflow: hidden; }
  .stage {
    position: relative;
    width: ${CANVAS_W}px;
    height: ${CANVAS_H}px;
    display: flex;
    align-items: center;
    justify-content: center;
    /* clean light backdrop */
    background: #f5f4f7;
    font-family: -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
  }
  /* soft circular backdrop behind the device */
  .circle { position: absolute; width: 470px; height: 470px; border-radius: 50%;
    background: radial-gradient(circle, #ffffff 0%, #f0eef4 60%, #e7e4ec 100%);
    box-shadow: 0 24px 60px rgba(60,50,80,.10); }

  /* iPhone 17 titanium body — concentric corners, slim uniform bezel */
  .device {
    position: relative;
    padding: 5px;
    background:
      linear-gradient(135deg, #6b6b70 0%, #202024 18%, #17171a 50%, #202024 82%, #6b6b70 100%);
    border-radius: 40px;
    box-shadow:
      0 0 0 .5px rgba(255,255,255,.10) inset,
      0 26px 50px rgba(30,24,45,.30),
      0 4px 12px rgba(30,24,45,.20);
  }
  .screen {
    position: relative;
    width: 216px;                 /* -> 468px tall image keeps 16:9 room */
    border-radius: 35px;          /* concentric with body (40 - 5) */
    overflow: hidden;
    background: #171020;
  }
  /* iOS status bar sits over the app, colored to match the shot's top pixel */
  .statusbar {
    position: relative;
    height: 30px;
    background: #171020;          /* overwritten per-shot via JS sampling */
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 17px 0 21px;
    color: #fff;
    z-index: 2;
  }
  .time {
    font-size: 12px; font-weight: 600; letter-spacing: -.1px;
    font-variant-numeric: tabular-nums; margin-top: 1px;
  }
  .icons { display: flex; align-items: center; gap: 4px; margin-top: 1px; }
  .icons svg { display: block; }
  /* Dynamic Island */
  .island {
    position: absolute;
    top: 6.5px; left: 50%; transform: translateX(-50%);
    width: 54px; height: 18px; border-radius: 10px;
    background: #000;
    z-index: 3;
  }
  .island::after {   /* front camera dot */
    content: ""; position: absolute; top: 50%; right: 8px;
    transform: translateY(-50%);
    width: 6px; height: 6px; border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, #24303f 0%, #05070a 70%);
  }
  /* whisper-thin corner glint — just enough to imply glass, not wash the app */
  .glass {
    position: absolute; inset: 0; z-index: 4; pointer-events: none;
    background: linear-gradient(122deg,
      rgba(255,255,255,.05) 0%, transparent 12%, transparent 100%);
  }
  .shot {
    display: block; width: 216px;
    filter: saturate(1.12) contrast(1.05) brightness(1.02);
  }
</style></head>
<body>
  <div class="stage">
    <div class="circle"></div>
    <div class="device">
      <div class="screen">
        <div class="statusbar" id="statusbar">
          <span class="time">9:41</span>
          <span class="icons">
            <!-- cellular signal -->
            <svg width="14" height="10" viewBox="0 0 17 11" fill="#fff">
              <rect x="0"    y="7.5" width="2.6" height="3.5" rx="1"/>
              <rect x="4.2"  y="5.3" width="2.6" height="5.7" rx="1"/>
              <rect x="8.4"  y="2.8" width="2.6" height="8.2" rx="1"/>
              <rect x="12.6" y="0"   width="2.6" height="11"  rx="1"/>
            </svg>
            <!-- wifi -->
            <svg width="14" height="10" viewBox="0 0 20 15" fill="#fff">
              <path d="M10 3.1c3.05 0 5.86 1.06 8.07 2.84a.5.5 0 0 0 .69-.06l1.02-1.22a.52.52 0 0 0-.06-.73A15.4 15.4 0 0 0 10 .5 15.4 15.4 0 0 0 .28 3.93a.52.52 0 0 0-.06.73l1.02 1.22a.5.5 0 0 0 .69.06A12.4 12.4 0 0 1 10 3.1z"/>
              <path d="M10 7.05c1.8 0 3.45.64 4.74 1.7a.5.5 0 0 0 .68-.05l1.1-1.24a.52.52 0 0 0-.05-.75A10.2 10.2 0 0 0 10 4.35a10.2 10.2 0 0 0-6.47 2.31.52.52 0 0 0-.05.75l1.1 1.24a.5.5 0 0 0 .68.05A7.35 7.35 0 0 1 10 7.05z"/>
              <path d="M10 10.7c.86 0 1.65.32 2.25.85a.5.5 0 0 0 .7-.04l1.36-1.53a.53.53 0 0 0-.06-.77A7 7 0 0 0 10 8.3a7 7 0 0 0-4.25 1.58.53.53 0 0 0-.06.77l1.36 1.53a.5.5 0 0 0 .7.04c.6-.53 1.39-.85 2.25-.85z"/>
            </svg>
            <!-- battery -->
            <svg width="23" height="11" viewBox="0 0 27 13" fill="none">
              <rect x=".6" y=".6" width="22.4" height="11.8" rx="3.4" stroke="#fff" stroke-opacity=".45" stroke-width="1"/>
              <rect x="2.2" y="2.2" width="16" height="8.6" rx="2" fill="#fff"/>
              <path d="M25 4.3v4.4c1-.42 1-3.98 0-4.4z" fill="#fff" fill-opacity=".5"/>
            </svg>
          </span>
        </div>
        <div class="island"></div>
        <div class="glass"></div>
        <img class="shot" id="shot" src="data:image/png;base64,${b64}">
      </div>
    </div>
  </div>
  <script>
    // Sample the top-center pixel of the screenshot and tint the status bar to
    // match, so the synthesized iOS bar blends into the app instead of sitting
    // on it as a seam.
    (function () {
      var img = document.getElementById("shot");
      function sample() {
        try {
          var c = document.createElement("canvas");
          c.width = img.naturalWidth; c.height = img.naturalHeight;
          var ctx = c.getContext("2d");
          ctx.drawImage(img, 0, 0);
          var d = ctx.getImageData((img.naturalWidth / 2) | 0, 2, 1, 1).data;
          var bg = "rgb(" + d[0] + "," + d[1] + "," + d[2] + ")";
          document.getElementById("statusbar").style.background = bg;
          document.querySelector(".screen").style.background = bg;
        } catch (e) {}
      }
      if (img.complete && img.naturalWidth) sample();
      else img.onload = sample;
    })();
  </script>
</body></html>`;

mkdirSync(OUT, { recursive: true });
const work = join(tmpdir(), `frame-${Date.now()}`);
mkdirSync(work, { recursive: true });

for (const name of SHOTS) {
  const b64 = readFileSync(join(SRC, `${name}.png`)).toString("base64");
  const htmlPath = join(work, `${name}.html`);
  writeFileSync(htmlPath, html(b64));
  const outPath = join(OUT, `${name}.png`);
  execFileSync(
    CHROME,
    [
      "--headless=new",
      "--hide-scrollbars",
      "--force-device-scale-factor=2",
      "--default-background-color=00000000",
      "--virtual-time-budget=1500",
      `--window-size=${CANVAS_W},${CANVAS_H}`,
      `--screenshot=${outPath}`,
      `file://${htmlPath}`,
    ],
    { stdio: "ignore" }
  );
  console.log(`✓ ${name}.png`);
}

rmSync(work, { recursive: true, force: true });
console.log(`\nFramed screenshots written to ${OUT}`);
