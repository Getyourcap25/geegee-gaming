"use server";

import { Resend } from "resend";
import { formatDateRange } from "@/lib/utils";
import { STATUS_LABELS } from "@/types/app";
import type { RequestStatus } from "@/types/database";

const resend = new Resend(process.env.RESEND_API_KEY);

const ADMIN_EMAIL = "info@geegee-gaming.com";
const FROM_EMAIL = "GeeGee Gaming <no-reply@geegee-gaming.com>";

// ============================================================
// HELPERS
// ============================================================

function baseLayout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#7c3aed;padding:24px 32px;">
              <p style="margin:0;color:#ffffff;font-size:20px;font-weight:bold;">GeeGee Gaming × Incluzio</p>
              <p style="margin:4px 0 0;color:#ddd6fe;font-size:13px;">Delfshaven</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                GeeGee Gaming × Incluzio &mdash; Delfshaven, Rotterdam<br/>
                Dit is een automatisch bericht. Reageer niet op dit e-mailadres.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function infoRow(label: string, value: string): string {
  return `
  <tr>
    <td style="padding:6px 0;color:#6b7280;font-size:13px;width:160px;vertical-align:top;">${label}</td>
    <td style="padding:6px 0;color:#111827;font-size:13px;font-weight:500;">${value}</td>
  </tr>`;
}

// ============================================================
// 1. NIEUWE AANVRAAG — mail naar admin
// ============================================================

export async function sendNewRequestAdminEmail(params: {
  referenceCode: string;
  requestedByName: string;
  requestedByEmail: string;
  requestedByPhone: string | null;
  organization: string | null;
  productName: string;
  quantity: number;
  districtName: string;
  location: string;
  preferredDate: string;
  endDate: string;
  notes: string | null;
}) {
  const {
    referenceCode, requestedByName, requestedByEmail, requestedByPhone,
    organization, productName, quantity, districtName, location,
    preferredDate, endDate, notes,
  } = params;

  const html = baseLayout(`
    <h2 style="margin:0 0 8px;color:#111827;font-size:18px;">Nieuwe aanvraag ontvangen</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">
      Er is een nieuwe aanvraag binnengekomen via het portaal.
    </p>

    <div style="background:#f5f3ff;border-left:4px solid #7c3aed;padding:12px 16px;margin-bottom:24px;border-radius:0 6px 6px 0;">
      <p style="margin:0;color:#7c3aed;font-size:16px;font-weight:bold;">${referenceCode}</p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0">
      ${infoRow("Product", `${productName} (${quantity}×)`)}
      ${infoRow("Wijk", districtName)}
      ${infoRow("Locatie", location)}
      ${infoRow("Periode", formatDateRange(preferredDate, endDate))}
      ${infoRow("Aanvrager", requestedByName)}
      ${infoRow("E-mail", requestedByEmail)}
      ${infoRow("Telefoon", requestedByPhone ?? "—")}
      ${infoRow("Organisatie", organization ?? "—")}
      ${notes ? infoRow("Toelichting", notes) : ""}
    </table>

    <div style="margin-top:28px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://geegee-gaming.vercel.app"}/beheer"
         style="display:inline-block;background:#7c3aed;color:#ffffff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:500;">
        Bekijk in het portaal →
      </a>
    </div>
  `);

  await resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `Nieuwe aanvraag ${referenceCode} — ${productName}`,
    html,
  });
}

// ============================================================
// 2. NIEUWE AANVRAAG — bevestiging naar aanvrager
// ============================================================

export async function sendNewRequestConfirmationEmail(params: {
  referenceCode: string;
  requestedByName: string;
  requestedByEmail: string;
  productName: string;
  quantity: number;
  districtName: string;
  location: string;
  preferredDate: string;
  endDate: string;
}) {
  const {
    referenceCode, requestedByName, requestedByEmail,
    productName, quantity, districtName, location,
    preferredDate, endDate,
  } = params;

  const html = baseLayout(`
    <h2 style="margin:0 0 8px;color:#111827;font-size:18px;">Bedankt voor je aanvraag!</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">
      Beste ${requestedByName},<br/><br/>
      We hebben je aanvraag ontvangen en zullen deze zo snel mogelijk beoordelen.
      Je hoort van ons zodra er een beslissing is genomen.
    </p>

    <div style="background:#f5f3ff;border-left:4px solid #7c3aed;padding:12px 16px;margin-bottom:24px;border-radius:0 6px 6px 0;">
      <p style="margin:0 0 2px;color:#6b7280;font-size:12px;">Jouw referentienummer</p>
      <p style="margin:0;color:#7c3aed;font-size:18px;font-weight:bold;">${referenceCode}</p>
    </div>

    <p style="margin:0 0 12px;color:#374151;font-size:14px;font-weight:500;">Overzicht van je aanvraag:</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${infoRow("Product", `${productName} (${quantity}×)`)}
      ${infoRow("Wijk", districtName)}
      ${infoRow("Locatie", location)}
      ${infoRow("Periode", formatDateRange(preferredDate, endDate))}
    </table>

    <p style="margin:28px 0 0;color:#6b7280;font-size:13px;">
      Vragen? Neem contact op via
      <a href="mailto:${ADMIN_EMAIL}" style="color:#7c3aed;">${ADMIN_EMAIL}</a>
      en vermeld je referentienummer.
    </p>
  `);

  await resend.emails.send({
    from: FROM_EMAIL,
    to: requestedByEmail,
    subject: `Aanvraag ${referenceCode} ontvangen — GeeGee Gaming`,
    html,
  });
}

// ============================================================
// 3. STATUSWIJZIGING — mail naar aanvrager
// ============================================================

const STATUS_MESSAGES: Record<RequestStatus, { title: string; body: string; color: string }> = {
  approved: {
    title: "Je aanvraag is goedgekeurd",
    body: "Goed nieuws! Je aanvraag is goedgekeurd. We nemen contact met je op om de details te bespreken.",
    color: "#2563eb",
  },
  scheduled: {
    title: "Je aanvraag is ingepland",
    body: "Je aanvraag is officieel ingepland. Hieronder vind je de bevestigde gegevens.",
    color: "#7c3aed",
  },
  completed: {
    title: "Je aanvraag is afgerond",
    body: "De activiteit is afgerond. Bedankt voor je samenwerking met GeeGee Gaming × Incluzio!",
    color: "#16a34a",
  },
  cancelled: {
    title: "Je aanvraag is geannuleerd",
    body: "Helaas moeten we je laten weten dat je aanvraag is geannuleerd. Neem contact op als je vragen hebt.",
    color: "#dc2626",
  },
  pending: {
    title: "Je aanvraag is in behandeling",
    body: "Je aanvraag is ontvangen en wordt beoordeeld.",
    color: "#d97706",
  },
};

export async function sendStatusUpdateEmail(params: {
  referenceCode: string;
  requestedByName: string;
  requestedByEmail: string;
  productName: string;
  quantity: number;
  districtName: string;
  preferredDate: string;
  endDate: string;
  newStatus: RequestStatus;
  notes: string | null;
}) {
  const {
    referenceCode, requestedByName, requestedByEmail,
    productName, quantity, districtName,
    preferredDate, endDate, newStatus, notes,
  } = params;

  const msg = STATUS_MESSAGES[newStatus];

  const html = baseLayout(`
    <h2 style="margin:0 0 8px;color:#111827;font-size:18px;">${msg.title}</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">
      Beste ${requestedByName},<br/><br/>
      ${msg.body}
    </p>

    <div style="background:#f9fafb;border-left:4px solid ${msg.color};padding:12px 16px;margin-bottom:24px;border-radius:0 6px 6px 0;">
      <p style="margin:0 0 2px;color:#6b7280;font-size:12px;">Referentienummer</p>
      <p style="margin:0;color:${msg.color};font-size:16px;font-weight:bold;">${referenceCode}</p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0">
      ${infoRow("Status", STATUS_LABELS[newStatus])}
      ${infoRow("Product", `${productName} (${quantity}×)`)}
      ${infoRow("Wijk", districtName)}
      ${infoRow("Periode", formatDateRange(preferredDate, endDate))}
      ${notes ? infoRow("Opmerking", notes) : ""}
    </table>

    <p style="margin:28px 0 0;color:#6b7280;font-size:13px;">
      Vragen? Neem contact op via
      <a href="mailto:${ADMIN_EMAIL}" style="color:#7c3aed;">${ADMIN_EMAIL}</a>
      en vermeld je referentienummer.
    </p>
  `);

  await resend.emails.send({
    from: FROM_EMAIL,
    to: requestedByEmail,
    subject: `${msg.title} — ${referenceCode}`,
    html,
  });
}
