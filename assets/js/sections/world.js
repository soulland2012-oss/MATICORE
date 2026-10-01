/*
 * Раздел «Мир»: сюжетные блоки с полным описанием в диалоге, «Кто вы», временная линия.
 */
(function () {
  "use strict";
  const M = window.MANTICORA;
  const { $, $$, esc, md, artOrImage, onRoute, setHash, env } = M.core;
  const L = M.data.lore;

  const blocks = L.blocks;
  const byId = Object.fromEntries(blocks.map((b) => [b.id, b]));
  let lastTrigger = null;

  const card = (b, i) => {
    const art = artOrImage(b.image, M.art.lore[b.theme], "");
    const extra = "";
    return `
      <article class="lore-card lore-card--${b.theme}" id="lore-${b.id}" data-reveal style="--d:${(i % 2) * 90}ms">
        <div class="lore-card__art" aria-hidden="true">${art}</div>
        ${extra}
        <div class="lore-card__body">
          <p class="lore-card__kicker mono">${esc(b.kicker)}</p>
          <h3 class="lore-card__title">${esc(b.title)}</h3>
          <p class="lore-card__lead">${esc(b.lead)}</p>
          <ul class="lore-card__facts">${b.facts.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
          <button class="lore-card__more" type="button" data-lore="${b.id}" aria-haspopup="dialog">
            Читать полностью <span class="arrow" aria-hidden="true">→</span>
          </button>
        </div>
      </article>`;
  };

  const render = () => {
    $("#world-lead").textContent = L.intro;

    const grid = $("#lore-grid");
    const order = ["republic", "seal", "mages", "cyber"];
    let html = order.map((id, i) => card(byId[id], i)).join("");
    html += `<div class="barrier" data-reveal><p>LOGOS ←— человечество —→ Бездна<br><b>Магия людей — единственный барьер, удерживающий Бездну от полного прорыва</b></p></div>`;
    html += ["logos", "abyss"].map((id, i) => card(byId[id], i)).join("");
    grid.innerHTML = html;

    const who = L.whoYouAre;
    const marked = esc(who.text).replace("нелегалы, наёмники, бандиты или скрывающиеся маги", "<mark>нелегалы, наёмники, бандиты или скрывающиеся маги</mark>");
    $("#who").innerHTML = `
      <p class="who__label">// ${esc(who.title)}</p>
      <div>
        <p class="who__text">${marked}</p>
        <p class="who__sub">${esc(who.sub)}</p>
      </div>`;

    $("#timeline-track").innerHTML = L.timeline
      .map((t) => `
        <li class="tl-item${t.approx ? " tl-item--approx" : ""}${t.now ? " tl-item--now" : ""}">
          <p class="tl-item__when">${esc(t.when)}</p>
          <h4 class="tl-item__title">${esc(t.title)}</h4>
          <p class="tl-item__text">${esc(t.text)}</p>
        </li>`)
      .join("");

    $("#timeline-undated").innerHTML = L.undated
      .map((u) => `<li><b>${esc(u.title)}</b><span>${esc(u.text)}</span></li>`)
      .join("");
  };

  /* ───── Диалог с полным описанием ───── */
  const dlg = $("#lore-dialog");
  const inner = $("#lore-dialog-inner");

  const open = (id, trigger) => {
    const b = byId[id];
    if (!b) return;
    const idx = blocks.indexOf(b);
    const prev = blocks[(idx - 1 + blocks.length) % blocks.length];
    const next = blocks[(idx + 1) % blocks.length];
    inner.innerHTML = `
      <button class="lore-dialog__close" type="button" data-close aria-label="Закрыть">×</button>
      <div class="lore-dialog__art lore-card--${b.theme}" aria-hidden="true">${artOrImage(b.image, M.art.lore[b.theme])}</div>
      <div class="lore-dialog__content">
        <p class="sec-index mono"><span>${String(idx + 1).padStart(2, "0")}</span> / ${esc(b.kicker)}</p>
        <h2 id="lore-dialog-title">${esc(b.title)}</h2>
        <div class="rich">${b.body.map((p) => `<p>${md(p)}</p>`).join("")}</div>
        <div class="lore-dialog__nav">
          <button class="btn btn--ghost btn--small" type="button" data-lore-nav="${prev.id}"><span class="arrow" aria-hidden="true">←</span> ${esc(prev.title)}</button>
          <button class="btn btn--ghost btn--small" type="button" data-lore-nav="${next.id}">${esc(next.title)} <span class="arrow" aria-hidden="true">→</span></button>
        </div>
      </div>`;
    if (trigger) lastTrigger = trigger;
    if (!dlg.open) {
      if (typeof dlg.showModal === "function") dlg.showModal();
      else dlg.setAttribute("open", "");
    }
    dlg.scrollTop = 0;
    const close = $("[data-close]", inner);
    close && close.focus();
    M.core.sound.blip(900, 0.06);
  };

  const close = () => {
    if (typeof dlg.close === "function") dlg.close();
    else dlg.removeAttribute("open");
  };

  const bind = () => {
    $("#lore-grid").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-lore]");
      if (btn) open(btn.dataset.lore, btn);
    });
    dlg.addEventListener("click", (e) => {
      if (e.target === dlg) return close(); // клик по подложке
      if (e.target.closest("[data-close]")) return close();
      const nav = e.target.closest("[data-lore-nav]");
      if (nav) open(nav.dataset.loreNav);
      // ссылки внутри текста закрывают диалог
      const a = e.target.closest("a[href^='#']");
      if (a) close();
    });
    dlg.addEventListener("close", () => {
      if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus({ preventScroll: true });
    });

    // #world?b=abyss — открыть блок
    onRoute("world", (params) => {
      if (params.b && byId[params.b]) {
        const el = document.getElementById("lore-" + params.b);
        setTimeout(() => open(params.b, el && $(".lore-card__more", el)), env.reduced ? 0 : 450);
        return el;
      }
      return null;
    });
  };

  M.ui.world = {
    init() { render(); bind(); }
  };
})();
