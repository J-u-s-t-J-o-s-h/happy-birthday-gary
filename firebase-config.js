/* ========================================
   FIREBASE CONFIGURATION
   ======================================== */

/*
 * SETUP INSTRUCTIONS:
 * 
 * 1. Go to https://console.firebase.google.com/
 * 2. Create a new project (or use existing one)
 * 3. Click "Add app" and select "Web"
 * 4. Copy your Firebase configuration object
 * 5. Replace the firebaseConfig object below with your config
 * 
 * 6. Enable Realtime Database:
 *    - Go to "Realtime Database" in Firebase Console
 *    - Click "Create Database"
 *    - Start in test mode (or configure rules later)
 * 
 * 7. Enable Firebase Storage:
 *    - Go to "Storage" in Firebase Console
 *    - Click "Get Started"
 *    - Start in test mode (or configure rules later)
 * 
 * 8. (IMPORTANT) Set Security Rules for Production:
 *    
 *    Realtime Database Rules (test mode - open to all):
 *    {
 *      "rules": {
 *        "messages": {
 *          ".read": true,
 *          ".write": true
 *        }
 *      }
 *    }
 *    
 *    Storage Rules (test mode - open to all):
 *    rules_version = '2';
 *    service firebase.storage {
 *      match /b/{bucket}/o {
 *        match /birthday-media/{allPaths=**} {
 *          allow read, write: if request.resource.size < 100 * 1024 * 1024;
 *        }
 *      }
 *    }
 */

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

/*
 * EXAMPLE CONFIG (DO NOT USE - THIS IS JUST AN EXAMPLE):
 * 
 * const firebaseConfig = {
 *     apiKey: "AIzaSyAbc123DefGhiJklMnoPqrStuVwxYz",
 *     authDomain: "carybday-12345.firebaseapp.com",
 *     databaseURL: "https://carybday-12345-default-rtdb.firebaseio.com",
 *     projectId: "carybday-12345",
 *     storageBucket: "carybday-12345.appspot.com",
 *     messagingSenderId: "123456789012",
 *     appId: "1:123456789012:web:abcdef1234567890"
 * };
 */

// Initialize Firebase when modules are loaded
window.initializeFirebase = function() {
    const { initializeApp, getDatabase, getStorage } = window.firebaseModules;
    
    try {
        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        
        // Initialize services
        window.database = getDatabase(app);
        window.storage = getStorage(app);
        
        console.log("✅ Firebase initialized successfully!");
        
        // Start the app
        if (typeof window.initializeApp === 'function') {
            window.initializeApp();
        }
    } catch (error) {
        console.error("❌ Firebase initialization error:", error);
        
        // Show user-friendly error message
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.innerHTML = `
                <div class="text-center py-12">
                    <span class="text-6xl">⚠️</span>
                    <p class="mt-4 text-red-600 font-semibold">Firebase Configuration Error</p>
                    <p class="mt-2 text-gray-600">Please check your firebase-config.js file</p>
                    <p class="mt-2 text-sm text-gray-500">See console for details</p>
                </div>
            `;
        }
    }
};

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

