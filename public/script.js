/* =========================================================
   Lutri Eszpresszó – adatok és mozgás
   ========================================================= */

/* ---------- Adatok: ezeket kell módosítani, ha valami változik ---------- */
const SHOP = {
  name: "Lutri Eszpresszó",
  // Ha phone null, a weboldal nem mutatja a hívás gombokat. Formátum: "+36 30 123 4567"
  phone: null,
  // Ha facebook null, a Facebook-linkek eltűnnek
  facebook: "https://www.facebook.com/p/Lutri-S%C3%B6r%C3%B6z%C5%91-B%C3%A9k%C3%A1smegyer-100066663197809/",
  address: "1039 Budapest, Heltai Jenő tér 2.",
  // Az időjáráshoz (Békásmegyer)
  lat: 47.60,
  lon: 19.05,
  // Nyitvatartás napokra bontva (0 = vasárnap … 6 = szombat); null = zárva
  hours: {
    1: ["07:00", "23:00"],
    2: ["07:00", "23:00"],
    3: ["07:00", "23:00"],
    4: ["07:00", "23:00"],
    5: ["07:00", "23:00"],
    6: ["07:00", "23:00"],
    0: ["09:00", "23:00"],
  },
};

// A kaparós sorsjegy tippjei napszak szerint
const TIPS = {
  morning: [
    { t: "Egy dupla eszpresszó", d: "Piac előtt, piac után — vagy helyette." },
    { t: "Cappuccino a teraszon", d: "Nézd, ahogy ébred a piac." },
    { t: "Hosszú kávé, lassan", d: "Ma nem sietsz sehova." },
    { t: "Eszpresszó és egy pohár szóda", d: "A pesti presszók óta a legjobb páros." },
  ],
  afternoon: [
    { t: "Egy hosszúlépés", d: "Egy deci bor, két deci szóda, sok napsütés." },
    { t: "Nagyfröccs a napernyő alatt", d: "Két deci bor, egy deci szóda, semmi sietség." },
    { t: "Egy pohár csapolt Kronenbourg", d: "Mert délután is lehet." },
    { t: "Egy gyors eszpresszó", d: "Délutáni feltöltődés, két korty alatt." },
  ],
  evening: [
    { t: "Egy korsó Kronenbourg", d: "Hidegen csapolva, a meccs mellé." },
    { t: "Egy kör a győztesre", d: "Ha nyer a csapat. Ha nem, akkor a vigaszra." },
    { t: "Egy házmester", d: "Három deci bor, két deci szóda — komoly este." },
    { t: "Egy alkoholmentes sör", d: "Vezetsz? A hangulat így is jár." },
  ],
  hot: [
    { t: "Sportfröccs, jéghidegen", d: "Egy deci bor, négy deci szóda — kánikulára." },
    { t: "Egy hosszúlépés árnyékban", d: "A legnagyobb napernyő alatt." },
  ],
};

// Fröccsiskola: bor és szóda decilitterben
const SPRITZ = [
  { name: "Kisfröccs", wine: 1, soda: 1, note: "A klasszikus: fele bor, fele szóda." },
  { name: "Nagyfröccs", wine: 2, soda: 1, note: "Több bor, kevesebb szóda." },
  { name: "Hosszúlépés", wine: 1, soda: 2, note: "Könnyű és hosszú — kánikulára találták ki." },
  { name: "Házmester", wine: 3, soda: 2, note: "Fél liter, komoly arányban." },
  { name: "Viceházmester", wine: 2, soda: 3, note: "A házmester könnyedebb helyettese." },
  { name: "Háziúr", wine: 4, soda: 1, note: "Szinte csak bor, egy csepp szódával." },
  { name: "Sportfröccs", wine: 1, soda: 4, note: "Szinte csak szóda — edzés utánra." },
  { name: "Krúdy-fröccs", wine: 9, soda: 1, note: "Krúdy Gyula kedvence: majdnem egy liter bor." },
  { name: "Sóherfröccs", wine: 1, soda: 9, note: "Egy deci bor kilenc deci szódával — a spórolósoknak." },
];

const DAY_NAMES = ["Vasárnap", "Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat"];

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const store = {
  get(k) { try { return JSON.parse(sessionStorage.getItem(k)); } catch { return null; } },
  set(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch { /* privát mód */ } },
};

document.documentElement.classList.remove("no-js");
document.documentElement.classList.add("js");

/* ---------- Idő (budapesti idő szerint) ---------- */
function budapestNow() {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Budapest", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false,
    }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t).value;
    const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
    const minutes = (Number(get("hour")) % 24) * 60 + Number(get("minute"));
    if (day < 0 || Number.isNaN(minutes)) throw new Error("hiányos időzóna-adat");
    return { day, minutes };
  } catch {
    // Tartalék: CET, nyári időszámítás március utolsó vasárnapjától október utolsó vasárnapjáig
    const now = new Date();
    const y = now.getUTCFullYear();
    const lastSunday = (month) => { const d = new Date(Date.UTC(y, month + 1, 0, 1)); d.setUTCDate(d.getUTCDate() - d.getUTCDay()); return d; };
    const summer = now >= lastSunday(2) && now < lastSunday(9);
    const t = new Date(now.getTime() + (summer ? 2 : 1) * 3600e3);
    return { day: t.getUTCDay(), minutes: t.getUTCHours() * 60 + t.getUTCMinutes() };
  }
}
const toMinutes = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
const fmt = (min) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
const shortHour = (hhmm) => String(Number(hhmm.split(":")[0]));

function openStatus() {
  const { day, minutes } = budapestNow();
  const today = SHOP.hours[day];
  if (today && minutes >= toMinutes(today[0]) && minutes < toMinutes(today[1])) {
    const left = toMinutes(today[1]) - minutes;
    return left <= 45
      ? { open: true, text: `Nyitva még ${left} percig`, short: `Még ${left} percig` }
      : { open: true, text: `Most nyitva · ${shortHour(today[1])} óráig`, short: `Nyitva ${shortHour(today[1])}-ig` };
  }
  if (today && minutes < toMinutes(today[0])) {
    return { open: false, text: `Zárva · ma ${shortHour(today[0])}-kor nyitunk`, short: `${shortHour(today[0])}-kor nyit`, next: `ma ${shortHour(today[0])}-kor` };
  }
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    if (SHOP.hours[d]) {
      const when = `${i === 1 ? "holnap" : DAY_NAMES[d].toLowerCase()} ${shortHour(SHOP.hours[d][0])}-kor`;
      return { open: false, text: `Zárva · ${when} nyitunk`, short: "Zárva", next: when };
    }
  }
  return { open: false, text: "Átmenetileg zárva", short: "Zárva", next: null };
}

const narrow = window.matchMedia("(max-width: 440px)");
function renderStatus() {
  const s = openStatus();
  $$("[data-status]").forEach((el) => {
    el.classList.toggle("is-open", s.open);
    el.classList.toggle("is-closed", !s.open);
    $("[data-status-text]", el).textContent = narrow.matches && el.closest(".nav") ? s.short : s.text;
  });
  return s;
}
narrow.addEventListener?.("change", renderStatus);

function renderHours() {
  const today = budapestNow().day;
  $("#hours").innerHTML = [1, 2, 3, 4, 5, 6, 0].map((d) => {
    const h = SHOP.hours[d];
    return `<li class="${d === today ? "is-today" : ""}"><span>${DAY_NAMES[d]}</span><span>${h ? `${h[0]} – ${h[1]}` : "Zárva"}</span></li>`;
  }).join("");
}

function renderGreeting() {
  const h = Math.floor(budapestNow().minutes / 60);
  const g = h >= 4 && h < 10 ? "Jó reggelt" : h >= 10 && h < 18 ? "Jó napot" : "Jó estét";
  $$("[data-greeting]").forEach((el) => (el.textContent = g));
}

function initContact() {
  if (SHOP.phone) {
    const tel = "tel:" + SHOP.phone.replace(/[^\d+]/g, "");
    $$("[data-phone-link]").forEach((a) => (a.href = tel));
    $$("[data-phone-text]").forEach((el) => (el.textContent = SHOP.phone));
  } else {
    $$("[data-phone-link]").forEach((a) => a.remove());
  }
  if (SHOP.facebook) {
    $$("[data-facebook-link]").forEach((a) => (a.href = SHOP.facebook));
  } else {
    $$("[data-facebook-link]").forEach((a) => a.remove());
  }
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  const share = $("[data-share]");
  if (share && navigator.share) {
    share.hidden = false;
    share.addEventListener("click", () => {
      navigator.share({ title: SHOP.name, text: `${SHOP.name} – ${SHOP.address}`, url: location.href.split("#")[0] }).catch(() => {});
    });
  }
}

/* ---------- Navigáció ---------- */
function initNav() {
  const nav = $(".nav");
  const toggle = $(".nav__toggle");
  const bar = $(".actionbar");
  const setOpen = (open) => {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
    bar?.classList.toggle("is-hidden", open);
  };
  toggle.addEventListener("click", () => setOpen(!nav.classList.contains("is-open")));
  $$(".nav__links a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });

  const hero = $(".hero");
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = window.scrollY;
    nav.classList.toggle("is-solid", y > 40);
    bar?.classList.toggle("is-visible", y > hero.offsetHeight * 0.55);
  };
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  // Az éppen látható szekció linkje kiemelve
  const links = new Map($$(".nav__links a").map((a) => [a.getAttribute("href").slice(1), a]));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.remove("is-active"));
      links.get(e.target.id)?.classList.add("is-active");
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  $$("main section[id]").forEach((s) => io.observe(s));
}

/* ---------- Beúszás görgetésre ---------- */
function initReveal() {
  const els = $$(".reveal");
  if (reduced || !("IntersectionObserver" in window)) { els.forEach((el) => el.classList.add("is-in")); return; }
  // Egymás melletti elemek kis késéssel jönnek
  $$(".features, .menu__grid, .voices__grid, .duo__grid").forEach((g) => $$(".reveal", g).forEach((el, i) => el.style.setProperty("--d", `${i * 0.08}s`)));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  els.forEach((el) => io.observe(el));
}

/* ---------- Neon cégér: kattintásra le- és felkapcsol ---------- */
function initSign() {
  const btn = $("[data-sign-switch]");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const off = document.documentElement.classList.toggle("sign-off");
    btn.setAttribute("aria-pressed", String(!off));
    if (!off) {
      // újra "felgyullad"
      $$(".sign__word span, .sign__sub").forEach((el) => { el.style.animation = "none"; void el.offsetWidth; el.style.animation = ""; });
    }
  });
}

/* ---------- Egy nap a Lutriban: élő idővonal ---------- */
function renderTimeline(status) {
  const tl = $("[data-timeline]");
  if (!tl) return;
  const stops = $$("li[data-at]", tl);
  const { minutes } = budapestNow();
  const times = stops.map((li) => toMinutes(li.dataset.at));
  const vertical = window.matchMedia("(max-width: 900px)").matches;
  const box = tl.getBoundingClientRect();
  const size = vertical ? box.height : box.width;
  // a pontok helye a sínen (px)
  const pos = stops.map((li) => {
    const r = li.getBoundingClientRect();
    return vertical ? r.top - box.top + 13 : r.left - box.left + 6;
  });

  let current = -1;
  times.forEach((t, i) => { if (minutes >= t) current = i; });
  stops.forEach((li, i) => {
    li.classList.toggle("is-past", status.open && i < current);
    li.classList.toggle("is-current", status.open && i === current);
  });

  let px = 0;
  if (status.open && current >= 0) {
    const i = Math.min(current, times.length - 2);
    const f = clamp((minutes - times[i]) / (times[i + 1] - times[i]));
    px = pos[i] + (pos[i + 1] - pos[i]) * f;
  }
  tl.style.setProperty("--progress", size ? (px / size).toFixed(4) : 0);
  tl.classList.toggle("is-live", status.open && current >= 0);

  const note = $("[data-day-note]");
  if (note) {
    if (status.open && current >= 0) {
      note.innerHTML = `Most ${fmt(minutes)} van a Lutriban — <b>${stops[current].querySelector("h3").textContent.toLowerCase()}</b>.`;
    } else if (status.next) {
      note.innerHTML = `Most zárva vagyunk — <b>${status.next}</b> újra várunk.`;
    } else {
      note.textContent = "";
    }
  }
}

/* ---------- Fröccsiskola ---------- */
function initSpritz() {
  const picker = $("[data-spritz-picker]");
  const glass = $("[data-glass]");
  if (!picker || !glass) return;
  const wine = $(".glass__wineLayer", glass);

  // Buborékok
  const bubbles = $(".glass__bubbles", glass);
  const ns = "http://www.w3.org/2000/svg";
  for (let i = 0; i < 18; i++) {
    const c = document.createElementNS(ns, "circle");
    c.setAttribute("cx", 60 + Math.random() * 80);
    c.setAttribute("cy", 250 + Math.random() * 25);
    c.setAttribute("r", 1.2 + Math.random() * 2.4);
    c.style.animationDuration = `${2.6 + Math.random() * 3}s`;
    c.style.animationDelay = `${-Math.random() * 5}s`;
    bubbles.appendChild(c);
  }

  // A pohár belseje az SVG-ben: alja 282, a folyadék teteje 60 (222 egység magas)
  const BOTTOM = 282, LIQUID = 222;
  let wineH = Number(wine.getAttribute("height")), anim = 0;
  const setWine = (h) => { wine.setAttribute("height", h.toFixed(2)); wine.setAttribute("y", (BOTTOM - h).toFixed(2)); };
  function pour(target) {
    cancelAnimationFrame(anim);
    if (reduced) { wineH = target; setWine(target); return; }
    const from = wineH, t0 = performance.now(), dur = 900;
    const step = (now) => {
      const t = clamp((now - t0) / dur);
      wineH = from + (target - from) * (1 - Math.pow(1 - t, 3));
      setWine(wineH);
      if (t < 1) anim = requestAnimationFrame(step);
    };
    anim = requestAnimationFrame(step);
  }
  const buttons = SPRITZ.map((s, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.setAttribute("role", "radio");
    b.textContent = s.name;
    b.addEventListener("click", () => select(i));
    b.addEventListener("keydown", (e) => {
      if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(e.key)) return;
      e.preventDefault();
      const n = (i + (e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1) + SPRITZ.length) % SPRITZ.length;
      select(n); buttons[n].focus();
    });
    picker.appendChild(b);
    return b;
  });

  function select(i) {
    const s = SPRITZ[i];
    const total = s.wine + s.soda;
    buttons.forEach((b, j) => { b.setAttribute("aria-checked", String(i === j)); b.tabIndex = i === j ? 0 : -1; });
    pour(LIQUID * s.wine / total);
    $("[data-spritz-name]").textContent = s.name;
    $("[data-spritz-ratio]").textContent = `${s.wine} dl bor + ${s.soda} dl szóda`;
    $("[data-spritz-note]").textContent = s.note;
  }
  select(1);

  $$("[data-wine]").forEach((b) => b.addEventListener("click", () => {
    $$("[data-wine]").forEach((x) => x.setAttribute("aria-checked", String(x === b)));
    glass.dataset.wineColor = b.dataset.wine;
  }));
}

/* ---------- Kaparós sorsjegy ---------- */
function daypart() {
  const h = budapestNow().minutes / 60;
  return h < 11 ? "morning" : h < 17 ? "afternoon" : "evening";
}

function initTicket() {
  const ticket = $("[data-ticket]");
  if (!ticket) return;
  const canvas = $("[data-ticket-canvas]", ticket);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  let last = null, drawing = false, moves = 0, won = false, tipIndex = -1;

  const pool = () => {
    const temp = store.get("lutri-weather")?.data?.current?.temperature_2m;
    return [...TIPS[daypart()], ...(temp >= 26 && daypart() !== "morning" ? TIPS.hot : [])];
  };

  function pickTip() {
    const p = pool();
    let i;
    do { i = Math.floor(Math.random() * p.length); } while (p.length > 1 && i === tipIndex);
    tipIndex = i;
    $("[data-ticket-title]", ticket).textContent = p[i].t;
    $("[data-ticket-text]", ticket).textContent = p[i].d;
    $("[data-ticket-serial]", ticket).textContent = "Nº " + String(Math.floor(Math.random() * 1e6)).padStart(6, "0");
    $("[data-ticket-date]", ticket).textContent = new Intl.DateTimeFormat("hu-HU", { month: "long", day: "numeric", timeZone: "Europe/Budapest" }).format(new Date());
  }

  function paint() {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(r.width * dpr));
    canvas.height = Math.max(1, Math.round(r.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    const g = ctx.createLinearGradient(0, 0, r.width, r.height);
    g.addColorStop(0, "#a9a193"); g.addColorStop(0.35, "#e9e3d6"); g.addColorStop(0.5, "#c3bbab");
    g.addColorStop(0.7, "#efe9dd"); g.addColorStop(1, "#9c9485");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, r.width, r.height);
    // apró minta
    ctx.save();
    ctx.translate(r.width / 2, r.height / 2);
    ctx.rotate(-0.35);
    ctx.fillStyle = "rgba(60, 50, 40, .09)";
    ctx.font = `400 22px Yellowtail, cursive`;
    for (let y = -r.height; y < r.height; y += 34) {
      for (let x = -r.width; x < r.width; x += 74) ctx.fillText("Lutri", x + ((y / 34) % 2 ? 37 : 0), y);
    }
    ctx.restore();
    ctx.fillStyle = "rgba(40, 28, 20, .72)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `700 ${Math.round(Math.min(r.width / 12, 26))}px Manrope, system-ui, sans-serif`;
    ctx.fillText("KAPARD LE", r.width / 2, r.height / 2 - 8);
    ctx.font = `500 ${Math.round(Math.min(r.width / 26, 14))}px Manrope, system-ui, sans-serif`;
    ctx.fillText("ujjal vagy egérrel", r.width / 2, r.height / 2 + 18);
    ctx.globalCompositeOperation = "destination-out";
  }

  function point(e) {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  function scratch(p) {
    const w = canvas.getBoundingClientRect().width;
    ctx.lineWidth = Math.max(28, w * 0.09);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo((last || p).x, (last || p).y);
    ctx.lineTo(p.x + 0.01, p.y);
    ctx.stroke();
    last = p;
    if (++moves % 6 === 0) check();
  }
  function check() {
    const { width, height } = canvas;
    const data = ctx.getImageData(0, 0, width, height).data;
    let clear = 0, total = 0;
    const step = 4 * 12;
    for (let i = 3; i < data.length; i += step) { total++; if (data[i] < 100) clear++; }
    if (clear / total > 0.48) win();
  }

  function burst() {
    if (reduced) return;
    const colors = ["#ff3d55", "#d6a54a", "#7fd6b5", "#f2e6d0"];
    const field = $(".ticket__field", ticket).getBoundingClientRect();
    const box = ticket.getBoundingClientRect();
    for (let i = 0; i < 36; i++) {
      const c = document.createElement("span");
      c.className = "confetti";
      c.style.left = `${field.left - box.left + field.width / 2}px`;
      c.style.top = `${field.top - box.top + field.height / 2}px`;
      c.style.background = colors[i % colors.length];
      const a = Math.random() * Math.PI * 2, d = 90 + Math.random() * 160;
      c.style.setProperty("--x", `${Math.cos(a) * d}px`);
      c.style.setProperty("--y", `${Math.sin(a) * d - 60}px`);
      c.style.setProperty("--r", `${Math.random() * 720 - 360}deg`);
      ticket.appendChild(c);
      setTimeout(() => c.remove(), 1300);
    }
  }

  function win() {
    if (won) return;
    won = true;
    drawing = false;
    ticket.classList.add("is-won");
    burst();
  }

  function reset() {
    won = false; moves = 0; last = null;
    ticket.classList.remove("is-won");
    pickTip();
    paint();
  }

  canvas.addEventListener("pointerdown", (e) => {
    if (won) return;
    drawing = true; last = null;
    canvas.setPointerCapture?.(e.pointerId);
    scratch(point(e));
  });
  canvas.addEventListener("pointermove", (e) => { if (drawing) scratch(point(e)); });
  const stop = () => { if (drawing) { drawing = false; last = null; check(); } };
  canvas.addEventListener("pointerup", stop);
  canvas.addEventListener("pointercancel", stop);

  $("[data-ticket-reveal]", ticket).addEventListener("click", win);
  $("[data-ticket-new]", ticket).addEventListener("click", reset);

  let w = 0;
  new ResizeObserver(() => {
    const nw = Math.round(canvas.getBoundingClientRect().width);
    if (nw && nw !== w) { w = nw; if (!won) paint(); }
  }).observe(canvas);

  pickTip();
  (document.fonts?.ready || Promise.resolve()).then(() => { if (!won) paint(); });
}

/* ---------- Időjárás (Open-Meteo, kulcs nélkül) ---------- */
const WEATHER = [
  [[0], "Derült", "☀️", "🌙"],
  [[1], "Többnyire derült", "🌤️", "🌙"],
  [[2], "Részben felhős", "⛅", "☁️"],
  [[3], "Borult", "☁️", "☁️"],
  [[45, 48], "Ködös", "🌫️", "🌫️"],
  [[51, 53, 55, 56, 57], "Szitálás", "🌦️", "🌧️"],
  [[61, 63, 65, 66, 67], "Eső", "🌧️", "🌧️"],
  [[71, 73, 75, 77, 85, 86], "Havazás", "❄️", "❄️"],
  [[80, 81, 82], "Zápor", "🌦️", "🌧️"],
  [[95, 96, 99], "Zivatar", "⛈️", "⛈️"],
];

async function initWeather() {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${SHOP.lat}&longitude=${SHOP.lon}`
    + "&current=temperature_2m,apparent_temperature,weather_code,is_day,wind_speed_10m"
    + "&daily=temperature_2m_max&timezone=Europe%2FBudapest&forecast_days=1";
  let data = null;
  const cached = store.get("lutri-weather");
  if (cached && Date.now() - cached.at < 30 * 60e3) data = cached.data;
  if (!data) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 6000);
      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(timer);
      if (!res.ok) throw new Error(res.status);
      data = await res.json();
      store.set("lutri-weather", { at: Date.now(), data });
    } catch {
      $("[data-weather]").classList.add("is-off");
      $("[data-weather-desc]").textContent = "Az élő időjárás most nem érhető el.";
      return;
    }
  }
  const c = data.current;
  const code = c.weather_code;
  const row = WEATHER.find((w) => w[0].includes(code)) || [[], "Változó", "🌤️", "🌙"];
  const temp = Math.round(c.temperature_2m);
  const wet = code >= 51;
  const max = data.daily?.temperature_2m_max?.[0];

  let verdict, short;
  if (code >= 95) { verdict = "Zivatar van — bent a helyed, a képernyők előtt."; short = "bent a helyed"; }
  else if (wet) { verdict = "Esik — a napernyő most esernyő, de bent is jó."; short = "esernyő-idő"; }
  else if (temp >= 27) { verdict = "Kánikula: árnyék a napernyő alatt és egy hosszúlépés."; short = "fröccsidő"; }
  else if (temp >= 16) { verdict = "Teraszidő! Ülj ki a napernyők alá."; short = "teraszidő"; }
  else if (temp >= 8) { verdict = "Friss az idő — egy forró kávé kint is jólesik."; short = "kávéidő"; }
  else { verdict = "Hideg van: bent meleg van és forró kávé."; short = "bent jó"; }

  $("[data-weather-temp]").textContent = temp;
  $("[data-weather-desc]").textContent = `${row[1]} Békásmegyeren${typeof max === "number" ? ` · ma legfeljebb ${Math.round(max)}°` : ""}`;
  $("[data-weather-verdict]").textContent = verdict;

  const chip = $("[data-weather-chip]");
  if (chip) {
    $("[data-weather-icon]", chip).textContent = c.is_day ? row[2] : row[3];
    $("[data-weather-short]", chip).textContent = `${temp}° · ${short}`;
    chip.hidden = false;
  }
}

/* ---------- Térkép: csak kattintásra tölti be a Google Maps-et ---------- */
function initMap() {
  const btn = $(".map__load");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const f = document.createElement("iframe");
    f.src = btn.dataset.mapSrc;
    f.title = "Lutri Eszpresszó a térképen";
    f.loading = "lazy";
    f.referrerPolicy = "no-referrer-when-downgrade";
    f.allowFullscreen = true;
    btn.replaceWith(f);
  });
}

/* ---------- Offline működés, telepíthetőség ---------- */
function initServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  if (location.protocol !== "https:" && location.hostname !== "localhost") return;
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}

/* ---------- Indítás ---------- */
function tick() {
  const s = renderStatus();
  renderTimeline(s);
  renderGreeting();
  return s;
}

initContact();
initNav();
initReveal();
initSign();
renderHours();
tick();
initSpritz();
initTicket();
initMap();
initWeather();
initServiceWorker();

setInterval(tick, 30e3);
let resizeTimer;
window.addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => renderTimeline(openStatus()), 150); });
document.addEventListener("visibilitychange", () => { if (!document.hidden) { tick(); renderHours(); } });
