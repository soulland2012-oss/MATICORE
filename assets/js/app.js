/*
 * Точка входа: навигация, шапка, мобильное меню, прогресс прокрутки, звук, запуск разделов.
 */
(function () {
  "use strict";
  const M = window.MANTICORA;
  const { $, $$, esc, reveal, route, glitch, sound, toast } = M.core;
  const site = M.data.site;

  /* ───── Навигация ───── */
  const renderNav = () => {
    const items = site.nav.map((n) => `<li><a href="#${n.id}" data-nav="${n.id}">${esc(n.label)}</a></li>`).join("");
    $("#nav-list").innerHTML = items;
    $("#mobile-nav-list").innerHTML = items;
    $("#footer-nav").innerHTML = items;
  };

  const header = $("#site-header");
  const progress = $(".scroll-progress");

  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 24);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.setProperty("--p", max > 0 ? (y / max).toFixed(4) : 0);
  };

  // Подсветка текущего раздела в меню
  const watchSections = () => {
    if (!("IntersectionObserver" in window)) return;
    const owner = {};
    site.nav.forEach((n) => { owner[n.id] = n.id; (n.also || []).forEach((a) => { owner[a] = n.id; }); });
    const setCurrent = (id) => {
      $$("[data-nav]").forEach((a) => a.setAttribute("aria-current", a.dataset.nav === id ? "true" : "false"));
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) setCurrent(owner[e.target.id] || null);
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["top", ...Object.keys(owner)].forEach((id) => { const el = document.getElementById(id); el && io.observe(el); });
  };

  /* ───── Мобильное меню ───── */
  const menuBtn = $("#menu-toggle");
  const menu = $("#mobile-menu");
  const openMenu = () => {
    menu.hidden = false;
    menuBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    const first = $("a", menu);
    first && first.focus();
  };
  const closeMenu = () => {
    if (menu.hidden) return;
    menu.hidden = true;
    menuBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  };
  M.ui.closeMenu = closeMenu;

  const bindMenu = () => {
    menuBtn.addEventListener("click", () => (menu.hidden ? openMenu() : closeMenu()));
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) closeMenu(); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !menu.hidden) { closeMenu(); menuBtn.focus(); }
      // Удерживаем фокус внутри открытого меню
      if (e.key === "Tab" && !menu.hidden) {
        const f = [menuBtn, ...$$("a", menu)];
        const i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    });
    window.addEventListener("resize", () => { if (window.innerWidth > 1180) closeMenu(); });
  };

  /* ───── Звук ───── */
  const bindSound = () => {
    const btn = $("#sound-toggle");
    btn.addEventListener("click", () => {
      const on = sound.toggle();
      btn.setAttribute("aria-pressed", String(on));
      $("b", btn).textContent = on ? "вкл" : "выкл";
      toast(on ? "Звук включён: фоновый гул города" : "Звук выключен");
    });
  };

  /* ───── Запуск ───── */
  const safe = (name, fn) => {
    try { fn(); } catch (err) { console.error(`[Мантикора] раздел «${name}»:`, err); }
  };

  const init = () => {
    renderNav();
    safe("hero", () => M.ui.hero.init());
    safe("world", () => M.ui.world.init());
    safe("fortum", () => M.ui.fortum.init());
    safe("factions", () => M.ui.factions.init());
    safe("economy", () => M.ui.economy.init());
    safe("rules", () => M.ui.rules.init());
    safe("anketa", () => M.ui.anketa.init());
    safe("implants", () => M.ui.implants.init());
    safe("start", () => M.ui.start.init());

    bindMenu();
    bindSound();
    watchSections();
    reveal();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    glitch.start();

    // Глубокая ссылка при загрузке
    if (location.hash.length > 1) {
      requestAnimationFrame(() => route(location.hash, { instant: true }));
    }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
