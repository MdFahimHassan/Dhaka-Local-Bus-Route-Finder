"use strict";

// ---------- State ----------
const HISTORY_KEY = "dhakaBus.history";
const LANG_KEY = "dhakaBus.lang";
const MAX_HISTORY = 20;
const DEFAULT_IMG = "assets/buses/default.webp";

let buses = [];
let allStops = [];
let history = loadJSON(HISTORY_KEY, []);
let currentLang = localStorage.getItem(LANG_KEY) === "bn" ? "bn" : "en";

function loadJSON(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return Array.isArray(v) ? v : fallback;
  } catch { return fallback; }
}
function saveHistory() {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch { /* storage full/blocked */ }
}

// ---------- Translations ----------
const langData = {
  en: {
    title: "🚍 Dhaka Local Bus Route Finder",
    history: "History", clear: "Clear All",
    start: "Start location", end: "Destination", search: "Search",
    noResult: "No buses found for this route.",
    pickStops: "Please choose a start and a destination.",
    unknownStop: "Stop not found:",
    service: "Service", time: "Time", route: "Full Route:",
    langBtn: "বাংলা", regular: "Regular Service", na: "N/A", unknownBus: "Unknown"
  },
  bn: {
    title: "🚍 ঢাকা লোকাল বাস রুট খুঁজুন",
    history: "ইতিহাস", clear: "মুছে ফেলুন",
    start: "শুরুর স্থান", end: "গন্তব্য", search: "অনুসন্ধান",
    noResult: "এই রুটে কোনো বাস পাওয়া যায়নি।",
    pickStops: "অনুগ্রহ করে শুরুর স্থান ও গন্তব্য বেছে নিন।",
    unknownStop: "স্টপ পাওয়া যায়নি:",
    service: "সেবা", time: "সময়", route: "সম্পূর্ণ রুট:",
    langBtn: "English", regular: "নিয়মিত সার্ভিস", na: "প্রযোজ্য নয়", unknownBus: "অজানা"
  }
};
const t = k => langData[currentLang][k];

// Add more stop translations as needed (key must match the stop name in buses.json).
const stopTranslations = {
  "Gabtoli": "গাবতলী", "Technical": "টেকনিক্যাল", "Ansar Camp": "আনসার ক্যাম্প",
  "Mirpur 1": "মিরপুর ১", "Sony Cinema Hall": "সনি সিনেমা হল", "Mirpur 2": "মিরপুর ২",
  "Mirpur 10": "মিরপুর ১০", "Mirpur 11": "মিরপুর ১১", "Purobi": "পুরবী", "Kalshi": "কালশী",
  "ECB Square": "ইসিবি স্কয়ার", "MES": "এমইএস", "Shewra": "শেওড়া",
  "Kuril Bishwa Road": "কুরিল বিশ্বরোড", "Jamuna Future Park": "যমুনা ফিউচার পার্ক",
  "Bashundhara": "বসুন্ধরা", "Nadda": "নাড্ডা", "Notun Bazar": "নতুন বাজার",
  "Bashtola": "বাসতলা", "Shahjadpur": "শাহজাদপুর", "Uttar Badda": "উত্তর বাড্ডা",
  "Badda": "বাড্ডা", "Madhya Badda": "মধ্য বাড্ডা", "Merul": "মেরুল",
  "Rampura Bridge": "রামপুরা ব্রিজ", "Banasree": "বনশ্রী", "Demra Staff Quarter": "ডেমরা স্টাফ কোয়ার্টার"
};
const serviceTranslations = {
  "Semi-Sitting Service(Check System)": "সেমি-সিটিং সার্ভিস (চেক সিস্টেম)",
  "Sitting Service(Check System)": "সিটিং সার্ভিস (চেক সিস্টেম)",
  "Semi-Sitting Service": "সেমি-সিটিং সার্ভিস",
  "Sitting Service": "সিটিং সার্ভিস",
  "Regular Service": "নিয়মিত সার্ভিস",
  "Sitting Service(Ticket System)": "সিটিং সার্ভিস (টিকিট সিস্টেম)",
  "Half-Sitting Service": "হাফ-সিটিং সার্ভিস"
};
const translateStop = s => (currentLang === "bn" && stopTranslations[s]) || s || "";
const translateService = s =>
  currentLang === "bn" ? (serviceTranslations[s] || s || t("regular")) : (s || t("regular"));

// ---------- Helpers ----------
const $ = id => document.getElementById(id);
const norm = s => String(s || "").trim().replace(/\s+/g, " ").toLowerCase();

function imagePath(bus) {
  if (!bus.image) return DEFAULT_IMG;
  return /^https?:\/\//.test(bus.image) ? bus.image : `assets/buses/${encodeURIComponent(bus.image)}`;
}
function setImage(img, bus) {
  img.onerror = () => { img.onerror = null; img.src = DEFAULT_IMG; };
  img.src = imagePath(bus);
}
function busName(bus) {
  return currentLang === "bn" ? (bus.bangla || bus.english || t("unknownBus")) : (bus.english || bus.bangla || t("unknownBus"));
}

// Resolve whatever the user typed to a real stop name (case/space-insensitive,
// also accepts the Bangla name of a translated stop).
let stopLookup = new Map();
function buildStopLookup() {
  stopLookup = new Map();
  allStops.forEach(s => {
    stopLookup.set(norm(s), s);
    if (stopTranslations[s]) stopLookup.set(norm(stopTranslations[s]), s);
  });
}
const resolveStop = text => stopLookup.get(norm(text)) || null;

// ---------- Language ----------
function setLanguage(lang) {
  currentLang = lang;
  try { localStorage.setItem(LANG_KEY, lang); } catch { /* ignore */ }
  document.documentElement.lang = lang === "bn" ? "bn" : "en";
  $("mainTitle").textContent = t("title");
  $("historyTitle").textContent = t("history");
  $("clearHistoryBtn").textContent = t("clear");
  $("start").placeholder = t("start");
  $("end").placeholder = t("end");
  $("searchBtn").textContent = t("search");
  $("langToggle").textContent = t("langBtn");
  $("routeTitle").textContent = t("route");
  renderHistory();
  if ($("start").value.trim() && $("end").value.trim() && $("results").children.length) {
    searchBuses({ saveHistory: false });
  }
}

// ---------- Data ----------
async function loadBuses() {
  try {
    const res = await fetch("buses.json");
    if (!res.ok) throw new Error(`Failed to load buses.json (${res.status})`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("buses.json must be an array");
    buses = data;
  } catch (err) {
    console.error(err);
    $("results").innerHTML = "";
    const p = document.createElement("p");
    p.className = "text-red-300 text-center col-span-full";
    p.textContent = "Could not load bus data. If you opened this file directly, run a local server (see README).";
    $("results").appendChild(p);
    return;
  }
  allStops = [...new Set(buses.flatMap(b => Array.isArray(b.routes) ? b.routes : []))]
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base", numeric: true }));
  buildStopLookup();
  createAutocomplete($("start"));
  createAutocomplete($("end"));
}

// ---------- Autocomplete ----------
function suggestions(query) {
  const q = norm(query);
  if (!q) return [];
  const starts = [], contains = [];
  for (const s of allStops) {
    const names = [norm(s), norm(stopTranslations[s])];
    if (names.some(n => n.startsWith(q))) starts.push(s);
    else if (names.some(n => n.includes(q))) contains.push(s);
  }
  return [...starts, ...contains].slice(0, 30);
}

function createAutocomplete(inputEl) {
  const wrapper = inputEl.parentElement;
  const box = document.createElement("div");
  box.className = "absolute left-0 right-0 top-full mt-1 z-40 bg-gray-800 border border-gray-700 rounded-lg max-h-60 overflow-auto shadow-lg hidden";
  box.setAttribute("role", "listbox");
  wrapper.appendChild(box);

  let matches = [];
  let focused = -1;

  const close = () => { box.classList.add("hidden"); focused = -1; };
  const highlight = () => {
    [...box.children].forEach((c, i) => c.classList.toggle("bg-gray-700", i === focused));
    if (box.children[focused]) box.children[focused].scrollIntoView({ block: "nearest" });
  };
  const choose = i => {
    if (i < 0 || i >= matches.length) return;
    inputEl.value = translateStop(matches[i]);
    close();
  };
  const render = () => {
    box.replaceChildren();
    if (!matches.length) { close(); return; }
    matches.forEach((m, i) => {
      const item = document.createElement("div");
      item.className = "px-3 py-2 hover:bg-gray-700 cursor-pointer truncate text-sm";
      item.setAttribute("role", "option");
      item.textContent = translateStop(m);
      item.addEventListener("mousedown", e => { e.preventDefault(); choose(i); });
      box.appendChild(item);
    });
    focused = -1;
    box.classList.remove("hidden");
  };

  inputEl.addEventListener("input", () => { matches = suggestions(inputEl.value); render(); });
  inputEl.addEventListener("focus", () => { if (inputEl.value.trim()) { matches = suggestions(inputEl.value); render(); } });
  inputEl.addEventListener("keydown", e => {
    if (box.classList.contains("hidden")) return;
    if (e.key === "ArrowDown") { e.preventDefault(); focused = Math.min(focused + 1, matches.length - 1); highlight(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); focused = Math.max(focused - 1, 0); highlight(); }
    else if (e.key === "Enter" && focused >= 0) { e.preventDefault(); choose(focused); }
    else if (e.key === "Escape") close();
  });
  document.addEventListener("click", e => { if (!wrapper.contains(e.target)) close(); });
}

// ---------- Search ----------
function showMessage(text) {
  const p = document.createElement("p");
  p.className = "text-gray-300 text-center col-span-full";
  p.textContent = text;
  $("results").replaceChildren(p);
}

function searchBuses({ saveHistory: shouldSave = true } = {}) {
  const startRaw = $("start").value, endRaw = $("end").value;
  if (!startRaw.trim() || !endRaw.trim()) return showMessage(t("pickStops"));

  const start = resolveStop(startRaw), end = resolveStop(endRaw);
  if (!start) return showMessage(`${t("unknownStop")} ${startRaw.trim()}`);
  if (!end) return showMessage(`${t("unknownStop")} ${endRaw.trim()}`);

  const matches = buses.filter(b =>
    Array.isArray(b.routes) && b.routes.includes(start) && b.routes.includes(end));

  if (shouldSave) addToHistory(start, end);
  if (!matches.length) return showMessage(t("noResult"));

  const frag = document.createDocumentFragment();
  matches.forEach(bus => {
    const card = document.createElement("div");
    card.className = "bus-card bg-gray-900 p-4 rounded-lg shadow-md cursor-pointer";
    card.tabIndex = 0;
    card.setAttribute("role", "button");

    const img = document.createElement("img");
    img.className = "w-full h-40 object-cover rounded-md mb-2";
    img.loading = "lazy";
    img.alt = "";
    setImage(img, bus);

    const name = document.createElement("h3");
    name.className = "text-lg font-bold text-white";
    name.textContent = busName(bus);

    const svc = document.createElement("p");
    svc.className = "text-sm text-gray-400";
    svc.textContent = `${t("service")}: ${translateService(bus.service_type)}`;

    const time = document.createElement("p");
    time.className = "text-sm text-gray-400";
    time.textContent = `${t("time")}: ${bus.time || t("na")}`;

    card.append(img, name, svc, time);
    card.addEventListener("click", () => showDetails(bus));
    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); showDetails(bus); }
    });
    frag.appendChild(card);
  });
  $("results").replaceChildren(frag);
}

// ---------- History ----------
function addToHistory(start, end) {
  history = history.filter(h => !(h.start === start && h.end === end)); // move repeats to the top
  history.push({ start, end });
  if (history.length > MAX_HISTORY) history = history.slice(-MAX_HISTORY);
  saveHistory();
  renderHistory();
}

function renderHistory() {
  const list = $("historyList");
  list.replaceChildren();
  history.slice().reverse().forEach(item => {
    const li = document.createElement("li");
    li.className = "flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-700 cursor-pointer transition";
    const icon = document.createElement("span");
    icon.className = "text-teal-400";
    icon.textContent = "🕘";
    const label = document.createElement("span");
    label.className = "flex-1 truncate";
    label.textContent = `${translateStop(item.start)} → ${translateStop(item.end)}`; // textContent: no XSS
    li.append(icon, label);
    li.addEventListener("click", () => {
      $("start").value = translateStop(item.start);
      $("end").value = translateStop(item.end);
      searchBuses({ saveHistory: false });
    });
    list.appendChild(li);
  });
}

function clearHistory() {
  history = [];
  try { localStorage.removeItem(HISTORY_KEY); } catch { /* ignore */ }
  renderHistory();
}

// ---------- Modal ----------
function showDetails(bus) {
  setImage($("busImage"), bus);
  $("busImage").alt = busName(bus);
  $("busName").textContent = busName(bus);
  $("busBangla").textContent = currentLang === "en" ? (bus.bangla || "") : "";
  $("busService").textContent = `${t("service")}: ${translateService(bus.service_type)}`;
  $("busTime").textContent = `${t("time")}: ${bus.time || t("na")}`;
  $("busRoute").replaceChildren(...(Array.isArray(bus.routes) ? bus.routes : []).map(s => {
    const li = document.createElement("li");
    li.textContent = translateStop(s);
    return li;
  }));
  $("details").classList.remove("hidden");
  $("closeDetailsBtn").focus();
}
function closeDetails() { $("details").classList.add("hidden"); }

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", () => {
  $("searchForm").addEventListener("submit", e => { e.preventDefault(); searchBuses(); });
  $("langToggle").addEventListener("click", () => setLanguage(currentLang === "en" ? "bn" : "en"));
  $("clearHistoryBtn").addEventListener("click", clearHistory);
  $("closeDetailsBtn").addEventListener("click", closeDetails);
  $("details").addEventListener("click", e => { if (e.target === $("details")) closeDetails(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeDetails(); });
  setLanguage(currentLang);
  loadBuses();
});
