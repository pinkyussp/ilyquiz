const { redis } = require("../lib/redis");

module.exports = async (req, res) => {
  const id = String(req.query.id || "").replace(/[^A-Za-z0-9_-]/g, "");
  if (!id) return res.status(400).json({ error: "Missing quiz id." });

  const raw = await redis("GET", "quiz:" + id);
  if (!raw) return res.status(404).json({ error: "Quiz not found." });

  const quiz = JSON.parse(raw);
  res.status(200).json({
    n: quiz.n,
    qs: quiz.qs.map((q) => ({ q: q.q, opts: q.opts })),
  });
};
