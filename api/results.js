const crypto = require("crypto");
const { redis } = require("../lib/redis");

module.exports = async (req, res) => {
  const id = String(req.query.id || "").replace(/[^A-Za-z0-9_-]/g, "");
  const key = String(req.query.key || "");
  if (!id || !key) return res.status(400).json({ error: "Missing id or key." });

  const raw = await redis("GET", "quiz:" + id);
  if (!raw) return res.status(404).json({ error: "Quiz not found." });

  const quiz = JSON.parse(raw);
  const given = crypto.createHash("sha256").update(key).digest();
  const expected = Buffer.from(quiz.keyHash || "", "hex");
  if (
    expected.length !== given.length ||
    !crypto.timingSafeEqual(given, expected)
  ) {
    return res.status(403).json({ error: "This results link is not valid." });
  }

  const list = (await redis("LRANGE", "attempts:" + id, "0", "199")) || [];
  const attempts = list.map((s) => JSON.parse(s));

  res.status(200).json({ n: quiz.n, qs: quiz.qs, attempts });
};
