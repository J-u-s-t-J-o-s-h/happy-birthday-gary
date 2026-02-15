# Firebase Setup Guide for Grandpa Gary's Birthday Site

To get the backend working, you need your own Firebase project. Follow these steps:

## 1. Create a Firebase Project
1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Click **"Add project"** or **"Create a project"**.
3.  Name it (e.g., `garys-80th-birthday`).
4.  Disable Google Analytics (not needed for this).
5.  Click **"Create project"**.

## 2. Register Your App
1.  In the project overview, click the **Web icon (`</>`)** to add an app.
2.  Nickname it: `Birthday Site`.
3.  Uncheck "Firebase Hosting" for now.
4.  Click **"Register app"**.
5.  **Copy the `firebaseConfig` keys** shown on screen (apiKey, authDomain, etc.). You'll need these later.
6.  Click **"Continue to console"**.

## 3. Set Up Realtime Database
1.  In the left menu, go to **Build** -> **Realtime Database**.
2.  Click **"Create Database"**.
3.  Choose a location (e.g., `us-central1`).
4.  **Important:** Choose **"Start in Test Mode"**.
    - This allows reads/writes for 30 days, perfect for testing.
5.  Click **Enable**.

## 4. Set Up Storage (for Photos/Videos)
1.  In the left menu, go to **Build** -> **Storage**.
2.  Click **"Get started"**.
3.  **Important:** Choose **"Start in Test Mode"**.
4.  Click **"Next"** and ensure a location is selected.
5.  Click **"Done"**.

## 4b. Deploy Security Rules (Recommended)

The project includes `database.rules.json` and `storage.rules` (aligned with [happy-birthday-cary](https://github.com/J-u-s-t-J-o-s-h/happy-birthday-cary)):

- **Realtime Database:** Read/write allowed for `messages`.
- **Storage:** Read allowed; write allowed only for files under 10MB in `birthday-media/`.

From the project folder:

```bash
firebase login
firebase use <your-project-id>
firebase deploy --only database
firebase deploy --only storage
```

Or manually set equivalent rules in the Firebase Console (Realtime Database → Rules, Storage → Rules).

## 5. Configure Your Local Environment
1.  In your project folder, create a new file named `.env` (copy from `.env.example`).
2.  Paste your keys from Step 2 into this file. It should look like this:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=garys-80th-birthday.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=garys-80th-birthday
VITE_FIREBASE_STORAGE_BUCKET=garys-80th-birthday.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_URL=https://garys-80th-birthday-default-rtdb.firebaseio.com
```

## 6. Run the App!
1.  Open your terminal in the project folder.
2.  Run `npm install` (if you haven't already).
3.  Run `npm run dev`.
4.  Open the local URL (e.g., `http://localhost:5173`) to see your site working with a real backend!
