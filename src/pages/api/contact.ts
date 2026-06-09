import type { APIRoute } from "astro";
import { z } from "zod";

export const prerender = false;

const payloadSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.email().min(1).max(160),
  company: z.string().max(160).optional().default(""),
  service: z.string().min(1).max(120),
  message: z.string().min(8).max(4000),
});

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;
const ipHits = new Map<string, ReadonlyArray<number>>();

const isRateLimited = (ip: string): boolean => {
  const now = Date.now();
  const recent = (ipHits.get(ip) ?? []).filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) return true;
  ipHits.set(ip, [...recent, now]);
  return false;
};

const jsonResponse = (status: number, body: Record<string, unknown>): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const sendViaWeb3Forms = async (
  accessKey: string,
  payload: z.infer<typeof payloadSchema>
): Promise<boolean> => {
  const subject = `Markish · nuevo contacto — ${payload.name}`;
  const message = [
    `Servicio: ${payload.service}`,
    `Empresa: ${payload.company || "—"}`,
    "",
    payload.message,
  ].join("\n");

  const response = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      access_key: accessKey,
      subject,
      from_name: payload.name,
      name: payload.name,
      email: payload.email,
      company: payload.company || "—",
      service: payload.service,
      message,
    }),
  });
  if (!response.ok) return false;
  const result = (await response.json().catch(() => null)) as { success?: boolean } | null;
  return result?.success === true;
};

export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (isRateLimited(clientAddress)) {
    return jsonResponse(429, { error: "rate_limited" });
  }
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return jsonResponse(400, { error: "invalid_json" });
  }
  const parsed = payloadSchema.safeParse(raw);
  if (!parsed.success) {
    return jsonResponse(400, { error: "validation", issues: parsed.error.issues });
  }

  const accessKey = import.meta.env["WEB3FORMS_ACCESS_KEY"];

  if (!accessKey || String(accessKey).length === 0) {
    console.info("[contact] WEB3FORMS_ACCESS_KEY missing — payload received in dev mode:", parsed.data);
    return jsonResponse(200, { ok: true, mode: "dev" });
  }

  const sent = await sendViaWeb3Forms(String(accessKey), parsed.data);
  if (!sent) {
    return jsonResponse(502, { error: "send_failed" });
  }
  return jsonResponse(200, { ok: true });
};
