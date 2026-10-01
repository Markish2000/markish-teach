import type { APIRoute } from "astro";
import nodemailer from "nodemailer";
import { z } from "zod";

export const prerender = false;

const payloadSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.email().min(1).max(160),
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

const sendViaGmail = async (
  user: string,
  appPassword: string,
  payload: z.infer<typeof payloadSchema>
): Promise<boolean> => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass: appPassword },
  });

  const text = [
    `Nombre: ${payload.name}`,
    `Email: ${payload.email}`,
    `Servicio: ${payload.service}`,
    "",
    payload.message,
  ].join("\n");

  try {
    await transporter.sendMail({
      from: `"Markish Tech Web" <${user}>`,
      to: user,
      replyTo: `"${payload.name.replace(/["\r\n]/g, "")}" <${payload.email}>`,
      subject: `Markish Tech · nuevo contacto — ${payload.name.replace(/[\r\n]/g, " ")}`,
      text,
    });
    return true;
  } catch (error) {
    console.error("[contact] gmail smtp failed:", error);
    return false;
  }
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

  const gmailUser = String(import.meta.env["GMAIL_USER"] ?? "");
  const gmailAppPassword = String(import.meta.env["GMAIL_APP_PASSWORD"] ?? "").replace(/\s+/g, "");

  if (!gmailUser || !gmailAppPassword) {
    console.info("[contact] GMAIL_USER / GMAIL_APP_PASSWORD missing — payload received in dev mode:", parsed.data);
    return jsonResponse(200, { ok: true, mode: "dev" });
  }

  const sent = await sendViaGmail(gmailUser, gmailAppPassword, parsed.data);
  if (!sent) {
    return jsonResponse(502, { error: "send_failed" });
  }
  return jsonResponse(200, { ok: true });
};
