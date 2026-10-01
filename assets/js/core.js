/*
 * Ядро: утилиты, форматирование, маршрутизация по якорям, звук, служебные эффекты.
 */
(function () {
  "use strict";
  const M = window.MANTICORA;

  /* ───── DOM ───── */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const esc = (s) =>
    String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  // Мини-разметка в данных: **жирный**, [текст](#якорь)
  const md = (s) =>
    esc(s)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\[([^\]]+)\]\((#[^)\s]*)\)/g, '<a href="$2">$1</a>');

  const plain = (s) => String(s || "").replace(/\*\*(.+?)\*\*/g, "$1").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");

  /* ───── Числа и цены ───── */
  const NBSP = " ";
  const fmt = (n) => {
    const v = Math.round(n * 100) / 100;
    const [i, d] = String(Math.abs(v)).split(".");
    const int = i.length > 3 ? i.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP) : i;
    return (v < 0 ? "−" : "") + int + (d ? "," + d : "");
  };
  const fmtMoney = (n) => fmt(n) + NBSP + "€";
  const fmtRange = (min, max) => (max != null && max !== min ? fmt(min) + "–" + fmt(max) : fmt(min)) + NBSP + "€";
  const pct = (n) => fmt(Math.round(n * 10) / 10) + "%";

  /* ───── Состояние окружения ───── */
  const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const env = {
    get reduced() { return mqReduce.matches; },
    onReduceChange(fn) {
      if (mqReduce.addEventListener) mqReduce.addEventListener("change", fn);
      else if (mqReduce.addListener) mqReduce.addListener(fn);
    },
    finePointer: window.matchMedia("(pointer: fine)").matches
  };

  /* ───── Хранилище (может быть недоступно) ───── */
  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem("manticora:" + key);
        return raw == null ? fallback : JSON.parse(raw);
      } catch (e) { return fallback; }
    },
    set(key, val) {
      try { localStorage.setItem("manticora:" + key, JSON.stringify(val)); } catch (e) { /* без сохранения */ }
    },
    del(key) {
      try { localStorage.removeItem("manticora:" + key); } catch (e) { /* ничего */ }
    }
  };

  /* ───── Тост ───── */
  let toastTimer = 0;
  const toast = (msg) => {
    const el = $("#toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-on"), 3200);
  };

  /* ───── Копирование и скачивание ───── */
  const copyText = async (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) { /* переходим к запасному способу */ }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    ta.remove();
    return ok;
  };

  const downloadText = (filename, text) => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  /* ───── Появление при прокрутке ───── */
  let revealObserver = null;
  const reveal = (root = document) => {
    const els = $$("[data-reveal]:not(.is-in)", root);
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("is-in");
              revealObserver.unobserve(e.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
      );
    }
    els.forEach((el) => revealObserver.observe(el));
  };

  /* ───── Маршруты вида #раздел?ключ=значение ───── */
  const routes = {};
  const parseHash = (hash) => {
    const h = (hash || "").replace(/^#/, "");
    const [id, q] = h.split("?");
    const params = {};
    if (q) {
      q.split("&").forEach((pair) => {
        const [k, v] = pair.split("=");
        if (k) params[decodeURIComponent(k)] = decodeURIComponent((v || "").replace(/\+/g, " "));
      });
    }
    return { id, params, hasQuery: !!q };
  };

  const scrollToEl = (el, opts = {}) => {
    if (!el) return;
    el.scrollIntoView({ behavior: env.reduced || opts.instant ? "auto" : "smooth", block: opts.block || "start" });
  };

  const route = (hash, opts = {}) => {
    const { id, params, hasQuery } = parseHash(hash);
    if (!id) return false;
    const handler = routes[id];
    let target = null;
    if (handler) target = handler(params, hasQuery) || null;
    if (!target) target = document.getElementById(id);
    if (target && opts.scroll !== false) scrollToEl(target, { instant: opts.instant });
    return !!target;
  };

  const onRoute = (id, fn) => { routes[id] = fn; };

  const setHash = (hash, replace = true) => {
    try {
      if (replace) history.replaceState(null, "", hash);
      else history.pushState(null, "", hash);
    } catch (e) { /* file:// в некоторых браузерах */ }
  };

  // Перехват внутренних ссылок с параметрами
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const href = a.getAttribute("href");
    if (href === "#" || href.length < 2) return;
    const { id, hasQuery } = parseHash(href);
    if (!hasQuery && !routes[id]) return; // обычный якорь — браузер справится сам
    e.preventDefault();
    setHash(href, false);
    route(href);
    M.ui.closeMenu && M.ui.closeMenu();
  });

  window.addEventListener("hashchange", () => route(location.hash));

  /* ───── Звук (только по желанию пользователя) ───── */
  const sound = (() => {
    let ctx = null, master = null, nodes = [], on = false;

    const start = () => {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = ctx || new AC();
      if (ctx.state === "suspended") ctx.resume();
      master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);

      // Низкий гул мегаполиса
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 180;
      lp.connect(master);
      [55, 55.6, 82.4].forEach((f, i) => {
        const o = ctx.createOscillator();
        o.type = i === 2 ? "triangle" : "sawtooth";
        o.frequency.value = f;
        const g = ctx.createGain();
        g.gain.value = i === 2 ? 0.05 : 0.11;
        o.connect(g).connect(lp);
        o.start();
        nodes.push(o);
      });

      // Шум дождя/вентиляции
      const len = ctx.sampleRate * 2;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      noise.loop = true;
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 1400;
      bp.Q.value = 0.6;
      const ng = ctx.createGain();
      ng.gain.value = 0.035;
      noise.connect(bp).connect(ng).connect(master);
      noise.start();
      nodes.push(noise);

      master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 1.2);
      return true;
    };

    const stop = () => {
      if (!ctx || !master) return;
      const m = master, ns = nodes;
      m.gain.cancelScheduledValues(ctx.currentTime);
      m.gain.setValueAtTime(m.gain.value, ctx.currentTime);
      m.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
      setTimeout(() => { ns.forEach((n) => { try { n.stop(); } catch (e) {} }); m.disconnect(); }, 500);
      nodes = [];
      master = null;
    };

    const blip = (freq = 1200, dur = 0.05) => {
      if (!on || !ctx) return;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "square";
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.025, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      o.connect(g).connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + dur);
    };

    return {
      get on() { return on; },
      toggle() {
        if (on) { stop(); on = false; }
        else { on = start(); }
        return on;
      },
      blip
    };
  })();

  /* ───── Редкий глитч заголовков ───── */
  const glitch = (() => {
    let timer = 0;
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      return r.bottom > 0 && r.top < window.innerHeight;
    };
    const fire = (el) => {
      if (!el || env.reduced) return;
      el.classList.remove("is-glitching");
      void el.offsetWidth;
      el.classList.add("is-glitching");
      setTimeout(() => el.classList.remove("is-glitching"), 380);
    };
    const loop = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (!document.hidden && !env.reduced) {
          const list = $$(".glitch").filter(visible);
          if (list.length) fire(list[Math.floor(Math.random() * list.length)]);
        }
        loop();
      }, 6500 + Math.random() * 7000);
    };
    return { start: loop, fire };
  })();

  /* ───── Вспомогательное ───── */
  const debounce = (fn, ms = 150) => {
    let t = 0;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const num = (v, fallback = 0) => {
    const n = parseFloat(String(v).replace(",", ".").replace(/[^\d.\-]/g, ""));
    return Number.isFinite(n) ? n : fallback;
  };
  const flash = (el, cls = "is-flash") => {
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), 1500);
  };

  // Картинка из данных, если путь задан; иначе — встроенная графика
  const artOrImage = (imgPath, artFn, alt = "") => {
    if (imgPath) {
      const fallback = artFn ? artFn() : "";
      return `<img src="${esc(imgPath)}" alt="${esc(alt)}" loading="lazy" decoding="async" data-fallback="1">` +
        `<template class="art-fallback">${fallback}</template>`;
    }
    return artFn ? artFn() : "";
  };
  // Если файла нет — подменяем на встроенную графику
  document.addEventListener("error", (e) => {
    const img = e.target;
    if (img && img.tagName === "IMG" && img.dataset.fallback) {
      const tpl = img.nextElementSibling;
      if (tpl && tpl.classList.contains("art-fallback")) {
        img.insertAdjacentHTML("afterend", tpl.innerHTML);
        tpl.remove();
      }
      img.remove();
    }
  }, true);

  M.core = {
    $, $$, esc, md, plain, fmt, fmtMoney, fmtRange, pct, NBSP,
    env, store, toast, copyText, downloadText, reveal,
    onRoute, route, parseHash, setHash, scrollToEl,
    sound, glitch, debounce, clamp, num, flash, artOrImage
  };
})();
