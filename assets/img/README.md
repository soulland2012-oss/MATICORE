# Иллюстрации

Пока путь к картинке в данных равен `null`, сайт рисует встроенную SVG/canvas-графику.
Чтобы поставить свою иллюстрацию, положите файл в эту папку и укажите путь в нужном файле данных.
Если файл не найдётся, сайт автоматически вернёт встроенную графику.

| Что | Где указать | Рекомендуемый размер |
|---|---|---|
| Панорама первого экрана | `assets/js/data/site.js → images.hero` | 2400×1350 и больше, тёмная, без текста |
| Сюжетные блоки (6 шт.) | `assets/js/data/lore.js → blocks[].image` | 1600×1200 |
| Районы (6 шт.) | `assets/js/data/fortum.js → districts[].image` | 1600×800 (2:1) |
| Эмблемы фракций | `assets/js/data/factions.js → list[].emblem` | SVG или PNG 600×600 с прозрачным фоном |

Пример:

```js
// assets/js/data/fortum.js
{ id: "kreiner", ..., image: "assets/img/districts/kreiner.jpg" }
```

Предлагаемая структура папок:

```
assets/img/hero/
assets/img/lore/
assets/img/districts/
assets/img/factions/
```
