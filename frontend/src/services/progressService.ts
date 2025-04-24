import { collection, query, where, getDocs, doc, getDoc, setDoc, addDoc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { firestore } from './firebase';
import { useAuthStore } from '../stores/authStore';
import apiService from './apiService';

// Collection names in Firestore
const PROGRESS_COLLECTION = 'user_progress';
const ATTEMPTS_COLLECTION = 'game_attempts';

/**
 * Game Attempt interface representing a single attempt at solving a problem
 */
export interface GameAttempt {
  id?: string; // Optional as it might be auto-generated
  userId: string;
  activityId: string; // Configuration ID
  timestamp: Date;
  target: number;
  inputs: number[];
  success: boolean;
  timeSpent: number; // In seconds
}

/**
 * User Progress interface representing cumulative progress in a specific activity
 */
export interface UserProgress {
  userId: string;
  activityId: string;
  attempts: number;
  successes: number;
  currentLevel: number;
  lastPlayed: Date;
  history: GameAttempt[];
}

/**
 * Service for tracking user progress and game attempts
 */
class ProgressService {
  /**
   * Record a game attempt and update user progress
   */
  async recordAttempt(attempt: GameAttempt): Promise<GameAttempt> {
    try {
      const authStore = useAuthStore();
      
      // Ensure user is authenticated
      if (!authStore.userId) {
        throw new Error('User not authenticated');
      }
      
      // Ensure attempt belongs to current user
      attempt.userId = authStore.userId;
      
      // Set timestamp if not provided
      if (!attempt.timestamp) {
        attempt.timestamp = new Date();
      }
      
      // Create a Firestore-friendly version of the attempt
      const firestoreAttempt = {
        ...attempt,
        timestamp: attempt.timestamp // Firestore will convert this to a timestamp
      };
      
      // Save attempt to Firestore
      const attemptRef = await addDoc(collection(firestore, ATTEMPTS_COLLECTION), firestoreAttempt);
      attempt.id = attemptRef.id;
      
      // Update user progress
      await this.updateUserProgress(attempt);
      
      // Try to sync with backend
      try {
        await apiService.post('/api/game/sessions/current/attempts', attempt);
      } catch (apiError) {
        console.warn('Failed to sync attempt with backend, but Firestore save succeeded', apiError);
      }
      
      return attempt;
    } catch (error: any) {
      console.error('Error recording game attempt:', error);
      throw new Error(`Failed to record attempt: ${error.message}`);
    }
  }
  
  /**
   * Update user progress based on a game attempt
   */
  private async updateUserProgress(attempt: GameAttempt): Promise<void> {
    const { userId, activityId, success } = attempt;
    
    try {
      // Get existing progress or create a new one
      let progress: UserProgress;
      
      // Create a reference to the progress document
      const progressRef = doc(firestore, PROGRESS_COLLECTION, `${userId}_${activityId}`);
      const progressSnap = await getDoc(progressRef);
      
      if (progressSnap.exists()) {
        // Update existing progress
        progress = progressSnap.data() as UserProgress;
        progress.attempts += 1;
        if (success) {
          progress.successes += 1;
        }
        progress.lastPlayed = new Date();
        
        // We don't store the full history in the progress document because it could get large
        // Instead, we'll fetch attempts separately when needed
      } else {
        // Create new progress
        progress = {
          userId,
          activityId,
          attempts: 1,
          successes: success ? 1 : 0,
          currentLevel: 1,
          lastPlayed: new Date(),
          history: [] // Don't store full history here
        };
      }
      
      // Save progress
      await setDoc(progressRef, {
        ...progress,
        lastPlayed: progress.lastPlayed // Firestore will convert this to a timestamp
      });
      
      // Try to sync with backend
      try {
        await apiService.post('/api/game/progress', progress);
      } catch (apiError) {
        console.warn('Failed to sync progress with backend, but Firestore save succeeded', apiError);
      }
    } catch (error: any) {
      console.error('Error updating user progress:', error);
      throw error;
    }
  }
  
  /**
   * Get user progress for a specific activity
   */
  async getUserProgressForActivity(activityId: string): Promise<UserProgress | null> {
    try {
      const authStore = useAuthStore();
      
      // Ensure user is authenticated
      if (!authStore.userId) {
        throw new Error('User not authenticated');
      }
      
      const userId = authStore.userId;
      
      // Get progress document
      const progressRef = doc(firestore, PROGRESS_COLLECTION, `${userId}_${activityId}`);
      const progressSnap = await getDoc(progressRef);
      
      if (!progressSnap.exists()) {
        return null;
      }
      
      // Transform data
      const progress = progressSnap.data() as UserProgress;
      
      // Convert timestamp - properly handle Firestore timestamp
      if (progress.lastPlayed) {
        // If it's a Firestore Timestamp with seconds
        if (typeof progress.lastPlayed === 'object' && 'seconds' in progress.lastPlayed) {
          progress.lastPlayed = new Date(progress.lastPlayed.seconds * 1000);
        } else {
          // Attempt to convert from other formats
          progress.lastPlayed = new Date(progress.lastPlayed);
        }
      }
      
      // Fetch recent history items (limited to last 10 for performance)
      const attemptsQuery = query(
        collection(firestore, ATTEMPTS_COLLECTION),
        where('userId', '==', userId),
        where('activityId', '==', activityId)
      );
      
      const attemptsSnapshot = await getDocs(attemptsQuery);
      
      // Sort attempts by timestamp in descending order and limit to 10
      const recentAttempts = attemptsSnapshot.docs
        .map(doc => {
          const data = doc.data() as GameAttempt;
          data.id = doc.id;
          
          // Convert timestamp - handle Firestore timestamp
          if (data.timestamp) {
            // If it's a Firestore Timestamp with seconds
            if (typeof data.timestamp === 'object' && 'seconds' in data.timestamp) {
              data.timestamp = new Date(data.timestamp.seconds * 1000);
            } else {
              // Attempt to convert from other formats
              data.timestamp = new Date(data.timestamp);
            }
          }
          
          return data;
        })
        .sort((a, b) => {
          // Safely handle potential invalid dates
          const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : 0;
          const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : 0;
          return timeB - timeA;
        })
        .slice(0, 10);
      
      // Attach recent history
      progress.history = recentAttempts;
      
      return progress;
    } catch (error: any) {
      console.error(`Error fetching progress for activity ${activityId}:`, error);
      throw new Error(`Failed to get progress: ${error.message}`);
    }
  }
  
  /**
   * Get all user activity progress
   */
  async getAllUserProgress(): Promise<UserProgress[]> {
    try {
      const authStore = useAuthStore();
      
      // Ensure user is authenticated
      if (!authStore.userId) {
        throw new Error('User not authenticated');
      }
      
      const userId = authStore.userId;
      
      // Query for all progress documents for this user
      const progressQuery = query(
        collection(firestore, PROGRESS_COLLECTION),
        where('userId', '==', userId)
      );
      
      const progressSnapshot = await getDocs(progressQuery);
      
      // Transform data
      return progressSnapshot.docs.map(doc => {
        const data = doc.data() as UserProgress;
        
        // Convert timestamp - properly handle Firestore timestamp
        if (data.lastPlayed) {
          // If it's a Firestore Timestamp with seconds
          if (typeof data.lastPlayed === 'object' && 'seconds' in data.lastPlayed) {
            data.lastPlayed = new Date(data.lastPlayed.seconds * 1000);
          } else {
            // Attempt to convert from other formats
            data.lastPlayed = new Date(data.lastPlayed);
          }
          
          // Log the lastPlayed value for debugging
          console.log(`Progress lastPlayed for ${data.activityId}:`, data.lastPlayed);
        }
        
        // We don't fetch history here for performance reasons
        data.history = [];
        
        return data;
      });
    } catch (error: any) {
      console.error('Error fetching all user progress:', error);
      throw new Error(`Failed to get progress: ${error.message}`);
    }
  }
}

// Export singleton instance
const progressService = new ProgressService();
export default progressService; 