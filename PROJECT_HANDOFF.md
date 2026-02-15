# Project Handoff: Grandpa Gary's 80th Birthday Bash

> **For full project history and work log, see [CONTINUITY.md](CONTINUITY.md).**

## 🎯 Objective
A digital guestbook/celebration site for Grandpa Gary's 80th birthday. Users can upload photos/videos and leave messages.
**Current Theme:** Police Officer (Blue/Gold/Silver) - "Grandpa Gary's 80th Birthday Bash!"

## 🛠️ Tech Stack
- **Frontend:** Vanilla JavaScript (ES Modules), HTML5
- **Styling:** Tailwind CSS (via CDN) + Custom CSS (`style.css`)
- **Build Tool:** Vite
- **Backend:** Firebase (Realtime Database + Storage)
- **Design:** "Police Theme" (Blue/Gold/Silver)
- **Key Libraries:**
  - `canvas-confetti`: For celebrations.
  - `heic2any`: Auto-converts iPhone photos (.HEIC) to JPEG before upload.
  - `three`: 3D patrol cop overlay (vanilla Three.js).

## ✅ Completed Work
- **Theme Overhaul:** 
  - Converted original "Tropical Beach" theme to **"Police Theme"**.
  - Updated colors to **Navy Blue (`#0a192f`), Gold (`#FFD700`), Silver**.
  - Added "Police Line Do Not Cross" banners and Sheriff Badge animations.
  - Changed language to "File A Report" / "Evidence" for fun.
- **Backend Setup:**
  - Configured `firebase-config.js` to use environment variables.
  - User created a Firebase Project manually and set up `.env`.
  - Fixed **CORS Issue** for Firebase Storage (created `cors.json` & applied via `gsutil`).
- **Functionality Fixes:**
  - **Local Network Access:** Configured Vite to listen on `0.0.0.0` so other devices on LAN can access via `http://192.168.1.X:3000`.
  - **HEIC Support:** Implemented client-side conversion for iPhone uploads so they display correctly on the web.

## 🚀 Current Status
- The site is fully functional on **Localhost**.
- Backend (Firebase) is connected and storing data/files.
- Network access works (Firewall rules may need checking on new machines).
- **Vercel deployment ready:** `vercel.json` added; build verified (`npm run build` succeeds).

## 🔒 Firebase Rules (Aligned with [happy-birthday-cary](https://github.com/J-u-s-t-J-o-s-h/happy-birthday-cary))

- **Realtime Database** (`database.rules.json`): `messages` node — read/write allowed.
- **Storage** (`storage.rules`): `birthday-media/` path — read allowed; write allowed only if file under 25MB.
- **Client/UI:** 25MB limit in `script.js` and `index.html`.

**Deploy rules to Firebase:**
```bash
firebase deploy --only database
firebase deploy --only storage
```

## 📝 Deployment: GitHub + Vercel

1. **Push to GitHub**
   - Initialize git if needed: `git init`
   - Add remote and push to your repository

2. **Link Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import the GitHub repository
   - Build settings are auto-detected from `vercel.json` (build: `npm run build`, output: `dist`)

3. **Environment Variables** (Vercel Dashboard → Project → Settings → Environment Variables)
   - Add all `VITE_FIREBASE_*` variables from your local `.env`
   - Or copy from `.env.example` and fill in your Firebase values

4. **Post-deploy:** Test the live URL (load messages, submit form, upload photo).

## 🐛 Troubleshooting: Messages Not Appearing

If you submit a message but it doesn't show on the main page:

1. **Check the browser console (F12 → Console)** for errors. Look for Firebase permission errors.
2. **Verify Firebase project match:** Your `.env` (or fallbacks in `firebase-config.js`) must point to the same project where you deployed rules. Run `firebase use` to see which project the CLI uses; it should match your app.
3. **Redeploy database rules** (includes `indexOn` for timestamp):
   ```bash
   firebase deploy --only database
   ```
4. **Check Firebase Console:** Realtime Database → Data. Do you see a `messages` node with your entry? If yes, the write worked; the issue is likely read/listener. If no, the write failed (check Storage rules for file upload, or Database rules for the push).

## 3D Patrol Cop Overlay

A lightweight 3D police avatar patrols the viewport on desktop (vanilla Three.js).

- **Model path:** Place `patrol-cop.glb` in `public/models/`. The overlay loads from `/models/patrol-cop.glb`.
- **Tweak speed/scale:** Edit `CONFIG.speed` and `CONFIG.scale` in `patrol-cop-overlay.js`.
- **Disabled when:** `prefers-reduced-motion: reduce`, viewport &lt; 768px, or `enabled: false` in config.
- **Without model:** Overlay does not crash; a console warning is logged.

## 📝 Optional (Future)
- **Tailwind optimization:** Move from CDN to build step for smaller CSS if load times are a concern.
