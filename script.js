// build: v5 (index.html + style.css + script.js + locations.js мають бути з однієї версії)
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
  statusMessage: document.getElementById("statusMessage"),
  langToggle: document.getElementById("langToggle"),
  timeToggle: document.getElementById("timeToggle"),
  filtersToggle: document.getElementById("filtersToggle"),
  filtersPanel: document.getElementById("filtersPanel"),
  dateFormatSelect: document.getElementById("dateFormatSelect"),
  templateButton: document.getElementById("templateButton"),
  templateDialog: document.getElementById("templateDialog"),
  templateText: document.getElementById("templateText"),
  templateCopy: document.getElementById("templateCopy"),
  templateApply: document.getElementById("templateApply"),
  templateClose: document.getElementById("templateClose"),
  templateStatus: document.getElementById("templateStatus")
};

const missingElements = Object.entries(elements).filter(([, element]) => !element).map(([name]) => name);

if (missingElements.length) {
  const message = "Файли з різних версій: у index.html немає елементів (" + missingElements.join(", ") + "). Заміни всі 4 файли разом і натисни Ctrl+F5.";
  const banner = document.createElement("div");
  banner.textContent = message;
  banner.style.cssText = "padding:14px 18px;background:#fff3cd;color:#664d03;font:14px sans-serif";
  document.body.prepend(banner);
  throw new Error(message);
}

const COUNTRY_ALIASES = {
  USA: "США Сполучені Штати Америки United States",
  Canada: "Канада"
};

const DEFAULT_CITIES = ["New York", "Chicago", "Denver", "Los Angeles", "Toronto", "Vancouver", "Anchorage", "Honolulu"];

const defaultIds = DEFAULT_CITIES
  .map(city => locations.find(location => location.city === city)?.id)
  .filter(Boolean);

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
    ? [...new Set(savedSettings.ids)].filter(id => locations.some(location => location.id === id))
    : [...defaultIds],

  view: savedSettings?.view === "list" ? "list" : "cards",
  theme: savedSettings?.theme
    ? (savedSettings.theme === "dark" ? "dark" : "light")
    : (window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light"),
  primaryName: savedSettings?.primaryName === "region" ? "region" : "city",
  dateFormat: ["regional", "mdy", "dmy"].includes(savedSettings?.dateFormat) ? savedSettings.dateFormat : "regional",
  lang: savedSettings?.lang === "en" ? "en" : "uk",
  hour12: savedSettings?.hour12 === "12" ? "12" : "24",

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

const EN = {
  "North America Time Tracker — головна": "North America Time Tracker — home",
  "Змінити тему": "Change theme",
  "Фільтри": "Filters",
  "Увімкнути світлу тему": "Switch to light theme",
  "Увімкнути темну тему": "Switch to dark theme",
  "Час у": "Time in",
  "Північній Америці.": "North America.",
  "Усі важливі часові пояси в одному місці. Зручно, швидко та завжди актуально.": "All the key time zones in one place. Convenient, fast and always up to date.",
  "ТВІЙ МІСЦЕВИЙ ЧАС": "YOUR LOCAL TIME",
  "Знайти місто, штат або країну...": "Search city, state or country...",
  "Пошук локацій": "Search locations",
  "Очистити пошук": "Clear search",
  "Вигляд локацій": "Location view",
  "Картки": "Cards",
  "Список": "List",
  "Додати місто": "Add city",
  "⇄ Шаблон": "⇄ Template",
  "ВІДОБРАЖЕННЯ НАЗВИ": "NAME DISPLAY",
  "Місто першим": "City first",
  "Штат / регіон першим": "State / region first",
  "СОРТУВАННЯ": "SORT",
  "Мій порядок": "My order",
  "Місто: A–Z": "City: A–Z",
  "Місто: Z–A": "City: Z–A",
  "Штат / регіон: A–Z": "State / region: A–Z",
  "Штат / регіон: Z–A": "State / region: Z–A",
  "Місцевий час: раніше → пізніше": "Local time: earlier → later",
  "Місцевий час: пізніше → раніше": "Local time: later → earlier",
  "ФОРМАТ ДАТИ": "DATE FORMAT",
  "Як у штаті / країні": "As in the state / country",
  "ММ/ДД/РРРР": "MM/DD/YYYY",
  "ДД/ММ/РРРР": "DD/MM/YYYY",
  "ФОРМАТ ЧАСУ": "TIME FORMAT",
  "24 години": "24-hour",
  "12 годин (AM/PM)": "12-hour (AM/PM)",
  "Скинути": "Reset",
  "Мої локації": "My locations",
  "Час оновлюється автоматично": "Time updates automatically",
  "↺ Початковий список": "↺ Default list",
  "Тут поки порожньо": "Nothing here yet",
  "Додай міста, щоб стежити за часом у різних куточках Північної Америки.": "Add cities to follow the time across North America.",
  "＋ Додати перше місто": "＋ Add your first city",
  "Нічого не знайдено": "Nothing found",
  "Спробуй змінити пошуковий запит.": "Try changing your search.",
  "Автоматичне оновлення · Урахування літнього часу": "Auto-updating · Daylight saving time included",
  "Додати локації": "Add locations",
  "Знайди потрібне місто та додай його до свого списку.": "Find a city and add it to your list.",
  "Закрити": "Close",
  "Пошук міста або регіону...": "Search city or region...",
  "Північна Америка": "North America",
  "Шаблон налаштувань": "Settings template",
  "Скопіюй код і встав його на іншому ноутбуці: відкриються ті самі міста, порядок, вигляд і формат дати.": "Copy the code and paste it on another laptop to get the same cities, order, view and date format.",
  "Копіювати": "Copy",
  "Застосувати вставлений код": "Apply pasted code",
  "Для перетягування вибери «Мій порядок» та очисти пошук.": "To drag, choose “My order” and clear the search.",
  "Перетягни, щоб змінити порядок": "Drag to reorder",
  "Перемістити місто": "Move city",
  "Видалити місто": "Remove city",
  "Це місто вже є у твоєму списку.": "This city is already in your list.",
  "Місто додано.": "City added.",
  "Початковий список відновлено.": "Default list restored.",
  "Налаштування відображення скинуто.": "Display settings reset.",
  "Не вдалося зберегти налаштування браузера.": "Could not save browser settings.",
  "Нічого не знайдено.": "Nothing found.",
  "Додано ✓": "Added ✓",
  "+ Додати": "+ Add",
  "Завтра": "Tomorrow",
  "Учора": "Yesterday",
  "Код скопійовано.": "Code copied.",
  "Натисни Ctrl+C (⌘C), щоб скопіювати.": "Press Ctrl+C (⌘C) to copy.",
  "Шаблон застосовано.": "Template applied.",
  "Некоректний код шаблону.": "Invalid template code."
};

const t = text => (state.lang === "en" ? (EN[text] ?? text) : text);

const dateLocale = () => (state.lang === "en" ? "en-US" : "uk-UA");
const timeLocale = () => (state.hour12 === "12" ? "en-US" : state.lang === "en" ? "en-GB" : "uk-UA");

function timeOptions(timeZone) {
  const is12 = state.hour12 === "12";
  const options = {
    hour: is12 ? "numeric" : "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: is12 ? "h12" : "h23"
  };

  if (timeZone) options.timeZone = timeZone;
  return options;
}

const originalTexts = new WeakMap();

function translateDom() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: node => node.parentElement.closest(
      "script,style,#locationsList,#catalogList,#statusMessage,#localClock,#localDate,#templateStatus"
    ) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
  });

  for (let node; (node = walker.nextNode());) {
    const raw = originalTexts.has(node) ? originalTexts.get(node) : node.nodeValue;
    const key = raw.replace(/\s+/g, " ").trim();

    if (!key || !(key in EN)) continue;

    originalTexts.set(node, raw);
    node.nodeValue = state.lang === "en" ? raw.replace(/\S[\s\S]*\S|\S/, () => EN[key]) : raw;
  }

  document.querySelectorAll("[placeholder],[aria-label],[title]").forEach(element => {
    if (element.id === "themeToggle" || element.closest("#locationsList")) return;

    element._orig = element._orig || {};

    for (const attr of ["placeholder", "aria-label", "title"]) {
      if (!element.hasAttribute(attr)) continue;
      if (!(attr in element._orig)) element._orig[attr] = element.getAttribute(attr);
      element.setAttribute(attr, t(element._orig[attr]));
    }
  });
}

function updateToggles() {
  const en = state.lang === "en";
  const is12 = state.hour12 === "12";

  elements.langToggle.textContent = en ? "EN" : "UA";
  elements.langToggle.title = en ? "Language: English (click for Ukrainian)" : "Мова: українська (натисни для English)";
  elements.langToggle.setAttribute("aria-label", elements.langToggle.title);

  elements.timeToggle.textContent = is12 ? "12H" : "24H";
  elements.timeToggle.title = en
    ? (is12 ? "Time format: 12-hour AM/PM (click for 24-hour)" : "Time format: 24-hour (click for 12-hour AM/PM)")
    : (is12 ? "Формат часу: 12 год, AM/PM (натисни для 24 год)" : "Формат часу: 24 год (натисни для 12 год, AM/PM)");
  elements.timeToggle.setAttribute("aria-label", elements.timeToggle.title);
}

function applyLanguage() {
  document.documentElement.lang = state.lang;
  translateDom();
  applyTheme();
  updateToggles();
}

function saveSettings() {
  const settings = {
    ids: state.ids,
    view: state.view,
    theme: state.theme,
    primaryName: state.primaryName,
    sort: state.sort,
    dateFormat: state.dateFormat,
    lang: state.lang,
    hour12: state.hour12
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
  elements.statusMessage.textContent = t(message);

  if (message) {
    window.clearTimeout(showStatus.timeout);
    showStatus.timeout = window.setTimeout(() => {
      elements.statusMessage.textContent = "";
    }, 3000);
  }
}

function formatTime(timeZone) {
  return new Intl.DateTimeFormat(timeLocale(), timeOptions(timeZone)).format(new Date());
}

function formatDate(timeZone, country) {
  const now = new Date();

  // regional: США — ММ/ДД/РРРР, Канада — РРРР-ММ-ДД (офіційний формат)
  const locale = state.dateFormat === "mdy" ? "en-US"
    : state.dateFormat === "dmy" ? "en-GB"
    : country === "Canada" ? "en-CA" : "en-US";

  const weekday = new Intl.DateTimeFormat(dateLocale(), { timeZone, weekday: "long" }).format(now);

  const numeric = new Intl.DateTimeFormat(locale, {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(now);

  return `${weekday}, ${numeric}`;
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
  if (difference === 0) return "";
  if (difference === 1) return t("Завтра");
  if (difference === -1) return t("Учора");

  const label = state.lang === "en" ? "days" : "дн.";
  return `${difference > 0 ? "+" : ""}${difference} ${label}`;
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
    COUNTRY_ALIASES[getCountry(location)] || ""
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
  dragButton.title = t("Перетягни, щоб змінити порядок");
  dragButton.setAttribute("aria-label", t("Перемістити місто"));
  dragButton.draggable = true;

  const removeButton = createElement("button", "card-action", "×");
  removeButton.type = "button";
  removeButton.title = t("Видалити місто");
  removeButton.setAttribute("aria-label", `${t("Видалити місто")}: ${city}`);

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
    formatDate(getTimeZone(location), getCountry(location))
  );
  date.dataset.dateTimeZone = getTimeZone(location);
  date.dataset.dateCountry = getCountry(location);

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

  zone.dataset.zoneName = getTimeZone(location);
  dayLabel.dataset.dayZone = getTimeZone(location);
  dayLabel.hidden = !dayLabel.textContent;

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
    event.dataTransfer.setDragImage(card, 20, 20);
    card.classList.add("dragging");
  });

  card.addEventListener("dragover", event => {
    if (state.sort !== "manual" || elements.searchInput.value.trim()) return;

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
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

  const hasQuery = Boolean(elements.searchInput.value.trim());
  elements.emptyState.querySelector("h3").textContent = t(hasQuery ? "Нічого не знайдено" : "Тут поки порожньо");
  elements.emptyState.querySelector("p").textContent = hasQuery
    ? t("Спробуй змінити пошуковий запит.")
    : t("Додай міста, щоб стежити за часом у різних куточках Північної Америки.");
  elements.emptyAddButton.hidden = hasQuery;
  elements.clearSearch.hidden = !elements.searchInput.value;

  document.querySelectorAll(".view-button").forEach(button => {
    const active = button.dataset.view === state.view;

    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

let lastMinuteKey = Math.floor(Date.now() / 60000);

function updateClocks() {
  const now = new Date();

  elements.localClock.textContent = new Intl.DateTimeFormat(timeLocale(), timeOptions()).format(now);

  elements.localDate.textContent = new Intl.DateTimeFormat(dateLocale(), {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(now);

  document.querySelectorAll("[data-time-zone]").forEach(element => {
    element.textContent = formatTime(element.dataset.timeZone);
  });

  document.querySelectorAll("[data-date-time-zone]").forEach(element => {
    element.textContent = formatDate(element.dataset.dateTimeZone, element.dataset.dateCountry);
  });

  document.querySelectorAll("[data-day-zone]").forEach(element => {
    element.textContent = getDayDifferenceLabel(getDayDifference(element.dataset.dayZone));
    element.hidden = !element.textContent;
  });

  document.querySelectorAll("[data-zone-name]").forEach(element => {
    element.textContent = getTimeZoneName(element.dataset.zoneName);
  });

  const minuteKey = Math.floor(now.getTime() / 60000);

  if (minuteKey !== lastMinuteKey) {
    lastMinuteKey = minuteKey;

    if (state.sort.startsWith("time") && !document.querySelector(".location-card.dragging")) {
      renderLocations();
    }
  }
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

  showStatus(state.lang === "en" ? `${getCity(location)} removed.` : `${getCity(location)} видалено зі списку.`);
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

  showStatus("Початковий список відновлено.");
}

function resetFilters() {
  elements.searchInput.value = "";
  elements.sortSelect.value = "manual";
  elements.primaryNameSelect.value = "city";

  state.sort = "manual";
  state.primaryName = "city";
  state.dateFormat = "regional";
  elements.dateFormatSelect.value = "regional";

  saveSettings();
  renderLocations();

  showStatus("Налаштування відображення скинуто.");
}

function applyTheme() {
  document.body.classList.toggle("dark-theme", state.theme === "dark");

  elements.themeToggle.textContent = state.theme === "dark" ? "☾" : "☼";

  elements.themeToggle.setAttribute(
    "aria-label",
    t(state.theme === "dark" ? "Увімкнути світлу тему" : "Увімкнути темну тему")
  );
}

function openCatalog() {
  elements.catalogSearch.value = "";
  renderCatalog();

  if (!elements.locationDialog.open) {
    elements.locationDialog.showModal();
  }

  elements.catalogList.scrollTop = 0;
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
      getCountry(location),
      COUNTRY_ALIASES[getCountry(location)] || ""
    ].join(" ").toLocaleLowerCase("uk-UA");

    return text.includes(query);
  });

  const scrollTop = elements.catalogList.scrollTop;

  elements.catalogList.replaceChildren();
  elements.catalogCount.textContent = `${filtered.length} ${state.lang === "en" ? "cities" : "міст"}`;

  if (filtered.length === 0) {
    elements.catalogList.appendChild(
      createElement("div", "catalog-empty", t("Нічого не знайдено."))
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
      t(alreadyAdded ? "Додано ✓" : "+ Додати")
    );

    item.disabled = alreadyAdded;
    item.append(flag, info, status);

    item.addEventListener("click", () => addLocation(location.id));

    elements.catalogList.appendChild(item);
  }

  elements.catalogList.scrollTop = scrollTop;
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
elements.catalogSearch.addEventListener("input", () => {
  renderCatalog();
  elements.catalogList.scrollTop = 0;
});

elements.locationDialog.addEventListener("click", event => {
  const rect = elements.locationDialog.getBoundingClientRect();
  const outside =
    event.clientX < rect.left || event.clientX > rect.right ||
    event.clientY < rect.top || event.clientY > rect.bottom;

  if (event.target === elements.locationDialog && outside) {
    closeCatalog();
  }
});

/* Формат дати */

elements.dateFormatSelect.value = state.dateFormat;

elements.dateFormatSelect.addEventListener("change", () => {
  state.dateFormat = elements.dateFormatSelect.value;
  saveSettings();
  renderLocations();
});

/* Мова, формат часу, фільтри */

elements.langToggle.addEventListener("click", () => {
  state.lang = state.lang === "en" ? "uk" : "en";
  saveSettings();
  applyLanguage();
  renderLocations();
  renderCatalog();
  updateClocks();
});

elements.timeToggle.addEventListener("click", () => {
  state.hour12 = state.hour12 === "12" ? "24" : "12";
  saveSettings();
  updateToggles();
  updateClocks();
});

function setFiltersOpen(open) {
  elements.filtersPanel.hidden = !open;
  elements.filtersToggle.setAttribute("aria-expanded", String(open));
}

elements.filtersToggle.addEventListener("click", () => {
  setFiltersOpen(elements.filtersPanel.hidden);
});

document.addEventListener("click", event => {
  if (!elements.filtersPanel.hidden && !event.target.closest("#filtersPanel, #filtersToggle")) {
    setFiltersOpen(false);
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !elements.filtersPanel.hidden) {
    setFiltersOpen(false);
    elements.filtersToggle.focus();
  }
});

/* Шаблон налаштувань */

const TEMPLATE_PREFIX = "NATT1:";

function encodeTemplate() {
  return TEMPLATE_PREFIX + btoa(JSON.stringify({
    ids: state.ids,
    view: state.view,
    theme: state.theme,
    primaryName: state.primaryName,
    sort: state.sort,
    dateFormat: state.dateFormat,
    lang: state.lang,
    hour12: state.hour12
  }));
}

function applyTemplate(code) {
  try {
    const text = code.trim();
    if (!text.startsWith(TEMPLATE_PREFIX)) return false;

    const data = JSON.parse(atob(text.slice(TEMPLATE_PREFIX.length)));
    if (!data || !Array.isArray(data.ids)) return false;

    const allowed = select => [...select.options].map(option => option.value);

    state.ids = [...new Set(data.ids)].filter(id => locations.some(location => location.id === id));
    state.view = data.view === "list" ? "list" : "cards";
    state.theme = data.theme === "dark" ? "dark" : "light";
    state.primaryName = data.primaryName === "region" ? "region" : "city";
    state.sort = allowed(elements.sortSelect).includes(data.sort) ? data.sort : "manual";
    state.dateFormat = allowed(elements.dateFormatSelect).includes(data.dateFormat) ? data.dateFormat : "regional";

    state.lang = data.lang === "en" ? "en" : "uk";
    state.hour12 = data.hour12 === "12" ? "12" : "24";

    elements.sortSelect.value = state.sort;
    elements.primaryNameSelect.value = state.primaryName;
    elements.dateFormatSelect.value = state.dateFormat;

    applyLanguage();
    saveSettings();
    renderLocations();
    renderCatalog();
    updateClocks();
    return true;
  } catch (error) {
    return false;
  }
}

elements.templateButton.addEventListener("click", () => {
  elements.templateText.value = encodeTemplate();
  elements.templateStatus.textContent = "";
  elements.templateDialog.showModal();
  elements.templateText.select();
});

elements.templateClose.addEventListener("click", () => elements.templateDialog.close());

elements.templateCopy.addEventListener("click", async () => {
  elements.templateText.value = encodeTemplate();
  elements.templateText.select();

  try {
    await navigator.clipboard.writeText(elements.templateText.value);
    elements.templateStatus.textContent = t("Код скопійовано.");
  } catch (error) {
    elements.templateStatus.textContent = document.execCommand("copy")
      ? t("Код скопійовано.")
      : t("Натисни Ctrl+C (⌘C), щоб скопіювати.");
  }
});

elements.templateApply.addEventListener("click", () => {
  const ok = applyTemplate(elements.templateText.value);

  elements.templateStatus.textContent = ok
    ? t("Шаблон застосовано.")
    : t("Некоректний код шаблону.");
});

/* Запуск */

function init() {
  if (!locations.length) {
    showStatus("Не вдалося завантажити міста. Перевір locations.js.");
    return;
  }

  applyLanguage();
  renderLocations();
  updateClocks();

  const tick = () => {
    updateClocks();
    window.setTimeout(tick, 1000 - (Date.now() % 1000) + 5);
  };

  window.setTimeout(tick, 1000 - (Date.now() % 1000) + 5);
}

init();
