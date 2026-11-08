const crypto = require("crypto");
const { redis } = require("../lib/redis");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST." });
  }

  const body = req.body || {};
  const name = String(body.n || "")
    .trim()
    .slice(0, 40);

  const qs = (Array.isArray(body.qs) ? body.qs : [])
    .slice(0, 20)
    .map((q0) => {
      const q = q0 || {};
      const question = String(q.q || "")
        .trim()
        .slice(0, 200);

      // Write-your-answer question: store the accepted answers only.
      if (q.t === "text") {
        const accepted = (Array.isArray(q.accepted) ? q.accepted : [])
          .map((a) => String(a).trim().slice(0, 80))
          .filter(Boolean)
          .slice(0, 6);
        return { t: "text", q: question, accepted };
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
    .filter((q) =>
      q.t === "text" ? q.q && q.accepted.length >= 1 : q.q && q.opts.length >= 2,
    );

  if (!name || !qs.length) {
    return res.status(400).json({
      error: "Add your name and at least one complete question.",
    });
  }

  const id = crypto.randomBytes(5).toString("base64url");
  const key = crypto.randomBytes(12).toString("base64url");
  const keyHash = crypto.createHash("sha256").update(key).digest("hex");
  await redis("SET", "quiz:" + id, JSON.stringify({ n: name, qs, keyHash }));

  res.status(200).json({ id, key });
};
