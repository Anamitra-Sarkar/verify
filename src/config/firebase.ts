// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration from environment variables or fallback to hardcoded values
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDEAOr3iqU6TJZ6uztMvC5mquZECPcBkkE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "fir-config-d3c36.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "fir-config-d3c36",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "fir-config-d3c36.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "477435579926",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:477435579926:web:d370e9fb5a3c5a05316f37",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-PXZBD6HN1X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Analytics (optional)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { analytics };
export default app;
