/*
 * Встроенная графика портала (SVG). Используется, пока в данных не указан путь к своей иллюстрации.
 * Все изображения — декоративные и не добавляют фактов в канон.
 */
(function () {
  "use strict";
  const M = window.MANTICORA;

  let uidN = 0;
  const uid = (p) => p + "-" + ++uidN;

  // Детерминированный генератор — картинки одинаковы при каждой загрузке
  const rng = (seed) => () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
  const svg = (vb, body, cls = "", ratio = "xMidYMid slice") =>
    `<svg class="${cls}" viewBox="${vb}" preserveAspectRatio="${ratio}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">${body}</svg>`;

  // Окна здания
  const windows = (r, x, y, w, h, o = {}) => {
    const cw = o.cw || 7, ch = o.ch || 9, ww = o.ww || 3, wh = o.wh || 4;
    const lit = o.lit == null ? 0.35 : o.lit;
    const cols = o.colors || ["#9fe8ff", "#e8f4ff", "#ffd58a"];
    let s = "";
    for (let yy = y + 6; yy < y + h - 4; yy += ch) {
      for (let xx = x + 4; xx < x + w - 4; xx += cw) {
        if (r() < lit) s += `<rect x="${xx.toFixed(1)}" y="${yy.toFixed(1)}" width="${ww}" height="${wh}" fill="${pick(r, cols)}" opacity="${(0.35 + r() * 0.6).toFixed(2)}"/>`;
      }
    }
    return s;
  };

  /* ═════════════ РАЙОНЫ (800×400) ═════════════ */
  const district = {
    plaza() {
      const r = rng(11), g = uid("pl");
      let s = `<defs>
        <linearGradient id="${g}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#04050b"/><stop offset=".62" stop-color="#170a26"/><stop offset="1" stop-color="#2c0c30"/></linearGradient>
        <radialGradient id="${g}g" cx=".52" cy=".7" r=".55"><stop offset="0" stop-color="#27d7ff" stop-opacity=".35"/><stop offset="1" stop-color="#27d7ff" stop-opacity="0"/></radialGradient>
        <filter id="${g}b"><feGaussianBlur stdDeviation="3"/></filter>
      </defs>
      <rect width="800" height="400" fill="url(#${g}s)"/><rect width="800" height="400" fill="url(#${g}g)"/>`;
      // Дальний план
      for (let i = 0; i < 34; i++) {
        const w = 18 + r() * 30, h = 70 + r() * 150, x = i * 24 - 10;
        s += `<rect x="${x}" y="${400 - h}" width="${w}" height="${h}" fill="#0d1020"/>`;
      }
      // Башни
      const towers = [[40, 70, 230], [120, 60, 290], [190, 80, 210], [280, 64, 300], [470, 70, 320], [550, 84, 250], [640, 66, 300], [712, 80, 220]];
      towers.forEach(([x, w, h]) => {
        const y = 400 - h;
        s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#080b14"/><rect x="${x}" y="${y}" width="1" height="${h}" fill="#27d7ff" opacity=".35"/>`;
        s += windows(r, x, y, w, h, { lit: 0.42 });
        s += `<rect x="${x + w / 2 - 1}" y="${y - 14}" width="2" height="14" fill="#2a3346"/><circle cx="${x + w / 2}" cy="${y - 15}" r="2" fill="#ff3b47"/>`;
      });
      // Мегабашня
      s += `<path d="M352 400V96l18-24h60l18 24v304z" fill="#070a12"/><path d="M400 72V8" stroke="#8ae9ff" stroke-width="2"/><circle cx="400" cy="8" r="3" fill="#ff3b47"/>`;
      s += windows(r, 352, 100, 96, 300, { lit: 0.55, cw: 6, ch: 8 });
      s += `<rect x="358" y="110" width="84" height="5" fill="#ff2fbf" filter="url(#${g}b)"/><rect x="358" y="110" width="84" height="3" fill="#ff8ae0"/>`;
      s += `<text x="400" y="134" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="10" letter-spacing="3" fill="#e4ff3a">PLAZA FORTUM</text>`;
      // Неон
      [[268, 160, "#ff2fbf"], [536, 190, "#e4ff3a"], [630, 140, "#27d7ff"], [110, 170, "#27d7ff"]].forEach(([x, y, c]) => {
        s += `<rect x="${x}" y="${y}" width="7" height="70" fill="${c}" filter="url(#${g}b)" opacity=".9"/><rect x="${x + 2}" y="${y}" width="3" height="70" fill="#fff" opacity=".7"/>`;
      });
      // Летающий транспорт
      for (let i = 0; i < 9; i++) {
        const y = 40 + r() * 170, x = r() * 760, len = 20 + r() * 40, c = pick(r, ["#ffffff", "#8ae9ff", "#ff8ae0"]);
        s += `<line x1="${x}" y1="${y}" x2="${x + len}" y2="${y}" stroke="${c}" stroke-opacity=".35" stroke-width="1"/><circle cx="${x + len}" cy="${y}" r="1.8" fill="${c}"/>`;
      }
      s += `<rect y="392" width="800" height="8" fill="#27d7ff" opacity=".25" filter="url(#${g}b)"/>`;
      return svg("0 0 800 400", s);
    },

    azure() {
      const r = rng(22), g = uid("az");
      let s = `<defs>
        <linearGradient id="${g}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#040811"/><stop offset=".7" stop-color="#0a1d33"/><stop offset="1" stop-color="#0d2a40"/></linearGradient>
        <linearGradient id="${g}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c2c44"/><stop offset="1" stop-color="#03070c"/></linearGradient>
        <filter id="${g}b"><feGaussianBlur stdDeviation="2.5"/></filter>
      </defs>
      <rect width="800" height="400" fill="url(#${g}s)"/>`;
      // Жилые комплексы со скруглёнными верхами
      const blocks = [[30, 80, 200], [130, 70, 250], [220, 90, 180], [330, 74, 230], [430, 88, 270], [540, 70, 210], [630, 96, 240], [740, 60, 190]];
      blocks.forEach(([x, w, h]) => {
        const y = 320 - h;
        s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="#081525"/><rect x="${x + 6}" y="${y + 4}" width="${w - 12}" height="1.5" rx="1" fill="#8ae9ff" opacity=".45"/>`;
        s += windows(r, x + 4, y + 14, w - 8, h - 14, { lit: 0.3, colors: ["#bfefff", "#ffe2a8", "#8ae9ff"], cw: 9, ch: 11, ww: 4, wh: 5 });
      });
      // Парки
      for (let i = 0; i < 26; i++) {
        const x = r() * 800, rr = 14 + r() * 18;
        s += `<circle cx="${x}" cy="${322 - r() * 8}" r="${rr}" fill="#06141a"/><circle cx="${x - rr * 0.3}" cy="${310 - r() * 6}" r="${rr * 0.25}" fill="#27d7ff" opacity=".08"/>`;
      }
      // Набережная и вода
      s += `<rect y="318" width="800" height="82" fill="url(#${g}w)"/><rect y="318" width="800" height="2" fill="#8ae9ff" opacity=".5"/>`;
      for (let i = 0; i < 40; i++) {
        const x = r() * 800, y = 326 + r() * 66, w = 8 + r() * 40;
        s += `<rect x="${x}" y="${y}" width="${w}" height="1.4" fill="${pick(r, ["#8ae9ff", "#ffe2a8"])}" opacity="${(0.15 + r() * 0.4).toFixed(2)}"/>`;
      }
      // Фонари набережной
      for (let x = 20; x < 800; x += 70) s += `<line x1="${x}" y1="318" x2="${x}" y2="296" stroke="#1a3348"/><circle cx="${x}" cy="295" r="3" fill="#bfefff" filter="url(#${g}b)"/>`;
      return svg("0 0 800 400", s);
    },

    kreiner() {
      const r = rng(33), g = uid("kr");
      let s = `<defs>
        <linearGradient id="${g}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0905"/><stop offset=".55" stop-color="#2a2410"/><stop offset="1" stop-color="#3d3315"/></linearGradient>
        <filter id="${g}sm" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
        <filter id="${g}b"><feGaussianBlur stdDeviation="2"/></filter>
        <pattern id="${g}h" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="16" fill="#e4ff3a"/></pattern>
      </defs>
      <rect width="800" height="400" fill="url(#${g}s)"/>`;
      // Трубы и дым
      const chims = [90, 170, 300, 420, 520, 650, 720];
      chims.forEach((x, i) => {
        const h = 170 + r() * 110, y = 330 - h;
        for (let k = 0; k < 4; k++) s += `<ellipse cx="${x + 10 + k * 22}" cy="${y - 20 - k * 26}" rx="${34 + k * 14}" ry="${20 + k * 8}" fill="#8c8256" opacity="${0.26 - k * 0.05}" filter="url(#${g}sm)"/>`;
        s += `<rect x="${x - 7}" y="${y}" width="14" height="${h}" fill="#0b0a07"/><rect x="${x - 7}" y="${y + 14}" width="14" height="5" fill="#e4ff3a" opacity=".35"/><circle cx="${x}" cy="${y - 2}" r="2.4" fill="#ff3b47"/>`;
        if (i % 2) s += `<rect x="${x - 7}" y="${y + 40}" width="14" height="4" fill="#e4ff3a" opacity=".25"/>`;
      });
      // Цеха с пилообразной крышей
      let saw = "M0 400V300";
      for (let x = 0; x <= 800; x += 40) saw += `L${x} 286L${x + 40} 300`;
      saw += "V400z";
      s += `<path d="${saw}" fill="#0d0c08"/>`;
      // Пятиэтажки
      for (let x = 10; x < 800; x += 92) {
        s += `<rect x="${x}" y="318" width="70" height="60" fill="#100e0a"/>`;
        s += windows(r, x, 318, 70, 60, { lit: 0.5, colors: ["#ffb347", "#ffd58a"], cw: 8, ch: 11, ww: 4, wh: 5 });
      }
      // Натриевые фонари
      for (let x = 30; x < 800; x += 60) s += `<circle cx="${x}" cy="${292 + r() * 6}" r="3" fill="#ff9f1c" filter="url(#${g}b)"/>`;
      s += `<rect y="384" width="800" height="16" fill="url(#${g}h)" opacity=".85"/>`;
      s += `<rect width="800" height="400" fill="#e4ff3a" opacity=".04"/>`;
      return svg("0 0 800 400", s);
    },

    leftbank() {
      const r = rng(44), g = uid("lb");
      let s = `<defs>
        <linearGradient id="${g}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05070c"/><stop offset="1" stop-color="#151b2a"/></linearGradient>
        <filter id="${g}b"><feGaussianBlur stdDeviation="2"/></filter>
      </defs>
      <rect width="800" height="400" fill="url(#${g}s)"/>`;
      // Задний ряд панелек
      for (let x = -10; x < 800; x += 66) {
        const h = 150 + r() * 60;
        s += `<rect x="${x}" y="${330 - h}" width="58" height="${h}" fill="#0b0f19"/>`;
        s += windows(r, x, 330 - h, 58, h, { lit: 0.22, colors: ["#ffcf7a", "#9fd8ff", "#7e8cff"], cw: 8, ch: 10, ww: 4, wh: 5 });
      }
      // Передний ряд
      for (let x = 20; x < 800; x += 150) {
        const h = 210 + r() * 40;
        s += `<rect x="${x}" y="${360 - h}" width="104" height="${h}" fill="#0a0d15"/><rect x="${x}" y="${360 - h}" width="104" height="2" fill="#2a3346"/>`;
        s += windows(r, x, 360 - h, 104, h, { lit: 0.38, colors: ["#ffcf7a", "#ffcf7a", "#9fd8ff", "#7e8cff"], cw: 10, ch: 12, ww: 5, wh: 6 });
      }
      // Улица и вывески
      s += `<rect y="360" width="800" height="40" fill="#06080d"/>`;
      [[70, "#ff2fbf"], [260, "#27d7ff"], [480, "#e4ff3a"], [640, "#ff2fbf"]].forEach(([x, c]) => {
        s += `<rect x="${x}" y="344" width="44" height="9" fill="${c}" filter="url(#${g}b)" opacity=".8"/><rect x="${x + 4}" y="347" width="36" height="3" fill="#fff" opacity=".6"/>`;
      });
      for (let i = 0; i < 6; i++) s += `<rect x="${r() * 800}" y="${372 + r() * 20}" width="${20 + r() * 40}" height="1" fill="#9fd8ff" opacity=".2"/>`;
      return svg("0 0 800 400", s);
    },

    oldheil() {
      const r = rng(55), g = uid("oh");
      let s = `<defs>
        <linearGradient id="${g}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#090706"/><stop offset=".7" stop-color="#1c1510"/><stop offset="1" stop-color="#271c13"/></linearGradient>
        <filter id="${g}b"><feGaussianBlur stdDeviation="2.5"/></filter>
        <filter id="${g}h"><feGaussianBlur stdDeviation="18"/></filter>
      </defs>
      <rect width="800" height="400" fill="url(#${g}s)"/>
      <ellipse cx="400" cy="300" rx="420" ry="60" fill="#5a4330" opacity=".22" filter="url(#${g}h)"/>`;
      // Низкие неровные дома
      let x = -10;
      while (x < 800) {
        const w = 50 + r() * 70, h = 70 + r() * 90, y = 330 - h;
        const j1 = y + r() * 14, j2 = y + r() * 22;
        s += `<path d="M${x} 330V${j1}L${x + w * 0.3} ${y}L${x + w * 0.55} ${j2}L${x + w * 0.7} ${y + 6}L${x + w} ${j1 + 8}V330z" fill="#100c09"/>`;
        s += windows(r, x, y + 20, w, h - 20, { lit: 0.1, colors: ["#ffb35c", "#d98c3a"], cw: 12, ch: 14, ww: 5, wh: 6 });
        if (r() < 0.5) s += `<line x1="${x + w * 0.5}" y1="${y}" x2="${x + w * 0.5 + 4}" y2="${y - 26}" stroke="#2b2119" stroke-width="1.5"/>`;
        x += w + 4;
      }
      // Провода
      for (let i = 0; i < 6; i++) {
        const x1 = r() * 700, x2 = x1 + 80 + r() * 120, y1 = 180 + r() * 60;
        s += `<path d="M${x1} ${y1}Q${(x1 + x2) / 2} ${y1 + 26} ${x2} ${y1 + r() * 20}" fill="none" stroke="#2b2119" stroke-width="1"/>`;
      }
      // Разбитая дорога
      s += `<rect y="330" width="800" height="70" fill="#0c0907"/>`;
      for (let i = 0; i < 14; i++) {
        const cx = r() * 800, cy = 340 + r() * 50;
        s += `<path d="M${cx} ${cy}l${10 + r() * 20} ${r() * 8 - 4}l${8 + r() * 14} ${r() * 10 - 5}" fill="none" stroke="#3a2c20" stroke-width="1"/>`;
      }
      s += `<line x1="520" y1="330" x2="520" y2="250" stroke="#2b2119" stroke-width="3"/><circle cx="520" cy="248" r="5" fill="#ffb35c" filter="url(#${g}b)"/><path d="M520 252L470 330H570z" fill="#ffb35c" opacity=".06"/>`;
      return svg("0 0 800 400", s);
    },

    ashes() {
      const r = rng(66), g = uid("as");
      let s = `<defs>
        <linearGradient id="${g}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#060303"/><stop offset=".6" stop-color="#220605"/><stop offset="1" stop-color="#4a0d07"/></linearGradient>
        <radialGradient id="${g}f" cx=".5" cy="1" r=".7"><stop offset="0" stop-color="#ff5a1f" stop-opacity=".55"/><stop offset="1" stop-color="#ff3b47" stop-opacity="0"/></radialGradient>
        <filter id="${g}b"><feGaussianBlur stdDeviation="4"/></filter>
        <filter id="${g}sm" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="16"/></filter>
      </defs>
      <rect width="800" height="400" fill="url(#${g}s)"/><rect width="800" height="400" fill="url(#${g}f)"/>`;
      // Столбы дыма
      [140, 420, 660].forEach((x) => {
        for (let k = 0; k < 5; k++) s += `<ellipse cx="${x + k * 16}" cy="${300 - k * 50}" rx="${30 + k * 14}" ry="${26 + k * 6}" fill="#0a0505" opacity="${0.55 - k * 0.08}" filter="url(#${g}sm)"/>`;
      });
      // Руины
      let x = -20;
      while (x < 820) {
        const w = 40 + r() * 80, h = 60 + r() * 150, y = 340 - h;
        const pts = [[x, 340], [x, y + r() * 30], [x + w * 0.2, y + r() * 40], [x + w * 0.35, y], [x + w * 0.5, y + 30 + r() * 40], [x + w * 0.65, y + 10 + r() * 30], [x + w * 0.85, y + 50 + r() * 50], [x + w, y + 70 + r() * 40], [x + w, 340]];
        s += `<path d="M${pts.map((p) => p[0].toFixed(0) + " " + p[1].toFixed(0)).join("L")}z" fill="#0b0505"/>`;
        for (let k = 0; k < 4; k++) s += `<rect x="${x + 6 + r() * (w - 18)}" y="${y + 40 + r() * (h - 60)}" width="8" height="10" fill="#1d0806"/>`;
        if (r() < 0.5) s += `<line x1="${x + w * 0.4}" y1="${y + 10}" x2="${x + w * 0.4 + 30}" y2="${y - 20}" stroke="#2a0d09" stroke-width="3"/>`;
        x += w - 6;
      }
      // Огонь
      for (let i = 0; i < 9; i++) {
        const fx = r() * 800, fy = 320 + r() * 30;
        s += `<ellipse cx="${fx}" cy="${fy}" rx="${10 + r() * 14}" ry="${6 + r() * 6}" fill="#ff6a1f" opacity=".8" filter="url(#${g}b)"/><ellipse cx="${fx}" cy="${fy}" rx="4" ry="3" fill="#ffd27a"/>`;
      }
      s += `<rect y="340" width="800" height="60" fill="#080404"/>`;
      // Искры
      for (let i = 0; i < 60; i++) s += `<circle cx="${r() * 800}" cy="${r() * 340}" r="${(0.6 + r() * 1.4).toFixed(1)}" fill="#ff8a3d" opacity="${(0.3 + r() * 0.7).toFixed(2)}"/>`;
      return svg("0 0 800 400", s);
    }
  };

  /* ═════════════ ЛОР (800×600) ═════════════ */
  const lore = {
    republic() {
      const g = uid("rp");
      let s = `<defs>
        <pattern id="${g}d" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="5" cy="5" r="1.2" fill="#fff" opacity=".1"/></pattern>
      </defs>
      <rect width="800" height="600" fill="#0c0b0c"/>
      <rect width="800" height="600" fill="url(#${g}d)"/>
      <path d="M470 -40L900 -40L900 640L330 640z" fill="#c4121f" opacity=".92"/>
      <path d="M600 -40L636 -40L420 640L384 640z" fill="#0c0b0c"/>
      <g fill="none" stroke="#fff" stroke-opacity=".55">
        <circle cx="640" cy="170" r="132" stroke-width="2"/>
        <circle cx="640" cy="170" r="96" stroke-width="1"/>
        <circle cx="640" cy="170" r="40" stroke-width="9" stroke-opacity=".92"/>
        <path d="M640 20V320M490 170H790" stroke-width="1"/>
      </g>
      <circle cx="640" cy="170" r="12" fill="#fff"/>`;
      for (let i = 0; i < 6; i++) s += `<rect x="${560 + i * 34}" y="${360 + (i % 2) * 26}" width="18" height="${300}" fill="#f3f3f3" opacity="${0.85 - i * 0.1}"/>`;
      s += `<text x="40" y="78" font-family="Oswald, Arial Narrow, sans-serif" font-weight="700" font-size="40" fill="#f3f3f3" letter-spacing="6" opacity=".9">КОНТРОЛЬ</text>
      <text x="42" y="106" font-family="Oswald, Arial Narrow, sans-serif" font-weight="600" font-size="15" fill="#ff4d58" letter-spacing="8">ПРОПАГАНДА · РЕПРЕССИИ</text>
      <rect x="40" y="122" width="150" height="4" fill="#c4121f"/>`;
      return svg("0 0 800 600", s, "", "xMidYMin slice");
    },

    seal() {
      const g = uid("sl");
      let ticks = "";
      for (let i = 0; i < 72; i++) {
        const a = (i / 72) * Math.PI * 2, r1 = 236, r2 = i % 6 ? 244 : 256;
        ticks += `<line x1="${400 + Math.cos(a) * r1}" y1="${300 + Math.sin(a) * r1}" x2="${400 + Math.cos(a) * r2}" y2="${300 + Math.sin(a) * r2}"/>`;
      }
      let glyphs = "";
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const x = 400 + Math.cos(a) * 196, y = 300 + Math.sin(a) * 196;
        glyphs += `<g transform="translate(${x} ${y}) rotate(${(a * 180) / Math.PI + 90})"><path d="M-7 -9V9M-7 0H7M7 -9L0 0L7 9" /></g>`;
      }
      const s = `<defs><radialGradient id="${g}c" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#27d7ff" stop-opacity=".45"/><stop offset="1" stop-color="#27d7ff" stop-opacity="0"/></radialGradient></defs>
      <rect width="800" height="600" fill="#05101a"/>
      <circle cx="400" cy="300" r="260" fill="url(#${g}c)"/>
      <g fill="none" stroke="#8ae9ff" stroke-opacity=".55" stroke-width="1.2">
        <g class="spin">${ticks}</g>
        <circle cx="400" cy="300" r="230"/>
        <g class="spin spin--rev">${glyphs}<circle cx="400" cy="300" r="172" stroke-dasharray="4 10"/></g>
        <circle cx="400" cy="300" r="150" stroke-width="2.4" stroke-opacity=".9"/>
        <path d="M400 150L530 375H270z" stroke-width="1.6"/>
        <path d="M400 450L270 225H530z" stroke-width="1.6"/>
        <circle cx="400" cy="300" r="62" stroke-width="6" stroke="#27d7ff" stroke-opacity=".95"/>
        <path d="M338 300H462M400 238V362" stroke-width="10" stroke="#05101a" stroke-opacity="1"/>
        <path d="M338 300H462M400 238V362" stroke-width="2" stroke="#e4ff3a" stroke-opacity="1"/>
      </g>
      <text x="400" y="560" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="14" letter-spacing="8" fill="#8ae9ff" opacity=".7">SEALED · 250</text>`;
      return svg("0 0 800 600", s);
    },

    mages() {
      const g = uid("mg"), r = rng(77);
      const names = ["Молния", "Огонь", "Вода", "Воздух", "Земля"];
      let nodes = "", lines = "";
      const pts = names.map((_, i) => {
        const a = -Math.PI / 2 + (i / 5) * Math.PI * 2;
        return [400 + Math.cos(a) * 170, 300 + Math.sin(a) * 170];
      });
      pts.forEach((p, i) => {
        const q = pts[(i + 2) % 5];
        lines += `<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}"/>`;
        nodes += `<circle cx="${p[0]}" cy="${p[1]}" r="24" fill="#12060f" stroke="#ff2fbf" stroke-width="2"/><circle cx="${p[0]}" cy="${p[1]}" r="6" fill="#ff8ae0"/>
          <text x="${p[0]}" y="${p[1] + (p[1] < 300 ? -36 : 48)}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="13" letter-spacing="3" fill="#ffd1f2">${names[i].toUpperCase()}</text>`;
      });
      let sparks = "";
      for (let i = 0; i < 70; i++) {
        const a = r() * Math.PI * 2, d = 40 + r() * 280;
        sparks += `<circle cx="${400 + Math.cos(a) * d}" cy="${300 + Math.sin(a) * d * 0.8}" r="${(0.6 + r() * 1.8).toFixed(1)}" fill="#ff8ae0" opacity="${(0.2 + r() * 0.7).toFixed(2)}"/>`;
      }
      const s = `<defs><radialGradient id="${g}c" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ff2fbf" stop-opacity=".55"/><stop offset="1" stop-color="#ff2fbf" stop-opacity="0"/></radialGradient>
        <filter id="${g}b"><feGaussianBlur stdDeviation="8"/></filter></defs>
      <rect width="800" height="600" fill="#0c060c"/>
      <circle cx="400" cy="300" r="300" fill="url(#${g}c)"/>
      ${sparks}
      <circle cx="400" cy="300" r="200" fill="none" stroke="#ff2fbf" stroke-opacity=".3"/>
      <g fill="none" stroke="#ff2fbf" stroke-opacity=".6" stroke-width="1.4">${lines}</g>
      <circle cx="400" cy="300" r="44" fill="#ff2fbf" opacity=".6" filter="url(#${g}b)"/>
      <circle cx="400" cy="300" r="16" fill="#fff"/>
      ${nodes}`;
      return svg("0 0 800 600", s);
    },

    cyber() {
      const g = uid("cy");
      let grid = "";
      for (let x = 0; x <= 800; x += 40) grid += `<line x1="${x}" y1="0" x2="${x}" y2="600"/>`;
      for (let y = 0; y <= 600; y += 40) grid += `<line x1="0" y1="${y}" x2="800" y2="${y}"/>`;
      const s = `<rect width="800" height="600" fill="#07111a"/>
      <g stroke="#27d7ff" stroke-opacity=".07">${grid}</g>
      <g fill="none" stroke="#8ae9ff" stroke-width="1.6" stroke-opacity=".85">
        <!-- механическая рука -->
        <path d="M120 470L300 380L330 400L150 500z"/>
        <path d="M300 380L470 300L500 322L330 400"/>
        <circle cx="315" cy="390" r="22"/><circle cx="315" cy="390" r="8"/>
        <circle cx="485" cy="311" r="18"/>
        <path d="M500 300L560 250M505 318L585 290M500 330L575 335M492 340L540 380"/>
        <path d="M560 250l14 -10M585 290l16 -4M575 335l16 4M540 380l8 14"/>
        <path d="M170 470L290 410M190 482L305 425" stroke-opacity=".4"/>
      </g>
      <g fill="none" stroke="#e4ff3a" stroke-width="1" stroke-opacity=".8">
        <path d="M100 540H520" /><path d="M100 534v12M520 534v12"/>
        <path d="M640 120V460"/><path d="M634 120h12M634 460h12"/>
      </g>
      <g fill="none" stroke="#27d7ff" stroke-width="1.2" stroke-opacity=".6">
        <path d="M600 80H700V160H760"/><path d="M600 200H680V260"/><path d="M700 300H760V420H700"/>
        <circle cx="600" cy="80" r="4" fill="#27d7ff"/><circle cx="600" cy="200" r="4" fill="#27d7ff"/><circle cx="760" cy="160" r="4"/>
      </g>
      <text x="100" y="568" font-family="JetBrains Mono, monospace" font-size="12" letter-spacing="3" fill="#e4ff3a" opacity=".8">MANA CONDUCTOR — RARE</text>
      <text x="40" y="60" font-family="JetBrains Mono, monospace" font-size="12" letter-spacing="3" fill="#8ae9ff" opacity=".6">CIVIL / INDUSTRIAL / MILITARY</text>`;
      return svg("0 0 800 600", s);
    },

    logos() {
      const r = rng(88);
      let cells = "";
      for (let y = 20; y < 600; y += 22) {
        for (let x = 20; x < 800; x += 22) {
          const v = r();
          if (v < 0.5) continue;
          const lit = v > 0.93;
          cells += `<rect x="${x}" y="${y}" width="${lit ? 10 : 4}" height="${lit ? 10 : 4}" fill="${lit ? "#f3f8fc" : "#27d7ff"}" opacity="${lit ? 0.9 : (0.08 + r() * 0.25).toFixed(2)}"${lit && r() < 0.5 ? ` class="blink" style="animation-delay:${(r() * 4).toFixed(2)}s"` : ""}/>`;
        }
      }
      let cols = "";
      const chars = "LOGOS01ПЛОТЬУСТАРЕЛА";
      for (let i = 0; i < 12; i++) {
        const x = 30 + i * 66 + r() * 20;
        let t = "";
        for (let k = 0; k < 18; k++) t += `<tspan x="${x}" dy="22">${chars[Math.floor(r() * chars.length)]}</tspan>`;
        cols += `<text y="${-10 + r() * 80}" font-family="JetBrains Mono, monospace" font-size="15" fill="#8ae9ff" opacity="${(0.12 + r() * 0.2).toFixed(2)}">${t}</text>`;
      }
      const s = `<rect width="800" height="600" fill="#080b10"/>${cols}${cells}
      <g fill="none" stroke="#f3f8fc">
        <rect x="300" y="200" width="200" height="200" stroke-opacity=".9" stroke-width="2"/>
        <rect x="330" y="230" width="140" height="140" stroke-opacity=".5"/>
        <rect x="360" y="260" width="80" height="80" stroke-opacity=".35"/>
        <path d="M300 300H220M500 300H580M400 200V140M400 400V460" stroke-opacity=".5"/>
      </g>
      <rect x="388" y="288" width="24" height="24" fill="#f3f8fc"/>
      <text x="400" y="520" text-anchor="middle" font-family="JetBrains Mono, monospace" font-weight="700" font-size="20" letter-spacing="10" fill="#f3f8fc" opacity=".85">ПЛОТЬ УСТАРЕЛА</text>`;
      return svg("0 0 800 600", s);
    },

    abyss() {
      const g = uid("ab"), r = rng(99);
      let cells = "";
      for (let i = 0; i < 46; i++) {
        const a = r() * Math.PI * 2, d = 60 + r() * 230;
        const x = 400 + Math.cos(a) * d * 1.2, y = 300 + Math.sin(a) * d * 0.85, rr = 5 + r() * 16;
        cells += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${rr.toFixed(1)}" fill="#3d0711" stroke="#ff5a6a" stroke-opacity=".5"/><circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(rr * 0.35).toFixed(1)}" fill="#ff5a6a" opacity=".7"/>`;
      }
      let veins = "";
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2 + r() * 0.3;
        const x2 = 400 + Math.cos(a) * 420, y2 = 300 + Math.sin(a) * 340;
        const cx = 400 + Math.cos(a + 0.5) * 180, cy = 300 + Math.sin(a + 0.5) * 140;
        veins += `<path d="M400 300Q${cx.toFixed(0)} ${cy.toFixed(0)} ${x2.toFixed(0)} ${y2.toFixed(0)}"/>`;
      }
      const s = `<defs>
        <radialGradient id="${g}c" cx=".5" cy=".5" r=".55"><stop offset="0" stop-color="#ff2f4f" stop-opacity=".75"/><stop offset=".45" stop-color="#7a0a22" stop-opacity=".6"/><stop offset="1" stop-color="#0b0507" stop-opacity="0"/></radialGradient>
        <filter id="${g}t" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".012" numOctaves="3" seed="4"/><feDisplacementMap in="SourceGraphic" scale="60"/></filter>
      </defs>
      <rect width="800" height="600" fill="#0b0507"/>
      <g filter="url(#${g}t)">
        <circle cx="400" cy="300" r="250" fill="url(#${g}c)"/>
        <g fill="none" stroke="#ff2fbf" stroke-opacity=".35" stroke-width="2">${veins}</g>
        <g>${cells}</g>
        <circle cx="400" cy="300" r="70" fill="#1a0207" stroke="#ff5a6a" stroke-width="3"/>
        <ellipse cx="400" cy="300" rx="12" ry="40" fill="#ff5a6a"/>
      </g>`;
      return svg("0 0 800 600", s);
    }
  };

  /* ═════════════ ЭМБЛЕМЫ (200×200, декоративные) ═════════════ */
  const emblem = {
    asury() {
      let arms = "";
      for (let i = 0; i < 6; i++) {
        arms += `<g transform="rotate(${i * 60} 100 100)"><path d="M100 30C116 48 118 62 104 78L100 70L96 78C82 62 84 48 100 30z" fill="#ff2fbf"/></g>`;
      }
      return svg("0 0 200 200", `
        <circle cx="100" cy="100" r="92" fill="none" stroke="#ff2fbf" stroke-width="2"/>
        <circle cx="100" cy="100" r="84" fill="none" stroke="#ff2fbf" stroke-width="1" stroke-dasharray="2 5"/>
        ${arms}
        <circle cx="100" cy="100" r="22" fill="#0a0609" stroke="#ff2fbf" stroke-width="2"/>
        <path d="M100 86L114 100L100 114L86 100z" fill="#f3f8fc"/>`, "", "xMidYMid meet");
    },
    urkanat() {
      const hex = (r) => Array.from({ length: 6 }, (_, i) => {
        const a = Math.PI / 6 + (i * Math.PI) / 3;
        return (100 + Math.cos(a) * r).toFixed(1) + " " + (100 + Math.sin(a) * r).toFixed(1);
      }).join("L");
      return svg("0 0 200 200", `
        <path d="M${hex(92)}z" fill="#0b0c08" stroke="#e4ff3a" stroke-width="3"/>
        <path d="M${hex(78)}z" fill="none" stroke="#e4ff3a" stroke-width="1" stroke-dasharray="6 4"/>
        <circle cx="100" cy="100" r="44" fill="none" stroke="#c9d4e0" stroke-width="10"/>
        <path d="M74 66L100 104L126 66M100 104V138" fill="none" stroke="#e4ff3a" stroke-width="12" stroke-linejoin="miter"/>
        <g fill="#c9d4e0">${[0, 1, 2, 3, 4, 5].map((i) => { const a = Math.PI / 6 + (i * Math.PI) / 3; return `<circle cx="${(100 + Math.cos(a) * 66).toFixed(1)}" cy="${(100 + Math.sin(a) * 66).toFixed(1)}" r="4"/>`; }).join("")}</g>`, "", "xMidYMid meet");
    },
    parasites() {
      return svg("0 0 200 200", `
        <circle cx="100" cy="100" r="90" fill="none" stroke="#c9d4e0" stroke-width="2" stroke-dasharray="10 4 2 4"/>
        <circle cx="100" cy="100" r="76" fill="none" stroke="#c9d4e0" stroke-width="1"/>
        <path d="M40 100C64 70 136 70 160 100C136 130 64 130 40 100z" fill="#0a0b0d" stroke="#c9d4e0" stroke-width="2"/>
        <rect x="88" y="84" width="24" height="32" fill="#c9d4e0"/>
        <rect x="50" y="138" width="100" height="10" fill="#c9d4e0" opacity=".85"/>
        <rect x="64" y="154" width="72" height="6" fill="#c9d4e0" opacity=".5"/>
        <rect x="58" y="44" width="84" height="8" fill="#c9d4e0" opacity=".7"/>
        <path d="M30 170L170 30" stroke="#c9d4e0" stroke-width="1" opacity=".4"/>`, "", "xMidYMid meet");
    }
  };

  /* ═════════════ ЗНАКИ ТИПОВ ИМПЛАНТОВ ═════════════ */
  const typeGlyph = (type) => {
    const p = {
      civil: '<circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="8" cy="8" r="1.8" fill="currentColor"/>',
      industrial: '<path d="M8 1.5l5.6 3.25v6.5L8 14.5l-5.6-3.25v-6.5z" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="8" cy="8" r="2" fill="currentColor"/>',
      military: '<path d="M8 1.5L14.5 14H1.5z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 6v4" stroke="currentColor" stroke-width="1.6"/>'
    }[type] || "";
    return `<svg class="type-glyph" viewBox="0 0 16 16" aria-hidden="true" focusable="false">${p}</svg>`;
  };

  /* ═════════════ СХЕМА ТЕЛА (220×330) ═════════════ */
  const anatomy = () => svg("0 0 220 330", `
    <g class="body-fill">
      <circle cx="110" cy="38" r="24"/><path d="M80 74H140L148 170L136 180H84L72 170z"/>
    </g>
    <g class="body-line">
      <circle cx="110" cy="38" r="24"/>
      <path d="M100 62V72H120V62"/>
      <path d="M80 74H140L148 170L136 180H84L72 170z"/>
      <path d="M80 76L58 92L44 150L40 196M66 98L58 150L52 192"/>
      <path d="M140 76L162 92L176 150L180 196M154 98L162 150L168 192"/>
      <path d="M86 180L82 250L80 318H100L104 250L108 186"/>
      <path d="M134 180L138 250L140 318H120L116 250L112 186"/>
    </g>
    <path class="zone zone--brain" d="M88 34A22 22 0 0 1 132 34z"/>
    <rect class="zone zone--eyes" x="92" y="36" width="36" height="10"/>
    <path class="zone zone--nervous" d="M110 14V176M110 90L86 104M110 90L134 104M110 130L90 144M110 130L130 144"/>
    <path class="zone zone--organs" d="M90 96H130V160H90z"/>
    <path class="zone zone--arms" d="M80 76L58 92L44 150L40 196L52 192L58 150L66 98L80 90zM140 76L162 92L176 150L180 196L168 192L162 150L154 98L140 90z"/>
    <path class="zone zone--legs" d="M86 180L82 250L80 318H100L104 250L108 186zM134 180L138 250L140 318H120L116 250L112 186z"/>
  `, "", "xMidYMid meet");

  // Позиции точек на схеме (проценты от размеров схемы)
  const anatomySpots = {
    brain: [50, 6.5],
    eyes: [66, 13],
    nervous: [50, 27],
    organs: [50, 39],
    arms: [17, 46],
    legs: [43, 78],
    skin: [76, 62]
  };

  M.art = { district, lore, emblem, typeGlyph, anatomy, anatomySpots, rng };
})();
