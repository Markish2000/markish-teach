export interface ContactEmailData {
  readonly name: string;
  readonly email: string;
  readonly service: string;
  readonly message: string;
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatDate = (date: Date): string =>
  new Intl.DateTimeFormat("es-AR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(date);

const row = (label: string, value: string): string => `
  <tr>
    <td style="padding:14px 0;border-bottom:1px solid #1c2233;">
      <div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#7a8499;margin-bottom:4px;">${label}</div>
      <div style="font-size:16px;color:#eef1f7;line-height:1.4;">${value}</div>
    </td>
  </tr>`;

export const buildContactEmailHtml = (data: ContactEmailData, date = new Date()): string => {
  const name = escapeHtml(data.name);
  const email = escapeHtml(data.email);
  const service = escapeHtml(data.service);
  const message = escapeHtml(data.message).replace(/\r?\n/g, "<br />");
  const replySubject = encodeURIComponent("Re: tu consulta a Markish Tech");

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="dark light" />
  <title>Nuevo contacto — ${name}</title>
</head>
<body style="margin:0;padding:0;background:#05070c;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${name} · ${service}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#05070c;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
          <tr>
            <td style="padding:0 4px 16px;">
              <span style="font-family:'Courier New',monospace;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#4d8bff;">Markish Tech</span>
            </td>
          </tr>
          <tr>
            <td style="background:#0d111b;border:1px solid #1c2233;border-radius:16px;padding:32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#4d8bff;margin-bottom:10px;">&#9679; Nuevo contacto</div>
                    <div style="font-size:26px;font-weight:600;color:#ffffff;line-height:1.25;margin-bottom:6px;">${name}</div>
                    <div style="font-size:14px;color:#7a8499;margin-bottom:12px;">${formatDate(date)} (ART)</div>
                  </td>
                </tr>
                ${row("Email", `<a href="mailto:${email}" style="color:#6ea2ff;text-decoration:none;">${email}</a>`)}
                ${row("Necesita", service)}
                <tr>
                  <td style="padding:14px 0 4px;">
                    <div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#7a8499;margin-bottom:10px;">Mensaje</div>
                    <div style="background:#080b13;border:1px solid #1c2233;border-left:3px solid #4d8bff;border-radius:10px;padding:16px 18px;font-size:15px;line-height:1.65;color:#d5dae6;">${message}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:26px;">
                    <a href="mailto:${email}?subject=${replySubject}" style="display:inline-block;background:#4d8bff;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:13px 24px;border-radius:999px;">Responder a ${name} &rarr;</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 4px 0;font-size:12px;color:#5a6378;line-height:1.5;">
              Enviado desde el formulario de markishtech.com.ar. Podés responder directamente a este correo.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};
