/*
 * Раздел «Правила»: вкладки, поиск с подсветкой, перекрёстные ссылки, калькуляторы по правилам.
 */
(function () {
  "use strict";
  const M = window.MANTICORA;
  const { $, $$, esc, md, plain, fmt, pct, onRoute, setHash, scrollToEl, flash, debounce, clamp, num } = M.core;
  const R = M.data.rules;
  const I = M.data.implants;

  const tabs = R.tabs;
  const tabById = Object.fromEntries(tabs.map((t) => [t.id, t]));
  let active = tabs[0].id;

  const typeColor = { civil: "var(--t-civil)", industrial: "var(--t-industrial)", military: "var(--t-military)" };

  /* ───── Калькуляторы ───── */
  const stepper = (id, val, min, max, label) => `
    <div>
      <label class="field-label" for="${id}">${label}</label>
      <div class="stepper">
        <button type="button" data-step="${id}" data-dir="-1" aria-label="${esc(label)}: меньше">−</button>
        <input type="number" id="${id}" value="${val}" min="${min}" max="${max}" step="1" inputmode="numeric">
        <button type="button" data-step="${id}" data-dir="1" aria-label="${esc(label)}: больше">+</button>
      </div>
    </div>`;

  const seg = (name, options, cur) => `
    <div class="segmented" role="group" data-seg="${name}">
      ${options.map(([v, l]) => `<button type="button" data-val="${v}" aria-pressed="${v === cur}">${esc(l)}</button>`).join("")}
    </div>`;

  const kmh = (n) => 6 + ((n - 1) * 39) / 9;

  const CALCS = {
    weight: {
      title: "Ограничения по весу",
      html: () => `<div class="calc__grid">
          <div><label class="field-label" for="cw-w">Вес персонажа, кг</label><input class="input" type="number" id="cw-w" value="78" min="20" max="400" inputmode="numeric"></div>
        </div><div class="calc__out" data-out></div>`,
      run(root) {
        const w = num($("#cw-w", root).value, 0);
        let strMax, strNote = "";
        if (w <= 80) strMax = 7;
        else if (w < 100) strMax = 9;
        else if (w > 100) strMax = 10;
        else { strMax = 9; strNote = " — ровно 100 кг: граница в материалах не уточнена, 10 даётся «только если вес больше 100»"; }
        const free = w >= 100 ? 2 : w >= 80 ? 1 : 0;
        const spd = w > 90 ? 8 : 10;
        return `
          <div class="calc__line">Сила — не больше <b>${strMax}</b>${esc(strNote)}</div>
          <div class="calc__line">Free point к телосложению: <b>+${free}</b></div>
          <div class="calc__line">Скорость — не больше <b>${spd}</b></div>`;
      }
    },
    speed: {
      title: "Скорость бега по очкам",
      html: () => `<div class="calc__grid">${stepper("cs-n", 5, 1, 10, "Очки скорости")}</div><div class="calc__out" data-out></div>
        <div class="table-scroll" style="margin-top:14px"><table><thead><tr><th>Очки</th>${Array.from({ length: 10 }, (_, i) => `<th>${i + 1}</th>`).join("")}</tr></thead>
        <tbody><tr><td>км/ч</td>${Array.from({ length: 10 }, (_, i) => `<td data-col="${i + 1}">${fmt(Math.round(kmh(i + 1) * 10) / 10)}</td>`).join("")}</tr></tbody></table></div>`,
      run(root) {
        const n = clamp(Math.round(num($("#cs-n", root).value, 5)), 1, 10);
        $$("td[data-col]", root).forEach((td) => { td.style.color = Number(td.dataset.col) === n ? "var(--acid)" : ""; });
        return `<div class="calc__big">≈ ${fmt(Math.round(kmh(n) * 10) / 10)} км/ч</div><div class="calc__line">6 + (${n} − 1) × 4,33. Опорные точки из правил: 1 очко — 6 км/ч, 10 очков — 45 км/ч.</div>`;
      }
    },
    tough: {
      title: "Сила удара против прочности",
      html: () => `<div class="calc__grid">${stepper("ct-s", 6, 1, 20, "Сила нападающего")}${stepper("ct-t", 5, 1, 20, "Прочность цели")}</div><div class="calc__out" data-out></div>`,
      run(root) {
        const s = Math.max(1, num($("#ct-s", root).value, 1)), t = Math.max(1, num($("#ct-t", root).value, 1));
        const r = s / t;
        let res;
        if (Math.abs(r - 1) < 1e-9) res = "Сила равна прочности — может разбить нос или сломать палец.";
        else if (r >= 1.25 && r <= 1.5) res = "Сила — 1,25–1,5 от прочности: может вырубить с одного удара в голову.";
        else if (r > 1 && r < 1.25) res = "Между описанными порогами (1 и 1,25) — отдельного правила нет.";
        else if (r > 1.5) res = "Выше 1,5 от прочности — в правилах отдельно не описано.";
        else res = "Сила меньше прочности — в правилах отдельно не описано.";
        return `<div class="calc__big">${fmt(Math.round(r * 100) / 100)}×</div><div class="calc__line">${esc(res)}</div><div class="calc__line muted">Холодное оружие прочность игнорирует — см. ближний бой.</div>`;
      }
    },
    dodge: {
      title: "Уклонение: ловкость против скорости",
      html: () => `<div class="calc__grid">${stepper("cd-a", 7, 1, 20, "Ваша ловкость")}${stepper("cd-s", 5, 1, 20, "Скорость противника")}</div><div class="calc__out" data-out></div>`,
      run(root) {
        const a = num($("#cd-a", root).value, 1), s = num($("#cd-s", root).value, 1);
        const d = a - s;
        let res;
        if (d >= 2) res = `Преимущество ${d}: можно увернуться от очереди до ${d} ударов (2 — от «двоечки»).`;
        else if (d === 1) res = "Преимущество 1: можно увернуться от одиночного удара.";
        else if (d === 0) res = "Равны: увернуться можно, только если заранее был готов получить удар.";
        else res = "Преимущества по ловкости нет — правило об уклонении не даёт бонуса.";
        const feint = a < 7 ? "<div class=\"calc__line\">Ловкость ниже 7 — сложные финты хорошо использовать не получится.</div>" : "";
        return `<div class="calc__big">${d > 0 ? "+" : ""}${d}</div><div class="calc__line">${esc(res)}</div>${feint}`;
      }
    },
    skills: {
      title: "Навыки: точность и шанс крита",
      html: () => `<div class="table-scroll"><table><thead><tr><th>Навык</th>${Array.from({ length: 10 }, (_, i) => `<th>${i + 1}</th>`).join("")}</tr></thead><tbody>
        <tr><td>Дальний бой: точность</td>${Array.from({ length: 10 }, (_, i) => `<td>${(i + 1) * 10}%</td>`).join("")}</tr>
        <tr><td>Ближний бой: крит</td>${Array.from({ length: 10 }, (_, i) => `<td>${(i + 1) * 5}%</td>`).join("")}</tr>
        </tbody></table></div>`,
      run: () => ""
    },
    hit: {
      title: "Калькулятор попадания",
      html: () => `<div class="calc__grid">${stepper("ch-n", 6, 1, 10, "Навык дальнего оружия")}
          <div><span class="field-label">Режим стрельбы</span>${seg("mode", [["0", "Стойка"], ["2", "Передвижение"], ["1", "От бедра"], ["6", "Наугад"]], "0")}</div>
        </div><div class="calc__out" data-out></div>
        <div class="table-scroll" style="margin-top:14px"><table><thead><tr><th>Режим</th><th>Формула</th><th>Уровень</th><th>Шанс</th></tr></thead><tbody data-table></tbody></table></div>`,
      run(root) {
        const n = clamp(Math.round(num($("#ch-n", root).value, 1)), 1, 10);
        const segEl = $('[data-seg="mode"]', root);
        const pen = Number(($('[aria-pressed="true"]', segEl) || {}).dataset?.val || 0);
        const modes = [[0, "Стойка"], [2, "Передвижение"], [1, "От бедра"], [6, "Наугад"]];
        $("[data-table]", root).innerHTML = modes.map(([p, l]) => {
          const lv = Math.max(1, n - p);
          return `<tr class="${p === pen ? "is-cur" : ""}"><td>${l}</td><td>${p ? `max(1, ${n} − ${p})` : n}</td><td>${lv}</td><td>${lv * 10}%</td></tr>`;
        }).join("");
        const lv = Math.max(1, n - pen);
        return `<div class="calc__big">${lv * 10}%</div><div class="calc__line">Уровень ${pen ? `max(1, ${n} − ${pen})` : n} = <b>${lv}</b> → ${lv} × 10%. Шанс крутит гейм-мастер после каждого выстрела.</div>`;
      }
    },
    crit: {
      title: "Калькулятор крита",
      html: () => `<div class="calc__grid">${stepper("cc-n", 6, 1, 10, "Навык ближнего оружия")}
          <div><span class="field-label">Особый способ</span>${seg("special", [["0", "Обычный удар"], ["5", "Атака в спину"], ["2", "Внезапная атака"]], "0")}</div>
        </div><div class="calc__out" data-out></div>`,
      run(root) {
        const n = clamp(Math.round(num($("#cc-n", root).value, 1)), 1, 10);
        const segEl = $('[data-seg="special"]', root);
        const b = Number(($('[aria-pressed="true"]', segEl) || {}).dataset?.val || 0);
        const lv = n + b;
        const note = b === 5 ? "Атака в спину может выходить за кап — уровень выше 10 допустим." : b === 2 ? "Внезапная атака работает только 1 раз за бой на 1 оружие." : "Удачный удар может стать критическим.";
        return `<div class="calc__big">${lv * 5}%</div><div class="calc__line">Уровень ${b ? `${n} + ${b}` : n} = <b>${lv}</b> → ${lv} × 5%. ${esc(note)}</div>`;
      }
    },
    mana: {
      title: "Мана: бонус к статам и слоты",
      html: () => `<div class="calc__grid">${stepper("cm-m", 10, 0, 100, "Мана, ед.")}${stepper("cm-s", 5, 1, 10, "Базовый физический стат")}</div><div class="calc__out" data-out></div>`,
      run(root) {
        const m = clamp(Math.round(num($("#cm-m", root).value, 0)), 0, 100);
        const s = clamp(num($("#cm-s", root).value, 1), 1, 10);
        const bonus = m * 5;
        const eff = Math.round(s * (1 + bonus / 100) * 100) / 100;
        const slots = Math.floor(m / 5);
        const warn = m > 10 ? `<div class="calc__line" style="color:var(--magenta)">При создании анкеты нынешняя мана — не больше 10.</div>` : "";
        return `<div class="calc__big">+${bonus}%</div>
          <div class="calc__line">Стат ${fmt(s)} с маной ${m}: ${fmt(s)} × ${fmt(1 + bonus / 100)} = <b>${fmt(eff)}</b> (навыки не усиливаются)</div>
          <div class="calc__line">Слотов заклинаний: ⌊${m} ÷ 5⌋ = <b>${slots}</b></div>${warn}`;
      }
    }
  };

  const calcHtml = (key) => {
    const c = CALCS[key];
    if (!c) return "";
    return `<div class="calc" data-calc="${key}"><p class="calc__title">${esc(c.title)}</p>${c.html()}</div>`;
  };
  const runCalc = (root) => {
    const c = CALCS[root.dataset.calc];
    const out = $("[data-out]", root);
    const html = c.run(root);
    if (out) out.innerHTML = html;
  };

  /* ───── Импланты, влияющие на показатель ───── */
  const implantsFor = (stat) => I.list.filter((x) => (x.stats || []).includes(stat));
  const impLink = (x) => `<a class="imp-link" href="#implants?id=${x.id}" style="--tc:${typeColor[x.type]}"><i aria-hidden="true"></i>${esc(x.name)}</a>`;
  const implantsHtml = (stat) => {
    const list = implantsFor(stat);
    if (!list.length) return "";
    return `<div class="rule-implants"><span>Импланты · ${esc(I.statLabels[stat])}:</span>${list.map(impLink).join("")}
      <a class="imp-link" href="#implants?stat=${stat}">Все в каталоге →</a></div>`;
  };
  const effectsIndexHtml = () => `<div class="effects-index">${Object.keys(I.statLabels).map((k) => {
    const list = implantsFor(k);
    if (!list.length) return "";
    return `<div class="effects-index__group"><h5>${esc(I.statLabels[k])}</h5><div>${list.map(impLink).join("")}</div></div>`;
  }).join("")}</div>`;

  /* ───── Рендер ───── */
  const sectionHtml = (tab, s) => `
    <section class="rule-sec" id="rule-${s.id}" data-sec="${s.id}" aria-labelledby="rh-${s.id}">
      <h4 id="rh-${s.id}">${esc(s.title)} <a class="anchor" href="#rules?tab=${tab.id}&s=${s.id}" aria-label="Ссылка на раздел «${esc(s.title)}»">#</a></h4>
      ${s.body ? `<div class="rich">${s.body.map((p) => `<p>${md(p)}</p>`).join("")}</div>` : ""}
      ${s.elements ? `<div class="elements">${s.elements.map((e) => `<span>${esc(e)}</span>`).join("")}</div>` : ""}
      ${s.pairs ? `<div class="rule-pairs">${s.pairs.map(([a, b]) => `<div class="rule-pair"><span class="rule-pair__if">${md(a)}</span><span class="rule-pair__arrow" aria-hidden="true">→</span><span class="rule-pair__then">${md(b)}</span></div>`).join("")}</div>` : ""}
      ${s.formula ? `<div class="formula" aria-label="Формула">${s.formula.map((f) => `<div>${esc(f)}</div>`).join("")}</div>` : ""}
      ${s.examples ? `<div class="examples"><p>Примеры</p><ul>${s.examples.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}
      ${s.calc ? calcHtml(s.calc) : ""}
      ${s.implants ? implantsHtml(s.implants) : ""}
      ${s.effectsIndex ? effectsIndexHtml() : ""}
    </section>`;

  const render = () => {
    $("#rules-lead").textContent = R.intro;
    $("#rules-tabs").innerHTML = tabs.map((t, i) => `
      <button class="rule-tab" type="button" role="tab" id="tab-${t.id}" aria-controls="panel-${t.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-tab="${t.id}">
        <span>${esc(t.title)}</span>
      </button>`).join("");
    $("#rules-panels").innerHTML = tabs.map((t, i) => `
      <div class="rule-panel" role="tabpanel" id="panel-${t.id}" aria-labelledby="tab-${t.id}" tabindex="0" ${i === 0 ? "" : "hidden"}>
        <h3 class="rule-panel__title">${esc(t.title)}</h3>
        ${t.sections.map((s) => sectionHtml(t, s)).join("")}
      </div>`).join("");
    $$("[data-calc]").forEach(runCalc);
  };

  const activate = (id, opts = {}) => {
    if (!tabById[id]) return;
    active = id;
    $$(".rule-tab").forEach((b) => {
      const on = b.dataset.tab === id;
      b.setAttribute("aria-selected", on);
      b.tabIndex = on ? 0 : -1;
    });
    $$(".rule-panel").forEach((p) => { p.hidden = p.id !== "panel-" + id; });
    if (opts.focus) $("#tab-" + id).focus();
    if (opts.hash !== false) setHash(`#rules?tab=${id}`);
  };

  /* ───── Поиск ───── */
  const index = [];
  tabs.forEach((t) => t.sections.forEach((s) => {
    const text = [s.title, ...(s.body || []), ...(s.pairs || []).flat(), ...(s.formula || []), ...(s.examples || []), ...(s.elements || [])].map(plain).join(" \n ");
    index.push({ tab: t, sec: s, text, low: text.toLowerCase() });
  }));

  const clearMarks = () => {
    $$("#rules-panels mark.hl").forEach((m) => {
      const t = document.createTextNode(m.textContent);
      m.replaceWith(t);
    });
    $("#rules-panels").normalize();
  };

  const markText = (q) => {
    const root = $("#rules-panels");
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentElement.closest(".calc, a.anchor, script, style") ? NodeFilter.FILTER_REJECT : n.nodeValue.toLowerCase().includes(q) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP)
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const frag = document.createDocumentFragment();
      const src = node.nodeValue, low = src.toLowerCase();
      let i = 0, j;
      while ((j = low.indexOf(q, i)) !== -1) {
        if (j > i) frag.appendChild(document.createTextNode(src.slice(i, j)));
        const m = document.createElement("mark");
        m.className = "hl";
        m.textContent = src.slice(j, j + q.length);
        frag.appendChild(m);
        i = j + q.length;
      }
      if (i < src.length) frag.appendChild(document.createTextNode(src.slice(i)));
      node.replaceWith(frag);
    });
  };

  const snippet = (text, q) => {
    const low = text.toLowerCase();
    const i = low.indexOf(q);
    const start = Math.max(0, i - 50), end = Math.min(text.length, i + q.length + 70);
    const part = (start ? "…" : "") + text.slice(start, end).replace(/\s*\n\s*/g, " ") + (end < text.length ? "…" : "");
    const pi = part.toLowerCase().indexOf(q);
    return esc(part.slice(0, pi)) + `<mark class="hl">${esc(part.slice(pi, pi + q.length))}</mark>` + esc(part.slice(pi + q.length));
  };

  const search = (raw) => {
    const q = raw.trim().toLowerCase();
    const out = $("#rules-results");
    clearMarks();
    $$(".rule-tab .badge").forEach((b) => b.remove());
    $("#rules-search-clear").hidden = !q;
    if (q.length < 2) { out.innerHTML = q ? `<p class="rr-empty">Введите хотя бы 2 символа.</p>` : ""; return; }
    const hits = index.filter((x) => x.low.includes(q));
    const perTab = {};
    hits.forEach((h) => { perTab[h.tab.id] = (perTab[h.tab.id] || 0) + 1; });
    Object.keys(perTab).forEach((id) => {
      $("#tab-" + id).insertAdjacentHTML("beforeend", `<span class="badge hit-count" aria-label="совпадений: ${perTab[id]}">${perTab[id]}</span>`);
    });
    markText(q);
    out.innerHTML = hits.length
      ? `<p class="mono small muted" style="margin:0 0 8px">Найдено разделов: ${hits.length}</p><ul class="rr-list">${hits.slice(0, 30).map((h) => `
          <li class="rr-item"><button type="button" data-goto-tab="${h.tab.id}" data-goto-sec="${h.sec.id}">
            <span class="rr-item__where">${esc(h.tab.title)} → ${esc(h.sec.title)}</span>
            <span class="rr-item__snip">${snippet(h.text, q)}</span>
          </button></li>`).join("")}</ul>`
      : `<p class="rr-empty">Ничего не найдено. Попробуйте «крит», «мана», «вес», «наугад», «кожа».</p>`;
    // Если в активной вкладке совпадений нет, переключаемся на первую найденную
    if (hits.length && !perTab[active]) activate(hits[0].tab.id, { hash: false });
  };

  const goToSection = (tabId, secId) => {
    activate(tabId);
    const el = document.getElementById("rule-" + secId);
    if (el) {
      scrollToEl(el);
      flash(el);
    }
    return el;
  };

  /* ───── События ───── */
  const bind = () => {
    const tabsEl = $("#rules-tabs");
    tabsEl.addEventListener("click", (e) => {
      const b = e.target.closest("[data-tab]");
      if (b) activate(b.dataset.tab);
    });
    tabsEl.addEventListener("keydown", (e) => {
      const list = $$(".rule-tab");
      const focused = list.indexOf(document.activeElement);
      const i = focused >= 0 ? focused : list.findIndex((b) => b.dataset.tab === active);
      let n = -1;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") n = (i + 1) % list.length;
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") n = (i - 1 + list.length) % list.length;
      if (e.key === "Home") n = 0;
      if (e.key === "End") n = list.length - 1;
      if (n >= 0) {
        e.preventDefault();
        activate(list[n].dataset.tab, { focus: true });
      }
    });

    const panels = $("#rules-panels");
    panels.addEventListener("input", (e) => {
      const c = e.target.closest("[data-calc]");
      if (c) runCalc(c);
    });
    panels.addEventListener("click", (e) => {
      const st = e.target.closest("[data-step]");
      if (st) {
        const inp = document.getElementById(st.dataset.step);
        const v = num(inp.value, 0) + Number(st.dataset.dir);
        inp.value = clamp(v, Number(inp.min), Number(inp.max));
        runCalc(st.closest("[data-calc]"));
        return;
      }
      const sb = e.target.closest("[data-seg] button");
      if (sb) {
        $$("button", sb.parentElement).forEach((b) => b.setAttribute("aria-pressed", b === sb));
        runCalc(sb.closest("[data-calc]"));
      }
    });
    panels.addEventListener("change", (e) => {
      const inp = e.target;
      if (inp.type === "number" && inp.min !== "") {
        inp.value = clamp(num(inp.value, Number(inp.min)), Number(inp.min), Number(inp.max));
        const c = inp.closest("[data-calc]");
        c && runCalc(c);
      }
    });

    const input = $("#rules-search");
    input.addEventListener("input", debounce(() => search(input.value), 140));
    input.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { input.value = ""; search(""); }
      if (e.key === "Enter") {
        e.preventDefault();
        const first = $("#rules-results [data-goto-tab]");
        first && first.click();
      }
    });
    $("#rules-search-clear").addEventListener("click", () => { input.value = ""; search(""); input.focus(); });
    $("#rules-results").addEventListener("click", (e) => {
      const b = e.target.closest("[data-goto-tab]");
      if (b) goToSection(b.dataset.gotoTab, b.dataset.gotoSec);
    });

    onRoute("rules", (params) => {
      if (params.tab && tabById[params.tab]) {
        activate(params.tab, { hash: false });
        if (params.s) {
          const el = document.getElementById("rule-" + params.s);
          if (el) { setTimeout(() => flash(el), 400); return el; }
        }
        return document.getElementById("rules");
      }
      return null;
    });
  };

  M.ui.rules = { init() { render(); bind(); } };
})();
