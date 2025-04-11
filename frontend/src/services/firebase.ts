import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// For development, we'll use placeholder config values
// In production, these would be environment variables
const firebaseConfig = {
  apiKey: "AIzaSyDevelopmentKeyPlaceholder",
  authDomain: "balance-scale-game.firebaseapp.com",
  projectId: "balance-scale-game",
  storageBucket: "balance-scale-game.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Firestore
const firestore = getFirestore(app);

// Enable emulators in development mode
if (import.meta.env.DEV) {
  // Use Firebase Auth Emulator
  connectAuthEmulator(auth, 'http://localhost:9099');
  
  // Use Firestore Emulator
  connectFirestoreEmulator(firestore, 'localhost', 8080);
  
  console.log('Using Firebase emulators in development mode');
}

export { app, auth, firestore }; 