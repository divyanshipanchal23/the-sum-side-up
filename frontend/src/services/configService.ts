import { collection, query, where, getDocs, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { firestore } from './firebase';
import { useAuthStore } from '../stores/authStore';
import apiService from './apiService';

// Collection name in Firestore
const COLLECTION_NAME = 'game_configurations';

/**
 * Game Configuration type
 */
export interface GameConfig {
  id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  minValue: number;
  maxValue: number;
  numberOfAddends: number;
  targetRange: {
    min: number;
    max: number;
  };
  timeLimit: number;
  hintsEnabled: boolean;
  progressionRules: {
    requiredSuccessRate: number;
    advancementThreshold: number;
  };
  isPublic: boolean;
  createdBy: string;
  created_at?: Date;
  updated_at?: Date;
}

/**
 * Game Configuration Service to manage configurations in Firestore and backend
 */
class ConfigService {
  /**
   * Get all configurations for the current user
   */
  async getUserConfigurations(): Promise<GameConfig[]> {
    try {
      const authStore = useAuthStore();
      
      if (!authStore.userId) {
        throw new Error('User not authenticated');
      }
      
      // Query Firestore for user's configurations
      const configQuery = query(
        collection(firestore, COLLECTION_NAME),
        where('createdBy', '==', authStore.userId)
      );
      
      const querySnapshot = await getDocs(configQuery);
      
      // Transform data
      return querySnapshot.docs.map(doc => {
        const data = doc.data() as GameConfig;
        // Convert any timestamp fields
        if (data.created_at) {
          data.created_at = new Date(data.created_at);
        }
        if (data.updated_at) {
          data.updated_at = new Date(data.updated_at);
        }
        return data;
      });
    } catch (error: any) {
      console.error('Error fetching user configurations:', error);
      throw new Error(`Failed to get configurations: ${error.message}`);
    }
  }
  
  /**
   * Get public configurations for all users
   */
  async getPublicConfigurations(): Promise<GameConfig[]> {
    try {
      // Query Firestore for public configurations
      const configQuery = query(
        collection(firestore, COLLECTION_NAME),
        where('isPublic', '==', true)
      );
      
      const querySnapshot = await getDocs(configQuery);
      
      // Transform data
      return querySnapshot.docs.map(doc => {
        const data = doc.data() as GameConfig;
        // Convert any timestamp fields
        if (data.created_at) {
          data.created_at = new Date(data.created_at);
        }
        if (data.updated_at) {
          data.updated_at = new Date(data.updated_at);
        }
        return data;
      });
    } catch (error: any) {
      console.error('Error fetching public configurations:', error);
      throw new Error(`Failed to get public configurations: ${error.message}`);
    }
  }
  
  /**
   * Get a specific configuration by ID
   */
  async getConfiguration(id: string): Promise<GameConfig> {
    try {
      // Get configuration from Firestore
      const docRef = doc(firestore, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error(`Configuration with ID ${id} not found`);
      }
      
      // Transform data
      const data = docSnap.data() as GameConfig;
      
      // Convert any timestamp fields
      if (data.created_at) {
        data.created_at = new Date(data.created_at);
      }
      if (data.updated_at) {
        data.updated_at = new Date(data.updated_at);
      }
      
      return data;
    } catch (error: any) {
      console.error(`Error fetching configuration ${id}:`, error);
      throw new Error(`Failed to get configuration: ${error.message}`);
    }
  }
  
  /**
   * Save or update a configuration
   */
  async saveConfiguration(config: GameConfig): Promise<GameConfig> {
    try {
      const authStore = useAuthStore();
      
      if (!authStore.userId) {
        throw new Error('User not authenticated');
      }
      
      // Ensure the configuration has the correct owner
      config.createdBy = authStore.userId;
      
      // Set timestamp
      const timestamp = new Date();
      
      // For new configurations
      if (!config.created_at) {
        config.created_at = timestamp;
      }
      
      // Always update the updated_at timestamp
      config.updated_at = timestamp;
      
      // Save to Firestore
      const docRef = doc(firestore, COLLECTION_NAME, config.id);
      await setDoc(docRef, config);
      
      // Also try to save to the backend API if available
      try {
        // Transform the config to match the backend API schema
        const apiConfig = {
          id: config.id,
          title: config.title,
          description: config.title, // Use title as description since it's required in the backend
          difficulty: config.difficulty,
          target_range: {
            min: config.targetRange.min,
            max: config.targetRange.max
          },
          number_of_addends: config.numberOfAddends,
          time_limit: config.timeLimit || null,
          hints_enabled: config.hintsEnabled,
          progression_rules: {
            required_success_rate: config.progressionRules.requiredSuccessRate,
            advancement_threshold: config.progressionRules.advancementThreshold
          },
          is_public: config.isPublic,
          created_by: config.createdBy,
          created_at: config.created_at,
          updated_at: config.updated_at
        };
        
        // We'll make a best-effort to save to the backend API, but won't fail if it doesn't work
        await apiService.post('/api/game/configurations', apiConfig);
      } catch (apiError) {
        console.warn('Could not save to backend API, but Firestore save succeeded', apiError);
      }
      
      return config;
    } catch (error: any) {
      console.error('Error saving configuration:', error);
      throw new Error(`Failed to save configuration: ${error.message}`);
    }
  }
  
  /**
   * Delete a configuration
   */
  async deleteConfiguration(id: string): Promise<void> {
    try {
      const authStore = useAuthStore();
      
      if (!authStore.userId) {
        throw new Error('User not authenticated');
      }
      
      // Check if user owns this configuration
      const docRef = doc(firestore, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error(`Configuration with ID ${id} not found`);
      }
      
      const data = docSnap.data();
      if (data.createdBy !== authStore.userId) {
        throw new Error('You do not have permission to delete this configuration');
      }
      
      // Delete from Firestore
      await deleteDoc(docRef);
      
      // Also try to delete from the backend API if available
      try {
        // Best-effort to delete from backend API
        await apiService.delete(`/api/game/configurations/${id}`);
      } catch (apiError) {
        console.warn('Could not delete from backend API, but Firestore delete succeeded', apiError);
      }
    } catch (error: any) {
      console.error(`Error deleting configuration ${id}:`, error);
      throw new Error(`Failed to delete configuration: ${error.message}`);
    }
  }
}

// Export singleton instance
const configService = new ConfigService();
export default configService; 