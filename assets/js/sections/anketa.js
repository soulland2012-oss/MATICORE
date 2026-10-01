/*
 * Раздел «Анкета персонажа»: шаблоны с копированием и конструктор, экспортирующий обычный текст.
 * Капитал выдаёт администрация — в конструкторе это поле не заполняется.
 */
(function () {
  "use strict";
  const M = window.MANTICORA;
  const { $, $$, esc, fmt, store, toast, copyText, downloadText, onRoute, clamp, num, debounce } = M.core;
  const A = M.data.anketa;
  const IMP = M.data.implants;

  const BUDGET = A.pointsBudget;
  const STATS = [
    { k: "str", label: "Сила", phys: true },
    { k: "tough", label: "Телосложение", phys: true },
    { k: "speed", label: "Скорость", phys: true },
    { k: "agi", label: "Ловкость", phys: true },
    { k: "ranged", label: "Навык дальнего оружия" },
    { k: "melee", label: "Навык ближнего оружия" }
  ];
  const IMP_FIELDS = [
    ["imp_eyes", "Глаза", "eyes"], ["imp_brain", "Мозг", "brain"], ["imp_legs", "Ноги", "legs"], ["imp_arms", "Руки", "arms"],
    ["imp_nervous", "Нервная система", "nervous"], ["imp_organs", "Внутренние органы", "organs"], ["imp_skin", "Кожа", "skin"]
  ];

  const blank = () => ({
    type: "nonmage",
    mode: "points",
    f: {},
    s: { str: 1, tough: 1, speed: 1, agi: 1, ranged: 1, melee: 1 },
    mana: { cur: 0, max: "" }
  });
  const st = Object.assign(blank(), store.get("anketa", {}));
  st.f = st.f || {};
  const save = debounce(() => store.set("anketa", st), 250);

  /* ───── Расчёты ───── */
  const weight = () => num(st.f.weight, 0);
  const caps = () => {
    const w = weight();
    if (!w) return { str: 10, free: 0, speed: 10, known: false };
    return {
      str: w <= 80 ? 7 : w < 100 ? 9 : w > 100 ? 10 : 9,
      free: w >= 100 ? 2 : w >= 80 ? 1 : 0,
      speed: w > 90 ? 8 : 10,
      known: true,
      edge100: w === 100
    };
  };
  const isMage = () => st.type === "mage";
  const manaCur = () => (isMage() ? Number(st.mana.cur) || 0 : 0);
  const spent = () => STATS.reduce((s, x) => s + (Number(st.s[x.k]) || 0), 0) + manaCur();
  const withMana = (v) => Math.round(v * (1 + manaCur() * 0.05) * 100) / 100;

  /* ───── Экспорт ───── */
  const statValue = (k) => {
    const v = st.s[k];
    if (v === "" || v == null) return "";
    const c = caps();
    let out = String(v);
    if (k === "tough" && c.free) out += ` (+${c.free} free point за вес)`;
    const def = STATS.find((x) => x.k === k);
    if (isMage() && def.phys && manaCur() > 0) {
      const base = k === "tough" ? Number(v) + c.free : Number(v);
      out += ` (с маной +${manaCur() * 5}%: ${fmt(withMana(base))})`;
    }
    return out;
  };

  const valueFor = (key) => {
    if (STATS.some((x) => x.k === key)) return statValue(key);
    if (key === "mana") return st.mana.cur === "" && st.mana.max === "" ? "" : `${st.mana.cur}/${st.mana.max}`;
    if (key === "capital") return "";
    return (st.f[key] || "").trim();
  };

  const toText = (type, filled) =>
    A.templates[type].lines
      .map((l) => {
        if (l.t) return l.t;
        const v = filled ? valueFor(l.f) : "";
        return v ? `${l.label} ${v}` : l.label;
      })
      .join("\n");

  /* ───── Шаблоны ───── */
  const renderTemplates = () => {
    $("#admin-notes").innerHTML = A.admin.map((n) => `<li>${esc(n)}</li>`).join("");
    $("#templates").innerHTML = ["nonmage", "mage"].map((t) => `
      <article class="tpl tpl--${t}">
        <div class="tpl__head">
          <h3 class="tpl__title">${esc(A.templates[t].title)}<small>${t === "mage" ? "Стихия · мана · заклинания" : "Базовый шаблон"}</small></h3>
          <div class="tpl__actions">
            <button class="btn btn--ghost btn--small" type="button" data-copy-tpl="${t}">Копировать</button>
            <button class="btn btn--primary btn--small" type="button" data-fill="${t}">Заполнить</button>
          </div>
        </div>
        <pre tabindex="0" aria-label="${esc(A.templates[t].title)}">${esc(toText(t, false))}</pre>
      </article>`).join("");
  };

  /* ───── Конструктор ───── */
  const input = (key, label, opts = {}) => {
    const id = "af-" + key;
    const v = esc(st.f[key] || "");
    const control = opts.area
      ? `<textarea class="textarea" id="${id}" data-f="${key}" rows="${opts.rows || 3}" ${opts.ph ? `placeholder="${esc(opts.ph)}"` : ""}>${v}</textarea>`
      : `<input class="input" id="${id}" data-f="${key}" type="${opts.type || "text"}" value="${v}" ${opts.ph ? `placeholder="${esc(opts.ph)}"` : ""} ${opts.list ? `list="${opts.list}"` : ""} ${opts.mode ? `inputmode="${opts.mode}"` : ""} autocomplete="off">`;
    return `<div class="fs-field${opts.wide ? " fs-field--wide" : ""}"${opts.wide ? ' style="grid-column:1/-1"' : ""}><label class="field-label" for="${id}">${esc(label)}</label>${control}${opts.help ? `<p class="help">${opts.help}</p>` : ""}</div>`;
  };

  const statCard = (x) => `
    <div class="stat${x.k === "manaCur" ? " stat--mana" : ""}" data-stat-card="${x.k}">
      <label class="stat__name" for="as-${x.k}">${esc(x.label)}</label>
      <div class="stepper">
        <button type="button" data-sstep="${x.k}" data-dir="-1" aria-label="${esc(x.label)}: меньше">−</button>
        <input type="number" id="as-${x.k}" data-s="${x.k}" min="${x.min}" max="${x.max}" step="1" inputmode="numeric">
        <button type="button" data-sstep="${x.k}" data-dir="1" aria-label="${esc(x.label)}: больше">+</button>
      </div>
      <p class="stat__cap" data-cap="${x.k}"></p>
    </div>`;

  const renderBuilder = () => {
    const mage = isMage();
    const statList = STATS.map((x) => ({ ...x, min: 1, max: 10 }));
    if (mage) statList.splice(4, 0, { k: "manaCur", label: "Нынешняя мана", min: 0, max: 10 });

    $("#builder").innerHTML = `
      <div class="builder__head">
        <h3 class="builder__title">Конструктор анкеты<small>Заполните поля — справа соберётся текст по шаблону. Черновик сохраняется в этом браузере.</small></h3>
        <div class="segmented" role="group" aria-label="Тип анкеты" style="--seg-on:${mage ? "var(--magenta)" : "var(--cyan)"}">
          <button type="button" data-type="nonmage" aria-pressed="${!mage}">Не-маг</button>
          <button type="button" data-type="mage" aria-pressed="${mage}">Маг</button>
        </div>
      </div>
      <div class="builder__layout">
        <form class="builder__form" id="anketa-form" novalidate>
          <fieldset class="fs">
            <legend>Персонаж</legend>
            <div class="fs-grid">
              ${input("name", "Имя | Фамилия | прозвище", { wide: true })}
              ${input("age", "Возраст", { mode: "numeric" })}
              ${input("height", "Рост", { ph: "например, 182 см" })}
              ${input("weight", "Вес", { ph: "например, 78 кг", help: "Вес ограничивает силу и скорость и даёт free point к телосложению." })}
              ${input("race", "Раса")}
              ${input("character", "Характер", { area: true, wide: true, rows: 2 })}
            </div>
          </fieldset>

          <fieldset class="fs">
            <legend>Характеристики</legend>
            <div class="stats-mode">
              <div class="segmented" role="group" aria-label="Способ получения статов">
                <button type="button" data-mode="points" aria-pressed="${st.mode === "points"}">25 очков</button>
                <button type="button" data-mode="d10" aria-pressed="${st.mode === "d10"}">Бросок d10</button>
              </div>
              <a class="small mono" href="#rules?tab=stats">Правила статов →</a>
            </div>
            <div class="points" id="points" ${st.mode === "points" ? "" : "hidden"}>
              <div class="points__row"><span>Распределено</span><b id="points-val"></b></div>
              <div class="points__bar"><span id="points-bar"></span></div>
            </div>
            <p class="form-status" id="d10-note" ${st.mode === "d10" ? "" : "hidden"}>Статы крутит Анкетолог или админ с помощью d10 — впишите выпавшие значения или оставьте поля пустыми для администрации.</p>
            <div class="stat-grid">${statList.map(statCard).join("")}</div>
            <p class="form-status" id="stats-status" aria-live="polite"></p>
          </fieldset>

          ${mage ? `
          <fieldset class="fs">
            <legend>Магия</legend>
            <div class="fs-grid">
              ${input("element", "Стихия", { list: "elements-list", ph: "молния, огонь, вода, воздух, земля или подстихия", help: 'Подстихии — например, магнетизм, звук, кровь, реактивное пламя. <a href="#rules?tab=magic&s=elements">Стихии →</a>' })}
              <div class="fs-field">
                <label class="field-label" for="am-max">Максимальная мана (до 100)</label>
                <input class="input" type="number" id="am-max" data-mana="max" min="0" max="100" inputmode="numeric" value="${esc(st.mana.max)}">
              </div>
              ${input("spells", "Заклинания", { area: true, wide: true, rows: 3, help: '<span id="slots-hint"></span>' })}
            </div>
            <datalist id="elements-list"><option value="Молния"><option value="Огонь"><option value="Вода"><option value="Воздух"><option value="Земля"></datalist>
          </fieldset>` : ""}

          <fieldset class="fs">
            <legend>История и снаряжение</legend>
            <div class="fs-grid">
              ${input("bio", "Биография", { area: true, wide: true, rows: 5 })}
              ${input("skills", "Навыки", { area: true, wide: true, rows: 2 })}
              <div class="fs-field" style="grid-column:1/-1">
                <span class="field-label">Капитал</span>
                <p class="help" style="margin:0;padding:12px 14px;border:1px dashed var(--line-2)">Выдаётся админом в зависимости от биографии и рандомайзера — поле заполняет администрация.</p>
              </div>
              ${input("equipment", "Экипировка", { area: true, wide: true, rows: 2 })}
            </div>
          </fieldset>

          <fieldset class="fs">
            <legend>Киберимпланты</legend>
            <p class="help" style="margin:0 0 14px">Добавляйте импланты кнопкой «В анкету» в <a href="#implants">каталоге</a> или впишите вручную. ${esc(IMP.narrative.rule)} Для кожи укажите % площади и участки тела.</p>
            <div class="fs-grid">
              ${IMP_FIELDS.map(([k, l, cat]) => input(k, l, { area: true, rows: 2, help: `<a href="#implants?cat=${cat}">Каталог: ${esc(l.toLowerCase())} →</a>` })).join("")}
            </div>
          </fieldset>

          <fieldset class="fs">
            <legend>Внешность</legend>
            <div class="fs-grid">${input("appearance", "Внешность", { area: true, wide: true, rows: 3 })}</div>
          </fieldset>
        </form>

        <div class="builder__preview">
          <div class="bp-sticky">
            <p class="field-label" style="margin:0">Готовый текст анкеты</p>
            <pre id="anketa-out" tabindex="0" aria-live="off" aria-label="Готовый текст анкеты"></pre>
            <div class="bp-actions">
              <button class="btn btn--primary btn--small" type="button" id="anketa-copy">Скопировать анкету</button>
              <button class="btn btn--ghost btn--small" type="button" id="anketa-download">Скачать .txt</button>
              <button class="btn btn--ghost btn--small" type="button" id="anketa-clear">Очистить</button>
            </div>
            <p class="help" style="margin:0">Передайте текст администрации — она утверждает персонажа и назначает капитал.</p>
          </div>
        </div>
      </div>`;
    refresh();
  };

  const refresh = () => {
    const c = caps();
    const mage = isMage();
    // значения в степперах
    STATS.forEach((x) => {
      const el = $("#as-" + x.k);
      if (el && document.activeElement !== el) el.value = st.s[x.k] === "" ? "" : st.s[x.k];
    });
    const mc = $("#as-manaCur");
    if (mc && document.activeElement !== mc) mc.value = st.mana.cur;

    // подсказки ограничений
    const capText = {
      str: c.known ? `Максимум по весу: <b>${c.str}</b>${c.edge100 ? " (ровно 100 кг — граница не уточнена)" : ""}` : "Укажите вес — от него зависит максимум",
      tough: c.free ? `+<b>${c.free}</b> free point за вес — поверх 25 очков` : c.known ? "Free point даётся с 80 кг" : "Free point даётся с 80 кг",
      speed: c.known ? `Максимум по весу: <b>${c.speed}</b>` : "Больше 90 кг — не выше 8",
      agi: "Сложные финты — с 7",
      ranged: "Точность: <b>" + ((Number(st.s.ranged) || 0) * 10) + "%</b>",
      melee: "Шанс крита: <b>" + ((Number(st.s.melee) || 0) * 5) + "%</b>",
      manaCur: "Не больше 10, из тех же 25 очков"
    };
    const warn = [];
    if (c.known && Number(st.s.str) > c.str) warn.push(`Сила выше допустимой для веса (${c.str}).`);
    if (c.known && Number(st.s.speed) > c.speed) warn.push(`Скорость выше 8 при весе больше 90 кг.`);
    Object.keys(capText).forEach((k) => {
      const el = $(`[data-cap="${k}"]`);
      if (!el) return;
      let html = capText[k];
      const def = STATS.find((x) => x.k === k);
      if (mage && def && def.phys && manaCur() > 0 && st.s[k] !== "") {
        const base = k === "tough" ? Number(st.s[k]) + c.free : Number(st.s[k]);
        html += ` · с маной: <b>${fmt(withMana(base))}</b>`;
      }
      if ((k === "str" && c.known && Number(st.s.str) > c.str) || (k === "speed" && c.known && Number(st.s.speed) > c.speed)) html += ' <span class="warn">— превышено</span>';
      el.innerHTML = html;
    });

    // очки
    const used = spent();
    const pv = $("#points-val"), pb = $("#points-bar");
    if (pv) {
      pv.textContent = `${used} / ${BUDGET}`;
      pv.classList.toggle("is-over", used > BUDGET);
      pv.classList.toggle("is-done", used === BUDGET);
      pb.style.width = Math.min(100, (used / BUDGET) * 100) + "%";
      pb.classList.toggle("is-over", used > BUDGET);
    }
    const status = $("#stats-status");
    if (status) {
      const msgs = [];
      if (st.mode === "points") {
        if (used > BUDGET) msgs.push(`Перерасход: ${used - BUDGET} очк. сверх ${BUDGET}.`);
        else if (used < BUDGET) msgs.push(`Осталось распределить: ${BUDGET - used}.`);
        else msgs.push("Все 25 очков распределены.");
      }
      msgs.push(...warn);
      status.textContent = msgs.join(" ");
      status.classList.toggle("is-warn", used > BUDGET || warn.length > 0);
    }
    const sh = $("#slots-hint");
    if (sh) sh.textContent = `1 слот заклинания за каждые 5 маны. По нынешней мане (${manaCur()}): ${Math.floor(manaCur() / 5)} слот(а).`;

    $("#anketa-out").textContent = toText(st.type, true);
    save();
  };

  const setStat = (k, v) => {
    if (k === "manaCur") {
      st.mana.cur = v === "" ? 0 : clamp(Math.round(num(v, 0)), 0, 10);
      return;
    }
    if (v === "" && st.mode === "d10") { st.s[k] = ""; return; }
    st.s[k] = clamp(Math.round(num(v, 1)), 1, 10);
  };

  const bind = () => {
    const root = $("#builder");
    root.addEventListener("input", (e) => {
      const t = e.target;
      if (t.dataset.f) { st.f[t.dataset.f] = t.value; refresh(); return; }
      if (t.dataset.s) { setStat(t.dataset.s, t.value); refresh(); return; }
      if (t.dataset.mana === "max") { st.mana.max = t.value === "" ? "" : clamp(Math.round(num(t.value, 0)), 0, 100); refresh(); }
    });
    root.addEventListener("change", (e) => {
      const t = e.target;
      if (t.dataset.s) t.value = t.dataset.s === "manaCur" ? st.mana.cur : st.s[t.dataset.s];
      if (t.dataset.mana === "max") t.value = st.mana.max;
    });
    root.addEventListener("click", (e) => {
      const ty = e.target.closest("[data-type]");
      if (ty) { setType(ty.dataset.type); return; }
      const md = e.target.closest("[data-mode]");
      if (md) {
        st.mode = md.dataset.mode;
        if (st.mode === "points") STATS.forEach((x) => { if (st.s[x.k] === "") st.s[x.k] = 1; });
        renderBuilder();
        return;
      }
      const sb = e.target.closest("[data-sstep]");
      if (sb) {
        const k = sb.dataset.sstep;
        const cur = k === "manaCur" ? st.mana.cur : st.s[k] === "" ? 0 : st.s[k];
        setStat(k, Number(cur) + Number(sb.dataset.dir));
        refresh();
        return;
      }
      if (e.target.closest("#anketa-copy")) {
        copyText($("#anketa-out").textContent).then((ok) => toast(ok ? "Анкета скопирована" : "Не удалось скопировать — выделите текст вручную"));
        return;
      }
      if (e.target.closest("#anketa-download")) {
        const name = (st.f.name || "персонаж").split("|")[0].trim().replace(/[\\/:*?"<>|]+/g, "") || "персонаж";
        downloadText(`Анкета — ${name}.txt`, $("#anketa-out").textContent);
        return;
      }
      if (e.target.closest("#anketa-clear")) {
        if (!window.confirm("Очистить все поля анкеты? Черновик будет удалён.")) return;
        const type = st.type;
        Object.assign(st, blank(), { type });
        store.del("anketa");
        renderBuilder();
        toast("Анкета очищена");
      }
    });
    root.addEventListener("submit", (e) => e.preventDefault());

    $("#templates").addEventListener("click", (e) => {
      const c = e.target.closest("[data-copy-tpl]");
      if (c) {
        copyText(toText(c.dataset.copyTpl, false)).then((ok) => toast(ok ? "Шаблон скопирован" : "Не удалось скопировать"));
        return;
      }
      const f = e.target.closest("[data-fill]");
      if (f) {
        setType(f.dataset.fill);
        M.core.scrollToEl($("#builder"));
        setTimeout(() => { const n = $("#af-name"); n && n.focus({ preventScroll: true }); }, 400);
      }
    });

    onRoute("anketa", (params) => {
      if (params.type && A.templates[params.type]) {
        setType(params.type);
        return $("#builder");
      }
      return null;
    });
  };

  const setType = (t) => {
    if (!A.templates[t] || t === st.type) return;
    st.type = t;
    renderBuilder();
  };

  // Вызывается из каталога имплантов
  const addImplant = (cat, text) => {
    const key = "imp_" + cat;
    const cur = (st.f[key] || "").trim();
    st.f[key] = cur ? cur + "; " + text : text;
    const el = $("#af-" + key);
    if (el) el.value = st.f[key];
    refresh();
    const label = (IMP_FIELDS.find((x) => x[0] === key) || [])[1] || cat;
    toast(`Добавлено в анкету → ${label}`);
  };

  M.ui.anketa = {
    init() { renderTemplates(); renderBuilder(); bind(); },
    addImplant
  };
})();
