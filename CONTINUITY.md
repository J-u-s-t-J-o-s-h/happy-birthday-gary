# Project Continuity: Grandpa Gary's 80th Birthday Bash

**Purpose:** This document records all work done on the project to date so a coworker can pick up seamlessly.

**Last Updated:** February 2026

---

## Project Overview

A digital guestbook/celebration site for Grandpa Gary's 80th birthday. Guests can:
- Leave birthday messages (name + text)
- Upload photos or videos (up to 25MB)
- View messages in real time as "Case Files" with a police-themed UI

**Theme:** Police Officer (Navy Blue / Gold / Silver) — "Grandpa Gary's 80th Birthday Bash!"

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vanilla JavaScript (ES Modules), HTML5 |
| Styling | Tailwind CSS (CDN) + Custom CSS (`style.css`) |
| Build | Vite 7.x |
| Backend | Firebase Realtime Database + Firebase Storage |
| Hosting (planned) | Vercel |
| Key Libraries | `canvas-confetti`, `heic2any` (iPhone HEIC → JPEG), `three` (patrol overlay + car chase) |

---

## Project Structure

```
happy-birthday-gary/
├── index.html          # Main page
├── script.js           # App logic, Firebase, UI
├── style.css           # Police theme, layout, animations
├── firebase-config.js  # Firebase init (env vars only, no hardcoded credentials)
├── firebase.json       # Firebase hosting + rules config
├── database.rules.json # Realtime Database rules
├── storage.rules       # Storage rules (25MB limit)
├── vercel.json         # Vercel build config
├── cors.json           # CORS for Firebase Storage (applied via gsutil)
├── patrol-cop-overlay.js   # 3D patrol avatar (vanilla Three.js)
├── police-car-chase.js    # 3D car chase at bottom (vanilla Three.js)
├── public/
│   ├── police-badge.svg   # Custom badge asset
│   └── models/
│       ├── patrol-cop.glb # Rigged police model for overlay (user-provided)
│       ├── police-car.glb # Police car for chase (user-provided)
│       └── sports-car.glb # Sports car being chased (user-provided)
├── .env                 # Firebase credentials (gitignored)
├── .env.example         # Template for env vars
├── .firebaserc          # Firebase project alias (garys-80th-birthday)
├── PROJECT_HANDOFF.md   # Deployment & troubleshooting
├── SETUP_FIREBASE.md    # Firebase setup steps
└── CONTINUITY.md        # This file
```

---

## Chronological Work Log

### Phase 1: Theme & Backend (Initial Setup)
- Converted original "Tropical Beach" theme to **Police Theme**
- Colors: Navy Blue (`#0a192f`), Gold (`#FFD700`), Silver
- Added "Police Line Do Not Cross" tape banners (top/bottom)
- Added siren glow animation, badge watermark
- Themed language: "File A Report", "Evidence", "Case Files"
- Configured `firebase-config.js` for environment variables
- Fixed CORS for Firebase Storage (`cors.json` + `gsutil`)
- Vite configured for LAN access (`host: 0.0.0.0`, port 3000)
- HEIC support for iPhone uploads (client-side conversion)

### Phase 2: Firebase Rules & Permissions
- Created `database.rules.json` (messages: read/write, indexOn timestamp)
- Created `storage.rules` (birthday-media: read allowed, write if &lt; 25MB)
- Updated `firebase.json` to reference rules
- Aligned with reference repo: [happy-birthday-cary](https://github.com/J-u-s-t-J-o-s-h/happy-birthday-cary)
- Resolved Firebase project mismatch: `.firebaserc` and `.env` must use same project
- Deployed rules via `firebase deploy --only database` and `firebase deploy --only storage`

### Phase 3: Deployment Prep
- Added `vercel.json` (build: `npm run build`, output: `dist`)
- Verified build locally
- Pushed to GitHub: [J-u-s-t-J-o-s-h/happy-birthday-gary](https://github.com/J-u-s-t-J-o-s-h/happy-birthday-gary)
- Vercel deployment: import repo, add env vars in dashboard

### Phase 4: Security
- **API key exposure:** Firebase credentials were in `firebase-config.js` and pushed to GitHub
- Removed all hardcoded credentials; app now requires `.env` with `VITE_FIREBASE_*` vars
- Added validation that throws if env vars missing
- Created `.env.example` as template
- User regenerated compromised API key in Google Cloud Console

### Phase 5: File Upload Limits
- Increased from 10MB to **25MB** in: `storage.rules`, `script.js`, `index.html`

### Phase 6: Custom Badge Asset
- Replaced CSS badge with custom PNG, then **SVG** (`public/police-badge.svg`)
- Badge sizes: Desktop 728×874px, Tablet 560px, Mobile 500px
- Added `!important` overrides for padding, border-radius, box-sizing (Tailwind was overriding)
- Badge has transparent background

### Phase 7: Header Layout
- Created overlap layout: title overlaps bottom of badge
- `header-badge-overlap` container with `birthday-title-overlap` (negative margin)
- Compact header: reduced top padding, margins between elements
- Responsive overlap margins: -220px desktop, -140px tablet, -110px mobile

### Phase 8: Toast Notifications
- Added visible toast styling (success green, error red) for form feedback
- Firebase listener error callback shows toast if permission denied

### Phase 9: 3D Patrol Cop Overlay
- Added vanilla Three.js overlay: police avatar patrols viewport on a rectangular path
- Model: `public/models/patrol-cop.glb` (rigged .glb with "Walk" or first animation clip)
- Disabled on mobile (&lt;768px) and when `prefers-reduced-motion: reduce`
- Config: `speed`, `scale`, `waypoints` in `patrol-cop-overlay.js`
- Graceful fallback if model missing (console warning, no crash)

### Phase 10: Polaroid Zone & Layout Fixes
- Fixed loading/empty state overlap: removed `position: fixed`, use flow layout
- Added `polaroid-loading` and `polaroid-empty-state` CSS classes
- Responsive sizing for loading spinner and empty state
- Removed "JUNE 15TH • THE COMMUNITY HALL" from header

### Phase 11: 3D Police Car Chase
- Added `police-car-chase.js`: Two police cars chase a sports car along curved path
- Models: `police-car.glb` (Sketchfab/Sprotteglace3d), `sports-car.glb` in `public/models/`
- Curved CatmullRom path, flashing red/blue lights on police cars, headlights on sports car
- Mobile enabled with smaller scale; respects `prefers-reduced-motion`
- Config: `speed`, `chaseGap`, `backupCopGap` in `police-car-chase.js`

---

## Configuration Reference

### Firebase Project
- **Project ID:** `garys-80th-birthday` (from `.firebaserc`)
- **CLI:** `firebase use` to verify active project
- **Rules deploy:** `firebase deploy --only database` and `firebase deploy --only storage`

### Environment Variables (Required)
All in `.env` — copy from `.env.example`:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_DATABASE_URL`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

### Vite
- Dev: `npm run dev` (port 3000, host 0.0.0.0)
- Build: `npm run build` → `dist/`

---

## Known Gotchas

1. **Firebase project mismatch:** If `permission_denied` appears, ensure `.firebaserc` and `.env` point to the same project. Run `firebase use` and compare with `VITE_FIREBASE_PROJECT_ID`.

2. **Tailwind overrides badge:** `.police-badge-icon` uses `!important` on padding, border-radius, box-sizing because Tailwind's base img styles were adding 279px padding and 265px border-radius.

3. **Realtime Database init:** If `firebase deploy --only database` fails with "no Realtime Database instance", run `firebase init database` and choose to set up.

4. **Storage init:** If `firebase deploy --only storage` fails, enable Storage in Firebase Console first (Get Started on Storage page).

5. **HEIC:** iPhone photos are converted client-side before upload; no server-side handling.

6. **Patrol overlay model:** Place `patrol-cop.glb` in `public/models/`. Without it, overlay does not render (graceful). Tweak `CONFIG.speed` and `CONFIG.scale` in `patrol-cop-overlay.js`.

7. **Police car chase models:** Place `police-car.glb` and `sports-car.glb` in `public/models/`. Tweak `CONFIG.speed`, `CONFIG.chaseGap`, `CONFIG.backupCopGap` in `police-car-chase.js`.

---

## What's Not Done

- **Vercel deployment:** Repo is pushed; needs Vercel import + env vars
- **Tailwind optimization:** Still using CDN; could move to build step for smaller CSS
- **Additional polish:** User may want more police-themed assets (see PROJECT_HANDOFF for search terms)

---

## Quick Start for New Dev

```bash
git clone https://github.com/J-u-s-t-J-o-s-h/happy-birthday-gary.git
cd happy-birthday-gary
cp .env.example .env
# Edit .env with Firebase credentials from Firebase Console
npm install
npm run dev
```

Open `http://localhost:3000`. To deploy rules: `firebase login`, `firebase use garys-80th-birthday`, then `firebase deploy --only database` and `firebase deploy --only storage`.

---

## Related Docs

- **PROJECT_HANDOFF.md** — Deployment, troubleshooting, Firebase rules
- **SETUP_FIREBASE.md** — Step-by-step Firebase setup for new projects
