/* La Culla della Luna – comportamento del tema: filtri per pietra, scheda rapida, carrello, riflesso, luna. */
(() => {
  const STONE_COLORS = {
    "Labradorite": "#6f93a6", "Adularia": "#e8e2d6", "Quarzo": "#e2b34a", "Pietra del sole": "#e07a3a",
    "Acquamarina": "#93d6e2", "Larimar": "#7cc6e8", "Ametista": "#8e5bc7", "Turchese": "#3fb7b0",
    "Lapislazzuli": "#2c4fb0", "Ossidiana": "#5b4a33", "Cianite": "#4d8f6a", "Crisocolla": "#2fa39a",
    "Angelite": "#a9bfe6", "Corniola": "#c9522a", "Ematite": "#5a5a62", "Giada": "#4f9a6a", "Opale": "#d8e6f0",
  };
  const FAMILIES = Object.keys(STONE_COLORS).sort((a, b) => b.length - a.length);
  const family = stone => {
    const s = (stone || "").toLowerCase();
    return FAMILIES.find(f => s.includes(f.toLowerCase())) || (stone ? stone.split(" ")[0] : "");
  };
  const money = cents => new Intl.NumberFormat(theme.locale || "it", { style: "currency", currency: theme.currency || "EUR" }).format(cents / 100);

  // ---------- filtri ----------
  document.querySelectorAll("[data-shop]").forEach(shop => {
    const grid = shop.querySelector("[data-grid]");
    const filters = shop.querySelector("[data-filters]");
    if (!grid || !filters) return;
    const cards = [...grid.querySelectorAll("[data-card]")];
    cards.forEach(c => (c.dataset.fam = family(c.dataset.stone)));
    // prima i disponibili, mantenendo l'ordine del negozio
    cards.filter(c => c.dataset.avail === "true").concat(cards.filter(c => c.dataset.avail !== "true")).forEach(c => grid.appendChild(c));

    const st = { kind: "", fam: "", avail: false };
    const stonesEl = filters.querySelector("[data-stones]");
    const availBtn = filters.querySelector("[data-avail-toggle]");
    const counts = {};
    cards.forEach(c => { if (c.dataset.fam) counts[c.dataset.fam] = (counts[c.dataset.fam] || 0) + 1; });
    const chip = (fam, label, n) => {
      const b = document.createElement("button");
      b.type = "button"; b.dataset.fam = fam;
      b.style.setProperty("--c", STONE_COLORS[fam] || "#999");
      b.innerHTML = (fam ? "<i></i>" : "") + label + (n ? ` <small>${n}</small>` : "");
      b.addEventListener("click", () => { st.fam = st.fam === fam ? "" : fam; render(); });
      stonesEl.appendChild(b);
    };
    chip("", "Tutte le pietre");
    Object.entries(counts).sort((a, b) => b[1] - a[1]).forEach(([f, n]) => chip(f, f, n));
    filters.querySelectorAll("[data-kind]").forEach(b => b.addEventListener("click", () => { st.kind = b.dataset.kind; render(); }));
    availBtn.addEventListener("click", () => { st.avail = !st.avail; render(); });

    const countEl = shop.querySelector("[data-count]");
    const emptyEl = shop.querySelector("[data-empty]");
    function render() {
      filters.querySelectorAll("[data-kind]").forEach(b => b.setAttribute("aria-pressed", b.dataset.kind === st.kind));
      stonesEl.querySelectorAll("[data-fam]").forEach(b => b.setAttribute("aria-pressed", b.dataset.fam === st.fam));
      availBtn.setAttribute("aria-pressed", st.avail);
      let shown = 0, free = 0;
      cards.forEach(c => {
        const ok = (!st.kind || c.dataset.kind === st.kind) && (!st.fam || c.dataset.fam === st.fam) && (!st.avail || c.dataset.avail === "true");
        c.hidden = !ok;
        if (ok) { shown++; if (c.dataset.avail === "true") free++; }
      });
      if (countEl) countEl.textContent = `${shown} ${shown === 1 ? "pezzo" : "pezzi"} · ${free} ${free === 1 ? "disponibile" : "disponibili"}`;
      if (emptyEl) emptyEl.hidden = shown > 0 || !cards.length;
    }
    render();
  });

  // ---------- carrello ----------
  const setCount = n => document.querySelectorAll("[data-cart-count]").forEach(el => (el.textContent = n));
  async function addToCart(id) {
    const r = await fetch(theme.cartAdd + ".js", {
      method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ items: [{ id, quantity: 1 }] }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.description || data.message || "Non è stato possibile aggiungere il pezzo.");
    const cart = await (await fetch(theme.cartUrl + ".js", { headers: { Accept: "application/json" } })).json();
    setCount(cart.item_count);
  }

  // ---------- scheda rapida ----------
  const sheet = document.querySelector("[data-sheet]");
  if (sheet && sheet.showModal) {
    const $ = s => sheet.querySelector(s);
    const addBtn = $("[data-sheet-add]"), cartLink = $("[data-sheet-cart]"), msg = $("[data-sheet-msg]");
    let variantId = null;

    document.addEventListener("click", async e => {
      const card = e.target.closest("[data-card]");
      if (!card || e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return;
      e.preventDefault();
      let p;
      try { p = await (await fetch(card.getAttribute("href").split("?")[0] + ".js", { headers: { Accept: "application/json" } })).json(); }
      catch { location.href = card.href; return; }
      const imgs = (p.images || []).slice(0, 6);
      const sized = src => src + (src.includes("?") ? "&" : "?") + "width=900";
      $("[data-sheet-pics]").innerHTML = imgs.map(src => `<img src="${sized(src)}" width="900" height="900" alt="">`).join("");
      $("[data-sheet-dots]").innerHTML = imgs.length > 1 ? imgs.map(() => "<i></i>").join("") : "";
      const desc = (p.description || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").replace("Aduaria", "Adularia").replace("nicel.", "nichel.").trim();
      const metal = /placcat\w* oro/i.test(desc) ? " · Oro 14k" : /argento/i.test(desc) ? " · Argento" : "";
      $("[data-sheet-kind]").textContent = p.title + metal;
      $("[data-sheet-title]").textContent = card.dataset.stone || p.title;
      $("[data-sheet-price]").textContent = money(p.price) + (p.available ? "" : " · venduto");
      $("[data-sheet-list]").innerHTML = desc.split(/\.\s+/).map(s => s.replace(/\.$/, "").trim()).filter(Boolean)
        .map(s => `<li>${s.replace(/</g, "&lt;")}</li>`).join("");
      $("[data-sheet-link]").href = card.href;
      const v = (p.variants || []).find(x => x.available);
      variantId = v ? v.id : null;
      addBtn.hidden = !variantId; addBtn.disabled = false; addBtn.textContent = "Aggiungi al carrello";
      cartLink.hidden = true; msg.textContent = p.available ? "" : "Questo pezzo è stato venduto. Scrivi ad Alessia per uno simile.";
      sheet.showModal(); sheet.scrollTop = 0;
    });

    addBtn.addEventListener("click", async () => {
      if (!variantId) return;
      addBtn.disabled = true; addBtn.textContent = "Aggiungo…";
      try {
        await addToCart(variantId);
        addBtn.textContent = "Aggiunto al carrello"; cartLink.hidden = false; msg.textContent = "";
      } catch (err) {
        addBtn.disabled = false; addBtn.textContent = "Aggiungi al carrello"; msg.textContent = err.message;
      }
    });
    $("[data-sheet-close]").addEventListener("click", () => sheet.close());
    sheet.addEventListener("click", e => { if (e.target === sheet) sheet.close(); });
  }

  // ---------- copia email ----------
  document.querySelectorAll("[data-copy-email]").forEach(btn => btn.addEventListener("click", () => {
    const el = btn.parentElement.querySelector("[data-email]");
    const select = () => { const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent = "Selezionata"; };
    try { navigator.clipboard.writeText(el.textContent.trim()).then(() => { btn.textContent = "Copiata"; setTimeout(() => (btn.textContent = "Copia"), 1800); }, select); }
    catch { select(); }
  }));

  // ---------- riflesso sulla pietra ----------
  document.querySelectorAll("[data-glint-area]").forEach(area => {
    const set = (x, y) => { area.style.setProperty("--gx", Math.max(-1, Math.min(1, x)).toFixed(3)); area.style.setProperty("--gy", Math.max(-1, Math.min(1, y)).toFixed(3)); };
    const aim = e => { const r = area.getBoundingClientRect(); set(((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * 2 - 1); };
    area.addEventListener("pointermove", aim);
    area.addEventListener("pointerdown", aim);
    area.addEventListener("pointerleave", () => set(0, 0));
    addEventListener("deviceorientation", e => { if (e.gamma != null) set(e.gamma / 30, (e.beta - 45) / 30); });
  });

  // ---------- la luna di stanotte ----------
  const moonText = document.querySelector("[data-moon-text]");
  const moonIcon = document.querySelector("[data-moon-icon]");
  if (moonText && moonIcon) {
    const P = 29.530588853, ref = Date.UTC(2000, 0, 6, 18, 14) / 864e5;
    const age = (((Date.now() / 864e5 - ref) % P) + P) % P;
    const f = (1 - Math.cos((2 * Math.PI * age) / P)) / 2;
    const names = ["Luna nuova", "Luna crescente", "Primo quarto", "Gibbosa crescente", "Luna piena", "Gibbosa calante", "Ultimo quarto", "Luna calante"];
    moonText.textContent = `Stanotte: ${names[Math.floor((age / P) * 8 + .5) % 8]} · ${Math.round(f * 100)}%`;
    const x = moonIcon.getContext("2d"), R = 14;
    x.translate(16, 16);
    x.fillStyle = "rgba(255,255,255,.18)"; x.beginPath(); x.arc(0, 0, R, 0, 7); x.fill();
    const waxing = age < P / 2, k = Math.cos((2 * Math.PI * age) / P);
    x.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--bone").trim() || "#f0e8d3";
    x.beginPath();
    x.arc(0, 0, R, -Math.PI / 2, Math.PI / 2, !waxing);
    x.ellipse(0, 0, Math.abs(k) * R, R, 0, Math.PI / 2, -Math.PI / 2, (k > 0) === waxing);
    x.fill();
  }
})();
