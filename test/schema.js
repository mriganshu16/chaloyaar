/* Validate curated route schema + unique ids + manifest JSON. */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const dataSrc = fs.readFileSync(path.join(root, "data.js"), "utf8");
const sandbox = { window: {} };
vm.runInNewContext(dataSrc, sandbox);
const routes = sandbox.window.CHALO_ROUTES;

const required = [
  "id", "name", "tagline", "budget", "modes", "distance_km", "ride_time",
  "best_time", "cost", "vibe", "why", "facts", "stops", "flags", "mode_tips",
  "season", "transit", "origin", "dest", "destq", "dlat", "dlng", "waypoints",
];

const budgets = new Set(["quick", "half", "full", "weekend", "long"]);
const ids = new Set();
let errors = 0;

function fail(msg) {
  console.error("FAIL:", msg);
  errors++;
}

if (!Array.isArray(routes) || routes.length !== 13) {
  fail(`expected 13 curated routes, got ${routes && routes.length}`);
}

for (const r of routes) {
  for (const k of required) {
    if (r[k] === undefined || r[k] === null) fail(`${r.id || "?"}: missing ${k}`);
  }
  if (ids.has(r.id)) fail(`duplicate id ${r.id}`);
  ids.add(r.id);
  if (!budgets.has(r.budget)) fail(`${r.id}: bad budget ${r.budget}`);
  if (!Array.isArray(r.modes) || !r.modes.length) fail(`${r.id}: modes`);
  if (!r.mode_tips || !Array.isArray(r.mode_tips.bike) || !Array.isArray(r.mode_tips.car) || !Array.isArray(r.mode_tips.public)) {
    fail(`${r.id}: mode_tips incomplete`);
  }
  if (!r.season || r.season.best == null || r.season.avoid == null) fail(`${r.id}: season`);
  if (!Array.isArray(r.facts) || r.facts.length < 3) fail(`${r.id}: need 3–4 facts`);
  if (!Array.isArray(r.flags) || r.flags.length < 3) fail(`${r.id}: need 3–4 flags`);
  if (typeof r.distance_km !== "number") fail(`${r.id}: distance_km`);
  if (typeof r.dlat !== "number" || typeof r.dlng !== "number") fail(`${r.id}: coords`);
}

const expected = [
  "nandi-hills-sunrise", "big-banyan-manchanabele", "ramanagara-sholay-rocks",
  "skandagiri-night-trek", "savandurga-loop", "kanakapura-mekedatu", "lepakshi",
  "shivanasamudra-talakadu", "mysuru-day", "chikmagalur-weekend", "coorg-weekend",
  "hampi-long", "wayanad-long",
];
for (const id of expected) {
  if (!ids.has(id)) fail(`missing seed route ${id}`);
}

const deadly = routes.filter((r) =>
  /drown|Bandipur|night closure|monolith.*rain|rain.*monolith|lethal|swept/i.test(
    (r.flags || []).join(" ")
  )
);
if (deadly.length < 3) fail("expected serious safety flags on Mekedatu/Shivanasamudra/Bandipur/monolith routes");

const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.webmanifest"), "utf8"));
if (manifest.name !== "ChaloYaar") fail("manifest name");
if (!manifest.icons || manifest.icons.length < 2) fail("manifest icons");
if (!manifest.start_url) fail("manifest start_url");

if (errors) {
  console.error(`\n${errors} schema error(s)`);
  process.exit(1);
}
console.log(`OK — ${routes.length} routes, unique ids, manifest valid`);
