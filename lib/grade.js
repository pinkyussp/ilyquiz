// Shared answer checking for multiple choice and write-your-answer questions.

// Lowercase, strip accents and punctuation, collapse spaces.
// So "  New York City! " matches "new york city".
function norm(s) {
  return String(s == null ? "" : s)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

// q: { t: "mc", opts, ans } or { t: "text", accepted: [...] }
// choice: an option index for mc, or the typed string for text
function isCorrect(q, choice) {
  if (q.t === "text") {
    const typed = norm(choice);
    return typed !== "" && (q.accepted || []).some((a) => norm(a) === typed);
  }
  return Number(choice) === q.ans;
}

// The answer to reveal after a wrong pick.
function correctAnswer(q) {
  if (q.t === "text") return (q.accepted || [])[0] || "";
  return q.ans;
}

module.exports = { norm, isCorrect, correctAnswer };
