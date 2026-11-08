const { redis } = require("../lib/redis");
const { isCorrect } = require("../lib/grade");
const { sendEmail, escapeHtml } = require("../lib/mail");

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

  // Save what people typed on open questions.
  const texts = {};
  quiz.qs.forEach((q, qi) => {
    if (!q.open) return;
    const typed = String(picks[qi] || "").trim().slice(0, 300);
    if (typed) texts[qi] = typed;
  });

  // Only questions with a right answer are scored.
  const graded = quiz.qs
    .map((q, qi) => ({ q, qi }))
    .filter((x) => !x.q.open);
  const missed = graded
    .filter((x) => !isCorrect(x.q, picks[x.qi]))
    .map((x) => x.qi);
  const total = graded.length;
  const score = total - missed.length;

  const attempt = { name, score, total, missed, texts, at: Date.now() };
  await redis("LPUSH", "attempts:" + id, JSON.stringify(attempt));
  await redis("LTRIM", "attempts:" + id, "0", "199");

  // Tell the creator someone finished.
  if (quiz.email) {
    const base = `https://${req.headers.host}`;
    const who = escapeHtml(name || "Someone");

    // Show a score only when there is one.
    const scoreLine = total
      ? `<p>Score: ${score} / ${total}</p>`
      : "";

    // List what they typed on open questions.
    const typedLines = Object.entries(texts)
      .map(
        ([qi, t]) =>
          `<p><strong>${escapeHtml(quiz.qs[Number(qi)].q)}</strong><br/>${escapeHtml(t)}</p>`,
      )
      .join("");

    const headline = total
      ? `<strong>${who}</strong> just finished your quiz.`
      : `<strong>${who}</strong> just answered your question.`;

    try {
      await sendEmail({
        to: quiz.email,
        subject: total
          ? `${name || "Someone"} just took your quiz`
          : `${name || "Someone"} just answered your question`,
        html: `
          <p>${headline}</p>
          ${scoreLine}
          ${typedLines}
          <p>See everyone's answers on your private results page. Open the private link from your first email to see them.</p>
        `,
      });
    } catch (err) {
      console.warn("Could not send finish email:", err.message);
    }
  }

  res.status(200).json({ score, total });
};
