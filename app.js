/* ChaloYaar — vanilla SPA. No framework. No tracking. */
(function () {
  "use strict";

  const VERSION = (window.CHALO_VERSION || "1.0.0");
  const CURATED_CITY = window.CHALO_CITY || "Bengaluru";
  const LS = {
    mode: "cr_mode",
    modeAsked: "cr_mode_asked",
    loc: "cr_loc",
    locLat: "cr_loc_lat",
    locLng: "cr_loc_lng",
    saved: "cr_saved",
    aiRoutes: "cr_ai_routes",
    aiPrompt: "cr_ai_prompt",
    aiBudget: "cr_ai_budget",
    provider: "cr_ai_provider",
    keys: {
      gemini: "cr_key_gemini",
      grok: "cr_key_grok",
      openai: "cr_key_openai",
      anthropic: "cr_key_anthropic",
    },
    geminiModels: "cr_gemini_models",
    geminiWinner: "cr_gemini_winner",
    weather: "cr_weather_cache",
    photos: "cr_photo_cache",
  };

  const BUDGETS = [
    { id: "quick", label: "Quick escape", sub: "2–3 hrs · morning ride, back before anyone notices", tone: "lime" },
    { id: "half", label: "Half-day arc", sub: "4–6 hrs · leave early, back by lunch-ish", tone: "sky" },
    { id: "full", label: "Main character day", sub: "full day · sunrise to sunset energy", tone: "pink" },
    { id: "weekend", label: "Weekend reset", sub: "2 days · out saturday, human again sunday", tone: "purple" },
    { id: "long", label: "Long saga", sub: "3+ days · proper disappearing act", tone: "cream" },
  ];

  const MODES = [
    { id: "flexible", label: "Flexible", maps: "driving", filter: null },
    { id: "bike", label: "Bike", maps: "driving", filter: "bike" },
    { id: "car", label: "Car", maps: "driving", filter: "car" },
    { id: "public", label: "Bus / train", maps: "transit", filter: "public" },
  ];

  const TICKER =
    "no login ★ no ads ★ no cap ★ free forever ★ ride safe ★ helmets & seatbelts ★ time-budget first ★ ask ai is optional ★ chai stops included ★ verify water before you dare ★ ";

  const PROVIDERS = [
    { id: "gemini", label: "Google Gemini (free tier — recommended)", ping: true },
    { id: "grok", label: "Grok / xAI", ping: true },
    { id: "openai", label: "OpenAI", ping: true },
    { id: "anthropic", label: "Anthropic Claude", ping: true },
  ];

  const AI_CHIPS = [
    { t: "waterfalls" },
    { t: "no crowds" },
    { t: "foodie run" },
    { t: "solo" },
    { t: "budget" },
  ];

  /* ---------- utils ---------- */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function lsGet(k, fallback) {
    try {
      const v = localStorage.getItem(k);
      return v == null ? fallback : v;
    } catch (_) {
      return fallback;
    }
  }
  function lsSet(k, v) {
    try {
      localStorage.setItem(k, v);
    } catch (_) {}
  }
  function lsJSON(k, fallback) {
    try {
      const v = localStorage.getItem(k);
      return v ? JSON.parse(v) : fallback;
    } catch (_) {
      return fallback;
    }
  }
  function lsSetJSON(k, v) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch (_) {}
  }

  function toast(msg, ms) {
    const host = document.getElementById("toast-host");
    if (!host) return;
    host.innerHTML = `<div class="toast" role="status">${esc(msg)}</div>`;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => {
      host.innerHTML = "";
    }, ms || 2400);
  }

  function greeting() {
    const h = new Date().getHours();
    if (h < 5) return "Still up?";
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    if (h < 21) return "Good evening";
    return "Planning tonight?";
  }

  function greetingSub() {
    const h = new Date().getHours();
    if (h < 12) return "Pick a time window and we’ll line up trips near you.";
    if (h < 17) return "Still enough daylight to make a short escape count.";
    return "Sketch a trip now — go when you’re free.";
  }

  function modeMeta(id) {
    return MODES.find((m) => m.id === id) || MODES[0];
  }

  function allRoutes() {
    const curated = Array.isArray(window.CHALO_ROUTES) ? window.CHALO_ROUTES.slice() : [];
    const ai = lsJSON(LS.aiRoutes, []).map((r) => Object.assign({ ai: true }, r));
    return curated.concat(ai);
  }

  function routeById(id) {
    return allRoutes().find((r) => r.id === id);
  }

  function filterByMode(routes, modeId) {
    const m = modeMeta(modeId);
    if (!m.filter) return routes.slice();
    return routes.filter((r) => Array.isArray(r.modes) && r.modes.includes(m.filter));
  }

  function filterByBudget(routes, budget) {
    return routes.filter((r) => r.budget === budget);
  }

  function isBengaluruLoc(loc) {
    if (!loc) return true;
    const s = loc.toLowerCase();
    return /bengaluru|bangalore|bengalooru/.test(s) || s.trim() === "";
  }

  function mapsLink(route, modeId) {
    const m = modeMeta(modeId);
    const travelmode = m.maps === "transit" ? "transit" : "driving";
    const origin = encodeURIComponent(state.loc || route.origin || "Bengaluru");
    const dest = route.destq || encodeURIComponent(route.dest || "");
    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=${travelmode}`;
    if (route.waypoints && route.waypoints.length) {
      url += `&waypoints=${route.waypoints.map(encodeURIComponent).join("|")}`;
    }
    return url;
  }

  function transitMapsLink(route) {
    const origin = encodeURIComponent(state.loc || route.origin || "Bengaluru");
    const dest = route.destq || encodeURIComponent(route.dest || "");
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=transit`;
  }

  function shareText(route, modeId) {
    const m = modeMeta(modeId);
    const stops = (route.stops || []).slice(0, 4).map((s) => `• ${s.name}`).join("\n");
    const appUrl = typeof location !== "undefined" ? location.href.split("#")[0] : "https://chaloyaar.app";
    return (
      `${m.label} · ${route.name}\n` +
      `${route.tagline}\n` +
      `${route.ride_time} · ${route.distance_km} km · ${route.cost}\n` +
      `when: ${route.best_time}\n` +
      (stops ? `stops:\n${stops}\n` : "") +
      `maps: ${mapsLink(route, modeId)}\n` +
      `planned on ChaloYaar → ${appUrl}`
    );
  }

  async function doShare(route) {
    const text = shareText(route, state.mode);
    if (navigator.share) {
      try {
        await navigator.share({ title: route.name, text });
        return "shared";
      } catch (e) {
        if (e && e.name === "AbortError") return "cancelled";
      }
    }
    return null;
  }

  function whatsappShare(route) {
    const text = encodeURIComponent(shareText(route, state.mode));
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener");
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (_) {}
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch (_) {
      return false;
    }
  }

  function savedIds() {
    return lsJSON(LS.saved, []);
  }
  function isSaved(id) {
    return savedIds().includes(id);
  }
  function toggleSave(id) {
    const arr = savedIds();
    const i = arr.indexOf(id);
    if (i >= 0) arr.splice(i, 1);
    else arr.push(id);
    lsSetJSON(LS.saved, arr);
    return i < 0;
  }

  function persistAiRoute(route) {
    const list = lsJSON(LS.aiRoutes, []);
    list.unshift(Object.assign({}, route, { ai: true }));
    while (list.length > 30) list.pop();
    lsSetJSON(LS.aiRoutes, list);
  }

  /* ---------- state ---------- */
  const state = {
    screen: "home",
    mode: lsGet(LS.mode, "flexible"),
    modeAsked: lsGet(LS.modeAsked, "") === "1",
    loc: lsGet(LS.loc, ""),
    budget: null,
    routeId: null,
    aiBusy: false,
    aiError: "",
    aiJustCooked: false,
    weather: null,
    weatherLoading: false,
    routeAsk: "",
    routeAskBusy: false,
    routeAskAnswer: "",
    keyTest: "",
    detecting: false,
  };

  /* ---------- place photos (Wikipedia / Commons, free, no key) ---------- */
  function photoQuery(route) {
    if (!route) return "";
    const dest = (route.dest || "").split(",")[0].trim();
    return dest || route.name || "";
  }

  function galleryQueries(route) {
    if (!route) return [];
    const qs = [photoQuery(route)];
    const stops = Array.isArray(route.stops) ? route.stops : [];
    stops.slice(0, 3).forEach((s) => {
      const n = typeof s === "string" ? s : s && s.name;
      if (n) qs.push(String(n).split(",")[0].trim());
    });
    return qs.filter((v, i, arr) => v && arr.indexOf(v) === i);
  }

  async function wikiSummaryPhoto(title) {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    const j = await res.json();
    const src =
      (j.originalimage && j.originalimage.source) ||
      (j.thumbnail && j.thumbnail.source) ||
      null;
    if (!src) return null;
    return {
      url: src,
      credit: "Wikipedia",
      title: j.title || title,
    };
  }

  async function commonsSearchPhotos(query, limit) {
    const lim = Math.min(Math.max(limit || 8, 1), 12);
    const api =
      "https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*" +
      "&generator=search&gsrnamespace=6&gsrlimit=" +
      lim +
      "&gsrsearch=" +
      encodeURIComponent(query) +
      "&prop=imageinfo&iiprop=url|mime|extmetadata&iiurlwidth=900";
    const res = await fetch(api);
    if (!res.ok) return [];
    const j = await res.json();
    const pages = j.query && j.query.pages ? Object.values(j.query.pages) : [];
    const out = [];
    for (const p of pages) {
      const info = p.imageinfo && p.imageinfo[0];
      if (!info) continue;
      if (info.mime && !String(info.mime).startsWith("image/")) continue;
      const src = info.thumburl || info.url;
      if (!src) continue;
      out.push({
        url: src,
        full: info.url || src,
        credit: "Wikimedia Commons",
        title: (p.title || query).replace(/^File:/, ""),
      });
    }
    return out;
  }

  async function commonsSearchPhoto(query) {
    const list = await commonsSearchPhotos(query, 5);
    return list[0] || null;
  }

  function uniquePhotos(list) {
    const seen = new Set();
    const out = [];
    for (const p of list || []) {
      if (!p || !p.url) continue;
      const key = p.url.replace(/\/\d+px-/, "/").split("?")[0];
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(p);
    }
    return out;
  }

  async function fetchPlacePhoto(query) {
    const q = String(query || "").trim();
    if (!q) return null;
    const cache = lsJSON(LS.photos, {});
    const hit = cache[q];
    if (hit && Date.now() - hit.ts < 7 * 24 * 60 * 60 * 1000) return hit.data;

    const candidates = [
      q,
      q.replace(/,.*$/, "").trim(),
      q.replace(/\s+/g, "_"),
    ].filter((v, i, arr) => v && arr.indexOf(v) === i);

    let photo = null;
    for (const title of candidates) {
      try {
        photo = await wikiSummaryPhoto(title);
        if (photo) break;
      } catch (_) {}
    }
    if (!photo) {
      try {
        photo = await commonsSearchPhoto(q);
      } catch (_) {}
    }

    cache[q] = { ts: Date.now(), data: photo };
    // keep cache from growing forever
    const keys = Object.keys(cache);
    if (keys.length > 80) {
      keys
        .sort((a, b) => (cache[a].ts || 0) - (cache[b].ts || 0))
        .slice(0, keys.length - 80)
        .forEach((k) => delete cache[k]);
    }
    lsSetJSON(LS.photos, cache);
    return photo;
  }

  async function fetchPlaceGallery(queries) {
    const list = (queries || []).map((q) => String(q || "").trim()).filter(Boolean);
    if (!list.length) return [];
    const cacheKey = "gal:" + list.join("|");
    const cache = lsJSON(LS.photos, {});
    const hit = cache[cacheKey];
    if (hit && Date.now() - hit.ts < 7 * 24 * 60 * 60 * 1000 && Array.isArray(hit.data)) {
      return hit.data;
    }

    const collected = [];
    for (const q of list.slice(0, 4)) {
      try {
        const wiki = await wikiSummaryPhoto(q);
        if (wiki) collected.push(wiki);
      } catch (_) {}
      try {
        const more = await commonsSearchPhotos(q + " India", 6);
        collected.push(...more);
      } catch (_) {}
      if (collected.length >= 10) break;
    }

    const photos = uniquePhotos(collected).slice(0, 10);
    cache[cacheKey] = { ts: Date.now(), data: photos };
    const keys = Object.keys(cache);
    if (keys.length > 100) {
      keys
        .sort((a, b) => (cache[a].ts || 0) - (cache[b].ts || 0))
        .slice(0, keys.length - 100)
        .forEach((k) => delete cache[k]);
    }
    lsSetJSON(LS.photos, cache);
    return photos;
  }

  function applyHeroPhoto(hero, creditEl, photo, indexLabel) {
    if (!hero || !photo || !photo.url) return;
    hero.src = photo.url;
    hero.alt = photo.title || "Place photo";
    if (creditEl) {
      const idx = indexLabel ? ` · ${indexLabel}` : "";
      creditEl.textContent = `Photo · ${photo.credit}${idx}`;
    }
  }

  let lightboxState = { photos: [], index: 0 };

  function openLightbox(photos, index) {
    const box = document.getElementById("lightbox");
    const img = document.getElementById("lightbox-img");
    const meta = document.getElementById("lightbox-meta");
    if (!box || !img || !photos || !photos.length) return;
    lightboxState = { photos, index: Math.max(0, Math.min(index || 0, photos.length - 1)) };
    const p = lightboxState.photos[lightboxState.index];
    img.src = p.full || p.url;
    img.alt = p.title || "Place photo";
    if (meta) {
      meta.textContent = `${p.title || "Place"} · ${p.credit || ""} · ${lightboxState.index + 1}/${photos.length}`;
    }
    box.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    const box = document.getElementById("lightbox");
    if (box) box.hidden = true;
    document.body.style.overflow = "";
  }

  function stepLightbox(delta) {
    const { photos } = lightboxState;
    if (!photos.length) return;
    const next = (lightboxState.index + delta + photos.length) % photos.length;
    openLightbox(photos, next);
  }

  function wireLightboxOnce() {
    if (wireLightboxOnce._done) return;
    wireLightboxOnce._done = true;
    const close = document.getElementById("lightbox-close");
    const prev = document.getElementById("lightbox-prev");
    const next = document.getElementById("lightbox-next");
    const box = document.getElementById("lightbox");
    if (close) close.addEventListener("click", closeLightbox);
    if (prev) prev.addEventListener("click", () => stepLightbox(-1));
    if (next) next.addEventListener("click", () => stepLightbox(1));
    if (box) {
      box.addEventListener("click", (e) => {
        if (e.target === box) closeLightbox();
      });
    }
    document.addEventListener("keydown", (e) => {
      const lb = document.getElementById("lightbox");
      if (!lb || lb.hidden) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") stepLightbox(-1);
      if (e.key === "ArrowRight") stepLightbox(1);
    });
  }

  function hydratePhotos() {
    document.querySelectorAll("[data-photo-q]").forEach((el) => {
      if (el.closest("[data-gallery-root]")) return;
      const q = el.getAttribute("data-photo-q");
      if (!q) return;
      fetchPlacePhoto(q).then((photo) => {
        if (!photo || !photo.url) return;
        if (el.tagName === "IMG") {
          el.src = photo.url;
          el.alt = photo.title || q;
          const credit = el.nextElementSibling;
          if (credit && credit.classList.contains("photo-credit")) {
            credit.textContent = `Photo · ${photo.credit}`;
          }
        } else {
          el.style.backgroundImage = `url("${photo.url.replace(/"/g, '\\"')}")`;
          el.classList.add("has-photo");
        }
      });
    });

    document.querySelectorAll("[data-gallery-root]").forEach((root) => {
      const queriesRaw = root.getAttribute("data-gallery-q") || "";
      const queries = queriesRaw.split("|").map((s) => s.trim()).filter(Boolean);
      const hero = root.querySelector(".hero-photo");
      const credit = root.querySelector(".photo-credit");
      const strip = root.querySelector(".gallery-strip");
      const expand = root.querySelector("[data-expand-photo]");
      if (!queries.length || !strip) return;

      fetchPlaceGallery(queries).then((photos) => {
        if (!photos.length) {
          strip.innerHTML = `<p class="fine" style="margin:0">No extra photos found for this place.</p>`;
          if (credit) credit.textContent = "Photo unavailable";
          if (expand) expand.hidden = true;
          return;
        }

        let active = 0;
        const setActive = (i) => {
          active = i;
          applyHeroPhoto(hero, credit, photos[i], `${i + 1}/${photos.length}`);
          strip.querySelectorAll(".gallery-thumb").forEach((t, ti) => {
            t.classList.toggle("on", ti === i);
          });
        };

        setActive(0);

        strip.innerHTML = photos
          .map(
            (p, i) =>
              `<button type="button" class="gallery-thumb ${i === 0 ? "on" : ""}" data-g-i="${i}" aria-label="Photo ${i + 1}: ${esc(p.title || "place")}">
                <img src="${esc(p.url)}" alt="" loading="lazy" />
              </button>`
          )
          .join("");

        strip.querySelectorAll("[data-g-i]").forEach((btn) => {
          btn.addEventListener("click", () => {
            const i = Number(btn.getAttribute("data-g-i"));
            if (!Number.isFinite(i) || !photos[i]) return;
            setActive(i);
          });
        });

        if (expand) {
          expand.hidden = false;
          expand.onclick = () => openLightbox(photos, active);
        }
        if (hero) {
          hero.style.cursor = "zoom-in";
          hero.onclick = () => openLightbox(photos, active);
          let startX = 0;
          hero.addEventListener(
            "touchstart",
            (e) => {
              startX = e.changedTouches[0].clientX;
            },
            { passive: true }
          );
          hero.addEventListener(
            "touchend",
            (e) => {
              const dx = e.changedTouches[0].clientX - startX;
              if (Math.abs(dx) < 40) return;
              const next = dx < 0 ? active + 1 : active - 1;
              if (next < 0 || next >= photos.length) return;
              setActive(next);
            },
            { passive: true }
          );
        }
      });
    });
  }

  function goSearchMore() {
    const b = BUDGETS.find((x) => x.id === state.budget);
    const loc = state.loc || CURATED_CITY;
    const budgetLabel = b ? `${b.label} (${b.sub})` : "a trip";
    const prompt =
      `more trips near ${loc} for ${budgetLabel}, mode: ${modeMeta(state.mode).label}. ` +
      `prefer lesser-known stops, food, and realistic timing.`;
    const existing = lsGet(LS.aiPrompt, "").trim();
    lsSet(LS.aiPrompt, existing ? `${existing} · ${prompt}` : prompt);
    if (state.budget) lsSet(LS.aiBudget, state.budget);
    state.screen = "ai";
    render();
    requestAnimationFrame(() => {
      const ta = document.getElementById("ai-prompt");
      if (ta) ta.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  /* ---------- weather ---------- */
  function weatherCacheKey(lat, lng) {
    return `${Number(lat).toFixed(2)},${Number(lng).toFixed(2)}`;
  }

  function weatherVerdict(w) {
    if (!w) return "";
    const rain = w.rainProb != null ? w.rainProb : 0;
    const wind = w.wind != null ? w.wind : 0;
    const temp = w.temp != null ? w.temp : 0;
    const code = w.code != null ? w.code : 0;
    if (rain >= 70 || code >= 95) return "heavy rain risk — rethink outdoor plans";
    if (rain >= 40 || wind >= 35) return "pack a rain layer";
    if (temp >= 36) return "heat is sharp — leave early";
    return "clear enough to go";
  }

  async function fetchWeather(route) {
    let lat = route.dlat;
    let lng = route.dlng;
    const cache = lsJSON(LS.weather, {});
    const key = lat != null && lng != null ? weatherCacheKey(lat, lng) : `q:${route.dest}`;
    const hit = cache[key];
    if (hit && Date.now() - hit.ts < 30 * 60 * 1000) return hit.data;

    try {
      if (lat == null || lng == null) {
        const g = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(route.dest)}&count=1`
        );
        const gj = await g.json();
        if (gj.results && gj.results[0]) {
          lat = gj.results[0].latitude;
          lng = gj.results[0].longitude;
        }
      }
      if (lat == null || lng == null) throw new Error("no coords");

      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
        `&current=temperature_2m,apparent_temperature,wind_speed_10m,weather_code` +
        `&daily=precipitation_probability_max,weather_code,temperature_2m_max&forecast_days=2&timezone=auto`;
      const res = await fetch(url);
      const j = await res.json();
      const cur = j.current || {};
      const data = {
        temp: cur.temperature_2m,
        feels: cur.apparent_temperature,
        wind: cur.wind_speed_10m,
        code: cur.weather_code,
        rainProb: j.daily && j.daily.precipitation_probability_max
          ? j.daily.precipitation_probability_max[0]
          : null,
        daily: j.daily || null,
      };
      cache[key] = { ts: Date.now(), data };
      lsSetJSON(LS.weather, cache);
      return data;
    } catch (_) {
      return { offline: true };
    }
  }

  /* ---------- geolocation ---------- */
  async function detectLocation() {
    if (!navigator.geolocation) {
      toast("geolocation not available — type your city ✍️");
      return;
    }
    state.detecting = true;
    render();
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        lsSet(LS.locLat, String(latitude));
        lsSet(LS.locLng, String(longitude));
        try {
          const url =
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
          const res = await fetch(url, {
            headers: { Accept: "application/json" },
          });
          const j = await res.json();
          const a = j.address || {};
          const city =
            a.city || a.town || a.village || a.suburb || a.state_district || a.state || "near you";
          state.loc = city;
          lsSet(LS.loc, city);
          toast(`pinned: ${city}`);
        } catch (_) {
          state.loc = `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;
          lsSet(LS.loc, state.loc);
          toast("got coords — name the city if you want");
        }
        state.detecting = false;
        render();
      },
      () => {
        state.detecting = false;
        toast("couldn't detect — type your starting point");
        render();
      },
      { enableHighAccuracy: false, timeout: 12000 }
    );
  }

  /* ---------- AI / BYOK ---------- */
  function getProvider() {
    return lsGet(LS.provider, "gemini");
  }
  function getKey(provider) {
    return lsGet(LS.keys[provider] || LS.keys.gemini, "");
  }

  function schemaHint() {
    return `{
  "id":"kebab-case","name":"","tagline":"one witty Gen-Z line",
  "budget":"quick|half|full|weekend|long",
  "modes":["bike","car","public"],
  "distance_km":0,"ride_time":"","best_time":"","cost":"₹…",
  "vibe":["tag"],"why":"2-3 sentences",
  "facts":["true fact"],"stops":[{"km":0,"name":"","note":""}],
  "flags":["honest warning"],
  "mode_tips":{"bike":[""],"car":[""],"public":[""]},
  "season":{"best":"","avoid":""},
  "transit":"how to reach by public transport or honesty that it's impractical",
  "origin":"","dest":"","destq":"url-encoded dest",
  "dlat":0,"dlng":0,"waypoints":[]
}`;
  }

  function buildTripPrompt(userPrompt, budget, loc, mode) {
    return (
      `You are ChaloYaar, a trip curator for Indian travellers. Return STRICT JSON only — a JSON array of 2 to 4 route objects. No markdown fences, no prose.\n` +
      `Each object MUST match this schema exactly:\n${schemaHint()}\n` +
      `User location: ${loc || "India"}\n` +
      `Time budget: ${budget}\n` +
      `Travel mode preference: ${mode}\n` +
      `User ask: ${userPrompt}\n` +
      `Voice: Gen-Z, funny, honest. flags must include real safety warnings. Use approximate phrasing (~₹, usually). ` +
      `Fill dlat/dlng for the main destination. modes should reflect realistic options.`
    );
  }

  function stripFences(text) {
    let t = String(text || "").trim();
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
    const start = t.indexOf("[");
    const end = t.lastIndexOf("]");
    if (start >= 0 && end > start) t = t.slice(start, end + 1);
    return t;
  }

  function fillRouteDefaults(r, i) {
    const idBase = (r.id || r.name || `ai-trip-${Date.now()}-${i}`)
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48);
    return {
      id: idBase || `ai-${Date.now()}-${i}`,
      name: r.name || "untitled trip",
      tagline: r.tagline || "ai cooked this one — double-check before you bounce",
      budget: ["quick", "half", "full", "weekend", "long"].includes(r.budget) ? r.budget : "half",
      modes: Array.isArray(r.modes) && r.modes.length ? r.modes : ["bike", "car", "public"],
      distance_km: Number(r.distance_km) || 0,
      ride_time: r.ride_time || "~?",
      best_time: r.best_time || "check locally",
      cost: r.cost || "~₹?",
      vibe: Array.isArray(r.vibe) ? r.vibe : [],
      why: r.why || "",
      facts: Array.isArray(r.facts) ? r.facts : [],
      stops: Array.isArray(r.stops) ? r.stops : [],
      flags: Array.isArray(r.flags) ? r.flags : ["verify timings & road status before you go"],
      mode_tips: {
        bike: (r.mode_tips && r.mode_tips.bike) || [],
        car: (r.mode_tips && r.mode_tips.car) || [],
        public: (r.mode_tips && r.mode_tips.public) || [],
      },
      season: r.season || { best: "", avoid: "" },
      transit: r.transit || "check local buses/trains — verify last services",
      origin: r.origin || state.loc || "",
      dest: r.dest || r.name || "",
      destq: r.destq || encodeURIComponent(r.dest || r.name || ""),
      dlat: r.dlat != null ? Number(r.dlat) : null,
      dlng: r.dlng != null ? Number(r.dlng) : null,
      waypoints: Array.isArray(r.waypoints) ? r.waypoints : [],
      ai: true,
    };
  }

  function parseRoutes(text) {
    const raw = stripFences(text);
    let data;
    try {
      data = JSON.parse(raw);
    } catch (_) {
      throw new Error("couldn't parse the AI JSON — try cooking again?");
    }
    if (!Array.isArray(data)) data = [data];
    return data.map(fillRouteDefaults);
  }

  function friendlyAiError(err, provider) {
    const msg = (err && err.message) || String(err || "");
    if (/quota|limit:\s*0|RESOURCE_EXHAUSTED|rate/i.test(msg)) {
      if (provider === "gemini") {
        return "Google is gatekeeping that model for new keys… open aistudio.google.com once, send any message to activate, then retest";
      }
      return "API quota/rate limit hit — wait a bit or check your plan";
    }
    if (/401|403|invalid.*key|API_KEY|authentication/i.test(msg)) {
      return "that key looks rejected — paste again from the provider dashboard";
    }
    if (/Failed to fetch|NetworkError|offline/i.test(msg)) {
      return "network glitch — check connection and try again";
    }
    return msg || "AI request failed";
  }

  /* Gemini model discovery — never hardcode model names */
  async function discoverGeminiModels(key) {
    const cached = lsJSON(LS.geminiModels, null);
    if (cached && cached.ts && Date.now() - cached.ts < 24 * 60 * 60 * 1000 && cached.list && cached.list.length) {
      return cached.list.slice();
    }
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`);
    const j = await res.json();
    if (!res.ok) throw new Error((j.error && j.error.message) || "couldn't list Gemini models");
    const models = (j.models || [])
      .filter((m) => (m.supportedGenerationMethods || []).includes("generateContent"))
      .map((m) => (m.name || "").replace(/^models\//, ""))
      .filter(Boolean)
      .filter((name) => {
        const n = name.toLowerCase();
        if (/embed|image|tts|live|thinking|aqa|vision|gemma/.test(n)) return false;
        return /gemini/.test(n);
      });

    const prefs = [
      /2\.5.*flash(?!.*lite)/i,
      /flash-lite/i,
      /2\.0.*flash/i,
      /1\.5.*flash/i,
      /flash/i,
      /pro/i,
    ];
    function rank(name) {
      for (let i = 0; i < prefs.length; i++) if (prefs[i].test(name)) return i;
      return prefs.length + 1;
    }
    models.sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));

    const winner = lsGet(LS.geminiWinner, "");
    if (winner) {
      const idx = models.indexOf(winner);
      if (idx > 0) {
        models.splice(idx, 1);
        models.unshift(winner);
      } else if (idx < 0) {
        models.unshift(winner);
      }
    }

    lsSetJSON(LS.geminiModels, { ts: Date.now(), list: models });
    return models;
  }

  async function callGemini(key, prompt) {
    const models = await discoverGeminiModels(key);
    if (!models.length) throw new Error("no usable Gemini text models on this key");
    let lastErr = null;
    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.8 },
          }),
        });
        const j = await res.json();
        if (!res.ok) {
          const msg = (j.error && j.error.message) || res.statusText;
          if (/limit:\s*0|not found|404|429/i.test(msg) || res.status === 404 || res.status === 429) {
            lastErr = new Error(msg);
            continue;
          }
          throw new Error(msg);
        }
        const text =
          j.candidates &&
          j.candidates[0] &&
          j.candidates[0].content &&
          j.candidates[0].content.parts
            ? j.candidates[0].content.parts.map((p) => p.text || "").join("")
            : "";
        if (!text) {
          lastErr = new Error("empty Gemini response");
          continue;
        }
        lsSet(LS.geminiWinner, model);
        const list = lsJSON(LS.geminiModels, { list: models });
        const next = [model].concat((list.list || models).filter((m) => m !== model));
        lsSetJSON(LS.geminiModels, { ts: Date.now(), list: next });
        return text;
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr || new Error("all Gemini models failed");
  }

  async function callOpenAICompat(base, key, model, prompt) {
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "Return strict JSON only. No markdown." },
          { role: "user", content: prompt },
        ],
        temperature: 0.8,
      }),
    });
    const j = await res.json();
    if (!res.ok) throw new Error((j.error && j.error.message) || res.statusText);
    return (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || "";
  }

  async function callAnthropic(key, prompt) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const j = await res.json();
    if (!res.ok) throw new Error((j.error && j.error.message) || res.statusText);
    const parts = j.content || [];
    return parts.map((p) => p.text || "").join("");
  }

  async function callAI(prompt) {
    const provider = getProvider();
    const key = getKey(provider);
    if (!key) throw new Error("add your API key in settings first (BYOK)");
    if (provider === "gemini") return callGemini(key, prompt);
    if (provider === "openai") return callOpenAICompat("https://api.openai.com/v1", key, "gpt-4o-mini", prompt);
    if (provider === "grok") return callOpenAICompat("https://api.x.ai/v1", key, "grok-2-latest", prompt);
    if (provider === "anthropic") return callAnthropic(key, prompt);
    throw new Error("unknown provider");
  }

  async function testKey() {
    const provider = getProvider();
    const key = getKey(provider);
    if (!key) {
      state.keyTest = "paste a key first";
      render();
      return;
    }
    state.keyTest = "testing…";
    render();
    try {
      if (provider === "gemini") {
        await discoverGeminiModels(key);
        const text = await callGemini(key, 'Reply with exact JSON: [{"ok":true}]');
        parseRoutes(text.indexOf("[") >= 0 ? text : '[{"id":"ping","name":"ping","tagline":"t","budget":"quick","modes":["bike"],"distance_km":1,"ride_time":"1","best_time":"n","cost":"₹0","vibe":[],"why":"t","facts":["t"],"stops":[],"flags":["t"],"mode_tips":{"bike":[],"car":[],"public":[]},"season":{"best":"","avoid":""},"transit":"t","origin":"t","dest":"t","destq":"t","dlat":0,"dlng":0,"waypoints":[]}]');
      } else {
        await callAI('Return exact JSON array: [{"id":"ping","name":"ping","tagline":"t","budget":"quick","modes":["bike"],"distance_km":1,"ride_time":"1","best_time":"n","cost":"₹0","vibe":[],"why":"t","facts":["t"],"stops":[],"flags":["t"],"mode_tips":{"bike":[],"car":[],"public":[]},"season":{"best":"","avoid":""},"transit":"t","origin":"t","dest":"t","destq":"t","dlat":0,"dlng":0,"waypoints":[]}]');
      }
      state.keyTest = "key works";
    } catch (e) {
      state.keyTest = friendlyAiError(e, provider);
    }
    render();
  }

  async function cookTrips() {
    const prompt = lsGet(LS.aiPrompt, "").trim();
    const budget = lsGet(LS.aiBudget, state.budget || "half");
    if (!prompt) {
      toast("Write what you're craving first");
      return;
    }
    state.aiBusy = true;
    state.aiError = "";
    state.aiJustCooked = false;
    render();
    try {
      const full = buildTripPrompt(prompt, budget, state.loc || CURATED_CITY, state.mode);
      const text = await callAI(full);
      const routes = parseRoutes(text);
      routes.forEach(persistAiRoute);
      state.aiJustCooked = true;
      state.budget = budget;
      state.screen = "results";
      toast(`${routes.length} trips ready`);
      requestAnimationFrame(() => {
        const el = document.getElementById("results-top");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (e) {
      state.aiError = friendlyAiError(e, getProvider());
      state.screen = "ai";
    }
    state.aiBusy = false;
    render();
  }

  async function askAboutRoute(route, question) {
    const q = (question || "").trim();
    if (!q) return;
    state.routeAskBusy = true;
    state.routeAskAnswer = "";
    render();
    try {
      const prompt =
        `Answer briefly in ChaloYaar Gen-Z voice about this route JSON. Be honest about uncertainty.\n` +
        `Route: ${JSON.stringify(route)}\nQuestion: ${q}\n` +
        `Reply in plain text (not JSON), 3-8 sentences max.`;
      const text = await callAI(prompt);
      state.routeAskAnswer = text.trim();
    } catch (e) {
      state.routeAskAnswer = friendlyAiError(e, getProvider());
    }
    state.routeAskBusy = false;
    render();
  }

  /* ---------- views ---------- */
  function modeChipsHtml(selected, cls) {
    return `<div class="chip-row ${cls || ""}" role="radiogroup" aria-label="how you move">
      ${MODES.map(
        (m) =>
          `<button type="button" class="chip ${m.id === selected ? "on" : ""}" role="radio" aria-checked="${m.id === selected}" data-mode="${esc(m.id)}">${esc(m.label)}</button>`
      ).join("")}
    </div>`;
  }

  function routeCardHtml(r) {
    const vibes = (r.vibe || []).slice(0, 3).join(" · ");
    const q = photoQuery(r);
    return `<button type="button" class="route-card" data-route="${esc(r.id)}">
      <div class="route-photo" data-photo-q="${esc(q)}" aria-hidden="true"></div>
      <div class="route-body">
        <div>
          <span class="name">${esc(r.name)}</span>
          ${r.ai ? `<span class="badge-ai">AI-made</span>` : ""}
        </div>
        <div class="tagline">${esc(r.tagline)}</div>
        <div class="stat-chips">
          <span class="stat">${esc(r.ride_time)}</span>
          <span class="stat">${esc(String(r.distance_km))} km</span>
          <span class="stat">${esc(r.cost)}</span>
          ${vibes ? `<span class="stat">${esc(vibes)}</span>` : ""}
        </div>
        ${r.ai ? `<div class="fine">AI-made — verify timings and road status</div>` : ""}
        <div class="tap-affordance">open full plan</div>
      </div>
    </button>`;
  }

  function tipsBlock(title, tips) {
    if (!tips || !tips.length) return "";
    return `<h3 class="section-h">${esc(title)}</h3>
      <ul class="list-block">${tips.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;
  }

  function viewHome() {
    const firstRun = !state.modeAsked;
    return `
      <div class="block">
        <p class="greeting">${esc(greeting())}</p>
        <p class="greeting-sub">${esc(greetingSub())}</p>
      </div>
      <div class="block">
        <div class="card">
          <span class="label-sm" id="loc-label">Starting from</span>
          <div class="stack-tight">
            <input class="field search-like" id="loc-input" aria-labelledby="loc-label" placeholder="Search city or area" value="${esc(state.loc)}" autocomplete="off" />
            <button type="button" class="btn" id="btn-detect">${state.detecting ? "Detecting…" : "Detect my location"}</button>
            <p class="fine" style="margin:0">Curated routes are for <strong>${esc(CURATED_CITY)}</strong> right now · other cities → <strong>Ask AI</strong> cooks them fresh</p>
          </div>
        </div>
      </div>
      <div class="block">
      ${
        firstRun
          ? `<div class="card accent-edge">
              <strong style="font-size:15px;font-weight:800;font-family:IBM Plex Sans,sans-serif">How do you usually move?</strong>
              <p class="fine" style="margin:6px 0 10px">This tunes tips and map links. You can change it anytime.</p>
              ${modeChipsHtml(state.mode, "first-mode")}
            </div>`
          : `<span class="label-sm">Travel mode</span>
             ${modeChipsHtml(state.mode)}`
      }
      </div>
      <div class="block block-lg">
        <div class="block-head">
          <h2 class="section-h">How much time you got?</h2>
          <p class="hint">Tap a slot — trips show up instantly.</p>
        </div>
        <div class="budget-grid" role="list">
          ${BUDGETS.map(
            (b) => `<button type="button" class="budget-card tone-${esc(b.tone || "cream")}" data-budget="${esc(b.id)}" role="listitem">
              <div class="label">${esc(b.label)}</div>
              <div class="sub">${esc(b.sub)}</div>
            </button>`
          ).join("")}
        </div>
        <div style="margin-top:12px">
          <button type="button" class="btn secondary" id="btn-surprise">Surprise me</button>
        </div>
      </div>
    `;
  }

  function viewResults() {
    let routes = filterByBudget(allRoutes(), state.budget);
    routes = filterByMode(routes, state.mode);
    const b = BUDGETS.find((x) => x.id === state.budget);
    const showAiBanner = !isBengaluruLoc(state.loc);
    const hasSearch = !!(state.loc && state.loc.trim());
    return `
      <div class="block" id="results-top">
        <div class="topbar">
          <button type="button" class="btn sm secondary" id="btn-back-home">Back</button>
        </div>
        <h2 class="display">${esc(b ? b.label : "Trips")}</h2>
        <p class="hint" style="margin-top:6px">${routes.length} trip${routes.length === 1 ? "" : "s"} ready${hasSearch ? ` · from ${esc(state.loc)}` : ""}</p>
        ${modeChipsHtml(state.mode)}
      </div>
      ${
        showAiBanner
          ? `<div class="block"><div class="banner">Not seeing your city in the curated pack? Open <strong>Ask AI</strong> — paste a free Gemini key in Settings and cook trips for anywhere.</div></div>`
          : ""
      }
      <div class="block block-lg route-list">
      ${
        routes.length
          ? routes.map(routeCardHtml).join("")
          : `<div class="empty">
              <div class="display">nothing for this combo yet</div>
              <p class="muted">Try another mode, or let Ask AI draft something.</p>
              <button type="button" class="btn green" id="btn-goto-ai" style="margin-top:10px">Open Ask AI</button>
            </div>`
      }
      </div>
      ${
        hasSearch || routes.length
          ? `<div class="block">
               <button type="button" class="btn" id="btn-search-more">Search for more</button>
               <p class="hint" style="margin-top:8px">Opens Ask AI with your place and time budget prefilled.</p>
             </div>`
          : ""
      }
    `;
  }

  function viewRoute() {
    const route = routeById(state.routeId);
    if (!route) {
      return `<p>trip went missing.</p><button type="button" class="btn" id="btn-back-results">back</button>`;
    }
    const m = modeMeta(state.mode);
    const mapsLabel = state.mode === "public" ? "transit directions" : "open in maps";
    const saved = isSaved(route.id);

    const why = `<h3 class="section-h">why this slaps</h3><p>${esc(route.why)}</p>`;
    const when = `<h3 class="section-h tight">when to go</h3>
      <p>${esc(route.best_time)}</p>
      <p class="fine">best: ${esc((route.season && route.season.best) || "—")} · avoid: ${esc((route.season && route.season.avoid) || "—")}</p>`;

    let weatherHtml = `<h3 class="section-h tight">weather at ${esc(route.dest)}</h3>`;
    if (state.weatherLoading) weatherHtml += `<p class="muted">checking the sky…</p>`;
    else if (state.weather && state.weather.offline) {
      weatherHtml += `<p class="muted">offline — weather unreachable right now</p>`;
    } else if (state.weather) {
      const w = state.weather;
      weatherHtml += `<div class="card panel">
        <div class="mono">${w.temp != null ? esc(w.temp) + "°C" : "?"} · feels ${w.feels != null ? esc(w.feels) + "°C" : "?"} · wind ${w.wind != null ? esc(w.wind) + " km/h" : "?"}${w.rainProb != null ? ` · rain ~${esc(w.rainProb)}%` : ""}</div>
        <div class="weather-verdict">${esc(weatherVerdict(w))}</div>
      </div>`;
    } else weatherHtml += `<p class="muted">weather loading…</p>`;

    const stops = `<h3 class="section-h">the pit stops</h3>
      <ul class="list-block">${(route.stops || []).map((s) => `<li><strong>${esc(s.name)}</strong>${s.km != null ? ` <span class="mono">(${esc(s.km)} km)</span>` : ""} — ${esc(s.note || "")}</li>`).join("") || "<li>wing it, carefully</li>"}</ul>`;
    const facts = `<h3 class="section-h">no-cap facts</h3>
      <ul class="list-block">${(route.facts || []).map((f) => `<li>${esc(f)}</li>`).join("")}</ul>`;
    const flags = `<h3 class="section-h">red flags (respect them)</h3>
      <ul class="list-block">${(route.flags || []).map((f) => `<li>${esc(f)}</li>`).join("")}</ul>`;
    const transit = `<h3 class="section-h">getting there by bus/train</h3>
      <p>${esc(route.transit || "")}</p>
      <p style="margin-top:10px"><a class="btn sm green" href="${esc(transitMapsLink(route))}" target="_blank" rel="noopener">open transit directions</a></p>`;
    const transitNotes = tipsBlock("transit notes", route.mode_tips && route.mode_tips.public);

    const bikeTips = tipsBlock("if you ride", route.mode_tips && route.mode_tips.bike);
    const carTips = tipsBlock("if you drive", route.mode_tips && route.mode_tips.car);
    const pubTips = tipsBlock("if you bus it", route.mode_tips && route.mode_tips.public);
    const riderNotes = tipsBlock("rider notes", route.mode_tips && route.mode_tips.bike);
    const driverNotes = tipsBlock("driver notes", route.mode_tips && route.mode_tips.car);

    let body = "";
    if (state.mode === "public") {
      body = transit + transitNotes + stops + facts + flags;
    } else if (state.mode === "bike") {
      body = stops + riderNotes + facts + flags + transit;
    } else if (state.mode === "car") {
      body = stops + driverNotes + facts + flags + transit;
    } else {
      body = stops + bikeTips + carTips + pubTips + facts + flags + transit;
    }

    const photoQ = photoQuery(route);
    const galQs = galleryQueries(route).join("|");
    const photoBlock = `<div class="place-media" data-gallery-root data-gallery-q="${esc(galQs)}">
        <div class="hero-wrap">
          <img class="hero-photo" data-photo-q="${esc(photoQ)}" alt="" width="800" height="200" />
          <button type="button" class="btn-expand" data-expand-photo>Expand</button>
        </div>
        <p class="photo-credit">Loading place photos…</p>
        <div class="gallery-head">
          <span class="label-sm" style="margin:0">Gallery</span>
          <span class="fine">Tap · swipe · expand</span>
        </div>
        <div class="gallery-strip" role="list" aria-label="Place photo gallery">
          <p class="fine" style="margin:0">Finding photos…</p>
        </div>
      </div>`;

    return `
      <div class="block">
        <div class="topbar">
          <button type="button" class="btn sm secondary" id="btn-back-results">back</button>
        </div>
        ${photoBlock}
        <div class="card offset accent-edge">
          <span class="pill green">${esc(m.label)}</span>
          <h1 class="display" style="font-size:2.1rem;margin-top:8px;text-transform:lowercase;max-width:12ch;line-height:0.95">${esc(route.name)}</h1>
          ${route.ai ? `<span class="badge-ai" style="margin-top:6px;display:inline-block">AI-made — verify timings and road status</span>` : ""}
          <p style="margin:8px 0 0;color:var(--ink);font-size:0.92rem;line-height:1.4;font-weight:500">${esc(route.tagline)}</p>
          <div class="stat-chips">
            <span class="stat">${esc(m.label)}</span>
            <span class="stat">${esc(String(route.distance_km))} km</span>
            <span class="stat">${esc(route.ride_time)}</span>
            <span class="stat">${esc(route.cost)}</span>
          </div>
          <div class="action-grid">
            <a class="btn sm green" id="btn-maps" href="${esc(mapsLink(route, state.mode))}" target="_blank" rel="noopener">${mapsLabel}</a>
            <button type="button" class="btn sm ${saved ? "ink" : "secondary"}" id="btn-save">${saved ? "saved" : "save"}</button>
            <button type="button" class="btn sm secondary" id="btn-share">share</button>
            <button type="button" class="btn sm" id="btn-wa">WhatsApp</button>
            <button type="button" class="btn sm secondary" id="btn-copy" style="grid-column:1/-1">copy trip card</button>
          </div>
        </div>
      </div>
      <div class="block block-lg">
        ${why}${when}${weatherHtml}
      </div>
      <div class="block block-lg">
        ${body}
      </div>
      <div class="block">
        <div class="card green-fill">
          <strong style="font-size:1.2rem;font-weight:700;letter-spacing:-0.02em;line-height:1.2">Ask AI about this route</strong>
          <p class="fine" style="margin:6px 0 8px">needs your key in settings. answers stay grounded in this trip’s details.</p>
          <textarea class="field" id="route-ask" placeholder="e.g. is this chill for a pillion beginner?" style="background:var(--paper);color:var(--ink)">${esc(state.routeAsk)}</textarea>
          <button type="button" class="btn" id="btn-route-ask" style="margin-top:8px">${state.routeAskBusy ? "thinking…" : "ask"}</button>
          ${state.routeAskAnswer ? `<div class="card panel" style="margin-top:10px;color:var(--ink)">${esc(state.routeAskAnswer)}</div>` : ""}
        </div>
      </div>
    `;
  }

  function viewAi() {
    const prompt = lsGet(LS.aiPrompt, "");
    const budget = lsGet(LS.aiBudget, "half");
    const recent = lsJSON(LS.aiRoutes, []).slice(0, 8);
    return `
      <div class="block hero-block" style="padding-bottom:10px">
        <div class="brand">ask ai</div>
        <p class="hint" style="margin-top:6px">tell it what you're feeling. it plans the whole thing.</p>
        <span class="script-pill purple">unlimited routes</span>
      </div>
      <div class="block">
        <div class="card">
          <span class="label-sm">The vibe / your constraints</span>
          <textarea class="field" id="ai-prompt" placeholder="e.g. I have 6 hours from Bengaluru, on a bike, love waterfalls, hate crowds…">${esc(prompt)}</textarea>
          <div class="chip-row" style="margin-top:10px">
            ${AI_CHIPS.map((c) => `<button type="button" class="chip ai-add" data-add="${esc(c.t)}">+ ${esc(c.t)}</button>`).join("")}
          </div>
          <div style="margin-top:14px">
            <span class="label-sm">Time budget</span>
            <div class="chip-row" role="radiogroup" aria-label="ai time budget">
              ${BUDGETS.map(
                (b) =>
                  `<button type="button" class="chip ${budget === b.id ? "on" : ""}" role="radio" aria-checked="${budget === b.id}" data-ai-budget="${esc(b.id)}">${esc(b.sub.split("·")[0].trim())}</button>`
              ).join("")}
            </div>
          </div>
          <button type="button" class="btn purple" id="btn-cook" style="margin-top:14px" ${state.aiBusy ? "disabled" : ""}>${state.aiBusy ? "cooking…" : "cook my trip"}</button>
          <p class="fine" style="margin:10px 0 0">AI suggestions can be confidently wrong — double-check before you go.</p>
        </div>
        ${state.aiJustCooked || recent.length ? `<p class="hint" style="margin-top:10px">not quite it? edit your prompt above and cook again</p>` : ""}
        ${state.aiError ? `<div class="banner warn" style="margin-top:8px">${esc(state.aiError)}</div>` : ""}
        ${
          !getKey(getProvider())
            ? `<div class="banner" style="margin-top:8px">no key yet — open settings, grab a free Gemini key, then come cook.</div>`
            : ""
        }
      </div>
      ${
        recent.length
          ? `<div class="block block-lg route-list">
               <h3 class="section-h">fresh from the kitchen</h3>
               ${recent.map(routeCardHtml).join("")}
               <div style="margin-top:14px">
                 <button type="button" class="btn" id="btn-search-more">search for more</button>
               </div>
             </div>`
          : ""
      }
    `;
  }

  function viewSaved() {
    const ids = savedIds();
    const routes = ids.map(routeById).filter(Boolean);
    return `
      <div class="hero-block" style="padding-bottom:8px">
        <div class="brand">saved</div>
        <span class="script-pill mint">on this phone</span>
      </div>
      ${
        routes.length
          ? `<div class="route-list">${routes.map(routeCardHtml).join("")}</div>`
          : `<div class="empty">
              <div class="empty-ico" aria-hidden="true">◇</div>
              <div class="display">empty jar.</div>
              <p class="muted">tap save on any trip to stash it here.</p>
              <button type="button" class="btn" id="btn-goto-home" style="margin-top:14px">find a trip</button>
            </div>`
      }
    `;
  }

  function viewSettings() {
    const provider = getProvider();
    const key = getKey(provider);
    return `
      <div class="hero-block" style="padding-bottom:8px">
        <div class="brand">settings</div>
      </div>
      <div class="card offset">
        <div class="row" style="justify-content:space-between;margin-bottom:8px">
          <strong style="font-size:1.05rem;font-weight:800;font-family:IBM Plex Sans,sans-serif">power up with AI</strong>
          <span class="script-pill pink" style="font-size:15px;padding:2px 10px">optional</span>
        </div>
        <p class="fine" style="margin:0 0 12px">App works without AI. A free Gemini key unlocks Ask AI + trip cooking anywhere.</p>
        <label class="label-sm" for="ai-provider">Provider</label>
        <select class="field" id="ai-provider">
          ${PROVIDERS.map((p) => `<option value="${esc(p.id)}" ${p.id === provider ? "selected" : ""}>${esc(p.label)}</option>`).join("")}
        </select>
        <label class="label-sm" for="ai-key" style="margin-top:14px">Your API key</label>
        <input class="field" id="ai-key" type="password" autocomplete="off" placeholder="paste key" value="${esc(key)}" />
        <div class="row" style="margin-top:12px">
          <button type="button" class="btn sm" id="btn-save-key">save key</button>
          <button type="button" class="btn sm secondary" id="btn-test-key">test key</button>
        </div>
        ${state.keyTest ? `<p class="hint" id="key-test-status">${esc(state.keyTest)}</p>` : ""}
        <h3 class="section-h tight" style="font-size:1.05rem">free Gemini in 4 steps</h3>
        <ol class="steps fine">
          <li>open <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener">aistudio.google.com/app/apikey</a></li>
          <li>sign in with your normal Google account</li>
          <li>tap <strong>Create API key</strong>, then copy the <span class="mono">AIza…</span> code</li>
          <li>paste above, save, hit <strong>test key</strong></li>
        </ol>
        <p class="fine" style="margin-top:12px">Keys stay on this device. We have no server — we can't see them.</p>
      </div>
      <div class="gap"></div>
      <div class="card panel">
        <strong style="font-size:1.05rem;font-weight:800;font-family:IBM Plex Sans,sans-serif">Install as an app</strong>
        <p class="fine" style="margin-top:8px"><strong>Android (Chrome):</strong> menu → Install app / Add to Home screen.</p>
        <p class="fine"><strong>iOS (Safari):</strong> Share → Add to Home Screen.</p>
      </div>
      <div class="gap"></div>
      <div class="card">
        <strong style="font-size:1.05rem;font-weight:800;font-family:IBM Plex Sans,sans-serif">Honest fine print</strong>
        <p class="fine" style="margin-top:8px">no login, no accounts, no ads, no analytics, no tracking, no backend, no cost. all state lives in <span class="mono">localStorage</span> on this device. clearing site data wipes saved trips, keys, and prompts — forever. AI routes are suggestions: verify timings, road status, and water safety yourself.</p>
      </div>
      <p class="mono muted" style="margin-top:20px;text-align:left">ChaloYaar v${esc(VERSION)}</p>
    `;
  }

  const views = {
    home: viewHome,
    results: viewResults,
    route: viewRoute,
    ai: viewAi,
    saved: viewSaved,
    settings: viewSettings,
  };

  /* ---------- wire ---------- */
  const wire = {
    home() {
      document.querySelectorAll("[data-mode]").forEach((el) => {
        el.addEventListener("click", () => {
          state.mode = el.getAttribute("data-mode");
          lsSet(LS.mode, state.mode);
          if (!state.modeAsked) {
            state.modeAsked = true;
            lsSet(LS.modeAsked, "1");
          }
          render();
        });
      });
      const loc = document.getElementById("loc-input");
      if (loc) {
        loc.addEventListener("input", () => {
          state.loc = loc.value;
          lsSet(LS.loc, state.loc);
        });
      }
      const det = document.getElementById("btn-detect");
      if (det) det.addEventListener("click", () => detectLocation());
      document.querySelectorAll("[data-budget]").forEach((el) => {
        el.addEventListener("click", () => {
          state.budget = el.getAttribute("data-budget");
          state.screen = "results";
          render();
        });
      });
      const sur = document.getElementById("btn-surprise");
      if (sur) {
        sur.addEventListener("click", () => {
          const pool = filterByMode(allRoutes(), state.mode);
          if (!pool.length) {
            toast("no routes for this mode yet");
            return;
          }
          const r = pool[Math.floor(Math.random() * pool.length)];
          state.budget = r.budget;
          state.routeId = r.id;
          state.screen = "route";
          loadWeather(r);
          render();
        });
      }
    },
    results() {
      const back = document.getElementById("btn-back-home");
      if (back) back.addEventListener("click", () => { state.screen = "home"; render(); });
      document.querySelectorAll("[data-mode]").forEach((el) => {
        el.addEventListener("click", () => {
          state.mode = el.getAttribute("data-mode");
          lsSet(LS.mode, state.mode);
          render();
        });
      });
      document.querySelectorAll("[data-route]").forEach((el) => {
        el.addEventListener("click", () => openRoute(el.getAttribute("data-route")));
      });
      const ai = document.getElementById("btn-goto-ai");
      if (ai) ai.addEventListener("click", () => { state.screen = "ai"; render(); });
      const more = document.getElementById("btn-search-more");
      if (more) more.addEventListener("click", () => goSearchMore());
    },
    route() {
      const back = document.getElementById("btn-back-results");
      if (back) {
        back.addEventListener("click", () => {
          state.screen = state.budget ? "results" : "home";
          render();
        });
      }
      const route = routeById(state.routeId);
      const save = document.getElementById("btn-save");
      if (save && route) {
        save.addEventListener("click", () => {
          const on = toggleSave(route.id);
          toast(on ? "saved on this phone" : "removed from saved");
          render();
        });
      }
      const share = document.getElementById("btn-share");
      if (share && route) {
        share.addEventListener("click", async () => {
          const r = await doShare(route);
          if (r === "shared") toast("shared ✓");
          else if (r !== "cancelled") {
            const ok = await copyText(shareText(route, state.mode));
            toast(ok ? "copied trip card" : "couldn't share — try WhatsApp");
          }
        });
      }
      const wa = document.getElementById("btn-wa");
      if (wa && route) wa.addEventListener("click", () => whatsappShare(route));
      const copy = document.getElementById("btn-copy");
      if (copy && route) {
        copy.addEventListener("click", async () => {
          const ok = await copyText(shareText(route, state.mode));
          toast(ok ? "copied ✓" : "copy failed");
        });
      }
      const ask = document.getElementById("btn-route-ask");
      const ta = document.getElementById("route-ask");
      if (ta) ta.addEventListener("input", () => { state.routeAsk = ta.value; });
      if (ask && route) {
        ask.addEventListener("click", () => {
          state.routeAsk = (ta && ta.value) || "";
          askAboutRoute(route, state.routeAsk);
        });
      }
    },
    ai() {
      const ta = document.getElementById("ai-prompt");
      if (ta) {
        ta.addEventListener("input", () => lsSet(LS.aiPrompt, ta.value));
      }
      document.querySelectorAll("[data-add]").forEach((el) => {
        el.addEventListener("click", () => {
          const add = el.getAttribute("data-add");
          const cur = lsGet(LS.aiPrompt, "");
          const next = cur.trim() ? `${cur.trim()}, ${add}` : add;
          lsSet(LS.aiPrompt, next);
          render();
        });
      });
      document.querySelectorAll("[data-ai-budget]").forEach((el) => {
        el.addEventListener("click", () => {
          lsSet(LS.aiBudget, el.getAttribute("data-ai-budget"));
          render();
        });
      });
      const cook = document.getElementById("btn-cook");
      if (cook) cook.addEventListener("click", () => cookTrips());
      document.querySelectorAll("[data-route]").forEach((el) => {
        el.addEventListener("click", () => openRoute(el.getAttribute("data-route")));
      });
      const more = document.getElementById("btn-search-more");
      if (more) more.addEventListener("click", () => goSearchMore());
    },
    saved() {
      document.querySelectorAll("[data-route]").forEach((el) => {
        el.addEventListener("click", () => openRoute(el.getAttribute("data-route")));
      });
      const home = document.getElementById("btn-goto-home");
      if (home) home.addEventListener("click", () => { state.screen = "home"; render(); });
    },
    settings() {
      const sel = document.getElementById("ai-provider");
      if (sel) {
        sel.addEventListener("change", () => {
          lsSet(LS.provider, sel.value);
          state.keyTest = "";
          render();
        });
      }
      const save = document.getElementById("btn-save-key");
      if (save) {
        save.addEventListener("click", () => {
          const p = getProvider();
          const input = document.getElementById("ai-key");
          lsSet(LS.keys[p], (input && input.value.trim()) || "");
          toast("key saved on this phone only");
          state.keyTest = "";
          render();
        });
      }
      const test = document.getElementById("btn-test-key");
      if (test) test.addEventListener("click", () => testKey());
    },
  };

  function openRoute(id) {
    state.routeId = id;
    state.screen = "route";
    state.routeAsk = "";
    state.routeAskAnswer = "";
    const r = routeById(id);
    if (r) loadWeather(r);
    render();
  }

  async function loadWeather(route) {
    state.weather = null;
    state.weatherLoading = true;
    render();
    const w = await fetchWeather(route);
    if (state.routeId === route.id) {
      state.weather = w;
      state.weatherLoading = false;
      render();
    }
  }

  function renderNav() {
    const nav = document.getElementById("nav");
    if (!nav) return;
    const tabs = [
      { id: "home", label: "let's go", ico: "GO" },
      { id: "ai", label: "ask ai", ico: "AI" },
      { id: "saved", label: "saved", ico: "★" },
      { id: "settings", label: "settings", ico: "⚙" },
    ];
    const active = ["results", "route"].includes(state.screen) ? "home" : state.screen;
    nav.innerHTML = tabs
      .map(
        (t) =>
          `<button type="button" class="nav-btn ${active === t.id ? "on" : ""}" data-nav="${t.id}"${active === t.id ? ' aria-current="page"' : ""}><span class="nav-ico" aria-hidden="true">${esc(t.ico)}</span>${esc(t.label)}</button>`
      )
      .join("");
    nav.querySelectorAll("[data-nav]").forEach((el) => {
      el.addEventListener("click", () => {
        state.screen = el.getAttribute("data-nav");
        render();
      });
    });
  }

  function render() {
    const root = document.getElementById("view");
    if (!root) return;
    const fn = views[state.screen] || viewHome;
    root.innerHTML = fn();
    root.classList.remove("view-enter");
    // reflow so animation can replay
    void root.offsetWidth;
    root.classList.add("view-enter");
    renderNav();
    const w = wire[state.screen];
    if (w) w();
    hydratePhotos();
  }

  function boot() {
    const tick = document.getElementById("ticker");
    if (tick) tick.textContent = TICKER + TICKER;
    const headerHome = document.getElementById("header-home");
    if (headerHome) {
      headerHome.addEventListener("click", (e) => {
        e.preventDefault();
        state.screen = "home";
        render();
      });
    }
    wireLightboxOnce();
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    }
    render();
  }

  // exports for tests
  window.ChaloYaar = {
    state,
    render,
    esc,
    filterByMode,
    filterByBudget,
    mapsLink,
    transitMapsLink,
    shareText,
    parseRoutes,
    fillRouteDefaults,
    stripFences,
    discoverGeminiModels,
    callGemini,
    callAI,
    friendlyAiError,
    weatherVerdict,
    toggleSave,
    isSaved,
    savedIds,
    allRoutes,
    routeById,
    modeMeta,
    persistAiRoute,
    LS,
    BUDGETS,
    MODES,
    openRoute,
    cookTrips,
    boot,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
