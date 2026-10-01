/*
 * Каталог имплантов. Источник — раздел «ИМПЛАНТЫ» материалов проекта.
 *
 * Поля импланта:
 *   cat        — категория (eyes | brain | nervous | arms | legs | organs | skin)
 *   type       — тип (civil | industrial | military)
 *   name       — название; alias — русское название из материалов (если есть)
 *   desc       — описание
 *   effect     — игровой эффект (текст из скобок в материалах) или null
 *   price      — { min, max? } в элларах; для кожи — цена за каждые 10% площади (per10: true)
 *   priceNote  — уточнение к цене из материалов («на чёрном рынке», «+ установка» и т. п.)
 *   extra      — дополнительные расходы/требования из материалов
 *   narrative  — пометка «Нарративный» (в материалах — «Норративный»)
 *   stats      — на какие показатели влияет эффект (для фильтра и перекрёстных ссылок)
 */
MANTICORA.data.implants = {
  general:
    "Некоторые импланты можно поставить как в городских, так и в частных больницах. Но особые импланты можно поставить только в подпольных больницах или у специалистов-механиков.",

  where: [
    { text: "В подполье Крейнера можно найти и установить абсолютно любой имплант.", href: "#fortum?d=kreiner", label: "Крейнер" },
    { text: "В руинах Пепельника продаётся абсолютно всё — от военных экзоскелетов и запрещённых технологий до людей в рабство.", href: "#fortum?d=ashes", label: "Пепельник" }
  ],

  narrative: {
    label: "Нарративный",
    sourceLabel: "Норративный",
    rule: "Такие импланты можно брать себе в анкету сразу — без одобрения и без траты капитала в анкете.",
    priceHint: "Каталожная цена — стоимость в мире игры. При создании анкеты нарративный имплант капитал не расходует."
  },

  types: {
    civil: {
      label: "Гражданские",
      short: "Гражданский",
      about:
        "Облегчают обычную жизнь и являются базой для большинства людей. Абсолютно законные, а некоторые даже обязательные для работы. Абсолютно не боевые, но некоторые умельцы могут их хакнуть или использовать для своих целей.",
      install: "Абсолютно законные. Особых условий установки в материалах нет."
    },
    industrial: {
      label: "Промышленные",
      short: "Промышленный",
      about:
        "Ставят те, кто связал жизнь со своей профессией: более сильные руки, заземление, улучшенная оптика. Часто стоят дороже.",
      install: "В государственных больницах не поставят. Для установки в частной клинике нужны документы о профессии."
    },
    military: {
      label: "Военные",
      short: "Военный",
      about:
        "Импланты для боевых задач. Обычный гражданин не может получить их законно, стоят они очень дорого.",
      install:
        "Если попросить установить такой даже в частной клинике — скорее всего, через минуту вас упакуют оперы. Идти нужно сразу к подпольным «риперам»."
    }
  },

  categories: [
    { id: "eyes", label: "Глаза", sub: "Оптические импланты" },
    { id: "brain", label: "Мозг", sub: "Нейропроцессоры и когнитивные импланты" },
    { id: "nervous", label: "Нервная система", sub: "Нейростимуляторы и бустеры" },
    { id: "arms", label: "Руки", sub: "Киберконечности и предплечья" },
    { id: "legs", label: "Ноги", sub: "Нижние конечности" },
    { id: "organs", label: "Внутренние органы", sub: "Синтетические органы" },
    {
      id: "skin",
      label: "Кожа",
      sub: "Покровы и подкожные модули",
      note: "При установке имплантов категории «Кожа» необходимо указывать, какой % площади кожи они занимают и на каких участках тела."
    }
  ],

  // Названия показателей для фильтра «Влияние».
  statLabels: {
    str: "Сила",
    tough: "Прочность",
    speed: "Скорость",
    agi: "Ловкость",
    react: "Реакция",
    endur: "Выносливость",
    ranged: "Дальний бой",
    melee: "Ближний бой",
    defense: "Защита"
  },

  list: [
    /* ───────────── 1. ГЛАЗА ───────────── */
    { id: "optiglance", cat: "eyes", type: "civil", name: "OptiGlance Basic",
      desc: "Повседневные линзы с AR-интерфейсом. Выводят навигацию, входящие сообщения, погоду и таргетированную рекламу прямо на сетчатку.",
      effect: null, price: { min: 100, max: 1000 }, narrative: true },
    { id: "focusmaster", cat: "eyes", type: "civil", name: "FocusMaster HD",
      desc: "Фильтры высокого разрешения с защитой от вспышек, автоматической подстройкой под освещение и функцией цифрового зума (до 10x).",
      effect: null, price: { min: 300, max: 1500 } },
    { id: "glamoptics", cat: "eyes", type: "civil", name: "GlamOptics Iris",
      desc: "Декоративная оптика, меняющая узор, цвет и форму зрачка по щелчку пальцев (от классического человеческого глаза до неоновых логотипов).",
      effect: null, price: { min: 400 }, narrative: true },
    { id: "sleepwell", cat: "eyes", type: "civil", name: "SleepWell Filter",
      desc: "Ночной окуляр, полностью вырезающий раздражающий неоновый свет рекламы за окном и накладывающий усыпляющие визуальные паттерны.",
      effect: null, price: { min: 600 }, narrative: true },

    { id: "scantech", cat: "eyes", type: "industrial", name: "ScanTech Spectrum",
      desc: "Оптический модуль с тепловизором, инфракрасным спектрометром и спектрометром материалов. Позволяет на лету видеть дефекты конструкций, микротрещины и утечки газа.",
      effect: null, price: { min: 3500 } },
    { id: "weldershield", cat: "eyes", type: "industrial", name: "WelderShield Core",
      desc: "Глаза с автоматическим затемнением уровня сварочной маски, встроенным дальномером и лазерным уровнем для строителей и монтажников.",
      effect: null, price: { min: 2000 } },
    { id: "macrolens", cat: "eyes", type: "industrial", name: "MacroLens Precision",
      desc: "Микроскопический окуляр для ювелиров, электронщиков и микрохирургов. Позволяет рассмотреть детали размером до нескольких микрон.",
      effect: null, price: { min: 4500 } },
    { id: "depthgrid", cat: "eyes", type: "industrial", name: "DepthGrid 3D",
      desc: "Линзы с лазерной сеткой, накладывающие пространственную метрическую сетку на окружающий мир.",
      effect: "+0,5 к навыку дальнего боя и оценке дистанции", price: { min: 3000 }, stats: ["ranged"] },

    { id: "smartlink", cat: "eyes", type: "military", name: "Midler-Pattern Smart-Link",
      desc: "Баллистический вычислитель, выводящий траектории пуль и захватывающий цели для умного оружия. Позволяет видеть через укрытия при связи с датчиками. Даёт оптическое приближение 10х.",
      effect: "+1 к навыку стрельбы", price: { min: 10000 }, priceNote: "на чёрном рынке", extra: ["+ установка"], stats: ["ranged"] },
    { id: "odin", cat: "eyes", type: "military", name: "Odin Threat-Evaluator",
      desc: "Сканер биосигналов и движений: подсвечивает пульс противников, оценивает их вооружение, эмоциональное состояние и строит вероятностные маршруты отступления.",
      effect: null, price: { min: 12000 } },
    { id: "flashbang", cat: "eyes", type: "military", name: "FlashBang Deadswitch",
      desc: "Защитный затвор. Моментально перекрывает фотоматрицу металлическими шторками или цифровым гашением.",
      effect: "Полный иммунитет к ослеплению светошумовыми гранатами и лазерами", price: { min: 8000 } },
    { id: "targetmark", cat: "eyes", type: "military", name: "Target-Mark Hunter",
      desc: "Оптический модуль, фиксирующий тепловой след цели. Сохраняет её контур через тонкие укрытия и высчитывает маршрут отступления на 2 поста.",
      effect: null, price: { min: 14000 }, priceNote: "на чёрном рынке" },

    /* ───────────── 2. НЕРВНАЯ СИСТЕМА ───────────── */
    { id: "zensync", cat: "nervous", type: "civil", name: "ZenSync Calmer",
      desc: "Микрочип, регулирующий уровень кортизола и адреналина. Помогает справляться со стрессом, паническими атаками и бессонницей в шумном мегаполисе.",
      effect: null, price: { min: 500 }, priceNote: "может быть оплачен страховкой", narrative: true },
    { id: "synapseboost", cat: "nervous", type: "civil", name: "SynapseBoost Lite",
      desc: "Нейростимулятор для водителей и офисных работников. Снижает утомляемость, ускоряет реакцию за рулём и улучшает концентрацию.",
      effect: "+0,5 к реакции и выносливости", price: { min: 1000 }, stats: ["react", "endur"] },
    { id: "dopamine", cat: "nervous", type: "civil", name: "Dopamine Flow Control",
      desc: "Легальный стимулятор настроения. Подаёт микродозы синтетических нейромедиаторов для поддержания бодрости и снятия стресса.",
      effect: null, price: { min: 600 }, priceNote: "может покрываться страховкой", narrative: true },
    { id: "sensingcomfort", cat: "nervous", type: "civil", name: "Sensing-Comfort Net",
      desc: "Приглушитель бытовых раздражителей. Сглаживает неприятные запахи, фоновый шум и резкие перепады температур на уровне нейроимпульсов.",
      effect: null, price: { min: 800 }, narrative: true },

    { id: "neurolink", cat: "nervous", type: "industrial", name: "NeuroLink Cable-Driver",
      desc: "Усиленные нейроразъёмы в шее/спине для прямого подключения к тяжёлой погрузочной технике, буровым установкам или заводским цехам.",
      effect: null, price: { min: 4000 } },
    { id: "biofeedback", cat: "nervous", type: "industrial", name: "BioFeedback Damper",
      desc: "Блокиратор болевых сигналов от перегрузок и судорог, позволяющий операторам работать в экстремальных условиях без потери контроля.",
      effect: "+1 к выносливости", price: { min: 3000 }, stats: ["endur"] },
    { id: "reflexbypass", cat: "nervous", type: "industrial", name: "Reflex Bypass Router",
      desc: "Блок дублирования нервных путей. Перенаправляет импульсы по дублирующим кабелям при травмах.",
      effect: "Игнорирует штрафы к характеристикам от повреждений конечностей до конца боя", price: { min: 5000 } },
    { id: "precisionpulse", cat: "nervous", type: "industrial", name: "Precision-Pulse Damper",
      desc: "Система полного подавления тремора рук для высотников и операторов прецизионных станков.",
      effect: "0,5 к дальнему оружию в стабильной позиции", price: { min: 3500 }, stats: ["ranged"] },

    { id: "woltage", cat: "nervous", type: "military", name: "Woltage Neural Booster",
      desc: "Классический бустер реакций. При резком выбросе адреналина или опасности временно ускоряет восприятие, из-за чего весь мир вокруг буквально замедляется.",
      effect: "+4 к реакции на 1 пост один раз за бой", price: { min: 15000 }, priceNote: "на чёрном рынке", stats: ["react"] },
    { id: "overclock", cat: "nervous", type: "military", name: "Synaptic Overclock (Overdrive)",
      desc: "Боевой имплант, принудительно заставляющий нервную систему проводить импульсы быстрее. Даёт безумную скорость движений, но оставляет ожоги на нейронах при долгой активации.",
      effect: "+4 к реакции и +4 к скорости на 1 пост 1 раз за бой. Может быть продолжен на ещё 1 пост ценой 1 балла выносливости до конца боя",
      price: { min: 25000 }, stats: ["react", "speed", "endur"] },
    { id: "painkill", cat: "nervous", type: "military", name: "Pain-Kill Overdrive",
      desc: "Жёсткий блокиратор шока. Полностью отключает болевые рецепторы при критических ранениях.",
      effect: "Позволяет игнорировать эффекты нокдауна и боли, сохраняя полный контроль над телом до потери сознания или смерти",
      price: { min: 18000 }, priceNote: "на чёрном рынке" },
    { id: "combatneuro", cat: "nervous", type: "military", name: "Combat-Neuro Link",
      desc: "Тактическая нейросеть для отряда. Синхронизирует нервные системы бойцов подразделения.",
      effect: "+1 к ловкости и +1 к защите всем союзникам с таким же имплантом в радиусе 15 метров",
      price: { min: 22000 }, priceNote: "на чёрном рынке", stats: ["agi", "defense"] },

    /* ───────────── 3. РУКИ ───────────── */
    { id: "stylusflex", cat: "arms", type: "civil", name: "StylusFlex Hands",
      desc: "Протезы с ювелирной точностью пальцев, встроенными выдвижными кабелями для зарядки гаджетов и мини-инструментами для мелкого ремонта.",
      effect: null, price: { min: 200 }, narrative: true },
    { id: "velvet", cat: "arms", type: "civil", name: "Scent-&-Touch Velvet",
      desc: "Биопротезы с сенсорами высокого разрешения, полностью имитирующие настоящую кожу и дающие сверхчувствительное восприятие текстур и температур.",
      effect: null, price: { min: 1000 }, narrative: true },
    { id: "chefblade", cat: "arms", type: "civil", name: "Chef-Blade Forearm",
      desc: "Выдвижной разделочный инструмент высочайшей заточки, скрытый в предплечье.",
      effect: null, price: { min: 500 }, narrative: true },
    { id: "carrygrip", cat: "arms", type: "civil", name: "CarryGrip Handles",
      desc: "Уплотнённые фаланги со встроенными фиксаторами для переноски тяжестей без натирания и боли.",
      effect: null, price: { min: 300 }, narrative: true },

    { id: "gripmaster", cat: "arms", type: "industrial", name: "GripMaster Heavy",
      desc: "Гидравлические или сервоприводные кисти. Способны сминать металл, удерживать листы стали без страха сорвать резьбу или порезать пальцы.",
      effect: "Дают +3 к силе на проверке силы: на поднятие тяжестей, открывание дверей или захваты. На удары не влияет",
      price: { min: 12000 }, stats: ["str"] },
    { id: "torchhand", cat: "arms", type: "industrial", name: "TorchHand Cutter",
      desc: "Встроенный в предплечье плазменный или газовый резак для демонтажа металлоконструкций и сварки прямо на месте. Режет на дистанции 1 сантиметра от пальца с глубиной до 1 сантиметра.",
      effect: null, price: { min: 8000 } },
    { id: "jackhammer", cat: "arms", type: "industrial", name: "Jackhammer Impact Arm",
      desc: "Пневматическая рука-отбойник. Способна выдавать серию высокочастотных ударов высокой мощности.",
      effect: "Даёт +2 к силе при разрушении стен, бетона и конструкций; на живые цели действует как тяжёлый дробный урон, скейлится от навыка ближнего боя",
      price: { min: 10000 }, stats: ["str", "melee"] },
    { id: "cablespool", cat: "arms", type: "industrial", name: "Cable-Spool Launcher",
      desc: "Заменяет предплечье на катушку с высокопрочным тросом (20 метров) и магнитным гарпуном. Позволяет поднимать грузы до 500 кг или подтягиваться.",
      effect: null, price: { min: 7000 } },

    { id: "mantis", cat: "arms", type: "military", name: "Mantis Blades", alias: "Клинки Мантиса",
      desc: "Выдвижные лезвия из мономолекулярного сплава, спрятанные в предплечьях. Позволяют моментально рассекать врагов в ближнем бою (как у ассасинов).",
      effect: null, price: { min: 20000 } },
    { id: "gorilla", cat: "arms", type: "military", name: "Gorilla Arms", alias: "Силовые руки",
      desc: "Тяжёлые ударные протезы с кинетическими накопителями. При ударе высвобождают взрывную волну, способную выбить стальную дверь или раздробить кости.",
      effect: "+4 ко всей силе", price: { min: 35000 }, stats: ["str"] },
    { id: "projectile", cat: "arms", type: "military", name: "Projectile Launch System",
      desc: "Встроенная в предплечье микро-ракетница, стреляющая транквилизаторами, осколочными или зажигательными снарядами. Однозарядная и требует ручной перезарядки.",
      effect: null, price: { min: 40000 }, extra: ["+500 € каждый снаряд"] },
    { id: "monowire", cat: "arms", type: "military", name: "Monowire", alias: "Моноструна",
      desc: "Скрытая в запястье тончайшая молекулярная струна. Работает как хлыст ближне-среднего боя.",
      effect: "Скейлится от оружия ближнего боя", price: { min: 28000 }, stats: ["melee"] },
    { id: "shockpalm", cat: "arms", type: "military", name: "Shock-Palm Dispenser",
      desc: "Встроенный в ладонь высоковольтный разрядник.",
      effect: "При контакте наносит урон током и оглушает цель на 1 пост, а также отключает сложные механизмы имплантов, например глубокий анализ или маскировку",
      price: { min: 16000 } },

    /* ───────────── 4. НОГИ ───────────── */
    { id: "urbanpace", cat: "legs", type: "civil", name: "UrbanPace Step",
      desc: "Лёгкие титаново-композитные ноги со встроенными амортизаторами. Снижают нагрузку на суставы и позвоночник при многочасовой ходьбе.",
      effect: null, price: { min: 1000 }, narrative: true },
    { id: "magtread", cat: "legs", type: "civil", name: "MagTread Shoes",
      desc: "Ступни с отключаемыми магнитами и противоскользящим протектором для работы или прогулок по скользким высотным крышам.",
      effect: null, price: { min: 1500 } },
    { id: "heeladjust", cat: "legs", type: "civil", name: "Heel-Adjust Mobility",
      desc: "Протезы с изменяемой геометрией стопы под любую обувь или особенности покрытия.",
      effect: null, price: { min: 800 }, narrative: true },
    { id: "comfortpillow", cat: "legs", type: "civil", name: "Comfort-Pillow Suspension",
      desc: "Мягкая пневматическая подвеска в голенях, гасящая вибрации при длительном беге.",
      effect: null, price: { min: 1200 }, narrative: true },

    { id: "loadbearer", cat: "legs", type: "industrial", name: "LoadBearer Cargo-Legs",
      desc: "Усиленный каркас с гидравликой. Позволяет переносить грузы до 200–300 кг без нагрузки на спину.",
      effect: "+3 силы на проверке силы на подъём", price: { min: 8000 }, stats: ["str"] },
    { id: "anchorstance", cat: "legs", type: "industrial", name: "AnchorStance Piles",
      desc: "Ноги со встроенными выдвижными стальными сваями-анкерами. Позволяют намертво зафиксироваться на любой поверхности при сильном ветре или работе с тяжёлым инструментом.",
      effect: null, price: { min: 6000 } },
    { id: "maganchor", cat: "legs", type: "industrial", name: "Magnetic Anchor Boots",
      desc: "Ступни со сверхмощными электромагнитами для работы на металлических конструкциях.",
      effect: "Позволяют уверенно ходить по вертикальным металлоконструкциям и удерживаться во время шторма/взрывов",
      price: { min: 4500 } },
    { id: "spiderlegs", cat: "legs", type: "industrial", name: "All-Terrain Spider-Legs",
      desc: "Ноги с выдвижными шипами, адаптирующиеся под грязь, щебень и завалы.",
      effect: "Игнорируют штрафы к перемещению по сложной и разрушенной местности", price: { min: 5500 } },

    { id: "lynx", cat: "legs", type: "military", name: "Lynx Paws", alias: "Лапы Рыси",
      desc: "Бесшумные стопы с синтетическим подушечным покрытием и гасителями вибраций. Делают шаги и бег владельца абсолютно невидимыми для аудиодатчиков.",
      effect: null, price: { min: 15000 } },
    { id: "tendons", cat: "legs", type: "military", name: "Reinforced Tendons",
      desc: "Двужильные поршневые сухожилия, позволяющие отпрыгивать от стен или запрыгивать на высоту третьего этажа.",
      effect: null, price: { min: 25000 } },
    { id: "strikers", cat: "legs", type: "military", name: "Fortified Strikers",
      desc: "Усиленные голени с поршневым механизмом. Превращают пинок в удар огромной кинетической силы.",
      effect: "+2 к силе при ударах ногами и выбивании дверей", price: { min: 18000 }, stats: ["str"] },
    { id: "cushion", cat: "legs", type: "military", name: "Cushion-Shock Absorbers",
      desc: "Десантные амортизаторы.",
      effect: "Полностью нейтрализуют урон от падения с высоты до 4 этажей", price: { min: 20000 } },

    /* ───────────── 5. ВНУТРЕННИЕ ОРГАНЫ ───────────── */
    { id: "filtermax", cat: "organs", type: "civil", name: "FilterMax Liver",
      desc: "Синтетическая печень, нейтрализующая любые токсины, тяжёлые металлы, алкоголь и яды.",
      effect: null, price: { min: 1300 }, narrative: true },
    { id: "cardiopure", cat: "organs", type: "civil", name: "CardioPure Heart",
      desc: "Искусственное сердце с бесперебойным магнитно-роторным насосом. Исключает инфаркты, регулирует давление и оптимизирует уровень кислорода.",
      effect: null, price: { min: 4000 }, narrative: true },
    { id: "gastrofilter", cat: "organs", type: "civil", name: "Gastro-Filter Micro-Pump",
      desc: "Очистительный модуль для желудка. Нейтрализует калории, вредные жиры и химикаты из дешёвой фастфуд-еды.",
      effect: null, price: { min: 900 }, narrative: true },
    { id: "bloodpurifier", cat: "organs", type: "civil", name: "Blood-Purifier Lite",
      desc: "Портативный диализный модуль, постоянно очищающий кровь от продуктов распада.",
      effect: null, price: { min: 2500 }, narrative: true },

    { id: "hazmatlungs", cat: "organs", type: "industrial", name: "HazMat Synthetic Lungs",
      desc: "Лёгкие-фильтры со встроенными баллонами задержки дыхания. Позволяют дышать в задымлённых помещениях, химических зонах и под водой до 30 минут.",
      effect: null, price: { min: 12000 } },
    { id: "biorecycler", cat: "organs", type: "industrial", name: "Biochemical Recycler",
      desc: "Модифицированный желудок, способный расщеплять и усваивать питательные вещества из сухпайков наихудшего качества или даже очищенной органической массы.",
      effect: null, price: { min: 5000 } },
    { id: "toxicdust", cat: "organs", type: "industrial", name: "Toxic-Dust Filtration Heart",
      desc: "Кастомная помпа с циклонным фильтром. Предотвращает забивание сосудов мелкой производственной пылью и стружкой.",
      effect: "Даёт полный иммунитет к бытовым и производственным пылевым отравлениям", price: { min: 6000 } },
    { id: "batterycore", cat: "organs", type: "industrial", name: "Internal Battery Core",
      desc: "Топливный элемент в брюшной полости, работающий на биоматериалах.",
      effect: "Служит резервным источником питания, увеличивая время работы активных военных/промышленных имплантов в 2 раза",
      price: { min: 9000 } },

    { id: "secondheart", cat: "organs", type: "military", name: "Second Heart", alias: "Второе сердце",
      desc: "Резервный орган, который при остановке основного сердца выплёскивает мощный разряд тока и дозу адреналина, возвращая бойца к жизни прямо в бою. Временно заменяет повреждённое сердце.",
      effect: "Можно продолжать бой ещё 5 постов после остановки сердца, и даёт высокий шанс выжить после этого",
      price: { min: 50000 } },
    { id: "adrenconverter", cat: "organs", type: "military", name: "Subdermal Adrenalin Converter",
      desc: "Синтетические надпочечники, выбрасывающие в кровь боевой коктейль из обезболивающих, стимуляторов и коагулянтов при получении тяжёлых ранений.",
      effect: null, price: { min: 20000 } },
    { id: "adrensynth", cat: "organs", type: "military", name: "Adrenalin Synthesizer",
      desc: "Боевой синтезатор. Выбрасывает смесь стимуляторов при падении здоровья.",
      effect: "Автоматически восстанавливает +2 к ловкости и +2 к скорости на 1 пост при тяжёлом ранении",
      price: { min: 24000 }, stats: ["agi", "speed"] },
    { id: "biomonitor", cat: "organs", type: "military", name: "Bio-Monitor Emergency Valve",
      desc: "Умные клапаны для артерий. Моментально перекрывают повреждённый сосуд при ампутации или разрыве.",
      effect: "Полностью предотвращает смертельную кровопотерю при отсечении конечностей", price: { min: 30000 } },

    /* ───────────── 6. МОЗГ ───────────── */
    { id: "membank", cat: "brain", type: "civil", name: "MemBank Storage",
      desc: "Дополнительный твердотельный накопитель памяти. Позволяет записывать воспоминания, видео/аудио из глаз и хранить гигабайты документов прямо в голове.",
      effect: null, price: { min: 1500 }, narrative: true },
    { id: "linguist", cat: "brain", type: "civil", name: "Linguist Chipset",
      desc: "Модуль мгновенного синхронного перевода сотен языков и диалектов.",
      effect: null, price: { min: 3500 } },
    { id: "commshub", cat: "brain", type: "civil", name: "Comms-Hub Chip",
      desc: "Телефонный и сетевой модуль прямо в голове. Позволяет совершать звонки и выходить в Сеть «мысленно».",
      effect: null, price: { min: 800 }, narrative: true },
    { id: "dreamarchitect", cat: "brain", type: "civil", name: "Dream-Architect Nu",
      desc: "Модуль фаз сна. Позволяет высыпаться за 3–4 часа без потери продуктивности.",
      effect: null, price: { min: 2000 }, narrative: true },

    { id: "datacoprocessor", cat: "brain", type: "industrial", name: "DataCoprocessor Engine",
      desc: "Вычислительный блок для работы с массивами данных, чертежами и трёхмерным проектированием прямо в ментальном пространстве.",
      effect: null, price: { min: 10000 } },
    { id: "safetyoverride", cat: "brain", type: "industrial", name: "Safety-Override Override",
      desc: "Чип контроллера, который блокирует панические реакции мозга при авариях и позволяет человеку принимать холодные решения по инструкции.",
      effect: "Невосприимчивость к понижению реакции", price: { min: 10000 }, stats: ["react"] },
    { id: "blueprint", cat: "brain", type: "industrial", name: "Blueprint Coprocessor",
      desc: "Чип-проектор, удерживающий в голове сложные 3D-схемы и сопоставляющий их с реальностью.",
      effect: null, price: { min: 8500 } },
    { id: "diagnostic", cat: "brain", type: "industrial", name: "Diagnostic Core",
      desc: "Аналитический чип, сканирующий состояние внешних машин.",
      effect: "Автоматически подсвечивает уязвимые узлы и поломки в любой технике или робототехнике", price: { min: 9500 } },

    { id: "cyberdeck", cat: "brain", type: "military", name: "Cyberdeck Processing Unit",
      desc: "Встроенный в череп нейродек для хакеров (нетраннеров), позволяющий взламывать вражеские импланты, турели и сетчатки за доли секунды.",
      effect: "Позволяет совершать quick hack", price: { min: 40000 } },
    { id: "kanwar", cat: "brain", type: "military", name: "Kanwar Processing Unit",
      desc: "Хребтовый нейрочип высокого уровня. Включается вручную и ускоряет восприятие и тело до такого состояния, что всё кажется замедленным.",
      effect: "+15 к реакции и +8 к скорости на 1 пост. Каждое использование уменьшает выносливость на 0,1 перманентно, пока имплант не будет заменён",
      price: { min: 80000 }, stats: ["react", "speed", "endur"] },
    { id: "autotargeter", cat: "brain", type: "military", name: "Tactical Auto-Targeter",
      desc: "Боевой процессор, рассчитывающий баллистику для нескольких целей.",
      effect: "Позволяет вести эффективную стрельбу по 2 целям одновременно без штрафа к точности",
      price: { min: 35000 }, stats: ["ranged"] },
    { id: "icebreaker", cat: "brain", type: "military", name: "ICE-Breaker Hard-Core",
      desc: "Нейрочип защитно-наступательного типа.",
      effect: "Автоматически блокирует первую вражескую хакерскую атаку за бой и наносит обратный урон хакеру",
      price: { min: 45000 } },

    /* ───────────── 7. КОЖА (цена за каждые 10% площади) ───────────── */
    { id: "chromaskin", cat: "skin", type: "civil", name: "ChromaSkin Matrix",
      desc: "Умная дерма с гибкими светодиодами/пикселями. Позволяет менять цвет кожи, выводить татуировки, которые двигаются или меняют паттерн под музыку.",
      effect: null, price: { min: 500 }, per10: true, narrative: true },
    { id: "thermoregul", cat: "skin", type: "civil", name: "ThermoRegul Skin",
      desc: "Подкожная сетка микрокапилляров, поддерживающая идеальную температуру тела как в −30 °C, так и в +50 °C.",
      effect: null, price: { min: 1000 }, per10: true },
    { id: "perfumepore", cat: "skin", type: "civil", name: "Perfume-Pore System",
      desc: "Микропоры, выделяющие синтетические парфюмерные композиции с возможностью выбора аромата.",
      effect: null, price: { min: 300 }, per10: true, narrative: true },
    { id: "cleantouch", cat: "skin", type: "civil", name: "CleanTouch Dermis",
      desc: "Олеофобное покрытие кожи, с которого легко смывается любая грязь, жир и краска.",
      effect: null, price: { min: 400 }, per10: true, narrative: true },

    { id: "fireretard", cat: "skin", type: "industrial", name: "FireRetard Containment",
      desc: "Термостойкая негорающая синтетическая кожа, защищающая от открытого огня, брызг кислоты и электрических дуг.",
      effect: "+7 прочности ко всем химическим эффектам, будь то огонь или химикаты", price: { min: 4000 }, per10: true, stats: ["tough"] },
    { id: "griptextured", cat: "skin", type: "industrial", name: "Grip-Textured Epidermis",
      desc: "Шероховатая подкожная структура с микроприсосками для удержания на гладких и мокрых металлических поверхностях.",
      effect: null, price: { min: 4000 }, per10: true, narrative: true },
    { id: "insulation", cat: "skin", type: "industrial", name: "Insulation Rubberized Layer",
      desc: "Диэлектрический подкожный слой.",
      effect: "+5 прочности к урону электричеством и статическим разрядам", price: { min: 3500 }, per10: true, stats: ["tough"] },
    { id: "abrasion", cat: "skin", type: "industrial", name: "Abrasion-Resistant Mesh",
      desc: "Армированная подкожная сетка.",
      effect: "Защищает от мелких царапин, ссадин, порезов стружкой и лёгких абразивных повреждений", price: { min: 3000 }, per10: true },

    { id: "subdermalarmor", cat: "skin", type: "military", name: "Subdermal Armor", alias: "Подкожная броня",
      desc: "Пластины из кевлара и подкожные нити из углеродного волокна. Защищают от мелкого калибра, осколков и ножевых порезов, сохраняя внешне человеческий вид.",
      effect: "+8 прочности для колющих, режущих и стрелковых повреждений. Не защищает от дробящего урона",
      price: { min: 12000 }, per10: true, stats: ["tough"] },
    { id: "opticalcamo", cat: "skin", type: "military", name: "Optical Camouflage (Camo)",
      desc: "Система микролинз на поверхности кожи, преломляющая свет вокруг владельца. Делает человека почти невидимым для невооружённого глаза на короткое время.",
      effect: null, price: { min: 20000 }, per10: true },
    { id: "thermaldamp", cat: "skin", type: "military", name: "Thermal-Dampening Skin",
      desc: "Термопоглощающее покрытие.",
      effect: "Делает персонажа полностью невидимым для тепловизоров и датчиков тепла", price: { min: 15000 }, per10: true },
    { id: "empshield", cat: "skin", type: "military", name: "EMP-Shielding Underlayer",
      desc: "Подкожный экранирующий слой из сетки Фарадея.",
      effect: "Защищает внутреннюю электронику и другие импланты от отключения при ЭМИ-взрывах", price: { min: 18000 }, per10: true }
  ]
};
