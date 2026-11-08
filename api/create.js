const crypto = require("crypto");
const { redis } = require("../lib/redis");
const { sendEmail, escapeHtml } = require("../lib/mail");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST." });
  }

  const body = req.body || {};
  const name = String(body.n || "")
    .trim()
    .slice(0, 40);
  const email = String(body.email || "")
    .trim()
    .slice(0, 120);

  const qs = (Array.isArray(body.qs) ? body.qs : [])
    .slice(0, 20)
    .map((q0) => {
      const q = q0 || {};
      const question = String(q.q || "")
        .trim()
        .slice(0, 200);

      // Write-your-answer question.
      if (q.t === "text") {
        // Open question: no right answer, whatever they type is saved.
        const open = q.open === true;
        const accepted = open
          ? []
          : (Array.isArray(q.accepted) ? q.accepted : [])
              .map((a) => String(a).trim().slice(0, 80))
              .filter(Boolean)
              .slice(0, 6);
        return { t: "text", q: question, accepted, open };
      }

      // Multiple choice question (also the default for older clients).
      const opts = (Array.isArray(q.opts) ? q.opts : [])
        .map((o) => String(o).trim().slice(0, 120))
        .filter(Boolean)
        .slice(0, 4);
      let ans = Number(q.ans);
      if (!Number.isInteger(ans) || ans < 0 || ans >= opts.length) ans = 0;
      return { t: "mc", q: question, opts, ans };
    })
    .filter((q) => {
      if (!q.q) return false;
      if (q.t === "text") return q.open || q.accepted.length >= 1;
      return q.opts.length >= 2;
    });

  if (!name || !qs.length) {
    return res.status(400).json({
      error: "Add your name and at least one complete question.",
    });
  }

  // Email is optional. If it's given, it must look like an address.
  if (email && !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "That email address doesn't look right." });
  }

  const id = crypto.randomBytes(5).toString("base64url");
  const key = crypto.randomBytes(12).toString("base64url");
  const keyHash = crypto.createHash("sha256").update(key).digest("hex");
  await redis(
    "SET",
    "quiz:" + id,
    JSON.stringify({ n: name, qs, keyHash, email: email || undefined }),
  );

  // Send the creator their private results link once, so they can find it later.
  if (email) {
    const base = `https://${req.headers.host}`;
    const resultsUrl = `${base}/r/${id}#key=${key}`;
    try {
      await sendEmail({
        to: email,
        subject: `Your quiz for ${name} is ready`,
        html: `
          <p>Your quiz is live.</p>
          <p>Send this link to the person you're quizzing:<br/>
          <a href="${base}/q/${id}">${base}/q/${id}</a></p>
          <p>Keep this private results link. It's the only way to see scores, and we'll send you a message each time someone finishes:<br/>
          <a href="${resultsUrl}">${resultsUrl}</a></p>
        `,
      });
    } catch (err) {
      console.warn("Could not send creator email:", err.message);
    }
  }

  res.status(200).json({ id, key });
};
