/*
 * Раздел «Начало игры»: маршрут из пяти шагов. Контакты выводятся, только если заданы в data/site.js.
 */
(function () {
  "use strict";
  const M = window.MANTICORA;
  const { $, $$, esc, store } = M.core;
  const A = M.data.anketa;
  const site = M.data.site;

  let concept = store.get("concept", null);

  const link = (href, label) => `<a href="${esc(href)}">${esc(label)} <span aria-hidden="true">→</span></a>`;

  const sheetLinks = () => {
    const mage = concept === "mage";
    return mage
      ? link("#anketa?type=mage", "Анкета мага") + link("#anketa?type=nonmage", "Анкета не-мага")
      : link("#anketa?type=nonmage", "Анкета не-мага") + link("#anketa?type=mage", "Анкета мага");
  };

  const render = () => {
    const steps = [
      {
        t: "Познакомиться с миром",
        x: "Республика на руинах Империи Дракен, запечатанная магия, LOGOS и Бездна. Затем — районы Фортума и фракции.",
        links: link("#world", "Мир и история") + link("#fortum", "Карта Фортума") + link("#factions", "Фракции")
      },
      {
        t: "Изучить правила",
        x: "Статы от 1 до 10, система попаданий, криты, магия и мана, ограничения имплантов. Цены — в разделе экономики.",
        links: link("#rules", "Игровая система") + link("#economy", "Экономика") + link("#implants", "Каталог имплантов")
      },
      {
        t: "Выбрать концепцию",
        x: "Кем вы будете в Фортуме?",
        html: `<div class="concepts" role="group" aria-label="Концепция персонажа">${A.concepts.map((c) => `
          <button type="button" class="concept${c.mage ? " concept--mage" : ""}" data-concept="${c.id}" aria-pressed="${concept === c.id}">
            <b>${esc(c.title)}</b><span>${esc(c.text)}</span>
          </button>`).join("")}</div>`
      },
      {
        t: "Заполнить анкету",
        x: "Маг или не-маг — у каждого свой шаблон. Конструктор соберёт текст и посчитает очки.",
        links: `<span data-sheet-links>${sheetLinks()}</span>`
      },
      {
        t: "Передать администрации",
        x: "Администрация утверждает персонажа. По запросу Анкетолог или админ бросает статы на d10, капитал назначает админ по биографии и рандомайзеру.",
        links: link("#anketa", "Готовая анкета")
      }
    ];

    $("#route").innerHTML = steps.map((s, i) => `
      <li class="step" data-reveal style="--d:${i * 80}ms">
        <span class="step__num" aria-hidden="true">0${i + 1}</span>
        <div class="step__card">
          <h3 class="step__title"><span class="visually-hidden">Шаг ${i + 1}. </span>${esc(s.t)}</h3>
          <p class="step__text">${esc(s.x)}</p>
          ${s.html || ""}
          ${s.links ? `<div class="step__links">${s.links}</div>` : ""}
        </div>
      </li>`).join("");

    // Контакты — только если они заданы
    const box = $("#contacts");
    if (site.contacts && site.contacts.length) {
      box.hidden = false;
      box.innerHTML = site.contacts.map((c) => `<a class="btn btn--primary" href="${esc(c.url)}" target="_blank" rel="noopener">${esc(c.label)} <span class="arrow" aria-hidden="true">↗</span></a>`).join("");
    }
  };

  const bind = () => {
    $("#route").addEventListener("click", (e) => {
      const b = e.target.closest("[data-concept]");
      if (!b) return;
      concept = concept === b.dataset.concept ? null : b.dataset.concept;
      store.set("concept", concept);
      $$("[data-concept]").forEach((x) => x.setAttribute("aria-pressed", x.dataset.concept === concept));
      const sl = $("[data-sheet-links]");
      if (sl) sl.innerHTML = sheetLinks();
    });
  };

  M.ui.start = { init() { render(); bind(); } };
})();
