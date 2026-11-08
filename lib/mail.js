// Sends email through Resend (https://resend.com).
// Needs two environment variables on Vercel:
//   RESEND_API_KEY  your Resend API key
//   MAIL_FROM       a sender from a domain you verified in Resend,
//                   e.g. "How well do you know me? <hello@yourdomain.com>"

function escapeHtml(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendEmail({ to, subject, html }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;
  if (!key || !from) {
    console.warn("Email not sent: RESEND_API_KEY or MAIL_FROM is missing.");
    return false;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });
  if (!res.ok) {
    console.warn("Email failed:", res.status, await res.text());
    return false;
  }
  return true;
}

module.exports = { sendEmail, escapeHtml };
