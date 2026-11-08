const { redis } = require("../lib/redis");
const { isCorrect, correctAnswer } = require("../lib/grade");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST." });
  }

  const body = req.body || {};
  const id = String(body.id || "").replace(/[^A-Za-z0-9_-]/g, "");
  const raw = await redis("GET", "quiz:" + id);
  if (!raw) return res.status(404).json({ error: "Quiz not found." });

  const quiz = JSON.parse(raw);
  const q = quiz.qs[Number(body.qi)];
  if (!q) return res.status(400).json({ error: "Question not found." });

  res.status(200).json({
    correct: isCorrect(q, body.choice),
    answer: correctAnswer(q),
  });
};
