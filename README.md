# Portfolio

The source of [sudhis.netlify.app](https://sudhis.netlify.app): my work, case studies and a way to reach me, in
English, Malayalam and Hindi.

- **React 19 + TypeScript + Vite**, pre-rendered to static HTML at build time, so every page has real content and its
  own link preview before any JavaScript runs.
- **i18next** with `react-i18next`, `i18next-http-backend` and `i18next-browser-languagedetector`. English is bundled;
  Malayalam and Hindi load on demand. The language switches in place, without a reload.
- **Tailwind CSS v4** on a small design system: tokens in `src/design/tokens.css`, components in `src/components/ui`.
- **A contact form that keeps working when the chat server is down.** It saves to the browser first (Dexie / IndexedDB), sends an email copy
  through Netlify Forms, and opens a chat through a Netlify Function when the chat server is awake.

## Run it

Everything runs in Docker with Node 26, so nothing needs installing on the machine.

```bash
docker compose run --rm run npm install      # once
docker compose up dev                        # http://localhost:5173
docker compose run --rm run npm run check    # types, lint, tests, unused code
docker compose run --rm run npm run build    # production build in dist/
docker compose up preview                    # serve dist/ on http://localhost:4173
```

With Node 26 installed locally, the same `npm` scripts work without Docker.

| Script | What it does |
| :--- | :--- |
| `dev` | Vite dev server. Also runs the Netlify Function. Netlify Forms (the email copy) only exists on the deployed site, so locally the message is printed in the terminal and reported as **not sent**; set `LOCAL_FORMS_ACCEPT=1` in `.env.local` to simulate success. |
| `build` | Optimises the portrait (Sharp), builds the client and the server entry, pre-renders every page, checks links. |
| `check` | `tsc`, ESLint (including "no hard-coded text"), Vitest, knip. |

## Layout

```
src/
  design/            tokens, global styles, fonts (self-hosted; Malayalam and Devanagari load only when needed)
  components/ui/     Button, TextField, TextArea, Select, Dialog, Menu, Tooltip, StatusMessage, Table, TagList …
  components/layout/ Header, mobile menu, footer, language switcher, theme toggle, page titles
  features/work/     project facts (projects.ts), work list, case study, diagrams
  features/contact/  contact form, conversation panel, validation
  features/chat-queue/ Dexie outbox, retrying worker, API client, migration of old chat sessions
  i18n/              i18next setup, language list, glossaries for Malayalam and Hindi
  pages/             one file per route
public/locales/      translations: <language>/<namespace>.json
netlify/functions/   chat.ts, the only place that knows the chat API secret
scripts/             pre-render, link check, image optimisation, link-preview images
resume/              resume source (HTML/CSS) and its render script
```

## Common changes

**Add a project.** Add an entry to `src/features/work/projects.ts`, then its text under the same slug in
`public/locales/{en,ml,hi}/projects.json`. Run `scripts/og/render.ps1` for its link-preview image.

**Change any text.** Every visible string lives in `public/locales/<language>/<namespace>.json`. Change all three
languages together: a test fails if their keys or `{{variables}}` drift apart. Use the terms in `src/i18n/glossary/`.

**Link-preview images.** The home page's title and intro, and each project's title and summary, are drawn into the
images in `public/og/`. After changing any of them, run `powershell -ExecutionPolicy Bypass -File scripts\og\render.ps1`
and commit the PNGs. The build adds a hash of each image to its URL (`og/default.png?v=…`), so LinkedIn and other
sites that cache previews pick up a new image on their next look; to force it, re-inspect the page in LinkedIn's Post
Inspector.

**Who the site is about.** The home page carries schema.org `Person` data (`src/seo/person.ts`): name, job, city,
LinkedIn and GitHub. Update it when the job changes.

**Update the resume.** Edit `resume/resume.html`, then run `powershell -ExecutionPolicy Bypass -File resume\render.ps1`
(uses Edge or Chrome, headless). It writes the public PDF without a phone number, and a private copy with the number
from `resume/private/phone.txt`. That folder is git-ignored.

## How a contact message travels

1. The form validates in the browser and saves the message to IndexedDB. The visitor sees it at once.
2. A worker sends the **email copy** to Netlify Forms first. Netlify keeps every submission in the dashboard and emails
   a notification. As soon as it lands, the visitor sees "Message received".
3. The worker then asks `/.netlify/functions/chat` to open a chat. If the chat server is asleep, the function answers
   "warming" without creating anything, and the worker retries after 5 s, 10 s, 20 s, 30 s and 60 s, then every 5
   minutes. It carries on during later visits until the message is five days old. When the chat opens, it appears
   under the message.
4. If nothing has got through after five tries, the visitor is told plainly and offered email and LinkedIn.

## Deploy (Netlify)

`netlify.toml` sets the build, the functions folder, Node 26 and redirects for old URLs. Security headers, including a
Content-Security-Policy with the inline script's hash, are generated into `dist/_headers`.

Set these in **Site configuration → Environment variables** (see `.env.example`); never put them in code. Give them the
**Builds** scope as well as Functions: the build reads `CHAT_FRONTEND_BASE` to allow the chat iframe in the
Content-Security-Policy, and a value missing at build time means the chat is blocked from loading.

| Variable | Example |
| :--- | :--- |
| `CHAT_API_BASE` | `https://nutrify-backend-z5vr.onrender.com` |
| `CHAT_API_KEY` | (secret) |
| `CHAT_API_SECRET` | (secret) |
| `CHAT_FRONTEND_BASE` | `https://nutrify-frontend.onrender.com` |

Under **Forms**, make sure form detection is on, and point the "contact" form's notifications at an inbox you check.
