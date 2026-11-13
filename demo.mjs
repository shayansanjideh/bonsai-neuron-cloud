// Scripted demo for screen recording, loaded only with ?demo. It zooms the page so the cloud and the text fit one screen,
// wakes the model, then waits for "Start demo" and clicks through generate, a word, a neuron and surgery with a drawn cursor.
const Z = 0.82, $ = id => document.getElementById(id), W = ms => new Promise(r => setTimeout(r, ms));
document.documentElement.style.zoom = Z; dispatchEvent(new Event("resize"));
$("btnTour").parentElement.hidden = true;

const c = document.createElement("div");
c.style.cssText = "position:fixed;left:700px;top:500px;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;background:rgba(18,22,26,.28);border:2px solid #12161a;z-index:99;pointer-events:none;opacity:0;transition:left .7s cubic-bezier(.3,.1,.2,1),top .7s cubic-bezier(.3,.1,.2,1),transform .15s,opacity .3s";
document.body.appendChild(c);
const to = async (x, y) => { c.style.left = x / Z + "px"; c.style.top = y / Z + "px"; await W(760); };
const tap = async () => { c.style.transform = "scale(.6)"; await W(140); c.style.transform = "scale(1)"; };
const click = async el => { const r = el.getBoundingClientRect(); await to(r.left + r.width / 2, r.top + r.height / 2); await tap(); el.click(); await W(120); };
const idle = async cap => { await W(1200); let n = -1; for (let i = 0; i < cap * 4; i++) { await W(250); const t = document.querySelectorAll(".tok").length; if (!$("btnGen").disabled && t === n) return; n = t; } };
const word = re => [...document.querySelectorAll("#out .tok:not(.pr)")].find(e => re.test(e.textContent));

async function run() {
  scrollTo(0, 0); c.style.opacity = 1; await W(900);
  await click($("btnGen")); await idle(16); await W(600);
  await click(word(/Eiff|Tokyo/) || word(/\w{4}/)); await W(2300);
  await click(word(/banana/i) || word(/Japan/) || word(/\w{5}/)); await W(2000);
  // click the most active neuron on this word, at the place it is drawn
  const cloud = window.cloud, t = window.cloudState.toks[+document.querySelector(".tok.cur").dataset.i]; let best = 0;
  for (let s = 0; s < t.z.length; s++) if (t.z[s] > t.z[best]) best = s;
  const pa = cloud.points.geometry.attributes.position, v = cloud.camera.position.clone().set(pa.getX(best), pa.getY(best), pa.getZ(best)).project(cloud.camera), b = cloud.renderer.domElement.getBoundingClientRect();
  await to(b.left + (v.x + 1) / 2 * b.width, b.top + (1 - v.y) / 2 * b.height); await tap(); cloud.pickNeuron(best); await W(3000);
  scrollBy({ top: ($("surgery").getBoundingClientRect().bottom - innerHeight + 14) / Z, behavior: "smooth" }); await W(1300);
  for (const k of ["L0.mlp", "L1.mlp", "L2.mlp"]) { await click(document.querySelector(`#brain .cell[data-k="${k}"]`)); await W(150); }
  await W(500); await click($("btnApply")); await W(2500);
  for (let i = 0; i < 80; i++) { await W(250); if (!$("btnGen").disabled && /\(/.test($("mLoss").textContent)) break; }
  await idle(4); await W(2500); c.style.opacity = 0; await W(1500);
  note.textContent = "Demo finished. You can stop recording."; note.hidden = false;
}

const note = document.createElement("button");
note.style.cssText = "position:fixed;right:24px;bottom:24px;z-index:100;font-size:20px;padding:16px 26px;background:#ff5a1f;color:#fff;border:1px solid #12161a;box-shadow:0 3px 0 #12161a";
note.textContent = "Waking the model…"; note.disabled = true; document.body.appendChild(note);
if ($("btnGen").disabled && !$("btnLoad").disabled) $("btnLoad").click();
while ($("btnGen").disabled) await W(300);
note.textContent = "▶ Start demo"; note.disabled = false;
note.onclick = () => { note.hidden = true; note.onclick = null; setTimeout(run, 1500); };
