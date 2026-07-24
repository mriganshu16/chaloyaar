/**
 * Hosted Gemini proxy for Hinglish (and other server-side AI).
 * Key lives in Netlify env: GEMINI_API_KEY — never shipped to the browser.
 *
 * POST /api/gemini  { "prompt": "...", "purpose": "hinglish" }
 */
const ALLOWED_PURPOSE = new Set(["hinglish"]);

function cors(status, body) {
  return {
    statusCode: status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Cache-Control": "no-store",
    },
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

async function generate(key, model, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(key)}`;
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
    const err = new Error((j.error && j.error.message) || res.statusText);
    err.status = res.status;
    err.payload = j;
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

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return cors(204);
  if (event.httpMethod !== "POST") return cors(405, { error: "POST only" });

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return cors(503, {
      error: "GEMINI_API_KEY not set. Add it in Netlify → Environment variables.",
    });
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (_) {
    return cors(400, { error: "invalid JSON body" });
  }

  const purpose = String(body.purpose || "");
  const prompt = String(body.prompt || "");

  if (!ALLOWED_PURPOSE.has(purpose)) {
    return cors(400, { error: "unsupported purpose" });
  }
  if (!prompt || prompt.length < 40) {
    return cors(400, { error: "prompt too short" });
  }
  if (prompt.length > 28000) {
    return cors(400, { error: "prompt too long" });
  }
  // Only accept our Hinglish rewrite prompts (blocks free-form abuse a bit)
  if (purpose === "hinglish" && !/Rewrite this ChaloYaar trip copy into casual Hinglish/i.test(prompt)) {
    return cors(400, { error: "prompt rejected" });
  }

  try {
    const models = await listModels(key);
    if (!models.length) return cors(502, { error: "no usable Gemini models on this key" });

    let lastErr = null;
    for (const model of models.slice(0, 8)) {
      try {
        const text = await generate(key, model, prompt);
        return cors(200, { text, model });
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
    return cors(status, { error: msg });
  }
};
