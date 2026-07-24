/**
 * Hosted Gemini proxy for Hinglish.
 * Key: Netlify env GEMINI_API_KEY — never shipped to the browser.
 *
 * POST /api/gemini  { "prompt": "...", "purpose": "hinglish" }
 */
const ALLOWED_PURPOSE = new Set(["hinglish"]);
const ALLOWED_ORIGINS = new Set([
  "https://chaloyaar.nofilterhq.in",
  "https://www.chaloyaar.nofilterhq.in",
  "https://mriganshu16.github.io",
  "http://localhost:5173",
  "http://localhost:8888",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:8888",
]);

// Best-effort per-instance rate limit (serverless instances don't share memory)
const hits = new Map();
const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX = 12; // per IP per minute per warm instance

function clientIp(event) {
  const xf = event.headers["x-forwarded-for"] || event.headers["X-Forwarded-For"] || "";
  return String(xf).split(",")[0].trim() || event.headers["client-ip"] || "unknown";
}

function rateLimit(ip) {
  const now = Date.now();
  let bucket = hits.get(ip);
  if (!bucket || now - bucket.start > RATE_WINDOW_MS) {
    bucket = { start: now, count: 0 };
    hits.set(ip, bucket);
  }
  bucket.count += 1;
  if (hits.size > 2000) {
    for (const [k, v] of hits) {
      if (now - v.start > RATE_WINDOW_MS) hits.delete(k);
    }
  }
  return bucket.count <= RATE_MAX;
}

function allowOrigin(event) {
  const origin = event.headers.origin || event.headers.Origin || "";
  if (!origin) return ""; // same-origin / non-browser
  if (ALLOWED_ORIGINS.has(origin)) return origin;
  // Netlify deploy previews for this site
  if (/^https:\/\/[a-z0-9-]+--chaloyaar\.netlify\.app$/i.test(origin)) return origin;
  if (/^https:\/\/chaloyaar\.netlify\.app$/i.test(origin)) return origin;
  return null;
}

function cors(status, body, allow) {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Cache-Control": "no-store",
    "Vary": "Origin",
  };
  if (allow) headers["Access-Control-Allow-Origin"] = allow;
  return {
    statusCode: status,
    headers,
    body: body == null ? "" : JSON.stringify(body),
  };
}

function rankModel(name) {
  const prefs = [
    /2\.5.*flash(?!.*lite)/i,
    /flash-lite/i,
    /2\.0.*flash/i,
    /1\.5.*flash/i,
    /flash/i,
    /pro/i,
  ];
  for (let i = 0; i < prefs.length; i++) if (prefs[i].test(name)) return i;
  return prefs.length + 1;
}

async function listModels(key) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`
  );
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
  models.sort((a, b) => rankModel(a) - rankModel(b) || a.localeCompare(b));
  return models;
}

async function generate(key, model, prompt, purpose) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(key)}`;
  const generationConfig = {
    temperature: purpose === "hinglish" ? 0.35 : 0.8,
  };
  if (purpose === "hinglish") {
    generationConfig.responseMimeType = "application/json";
  }
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
    }),
  });
  const j = await res.json();
  if (!res.ok) {
    const err = new Error((j.error && j.error.message) || res.statusText);
    err.status = res.status;
    throw err;
  }
  const text =
    j.candidates &&
    j.candidates[0] &&
    j.candidates[0].content &&
    j.candidates[0].content.parts
      ? j.candidates[0].content.parts.map((p) => p.text || "").join("")
      : "";
  if (!text) throw new Error("empty Gemini response");
  return text;
}

function hinglishPromptOk(prompt) {
  return (
    /Rewrite this ChaloYaar trip copy into casual Hinglish/i.test(prompt) &&
    /Source:\s*\{/i.test(prompt) &&
    /"tagline"\s*:/i.test(prompt) &&
    /"why"\s*:/i.test(prompt)
  );
}

exports.handler = async (event) => {
  const allow = allowOrigin(event);
  if (allow === null) {
    return cors(403, { error: "origin not allowed" }, "");
  }

  if (event.httpMethod === "OPTIONS") return cors(204, null, allow || "*");
  if (event.httpMethod !== "POST") return cors(405, { error: "POST only" }, allow);

  if (!rateLimit(clientIp(event))) {
    return cors(429, { error: "too many requests — slow down" }, allow);
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return cors(503, { error: "GEMINI_API_KEY not configured" }, allow);
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (_) {
    return cors(400, { error: "invalid JSON body" }, allow);
  }

  const purpose = String(body.purpose || "");
  const prompt = String(body.prompt || "");

  if (!ALLOWED_PURPOSE.has(purpose)) {
    return cors(400, { error: "unsupported purpose" }, allow);
  }
  if (!prompt || prompt.length < 80) {
    return cors(400, { error: "prompt too short" }, allow);
  }
  if (prompt.length > 24000) {
    return cors(400, { error: "prompt too long" }, allow);
  }
  if (purpose === "hinglish" && !hinglishPromptOk(prompt)) {
    return cors(400, { error: "prompt rejected" }, allow);
  }

  try {
    const models = await listModels(key);
    if (!models.length) return cors(502, { error: "no usable Gemini models on this key" }, allow);

    let lastErr = null;
    for (const model of models.slice(0, 6)) {
      try {
        const text = await generate(key, model, prompt, purpose);
        return cors(200, { text, model }, allow);
      } catch (e) {
        const msg = (e && e.message) || String(e);
        if (/limit:\s*0|not found|404|429|RESOURCE_EXHAUSTED/i.test(msg) || e.status === 404 || e.status === 429) {
          lastErr = e;
          continue;
        }
        throw e;
      }
    }
    throw lastErr || new Error("all Gemini models failed");
  } catch (e) {
    const msg = (e && e.message) || "Gemini request failed";
    const status = /quota|rate|429|RESOURCE_EXHAUSTED/i.test(msg) ? 429 : 502;
    return cors(status, { error: msg }, allow);
  }
};
