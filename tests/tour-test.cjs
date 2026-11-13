// Stub-model test for the guided tour: every step shows, highlights its panel, and the "Try it" checks turn to Done.
// THREE_DIR=<unpacked three@0.160.0> serves three.js locally when unpkg is unreachable. SHOT_DIR=<dir> saves screenshots.
const { chromium } = require("playwright"); const { spawn } = require("child_process"); const path = require("path");
(async () => {
  const srv = spawn("python3", ["-m", "http.server", "8784", "--bind", "127.0.0.1"], { cwd: path.join(__dirname, ".."), stdio: "ignore" });
  await new Promise(r => setTimeout(r, 800));
  const b = await chromium.launch({ args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox"] });
  let fail = false; const log = [];
  try {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } }); const errs = [];
    p.on("pageerror", e => errs.push(String(e)));
    if (process.env.THREE_DIR) await p.route("https://unpkg.com/three@0.160.0/**", r => r.fulfill({ path: path.join(process.env.THREE_DIR, r.request().url().split("three@0.160.0/")[1]), contentType: "application/javascript" }));
    await p.goto("http://127.0.0.1:8784/index.html?stub=1");
    await p.click("#btnTour"); await p.waitForSelector(".tour h2");
    const state = () => p.evaluate(() => ({ n: document.querySelector(".tour-n").textContent, title: document.querySelector(".tour h2").textContent, hl: [...document.querySelectorAll(".tour-hl")].map(e => e.id || e.className),
      task: document.querySelector(".tour-task").hidden ? null : document.querySelector(".tour-task b").textContent,
      covered: (() => { const c = document.querySelector(".tour").getBoundingClientRect(), t = document.querySelector(".tour-hl").getBoundingClientRect(); const ox = Math.max(0, Math.min(c.right, t.right) - Math.max(c.left, t.left)), oy = Math.max(0, Math.min(c.bottom, t.bottom) - Math.max(c.top, t.top)); return +(ox * oy / (t.width * t.height)).toFixed(2); })() }));
    const next = async () => { await p.click(".tour-next"); await p.waitForTimeout(700); };
    const shot = async n => { if (process.env.SHOT_DIR) await p.screenshot({ path: path.join(process.env.SHOT_DIR, `tour-${n}.png`) }); };
    const done = () => p.waitForFunction(() => document.querySelector(".tour-task b").textContent === "Done", null, { timeout: 180000 });
    log.push(await state()); await shot(1); await next();                                     // 2 wake
    await p.click("#btnLoad"); await done(); log.push(await state()); await shot(2); await next();   // 3 tokens
    await p.click("#btnGen"); await done(); log.push(await state()); await shot(3); await next();    // 4 odds
    await p.click('.tok[data-i="20"]'); await done(); log.push(await state()); await shot(4); await next(); // 5 layers
    log.push(await state()); await shot(5); await next();                                     // 6 neurons
    await p.evaluate(() => { const c = window.cloud; c.onPick && 0; });
    const box = await p.locator("#cloud canvas").boundingBox(); let picked = false;
    for (let y = 0.25; y < 0.8 && !picked; y += 0.03) for (let x = 0.35; x < 0.65 && !picked; x += 0.02) { await p.mouse.click(box.x + box.width * x, box.y + box.height * y); picked = await p.evaluate(() => !document.getElementById("nTitle").hidden); }
    await done(); log.push(await state()); await shot(6); await next();                       // 7 word map
    await p.fill("#wmLayer", "3"); await p.dispatchEvent("#wmLayer", "input"); await done(); log.push(await state()); await shot(7); await next(); // 8 surgery
    await p.click('#brain .cell[data-k="L5.mlp"]'); await p.click("#btnApply"); await done(); log.push(await state()); await shot(8); await next();  // 9 limits
    log.push(await state()); await shot(9);
    await p.click(".tour-next"); const closed = await p.evaluate(() => document.querySelector(".tour").hidden && !document.querySelector(".tour-hl"));
    for (const l of log) console.log(JSON.stringify(l));
    fail = log.length !== 9 || log.some(l => !l.hl.length || l.covered > 0.35) || log.filter(l => l.task === "Done").length !== 6 || !closed || errs.length > 0;
    console.log("closed:", closed, "errors:", errs.slice(0, 3));
  } catch (e) { for (const l of log) console.log(JSON.stringify(l)); console.log("FAIL", e.message.slice(0, 300)); fail = true; }
  await b.close(); srv.kill(); console.log(fail ? "FAIL tour" : "PASS tour"); process.exit(fail ? 1 : 0);
})();
