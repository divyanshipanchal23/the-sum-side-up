import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  type User
} from 'firebase/auth';
import { auth } from '../services/firebase';

export const useAuthStore = defineStore('auth', () => {
  // User state
  const user = ref<User | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  // Computed properties
  const isAuthenticated = computed(() => !!user.value);
  const userEmail = computed(() => user.value?.email || '');
  const userId = computed(() => user.value?.uid || '');
  
  // Initialize auth state listener
  function init() {
    return new Promise<void>((resolve, reject) => {
      try {
        console.log('Setting up auth state listener...');
        // Set up auth state listener
        onAuthStateChanged(auth, 
          (firebaseUser) => {
            console.log('Auth state changed:', firebaseUser ? 'User logged in' : 'No user');
            user.value = firebaseUser;
            resolve();
          },
          (error) => {
            console.error('Auth state change error:', error);
            reject(error);
          }
        );
      } catch (err) {
        console.error('Error initializing auth:', err);
        reject(err);
      }
    });
  }
  
  // Register a new user
  async function register(email: string, password: string) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      user.value = userCredential.user;
      return userCredential.user;
    } catch (e: any) {
      error.value = e.message || 'Registration failed';
      throw e;
    } finally {
      isLoading.value = false;
    }
  }
  
  // Login with email and password
  async function login(email: string, password: string) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      user.value = userCredential.user;
      return userCredential.user;
    } catch (e: any) {
      error.value = e.message || 'Login failed';
      throw e;
    } finally {
      isLoading.value = false;
    }
  }
  
  // Sign in with Google
  async function loginWithGoogle() {
    isLoading.value = true;
    error.value = null;
    
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      user.value = userCredential.user;
      return userCredential.user;
    } catch (e: any) {
      error.value = e.message || 'Google login failed';
      throw e;
    } finally {
      isLoading.value = false;
    }
  }
  
  // Logout
  async function logout() {
    isLoading.value = true;
    error.value = null;
    
    try {
      await signOut(auth);
      user.value = null;
    } catch (e: any) {
      error.value = e.message || 'Logout failed';
      throw e;
    } finally {
      isLoading.value = false;
    }
  }
  
  // Reset password
  async function resetPassword(email: string) {
    isLoading.value = true;
    error.value = null;
    
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (e: any) {
      error.value = e.message || 'Password reset failed';
      throw e;
    } finally {
      isLoading.value = false;
    }
  }
  
  // Get current user's ID token for API requests
  async function getIdToken(): Promise<string | null> {
    if (!user.value) return null;
    
    try {
      return await user.value.getIdToken();
    } catch (e) {
      error.value = 'Failed to get authentication token';
      return null;
    }
  }
  
  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    userEmail,
    userId,
    init,
    register,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    getIdToken
  };
}); 