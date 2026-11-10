
"use strict";

(() => {
  const STORAGE_KEY = "north-america-time-tracker:v3";

  const DEFAULT_IDS = [
    "usa-new-hampshire-concord",
    "usa-new-mexico-albuquerque",
    "canada-northwest-territories-yellowknife",
    "usa-north-carolina-charlotte",
    "usa-north-dakota-bismarck",
    "canada-nova-scotia-halifax",
    "usa-ohio-columbus",
    "usa-oklahoma-oklahoma-city",
    "usa-oregon-portland",
    "usa-pennsylvania-philadelphia",
    "canada-prince-edward-island-charlottetown",
    "canada-quebec-montreal",
    "usa-rhode-island-providence",
    "canada-saskatchewan-regina",
    "usa-south-carolina-columbia",
    "usa-south-dakota-sioux-falls",
    "usa-tennessee-nashville",
    "usa-texas-houston",
    "usa-vermont-burlington",
    "usa-west-virginia-charleston",
    "usa-wyoming-cheyenne",
    "canada-yukon-whitehorse"
  ];

  const byId = new Map(
    window.LOCATIONS.map(location => [location.id, location])
  );

  const $ = id => document.getElementById(id);

  const listEl = $("locationsList");
  const emptyEl = $("emptyState");
  const searchEl = $("searchInput");
  const clearSearchEl = $("clearSearch");
  const countEl = $("locationCount");
  const dialog = $("locationDialog");
  const catalogSearchEl = $("catalogSearch");
  const catalogListEl = $("catalogList");
  const statusEl = $("statusMessage");

  let state = loadState();
  let dragId = null;
  let dragPointerId = null;
  let statusTimer = null;


  // STORAGE

  function loadState() {
    const fallback = {
      ids: DEFAULT_IDS.filter(id => byId.has(id)),
      view: "cards",
      theme: "light"
    };

    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (!raw) return fallback;

      const parsed = JSON.parse(raw);

      if (!parsed || typeof parsed !== "object") {
        return fallback;
      }

      const ids = Array.isArray(parsed.ids)
        ? [...new Set(
            parsed.ids.filter(
              id => typeof id === "string" && byId.has(id)
            )
          )]
        : fallback.ids;

      return {
        ids,
        view: parsed.view === "list" ? "list" : "cards",
        theme: parsed.theme === "dark" ? "dark" : "light"
      };

    } catch {
      return fallback;
    }
  }


  function saveState() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ids: state.ids,
          view: state.view,
          theme: state.theme
        })
      );
    } catch {
      showStatus(
        "Не вдалося зберегти налаштування браузера."
      );
    }
  }


  function showStatus(message) {
    statusEl.textContent = message;

    window.clearTimeout(statusTimer);

    statusTimer = window.setTimeout(() => {
      statusEl.textContent = "";
    }, 4500);
  }


  // TIME

  function safeDateParts(timeZone) {
    try {
      const now = new Date();

      const time = new Intl.DateTimeFormat("uk-UA", {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23"
      }).format(now);

      const date = new Intl.DateTimeFormat("uk-UA", {
        timeZone,
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
      }).format(now);

      const zone = new Intl.DateTimeFormat("en-US", {
        timeZone,
        timeZoneName: "short"
      })
        .formatToParts(now)
        .find(part => part.type === "timeZoneName")?.value || timeZone;

      const targetDate = new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }).format(now);

      const localDate = new Intl.DateTimeFormat("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }).format(now);

      const difference =
        targetDate === localDate
          ? "сьогодні"
          : targetDate > localDate
            ? "завтра"
            : "вчора";

      return { time, date, zone, difference };

    } catch {
      return {
        time: "--:--:--",
        date: "Часовий пояс недоступний",
        zone: "—",
        difference: ""
      };
    }
  }


  function updateClocks() {
    const now = new Date();

    $("localClock").textContent =
      new Intl.DateTimeFormat("uk-UA", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23"
      }).format(now);

    $("localDate").textContent =
      new Intl.DateTimeFormat("uk-UA", {
        weekday: "long",
        day: "numeric",
        month: "long"
      }).format(now);

    document.querySelectorAll("[data-time-zone]").forEach(node => {
      const info = safeDateParts(node.dataset.timeZone);

      const clock = node.querySelector(".clock");
      const date = node.querySelector(".date-text");
      const zone = node.querySelector(".zone-tag");
      const diff = node.querySelector(".day-difference");

      if (clock) clock.textContent = info.time;
      if (date) date.textContent = info.date;
      if (zone) zone.textContent = info.zone;
      if (diff) diff.textContent = info.difference;
    });
  }


  // DOM HELPERS

  function createElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) {
      element.className = className;
    }

    if (text !== undefined) {
      element.textContent = text;
    }

    return element;
  }


  function makeLocationCard(location) {
    const card = createElement("article", "location-card");

    card.dataset.id = location.id;
    card.dataset.timeZone = location.timeZone;

    const top = createElement("div", "card-top");

    const identity = createElement(
      "div",
      "location-identity"
    );

    identity.append(
      createElement("span", "flag", location.flag)
    );

    const name = createElement("div", "location-name");

    name.append(
      createElement("strong", "", location.city)
    );

    name.append(
      createElement(
        "span",
        "",
        `${location.region}, ${location.country}`
      )
    );

    identity.append(name);

    const actions = createElement("div", "card-actions");

    const drag = createElement(
      "button",
      "drag-handle",
      "⠿"
    );

    drag.type = "button";
    drag.title = "Перетягни, щоб змінити порядок";

    drag.setAttribute(
      "aria-label",
      `Змінити порядок: ${location.city}`
    );

    drag.addEventListener("pointerdown", event => {
      startDrag(event, location.id);
    });

    const remove = createElement(
      "button",
      "remove-button",
      "×"
    );

    remove.type = "button";
    remove.title = "Видалити локацію";

    remove.setAttribute(
      "aria-label",
      `Видалити ${location.city}`
    );

    remove.addEventListener("click", () => {
      removeLocation(location.id);
    });

    actions.append(drag, remove);

    top.append(identity, actions);

    const timeRow = createElement("div", "time-row");

    timeRow.append(
      createElement("strong", "clock", "--:--:--")
    );

    timeRow.append(
      createElement("span", "day-difference", "")
    );

    const dateRow = createElement("div", "date-row");

    dateRow.append(
      createElement("span", "date-text", "Завантаження…")
    );

    dateRow.append(
      createElement("span", "zone-tag", "—")
    );

    card.append(top, timeRow, dateRow);

    return card;
  }


  // RENDER LOCATIONS

  function renderList() {
    const query = searchEl.value
      .trim()
      .toLocaleLowerCase("uk");

    const filtered = state.ids
      .map(id => byId.get(id))
      .filter(Boolean)
      .filter(location => {
        const searchable =
          `${location.city} ${location.region} ${location.country}`
            .toLocaleLowerCase("uk");

        return searchable.includes(query);
      });

    listEl.replaceChildren();

    listEl.classList.toggle(
      "list-view",
      state.view === "list"
    );

    filtered.forEach(location => {
      listEl.append(makeLocationCard(location));
    });

    listEl.hidden = filtered.length === 0;

    emptyEl.hidden = state.ids.length !== 0;

    if (state.ids.length > 0 && filtered.length === 0) {
      const noResults = createElement(
        "div",
        "no-results",
        "За цим запитом нічого не знайдено."
      );

      listEl.append(noResults);
      listEl.hidden = false;
    }

    countEl.textContent =
      `${state.ids.length} ${pluralize(
        state.ids.length,
        "локація",
        "локації",
        "локацій"
      )}`;

    document.querySelectorAll(".view-button").forEach(button => {
      const active = button.dataset.view === state.view;

      button.classList.toggle("active", active);

      button.setAttribute(
        "aria-pressed",
        String(active)
      );
    });

    updateClocks();
  }


  function pluralize(number, one, few, many) {
    const mod10 = number % 10;
    const mod100 = number % 100;

    if (mod10 === 1 && mod100 !== 11) return one;

    if (
      mod10 >= 2 &&
      mod10 <= 4 &&
      (mod100 < 12 || mod100 > 14)
    ) {
      return few;
    }

    return many;
  }


  // ADD / REMOVE

  function addLocation(id) {
    if (!byId.has(id) || state.ids.includes(id)) {
      return;
    }

    state.ids.push(id);

    saveState();
    renderList();
    renderCatalog();

    showStatus(
      `Додано: ${byId.get(id).city}.`
    );
  }


  function removeLocation(id) {
    const location = byId.get(id);

    state.ids = state.ids.filter(
      item => item !== id
    );

    saveState();
    renderList();
    renderCatalog();

    if (location) {
      showStatus(`Видалено: ${location.city}.`);
    }
  }


  // CATALOG

  function renderCatalog() {
    const query = catalogSearchEl.value
      .trim()
      .toLocaleLowerCase("uk");

    const available = window.LOCATIONS.filter(location => {
      const searchable =
        `${location.city} ${location.region} ${location.country}`
          .toLocaleLowerCase("uk");

      return searchable.includes(query);
    });

    catalogListEl.replaceChildren();

    $("catalogCount").textContent =
      `${available.length} міст у каталозі`;

    const groups = new Map();

    available.forEach(location => {
      const key = `${location.country} · ${location.region}`;

      if (!groups.has(key)) {
        groups.set(key, []);
      }

      groups.get(key).push(location);
    });

    if (available.length === 0) {
      catalogListEl.append(
        createElement(
          "div",
          "no-results",
          "Нічого не знайдено. Спробуй інший запит."
        )
      );

      return;
    }

    groups.forEach((locations, groupName) => {
      catalogListEl.append(
        createElement(
          "div",
          "catalog-group-title",
          groupName
        )
      );

      locations.forEach(location => {
        const item = createElement("div", "catalog-item");

        const info = createElement(
          "div",
          "catalog-item-info"
        );

        info.append(
          createElement("span", "flag", location.flag)
        );

        const labels = createElement("div");

        labels.append(
          createElement("strong", "", location.city)
        );

        labels.append(
          createElement("small", "", location.timeZone)
        );

        info.append(labels);

        const button = createElement(
          "button",
          "add-small",
          state.ids.includes(location.id)
            ? "Додано"
            : "＋ Додати"
        );

        button.type = "button";
        button.disabled = state.ids.includes(location.id);

        button.addEventListener("click", () => {
          addLocation(location.id);
        });

        item.append(info, button);

        catalogListEl.append(item);
      });
    });
  }


  function openCatalog() {
    catalogSearchEl.value = "";

    renderCatalog();

    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }

    catalogSearchEl.focus();
  }


  function closeCatalog() {
    if (typeof dialog.close === "function") {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
    }
  }


  // THEME

  function setTheme(theme) {
    state.theme = theme === "dark" ? "dark" : "light";

    document.documentElement.dataset.theme = state.theme;

    $("themeToggle").textContent =
      state.theme === "dark" ? "☾" : "☼";

    $("themeToggle").setAttribute(
      "aria-label",
      state.theme === "dark"
        ? "Увімкнути світлу тему"
        : "Увімкнути темну тему"
    );

    saveState();
  }


  // DRAG AND DROP

  function startDrag(event, id) {
    if (event.button !== 0 && event.pointerType === "mouse") {
      return;
    }

    event.preventDefault();

    dragId = id;
    dragPointerId = event.pointerId;

    const card = listEl.querySelector(
      `[data-id="${CSS.escape(id)}"]`
    );

    if (!card) return;

    card.classList.add("dragging");

    try {
      event.currentTarget.setPointerCapture(
        event.pointerId
      );
    } catch {}

    document.addEventListener(
      "pointermove",
      onDragMove
    );

    document.addEventListener(
      "pointerup",
      finishDrag,
      { once: true }
    );

    document.addEventListener(
      "pointercancel",
      finishDrag,
      { once: true }
    );
  }


  function onDragMove(event) {
    if (!dragId || event.pointerId !== dragPointerId) {
      return;
    }

    const dragging = listEl.querySelector(".dragging");

    if (!dragging) return;

    const candidates = [
      ...listEl.querySelectorAll(
        ".location-card:not(.dragging)"
      )
    ];

    candidates.forEach(card => {
      card.classList.remove("drag-over");
    });

    const target = candidates.find(card => {
      const rect = card.getBoundingClientRect();

      return (
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom &&
        event.clientX >= rect.left &&
        event.clientX <= rect.right
      );
    });

    if (target) {
      target.classList.add("drag-over");

      const rect = target.getBoundingClientRect();

      const after =
        event.clientY > rect.top + rect.height / 2;

      listEl.insertBefore(
        dragging,
        after ? target.nextSibling : target
      );
    }
  }


  function finishDrag(event) {
    if (!dragId) return;

    if (
      event &&
      dragPointerId !== null &&
      event.pointerId !== dragPointerId
    ) {
      return;
    }

    const dragging = listEl.querySelector(".dragging");

    if (dragging) {
      dragging.classList.remove("dragging");
    }

    listEl.querySelectorAll(".drag-over").forEach(card => {
      card.classList.remove("drag-over");
    });

    document.removeEventListener(
      "pointermove",
      onDragMove
    );

    const visibleIds = [
      ...listEl.querySelectorAll(".location-card")
    ].map(card => card.dataset.id);

    if (searchEl.value.trim()) {
      const visibleSet = new Set(visibleIds);
      let index = 0;

      state.ids = state.ids.map(id =>
        visibleSet.has(id)
          ? visibleIds[index++]
          : id
      );
    } else {
      state.ids = visibleIds;
    }

    dragId = null;
    dragPointerId = null;

    saveState();
    renderList();
  }


  // EVENTS

  $("addLocationButton").addEventListener(
    "click",
    openCatalog
  );

  $("emptyAddButton").addEventListener(
    "click",
    openCatalog
  );

  $("closeDialogButton").addEventListener(
    "click",
    closeCatalog
  );

  dialog.addEventListener("click", event => {
    if (event.target === dialog) {
      closeCatalog();
    }
  });

  searchEl.addEventListener("input", () => {
    clearSearchEl.hidden = searchEl.value.length === 0;
    renderList();
  });

  clearSearchEl.addEventListener("click", () => {
    searchEl.value = "";
    clearSearchEl.hidden = true;

    renderList();
    searchEl.focus();
  });

  catalogSearchEl.addEventListener(
    "input",
    renderCatalog
  );

  document.querySelectorAll(".view-button").forEach(button => {
    button.addEventListener("click", () => {
      state.view =
        button.dataset.view === "list"
          ? "list"
          : "cards";

      saveState();
      renderList();
    });
  });

  $("themeToggle").addEventListener("click", () => {
    setTheme(
      state.theme === "dark"
        ? "light"
        : "dark"
    );
  });

  $("resetOrderButton").addEventListener("click", () => {
    const current = new Set(state.ids);

    state.ids = DEFAULT_IDS.filter(
      id => current.has(id)
    );

    state.ids.push(
      ...[...current].filter(
        id => !state.ids.includes(id)
      )
    );

    saveState();
    renderList();

    showStatus("Початковий порядок відновлено.");
  });


  // START

  setTheme(state.theme);
  renderList();

  window.setInterval(updateClocks, 1000);

})();
