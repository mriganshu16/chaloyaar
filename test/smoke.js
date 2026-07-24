/**
 * ChaloYaar jsdom smoke test — boots real HTML+JS with mocked fetch/geolocation
 * and clicks through every critical flow.
 */
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const root = path.join(__dirname, "..");
let passed = 0;
let failed = 0;

function assert(cond, msg) {
  if (cond) {
    passed++;
    console.log("  ✓", msg);
  } else {
    failed++;
    console.error("  ✗", msg);
  }
}

function section(title) {
  console.log("\n== " + title + " ==");
}

async function main() {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const dataJs = fs.readFileSync(path.join(root, "data.js"), "utf8");
  const appJs = fs.readFileSync(path.join(root, "app.js"), "utf8");

  // Inline scripts so jsdom doesn't need network for local files
  const inlined = html
    .replace('<script src="data.js"></script>', `<script>${dataJs}</script>`)
    .replace('<script src="app.js"></script>', `<script>${appJs}</script>`)
    .replace(/<link rel="preconnect"[^>]*>/g, "")
    .replace(/<link href="https:\/\/fonts\.googleapis\.com[^>]*>/g, "");

  const store = new Map();
  const localStorageMock = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(String(k), String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
    key: (i) => [...store.keys()][i] || null,
    get length() {
      return store.size;
    },
  };

  const geminiCalls = { models: 0, generate: [] };
  const winnerOrder = [];

  const fetchMock = async (url, opts = {}) => {
    const u = String(url);

    if (u.includes("generativelanguage.googleapis.com") && u.includes("/models?") && !u.includes("generateContent")) {
      geminiCalls.models++;
      return {
        ok: true,
        status: 200,
        json: async () => ({
          models: [
            {
              name: "models/gemini-gated-flash",
              supportedGenerationMethods: ["generateContent"],
            },
            {
              name: "models/gemini-2.0-flash",
              supportedGenerationMethods: ["generateContent"],
            },
            {
              name: "models/text-embedding-004",
              supportedGenerationMethods: ["embedContent"],
            },
            {
              name: "models/gemini-2.5-flash",
              supportedGenerationMethods: ["generateContent"],
            },
          ],
        }),
      };
    }

    if (u.includes("generateContent")) {
      const model = decodeURIComponent(u.split("/models/")[1].split(":")[0]);
      geminiCalls.generate.push(model);
      if (model.includes("gated") || model.includes("2.5-flash")) {
        // simulate limit:0 / unavailable on preferred model first pass
        if (!winnerOrder.includes("fail:" + model)) {
          winnerOrder.push("fail:" + model);
          return {
            ok: false,
            status: 429,
            json: async () => ({
              error: { message: "Resource exhausted: limit: 0 for this model" },
            }),
          };
        }
      }
      winnerOrder.push("ok:" + model);
      const sample = [
        {
          id: "ai-test-falls",
          name: "Secret Falls Hop",
          tagline: "ai said splash, you said bet",
          budget: "half",
          modes: ["bike", "car", "public"],
          distance_km: 90,
          ride_time: "~4 hrs",
          best_time: "morning",
          cost: "~₹300",
          vibe: ["water"],
          why: "because water hits different.",
          facts: ["f1", "f2", "f3"],
          stops: [{ km: 40, name: "Tea", note: "chai" }],
          flags: ["wet rocks"],
          mode_tips: { bike: ["slow"], car: ["park"], public: ["bus"] },
          season: { best: "winter", avoid: "floods" },
          transit: "bus then walk",
          origin: "Bengaluru",
          dest: "Somewhere Falls",
          destq: "Somewhere%20Falls",
          dlat: 12.9,
          dlng: 77.5,
          waypoints: [],
        },
      ];
      return {
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: JSON.stringify(sample) }] } }],
        }),
      };
    }

    if (u.includes("open-meteo.com")) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          current: {
            temperature_2m: 28,
            apparent_temperature: 30,
            wind_speed_10m: 10,
            weather_code: 1,
          },
          daily: { precipitation_probability_max: [20, 30] },
        }),
      };
    }

    if (u.includes("nominatim")) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          address: { city: "Bengaluru", state: "Karnataka" },
        }),
      };
    }

    return { ok: true, status: 200, json: async () => ({}), text: async () => "" };
  };

  const dom = new JSDOM(inlined, {
    url: "http://127.0.0.1/chaloyaar/index.html",
    runScripts: "dangerously",
    resources: "usable",
    beforeParse(window) {
      window.fetch = fetchMock;
      Object.defineProperty(window, "localStorage", { value: localStorageMock, configurable: true });
      window.navigator.geolocation = {
        getCurrentPosition(success) {
          success({ coords: { latitude: 12.97, longitude: 77.59 } });
        },
      };
      // jsdom may not fire DOMContentLoaded the same way after parse — call boot later
      window.__CHALO_TEST__ = true;
    },
  });

  const { window } = dom;
  const { document } = window;

  // Wait a tick for IIFE
  await new Promise((r) => setTimeout(r, 50));
  const CY = window.ChaloYaar;
  assert(!!CY, "ChaloYaar exported");
  if (!CY) {
    console.error("abort — app did not boot");
    process.exit(1);
  }
  CY.boot();

  // Force 380px phone viewport feel
  Object.defineProperty(window, "innerWidth", { value: 380, configurable: true });

  section("first-run mode + flexible default");
  assert(CY.state.mode === "flexible", "default mode is flexible");
  assert(CY.state.modeAsked === false, "first-run mode not asked yet");
  const viewText = () => document.getElementById("view").textContent;
  assert(viewText().includes("How do you usually move"), "first-run mode card visible");
  assert(viewText().toLowerCase().includes("how do you"), "mode question copy");

  section("one-tap time card → results");
  const quick = document.querySelector('[data-budget="quick"]');
  assert(!!quick, "quick budget card exists");
  quick.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  assert(CY.state.screen === "results", "tapping budget navigates to results immediately");
  assert(document.body.textContent.includes("trip"), "results show trip count line");
  assert(document.querySelectorAll("[data-route]").length >= 1, "at least one route card");

  section("mode switcher re-renders in place");
  const before = document.querySelectorAll("[data-route]").length;
  const bikeChip = document.querySelector('[data-mode="bike"]');
  bikeChip.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  assert(CY.state.mode === "bike", "mode switched to bike");
  assert(CY.state.screen === "results", "still on results after mode switch");
  assert(document.querySelectorAll("[data-route]").length >= 1, "routes still shown for bike");
  void before;

  section("per-mode page reordering");
  // Open a route that has all modes — mysuru-day
  CY.state.mode = "public";
  CY.openRoute("mysuru-day");
  let htmlRoute = document.getElementById("view").innerHTML;
  const transitIdx = htmlRoute.indexOf("getting there by bus/train");
  const pitsIdx = htmlRoute.indexOf("the pit stops");
  assert(transitIdx >= 0 && pitsIdx >= 0 && transitIdx < pitsIdx, "public: transit ABOVE pit stops");

  CY.state.mode = "bike";
  CY.render();
  htmlRoute = document.getElementById("view").innerHTML;
  const pitsBike = htmlRoute.indexOf("the pit stops");
  const flagsBike = htmlRoute.indexOf("red flags");
  const transitBike = htmlRoute.indexOf("getting there by bus/train");
  assert(pitsBike < flagsBike && flagsBike < transitBike, "bike: pit stops → flags → transit last");
  assert(!htmlRoute.includes("driver notes"), "driver notes hidden from bikers");
  assert(htmlRoute.includes("rider notes"), "rider notes shown for bike");

  CY.state.mode = "flexible";
  CY.render();
  htmlRoute = document.getElementById("view").innerHTML;
  assert(htmlRoute.includes("if you ride"), "flexible shows bike tips");
  assert(htmlRoute.includes("if you drive"), "flexible shows car tips");
  assert(htmlRoute.includes("if you bus it"), "flexible shows public tips");

  // bike-only routes appear for flexible
  const flexiblePool = CY.filterByMode(CY.allRoutes(), "flexible");
  const bikeOnly = window.CHALO_ROUTES.filter(
    (r) => r.modes.includes("bike") && !r.modes.includes("public")
  );
  assert(
    bikeOnly.every((r) => flexiblePool.some((x) => x.id === r.id)),
    "flexible includes bike-only routes"
  );

  // maps travelmode=transit for public
  CY.state.mode = "public";
  const maps = CY.mapsLink(CY.routeById("mysuru-day"), "public");
  assert(maps.includes("travelmode=transit"), "public maps link uses transit");
  const mapsBike = CY.mapsLink(CY.routeById("mysuru-day"), "bike");
  assert(mapsBike.includes("travelmode=driving"), "bike maps link uses driving");

  section("save / share / maps integrity");
  CY.state.mode = "bike";
  CY.openRoute("nandi-hills-sunrise");
  const saveBtn = document.getElementById("btn-save");
  saveBtn.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  assert(CY.isSaved("nandi-hills-sunrise"), "route saved");
  const share = CY.shareText(CY.routeById("nandi-hills-sunrise"), "bike");
  assert(share.includes("Nandi Hills"), "share text has name");
  assert(share.includes("google.com/maps"), "share text has gmaps");
  assert(share.includes("ChaloYaar") || share.includes("chaloyaar"), "share text has app link");
  assert(/https:\/\/\S+\?trip=/.test(share), "share text has https trip deep link");
  assert(!share.includes("Pit stops"), "share text stays short");
  assert(!/cost|₹/i.test(share.split("Maps")[0]), "share text omits cost");
  const mapsBtn = document.getElementById("btn-maps");
  assert(mapsBtn && mapsBtn.getAttribute("href").includes("google.com/maps"), "maps button href ok");

  section("prompt persistence across navigation");
  CY.state.screen = "ai";
  CY.render();
  const ta = document.getElementById("ai-prompt");
  ta.value = "quiet lakes + dosa stops";
  ta.dispatchEvent(new window.Event("input", { bubbles: true }));
  assert(window.localStorage.getItem(CY.LS.aiPrompt) === "quiet lakes + dosa stops", "prompt saved on input");
  CY.state.screen = "home";
  CY.render();
  CY.state.screen = "ai";
  CY.render();
  const ta2 = document.getElementById("ai-prompt");
  assert(ta2.value === "quiet lakes + dosa stops", "prompt prefilled after navigation");

  const chip = document.querySelector('[data-add="waterfalls"]');
  chip.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  assert(
    window.localStorage.getItem(CY.LS.aiPrompt).includes("waterfalls"),
    "quick-add chip appends"
  );
  assert(
    window.localStorage.getItem(CY.LS.aiPrompt).includes("quiet lakes"),
    "quick-add does not replace prompt"
  );

  section("Gemini fallback chain");
  store.delete(CY.LS.geminiModels);
  store.delete(CY.LS.geminiWinner);
  window.localStorage.setItem(CY.LS.keys.gemini, "AIza-test-key");
  window.localStorage.setItem(CY.LS.provider, "gemini");

  // First discovery + generate with fallback
  const text1 = await CY.callGemini("AIza-test-key", "make trips");
  assert(!!text1 && text1.includes("Secret Falls"), "fallback model returned content");
  assert(geminiCalls.generate.length >= 2, "tried gated/preferred then next model");
  const winner = window.localStorage.getItem(CY.LS.geminiWinner);
  assert(!!winner && !winner.includes("gated"), "winner cached and is usable model");

  // Next call should put winner first
  geminiCalls.generate = [];
  await CY.callGemini("AIza-test-key", "make trips again");
  assert(
    geminiCalls.generate[0] === winner,
    "cached winner tried first on subsequent call"
  );

  section("esc() XSS");
  assert(CY.esc('<img src=x onerror=alert(1)>') === "&lt;img src=x onerror=alert(1)&gt;", "esc escapes HTML");

  section("first-run mode choose hides forever");
  store.clear();
  CY.state.mode = "flexible";
  CY.state.modeAsked = false;
  CY.state.screen = "home";
  CY.render();
  const car = document.querySelector('[data-mode="car"]');
  car.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  assert(CY.state.modeAsked === true, "mode asked flagged");
  assert(window.localStorage.getItem(CY.LS.modeAsked) === "1", "mode asked persisted");
  CY.state.screen = "home";
  CY.render();
  assert(!viewText().includes("How do you usually move"), "first-run card hidden after choose");

  section("weather verdict helper");
  assert(CY.weatherVerdict({ rainProb: 80, code: 1 }).includes("heavy rain"), "heavy rain verdict");
  assert(CY.weatherVerdict({ rainProb: 10, wind: 5, temp: 28 }).includes("clear enough"), "clear verdict");

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
