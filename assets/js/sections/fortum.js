/*
 * Раздел «Фортум»: схематичная карта (SVG), список районов, панель района.
 * Геометрия карты — условная (см. mapNote в data/fortum.js).
 */
(function () {
  "use strict";
  const M = window.MANTICORA;
  const { $, $$, esc, md, artOrImage, onRoute, setHash, scrollToEl, sound } = M.core;
  const F = M.data.fortum;
  const FA = M.data.factions;

  // Условная геометрия районов на схеме 1000×640
  const SHAPES = {
    leftbank: { d: "M24 46H238V114H178V498H238V606H24Z", label: [100, 326], lines: ["Левобережный квартал"], vertical: true },
    azure: { d: "M190 128L316 120L324 232L310 330L320 472L190 480Z", label: [254, 290], lines: ["Лазурная", "сторона"] },
    plaza: { d: "M444 186L590 172L604 300L594 404L450 414L436 300Z", label: [520, 288], lines: ["Plaza", "Fortum"] },
    kreiner: { d: "M614 146L790 136L800 300L792 428L618 438L608 300Z", label: [704, 292], lines: ["Крейнер"] },
    oldheil: { d: "M810 126L976 116L980 300L970 436L814 444L804 300Z", label: [892, 282], lines: ["Старый", "Хэйль"] },
    ashes: { d: "M456 450L976 468L980 612L444 616L438 522Z", label: [710, 536], lines: ["Пепельник"] }
  };

  const LOOK = {
    plaza: { fill: "#08151f", on: "#0d2636", stroke: "rgba(39,215,255,.45)", acc: "#27d7ff" },
    azure: { fill: "#0c1222", on: "#161a34", stroke: "rgba(255,47,191,.4)", acc: "#ff2fbf" },
    kreiner: { fill: "#14140a", on: "#22220c", stroke: "rgba(228,255,58,.4)", acc: "#e4ff3a" },
    leftbank: { fill: "#0d1119", on: "#151b27", stroke: "rgba(159,177,200,.4)", acc: "#a9bdd6" },
    oldheil: { fill: "#150f0b", on: "#241911", stroke: "rgba(255,179,92,.38)", acc: "#ffb35c" },
    ashes: { fill: "#170807", on: "#2a0c0a", stroke: "rgba(255,59,71,.45)", acc: "#ff3b47" }
  };

  const districts = F.districts;
  const byId = Object.fromEntries(districts.map((d) => [d.id, d]));
  const factionById = Object.fromEntries(FA.list.map((f) => [f.id, f]));
  let current = null;

  const zone = (d) => (d.bankLabel.split("—")[1] || d.bankLabel).trim();

  const patterns = `
    <pattern id="pat-plaza" width="10" height="10" patternUnits="userSpaceOnUse"><rect x="1" y="1" width="3" height="5" fill="#27d7ff" opacity=".55"/><rect x="6" y="3" width="2" height="6" fill="#e8f4ff" opacity=".35"/></pattern>
    <pattern id="pat-azure" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="5" cy="5" r="3" fill="#ff2fbf" opacity=".25"/><circle cx="13" cy="13" r="2" fill="#8ab4ff" opacity=".35"/></pattern>
    <pattern id="pat-kreiner" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="3" height="10" fill="#e4ff3a" opacity=".38"/></pattern>
    <pattern id="pat-leftbank" width="16" height="16" patternUnits="userSpaceOnUse"><rect x="2" y="2" width="10" height="10" fill="none" stroke="#a9bdd6" stroke-opacity=".32"/></pattern>
    <pattern id="pat-oldheil" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M0 12L14 16L22 8L40 14M8 40L12 26L28 30L34 22M20 0L18 8" fill="none" stroke="#ffb35c" stroke-opacity=".4"/></pattern>
    <pattern id="pat-ashes" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M0 20L10 24L16 14L30 18L36 8L48 12M6 48L12 34L24 36L28 28L40 32L48 26M24 0L22 10" fill="none" stroke="#ff3b47" stroke-opacity=".5"/><circle cx="34" cy="40" r="1.5" fill="#ff8a3d"/><circle cx="8" cy="8" r="1" fill="#ff8a3d"/></pattern>
    <linearGradient id="riverGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a3a52"/><stop offset=".5" stop-color="#0c4a68"/><stop offset="1" stop-color="#0a3a52"/></linearGradient>`;

  const RIVER = "M372 -20C340 60 412 140 382 220S330 340 378 420S422 540 390 660";

  const buildMap = () => {
    let grid = "";
    for (let x = 0; x <= 1000; x += 40) grid += `<line class="grid-line" x1="${x}" y1="0" x2="${x}" y2="640"/>`;
    for (let y = 0; y <= 640; y += 40) grid += `<line class="grid-line" x1="0" y1="${y}" x2="1000" y2="${y}"/>`;

    const groups = districts.map((d) => {
      const s = SHAPES[d.look], lk = LOOK[d.look];
      if (!s) return "";
      const [lx, ly] = s.label;
      const nameLines = s.lines.map((t, i) => `<tspan x="${lx}" dy="${i ? 18 : 0}">${esc(t)}</tspan>`).join("");
      const subY = ly + (s.lines.length - 1) * 18 + 18;
      const rot = s.vertical ? ` transform="rotate(-90 ${lx} ${ly})"` : "";
      return `
        <g class="district" data-id="${d.id}" tabindex="0" role="button" aria-pressed="false"
           aria-label="${esc(d.name)}${d.alt ? " (" + esc(d.alt) + ")" : ""}, ${esc(d.bankLabel)}"
           style="--d-fill:${lk.fill};--d-fill-on:${lk.on};--d-stroke:${lk.stroke};--d-acc:${lk.acc}">
          <path class="d-base" d="${s.d}"/>
          <path class="d-pattern" d="${s.d}" fill="url(#pat-${d.look})"/>
          <path class="d-outline" d="${s.d}"/>
          <g${rot}>
            <text class="d-name" x="${lx}" y="${ly}" text-anchor="middle">${nameLines}</text>
            <text class="d-sub" x="${lx}" y="${subY}" text-anchor="middle">${esc(zone(d))}</text>
          </g>
        </g>`;
    }).join("");

    const bridges = [[196, "Мост"], [300, ""], [468, ""]]
      .map(([y]) => `<line class="bridge" x1="306" y1="${y}" x2="452" y2="${y}"/>`).join("");

    $("#fortum-map").innerHTML = `
      <svg class="map-svg" viewBox="0 0 1000 640" role="group" aria-label="Схема Фортума: река Арес и шесть районов">
        <defs>${patterns}</defs>
        <rect width="1000" height="640" fill="#04060a"/>
        ${grid}
        <text class="bank-label" x="130" y="30" text-anchor="middle">Левый берег</text>
        <text class="bank-label" x="720" y="30" text-anchor="middle">Правый берег</text>
        ${groups}
        <path class="river-glow" d="${RIVER}"/>
        <path class="river" d="${RIVER}"/>
        <path class="river-edge" d="${RIVER}" transform="translate(-24 0)"/>
        <path class="river-edge" d="${RIVER}" transform="translate(24 0)"/>
        ${bridges}
        <rect class="barge" x="352" y="252" width="20" height="5"/>
        <rect class="barge" x="384" y="524" width="24" height="5"/>
        <text class="river-label" transform="translate(392 118) rotate(78)">АРЕС</text>
        <text class="river-label" transform="translate(370 584) rotate(84)" opacity=".6">ARES</text>
      </svg>`;
  };

  const buildList = () => {
    $("#district-list").innerHTML = districts.map((d) => `
      <button class="district-btn" type="button" role="listitem" data-id="${d.id}" aria-pressed="false" style="--d-acc:${LOOK[d.look].acc}">
        <span class="district-btn__name">${esc(d.name)}</span>
        <span class="district-btn__meta">${esc(d.bankLabel)} · ${esc(d.securityShort)}</span>
      </button>`).join("");
  };

  const panel = $("#district-panel");

  const emptyPanel = () => {
    const right = districts.filter((d) => d.bank === "right").map((d) => esc(d.name)).join(", ");
    const left = districts.filter((d) => d.bank === "left").map((d) => esc(d.name)).join(", ");
    panel.style.setProperty("--d-acc", "var(--cyan)");
    panel.innerHTML = `
      <div class="dp-empty dp-swap">
        <p class="sec-index mono"><span>●</span> Река ${esc(F.river.name)} / ${esc(F.river.alt)}</p>
        <h3>Выберите район</h3>
        <p>${esc(F.summary)} Наведите курсор на район или выберите его в списке — откроется справка: атмосфера, население, безопасность, фракция и особенности.</p>
        <div class="dp-banks">
          <div class="dp-bank"><b>Правый берег</b><span>${right}</span></div>
          <div class="dp-bank"><b>Левый берег</b><span>${left}</span></div>
        </div>
      </div>`;
  };

  const renderPanel = (d) => {
    const lk = LOOK[d.look];
    panel.style.setProperty("--d-acc", lk.acc);
    const f = d.faction ? factionById[d.faction] : null;
    const factionHtml = f
      ? `<a class="dp-faction-link" href="#factions?f=${f.id}">«${esc(f.name)}» ${f.subtitle ? `<span class="muted">${esc(f.subtitle)}</span>` : ""} <span aria-hidden="true">→</span></a>`
      : esc(d.factionText || "Не указана");
    const idx = districts.indexOf(d);
    const prev = districts[(idx - 1 + districts.length) % districts.length];
    const next = districts[(idx + 1) % districts.length];

    panel.innerHTML = `
      <div class="dp-swap">
        <div class="dp-art" aria-hidden="true">
          ${artOrImage(d.image, M.art.district[d.look])}
          <span class="dp-art__badge">${esc(d.bankLabel)}</span>
          ${d.stat ? `<span class="dp-art__stat">${esc(d.stat.value)}<small>${esc(d.stat.label)}</small></span>` : ""}
        </div>
        <div class="dp-body">
          <h3 class="dp-title">${esc(d.name)}</h3>
          ${d.alt ? `<p class="dp-alt">${esc(d.alt)}</p>` : ""}
          <dl class="dp-fields">
            <div class="dp-field"><dt>Атмосфера</dt><dd>${esc(d.atmosphere)}</dd></div>
            <div class="dp-field"><dt>Население</dt><dd>${esc(d.population)}</dd></div>
            <div class="dp-field"><dt>Безопасность</dt><dd><strong>${esc(d.securityShort)}.</strong> ${esc(d.security)}</dd></div>
            <div class="dp-field"><dt>Главная фракция</dt><dd>${factionHtml}${f && d.factionText ? `<br>${esc(d.factionText)}` : ""}</dd></div>
            <div class="dp-field"><dt>Особенности</dt><dd><ul>${d.features.map((x) => `<li>${md(x)}</li>`).join("")}</ul></dd></div>
          </dl>
          <div class="dp-actions">
            <button class="btn btn--ghost btn--small" type="button" data-go="${prev.id}" aria-label="Предыдущий район: ${esc(prev.name)}"><span class="arrow" aria-hidden="true">←</span> ${esc(prev.name)}</button>
            <button class="btn btn--ghost btn--small" type="button" data-go="${next.id}" aria-label="Следующий район: ${esc(next.name)}">${esc(next.name)} <span class="arrow" aria-hidden="true">→</span></button>
          </div>
        </div>
      </div>`;
  };

  const select = (id, opts = {}) => {
    const d = byId[id];
    if (!d) return;
    current = id;
    $$(".district", $("#fortum-map")).forEach((g) => {
      const on = g.dataset.id === id;
      g.classList.toggle("is-active", on);
      g.setAttribute("aria-pressed", on ? "true" : "false");
    });
    $$(".district-btn").forEach((b) => b.setAttribute("aria-pressed", b.dataset.id === id ? "true" : "false"));
    renderPanel(d);
    if (opts.hash !== false) setHash("#fortum?d=" + id);
    if (opts.scrollPanel && window.innerWidth < 980) scrollToEl(panel);
    sound.blip(1400, 0.04);
  };

  const bind = () => {
    const map = $("#fortum-map");
    map.addEventListener("click", (e) => {
      const g = e.target.closest(".district");
      if (g) select(g.dataset.id, { scrollPanel: true });
    });
    map.addEventListener("keydown", (e) => {
      const g = e.target.closest(".district");
      if (!g) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        select(g.dataset.id);
      }
    });
    map.addEventListener("pointerover", (e) => {
      const g = e.target.closest(".district");
      if (g && g.dataset.id !== map.dataset.hover) {
        map.dataset.hover = g.dataset.id;
        sound.blip(2200, 0.02);
      }
    });
    $("#district-list").addEventListener("click", (e) => {
      const b = e.target.closest(".district-btn");
      if (b) select(b.dataset.id, { scrollPanel: true });
    });
    panel.addEventListener("click", (e) => {
      const b = e.target.closest("[data-go]");
      if (b) {
        select(b.dataset.go);
        const again = $(`[data-go]`, panel);
        again && again.focus({ preventScroll: true });
      }
    });

    onRoute("fortum", (params) => {
      if (params.d && byId[params.d]) {
        select(params.d, { hash: false });
        return window.innerWidth < 980 ? panel : document.getElementById("fortum");
      }
      return null;
    });
  };

  M.ui.fortum = {
    init() {
      $("#fortum-lead").textContent = F.summary + " Шесть районов — от сияющего делового центра до руин зоны анархии.";
      $("#map-note").innerHTML = `<b>Схема</b>${esc(F.mapNote)}`;
      buildMap();
      buildList();
      emptyPanel();
      bind();
    },
    select
  };
})();
