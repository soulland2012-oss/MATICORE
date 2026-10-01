/*
 * Раздел «Фракции»: схема отношений, досье фракций, Пепельник как территория раздробленного влияния.
 */
(function () {
  "use strict";
  const M = window.MANTICORA;
  const { $, $$, esc, md, onRoute, flash, env } = M.core;
  const FA = M.data.factions;
  const F = M.data.fortum;
  const districtById = Object.fromEntries(F.districts.map((d) => [d.id, d]));

  const field = (label, value, wide) => {
    const empty = !value || (Array.isArray(value) && !value.length);
    let html;
    if (empty) html = `<dd class="is-empty">${esc(FA.emptyText)}</dd>`;
    else if (Array.isArray(value)) html = `<dd><ul>${value.map((v) => `<li>${md(v)}</li>`).join("")}</ul></dd>`;
    else html = `<dd>${md(value)}</dd>`;
    return `<div class="ff${wide ? " ff--wide" : ""}"><dt>${esc(label)}</dt>${html}</div>`;
  };

  const districtLinks = (ids) =>
    ids.map((id) => districtById[id])
      .filter(Boolean)
      .map((d) => `<a class="btn btn--ghost btn--small" href="#fortum?d=${d.id}">На карте: ${esc(d.name)} <span class="arrow" aria-hidden="true">→</span></a>`)
      .join("");

  const emblemHtml = (f) => {
    if (f.emblem) return `<img src="${esc(f.emblem)}" alt="" loading="lazy">`;
    const fn = M.art.emblem[f.id];
    return fn ? fn() : "";
  };

  const dossier = (f, i) => {
    const titleExtra = f.id === "parasites" ? ` <span class="redact" style="width:2.4em" aria-hidden="true"></span>` : "";
    return `
      <article class="faction faction--${f.accent}${i % 2 ? " faction--reverse" : ""}" id="faction-${f.id}" data-reveal aria-labelledby="fn-${f.id}">
        <div class="faction__visual">
          <span class="faction__vertical" aria-hidden="true">${esc(f.name)} · ${esc(f.territory.split("(")[0])}</span>
          <div class="faction__emblem" aria-hidden="true">${emblemHtml(f)}</div>
        </div>
        <div class="faction__body">
          <p class="faction__eyebrow">Фракция · ${esc(f.territory.split(" (")[0])}</p>
          <h3 class="faction__name" id="fn-${f.id}">${esc(f.name)}${titleExtra}</h3>
          ${f.subtitle ? `<p class="faction__sub">${esc(f.subtitle)}</p>` : ""}
          <dl class="faction__fields">
            ${field("Состав", f.composition)}
            ${field("Территория", f.territory)}
            ${field("Деятельность", f.activity, true)}
            ${field("Отношения с властью", f.power)}
            ${field("Конфликты", f.conflicts)}
            ${f.look ? field("Внешний вид и менталитет", f.look, true) : ""}
            ${field("Особенности", f.features, true)}
          </dl>
          <div class="faction__links">${districtLinks(f.districts)}</div>
        </div>
      </article>`;
  };

  const ashesBlock = () => {
    const a = FA.fragmented;
    return `
      <article class="faction faction--ashes" id="faction-${a.id}" data-reveal aria-labelledby="fn-${a.id}">
        <div class="faction__visual">
          <div class="shards" id="shards">
            <canvas aria-hidden="true"></canvas>
            <p class="shards__label">Нет единой власти<small>Зоны влияния меняются ежедневно</small></p>
          </div>
        </div>
        <div class="faction__body">
          <div>
            <p class="faction__eyebrow">Территория · не фракция</p>
            <h3 class="faction__name" id="fn-${a.id}">${esc(a.name)}</h3>
            <p class="faction__sub">${esc(a.subtitle)}</p>
            <div class="faction__links">${districtLinks(a.districts)}</div>
          </div>
          <dl class="faction__fields">
            ${field("Фракция", a.faction)}
            ${field("Территория", a.territory)}
            ${field("Кто делит территорию", a.composition, true)}
            ${field("Деятельность и рынок", a.activity, true)}
            ${field("Отношения с властью", a.power)}
            ${field("Конфликты", a.conflicts)}
            ${field("Особенности", a.features, true)}
          </dl>
        </div>
      </article>`;
  };

  /* ───── Схема отношений ───── */
  const relations = () => {
    $("#relations").innerHTML = `
      <svg viewBox="0 0 640 260" role="img" aria-labelledby="rel-title rel-desc">
        <title id="rel-title">Схема отношений сил Фортума</title>
        <desc id="rel-desc">«Урканат» воюет с «Асурами» за мосты, баржи и переправы через Арес. «Асуры» связаны негласным пактом с силовиками Plaza Fortum. «Паразиты» укрывают беглецов от режима.</desc>
        <path d="M300 0V260" stroke="rgba(39,215,255,.25)" stroke-width="26"/>
        <text x="300" y="248" text-anchor="middle" class="rel-label" fill="#8ae9ff">АРЕС</text>
        <line class="rel-war" x1="200" y1="70" x2="420" y2="70"/>
        <text class="rel-label" x="310" y="58" text-anchor="middle">война за мосты и переправы</text>
        <line class="rel-pact" x1="120" y1="96" x2="120" y2="168"/>
        <text class="rel-label" x="130" y="136">негласный пакт</text>
        <line class="rel-hide" x1="500" y1="168" x2="260" y2="196"/>
        <text class="rel-label" x="420" y="210">укрывают беглецов</text>
        <g class="rel-node"><rect x="40" y="44" width="160" height="52" stroke="#ff2fbf"/><text x="120" y="72" text-anchor="middle">Асуры</text><text class="rel-sub" x="120" y="88" text-anchor="middle">ЛАЗУРНАЯ СТОРОНА</text></g>
        <g class="rel-node"><rect x="420" y="44" width="170" height="52" stroke="#e4ff3a"/><text x="505" y="72" text-anchor="middle">Урканат</text><text class="rel-sub" x="505" y="88" text-anchor="middle">КРЕЙНЕР</text></g>
        <g class="rel-node"><rect x="40" y="168" width="220" height="52" stroke="#c9d4e0" stroke-dasharray="3 3"/><text x="150" y="196" text-anchor="middle">Власть</text><text class="rel-sub" x="150" y="212" text-anchor="middle">СИЛОВИКИ PLAZA FORTUM · РЕЖИМ</text></g>
        <g class="rel-node"><rect x="420" y="140" width="170" height="52" stroke="#c9d4e0"/><text x="505" y="168" text-anchor="middle">Паразиты</text><text class="rel-sub" x="505" y="184" text-anchor="middle">СТАРЫЙ ХЭЙЛЬ</text></g>
      </svg>
      <ul class="rel-legend">
        <li><i style="background:repeating-linear-gradient(90deg,var(--red) 0 6px,transparent 6px 10px)"></i>«Урканат» ведёт постоянную войну с «Асурами» за мосты, баржи и переправы через Арес.</li>
        <li><i style="background:repeating-linear-gradient(90deg,var(--magenta) 0 2px,transparent 2px 6px)"></i>«Асуры» — негласный пакт с силовиками Plaza Fortum.</li>
        <li><i style="background:repeating-linear-gradient(90deg,var(--ghost) 0 1px,transparent 1px 6px)"></i>«Паразиты» укрывают беглецов от тоталитарного режима.</li>
        <li><i style="background:var(--red)"></i>Пепельник: сотни мелких группировок, без единой власти.</li>
      </ul>`;
  };

  /* ───── Раздробленные зоны Пепельника ───── */
  const shards = () => {
    const box = $("#shards");
    if (!box) return;
    const canvas = $("canvas", box);
    const c = canvas.getContext("2d");
    const palette = ["#ff3b47", "#7a1018", "#3a0a0c", "#4a1410", "#ff3b47", "#7a1018", "#ff8a3d", "#c9d4e0", "#e4ff3a", "#ff2fbf"];
    let cells = [], W = 0, H = 0, timer = 0, visible = false;

    const setup = () => {
      const r = box.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      const size = W < 600 ? 14 : 18;
      cells = [];
      for (let y = 0; y < H; y += size) {
        for (let x = 0; x < W; x += size) {
          cells.push({ x, y, s: size - 2, col: palette[Math.floor(Math.random() * palette.length)], a: 0.08 + Math.random() * 0.42 });
        }
      }
      draw();
    };
    const draw = () => {
      c.fillStyle = "#070505";
      c.fillRect(0, 0, W, H);
      cells.forEach((k) => {
        c.globalAlpha = k.a;
        c.fillStyle = k.col;
        c.fillRect(k.x, k.y, k.s, k.s);
      });
      c.globalAlpha = 1;
    };
    // Захват соседних клеток — зоны влияния меняются
    const tick = () => {
      if (!visible || env.reduced || document.hidden) return;
      const n = 40;
      for (let i = 0; i < n; i++) {
        const k = cells[Math.floor(Math.random() * cells.length)];
        const nb = cells[Math.floor(Math.random() * cells.length)];
        k.col = Math.random() < 0.7 ? nb.col : palette[Math.floor(Math.random() * palette.length)];
        k.a = 0.08 + Math.random() * 0.45;
      }
      draw();
    };

    setup();
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((e) => {
        visible = e[0].isIntersecting;
        clearInterval(timer);
        if (visible && !env.reduced) timer = setInterval(tick, 420);
      }).observe(box);
    }
    window.addEventListener("resize", M.core.debounce(setup, 200));
  };

  M.ui.factions = {
    init() {
      relations();
      $("#faction-list").innerHTML = FA.list.map(dossier).join("") + ashesBlock();
      shards();
      onRoute("factions", (params) => {
        const el = params.f ? document.getElementById("faction-" + params.f) : null;
        if (el) setTimeout(() => flash(el), 500);
        return el;
      });
    }
  };
})();
