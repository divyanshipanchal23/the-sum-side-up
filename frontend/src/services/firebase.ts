import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Get Firebase config from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Firestore
const firestore = getFirestore(app);

// Enable emulators if configured
if (import.meta.env.VITE_USE_EMULATORS === 'true') {
  // Use Firebase Auth Emulator
  connectAuthEmulator(auth, 'http://localhost:9099');
  
  // Use Firestore Emulator
  connectFirestoreEmulator(firestore, 'localhost', 8080);
  
  console.log('Using Firebase emulators');
}

export { app, auth, firestore }; 