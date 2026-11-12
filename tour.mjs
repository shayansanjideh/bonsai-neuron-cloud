// Guided tour for people new to language models. It only reads the page (ids and classes that index.html and
// neurons-page.mjs already use), so it can be removed without touching anything else. Open with ?tour to start at once.
const $ = id => document.getElementById(id);
const loaded = () => !$("btnGen").disabled || !!document.querySelector("#out .tok");
const wrote = () => document.querySelectorAll("#out .tok:not(.pr)").length > 3 && !$("btnGen").disabled;

const STEPS = [
  { at: ".top", title: "What you're about to see",
    body: `<p>Bonsai is a <b>language model</b>, the same kind of program as ChatGPT or Claude, only much smaller. It does one thing: given some text, it guesses what comes next, one small piece at a time.</p>
<p>Everything it knows is stored in about two billion numbers called <b>weights</b>. This page runs the model on your own computer's graphics chip, which is what lets us look inside while it works.</p>
<p class="aside"><b>Why "1.58-bit"?</b> Most models store each weight as a detailed decimal. Bonsai's weights can only be −1, 0 or +1. Three choices take about 1.58 bits to store, and that is why the whole model fits in a 429 MB download.</p>` },
  { at: ".top", title: "Wake it up",
    body: `<p>Your browser downloads the weights once and keeps them for next time, then loads them onto your graphics chip.</p>
<p>After that the page has Bonsai read a short warm-up text. That teaches the page each neuron's <b>usual level</b>, so later it can show you which ones are unusually active.</p>
<p class="aside">No suitable graphics chip? The <a href="?stub=1&tour">test model</a> lets you follow the tour with made-up numbers.</p>`,
    task: "Press “Wake Bonsai” at the top right and wait for Status to say Ready.", done: loaded },
  { at: "#figWrite", title: "Tokens: how it reads and writes",
    body: `<p>A model doesn't see letters or whole words. Text is cut into <b>tokens</b>. A common word is one token; a rarer word is split into pieces, so “Eiffel” arrives as “Eiff” and “el”.</p>
<p>The grey text is your <b>prompt</b>. The dark text is what Bonsai writes, one token at a time. Each token it writes is added to the text and fed back in to help guess the next one. That loop is all that “writing” is.</p>`,
    task: "Press Generate and wait for it to finish.", done: wrote },
  { at: "#figNext", title: "It only ever guesses",
    body: `<p>For each token, what the model really produces is a list of <b>odds</b> for every token it knows. This panel shows the top five at the selected word, so you can see what it nearly said instead.</p>
<p><b>Temperature</b> decides how the pick is made. At 0 it always takes the top guess, so you get the same answer every time. Higher values roll dice weighted by these odds, which is why chatbots can answer the same question differently.</p>`,
    task: "Click any word in the text on the left and watch the odds change.", done: s => s.clicked },
  { at: "#figCloud", title: "Layers: the path each word takes",
    body: `<p>To make one guess, the current token is turned into a list of numbers and passed up through <b>24 layers</b>, bottom to top. The ruler on the left counts them, L00 to L23.</p>
<p>Every layer has two parts. A <b>mixer</b> lets the word pull in information from the words before it (the best-known kind of mixer is called attention). An <b>MLP</b> then works on what was gathered. Each ring in this cloud is one layer's MLP.</p>
<p>The orange line follows where the activity is strongest in each layer for the selected word.</p>`,
    task: "Drag the cloud to turn it. Scroll inside it with two fingers pinched to zoom." },
  { at: "#figCloud", also: "#nbox", side: "left", title: "Neurons: the dots",
    body: `<p>A <b>neuron</b> is just one number that a layer computes for the current token. Each layer here has 6,144 of them. The page shows the 192 per layer that vary the most.</p>
<p>A dot turns <b style="color:#ff5a1f">orange</b> when its neuron is far above its usual level on this word, and teal when it is below.</p>
<p>Some neurons have an obvious taste, such as punctuation or place names. Many have no meaning a person can name, and that is normal.</p>`,
    task: "Click a dot. Fig. 03 on the right then shows that neuron across the whole text, and the words that excite it most.", done: () => !$("nTitle").hidden },
  { at: "#figMap", title: "The word map",
    body: `<p>Between layers, each token is carried as a long list of numbers. Think of it as the model's working notes on that word so far.</p>
<p>This figure squashes those lists down to two dimensions so you can see them. Words the model is treating alike land close together.</p>
<p>In low layers the notes are mostly about spelling and position. Higher up they are more about meaning, so the groups rearrange.</p>`,
    task: "Drag the slider from layer 0 up to 23 and watch the groups move.", done: s => s.slid },
  { at: "#surgery", align: "start", wide: true, title: "Surgery: break it on purpose",
    body: `<p>Because the model sits in your own graphics memory, we can damage it and see what happens. Each cell is one block: 24 mixers on the top row, 24 MLPs below.</p>
<p>Click a cell to switch that block off. The page then rewrites the text with the block silent.</p>
<p><b>Loss</b> measures the damage. It is how surprised the model is, on average, by a paragraph of easy facts. Higher means it got dumber.</p>
<p class="aside">Try the mixer of layer 0, which hurts a lot. Then restore and try a block in the middle, which often barely matters. Models are oddly robust in places.</p>`,
    task: "Switch one block off and read the rewritten text above. Press “Restore all” when you're done.", done: s => s.cut },
  { at: "#notes", title: "What this does and doesn't show",
    body: `<p>You have now seen the whole loop: tokens in, 24 layers of mixing and processing, odds out, pick one, repeat.</p>
<p>Three honest limits:</p>
<ul><li>The cloud shows 4,608 neurons out of 147,456. It is a sample.</li>
<li>The thin lines join neurons that tend to fire together. They are not the model's wiring.</li>
<li>Nobody fully understands what most of these numbers mean, including the people who build the models. Working that out is a research field called <b>interpretability</b>.</li></ul>
<p>From here, change the prompt, raise the temperature, or follow one neuron through different sentences.</p>` },
];

let i = 0, card, timer;
const seen = { clicked: false, slid: false, cut: false };
document.addEventListener("click", e => { if (e.target.closest?.("#out .tok")) seen.clicked = true; if (e.target.closest?.("#brain .cell")) seen.cut = true; }, true);
document.addEventListener("input", e => { if (e.target.id === "wmLayer") seen.slid = true; }, true);

function clear() { document.querySelectorAll(".tour-hl").forEach(e => e.classList.remove("tour-hl")); }
function show(n, scroll = true) {
  i = Math.max(0, Math.min(STEPS.length - 1, n)); const s = STEPS[i]; clear();
  const els = [s.at, s.also].filter(Boolean).map(q => document.querySelector(q)).filter(Boolean);
  els.forEach(e => e.classList.add("tour-hl"));
  card.querySelector(".tour-n").textContent = `${i + 1} / ${STEPS.length}`;
  card.querySelector("h2").textContent = s.title;
  card.querySelector(".tour-body").innerHTML = s.body;
  card.querySelector(".tour-task").hidden = !s.task;
  card.querySelector(".tour-task span").textContent = s.task || "";
  card.querySelector(".tour-back").disabled = i === 0;
  card.querySelector(".tour-next").textContent = i === STEPS.length - 1 ? "Finish" : "Next";
  card.classList.toggle("wide", !!s.wide); card.scrollTop = 0; tick();
  if (els[0]) {
    const r = els[0].getBoundingClientRect();
    card.classList.toggle("left", s.side ? s.side === "left" : r.left + r.width / 2 > innerWidth * 0.55);   // keep the card off the panel it explains
    if (scroll) els[0].scrollIntoView({ block: s.align || (r.height > innerHeight * 0.8 ? "start" : "center"), behavior: matchMedia("(prefers-reduced-motion:reduce)").matches ? "auto" : "smooth" });
  }
  try { sessionStorage.setItem("tourStep", String(i)); } catch {}
}
function tick() {
  if (!card || card.hidden) return; const s = STEPS[i], t = card.querySelector(".tour-task");
  const ok = !!(s.done && s.done(seen)); t.classList.toggle("ok", ok); t.querySelector("b").textContent = ok ? "Done" : "Try it";
}
function start(n = 0) {
  if (!card) {
    card = document.createElement("aside"); card.className = "tour"; card.setAttribute("aria-label", "Guided tour"); card.setAttribute("aria-live", "polite");
    card.innerHTML = `<div class="tour-hd"><span class="tour-n"></span><button class="tour-x ghost" aria-label="Close the tour">Close</button></div>
<h2></h2><div class="tour-body"></div><div class="tour-task"><b>Try it</b><span></span></div>
<div class="tour-ft"><button class="tour-back">Back</button><button class="tour-next primary">Next</button></div>`;
    document.body.appendChild(card);
    card.querySelector(".tour-x").onclick = stop;
    card.querySelector(".tour-back").onclick = () => show(i - 1);
    card.querySelector(".tour-next").onclick = () => i === STEPS.length - 1 ? stop() : show(i + 1);
    document.addEventListener("keydown", e => { if (e.key === "Escape" && !card.hidden) stop(); });
  }
  card.hidden = false; document.body.classList.add("touring"); $("btnTour").textContent = "End the tour"; show(n); clearInterval(timer); timer = setInterval(tick, 500);
}
function stop() { card.hidden = true; document.body.classList.remove("touring"); clear(); clearInterval(timer); $("btnTour").textContent = "Take the tour"; try { sessionStorage.removeItem("tourStep"); } catch {} }

$("btnTour").onclick = () => card && !card.hidden ? stop() : start(0);
let resume = null; try { resume = sessionStorage.getItem("tourStep"); } catch {}
if (resume !== null) start(+resume || 0); else if (new URLSearchParams(location.search).has("tour")) start(0);
window.tour = { start, stop, show, steps: STEPS.length };
