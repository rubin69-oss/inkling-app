# Inkling

An AI app that reads a book, casts its characters, and generates an original
portrait of each one — built for an English-speaking audience, inspired by
bookvision.ru.

This is a **real, working Next.js app** with two live API integrations:

- **Anthropic API** — reads the book and identifies characters (text only)
- **OpenAI's image API (`gpt-image-1`)** — generates an actual portrait image
  for each character, on demand

Nothing is faked or mocked. When you run this with real API keys, it makes
real calls and returns real, freshly-generated images every time.

---

## 1. Run it locally (5 minutes)

You'll need [Node.js 18+](https://nodejs.org) installed.

```bash
cd inkling-app
npm install
cp .env.example .env.local
```

Open `.env.local` and paste in:
- `ANTHROPIC_API_KEY` — from https://console.anthropic.com/settings/keys
- `OPENAI_API_KEY` — from https://platform.openai.com/api-keys (image
  generation is billed per image, roughly $0.02–$0.19 depending on quality
  and size — check OpenAI's current pricing page before launch)

Then:

```bash
npm run dev
```

Open http://localhost:3000 — search a book, watch it work.

**Never commit `.env.local` or paste your real keys into a chat with anyone,
including me.** The `.gitignore` already excludes it.

---

## 2. Put it live on the web (before touching iOS)

The easiest path is [Vercel](https://vercel.com) (made by the creators of
Next.js, free tier is enough to start):

1. Push this folder to a GitHub repo
2. Import the repo at vercel.com → "New Project"
3. In Vercel's project settings → Environment Variables, add
   `ANTHROPIC_API_KEY` and `OPENAI_API_KEY` (same values as your `.env.local`)
4. Deploy — you'll get a real URL like `inkling.vercel.app`

At that point you have a **real, live, working product** people can use in
a browser, including on an iPhone (it's responsive). Many successful "app
store apps" actually start exactly here and add native wrapping later once
there's real usage to justify it.

---

## 3. The path to Kindle Fire / Amazon Appstore (already scaffolded)

**Important distinction first:** regular Kindle e-readers (Paperwhite, Basic,
Oasis) have e-ink screens and can't run apps at all — nothing installs on
those. **Kindle Fire tablets** are Amazon's Android tablets, and they *can*
run apps, distributed through the **Amazon Appstore**. That's the real
target here, and it's a much lower barrier than Apple's App Store:

- Free developer registration (no $99/year)
- No Mac required — build on Windows, Mac, or Linux
- Supports in-app purchases if you want to charge
- The same build also submits to the **Google Play Store**, so you cover
  Kindle Fire tablets *and* regular Android phones from one project

This repo already has the native Android project scaffolded in `android/`
via [Capacitor](https://capacitorjs.com/), which wraps your deployed web
app in a native shell. Your API keys never touch the app itself — they stay
on your server (Vercel), exactly as set up in step 2.

**Steps to actually build and submit it:**

1. **Deploy the web app first** (step 2 above) and get your live URL, e.g.
   `https://inkling.vercel.app`
2. Open `capacitor.config.js` and replace the placeholder `server.url` with
   your real deployed URL
3. Re-sync the native project:
   ```bash
   npx cap sync android
   ```
4. Install [Android Studio](https://developer.android.com/studio) (free),
   then open the project:
   ```bash
   npx cap open android
   ```
5. In Android Studio: **Build → Generate Signed Bundle / APK**. This is
   where you create your app signing key — save it somewhere safe, you'll
   need the same one for every future update.
6. Create a free account at the
   [Amazon Apps & Games Developer Portal](https://developer.amazon.com/apps-and-games)
   and submit the `.aab`/`.apk` file, along with screenshots, an icon, a
   short and long description, a content rating, and a privacy policy URL
   (required, since the app calls two AI APIs — say so plainly)
7. If you want to charge, set up **Amazon In-App Purchasing (IAP)** in the
   same developer console before submitting
8. Optionally repeat the submission on the **Google Play Console**
   ($25 one-time fee) using the same `.aab` — same build, wider reach

**What I genuinely can't do:** compile the actual `.apk` file myself — that
needs the Android SDK/Gradle toolchain running on your machine (or in
Android Studio), which isn't available in this chat environment. Everything
up to that point — the real web app, the real API integrations, and the
native Android project structure — is done and sitting in this download.

If you want hands-on help actually running Android Studio, signing the
build, and walking through Amazon's submission form, that's a great fit for
**Claude Code** — it can work alongside you on your own machine where the
Android tooling actually lives.

---

## 4. Before you charge real people money, think about:

- **Cost controls**: right now, anyone can hit "Reveal characters" and
  generate images on your API bill. Before launch you'll want rate limiting
  and/or requiring an account, or costs can run away from you.
- **Content moderation**: image generation APIs have their own safety
  filters, but you're still responsible for how the app is used — consider
  what happens if someone types a real, living person's name into the
  "book" or "character" field.
- **Copyright**: the character *descriptions* and generated *images* are
  original AI interpretations, not reproductions of any illustrator's or
  film adaptation's artwork — keep it that way. Stick to actual literary
  descriptions from the text, not "make them look like [actor] from the
  movie."

---

## Project structure

```
app/
  page.jsx               — the main UI (client component)
  layout.jsx             — fonts + metadata
  globals.css            — design system
  api/
    characters/route.js  — calls Anthropic to identify characters
    portrait/route.js    — calls OpenAI to generate the portrait image
android/                 — native Android project (Capacitor), ready to
                            open in Android Studio once you set your
                            deployed URL in capacitor.config.js
capacitor.config.js      — points the native Android shell at your
                            deployed web app
.env.example             — copy to .env.local with your own keys
```
