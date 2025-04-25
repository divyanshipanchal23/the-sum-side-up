import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';

// Add try/catch for all Firebase operations
let app: any;
let auth: Auth;
let firestore: Firestore;

// Define an interface for the Firebase config to avoid index errors
interface FirebaseConfig {
  apiKey: string | undefined;
  authDomain: string | undefined;
  projectId: string | undefined;
  storageBucket: string | undefined;
  messagingSenderId: string | undefined;
  appId: string | undefined;
  [key: string]: string | undefined; // Index signature to allow string indexing
}

try {
  // Get Firebase config from environment variables
  const firebaseConfig: FirebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };

  // Check if all required config values exist
  const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);
  
  if (missingKeys.length > 0) {
    console.error(`Missing Firebase configuration keys: ${missingKeys.join(', ')}`);
    throw new Error(`Firebase config incomplete. Missing: ${missingKeys.join(', ')}`);
  }

  // Debug Firebase configuration (mask sensitive data)
  console.log('Firebase configuration:', {
    apiKey: firebaseConfig.apiKey?.substring(0, 5) + '...',
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket
  });

  // Initialize Firebase 
  app = initializeApp(firebaseConfig as any);
  console.log('Firebase initialized successfully');

  // Initialize Firebase Authentication and get a reference to the service
  auth = getAuth(app);
  console.log('Firebase Auth initialized');

  // Initialize Firestore
  firestore = getFirestore(app);
  console.log('Firestore initialized');

  // Enable emulators if configured
  if (import.meta.env.VITE_USE_EMULATORS === 'true') {
    try {
      // Use Firebase Auth Emulator
      connectAuthEmulator(auth, 'http://localhost:9099');
      
      // Use Firestore Emulator
      connectFirestoreEmulator(firestore, 'localhost', 8080);
      
      console.log('Using Firebase emulators');
    } catch (emulatorError) {
      console.error('Failed to connect to Firebase emulators:', emulatorError);
    }
  }
} catch (error: any) {
  console.error('Error initializing Firebase:', error);
  
  // Create fallback/mock objects if Firebase fails to initialize
  if (!app) {
    console.warn('Creating mock Firebase app');
    app = { name: 'mock-app' };
  }
  
  if (!auth) {
    console.warn('Creating mock Firebase auth');
    // @ts-ignore - creating a mock auth object
    auth = {
      currentUser: null,
      onAuthStateChanged: (callback: (user: null) => void) => {
        console.warn('Using mock auth.onAuthStateChanged');
        callback(null);
        return () => {}; // unsubscribe function
      }
    };
  }
  
  if (!firestore) {
    console.warn('Creating mock Firestore');
    // @ts-ignore - creating a mock firestore object
    firestore = {
      // Add minimal mock implementation if needed
    };
  }
}

export { app, auth, firestore }; 