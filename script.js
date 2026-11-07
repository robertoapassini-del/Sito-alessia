// Le pietre: colori (light, mid, deep, glow) e testo.
// Modifica liberamente nomi e descrizioni con quelle usate da Alessia.
const STONES = [
  { id: "labradorite", name: "Labradorite", colors: ["#9fe3ff", "#1f6fd1", "#0a1c3d", "#2fa8ff"],
    text: "Scura a prima vista, poi la giri e si accende di lampi blu elettrico. Basta inclinare il telefono." },
  { id: "luna", name: "Pietra di luna", colors: ["#f4f6ff", "#c9d3ea", "#7f8fb8", "#8fd0ff"],
    text: "Lattiginosa, con quel riflesso azzurro che si muove quando la luce cambia." },
  { id: "ametista", name: "Ametista", colors: ["#efd6ff", "#a46ad6", "#4a1f78", "#c58bff"],
    text: "Un viola profondo e calmo, tra le pietre più amate di sempre." },
  { id: "quarzo", name: "Quarzo rosa", colors: ["#fff0f3", "#f2b8c6", "#b46a82", "#ff9fbf"],
    text: "Un rosa delicato e tenero, la pietra dell'affetto." },
  { id: "turchese", name: "Turchese", colors: ["#d9fbf6", "#45c2c0", "#126d7a", "#5ff0e6"],
    text: "Il colore del mare quando è basso e chiaro, venato come una mappa." },
  { id: "corniola", name: "Corniola", colors: ["#ffe1c7", "#e57a3c", "#8a2e12", "#ff9a5a"],
    text: "Arancio caldo, come la luce del tramonto d'estate." },
  { id: "onice", name: "Onice", colors: ["#9aa0b5", "#2a2d3a", "#07080d", "#7b86b8"],
    text: "Nero lucido ed essenziale: fa brillare l'oro intorno." },
];

// Pezzi della galleria (segnaposto finché non ci sono le foto vere).
const PIECES = [
  { stone: "labradorite", title: "Ciondolo", note: "Labradorite, intreccio in filo argentato" },
  { stone: "luna", title: "Ciondolo", note: "Pietra di luna, filo dorato" },
  { stone: "ametista", title: "Orecchini", note: "Ametista, filo argentato" },
  { stone: "quarzo", title: "Anello", note: "Quarzo rosa, filo dorato" },
  { stone: "turchese", title: "Collana", note: "Turchese, filo argentato" },
];

const root = document.documentElement;
const byId = (id) => STONES.find((s) => s.id === id);
const gemVars = (s) =>
  `--l:${s.colors[0]};--m:${s.colors[1]};--d:${s.colors[2]};--g:${s.colors[3]}`;

const stage = document.getElementById("heroStage");
const heroName = document.getElementById("heroStoneName");
const rail = document.getElementById("stoneRail");
const title = document.getElementById("stoneTitle");
const text = document.getElementById("stoneText");

let current = 0;

function setStone(i, { scrollChip = true } = {}) {
  current = (i + STONES.length) % STONES.length;
  const s = STONES[current];
  ["--st-light", "--st-mid", "--st-deep", "--st-glow"].forEach((v, k) =>
    root.style.setProperty(v, s.colors[k])
  );
  heroName.textContent = s.name;
  title.textContent = s.name;
  text.textContent = s.text;
  rail.querySelectorAll(".chip").forEach((c, k) => {
    c.setAttribute("aria-selected", k === current ? "true" : "false");
    if (k === current && scrollChip) c.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  });
  stage.classList.remove("pulse");
  void stage.offsetWidth;
  stage.classList.add("pulse");
}

// rail delle pietre
STONES.forEach((s, i) => {
  const b = document.createElement("button");
  b.className = "chip";
  b.type = "button";
  b.setAttribute("role", "option");
  b.style.cssText = gemVars(s);
  b.innerHTML = `<span class="gem"></span>${s.name}`;
  b.addEventListener("click", () => setStone(i));
  rail.appendChild(b);
});

// galleria
const gallery = document.getElementById("galleryRail");
PIECES.forEach((p) => {
  const s = byId(p.stone);
  const f = document.createElement("figure");
  f.className = "piece";
  f.style.cssText = gemVars(s);
  f.innerHTML = `<div class="ph"><span></span></div><figcaption><b>${p.title}</b><small>${p.note}</small></figcaption>`;
  gallery.appendChild(f);
});

// raggi in filo intrecciato intorno al castone (come un piccolo sole)
const rays = document.getElementById("rays");
const NS = "http://www.w3.org/2000/svg";
for (let k = 0; k < 44; k++) {
  const a = (k / 44) * Math.PI * 2;
  const r1x = 90, r1y = 110, len = k % 2 ? 9 : 16;
  const x1 = 150 + Math.cos(a) * r1x, y1 = 140 + Math.sin(a) * r1y;
  const x2 = 150 + Math.cos(a) * (r1x + len), y2 = 140 + Math.sin(a) * (r1y + len);
  const cx = (x1 + x2) / 2 + Math.cos(a + Math.PI / 2) * 4;
  const cy = (y1 + y2) / 2 + Math.sin(a + Math.PI / 2) * 4;
  const p = document.createElementNS(NS, "path");
  p.setAttribute("d", `M${x1.toFixed(1)} ${y1.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`);
  p.setAttribute("stroke-width", k % 2 ? 1.6 : 2.2);
  rays.appendChild(p);
}

// filo argento / oro
document.querySelectorAll("[data-metal]").forEach((b) =>
  b.addEventListener("click", () => {
    root.dataset.metal = b.dataset.metal;
    document.querySelectorAll("[data-metal]").forEach((o) => o.setAttribute("aria-pressed", o === b));
  })
);

// tocca la pietra grande → passa alla successiva; swipe orizzontale → avanti/indietro
let startX = null;
stage.addEventListener("pointerdown", (e) => { startX = e.clientX; });
stage.addEventListener("pointerup", (e) => {
  if (startX === null) return;
  const dx = e.clientX - startX;
  startX = null;
  if (Math.abs(dx) > 40) setStone(current + (dx < 0 ? 1 : -1), { scrollChip: false });
  else setStone(current + 1, { scrollChip: false });
});

// riflesso della pietra che segue il dito / il mouse / l'inclinazione del telefono
function tilt(x, y) {
  root.style.setProperty("--tilt-x", Math.max(-1, Math.min(1, x)).toFixed(3));
  root.style.setProperty("--tilt-y", Math.max(-1, Math.min(1, y)).toFixed(3));
}
window.addEventListener("pointermove", (e) => {
  tilt((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1);
});
function onOrient(e) {
  if (e.gamma == null) return;
  tilt(e.gamma / 30, (e.beta - 45) / 30);
}
if (window.DeviceOrientationEvent) {
  if (typeof DeviceOrientationEvent.requestPermission === "function") {
    // iOS: il permesso va chiesto dopo un tocco
    document.addEventListener("click", function ask() {
      DeviceOrientationEvent.requestPermission()
        .then((r) => r === "granted" && addEventListener("deviceorientation", onOrient))
        .catch(() => {});
      document.removeEventListener("click", ask);
    });
  } else {
    addEventListener("deviceorientation", onOrient);
  }
}
// senza sensori il riflesso ondeggia da solo
let t = 0;
let idle = true;
addEventListener("pointermove", () => (idle = false), { once: true });
addEventListener("deviceorientation", (e) => { if (e.gamma != null) idle = false; }, { once: true });
(function drift() {
  if (idle) { t += 0.012; tilt(Math.sin(t) * 0.6, Math.cos(t * 0.8) * 0.4); }
  requestAnimationFrame(drift);
})();

// comparsa allo scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => en.isIntersecting && en.target.classList.add("in"));
}, { threshold: 0.15 });
document.querySelectorAll("section:not(.hero) > *").forEach((el) => {
  el.classList.add("reveal");
  io.observe(el);
});

setStone(0, { scrollChip: false });
