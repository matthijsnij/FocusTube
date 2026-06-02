# FocusTube

A distraction-free YouTube search interface. No recommendations, suggestions, sidebar, or other noise, only get results you explicitly search for.

---

## What it does

FocusTube wraps the YouTube Data API in a clean, minimal UI. You search for videos or channels, apply filters, and watch inline without ever touching the YouTube homepage. Guest users get 2 free searches before being prompted to log in.

**Features:**
- Search YouTube videos and channels with all YouTube native filters (duration, upload date, sort order)
- Scope searches to a specific channel
- Watch videos in an inline modal player
- 4 themes (light/dark, minimal/gradient)
- 7 languages (EN, ES, FR, DE, IT, NL, PT)
- Account system — sign up, log in, reset password, email confirmation

---

## Tech stack

- Vanilla JavaScript (ES modules), HTML, CSS — no build tools
- [Supabase](https://supabase.com) — auth and user profiles
- [YouTube Data API v3](https://developers.google.com/youtube/v3) — search and video metadata
- NProgress — loading bar
- All dependencies loaded via CDN (no `npm install` needed)

---

## Project structure

```
code/
  index.html          # Landing page (search + filters + settings)
  results.html        # Results grid + inline video player
  login.html          # Login / sign up / password recovery
  emailConfirmed.html # Post-email-verification landing
  resetPassword.html  # Password reset form (opened from email link)
  header.html         # Logo header, loaded dynamically

  supabaseClient.js   # Supabase init and session storage routing
  authState.js        # Auth UI (login button, user greeting, channel mode)
  query.js            # Search logic and guest limit enforcement
  results.js          # YouTube API calls, result rendering, pagination
  filters.js          # Filter panel UI and state
  settings.js         # Theme, language, logout
  login.js            # Auth flow (login, signup, password reset)
  languageManager.js  # i18n — loads lang/*.json, translates data-i18n elements
  header.js           # Injects header.html into pages
  placeholder.js      # Typewriter animation for search suggestions
  style.css           # All styling — 4 theme variants via CSS variables

lang/
  en.json, es.json, fr.json, de.json, it.json, nl.json, pt.json

images/
  # Logos, icons, gradient backgrounds
```

---

## Webpage

FocusTube is currently being hosted live on https://focustube.data-wolf.nl/.

## Configuration

API keys are currently hardcoded in the source files:

| Key | Location | Service |
|-----|----------|---------|
| `SUPABASE_URL` + `ANON_KEY` | `supabaseClient.js` | Supabase project |
| `API_KEY` | `query.js`, `results.js` | YouTube Data API v3 |

The YouTube API key is hardcoded in the client-side JS, which is unavoidable for a frontend-only app. It is secured via an **HTTP referrer restriction** in Google Cloud Console, meaning the key will only work for requests originating from the allowed domain.

The Supabase URL and anon key are also hardcoded and visible in source. This is fine since the URL is just the project's API endpoint, and the anon key is intended to be public. It only grants the permissions that Supabase's Row Level Security (RLS) policies allow, so the actual data security is enforced server-side.

The email confirmation and password reset redirect URLs point to `https://focustube.data-wolf.nl`.

---

## Auth flow

1. Enter email on the login page
2. If the email is new → sign-up form (first name, last name, password)
3. Confirmation email sent → user clicks link → account activated
4. Login stores session in `localStorage` (if "stay signed in") or `sessionStorage`
5. Password reset sends a link via Supabase; the reset form lives at `resetPassword.html`

User profile data (name, email) is stored in a `focustube_profiles` table in Supabase, created on first login.

---

## Guest limits

Unauthenticated users can run **2 searches** before being redirected to the login page. The count is tracked in `localStorage` under `searchCount`.
