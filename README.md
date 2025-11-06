# 🎉 Happy Birthday Cary! 🎉

A beautiful, lightweight celebratory web app where friends and family can leave birthday messages and upload photos/videos for Cary!

![Birthday App](https://img.shields.io/badge/Happy%20Birthday-Cary-ff69b4?style=for-the-badge)

## ✨ Features

- 📝 **No Sign-in Required** - Anyone can post a birthday message
- 📸 **Media Support** - Upload photos or short videos (up to 10MB)
- 🎊 **Real-time Updates** - Messages appear instantly using Firebase
- 🎨 **Beautiful Design** - Playful, cheerful UI with confetti animations
- 📱 **Mobile Friendly** - Fully responsive design
- ⚡ **Fast & Lightweight** - Pure HTML, CSS, and JavaScript

## 🛠️ Tech Stack

- **Frontend**: HTML, CSS (Tailwind), Vanilla JavaScript
- **Backend**: Firebase Realtime Database + Firebase Storage
- **Hosting**: Firebase Hosting / Vercel / Netlify
- **Animations**: Canvas Confetti

## 📁 Project Structure

```
carybday/
├── index.html           # Main HTML file
├── style.css            # Custom styles
├── script.js            # Application logic
├── firebase-config.js   # Firebase configuration
├── assets/              # Additional assets (images, fonts, etc.)
└── README.md            # This file
```

## 🚀 Quick Start

### Prerequisites

1. A Firebase account (free tier is fine!)
2. Web browser
3. Text editor

### Setup Instructions

#### Step 1: Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use an existing one)
3. Click "Add app" and select "Web" (</> icon)
4. Copy your Firebase configuration

#### Step 2: Enable Firebase Services

**Realtime Database:**
1. Go to "Realtime Database" in Firebase Console
2. Click "Create Database"
3. Start in **test mode** for now
4. Set these security rules:

```json
{
  "rules": {
    "messages": {
      ".read": true,
      ".write": true
    }
  }
}
```

**Firebase Storage:**
1. Go to "Storage" in Firebase Console
2. Click "Get Started"
3. Start in **test mode**
4. Set these security rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /birthday-media/{allPaths=**} {
      allow read, write: if request.resource.size < 10 * 1024 * 1024;
    }
  }
}
```

#### Step 3: Configure Your App

1. Open `firebase-config.js`
2. Replace the `firebaseConfig` object with your actual Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

## 🧪 Local Testing

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Run Development Server

```bash
npm run dev
```

This will start a Vite development server and automatically open your browser at `http://localhost:3000`

### Alternative Options

**Direct File Access:**
Simply double-click `index.html` to open it in your browser.

**Using VS Code:**
Install the "Live Server" extension, then right-click `index.html` → "Open with Live Server"

## 🌐 Deployment

### Option 1: Firebase Hosting (Recommended)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase Hosting
firebase init hosting
# - Select your Firebase project
# - Public directory: . (current directory)
# - Single-page app: No
# - Automatic builds: No

# Deploy
firebase deploy --only hosting
```

Your site will be live at: `https://YOUR_PROJECT_ID.web.app`

### Option 2: Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

Follow the prompts, and your site will be live!

### Option 3: Netlify

1. Go to [Netlify Drop](https://app.netlify.com/drop)
2. Drag and drop your project folder
3. Done! Your site is live instantly.

### Option 4: GitHub Pages

1. Create a new GitHub repository
2. Push your files to the repository
3. Go to Settings → Pages
4. Select your branch and save
5. Your site will be live at: `https://yourusername.github.io/repository-name`

## 🎨 Customization

### Change Colors

Edit the CSS variables in `style.css`:

```css
:root {
    --color-primary-pink: #ec4899;
    --color-primary-purple: #9333ea;
    --color-primary-blue: #3b82f6;
    --color-primary-yellow: #fbbf24;
}
```

### Modify Header Text

Edit the `<h1>` tag in `index.html`:

```html
<h1 class="...">
    🎉 Happy Birthday, Cary! 🎉
</h1>
```

### Adjust Confetti

Modify the confetti settings in `script.js`:

```javascript
confetti({
    particleCount: 100,  // Number of particles
    spread: 70,          // Spread angle
    origin: { y: 0.6 }   // Origin position
});
```

## 📱 Features Breakdown

### Message Submission
- Name input (required)
- Message textarea (required)
- Optional file upload (images/videos up to 10MB)
- Real-time upload progress indicator

### Message Feed
- Auto-refreshing grid layout
- Animated cards with hover effects
- Media preview (images/videos)
- Relative timestamps ("Just now", "5m ago", etc.)

### Animations
- Confetti burst on page load
- Confetti when submitting a message
- Random confetti bursts every 15 seconds
- Smooth card animations

## 🔒 Security Notes

**Important:** This app uses open Firebase rules for simplicity. For a production app that will be public for a longer time, consider:

1. Rate limiting (to prevent spam)
2. Content moderation
3. Firebase App Check
4. Input validation
5. Stricter security rules

For this birthday celebration, test mode rules are fine for short-term use!

## 🐛 Troubleshooting

### Firebase Not Loading
- Check browser console for errors
- Verify your Firebase config in `firebase-config.js`
- Make sure Realtime Database and Storage are enabled

### Files Not Uploading
- Check file size (must be < 10MB)
- Verify Storage rules are set correctly
- Check browser console for errors

### Messages Not Appearing
- Verify Realtime Database rules are set correctly
- Check browser console for errors
- Open Firebase Console to see if messages are being saved

## 📄 License

This project is open source and available for personal use.

## 🎂 Made with ❤️ for Cary's Birthday!

---

**Need help?** Check the comments in the code files - they contain detailed instructions and explanations!

