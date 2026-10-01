/*
 * Первый экран: процедурная панорама Фортума на canvas, параллакс, метки районов, бегущая строка.
 * Композиция: зритель стоит на Левом берегу (Лазурная сторона), за рекой Арес — Plaza Fortum,
 * за ней дымит Крейнер, дальше — Старый Хэйль и зарево Пепельника.
 */
(function () {
  "use strict";
  const M = window.MANTICORA;
  const { $, $$, esc, env, debounce } = M.core;
  const site = M.data.site;

  /* ───── Тексты первого экрана ───── */
  const renderText = () => {
    $("#hero-tagline").innerHTML = site.tagline
      .map((t, i) => (i ? '<span class="sep" aria-hidden="true"></span>' : "") + `<span>${esc(t)}</span>`)
      .join("");
    $("#hero-intro").textContent = site.intro;
    $("#hero-cta").innerHTML = site.cta
      .map((c) => `<a class="btn btn--${c.kind}" href="${esc(c.href)}">${esc(c.label)} <span class="arrow" aria-hidden="true">→</span></a>`)
      .join("");

    const items = site.ticker.map((t) => `<span class="ticker__item">${esc(t)}</span>`).join("");
    const track = $("#ticker-track");
    // Для бесшовной прокрутки строка дублируется; копия скрыта от экранного диктора
    track.innerHTML = items + (env.reduced ? "" : `<span aria-hidden="true" style="display:contents">${items}</span>`);
  };

  /* ───── Панорама ───── */
  const hero = $("#top");
  const scene = $("#hero-scene");
  const cv = {};
  $$(".hero__canvas", scene).forEach((c) => { cv[c.dataset.layer] = c; });
  const ctx = {};
  Object.keys(cv).forEach((k) => { ctx[k] = cv[k].getContext("2d"); });

  let W = 0, H = 0, DPR = 1, VW = 0, OX = 0, S = 1, HZ = 0, RB = 0;
  let geo = null; // данные сцены для анимации
  let running = false, raf = 0, last = 0, visible = true;

  const R = (seed) => M.art.rng(seed);

  const sizeCanvases = () => {
    const box = cv.sky.parentElement.getBoundingClientRect();
    W = Math.max(320, box.width);
    H = Math.max(400, box.height);
    DPR = Math.min(1.75, window.devicePixelRatio || 1);
    Object.keys(cv).forEach((k) => {
      cv[k].width = Math.round(W * DPR);
      cv[k].height = Math.round(H * DPR);
      ctx[k].setTransform(DPR, 0, 0, DPR, 0, 0);
    });
    // Виртуальная ширина: на узких экранах сцена шире окна, центр — на Plaza Fortum
    VW = Math.max(W, H * 1.35);
    OX = (W - VW) * 0.62;
    S = Math.max(0.6, Math.min(1.35, VW / 1500));
    HZ = H * 0.6;   // линия воды у правого берега
    RB = H * 0.8;   // кромка левого берега (передний план)
  };

  const X = (f) => OX + f * VW;

  const glow = (c, x, y, r, color) => {
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = g;
    c.fillRect(x - r, y - r, r * 2, r * 2);
  };

  // Для анимации — заранее отрисованные спрайты свечения (дешевле, чем градиент на каждый кадр)
  const sprites = {};
  const sprite = (rgb, soft) => {
    const key = (soft ? "s:" : "") + rgb;
    if (sprites[key]) return sprites[key];
    const s = document.createElement("canvas");
    s.width = s.height = 64;
    const c = s.getContext("2d");
    const g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, `rgba(${rgb},1)`);
    if (!soft) g.addColorStop(0.35, `rgba(${rgb},0.35)`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    c.fillStyle = g;
    c.fillRect(0, 0, 64, 64);
    return (sprites[key] = s);
  };
  const glowFast = (c, x, y, r, rgb, a, soft) => {
    if (a <= 0.01) return;
    c.globalAlpha = Math.min(1, a);
    c.drawImage(sprite(rgb, soft), x - r, y - r, r * 2, r * 2);
    c.globalAlpha = 1;
  };

  const drawWindows = (c, r, x, y, w, h, opt, store) => {
    const cw = (opt.cw || 6) * S, ch = (opt.ch || 8) * S, ww = Math.max(1, 2.2 * S), wh = Math.max(1.4, 3 * S);
    const cols = opt.colors;
    for (let yy = y + 5 * S; yy < y + h - 3; yy += ch) {
      for (let xx = x + 3 * S; xx < x + w - 3 * S; xx += cw) {
        if (r() < opt.lit) {
          const col = cols[Math.floor(r() * cols.length)];
          c.globalAlpha = 0.35 + r() * 0.6;
          c.fillStyle = col;
          c.fillRect(xx, yy, ww, wh);
          if (store && r() < 0.06) store.push({ x: xx, y: yy, w: ww, h: wh, col });
        }
      }
    }
    c.globalAlpha = 1;
  };

  /* ── Небо ── */
  const drawSky = () => {
    const c = ctx.sky;
    c.clearRect(0, 0, W, H);
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#03040a");
    g.addColorStop(0.3, "#070914");
    g.addColorStop(0.5, "#140b20");
    g.addColorStop(0.6, "#2a0f2a");
    g.addColorStop(0.62, "#0a0b14");
    g.addColorStop(1, "#05060a");
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
    // Засветка города
    glow(c, X(0.53), HZ - H * 0.08, VW * 0.32, "rgba(255,47,191,0.20)");
    glow(c, X(0.53), HZ - H * 0.3, VW * 0.2, "rgba(39,215,255,0.10)");
    glow(c, X(0.74), HZ - H * 0.1, VW * 0.22, "rgba(190,170,70,0.22)");
    glow(c, X(0.96), HZ - H * 0.02, VW * 0.18, "rgba(255,70,30,0.30)");
    glow(c, X(0.2), HZ - H * 0.05, VW * 0.25, "rgba(39,215,255,0.08)");
    // Полосы облаков, подсвеченные снизу
    const r = R(5);
    for (let i = 0; i < 9; i++) {
      const y = H * (0.12 + r() * 0.32), w = VW * (0.2 + r() * 0.4), x = X(r()) - w / 2;
      const cg = c.createLinearGradient(0, y - 12, 0, y + 12);
      cg.addColorStop(0, "rgba(0,0,0,0)");
      cg.addColorStop(0.6, `rgba(${r() < 0.5 ? "120,40,110" : "40,70,110"},${(0.08 + r() * 0.1).toFixed(2)})`);
      cg.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = cg;
      c.fillRect(x, y - 12, w, 24);
    }
  };

  /* ── Дальний план: Крейнер, Старый Хэйль, Пепельник, общий силуэт ── */
  const drawFar = () => {
    const c = ctx.far;
    c.clearRect(0, 0, W, H);
    const r = R(17);
    const base = HZ - 2;
    const chimneys = [], fires = [];

    // Общий дальний силуэт
    for (let f = -0.02; f < 0.64; f += 0.012 + r() * 0.012) {
      const w = (10 + r() * 22) * S, h = H * (0.04 + r() * 0.15);
      c.fillStyle = "#0d1020";
      c.fillRect(X(f), base - h, w, h);
      drawWindows(c, r, X(f), base - h, w, h, { lit: 0.08, colors: ["#5f7aa8", "#8a6aa0"] });
    }

    // Крейнер — за Plaza Fortum: трубы и цеха
    for (let f = 0.6; f < 0.87; f += 0.016 + r() * 0.012) {
      const w = (24 + r() * 40) * S, h = H * (0.03 + r() * 0.05);
      c.fillStyle = "#141209";
      c.fillRect(X(f), base - h, w, h);
      // пилообразные крыши
      c.beginPath();
      for (let xx = 0; xx < w; xx += 10 * S) { c.moveTo(X(f) + xx, base - h); c.lineTo(X(f) + xx + 10 * S, base - h - 5 * S); c.lineTo(X(f) + xx + 10 * S, base - h); }
      c.fill();
      if (r() < 0.6) { c.fillStyle = "#ffa23a"; c.globalAlpha = 0.5; c.fillRect(X(f) + w * 0.3, base - h * 0.5, 2 * S, 2 * S); c.globalAlpha = 1; }
    }
    for (let i = 0; i < 9; i++) {
      const f = 0.61 + i * 0.03 + r() * 0.01, w = (5 + r() * 4) * S, h = H * (0.12 + r() * 0.13);
      const x = X(f);
      c.fillStyle = "#16130b";
      c.fillRect(x, base - h, w, h);
      c.fillStyle = "rgba(228,255,58,0.35)";
      c.fillRect(x, base - h + 8 * S, w, 2 * S);
      chimneys.push({ x: x + w / 2, y: base - h, w });
    }
    // Смог над Крейнером
    const sg = c.createLinearGradient(0, base - H * 0.3, 0, base);
    sg.addColorStop(0, "rgba(120,110,60,0)");
    sg.addColorStop(1, "rgba(120,110,60,0.22)");
    c.fillStyle = sg;
    c.fillRect(X(0.58), base - H * 0.3, VW * 0.32, H * 0.3);

    // Старый Хэйль — низкие неровные крыши
    for (let f = 0.8; f < 0.93; f += 0.008 + r() * 0.01) {
      const w = (12 + r() * 20) * S, h = H * (0.015 + r() * 0.035);
      c.fillStyle = "#130e0c";
      c.beginPath();
      c.moveTo(X(f), base);
      c.lineTo(X(f), base - h * (0.7 + r() * 0.3));
      c.lineTo(X(f) + w * 0.5, base - h);
      c.lineTo(X(f) + w, base - h * (0.6 + r() * 0.3));
      c.lineTo(X(f) + w, base);
      c.fill();
      if (r() < 0.35) { c.fillStyle = "#ffb35c"; c.globalAlpha = 0.6; c.fillRect(X(f) + w * 0.4, base - h * 0.45, 2 * S, 2 * S); c.globalAlpha = 1; }
    }

    // Пепельник — руины и зарево
    glow(c, X(0.97), base, VW * 0.09, "rgba(255,80,30,0.35)");
    for (let f = 0.91; f < 1.04; f += 0.01 + r() * 0.012) {
      const w = (10 + r() * 22) * S, h = H * (0.02 + r() * 0.06);
      c.fillStyle = "#0e0605";
      c.beginPath();
      c.moveTo(X(f), base);
      c.lineTo(X(f), base - h * r());
      c.lineTo(X(f) + w * 0.3, base - h);
      c.lineTo(X(f) + w * 0.45, base - h * (0.3 + r() * 0.4));
      c.lineTo(X(f) + w * 0.7, base - h * (0.6 + r() * 0.4));
      c.lineTo(X(f) + w, base - h * r() * 0.5);
      c.lineTo(X(f) + w, base);
      c.fill();
      if (r() < 0.4) fires.push({ x: X(f) + w * 0.5, y: base - 2 * S, s: 0.6 + r() * 0.8, p: r() * 10 });
    }

    // Мост слева
    const by = base - H * 0.012;
    c.strokeStyle = "rgba(160,190,220,0.25)";
    c.lineWidth = 1;
    c.fillStyle = "#0c0f1a";
    c.fillRect(X(0.02), by, VW * 0.3, 3 * S);
    for (let f = 0.04; f < 0.32; f += 0.07) {
      const px = X(f);
      c.fillRect(px - 2 * S, by - H * 0.05, 4 * S, H * 0.05);
      c.beginPath();
      c.moveTo(px, by - H * 0.05); c.lineTo(px - VW * 0.035, by);
      c.moveTo(px, by - H * 0.05); c.lineTo(px + VW * 0.035, by);
      c.stroke();
    }
    for (let f = 0.02; f < 0.32; f += 0.006) {
      c.fillStyle = "rgba(138,233,255,0.7)";
      c.fillRect(X(f), by - 1, 1.4 * S, 1.4 * S);
    }

    // Дымка у горизонта
    const hg = c.createLinearGradient(0, base - H * 0.12, 0, base);
    hg.addColorStop(0, "rgba(30,14,40,0)");
    hg.addColorStop(1, "rgba(30,14,40,0.45)");
    c.fillStyle = hg;
    c.fillRect(0, base - H * 0.12, W, H * 0.12);

    return { chimneys, fires, heil: { x: X(0.86), y: base - H * 0.05 }, ashes: { x: X(0.955), y: base - H * 0.07 } };
  };

  /* ── Средний план: Plaza Fortum, набережная правого берега, река с отражениями ── */
  const drawMid = () => {
    const c = ctx.mid;
    c.clearRect(0, 0, W, H);
    const r = R(29);
    const towers = [], beacons = [], lit = [], neon = [];

    const tower = (f, wpx, hFrac, opt = {}) => {
      const w = wpx * S, h = H * hFrac, x = X(f), y = HZ - h;
      c.fillStyle = opt.fill || "#080b14";
      c.fillRect(x, y, w, h);
      // грань
      c.fillStyle = "rgba(39,215,255,0.22)";
      c.fillRect(x, y, 1, h);
      drawWindows(c, r, x, y, w, h, { lit: opt.lit || 0.4, colors: opt.colors || ["#9fe8ff", "#e8f4ff", "#ffd58a", "#9fe8ff"], cw: opt.cw, ch: opt.ch }, lit);
      if (opt.beacon !== false) beacons.push({ x: x + w / 2, y: y - 6 * S, p: r() * 6 });
      if (opt.antenna) { c.fillStyle = "#1c2433"; c.fillRect(x + w / 2 - 1, y - 12 * S, 2, 12 * S); }
      towers.push({ x, y, w, h, col: opt.refl || "rgba(140,220,255,0.5)" });
      return { x, y, w, h };
    };

    // Правобережная набережная слева от центра
    for (let f = -0.02; f < 0.36; f += 0.022 + r() * 0.015) {
      tower(f, 18 + r() * 26, 0.05 + r() * 0.1, { lit: 0.22, fill: "#090c16", beacon: r() < 0.3, refl: "rgba(140,200,255,0.35)" });
    }
    // Plaza Fortum
    const plaza = [];
    for (let f = 0.37; f < 0.69; f += 0.02 + r() * 0.012) {
      if (f > 0.5 && f < 0.565) continue;
      const hf = 0.16 + r() * 0.24 * (1 - Math.abs(f - 0.53) * 2.2);
      plaza.push(tower(f, 26 + r() * 34, Math.max(0.14, hf), { lit: 0.48, antenna: r() < 0.5 }));
    }
    // Мегабашня
    const mw = 64 * S, mx = X(0.53) - mw / 2, mh = H * 0.5, my = HZ - mh;
    c.fillStyle = "#070a12";
    c.beginPath();
    c.moveTo(mx, HZ); c.lineTo(mx, my + 30 * S); c.lineTo(mx + mw * 0.18, my); c.lineTo(mx + mw * 0.82, my); c.lineTo(mx + mw, my + 30 * S); c.lineTo(mx + mw, HZ);
    c.fill();
    drawWindows(c, r, mx, my + 26 * S, mw, mh - 26 * S, { lit: 0.58, colors: ["#bff3ff", "#e8f4ff", "#9fe8ff"], cw: 5, ch: 7 }, lit);
    c.fillStyle = "#1c2433";
    c.fillRect(mx + mw / 2 - 1.5, my - H * 0.08, 3, H * 0.08);
    beacons.push({ x: mx + mw / 2, y: my - H * 0.08, p: 0, big: true });
    // Неоновый венец и вывеска
    c.save();
    c.shadowColor = "#ff2fbf";
    c.shadowBlur = 18;
    c.fillStyle = "#ff6fd6";
    c.fillRect(mx + 4 * S, my + 14 * S, mw - 8 * S, 3 * S);
    c.shadowColor = "#e4ff3a";
    c.fillStyle = "#f1ff8a";
    c.font = `700 ${Math.round(9 * S)}px "JetBrains Mono", monospace`;
    c.textAlign = "center";
    c.fillText("PLAZA FORTUM", mx + mw / 2, my + 30 * S);
    c.restore();
    towers.push({ x: mx, y: my, w: mw, h: mh, col: "rgba(255,111,214,0.55)" });

    // Вертикальные неоновые вывески
    plaza.forEach((t, i) => {
      if (i % 3 !== 1) return;
      const col = ["#ff2fbf", "#27d7ff", "#e4ff3a"][i % 3 === 1 ? Math.floor(r() * 3) : 0];
      const nx = t.x + t.w - 6 * S, ny = t.y + t.h * (0.15 + r() * 0.3), nh = Math.min(t.h * 0.4, 70 * S);
      c.save();
      c.shadowColor = col;
      c.shadowBlur = 14;
      c.fillStyle = col;
      c.fillRect(nx, ny, 4 * S, nh);
      c.restore();
      c.fillStyle = "rgba(255,255,255,0.75)";
      c.fillRect(nx + 1.2 * S, ny, 1.4 * S, nh);
      neon.push({ x: nx, w: 4 * S, col });
    });

    // Правобережная застройка справа от Plaza
    for (let f = 0.69; f < 1.04; f += 0.02 + r() * 0.015) {
      tower(f, 20 + r() * 30, 0.04 + r() * 0.08, { lit: 0.14, fill: "#0b0a0e", colors: ["#ffb35c", "#ffd58a", "#9fe8ff"], beacon: r() < 0.2, refl: "rgba(255,180,90,0.3)" });
    }

    // Река Арес
    const rg = c.createLinearGradient(0, HZ, 0, RB);
    rg.addColorStop(0, "#0b0c18");
    rg.addColorStop(1, "#04050a");
    c.fillStyle = rg;
    c.fillRect(0, HZ, W, RB - HZ + 4);
    c.fillStyle = "rgba(39,215,255,0.35)";
    c.fillRect(0, HZ, W, 1);

    // Отражения
    const rr = R(41);
    const reflect = (x, w, h, col, strength) => {
      const n = Math.min((RB - HZ) / (3 * S), (h * 0.7) / (3 * S));
      for (let k = 0; k < n; k++) {
        const y = HZ + 2 + k * 3 * S;
        const a = strength * (1 - k / n) * (0.4 + rr() * 0.6);
        if (rr() < 0.25) continue;
        const jw = w * (0.3 + rr() * 0.7), jx = x + (w - jw) * rr() + (rr() - 0.5) * 4 * S;
        c.globalAlpha = a;
        c.fillStyle = col;
        c.fillRect(jx, y, jw, 1.2 * S);
      }
      c.globalAlpha = 1;
    };
    towers.forEach((t) => reflect(t.x, t.w, t.h, t.col, 0.45));
    neon.forEach((n) => reflect(n.x - 2 * S, n.w + 4 * S, H * 0.25, n.col, 0.9));

    return {
      beacons,
      lit,
      neon,
      plaza: { x: mx + mw / 2, y: my - H * 0.08 },
      river: { x: X(0.8), y: HZ + (RB - HZ) * 0.42 },
      reflections: towers.map((t) => ({ x: t.x, w: t.w })).concat(neon.map((n) => ({ x: n.x, w: n.w, neon: n.col })))
    };
  };

  /* ── Передний план: Лазурная сторона — набережная, фонари, парк, жилая башня ── */
  const drawFront = () => {
    const c = ctx.front;
    c.clearRect(0, 0, W, H);
    const r = R(53);
    const top = RB;

    // Парапет
    const eg = c.createLinearGradient(0, top, 0, H);
    eg.addColorStop(0, "#06080d");
    eg.addColorStop(1, "#020305");
    c.fillStyle = eg;
    c.fillRect(0, top, W, H - top);
    c.fillStyle = "rgba(39,215,255,0.35)";
    c.fillRect(0, top, W, 1);

    // Ограждение
    const railY = top - 22 * S;
    c.fillStyle = "#0b1018";
    c.fillRect(0, railY, W, 2.5 * S);
    for (let x = OX % (26 * S); x < W; x += 26 * S) c.fillRect(x, railY, 2 * S, top - railY);
    c.fillStyle = "rgba(138,233,255,0.25)";
    c.fillRect(0, railY, W, 1);

    // Фонари
    const lamps = [];
    for (let f = 0.06; f < 1.02; f += 0.17) {
      const x = X(f), h = H * 0.13;
      c.fillStyle = "#0b1018";
      c.fillRect(x - 1.5 * S, top - h, 3 * S, h);
      c.fillRect(x - 10 * S, top - h, 20 * S, 3 * S);
      glow(c, x, top - h + 4 * S, 46 * S, "rgba(160,235,255,0.35)");
      c.fillStyle = "#e8fbff";
      c.fillRect(x - 8 * S, top - h + 3 * S, 16 * S, 2 * S);
      const cg = c.createLinearGradient(0, top - h, 0, top);
      cg.addColorStop(0, "rgba(160,235,255,0.10)");
      cg.addColorStop(1, "rgba(160,235,255,0)");
      c.fillStyle = cg;
      c.beginPath();
      c.moveTo(x - 8 * S, top - h + 5 * S);
      c.lineTo(x + 8 * S, top - h + 5 * S);
      c.lineTo(x + 40 * S, top);
      c.lineTo(x - 40 * S, top);
      c.fill();
      lamps.push({ x, y: top - h });
    }

    // Парк (кроны) слева
    for (let i = 0; i < 18; i++) {
      const x = X(r() * 0.2), y = top - (30 + r() * 50) * S, rad = (16 + r() * 26) * S;
      c.fillStyle = "#040a0c";
      c.beginPath();
      c.arc(x, y, rad, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "rgba(39,215,255,0.07)";
      c.beginPath();
      c.arc(x - rad * 0.3, y - rad * 0.3, rad * 0.5, 0, Math.PI * 2);
      c.fill();
    }

    // Жилая башня Лазурной стороны у левого края
    const tx = X(-0.01), tw = Math.max(70, VW * 0.07), ty = H * 0.12;
    const tg = c.createLinearGradient(tx, 0, tx + tw, 0);
    tg.addColorStop(0, "#03060a");
    tg.addColorStop(0.7, "#0a1622");
    tg.addColorStop(1, "#0f2233");
    c.fillStyle = tg;
    c.beginPath();
    c.moveTo(tx, H);
    c.lineTo(tx, ty + 30 * S);
    c.quadraticCurveTo(tx, ty, tx + 30 * S, ty);
    c.lineTo(tx + tw, ty);
    c.lineTo(tx + tw, H);
    c.fill();
    c.fillStyle = "rgba(138,233,255,0.5)";
    c.fillRect(tx + tw - 1.5, ty, 1.5, H - ty);
    drawWindows(c, r, tx, ty + 20 * S, tw - 4, H - ty, { lit: 0.25, colors: ["#bfefff", "#ffe2a8"], cw: 9, ch: 12 });

    return { azure: { x: X(0.91), y: lamps.length ? lamps[lamps.length - 2].y : top - H * 0.13 } };
  };

  /* ───── Анимация ───── */
  const vehicles = [];
  const smoke = [];
  const ripples = [];
  const flickers = [];
  const barges = [];

  const initFx = () => {
    vehicles.length = 0;
    const r = R(71);
    for (let i = 0; i < 11; i++) {
      const dir = r() < 0.5 ? -1 : 1;
      vehicles.push({
        x: X(r()), y: HZ - H * (0.12 + r() * 0.32),
        v: dir * (18 + r() * 50) * S, len: (14 + r() * 30) * S,
        col: ["255,255,255", "138,233,255", "255,111,214", "228,255,58"][Math.floor(r() * 4)],
        blink: r() < 0.3
      });
    }
    barges.length = 0;
    barges.push({ x: X(0.15), y: HZ + (RB - HZ) * 0.3, v: 7 * S, w: 120 * S });
    barges.push({ x: X(0.72), y: HZ + (RB - HZ) * 0.62, v: -5 * S, w: 160 * S });
    smoke.length = 0;
    ripples.length = 0;
    flickers.length = 0;
  };

  const drawFx = (t, dt) => {
    const c = ctx.fx, cf = ctx.fxfar;
    c.clearRect(0, 0, W, H);
    cf.clearRect(0, 0, W, H);

    // Дым из труб Крейнера (дальний план)
    if (geo.far.chimneys.length && smoke.length < 70 && Math.random() < dt * 9) {
      const ch = geo.far.chimneys[Math.floor(Math.random() * geo.far.chimneys.length)];
      smoke.push({ x: ch.x, y: ch.y, r: 4 * S, vx: (6 + Math.random() * 8) * S, vy: -(8 + Math.random() * 8) * S, life: 0, max: 7 + Math.random() * 5 });
    }
    for (let i = smoke.length - 1; i >= 0; i--) {
      const p = smoke[i];
      p.life += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.r += 5 * S * dt;
      const k = p.life / p.max;
      if (k >= 1) { smoke.splice(i, 1); continue; }
      const a = 0.22 * Math.sin(Math.PI * Math.min(1, k * 1.4));
      glowFast(cf, p.x, p.y, p.r, "150,140,95", a, true);
    }
    // Пожары Пепельника
    geo.far.fires.forEach((f) => {
      const a = 0.35 + 0.25 * Math.sin(t * 3.1 + f.p) + 0.15 * Math.sin(t * 7.3 + f.p * 2);
      glowFast(cf, f.x, f.y, 14 * S * f.s, "255,110,40", a, true);
    });

    // Прожекторы над Plaza Fortum
    c.save();
    c.globalCompositeOperation = "lighter";
    [[-0.35, 0.5], [0.3, 0.7]].forEach(([base, speed], i) => {
      const ang = base + Math.sin(t * speed * 0.3 + i * 2) * 0.32;
      const ox = geo.mid.plaza.x + (i ? 40 : -40) * S, oy = HZ - H * 0.32;
      const len = H * 0.7;
      const ex = ox + Math.sin(ang) * len, ey = oy - Math.cos(ang) * len;
      const px = Math.cos(ang) * 46 * S, py = Math.sin(ang) * 46 * S;
      const g = c.createLinearGradient(ox, oy, ex, ey);
      g.addColorStop(0, "rgba(138,233,255,0.09)");
      g.addColorStop(1, "rgba(138,233,255,0)");
      c.fillStyle = g;
      c.beginPath();
      c.moveTo(ox, oy);
      c.lineTo(ex - px, ey - py);
      c.lineTo(ex + px, ey + py);
      c.closePath();
      c.fill();
    });
    c.restore();

    // Мерцание окон
    if (geo.mid.lit.length && Math.random() < dt * 6) {
      const w = geo.mid.lit[Math.floor(Math.random() * geo.mid.lit.length)];
      flickers.push({ w, until: t + 0.6 + Math.random() * 3, off: Math.random() < 0.6 });
    }
    for (let i = flickers.length - 1; i >= 0; i--) {
      const f = flickers[i];
      if (t > f.until) { flickers.splice(i, 1); continue; }
      c.fillStyle = f.off ? "#080b14" : "#ffffff";
      c.globalAlpha = f.off ? 1 : 0.9;
      c.fillRect(f.w.x, f.w.y, f.w.w, f.w.h);
    }
    c.globalAlpha = 1;

    // Огни на крышах
    geo.mid.beacons.forEach((b) => {
      const on = Math.sin(t * 2.2 + b.p) > 0.3;
      if (!on) return;
      glowFast(c, b.x, b.y, (b.big ? 12 : 6) * S, "255,59,71", 0.9);
    });

    // Летающий транспорт
    vehicles.forEach((v) => {
      v.x += v.v * dt;
      if (v.v > 0 && v.x > W + 60) v.x = -60;
      if (v.v < 0 && v.x < -60) v.x = W + 60;
      const tail = v.x - Math.sign(v.v) * v.len;
      const g = c.createLinearGradient(tail, v.y, v.x, v.y);
      g.addColorStop(0, `rgba(${v.col},0)`);
      g.addColorStop(1, `rgba(${v.col},0.55)`);
      c.strokeStyle = g;
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(tail, v.y);
      c.lineTo(v.x, v.y);
      c.stroke();
      if (!v.blink || Math.sin(t * 8 + v.x) > 0) glowFast(c, v.x, v.y, 5 * S, v.col, 0.95);
    });

    // Баржи на Аресе
    barges.forEach((b) => {
      b.x += b.v * dt;
      if (b.v > 0 && b.x > W + b.w) b.x = -b.w;
      if (b.v < 0 && b.x < -b.w) b.x = W + b.w;
      c.fillStyle = "#020306";
      c.beginPath();
      c.moveTo(b.x, b.y);
      c.lineTo(b.x + b.w, b.y);
      c.lineTo(b.x + b.w * 0.94, b.y + 7 * S);
      c.lineTo(b.x + b.w * 0.04, b.y + 7 * S);
      c.fill();
      c.fillRect(b.x + b.w * 0.72, b.y - 9 * S, b.w * 0.14, 9 * S);
      [[0.08, "228,255,58"], [0.78, "255,255,255"], [0.96, "255,59,71"]].forEach(([f, col]) => glowFast(c, b.x + b.w * f, b.y - 2 * S, 6 * S, col, 0.9));
      c.fillStyle = "rgba(228,255,58,0.18)";
      c.fillRect(b.x + b.w * 0.06, b.y + 9 * S, 3 * S, 14 * S);
    });

    // Рябь на воде
    if (ripples.length < 50 && Math.random() < dt * 30) {
      const rf = geo.mid.reflections[Math.floor(Math.random() * geo.mid.reflections.length)];
      if (rf) ripples.push({ x: rf.x + Math.random() * rf.w, y: HZ + 4 + Math.random() * (RB - HZ - 8), w: (4 + Math.random() * 14) * S, life: 0, max: 0.6 + Math.random() * 1.2, col: rf.neon || "#bff3ff" });
    }
    for (let i = ripples.length - 1; i >= 0; i--) {
      const p = ripples[i];
      p.life += dt;
      if (p.life > p.max) { ripples.splice(i, 1); continue; }
      c.globalAlpha = 0.6 * Math.sin((p.life / p.max) * Math.PI);
      c.fillStyle = p.col;
      c.fillRect(p.x, p.y, p.w, 1);
    }
    c.globalAlpha = 1;
  };

  const loop = (now) => {
    if (!running) return;
    const t = now / 1000;
    const dt = Math.min(0.05, last ? t - last : 0.016);
    last = t;
    drawFx(t, dt);
    raf = requestAnimationFrame(loop);
  };

  const startLoop = () => {
    if (running || env.reduced || !visible || document.hidden || !geo) return;
    running = true;
    last = 0;
    raf = requestAnimationFrame(loop);
  };
  const stopLoop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  /* ───── Метки районов ───── */
  const markers = () => {
    $$(".marker", scene).forEach((m) => m.remove());
    const layerOf = (name) => $(`[data-markers="${name}"]`, scene);
    const clampX = (x) => Math.max(90, Math.min(W - 100, x));
    const list = [
      { layer: "mid", p: geo.mid.plaza, t: "Plaza Fortum", s: "Правый берег · центр", c: "var(--cyan)", len: 34, keep: true },
      { layer: "far", p: geo.far.chimneys[4] || geo.far.chimneys[0], t: "Крейнер", s: "Промзона · смог", c: "var(--acid)", len: 46 },
      { layer: "far", p: geo.far.heil, t: "Старый Хэйль", s: "Трущобы", c: "#ffb35c", len: 190 },
      { layer: "far", p: geo.far.ashes, t: "Пепельник", s: "Зона анархии", c: "var(--red)", len: 110 },
      { layer: "mid", p: geo.mid.river, t: "Река Арес", s: "Мосты · баржи", c: "var(--cyan-2)", len: 26 },
      { layer: "front", p: geo.front.azure, t: "Лазурная сторона", s: "Левый берег", c: "var(--magenta)", len: 30 }
    ];
    list.forEach((m, i) => {
      if (!m.p) return;
      const el = document.createElement("div");
      el.className = "marker" + (m.keep ? " marker--keep" : "");
      el.style.cssText = `left:${clampX(m.p.x)}px;top:${m.p.y}px;--mk:${m.c};--len:${m.len}px`;
      el.innerHTML = `<span class="marker__label">${esc(m.t)}<small>${esc(m.s)}</small></span><span class="marker__line"></span><span class="marker__dot"></span>`;
      layerOf(m.layer).appendChild(el);
      setTimeout(() => el.classList.add("is-on"), env.reduced ? 0 : 900 + i * 260);
    });
  };

  /* ───── Параллакс ───── */
  const layers = $$(".hero__layer", scene).map((el) => ({ el, d: parseFloat(el.dataset.depth) || 0 }));
  const content = $(".hero__content", hero);
  let target = { x: 0, y: 0 }, cur = { x: 0, y: 0 }, scrollY = 0, pRaf = 0;

  const applyParallax = () => {
    pRaf = 0;
    if (env.reduced) {
      layers.forEach((l) => { l.el.style.transform = ""; });
      content.style.transform = "";
      return;
    }
    cur.x += (target.x - cur.x) * 0.12;
    cur.y += (target.y - cur.y) * 0.12;
    const hh = hero.offsetHeight;
    const sy = Math.min(scrollY, hh);
    layers.forEach((l) => {
      const tx = -cur.x * l.d * 40;
      const ty = sy * l.d * 0.9 - cur.y * l.d * 18;
      l.el.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0)`;
    });
    content.style.transform = `translate3d(0, ${(sy * 0.18).toFixed(1)}px, 0)`;
    if (Math.abs(target.x - cur.x) > 0.002 || Math.abs(target.y - cur.y) > 0.002) pRaf = requestAnimationFrame(applyParallax);
  };
  const queueParallax = () => { if (!pRaf) pRaf = requestAnimationFrame(applyParallax); };

  window.addEventListener("scroll", () => {
    scrollY = window.scrollY;
    if (scrollY < hero.offsetHeight + 50) queueParallax();
  }, { passive: true });

  if (env.finePointer) {
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      target.x = (e.clientX - r.left) / r.width - 0.5;
      target.y = (e.clientY - r.top) / r.height - 0.5;
      queueParallax();
    });
    hero.addEventListener("pointerleave", () => { target.x = 0; target.y = 0; queueParallax(); });
  }

  /* ───── Сборка ───── */
  const build = () => {
    sizeCanvases();
    drawSky();
    const far = drawFar();
    const mid = drawMid();
    const front = drawFront();
    geo = { far, mid, front };
    initFx();
    drawFx(performance.now() / 1000, 0.016);
    markers();
  };

  const init = () => {
    renderText();

    if (site.images && site.images.hero) {
      const img = $("#hero-photo");
      img.src = site.images.hero;
      img.hidden = false;
      img.addEventListener("error", () => { img.hidden = true; hero.classList.remove("has-photo"); build(); startLoop(); });
      hero.classList.add("has-photo");
    }

    build();
    hero.classList.add("is-ready");

    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
        if (visible) startLoop(); else stopLoop();
      }).observe(hero);
    }
    document.addEventListener("visibilitychange", () => (document.hidden ? stopLoop() : startLoop()));
    env.onReduceChange(() => { if (env.reduced) stopLoop(); else startLoop(); queueParallax(); });

    let lastW = window.innerWidth;
    window.addEventListener("resize", debounce(() => {
      // На мобильных высота меняется при скрытии адресной строки — перерисовываем только при смене ширины
      if (Math.abs(window.innerWidth - lastW) < 2 && Math.abs(hero.offsetHeight * 1.1 - H) < 120) return;
      lastW = window.innerWidth;
      build();
    }, 200));

    startLoop();
  };

  M.ui.hero = { init };
})();
