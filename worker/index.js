import { newsFromCache, refreshNewsCache } from "./news.js";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BEEHIIV = "https://vibeverdict.beehiiv.com";
const BROWSER = {
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "accept-language": "en-US,en;q=0.9",
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function cookieHeader(response) {
  const cookies = typeof response.headers.getSetCookie === "function"
    ? response.headers.getSetCookie()
    : [];
  return cookies.map((cookie) => cookie.split(";")[0]).filter(Boolean).join("; ");
}

function toastMessage(data) {
  const toast = data && typeof data === "object" ? data.toast : null;
  if (!toast || typeof toast !== "object") return "";
  if (typeof toast.message === "string") return toast.message;
  if (typeof toast.title === "string") return toast.title;
  return "";
}

function toastIsError(data) {
  const toast = data && typeof data === "object" ? data.toast : null;
  if (!toast || typeof toast !== "object") return false;
  const kind = String(toast.status || toast.type || toast.variant || "").toLowerCase();
  return kind === "error" || kind === "danger" || kind === "alert";
}

async function subscribe(email) {
  const csrfResponse = await fetch(`${BEEHIIV}/csrf_token`, {
    headers: { ...BROWSER, accept: "application/json" },
  });
  if (!csrfResponse.ok) {
    return { ok: false, status: 502, error: "Beehiiv did not accept the signup. Use the Beehiiv link below." };
  }
  const csrfBody = await csrfResponse.json().catch(() => null);
  const csrf = csrfBody && typeof csrfBody.csrf === "string" ? csrfBody.csrf : "";
  if (!csrf) {
    return { ok: false, status: 502, error: "Beehiiv did not accept the signup. Use the Beehiiv link below." };
  }

  const payload = new URLSearchParams({
    email,
    sent_from_orchid: "true",
    double_opt: "false",
    signup_flow_id: "",
    automation_ids: "",
    auto_login_enabled: "true",
    subscribe_success_message: "Subscribed!",
    subscribe_error_message: "Oops, something went wrong.",
    nectar_signup_url: "https://vibeverdict.ai/",
  });

  const created = await fetch(`${BEEHIIV}/create`, {
    method: "POST",
    headers: {
      ...BROWSER,
      accept: "application/json",
      "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
      "x-csrf-token": csrf,
      cookie: cookieHeader(csrfResponse),
      origin: BEEHIIV,
      referer: `${BEEHIIV}/`,
    },
    body: payload,
  });

  const raw = await created.text();
  let data = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = null;
  }

  if (created.status === 403 || /just a moment|access to this page has been denied/i.test(raw)) {
    return { ok: false, status: 502, error: "Beehiiv did not accept the signup. Use the Beehiiv link below." };
  }

  const message = toastMessage(data);
  if (created.ok && data && !toastIsError(data)) {
    return { ok: true, status: 200, message: message || "You're subscribed." };
  }

  return {
    ok: false,
    status: created.status >= 400 && created.status < 500 ? 400 : 502,
    error: message || "Beehiiv did not accept that email. Check it and try again, or use the Beehiiv link below.",
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/news" || url.pathname === "/api/headlines" || url.pathname === "/api/ai-news" || url.pathname === "/api/ai-news-media" || url.pathname === "/api/ai-news-covers") {
      if (request.method !== "GET") return json({ ok: false, error: "Use GET." }, 405);
      try {
        return await newsFromCache();
      } catch {
        return json({ ok: false, updatedAt: new Date().toISOString(), refreshMinutes: 30, items: [] }, 200);
      }
    }
    if (url.pathname !== "/api/subscribe") {
      return env.ASSETS.fetch(request);
    }
    if (request.method !== "POST") {
      return json({ ok: false, error: "Use POST." }, 405);
    }

    let email = "";
    const type = request.headers.get("content-type") || "";
    try {
      if (type.includes("application/json")) {
        const body = await request.json();
        email = String(body?.email || "");
      } else {
        const body = await request.formData();
        email = String(body.get("email") || "");
      }
    } catch {
      return json({ ok: false, error: "Enter a valid email address." }, 400);
    }

    email = email.trim();
    if (!EMAIL.test(email) || email.length > 254) {
      return json({ ok: false, error: "Enter a valid email address." }, 400);
    }

    try {
      const result = await subscribe(email);
      return json(
        result.ok ? { ok: true, message: result.message } : { ok: false, error: result.error },
        result.status,
      );
    } catch {
      return json({ ok: false, error: "Beehiiv did not accept the signup. Use the Beehiiv link below." }, 502);
    }
  },
  async scheduled(_event, _env, ctx) {
    ctx.waitUntil(refreshNewsCache());
  },
};
