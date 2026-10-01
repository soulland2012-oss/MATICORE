/*
 * Раздел «Экономика»: валюта, цены, логарифмическая шкала, соотношения и калькулятор бюджета.
 * Все суммы берутся из data/economy.js.
 */
(function () {
  "use strict";
  const M = window.MANTICORA;
  const { $, $$, esc, fmt, fmtMoney, fmtRange, pct, store, clamp, num, NBSP } = M.core;
  const E = M.data.economy;

  const items = {};
  E.groups.forEach((g) => g.items.forEach((it) => { items[it.id] = it; }));

  // Диапазон для производных цен («в 2–4 раза»)
  const rangeOf = (it) => {
    if (it.multiplier) {
      const base = items[it.base];
      return { min: base.min * it.multiplier[0], max: (base.max || base.min) * it.multiplier[1], derived: true };
    }
    return { min: it.min, max: it.max != null ? it.max : it.min, from: !!it.from };
  };

  const priceHtml = (it) => {
    const r = rangeOf(it);
    const period = it.period ? ` <small>/ ${esc(it.period)}</small>` : "";
    if (r.from) return `от ${fmt(r.min)}${NBSP}€${period}`;
    return `${fmtRange(r.min, r.max)}${period}`;
  };

  /* ───── Карточки ───── */
  const renderCards = () => {
    $("#currency").innerHTML = `
      <div class="currency__glyph" aria-hidden="true">${esc(E.currency.symbol)}</div>
      <div>
        <p class="currency__name">${esc(E.currency.name)}</p>
        <p class="currency__rate">${esc(E.currency.rate)}</p>
      </div>`;

    $("#eco-grid").innerHTML = E.groups.map((g, gi) => `
      <section class="eco-card" data-reveal style="--d:${gi * 60}ms" aria-labelledby="eco-${g.id}">
        <h3 class="eco-card__title" id="eco-${g.id}">${esc(g.title)}</h3>
        ${g.items.map((it) => {
          const derived = !!it.multiplier;
          const base = derived ? items[it.base] : null;
          return `
          <div class="eco-item${derived ? " eco-item--derived" : ""}">
            <span class="eco-item__price">${priceHtml(it)}</span>
            <span class="eco-item__label">${esc(it.label)}${it.text ? ` — ${esc(it.text)}` : ""}</span>
            ${derived ? `<span class="eco-item__calc">расчёт: ${fmtRange(base.min, base.max)} × ${it.multiplier[0]}–${it.multiplier[1]}</span>` : ""}
          </div>`;
        }).join("")}
        ${g.note ? `<p class="eco-card__note">${esc(g.note)}</p>` : ""}
      </section>`).join("");
  };

  /* ───── Шкала цен ───── */
  const renderScale = () => {
    const rows = [
      { id: "lunch", bar: "#0c1016" },
      { id: "pistol", bar: "#0c1016" },
      { id: "ambulance", bar: "#c4007e" },
      { id: "surgery", bar: "#c4007e" },
      { id: "rentHeil", bar: "#0c1016" },
      { id: "rentBetter", bar: "#c4007e" },
      { id: "salary", bar: "#0040ff" },
      { id: "middle", bar: "#0040ff" }
    ];
    const DEC = 4; // 1 … 10 000
    const pos = (v) => (Math.log10(Math.max(1, v)) / DEC) * 100;
    $("#price-scale").innerHTML = rows.map((row, i) => {
      const it = items[row.id];
      const r = rangeOf(it);
      const from = pos(r.min);
      const to = r.from ? 100 : pos(r.max);
      const w = Math.max(0.8, to - from);
      const range = r.max !== r.min || r.from;
      const label = it.multiplier ? `${it.label} (×${it.multiplier[0]}–${it.multiplier[1]})` : it.label;
      return `
        <div class="ps-row">
          <span class="ps-label">${esc(label)}</span>
          <span class="ps-track" aria-hidden="true"><span class="ps-bar${range ? " ps-bar--range" : ""}" style="--from:${from.toFixed(2)}%;--w:${w.toFixed(2)}%;--bar:${row.bar};--d:${i * 70}ms"></span></span>
          <span class="ps-val">${r.from ? "от " + fmtMoney(r.min) : fmtRange(r.min, r.max)}</span>
        </div>`;
    }).join("") + `
      <div class="ps-axis" aria-hidden="true">
        <span></span>
        <span class="ps-axis__ticks">${[1, 10, 100, 1000, 10000].map((v) => `<span style="left:${pos(v)}%">${fmt(v)}</span>`).join("")}</span>
        <span></span>
      </div>`;

    // Соотношения — простая арифметика по данным материалов
    const sal = items.salary.min;
    const heil = rangeOf(items.rentHeil), better = rangeOf(items.rentBetter);
    const lunch = rangeOf(items.lunch);
    const share = (v) => pct((v / sal) * 100);
    const ratios = [
      { v: `${share(heil.min)}–${share(heil.max)}`, t: "средней зарплаты уходит на аренду в Старом Хэйле", c: `${fmtRange(heil.min, heil.max)} ÷ ${fmtMoney(sal)}` },
      { v: `${share(better.min)}–${share(better.max)}`, t: "средней зарплаты — аренда в районах получше", c: `${fmtRange(better.min, better.max)} ÷ ${fmtMoney(sal)}` },
      { v: share(items.ambulance.min), t: "средней зарплаты стоит один вызов скорой", c: `${fmtMoney(items.ambulance.min)} ÷ ${fmtMoney(sal)}` },
      { v: share(items.surgery.min), t: "средней зарплаты — простая операция без страховки", c: `${fmtMoney(items.surgery.min)} ÷ ${fmtMoney(sal)}` },
      { v: "×" + fmt(Math.round((items.middle.min / sal) * 100) / 100), t: "от средней зарплаты нужно для жизни среднего класса", c: `от ${fmtMoney(items.middle.min)} ÷ ${fmtMoney(sal)}` },
      { v: fmtRange(lunch.min * 30, lunch.max * 30), t: "стоят 30 обедов в фастфуде", c: `${fmtRange(lunch.min, lunch.max)} × 30` }
    ];
    $("#eco-ratios").innerHTML = ratios.map((r) => `
      <div class="ratio">
        <div class="ratio__val">${r.v}</div>
        <p class="ratio__text">${esc(r.t)}</p>
        <p class="ratio__calc">расчёт: ${r.c}</p>
      </div>`).join("");
  };

  /* ───── Калькулятор бюджета ───── */
  const D = E.calculator.defaults;
  const saved = store.get("budget", null);
  const st = Object.assign({}, D, saved || {});
  st.better = saved && typeof saved.better === "boolean" ? saved.better : D.rentMultiplier > 1;

  const rangeInput = (k, min, max, step, label, rngColor) => `
    <div class="range-field">
      <label class="field-label" for="b-${k}">${label}</label>
      <output id="o-${k}" for="b-${k}"></output>
      <input type="range" id="b-${k}" data-k="${k}" min="${min}" max="${max}" step="${step}" style="--rng:${rngColor || "var(--cyan)"}">
    </div>`;

  const stepperInput = (k, min, max, label) => `
    <div>
      <label class="field-label" for="b-${k}">${label}</label>
      <div class="stepper">
        <button type="button" data-step="${k}" data-dir="-1" aria-label="Меньше">−</button>
        <input type="number" id="b-${k}" data-k="${k}" min="${min}" max="${max}" step="1" inputmode="numeric">
        <button type="button" data-step="${k}" data-dir="1" aria-label="Больше">+</button>
      </div>
    </div>`;

  const renderBudget = () => {
    const rentHeil = items.rentHeil, better = items.rentBetter, lunch = items.lunch, pistol = items.pistol;
    $("#budget").innerHTML = `
      <form class="budget__form" id="budget-form" novalidate>
        <p class="sec-index mono"><span>€</span> / Калькулятор</p>
        <h3 class="budget__title">Месячный бюджет</h3>
        <p class="budget__intro">Подставьте доход и расходы — калькулятор покажет остаток. Значения по умолчанию взяты из материалов, допущения перечислены справа.</p>

        <fieldset class="bf-group" style="border:0;margin:0;padding-inline:0">
          <legend class="bf-group__head" style="width:100%;padding:0"><span class="bf-group__title">Доход</span><span class="bf-group__src">средняя — ${fmtMoney(items.salary.min)} · средний класс — от ${fmtMoney(items.middle.min)}</span></legend>
          <div class="bf-row">
            <div>
              <label class="field-label" for="b-income">Доход в месяц, €</label>
              <input class="input" type="number" id="b-income" data-k="income" min="0" step="50" inputmode="numeric">
            </div>
          </div>
          <div class="bf-presets" role="group" aria-label="Готовые значения дохода">
            <button type="button" class="chip" data-preset="${items.salary.min}">Средняя зарплата</button>
            <button type="button" class="chip" data-preset="${items.middle.min}">Средний класс (от)</button>
          </div>
        </fieldset>

        <fieldset class="bf-group" style="border:0;margin:0;padding-inline:0">
          <legend class="bf-group__head" style="width:100%;padding:0"><span class="bf-group__title">Аренда</span><span class="bf-group__src">Старый Хэйль ${fmtRange(rentHeil.min, rentHeil.max)} · получше ×${better.multiplier[0]}–${better.multiplier[1]}</span></legend>
          <div class="segmented" role="group" aria-label="Район" style="margin-bottom:12px">
            <button type="button" data-better="0">Старый Хэйль</button>
            <button type="button" data-better="1">Район получше</button>
          </div>
          <div class="bf-row">
            ${rangeInput("rentBase", rentHeil.min, rentHeil.max, 50, "Цена конуры в Старом Хэйле")}
            ${rangeInput("rentMultiplier", better.multiplier[0], better.multiplier[1], 0.5, "Множитель «получше»", "var(--magenta)")}
          </div>
        </fieldset>

        <fieldset class="bf-group" style="border:0;margin:0;padding-inline:0">
          <legend class="bf-group__head" style="width:100%;padding:0"><span class="bf-group__title">Еда</span><span class="bf-group__src">обед в фастфуде ${fmtRange(lunch.min, lunch.max)}</span></legend>
          <div class="bf-row">
            ${stepperInput("mealsPerDay", 0, 6, "Приёмов пищи в день")}
            ${rangeInput("mealPrice", lunch.min, lunch.max, 0.5, "Цена одного приёма")}
            <div>
              <label class="field-label" for="b-days">Дней в месяце</label>
              <input class="input" type="number" id="b-days" data-k="days" min="1" max="31" step="1" inputmode="numeric">
            </div>
          </div>
        </fieldset>

        <fieldset class="bf-group" style="border:0;margin:0;padding-inline:0">
          <legend class="bf-group__head" style="width:100%;padding:0"><span class="bf-group__title">Медицина</span><span class="bf-group__src">скорая ${fmtMoney(items.ambulance.min)} · операция без страховки ${fmtMoney(items.surgery.min)}</span></legend>
          <div class="bf-row">
            ${stepperInput("ambulanceCalls", 0, 20, "Вызовов скорой")}
            ${stepperInput("surgeries", 0, 20, "Простых операций")}
          </div>
        </fieldset>

        <fieldset class="bf-group" style="border:0;margin:0;padding-inline:0">
          <legend class="bf-group__head" style="width:100%;padding:0"><span class="bf-group__title">Оружие и прочее</span><span class="bf-group__src">пистолет ${fmtRange(pistol.min, pistol.max)}</span></legend>
          <div class="bf-row">
            <div>
              <label class="check"><input type="checkbox" id="b-buyPistol" data-k="buyPistol"> Купить подержанный пистолет</label>
            </div>
            ${rangeInput("pistolPrice", pistol.min, pistol.max, 10, "Цена пистолета", "var(--red)")}
          </div>
          <div class="bf-row">
            <div>
              <label class="field-label" for="b-other">Прочие расходы, €</label>
              <input class="input" type="number" id="b-other" data-k="other" min="0" step="10" inputmode="numeric">
              <p class="help">Свои траты, которых нет в материалах.</p>
            </div>
          </div>
        </fieldset>
        <button type="button" class="btn btn--ghost btn--small" id="budget-reset">Сбросить к значениям по умолчанию</button>
      </form>

      <div class="budget__result">
        <div class="br-sticky">
          <p class="br-label">Остаток за месяц</p>
          <p class="br-remain" id="br-remain" aria-live="polite"></p>
          <p class="br-status" id="br-status"></p>
          <div class="br-bar" id="br-bar" aria-hidden="true"></div>
          <ul class="br-lines" id="br-lines"></ul>
          <div class="br-assume">
            <p>Допущения калькулятора</p>
            <ul>${E.calculator.assumptions.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>
          </div>
        </div>
      </div>`;
  };

  const LIMITS = {
    income: [0, 1e7], rentBase: [items.rentHeil.min, items.rentHeil.max],
    rentMultiplier: items.rentBetter.multiplier, mealsPerDay: [0, 6], mealPrice: [items.lunch.min, items.lunch.max],
    days: [1, 31], ambulanceCalls: [0, 20], surgeries: [0, 20], pistolPrice: [items.pistol.min, items.pistol.max], other: [0, 1e7]
  };

  const sync = () => {
    $$("#budget-form [data-k]").forEach((el) => {
      const k = el.dataset.k;
      if (el.type === "checkbox") el.checked = !!st[k];
      else if (document.activeElement !== el || el.type === "range") el.value = st[k];
      if (el.type === "range") {
        const fill = ((st[k] - el.min) / (el.max - el.min)) * 100;
        el.style.setProperty("--fill", fill + "%");
      }
    });
    $("#b-rentMultiplier").disabled = !st.better;
    $("#b-rentMultiplier").closest(".range-field").style.opacity = st.better ? 1 : 0.4;
    $("#b-pistolPrice").disabled = !st.buyPistol;
    $("#b-pistolPrice").closest(".range-field").style.opacity = st.buyPistol ? 1 : 0.4;
    $$("[data-better]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.better === "1") === String(st.better)));
    $$("[data-preset]").forEach((b) => b.setAttribute("aria-pressed", String(Number(b.dataset.preset) === st.income)));
    $("#o-rentBase").textContent = fmtMoney(st.rentBase);
    $("#o-rentMultiplier").textContent = "×" + fmt(st.rentMultiplier);
    $("#o-mealPrice").textContent = fmtMoney(st.mealPrice);
    $("#o-pistolPrice").textContent = fmtMoney(st.pistolPrice);
  };

  const compute = () => {
    const mult = st.better ? st.rentMultiplier : 1;
    const lines = [
      { k: "rent", label: "Аренда", v: st.rentBase * mult, f: `${fmtMoney(st.rentBase)} × ${fmt(mult)}`, col: "#ff2fbf" },
      { k: "food", label: "Еда", v: st.mealsPerDay * st.mealPrice * st.days, f: `${st.mealsPerDay} × ${fmtMoney(st.mealPrice)} × ${st.days} дн.`, col: "#e4ff3a" },
      { k: "med", label: "Медицина", v: st.ambulanceCalls * items.ambulance.min + st.surgeries * items.surgery.min, f: `${st.ambulanceCalls} × ${fmtMoney(items.ambulance.min)} + ${st.surgeries} × ${fmtMoney(items.surgery.min)}`, col: "#27d7ff" },
      { k: "gun", label: "Оружие", v: st.buyPistol ? st.pistolPrice : 0, f: st.buyPistol ? "разовая покупка" : "не покупаем", col: "#ff3b47" },
      { k: "other", label: "Прочее", v: st.other, f: "свои расходы", col: "#c9d4e0" }
    ];
    const total = lines.reduce((s, l) => s + l.v, 0);
    const remain = st.income - total;

    const rem = $("#br-remain");
    rem.textContent = (remain > 0 ? "+" : "") + fmtMoney(remain);
    rem.classList.toggle("is-neg", remain < 0);
    const share = st.income > 0 ? (total / st.income) * 100 : 0;
    $("#br-status").textContent = st.income <= 0
      ? "Укажите доход"
      : remain < 0
        ? `Дефицит: расходы — ${pct(share)} дохода`
        : `Расходы — ${pct(share)} дохода`;

    const base = Math.max(st.income, total, 1);
    $("#br-bar").innerHTML = lines.map((l) => `<span style="width:${((l.v / base) * 100).toFixed(2)}%;background:${l.col}"></span>`).join("");
    $("#br-lines").innerHTML = `<li><i style="background:#0040ff"></i><span>Доход</span><span>${fmtMoney(st.income)}</span></li>` +
      lines.map((l) => `<li><i style="background:${l.col}"></i><span>${esc(l.label)}<small>${esc(l.f)}</small></span><span>${l.v ? "−" : ""}${fmtMoney(l.v)}</span></li>`).join("") +
      `<li class="br-total"><i></i><span>Расходы всего</span><span>${fmtMoney(total)}</span></li>`;
    store.set("budget", st);
  };

  const update = () => { sync(); compute(); };

  const bindBudget = () => {
    const form = $("#budget-form");
    form.addEventListener("input", (e) => {
      const el = e.target;
      const k = el.dataset.k;
      if (!k) return;
      if (el.type === "checkbox") st[k] = el.checked;
      else {
        const [lo, hi] = LIMITS[k] || [0, 1e9];
        st[k] = clamp(num(el.value, D[k]), lo, hi);
      }
      update();
    });
    form.addEventListener("change", (e) => {
      // нормализуем поле после ввода
      if (e.target.dataset.k && e.target.type === "number") e.target.value = st[e.target.dataset.k];
    });
    form.addEventListener("submit", (e) => e.preventDefault());
    form.addEventListener("click", (e) => {
      const p = e.target.closest("[data-preset]");
      if (p) { st.income = Number(p.dataset.preset); update(); return; }
      const b = e.target.closest("[data-better]");
      if (b) {
        st.better = b.dataset.better === "1";
        if (st.better && st.rentMultiplier < items.rentBetter.multiplier[0]) st.rentMultiplier = items.rentBetter.multiplier[0];
        update();
        return;
      }
      const s = e.target.closest("[data-step]");
      if (s) {
        const k = s.dataset.step;
        const [lo, hi] = LIMITS[k];
        st[k] = clamp(st[k] + Number(s.dataset.dir), lo, hi);
        update();
      }
    });
    $("#budget-reset").addEventListener("click", () => {
      Object.assign(st, D);
      st.better = D.rentMultiplier > 1;
      if (!st.better) st.rentMultiplier = items.rentBetter.multiplier[0];
      store.del("budget");
      update();
      M.core.toast("Калькулятор сброшен");
    });
  };

  M.ui.economy = {
    init() {
      renderCards();
      renderScale();
      renderBudget();
      if (!st.better && st.rentMultiplier < items.rentBetter.multiplier[0]) st.rentMultiplier = items.rentBetter.multiplier[0];
      bindBudget();
      update();
    }
  };
})();
