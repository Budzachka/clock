
"use strict";

const STORAGE_KEY = "north-america-time-tracker-settings";
const locations = Array.isArray(window.LOCATIONS) ? window.LOCATIONS : [];

const elements = {
  locationsList: document.getElementById("locationsList"),
  locationCount: document.getElementById("locationCount"),
  emptyState: document.getElementById("emptyState"),
  searchInput: document.getElementById("searchInput"),
  clearSearch: document.getElementById("clearSearch"),
  sortSelect: document.getElementById("sortSelect"),
  primaryNameSelect: document.getElementById("primaryNameSelect"),
  resetFiltersButton: document.getElementById("resetFiltersButton"),
  resetOrderButton: document.getElementById("resetOrderButton"),
  themeToggle: document.getElementById("themeToggle"),
  localClock: document.getElementById("localClock"),
  localDate: document.getElementById("localDate"),
  locationDialog: document.getElementById("locationDialog"),
  addLocationButton: document.getElementById("addLocationButton"),
  emptyAddButton: document.getElementById("emptyAddButton"),
  closeDialogButton: document.getElementById("closeDialogButton"),
  catalogSearch: document.getElementById("catalogSearch"),
  catalogList: document.getElementById("catalogList"),
  catalogCount: document.getElementById("catalogCount"),
  statusMessage: document.getElementById("statusMessage")
};

const defaultIds = locations.slice(0, 8).map(location => location.id);

function loadSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;

    const parsed = JSON.parse(saved);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (error) {
    console.warn("Не вдалося прочитати налаштування:", error);
    return null;
  }
}

const savedSettings = loadSettings();

const state = {
  ids: Array.isArray(savedSettings?.ids)
    ? savedSettings.ids.filter(id => locations.some(location => location.id === id))
    : [...defaultIds],

  view: savedSettings?.view === "list" ? "list" : "cards",
  theme: savedSettings?.theme === "dark" ? "dark" : "light",
  primaryName: savedSettings?.primaryName === "region" ? "region" : "city",

  sort: [
    "manual",
    "city-asc",
    "city-desc",
    "region-asc",
    "region-desc",
    "time-asc",
    "time-desc"
  ].includes(savedSettings?.sort)
    ? savedSettings.sort
    : "manual"
};

function saveSettings() {
  const settings = {
    ids: state.ids,
    view: state.view,
    theme: state.theme,
    primaryName: state.primaryName,
    sort: state.sort
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn("Не вдалося зберегти налаштування:", error);
    showStatus("Не вдалося зберегти налаштування браузера.");
  }
}

function getLocation(id) {
  return locations.find(location => location.id === id);
}

function getCity(location) {
  return location?.city || location?.name || "Невідоме місто";
}

function getRegion(location) {
  return location?.region || location?.state || location?.province || "";
}

function getCountry(location) {
  return location?.country || "";
}

function getTimeZone(location) {
  return location?.timeZone || location?.timezone || "UTC";
}

function getFlag(location) {
  return location?.flag || "🌎";
}

function showStatus(message) {
  elements.statusMessage.textContent = message;

  if (message) {
    window.clearTimeout(showStatus.timeout);
    showStatus.timeout = window.setTimeout(() => {
      elements.statusMessage.textContent = "";
    }, 3000);
  }
}

function formatTime(timeZone) {
  return new Intl.DateTimeFormat("uk-UA", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(new Date());
}

function formatDate(timeZone) {
  return new Intl.DateTimeFormat("uk-UA", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date());
}

function getTimeZoneName(timeZone) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "short"
  }).formatToParts(new Date())
    .find(part => part.type === "timeZoneName")?.value || timeZone;
}

function getDateKey(timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());

  const values = {};

  for (const part of parts) {
    values[part.type] = part.value;
  }

  return Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day)
  );
}

function getDayDifference(timeZone) {
  const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  return Math.round(
    (getDateKey(timeZone) - getDateKey(localZone)) / 86400000
  );
}

function getDayDifferenceLabel(difference) {
  if (difference === 0) return "Той самий день";
  if (difference === 1) return "Завтра";
  if (difference === -1) return "Учора";

  return difference > 0
    ? `+${difference} дні`
    : `${difference} дні`;
}

function getMinutesOfDay(timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(new Date());

  const hour = Number(parts.find(part => part.type === "hour")?.value || 0);
  const minute = Number(parts.find(part => part.type === "minute")?.value || 0);

  return hour * 60 + minute;
}

function matchesSearch(location, query) {
  if (!query) return true;

  const searchableText = [
    getCity(location),
    getRegion(location),
    getCountry(location),
    getTimeZone(location)
  ].join(" ").toLocaleLowerCase("uk-UA");

  return searchableText.includes(query);
}

function getVisibleLocations() {
  const query = elements.searchInput.value
    .trim()
    .toLocaleLowerCase("uk-UA");

  const result = state.ids
    .map(getLocation)
    .filter(Boolean)
    .filter(location => matchesSearch(location, query));

  switch (state.sort) {
    case "city-asc":
      result.sort((a, b) => getCity(a).localeCompare(getCity(b), "uk"));
      break;

    case "city-desc":
      result.sort((a, b) => getCity(b).localeCompare(getCity(a), "uk"));
      break;

    case "region-asc":
      result.sort((a, b) => getRegion(a).localeCompare(getRegion(b), "uk"));
      break;

    case "region-desc":
      result.sort((a, b) => getRegion(b).localeCompare(getRegion(a), "uk"));
      break;

    case "time-asc":
      result.sort((a, b) =>
        getMinutesOfDay(getTimeZone(a)) - getMinutesOfDay(getTimeZone(b))
      );
      break;

    case "time-desc":
      result.sort((a, b) =>
        getMinutesOfDay(getTimeZone(b)) - getMinutesOfDay(getTimeZone(a))
      );
      break;

    default:
      break;
  }

  return result;
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);

  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;

  return element;
}

function createLocationCard(location) {
  const card = createElement("article", "location-card");
  card.dataset.id = location.id;

  const top = createElement("div", "card-top");
  const identity = createElement("div", "location-identity");

  const flag = createElement("span", "location-flag", getFlag(location));
  flag.setAttribute("aria-hidden", "true");

  const names = createElement("div", "location-names");

  const city = getCity(location);
  const region = getRegion(location);
  const country = getCountry(location);

  const primary = state.primaryName === "city" ? city : region || city;

  const secondary = state.primaryName === "city"
    ? [region, country].filter(Boolean).join(", ")
    : [city, country].filter(Boolean).join(", ");

  names.append(
    createElement("strong", "location-primary", primary),
    createElement("span", "location-secondary", secondary)
  );

  identity.append(flag, names);

  const actions = createElement("div", "card-actions");

  const dragButton = createElement("button", "card-action drag-handle", "⠿");
  dragButton.type = "button";
  dragButton.title = "Перетягни, щоб змінити порядок";
  dragButton.setAttribute("aria-label", "Перемістити місто");
  dragButton.draggable = true;

  const removeButton = createElement("button", "card-action", "×");
  removeButton.type = "button";
  removeButton.title = "Видалити місто";
  removeButton.setAttribute("aria-label", `Видалити ${city}`);

  removeButton.addEventListener("click", () => removeLocation(location.id));

  actions.append(dragButton, removeButton);
  top.append(identity, actions);

  const clock = createElement(
    "strong",
    "location-clock",
    formatTime(getTimeZone(location))
  );
  clock.dataset.timeZone = getTimeZone(location);

  const date = createElement(
    "span",
    "location-date",
    formatDate(getTimeZone(location))
  );
  date.dataset.dateTimeZone = getTimeZone(location);

  const footer = createElement("div", "location-footer");

  const zone = createElement(
    "span",
    "time-zone-label",
    getTimeZoneName(getTimeZone(location))
  );

  const dayLabel = createElement(
    "span",
    "day-difference",
    getDayDifferenceLabel(getDayDifference(getTimeZone(location)))
  );

  footer.append(zone, dayLabel);
  card.append(top, clock, date, footer);

  dragButton.addEventListener("dragstart", event => {
    if (state.sort !== "manual" || elements.searchInput.value.trim()) {
      event.preventDefault();
      showStatus("Для перетягування вибери «Мій порядок» та очисти пошук.");
      return;
    }

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", location.id);
    card.classList.add("dragging");
  });

  card.addEventListener("dragover", event => {
    if (state.sort !== "manual" || elements.searchInput.value.trim()) return;

    event.preventDefault();
    card.classList.add("drag-over");
  });

  card.addEventListener("dragleave", () => {
    card.classList.remove("drag-over");
  });

  card.addEventListener("drop", event => {
    if (state.sort !== "manual" || elements.searchInput.value.trim()) return;

    event.preventDefault();

    const draggedId = event.dataTransfer.getData("text/plain");

    card.classList.remove("drag-over");
    moveLocation(draggedId, location.id);
  });

  card.addEventListener("dragend", () => {
    card.classList.remove("dragging");

    document.querySelectorAll(".location-card").forEach(item => {
      item.classList.remove("drag-over");
    });
  });

  return card;
}

function renderLocations() {
  const visibleLocations = getVisibleLocations();

  elements.locationsList.replaceChildren();
  elements.locationsList.classList.toggle("list-view", state.view === "list");

  for (const location of visibleLocations) {
    elements.locationsList.appendChild(createLocationCard(location));
  }

  elements.locationCount.textContent = String(visibleLocations.length);
  elements.emptyState.hidden = visibleLocations.length > 0;
  elements.clearSearch.hidden = !elements.searchInput.value;

  document.querySelectorAll(".view-button").forEach(button => {
    const active = button.dataset.view === state.view;

    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function updateClocks() {
  const now = new Date();

  elements.localClock.textContent = new Intl.DateTimeFormat("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(now);

  elements.localDate.textContent = new Intl.DateTimeFormat("uk-UA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(now);

  document.querySelectorAll("[data-time-zone]").forEach(element => {
    element.textContent = formatTime(element.dataset.timeZone);
  });

  document.querySelectorAll("[data-date-time-zone]").forEach(element => {
    element.textContent = formatDate(element.dataset.dateTimeZone);
  });
}

function addLocation(id) {
  if (!locations.some(location => location.id === id)) return;

  if (state.ids.includes(id)) {
    showStatus("Це місто вже є у твоєму списку.");
    return;
  }

  state.ids.push(id);

  saveSettings();
  renderLocations();
  renderCatalog();

  showStatus("Місто додано.");
}

function removeLocation(id) {
  const location = getLocation(id);

  state.ids = state.ids.filter(savedId => savedId !== id);

  saveSettings();
  renderLocations();
  renderCatalog();

  showStatus(`${getCity(location)} видалено зі списку.`);
}

function moveLocation(draggedId, targetId) {
  if (!draggedId || draggedId === targetId) return;

  const fromIndex = state.ids.indexOf(draggedId);
  const toIndex = state.ids.indexOf(targetId);

  if (fromIndex < 0 || toIndex < 0) return;

  const [moved] = state.ids.splice(fromIndex, 1);
  state.ids.splice(toIndex, 0, moved);

  saveSettings();
  renderLocations();
}

function resetOrder() {
  state.sort = "manual";
  state.ids = [...defaultIds];

  elements.sortSelect.value = "manual";

  saveSettings();
  renderLocations();

  showStatus("Початковий порядок відновлено.");
}

function resetFilters() {
  elements.searchInput.value = "";
  elements.sortSelect.value = "manual";
  elements.primaryNameSelect.value = "city";

  state.sort = "manual";
  state.primaryName = "city";

  saveSettings();
  renderLocations();

  showStatus("Налаштування відображення скинуто.");
}

function applyTheme() {
  document.body.classList.toggle("dark-theme", state.theme === "dark");

  elements.themeToggle.textContent = state.theme === "dark" ? "☾" : "☼";

  elements.themeToggle.setAttribute(
    "aria-label",
    state.theme === "dark" ? "Увімкнути світлу тему" : "Увімкнути темну тему"
  );
}

function openCatalog() {
  elements.catalogSearch.value = "";
  renderCatalog();

  if (!elements.locationDialog.open) {
    elements.locationDialog.showModal();
  }

  elements.catalogSearch.focus();
}

function closeCatalog() {
  if (elements.locationDialog.open) {
    elements.locationDialog.close();
  }
}

function renderCatalog() {
  const query = elements.catalogSearch.value
    .trim()
    .toLocaleLowerCase("uk-UA");

  const filtered = locations.filter(location => {
    const text = [
      getCity(location),
      getRegion(location),
      getCountry(location)
    ].join(" ").toLocaleLowerCase("uk-UA");

    return text.includes(query);
  });

  elements.catalogList.replaceChildren();
  elements.catalogCount.textContent = `${filtered.length} міст`;

  if (filtered.length === 0) {
    elements.catalogList.appendChild(
      createElement("div", "catalog-empty", "Нічого не знайдено.")
    );
    return;
  }

  const sorted = [...filtered].sort((a, b) => {
    const regionCompare = getRegion(a).localeCompare(getRegion(b), "uk");
    return regionCompare || getCity(a).localeCompare(getCity(b), "uk");
  });

  let previousRegion = "";

  for (const location of sorted) {
    const region = getRegion(location);

    if (region !== previousRegion) {
      elements.catalogList.appendChild(
        createElement(
          "div",
          "catalog-region-heading",
          region || getCountry(location)
        )
      );

      previousRegion = region;
    }

    const item = createElement("button", "catalog-item");
    item.type = "button";

    const flag = createElement("span", "catalog-item-flag", getFlag(location));
    const info = createElement("span", "catalog-item-info");

    info.append(
      createElement("strong", "", getCity(location)),
      createElement(
        "small",
        "",
        [getRegion(location), getCountry(location)].filter(Boolean).join(", ")
      )
    );

    const alreadyAdded = state.ids.includes(location.id);

    const status = createElement(
      "span",
      "catalog-item-status",
      alreadyAdded ? "Додано ✓" : "+ Додати"
    );

    item.disabled = alreadyAdded;
    item.append(flag, info, status);

    item.addEventListener("click", () => addLocation(location.id));

    elements.catalogList.appendChild(item);
  }
}

/* Пошук */

elements.searchInput.addEventListener("input", renderLocations);

elements.clearSearch.addEventListener("click", () => {
  elements.searchInput.value = "";
  renderLocations();
  elements.searchInput.focus();
});

/* Сортування */

elements.sortSelect.value = state.sort;

elements.sortSelect.addEventListener("change", () => {
  state.sort = elements.sortSelect.value;
  saveSettings();
  renderLocations();
});

/* Основна назва */

elements.primaryNameSelect.value = state.primaryName;

elements.primaryNameSelect.addEventListener("change", () => {
  state.primaryName = elements.primaryNameSelect.value;
  saveSettings();
  renderLocations();
});

/* Кнопки скидання */

elements.resetFiltersButton.addEventListener("click", resetFilters);
elements.resetOrderButton.addEventListener("click", resetOrder);

/* Перемикання вигляду */

document.querySelectorAll(".view-button").forEach(button => {
  button.addEventListener("click", () => {
    state.view = button.dataset.view;

    saveSettings();
    renderLocations();
  });
});

/* Тема */

elements.themeToggle.addEventListener("click", () => {
  state.theme = state.theme === "light" ? "dark" : "light";

  applyTheme();
  saveSettings();
});

/* Каталог міст */

elements.addLocationButton.addEventListener("click", openCatalog);
elements.emptyAddButton.addEventListener("click", openCatalog);
elements.closeDialogButton.addEventListener("click", closeCatalog);
elements.catalogSearch.addEventListener("input", renderCatalog);

elements.locationDialog.addEventListener("click", event => {
  if (event.target === elements.locationDialog) {
    closeCatalog();
  }
});

/* Запуск */

function init() {
  if (!locations.length) {
    showStatus("Не вдалося завантажити міста. Перевір locations.js.");
    return;
  }

  applyTheme();
  renderLocations();
  updateClocks();

  window.setInterval(updateClocks, 1000);
}

init();
