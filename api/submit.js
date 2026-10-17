const { redis } = require("../lib/redis");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST." });
  }

  const body = req.body || {};
  const id = String(body.id || "").replace(/[^A-Za-z0-9_-]/g, "");
  const raw = await redis("GET", "quiz:" + id);
  if (!raw) return res.status(404).json({ error: "Quiz not found." });

  const quiz = JSON.parse(raw);
  const picks = Array.isArray(body.answers) ? body.answers : [];
  const name = String(body.name || "")
    .trim()
    .slice(0, 40);

  const missed = [];
  quiz.qs.forEach((q, qi) => {
    if (Number(picks[qi]) !== q.ans) missed.push(qi);
  });
  const total = quiz.qs.length;
  const score = total - missed.length;

  const attempt = { name, score, total, missed, at: Date.now() };
  await redis("LPUSH", "attempts:" + id, JSON.stringify(attempt));
  await redis("LTRIM", "attempts:" + id, "0", "199");

  res.status(200).json({ score, total });
};
