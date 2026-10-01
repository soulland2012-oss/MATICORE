/*
 * Каталог имплантов: схема тела, фильтры (категория, тип, цена, пометка, влияние), поиск, сортировка,
 * карточки с условиями установки, калькулятор площади для кожи и кнопка «В анкету».
 */
(function () {
  "use strict";
  const M = window.MANTICORA;
  const { $, $$, esc, fmt, fmtMoney, NBSP, onRoute, setHash, scrollToEl, flash, debounce, store, sound } = M.core;
  const I = M.data.implants;

  const list = I.list;
  const byId = Object.fromEntries(list.map((x) => [x.id, x]));
  const catById = Object.fromEntries(I.categories.map((c) => [c.id, c]));
  const catOrder = I.categories.map((c) => c.id);
  const typeOrder = ["civil", "industrial", "military"];

  // Цена для фильтра и сортировки: нижняя граница (для кожи — за 10%)
  const pmin = (x) => x.price.min;
  const pmax = (x) => (x.price.max != null ? x.price.max : x.price.min);
  const PRICE_STEPS = [0, 100, 200, 300, 500, 750, 1000, 1500, 2000, 3000, 4000, 5000, 7500, 10000, 15000, 20000, 25000, 30000, 40000, 50000, 80000];

  const st = {
    q: "",
    cat: "all",
    types: new Set(),
    narr: "all",       // all | yes | no
    stat: "all",
    lo: 0,
    hi: PRICE_STEPS.length - 1,
    sort: "default"
  };

  const priceText = (x) => {
    const base = x.price.max != null ? `${fmt(x.price.min)}–${fmt(x.price.max)}${NBSP}€` : fmtMoney(x.price.min);
    return x.per10 ? `${base} <small>/ 10% кожи</small>` : base;
  };

  /* ───── Шапка раздела ───── */
  const renderTypes = () => {
    $("#implants-lead").textContent = I.general;
    $("#imp-types").innerHTML = typeOrder.map((t) => {
      const T = I.types[t];
      return `<div class="it-card it-card--${t}">
        <h3>${M.art.typeGlyph(t)}${esc(T.label)}</h3>
        <p>${esc(T.about)}</p>
        <p class="it-install">${esc(T.install)}</p>
      </div>`;
    }).join("") + `
      <div class="it-card it-card--narrative">
        <h3><span class="tag tag--solid imp-narr"><span>${esc(I.narrative.label)}</span></span></h3>
        <p><strong>${esc(I.narrative.rule)}</strong></p>
        <p>${esc(I.narrative.priceHint)}</p>
        <p class="it-install">В материалах пометка записана как «${esc(I.narrative.sourceLabel)}».</p>
      </div>`;
  };

  /* ───── Фильтры ───── */
  const count = (pred) => list.filter(pred).length;

  const renderFilters = () => {
    const spots = M.art.anatomySpots;
    $("#catalog-filters").innerHTML = `
      <div class="cf-block">
        <label class="field-label" for="imp-search">Поиск</label>
        <div class="search-box">
          <svg viewBox="0 0 24 24" class="ico" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M15.5 15.5 21 21" stroke="currentColor" stroke-width="1.8"/></svg>
          <input type="search" id="imp-search" placeholder="Название или эффект" autocomplete="off">
          <button type="button" class="search-box__clear" id="imp-search-clear" aria-label="Очистить поиск" hidden>×</button>
        </div>
      </div>

      <div class="cf-block">
        <p class="cf-title" id="cf-cat-title"><span>Категория</span></p>
        <div class="anatomy" id="anatomy" data-cat="all">
          ${M.art.anatomy()}
          ${catOrder.map((c) => `<button type="button" class="hotspot" style="left:${spots[c][0]}%;top:${spots[c][1]}%" data-cat="${c}" aria-pressed="false" aria-label="Категория: ${esc(catById[c].label)}"><span></span><em>${esc(catById[c].label)}</em></button>`).join("")}
        </div>
        <div class="cf-chips" role="group" aria-labelledby="cf-cat-title">
          <button type="button" class="chip" data-cat="all" aria-pressed="true">Все <span class="chip__count">${list.length}</span></button>
          ${I.categories.map((c) => `<button type="button" class="chip" data-cat="${c.id}" aria-pressed="false">${esc(c.label)} <span class="chip__count">${count((x) => x.cat === c.id)}</span></button>`).join("")}
        </div>
      </div>

      <div class="cf-block">
        <p class="cf-title" id="cf-type-title"><span>Тип</span></p>
        <div class="cf-chips" role="group" aria-labelledby="cf-type-title">
          ${typeOrder.map((t) => `<button type="button" class="chip" data-type="${t}" aria-pressed="false" style="--chip-on:var(--t-${t})">${M.art.typeGlyph(t)}${esc(I.types[t].label)}</button>`).join("")}
        </div>
      </div>

      <div class="cf-block">
        <p class="cf-title" id="cf-narr-title"><span>Пометка</span></p>
        <div class="segmented" role="group" aria-labelledby="cf-narr-title" style="--seg-on:var(--magenta)">
          <button type="button" data-narr="all" aria-pressed="true">Все</button>
          <button type="button" data-narr="yes" aria-pressed="false">Нарративные</button>
          <button type="button" data-narr="no" aria-pressed="false">Остальные</button>
        </div>
      </div>

      <div class="cf-block">
        <p class="cf-title"><span>Цена</span></p>
        <div class="price-range">
          <div class="price-range__vals"><span id="pr-lo"></span><span id="pr-hi"></span></div>
          <div class="dual">
            <div class="dual__track"><div class="dual__fill" id="pr-fill"></div></div>
            <input type="range" id="pr-min" min="0" max="${PRICE_STEPS.length - 1}" step="1" value="0" aria-label="Минимальная цена">
            <input type="range" id="pr-max" min="0" max="${PRICE_STEPS.length - 1}" step="1" value="${PRICE_STEPS.length - 1}" aria-label="Максимальная цена">
          </div>
          <p class="price-range__hint">Для кожи учитывается цена за 10% площади. Импланты с диапазоном цен попадают в фильтр, если диапазоны пересекаются.</p>
        </div>
      </div>

      <div class="cf-block">
        <label class="field-label" for="imp-stat">Влияние на показатель</label>
        <select class="select" id="imp-stat" style="width:100%">
          <option value="all">Любое</option>
          ${Object.entries(I.statLabels).map(([k, l]) => `<option value="${k}">${esc(l)} (${count((x) => (x.stats || []).includes(k))})</option>`).join("")}
        </select>
        <button type="button" class="btn btn--ghost btn--small cf-reset" id="imp-reset">Сбросить фильтры</button>
      </div>

      <div class="cf-block">
        <p class="cf-title"><span>Где достать</span></p>
        ${I.where.map((w) => `<p class="help" style="margin:0 0 8px"><a href="${esc(w.href)}">${esc(w.label)}</a>: ${esc(w.text)}</p>`).join("")}
      </div>`;
  };

  /* ───── Отбор ───── */
  const matches = (x) => {
    if (st.cat !== "all" && x.cat !== st.cat) return false;
    if (st.types.size && !st.types.has(x.type)) return false;
    if (st.narr === "yes" && !x.narrative) return false;
    if (st.narr === "no" && x.narrative) return false;
    if (st.stat !== "all" && !(x.stats || []).includes(st.stat)) return false;
    const lo = PRICE_STEPS[st.lo], hi = PRICE_STEPS[st.hi];
    if (pmax(x) < lo || pmin(x) > hi) return false;
    if (st.q) {
      const hay = [x.name, x.alias, x.desc, x.effect, catById[x.cat].label, I.types[x.type].label, x.priceNote].join(" ").toLowerCase();
      if (!st.q.split(/\s+/).every((w) => hay.includes(w))) return false;
    }
    return true;
  };

  const sorted = (arr) => {
    const a = arr.slice();
    if (st.sort === "price-asc") a.sort((p, q) => pmin(p) - pmin(q));
    else if (st.sort === "price-desc") a.sort((p, q) => pmax(q) - pmax(p));
    else if (st.sort === "name") a.sort((p, q) => p.name.localeCompare(q.name, "ru"));
    else a.sort((p, q) => catOrder.indexOf(p.cat) - catOrder.indexOf(q.cat) || typeOrder.indexOf(p.type) - typeOrder.indexOf(q.type));
    return a;
  };

  /* ───── Карточка ───── */
  const card = (x, i) => {
    const T = I.types[x.type];
    const req = [];
    if (x.priceNote) req.push(x.priceNote.charAt(0).toUpperCase() + x.priceNote.slice(1));
    (x.extra || []).forEach((e) => req.push(e));
    if (x.per10) req.push("Указать % площади кожи и участки тела");
    const stats = (x.stats || []).map((k) => `<span>${esc(I.statLabels[k])}</span>`).join("");

    return `
      <article class="imp-card imp-card--${x.type}" id="imp-${x.id}" style="--d:${Math.min(i, 12) * 30}ms" aria-labelledby="in-${x.id}">
        <div class="imp-card__top">
          <span class="tag imp-card__type">${M.art.typeGlyph(x.type)}${esc(T.short)}</span>
          <span class="tag imp-card__cat">${esc(catById[x.cat].label)}</span>
          ${x.narrative ? `<span class="tag tag--solid imp-narr" title="${esc(I.narrative.rule)}"><span>${esc(I.narrative.label)}</span></span>` : ""}
        </div>
        <h4 class="imp-card__name" id="in-${x.id}">${esc(x.name)}</h4>
        ${x.alias ? `<p class="imp-card__alias">${esc(x.alias)}</p>` : ""}
        <p class="imp-card__desc">${esc(x.desc)}</p>
        <dl>
          <div class="imp-block imp-block--effect${x.effect ? "" : " is-none"}">
            <dt>Игровой эффект</dt>
            <dd>${x.effect ? esc(x.effect) : "Отдельной механики в материалах нет — см. описание"}</dd>
          </div>
          <div class="imp-block">
            <dt>Условия установки</dt>
            <dd>${esc(T.install)}</dd>
          </div>
          ${req.length ? `<div class="imp-block imp-block--req"><dt>Дополнительно</dt><dd><ul>${req.map((r) => `<li>${esc(r)}</li>`).join("")}</ul></dd></div>` : ""}
          ${x.narrative ? `<div class="imp-block imp-block--narr"><dt>Анкета</dt><dd>${esc(I.narrative.rule)}</dd></div>` : ""}
        </dl>
        ${stats ? `<div class="imp-card__stats" aria-label="Влияет на">${stats}</div>` : ""}
        ${x.per10 ? `
          <div class="skin-calc" data-skin="${x.id}">
            <div class="skin-calc__row">
              <label class="field-label" style="margin:0" for="sk-${x.id}">Площадь кожи</label>
              <span class="skin-calc__total" data-skin-total></span>
            </div>
            <input type="range" id="sk-${x.id}" min="10" max="100" step="10" value="10" data-skin-pct aria-label="Площадь кожи, %">
            <label class="visually-hidden" for="sp-${x.id}">Участки тела</label>
            <input class="input" id="sp-${x.id}" type="text" placeholder="Участки тела: например, предплечья и спина" data-skin-parts>
          </div>` : ""}
        <div class="imp-card__foot">
          <div class="imp-price">
            <span class="imp-price__label">Каталожная цена</span>
            <span class="imp-price__val">${priceText(x)}</span>
            ${x.priceNote ? `<span class="imp-price__note">${esc(x.priceNote)}</span>` : ""}
          </div>
          <button type="button" class="btn btn--ghost btn--small" data-add="${x.id}">В анкету <span aria-hidden="true">+</span></button>
        </div>
      </article>`;
  };

  /* ───── Рендер ───── */
  const grid = () => $("#catalog-grid");

  const render = () => {
    const found = sorted(list.filter(matches));
    $("#catalog-count").innerHTML = `Найдено: <b>${found.length}</b> из ${list.length}`;
    if (!found.length) {
      grid().innerHTML = `<div class="catalog__empty"><b>Ничего не найдено</b>Измените запрос или <button type="button" class="btn btn--ghost btn--small" data-reset style="margin-top:12px">сбросьте фильтры</button></div>`;
    } else if (st.sort === "default") {
      // Группы по категориям
      let html = "", lastCat = null, i = 0;
      found.forEach((x) => {
        if (x.cat !== lastCat) {
          const c = catById[x.cat];
          html += `<div class="cat-head"><h3>${esc(c.label)}</h3><p>${esc(c.sub || "")}</p>${c.note ? `<p class="cat-note">${esc(c.note)}</p>` : ""}</div>`;
          lastCat = x.cat;
        }
        html += card(x, i++);
      });
      grid().innerHTML = html;
    } else {
      grid().innerHTML = found.map(card).join("");
    }
    $$("[data-skin]", grid()).forEach(updateSkin);
    syncControls();
  };

  const updateSkin = (box) => {
    const x = byId[box.dataset.skin];
    const p = Number($("[data-skin-pct]", box).value);
    const r = $("[data-skin-pct]", box);
    r.style.setProperty("--fill", ((p - 10) / 90) * 100 + "%");
    const k = p / 10;
    const min = x.price.min * k, max = (x.price.max || x.price.min) * k;
    $("[data-skin-total]", box).textContent = `${p}% → ${min === max ? fmtMoney(min) : fmt(min) + "–" + fmtMoney(max)}`;
  };

  const activeFilters = () =>
    (st.cat !== "all") + st.types.size + (st.narr !== "all") + (st.stat !== "all") + (st.lo > 0 || st.hi < PRICE_STEPS.length - 1) + !!st.q;

  const syncControls = () => {
    const f = $("#catalog-filters");
    $$("[data-cat]", f).forEach((b) => b.setAttribute("aria-pressed", b.dataset.cat === st.cat));
    $("#anatomy").dataset.cat = st.cat;
    $$("[data-type]", f).forEach((b) => b.setAttribute("aria-pressed", st.types.has(b.dataset.type)));
    $$("[data-narr]", f).forEach((b) => b.setAttribute("aria-pressed", b.dataset.narr === st.narr));
    $("#imp-stat").value = st.stat;
    $("#catalog-sort").value = st.sort;
    const si = $("#imp-search");
    if (document.activeElement !== si) si.value = st.q;
    $("#imp-search-clear").hidden = !st.q;
    $("#pr-min").value = st.lo;
    $("#pr-max").value = st.hi;
    const n = PRICE_STEPS.length - 1;
    $("#pr-fill").style.left = (st.lo / n) * 100 + "%";
    $("#pr-fill").style.right = 100 - (st.hi / n) * 100 + "%";
    $("#pr-lo").textContent = fmtMoney(PRICE_STEPS[st.lo]);
    $("#pr-hi").textContent = st.hi === n ? fmtMoney(PRICE_STEPS[n]) + "+" : fmtMoney(PRICE_STEPS[st.hi]);
    $("#pr-min").setAttribute("aria-valuetext", fmtMoney(PRICE_STEPS[st.lo]));
    $("#pr-max").setAttribute("aria-valuetext", fmtMoney(PRICE_STEPS[st.hi]));
    const a = activeFilters();
    const badge = $("#filters-count");
    badge.hidden = !a;
    badge.textContent = a;
  };

  const reset = () => {
    st.q = ""; st.cat = "all"; st.types.clear(); st.narr = "all"; st.stat = "all"; st.lo = 0; st.hi = PRICE_STEPS.length - 1; st.sort = "default";
    render();
  };

  const toHash = () => {
    const p = [];
    if (st.cat !== "all") p.push("cat=" + st.cat);
    if (st.types.size) p.push("type=" + [...st.types].join(","));
    if (st.narr !== "all") p.push("narr=" + st.narr);
    if (st.stat !== "all") p.push("stat=" + st.stat);
    if (st.q) p.push("q=" + encodeURIComponent(st.q));
    setHash("#implants" + (p.length ? "?" + p.join("&") : ""));
  };

  const changed = () => { render(); toHash(); };

  /* ───── События ───── */
  const bind = () => {
    const f = $("#catalog-filters");
    f.addEventListener("click", (e) => {
      const c = e.target.closest("[data-cat]");
      if (c) {
        st.cat = c.classList.contains("hotspot") && st.cat === c.dataset.cat ? "all" : c.dataset.cat;
        sound.blip(1600, 0.03);
        return changed();
      }
      const t = e.target.closest("[data-type]");
      if (t) { st.types.has(t.dataset.type) ? st.types.delete(t.dataset.type) : st.types.add(t.dataset.type); return changed(); }
      const n = e.target.closest("[data-narr]");
      if (n) { st.narr = n.dataset.narr; return changed(); }
      if (e.target.closest("#imp-reset")) { reset(); toHash(); return; }
    });
    const search = $("#imp-search");
    search.addEventListener("input", debounce(() => { st.q = search.value.trim().toLowerCase(); changed(); }, 160));
    search.addEventListener("keydown", (e) => { if (e.key === "Escape") { search.value = ""; st.q = ""; changed(); } });
    $("#imp-search-clear").addEventListener("click", () => { search.value = ""; st.q = ""; changed(); search.focus(); });
    $("#imp-stat").addEventListener("change", (e) => { st.stat = e.target.value; changed(); });
    $("#catalog-sort").addEventListener("change", (e) => { st.sort = e.target.value; render(); });
    $("#pr-min").addEventListener("input", (e) => { st.lo = Math.min(Number(e.target.value), st.hi); render(); });
    $("#pr-max").addEventListener("input", (e) => { st.hi = Math.max(Number(e.target.value), st.lo); render(); });

    const g = grid();
    g.addEventListener("input", (e) => {
      const box = e.target.closest("[data-skin]");
      if (box && e.target.matches("[data-skin-pct]")) updateSkin(box);
    });
    g.addEventListener("click", (e) => {
      if (e.target.closest("[data-reset]")) { reset(); toHash(); return; }
      const add = e.target.closest("[data-add]");
      if (!add) return;
      const x = byId[add.dataset.add];
      let text = x.name + (x.narrative ? " (нарративный)" : "");
      if (x.per10) {
        const box = $(`[data-skin="${x.id}"]`, g);
        const p = $("[data-skin-pct]", box).value;
        const parts = $("[data-skin-parts]", box);
        if (!parts.value.trim()) {
          parts.focus();
          parts.setAttribute("aria-invalid", "true");
          M.core.toast("Для кожи укажите участки тела");
          return;
        }
        parts.removeAttribute("aria-invalid");
        text += ` — ${p}% площади, участки: ${parts.value.trim()}`;
      }
      M.ui.anketa.addImplant(x.cat, text);
      sound.blip(1000, 0.06);
    });

    const toggle = $("#filters-toggle");
    const panel = $("#catalog-filters");
    const mq = window.matchMedia("(max-width: 980px)");
    const setCollapsed = (v) => {
      panel.dataset.collapsed = v ? "true" : "false";
      toggle.setAttribute("aria-expanded", String(!v));
    };
    setCollapsed(mq.matches);
    toggle.addEventListener("click", () => setCollapsed(panel.dataset.collapsed !== "true"));
    const onMq = () => setCollapsed(mq.matches);
    if (mq.addEventListener) mq.addEventListener("change", onMq); else mq.addListener(onMq);

    onRoute("implants", (params, hasQuery) => {
      if (!hasQuery) return null;
      reset();
      if (params.id && byId[params.id]) {
        render();
        const el = document.getElementById("imp-" + params.id);
        if (el) { setTimeout(() => flash(el, "is-flash"), 500); el.style.setProperty("--d", "0ms"); }
        return el;
      }
      if (params.cat && catById[params.cat]) st.cat = params.cat;
      if (params.type) params.type.split(",").forEach((t) => I.types[t] && st.types.add(t));
      if (params.narr === "yes" || params.narr === "no") st.narr = params.narr;
      if (params.stat && I.statLabels[params.stat]) st.stat = params.stat;
      if (params.q) st.q = params.q.toLowerCase();
      render();
      return document.getElementById("implants");
    });
  };

  M.ui.implants = {
    init() { renderTypes(); renderFilters(); bind(); render(); }
  };
})();
