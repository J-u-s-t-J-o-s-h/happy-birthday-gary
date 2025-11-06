/* ========================================
   FIREBASE CONFIGURATION - MODULAR SDK
   ======================================== */

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onChildAdded, query, orderByChild } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

// 🔥 FIREBASE CONFIG (using environment variables or fallback to hardcoded)
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDCvADCJicq08CNdOwu75_LEmHyyAcEl3c",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "happybirthdaycary-229e7.firebaseapp.com",
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://happybirthdaycary-229e7-default-rtdb.firebaseio.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "happybirthdaycary-229e7",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "happybirthdaycary-229e7.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "150506543209",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:150506543209:web:525303ee9ffdb47a4ceaf8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const database = getDatabase(app);
export const storage = getStorage(app);

// Export Firebase functions
export { ref, push, onChildAdded, query, orderByChild, storageRef, uploadBytesResumable, getDownloadURL };

console.log("✅ Firebase initialized successfully!");

/* ========================================
   LOCAL TESTING
   ======================================== */

/*
 * To test locally:
 * 
 * 1. Make sure you've replaced the firebaseConfig above with your actual config
 * 
 * 2. Open index.html in a web browser:
 *    - Simply double-click index.html, OR
 *    - Use a local server (recommended):
 *      
 *      Option A - Python:
 *      python -m http.server 8000
 *      Then visit: http://localhost:8000
 *      
 *      Option B - Node.js (with npx):
 *      npx http-server -p 8000
 *      Then visit: http://localhost:8000
 *      
 *      Option C - VS Code Live Server extension:
 *      Right-click index.html → "Open with Live Server"
 * 
 * 3. Test the functionality:
 *    - Click "Add Your Message"
 *    - Fill in name, message, and optionally upload media
 *    - Click submit and watch it appear in the feed!
 * 
 * 4. Open Firebase Console to verify:
 *    - Check Realtime Database for message entries
 *    - Check Storage for uploaded files
 */

/* ========================================
   DEPLOYMENT INSTRUCTIONS
   ======================================== */

/*
 * OPTION 1: FIREBASE HOSTING (Recommended)
 * 
 * 1. Install Firebase CLI:
 *    npm install -g firebase-tools
 * 
 * 2. Login to Firebase:
 *    firebase login
 * 
 * 3. Initialize Firebase Hosting:
 *    firebase init hosting
 *    - Select your Firebase project
 *    - Set public directory to: . (current directory)
 *    - Configure as single-page app: No
 *    - Set up automatic builds: No
 * 
 * 4. Deploy:
 *    firebase deploy --only hosting
 * 
 * 5. Your site will be live at:
 *    https://YOUR_PROJECT_ID.web.app
 * 
 * 
 * OPTION 2: VERCEL
 * 
 * 1. Install Vercel CLI:
 *    npm install -g vercel
 * 
 * 2. Deploy:
 *    vercel
 *    (Follow the prompts)
 * 
 * 3. Your site will be live at the provided URL
 * 
 * 
 * OPTION 3: NETLIFY
 * 
 * 1. Drag and drop your project folder to:
 *    https://app.netlify.com/drop
 * 
 * 2. Your site will be live immediately!
 * 
 * 
 * OPTION 4: GITHUB PAGES
 * 
 * 1. Create a new GitHub repository
 * 2. Push your files to the repository
 * 3. Go to Settings → Pages
 * 4. Select branch and save
 * 5. Your site will be live at:
 *    https://yourusername.github.io/repository-name
 */

/* ========================================
   SECURITY NOTES
   ======================================== */

/*
 * IMPORTANT: This app uses open Firebase rules for simplicity.
 * For a production app that will be public for a longer time, consider:
 * 
 * 1. Rate limiting (to prevent spam)
 * 2. Content moderation
 * 3. File size limits (already set to 10MB in rules)
 * 4. Input validation
 * 5. Consider using Firebase App Check
 * 
 * For this birthday celebration, test mode rules are fine for short-term use!
 */

