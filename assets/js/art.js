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

  /* ═════════════ СХЕМА ТЕЛА (силуэт 485×810) ═════════════ */
  // Контур векторизован из присланного силуэта персонажа
  const SILHOUETTE = "M204.6 5 206 4.9 207 5.8 209 9 226 43.5 230.9 52 232 52.8 236 52.9 241 55.7 244 56.6 251 54.4 252.6 53 257.8 44 276 6.6 278 4.5 280 5.6 280.5 11 276.5 52 277.5 63 277.1 74 279.5 77 278.4 82 279 83.3 281 84.4 288 85.7 289.7 87 289 89.4 283 94.7 282.6 96 283.9 98 290.3 102 291.7 104 291 105.4 286 109 286 111 289.3 116 289.9 118 289 119.4 284.8 122 284.4 124 285.9 129 285 130.4 281 133 281 138.6 276.9 143 276.5 145 278 146.4 303.4 158 305.6 160 307.1 164 309 165.7 311 165.6 318 161.3 322 161.2 350 172 352.4 174 356.1 179 360.7 187 363.1 193 366.1 201 369.3 214 370.4 223 370.1 225 366.8 230 363 233.1 362.3 235 369.1 249 371.3 256 371.7 286 374.9 292 386.1 309 389.7 316 392.4 323 395.5 338 395.5 362 394.5 368 394.5 374 395.9 384 399.5 394 399.3 398 397.5 405 397.5 422 401.3 445 397.1 459 391 470.8 374 490.5 371 492.9 369 492.9 366.6 491 362.9 485 361.7 482 361.7 480 363 476 372.1 462 372.7 459 371.8 451 370 449.8 368.2 451 367.1 456 365 460.5 363 463.4 360.9 465 358 466.1 355 465.6 353 464 351.7 461 353.3 453 353.7 446 356.1 438 357.2 430 365.7 416 367.3 410 367.5 405 366.3 396 364.7 390 364.8 384 357.5 369 352.4 362 344.6 354 338.9 345 336.9 339 335.7 332 334.5 313 332.3 298 321.9 283 316 271.1 314 270 305.4 283 294.6 296 293.6 299 294.5 305 294.5 319 296.3 327 298 328.9 304 328.6 308 329.5 311 331.5 313.9 335 321.5 361 330.3 385 330.3 390 328 396 324 399 317.3 401 316.4 403 318.3 408 327.3 421 329.9 436 336.4 459 341.1 479 340.8 483 337.7 491 337.5 500 336.1 510 334.1 516 327.9 530 335.1 547 338.1 558 338.9 579 344.2 588 350.1 602 353.1 611 355.3 623 354.1 632 346.9 658 344.5 674 344.5 697 348.5 712 348.3 719 345.6 726 345.5 732 353.3 759 357.6 767 368 777.6 371.7 783 376.1 796 375.6 800 373.2 802 370 803.1 353 802.5 333 805.4 327 805.1 321.5 803 317.5 800 314.3 795 312.8 789 304.6 783 300.6 778 299.5 774 299.5 766 303.3 749 303.5 739 305.5 728 305.1 724 301.7 716 300.7 708 302.8 701 298.7 691 298.9 688 301.9 679 297.7 667 279.8 632 277.9 626 280.5 600 278.5 588 281.3 576 281.3 569 279.2 561 270.9 546 270.5 542 272.3 531 264.3 514 263 509.5 260.4 496 248.5 457 244.4 445 243 443.1 242 443.1 240.6 445 237.5 454 230.8 478 224.9 496 222.1 511 213.2 530 212.8 532 214.5 542 214.3 546 206.3 560 203.5 570 203.7 576 206.5 587 206.3 592 204.8 599 207.1 627 204.7 633 188.8 664 183.2 678 183.2 680 186.4 690 182.5 700 184.3 709 183.3 716 180.2 724 179.5 728 182.2 743 181.7 749 185.5 765 185.3 774 183.7 779 181 782.4 172.2 789 170.7 795 167.5 800 164 802.7 158 805.3 152 805.3 135 802.6 114 802.4 111 801.2 109.1 798 110.9 789 113.5 783 119.6 775 125.4 770 131.2 761 140.3 732 139.3 725 136.7 718 136.5 713 136.9 709 140.5 697 140.5 673 138.3 658 130.7 630 130.5 619 133.2 608 136.9 598 141.3 588 147.1 578 147.5 572 146.5 563 147.9 555 150.9 545 157.1 530 149.6 512 148.5 507 148.3 492 144.5 484 143.9 480 145.2 474 154.4 445 159.5 422 162 417.2 173.2 401 172.6 399 169 397.3 162 392.4 160.6 390 159.6 386 169.6 341 172 335.9 177 331.6 180 330.4 186 330.3 187.6 329 190.5 316 190.7 298 189.4 295 178.9 283 172 271.7 170 270.5 169 271.3 163 283.2 153 297.2 151.7 303 150.5 314 149.3 334 147.1 343 142.1 352 126.9 370 120.2 384 120.3 390 118.7 397 117.8 406 118.7 414 128.1 430 128.9 436 131.3 445 133.3 461 132 464 130 465.7 127 466.3 124 465.2 122 464 120.6 462 116.5 451 115 449.9 113 451.3 111.6 458 112.5 462 119 471 122.7 478 123.4 481 122.6 485 118.4 491 116 492.9 113 492.3 109 488.5 94 470.8 87.9 459 83.7 445 87.5 423 87.5 404 85.7 398 85.5 394 89.3 384 90.5 375 90.5 367 89.5 361 89.7 337 92.6 323 96.3 314 110.1 292 113.3 285 113.7 257 115.9 249 122.8 235 122 233.1 119 230.8 115.3 226 114.7 220 117.6 206 121.5 194 128.9 179 132 174.6 135 172 162 161.6 167 161.1 173 165.1 176 165.3 179.4 160 181.6 158 204.1 147 204.2 146 197.1 138 198.9 133 198.7 131 197 129.4 192.5 127 193.1 121 191 117.9 187.8 115 187.9 113 192.5 109 194.1 106 193.3 104 188.4 101 187.4 99 189 97.3 194 95.1 196 93 196 91 191.9 86 192 84.5 193 83.8 201 82.1 204 80.5 205.2 79 207.1 73 206.5 66 207.5 59 207.5 44 203.5 12 203.6 7Z";

  const anatomy = () => {
    const g = uid("an");
    return svg("0 0 485 810", `
    <defs>
      <clipPath id="${g}c"><path d="${SILHOUETTE}"/></clipPath>
      <pattern id="${g}p" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="1" fill="#27d7ff" opacity=".09"/></pattern>
    </defs>
    <path class="body-fill" d="${SILHOUETTE}"/>
    <g clip-path="url(#${g}c)">
      <rect width="485" height="810" fill="url(#${g}p)"/>
      <ellipse class="zone zone--brain" cx="242" cy="82" rx="46" ry="34"/>
      <rect class="zone zone--eyes" x="200" y="106" width="86" height="16"/>
      <ellipse class="zone zone--organs" cx="242" cy="300" rx="64" ry="96"/>
      <rect class="zone zone--arms" x="78" y="176" width="82" height="330"/>
      <rect class="zone zone--arms" x="325" y="176" width="82" height="330"/>
      <rect class="zone zone--legs" x="135" y="440" width="215" height="370"/>
    </g>
    <path class="zone zone--nervous" d="M242 96V438M242 182L172 206L132 300L112 430M242 182L312 206L352 300L372 430M242 438L198 520L178 700L162 790M242 438L286 520L306 700L322 790"/>
    <path class="body-line" d="${SILHOUETTE}"/>
  `, "", "xMidYMid meet");
  };

  // Позиции точек на схеме (проценты от размеров схемы)
  const anatomySpots = {
    brain: [47, 7.5],
    eyes: [62, 14.6],
    nervous: [50, 21.6],
    organs: [50, 37],
    arms: [24.3, 44.4],
    legs: [40.2, 69.1],
    skin: [72.6, 79]
  };

  M.art = { district, lore, emblem, typeGlyph, anatomy, anatomySpots, rng };
})();
