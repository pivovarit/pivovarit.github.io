let talksPromise = null;

async function getData({ forceReload = false } = {}) {
    if (!talksPromise || forceReload) {
        talksPromise = fetch("talks.json")
            .then((res) => {
                if (!res.ok) throw new Error(`Failed to load talks.json: ${res.status}`);
                return res.json();
            })
            .then((data) => ({
                events: normalizeTalks(data.events),
                locations: data.locations ?? {},
            }))
            .catch((err) => {
                talksPromise = null;
                throw err;
            });
    }
    return talksPromise;
}

function getSelectedYear() {
    const raw = new URLSearchParams(window.location.search).get("year");
    if (!raw) return null;
    const y = Number(raw);
    return !Number.isFinite(y) || !Number.isInteger(y) || y < 1970 || y > 2100 ? null : y;
}

function setSelectedYearInUrl(yearOrNull) {
    const url = new URL(window.location.href);
    if (yearOrNull == null) url.searchParams.delete("year");
    else url.searchParams.set("year", String(yearOrNull));
    history.pushState({}, "", url);
}

function today() {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function formatDateFromTs(ts) {
    if (!Number.isFinite(ts)) return "";
    const d = new Date(ts);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
}

function normalizeTalks(rawTalks) {
    return (rawTalks || [])
        .map((t) => {
            const _ts = Date.parse(String(t?.date ?? ""));
            if (!Number.isFinite(_ts)) return null;
            return { ...t, _ts, _year: new Date(_ts).getFullYear() };
        })
        .filter(Boolean);
}

function normalizeLocationId(id) {
    const s = id?.toString() ?? "";
    return s ? s.replace(/^@/, "") : null;
}

function safeHttpUrl(u) {
    if (!u) return null;
    try {
        const url = new URL(u, window.location.href);
        return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
    } catch {
        return null;
    }
}

function el(tag, { className, text, attrs } = {}) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = String(text);
    if (attrs) {
        for (const [k, v] of Object.entries(attrs)) {
            if (v != null) node.setAttribute(k, String(v));
        }
    }
    return node;
}

function makeHeaderRow(label, className = "") {
    const tr = el("tr", { className });
    const td = el("td", { text: label });
    td.colSpan = 5;
    td.style.background = "#fff";
    td.style.textAlign = "center";
    tr.appendChild(td);
    return tr;
}

function createInfoWindowContent(location, coords, talksAtLocation) {
    const root = el("div");
    root.style.maxWidth = "250px";

    root.appendChild(el("strong", { text: `${location?.place} in ${location.location.city}(${location.location.country})` ?? "" }));

    const lat = coords?.lat;
    const lng = coords?.lng;
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
        const coordLine = el("div", { text: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
        coordLine.style.opacity = "0.55";
        coordLine.style.fontSize = "0.85em";
        coordLine.style.marginTop = "2px";
        root.appendChild(coordLine);
    }

    const ul = el("ul");
    ul.style.paddingLeft = "18px";
    ul.style.margin = "8px 0 0 0";

    const sorted = talksAtLocation.slice().sort((a, b) => b._ts - a._ts);

    for (const t of sorted) {
        const li = el("li");
        li.style.margin = "6px 0";

        li.appendChild(el("strong", { text: t.talk ?? "" }));
        li.appendChild(document.createElement("br"));

        const conf = el("div", { text: t.conference ?? "" });
        conf.style.opacity = "0.85";
        li.appendChild(conf);

        const date = el("div", { text: formatDateFromTs(t._ts) });
        date.style.opacity = "0.6";
        date.style.fontSize = "0.9em";
        li.appendChild(date);

        ul.appendChild(li);
    }

    root.appendChild(ul);
    return root;
}

async function getAllYearsFromTalks() {
    const data = await getData();
    const years = new Set(data.events.map((t) => t._year));
    return Array.from(years).sort((a, b) => b - a);
}

async function buildYearPicker() {
    const select = document.getElementById("yearSelect");
    const years = await getAllYearsFromTalks();
    const selectedYear = getSelectedYear();

    select.textContent = "";

    const allOpt = el("option", { text: "All years", attrs: { value: "" } });
    select.appendChild(allOpt);

    for (const y of years) {
        select.appendChild(el("option", { text: String(y), attrs: { value: String(y) } }));
    }

    select.value = selectedYear == null ? "" : String(selectedYear);

    select.onchange = () => {
        const val = select.value;
        const newYear = val === "" ? null : Number(val);
        setSelectedYearInUrl(newYear);
        refreshUI();
    };
}

async function loadTalks() {
    const selectedYear = getSelectedYear();
    const data = await getData();

    let talks = data.events;

    if (selectedYear != null) {
        talks = talks.filter((t) => t._year === selectedYear);
    }

    talks.sort((a, b) => b._ts - a._ts);

    const tbody = document.getElementById("talks");
    tbody.textContent = "";

    let seqFromBottom = talks.length;

    const todayTs = today().getTime();
    const includeUpcomingPast = selectedYear == null;

    let insertedUpcoming = false;
    let insertedPast = false;
    let currentYear = null;

    for (const t of talks) {
        const y = t._year;

        if (y !== currentYear) {
            currentYear = y;
            tbody.appendChild(makeHeaderRow(String(y), "year-header"));
        }

        if (includeUpcomingPast) {
            if (!insertedUpcoming && t._ts >= todayTs) {
                tbody.appendChild(makeHeaderRow("UPCOMING"));
                insertedUpcoming = true;
            }
            if (!insertedPast && t._ts < todayTs) {
                tbody.appendChild(makeHeaderRow("PAST"));
                insertedPast = true;
            }
        }

        const key = normalizeLocationId(t.location);
        const location = key ? data.locations?.[key] : null;

        const tr = el("tr");
        tr.dataset.date = t.date ?? "";

        tr.appendChild(el("td", { className: "seq", text: `${seqFromBottom--}.` }));

        const tdConf = el("td");
        const url = safeHttpUrl(t.url);
        if (url) {
            const a = el("a", {
                text: t.conference ?? "",
                attrs: { href: url, target: "_blank", rel: "noopener noreferrer" },
            });
            tdConf.appendChild(a);
        } else {
            tdConf.textContent = t.conference ?? "";
        }
        tr.appendChild(tdConf);

        const tdTalk = el("td");
        const talkSpan = el("span", { text: t.talk ?? "" });
        talkSpan.style.fontSize = "0.9em";
        tdTalk.appendChild(talkSpan);
        tr.appendChild(tdTalk);

        tr.appendChild(el("td", { text: formatDateFromTs(t._ts) }));

        const tdLoc = el("td");
        if (location) {
            tdLoc.appendChild(el("div", { className: "venue", text: location.place ?? "" }));
            tdLoc.appendChild(el("div", { className: "city", text: `${location.location.city}/${location.location.country}` ?? "" }));
        } else {
            tdLoc.appendChild(el("div", { className: "city online", text: "Online" }));
        }
        tr.appendChild(tdLoc);

        tbody.appendChild(tr);
    }
}

let mapInstance = null;
let markers = [];
let activeInfoWindow = null;

function clearMarkers() {
    for (const m of markers) {
        try {
            m.map = null;
        } catch {}
        try {
            m.setMap?.(null);
        } catch {}
    }
    markers = [];
}

async function initMap() {
    const selectedYear = getSelectedYear();

    const data = await getData();
    let talks = data.events;

    if (selectedYear != null) {
        talks = talks.filter((t) => t._year === selectedYear);
    }

    const locationsMap = new Map();

    for (const t of talks) {
        const key = normalizeLocationId(t.location);
        const location = key ? data.locations?.[key] : null;
        if (!location?.coordinates) continue;

        const [lat, lng] = String(location.coordinates).split(",").map(Number);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

        let entry = locationsMap.get(key);
        if (!entry) {
            entry = { lat, lng, talks: [] };
            locationsMap.set(key, entry);
        }
        entry.talks.push(t);
    }

    const { Map: GoogleMap } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    const mapEl = document.getElementById("map");

    if (!mapInstance) {
        mapInstance = new GoogleMap(mapEl, {
            zoom: 4,
            center: { lat: 50, lng: 15 },
            mapId: "talksMapId",
        });
    } else {
        clearMarkers();
        if (activeInfoWindow) {
            activeInfoWindow.close();
            activeInfoWindow = null;
        }
    }

    const bounds = new google.maps.LatLngBounds();

    for (const [key, { lat, lng, talks: ts }] of locationsMap.entries()) {
        const location = key ? data.locations?.[key] : null;
        if (!location) continue;

        const conferences = [...new Set(ts.map((t) => t.conference).filter(Boolean))].join(" | ");
        const title = `${location.place ?? ""}${conferences ? `: ${conferences}` : ""}`;

        const position = { lat, lng };

        const marker = new AdvancedMarkerElement({
            map: mapInstance,
            position,
            title,
        });

        markers.push(marker);
        bounds.extend(position);

        const contentNode = createInfoWindowContent(location, { lat, lng }, ts);

        const infoWindow = new google.maps.InfoWindow({
            content: contentNode.outerHTML,
        });

        marker.addEventListener("click", () => {
            if (activeInfoWindow) activeInfoWindow.close();
            infoWindow.open({ map: mapInstance, anchor: marker });
            activeInfoWindow = infoWindow;
        });
    }

    if (markers.length === 1) {
        mapInstance.setCenter(bounds.getCenter());
        mapInstance.setZoom(10);
    } else if (markers.length > 1) {
        mapInstance.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });
    } else {
        mapInstance.setCenter({ lat: 50, lng: 15 });
        mapInstance.setZoom(4);
    }
}

window.initMap = initMap;

async function refreshUI() {
    await loadTalks();
    await initMap();
}

async function initPage() {
    await buildYearPicker();
    await loadTalks();
}

document.addEventListener("DOMContentLoaded", initPage);
window.addEventListener("popstate", () => refreshUI());
