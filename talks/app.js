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
    tr.appendChild(td);
    return tr;
}

function createInfoWindowContent(location, coords, talksAtLocation) {
    const root = el("div", { className: "iw" });

    const city = location?.location?.city ?? "";
    const country = location?.location?.country ?? "";
    const place = location?.place ?? "";

    root.appendChild(el("div", { className: "iw-place", text: place }));
    root.appendChild(el("div", { className: "iw-location", text: `${city}, ${country}` }));

    const ul = el("ul", { className: "iw-talks" });
    const sorted = talksAtLocation.slice().sort((a, b) => b._ts - a._ts);

    for (const t of sorted) {
        const li = el("li");
        li.appendChild(el("div", { className: "iw-talk", text: t.talk ?? "" }));
        li.appendChild(el("div", { className: "iw-meta", text: `${t.conference ?? ""} · ${formatDateFromTs(t._ts)}` }));
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
    if (!select) return;

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

    const upcomingTalks = talks.filter((t) => t._ts >= todayTs);
    const pastTalks = talks.filter((t) => t._ts < todayTs);

    let currentYear = null;

    if (includeUpcomingPast && upcomingTalks.length > 0) {
        tbody.appendChild(makeHeaderRow("UPCOMING", "upcoming"));
    }

    for (const t of upcomingTalks) {
        const y = t._year;
        if (y !== currentYear) {
            currentYear = y;
            tbody.appendChild(makeHeaderRow(String(y), "year-header"));
        }
        appendTalkRow(tbody, t, data, seqFromBottom--);
    }

    currentYear = null;
    if (includeUpcomingPast && pastTalks.length > 0) {
        tbody.appendChild(makeHeaderRow("PAST", "past"));
    }

    for (const t of pastTalks) {
        const y = t._year;
        if (y !== currentYear) {
            currentYear = y;
            tbody.appendChild(makeHeaderRow(String(y), "year-header"));
        }
        appendTalkRow(tbody, t, data, seqFromBottom--);
    }

    if (selectedYear != null) {
        tbody.textContent = "";
        seqFromBottom = talks.length;
        currentYear = null;

        for (const t of talks) {
            const y = t._year;
            if (y !== currentYear) {
                currentYear = y;
                tbody.appendChild(makeHeaderRow(String(y), "year-header"));
            }
            appendTalkRow(tbody, t, data, seqFromBottom--);
        }
    }
}

function appendTalkRow(tbody, t, data, seq) {
    const key = normalizeLocationId(t.location);
    const location = key ? data.locations?.[key] : null;

    const tr = el("tr");
    tr.dataset.date = t.date ?? "";

    tr.appendChild(el("td", { className: "seq", text: `${seq}.` }));

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
        const city = location.location?.city ?? "";
        const country = location.location?.country ?? "";
        tdLoc.appendChild(el("div", { className: "city", text: `${city}/${country}` }));
    } else {
        tdLoc.appendChild(el("div", { className: "city online", text: "Online" }));
    }
    tr.appendChild(tdLoc);

    tbody.appendChild(tr);
}

let mapInstance = null;
let markers = [];
let activeInfoWindow = null;
let countdownInterval = null;
let clusterer = null;
let travelLines = [];
let mapMode = "pins"; // "pins" | "clusters"

function animateCounter(element, target, duration = 1500) {
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (target - start) * easeOut);
        element.textContent = current;

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = target;
        }
    }

    requestAnimationFrame(update);
}

async function updateStats() {
    const data = await getData();
    const selectedYear = getSelectedYear();
    let talks = data.events;

    const allYears = new Set(data.events.map((t) => t._year));

    if (selectedYear != null) {
        talks = talks.filter((t) => t._year === selectedYear);
    }

    const countries = new Set();
    const cities = new Set();

    for (const t of talks) {
        const key = normalizeLocationId(t.location);
        const location = key ? data.locations?.[key] : null;
        if (location?.location) {
            if (location.location.country) countries.add(location.location.country);
            if (location.location.city) cities.add(location.location.city);
        }
    }

    const statTalks = document.querySelector('#statTalks .counter');
    const statCountries = document.querySelector('#statCountries .counter');
    const statCities = document.querySelector('#statCities .counter');
    const statYears = document.querySelector('#statYears .counter');

    const talksLabel = document.querySelector('#statTalks .stat-label');
    const countriesLabel = document.querySelector('#statCountries .stat-label');
    const citiesLabel = document.querySelector('#statCities .stat-label');

    if (selectedYear != null) {
        if (talksLabel) talksLabel.textContent = `Talks in ${selectedYear}`;
        if (countriesLabel) countriesLabel.textContent = `Countries in ${selectedYear}`;
        if (citiesLabel) citiesLabel.textContent = `Cities in ${selectedYear}`;
    } else {
        if (talksLabel) talksLabel.textContent = 'Talks Given';
        if (countriesLabel) countriesLabel.textContent = 'Countries';
        if (citiesLabel) citiesLabel.textContent = 'Cities';
    }

    if (statTalks) animateCounter(statTalks, talks.length);
    if (statCountries) animateCounter(statCountries, countries.size);
    if (statCities) animateCounter(statCities, cities.size);
    if (statYears) animateCounter(statYears, allYears.size);
}

async function updateCountdown() {
    const data = await getData();
    const todayTs = today().getTime();
    const upcoming = data.events
        .filter((t) => t._ts >= todayTs)
        .sort((a, b) => a._ts - b._ts);

    const section = document.getElementById('countdownSection');
    if (!upcoming.length) {
        section.style.display = 'none';
        if (countdownInterval) clearInterval(countdownInterval);
        return;
    }

    const next = upcoming[0];
    section.style.display = 'block';
    document.getElementById('nextTalkTitle').textContent = next.talk || '';
    document.getElementById('nextTalkConf').textContent = next.conference || '';

    function tick() {
        const now = Date.now();
        const diff = next._ts - now;

        if (diff <= 0) {
            document.getElementById('countdownDays').textContent = '00';
            document.getElementById('countdownHours').textContent = '00';
            document.getElementById('countdownMins').textContent = '00';
            document.getElementById('countdownSecs').textContent = '00';
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById('countdownDays').textContent = String(days).padStart(2, '0');
        document.getElementById('countdownHours').textContent = String(hours).padStart(2, '0');
        document.getElementById('countdownMins').textContent = String(mins).padStart(2, '0');
        document.getElementById('countdownSecs').textContent = String(secs).padStart(2, '0');
    }

    tick();
    if (countdownInterval) clearInterval(countdownInterval);
    countdownInterval = setInterval(tick, 1000);
}

async function buildYearChart() {
    const data = await getData();
    const selectedYear = getSelectedYear();

    const yearCounts = {};
    for (const t of data.events) {
        yearCounts[t._year] = (yearCounts[t._year] || 0) + 1;
    }

    const years = Object.keys(yearCounts).map(Number).sort((a, b) => a - b);
    const maxCount = Math.max(...Object.values(yearCounts), 1);

    const chart = document.getElementById('yearChart');
    chart.textContent = '';

    for (const year of years) {
        const count = yearCounts[year];
        const height = Math.max((count / maxCount) * 80, 8);
        const isActive = selectedYear === year;

        const bar = el('div', {
            className: `year-bar${isActive ? ' active' : ''}`,
            attrs: {
                role: 'button',
                tabindex: '0',
                'aria-label': `${year}: ${count} talk${count !== 1 ? 's' : ''}${isActive ? ' (selected)' : ''}`,
                'aria-pressed': isActive ? 'true' : 'false',
            },
        });

        const fill = el('div', { className: 'year-bar-fill' });
        fill.style.height = '0px';
        fill.dataset.count = count;
        fill.dataset.targetHeight = `${height}px`;

        const label = el('div', { className: 'year-bar-label', text: String(year) });

        bar.appendChild(fill);
        bar.appendChild(label);

        const handleSelect = () => {
            if (selectedYear === year) {
                setSelectedYearInUrl(null);
            } else {
                setSelectedYearInUrl(year);
            }
            refreshUI();
        };

        bar.onclick = handleSelect;
        bar.onkeydown = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSelect();
            }
        };

        chart.appendChild(bar);
    }

    requestAnimationFrame(() => {
        setTimeout(() => {
            document.querySelectorAll('.year-bar-fill').forEach((fill) => {
                fill.style.height = fill.dataset.targetHeight;
            });
        }, 100);
    });
}

function clearMarkers() {
    if (clusterer) {
        clusterer.clearMarkers();
        clusterer = null;
    }
    for (const m of markers) {
        try { m.map = null; } catch {}
        try { m.setMap?.(null); } catch {}
    }
    markers = [];
    for (const line of travelLines) {
        line.setMap(null);
    }
    travelLines = [];
    if (activeInfoWindow) {
        activeInfoWindow.close();
        activeInfoWindow = null;
    }
}

function createMarkerElement(count) {
    const div = document.createElement("div");
    div.className = "map-marker";
    div.textContent = count;
    const size = Math.max(26, Math.min(26 + (count - 1) * 3, 46));
    div.style.width = `${size}px`;
    div.style.height = `${size}px`;
    return div;
}

function createClusterElement(count) {
    const div = document.createElement("div");
    div.className = "cluster-marker";
    div.textContent = count;
    return div;
}

function buildTravelPath(talks, data) {
    for (const line of travelLines) {
        line.setMap(null);
    }
    travelLines = [];

    const warsaw = { lat: 52.2297, lng: 21.0122 };

    const seen = new Set();
    const destinations = [];

    for (const t of talks) {
        const key = normalizeLocationId(t.location);
        if (!key || seen.has(key)) continue;
        const loc = data.locations?.[key];
        if (!loc?.coordinates) continue;

        const [lat, lng] = String(loc.coordinates).split(",").map(Number);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;

        const dist = Math.abs(lat - warsaw.lat) + Math.abs(lng - warsaw.lng);
        if (dist < 0.05) continue;

        seen.add(key);
        destinations.push({ lat, lng });
    }

    for (const dest of destinations) {
        travelLines.push(
            new google.maps.Polyline({
                path: [warsaw, dest],
                geodesic: true,
                strokeColor: "#e25440",
                strokeOpacity: 0.5,
                strokeWeight: 1.5,
                map: mapInstance,
            })
        );
    }
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
            colorScheme: "DARK",
        });
    } else {
        clearMarkers();
    }

    const bounds = new google.maps.LatLngBounds();
    const useClusters = mapMode === "clusters" && typeof markerClusterer !== "undefined";

    for (const [key, { lat, lng, talks: ts }] of locationsMap.entries()) {
        const location = key ? data.locations?.[key] : null;
        if (!location) continue;

        const position = { lat, lng };
        const title = `${location.place ?? ""} (${ts.length} talk${ts.length !== 1 ? "s" : ""})`;

        const markerOpts = {
            position,
            title,
        };

        if (useClusters) {
            markerOpts.content = createMarkerElement(ts.length);
        }

        if (!useClusters) {
            markerOpts.map = mapInstance;
        }

        const marker = new AdvancedMarkerElement(markerOpts);

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

    if (useClusters && markers.length > 0) {
        const { AdvancedMarkerElement: ClusterMarker } = await google.maps.importLibrary("marker");
        clusterer = new markerClusterer.MarkerClusterer({
            map: mapInstance,
            markers,
            renderer: {
                render: ({ count, position }) => {
                    return new ClusterMarker({
                        position,
                        content: createClusterElement(count),
                    });
                },
            },
        });
        buildTravelPath(talks, data);
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

function debounce(fn, delay) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
}

async function refreshUI() {
    await Promise.all([
        loadTalks(),
        updateStats(),
        buildYearChart(),
        buildYearPicker(),
    ]);
    await initMap();
}

function showLoading() {
    const loading = document.getElementById('loadingState');
    const error = document.getElementById('errorState');
    const stats = document.getElementById('statsDashboard');
    const countdown = document.getElementById('countdownSection');
    const map = document.getElementById('map');
    const chart = document.getElementById('yearChart');
    const table = document.getElementById('talksTable');

    if (loading) loading.style.display = 'flex';
    if (error) error.style.display = 'none';
    if (stats) stats.style.visibility = 'hidden';
    if (countdown) countdown.style.display = 'none';
    if (map) map.style.visibility = 'hidden';
    if (chart) chart.style.visibility = 'hidden';
    if (table) table.style.visibility = 'hidden';
}

function hideLoading() {
    const loading = document.getElementById('loadingState');
    const stats = document.getElementById('statsDashboard');
    const map = document.getElementById('map');
    const chart = document.getElementById('yearChart');
    const table = document.getElementById('talksTable');

    if (loading) loading.style.display = 'none';
    if (stats) stats.style.visibility = 'visible';
    if (map) map.style.visibility = 'visible';
    if (chart) chart.style.visibility = 'visible';
    if (table) table.style.visibility = 'visible';
}

function showError(message) {
    const loading = document.getElementById('loadingState');
    const error = document.getElementById('errorState');
    const errorMsg = document.querySelector('.error-message');

    if (loading) loading.style.display = 'none';
    if (error) error.style.display = 'flex';
    if (errorMsg) errorMsg.textContent = message || 'Failed to load talks data.';
}

async function initPage() {
    showLoading();

    try {
        await Promise.all([
            loadTalks(),
            updateStats(),
            updateCountdown(),
            buildYearChart(),
            buildYearPicker(),
        ]);
        hideLoading();
    } catch (err) {
        console.error('Failed to initialize page:', err);
        showError(err.message || 'Failed to load talks data.');
    }
}

function syncToggleButton() {
    const btn = document.getElementById("mapModeToggle");
    if (!btn) return;
    btn.textContent = mapMode === "clusters" ? "Clusters" : "Pins";
    btn.classList.toggle("active", mapMode === "clusters");
}

document.addEventListener("DOMContentLoaded", () => {
    initPage();
    syncToggleButton();

    const toggleBtn = document.getElementById("mapModeToggle");
    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            mapMode = mapMode === "pins" ? "clusters" : "pins";
            syncToggleButton();
            initMap();
        });
    }

    const retryBtn = document.getElementById('retryBtn');
    if (retryBtn) {
        retryBtn.addEventListener('click', () => {
            getData({ forceReload: true });
            initPage();
        });
    }
});

window.addEventListener("popstate", debounce(() => refreshUI(), 100));
