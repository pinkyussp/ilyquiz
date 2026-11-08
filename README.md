# ♡ how well do you know me?

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=soft&color=F8DCE8&height=140&section=header&text=how%20well%20do%20you%20know%20me%3F&fontSize=27&fontColor=8E6478&animation=fadeIn" width="100%" />
</p>

<p align="center">
  a little quiz to find out how well you really know your favorite person.
  <br/>
  made for couples, crushes, and people who think they know everything about each other ♡
</p>

<p align="center">
  <img src="https://img.shields.io/badge/made%20with%20love%20by-amy-f3c6d8?style=flat-square" />
</p>

---

## ୨୧ about

Ever wondered how well your girlfriend, boyfriend, or best friend actually knows you?

This little website lets you put that to the test! Write questions about yourself, send them the link, and see if your favorite person can guess the right answers.

## ♡ features

- ୨୧ A fun, personal quiz experience
- ♡ Multiple choice questions, or let them write the answer
- ୨୧ Matching ignores capitals, spaces and punctuation, so "NYC" and "nyc!" both count
- ♡ Add extra answers that count, like a nickname or a second spelling
- ୨୧ See every attempt on your private results page
- ♡ A "Most missed" summary shows which questions people struggled with most
- ୨୧ Cute, cozy website aesthetic
- ♡ Perfect for couples and long-distance relationships

## 🎀 preview

<p align="center">
  <i>your relationship, but make it a little quiz.</i>
  <br/><br/>
  ♡ what's my comfort food?
  <br/>
  ♡ where did we first meet?
  <br/>
  ♡ what's my love language?
  <br/><br/>
  <code>let's see how well you know me...</code>
</p>

## ୨୧ made with

- HTML, CSS and JavaScript on the front end
- Vercel serverless functions on the back end
- Redis (Upstash or Vercel KV) for storing quizzes and scores

## ♡ how it works

1. **Make a quiz.** Enter your name, add questions, and pick multiple choice or write-your-answer for each one.
2. **Get two links.** Send the share link to your person. Keep the results link private, since it's the only way to see scores.
3. **They take it.** They answer one question at a time and get instant feedback.
4. **Check the results.** Open your results link to see each attempt and the "Most missed" summary.

## ♡ getting started

1. Clone this repository.

   ```bash
   git clone https://github.com/pinkyussp/ilyquiz.git
   ```

2. Deploy it to [Vercel](https://vercel.com).
3. Connect a Redis database (Upstash or Vercel KV) and set one of these pairs of environment variables:
   - `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
   - `KV_REST_API_URL` and `KV_REST_API_TOKEN`
4. Open the site and make your first quiz!

## ୨୧ project layout

```
index.html        the quiz builder, quiz page and results page
api/              serverless functions (create, quiz, answer, submit, results)
lib/              shared helpers (Redis connection, answer checking)
socials/          the socials page
vercel.json       URL rewrites and redirects
```

## 🎀 made with love

<p align="center">
  <img src="https://media.giphy.com/media/MDJ9IbxxvDUQM/giphy.gif" width="100" />
  <br/>
  <sub>a tiny project for the people who mean the most ♡</sub>
  <br/><br/>
  <a href="https://github.com/pinkyussp">made by amy</a>
</p>
