import { useAuthStore } from '../stores/authStore';

// Get Backend API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * API Service for making authenticated requests to the backend
 */
class ApiService {
  /**
   * Make a GET request to the backend API
   */
  async get<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    // Get auth store
    const authStore = useAuthStore();
    
    // Get authentication token
    const token = await authStore.getIdToken();
    
    // Build query string
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;
    
    try {
      // Make the request
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      
      // Handle non-2xx responses
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      // Parse and return JSON
      return await response.json() as T;
    } catch (error: any) {
      console.error(`API GET Error (${endpoint}):`, error);
      throw new Error(`Failed to fetch data: ${error.message}`);
    }
  }
  
  /**
   * Make a POST request to the backend API
   */
  async post<T>(endpoint: string, data: any): Promise<T> {
    // Get auth store
    const authStore = useAuthStore();
    
    // Get authentication token
    const token = await authStore.getIdToken();
    
    try {
      // Make the request
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(data)
      });
      
      // Handle non-2xx responses
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      // Parse and return JSON
      return await response.json() as T;
    } catch (error: any) {
      console.error(`API POST Error (${endpoint}):`, error);
      throw new Error(`Failed to submit data: ${error.message}`);
    }
  }
  
  /**
   * Make a PUT request to the backend API
   */
  async put<T>(endpoint: string, data: any): Promise<T> {
    // Get auth store
    const authStore = useAuthStore();
    
    // Get authentication token
    const token = await authStore.getIdToken();
    
    try {
      // Make the request
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(data)
      });
      
      // Handle non-2xx responses
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      // Parse and return JSON
      return await response.json() as T;
    } catch (error: any) {
      console.error(`API PUT Error (${endpoint}):`, error);
      throw new Error(`Failed to update data: ${error.message}`);
    }
  }
  
  /**
   * Make a DELETE request to the backend API
   */
  async delete<T>(endpoint: string): Promise<T> {
    // Get auth store
    const authStore = useAuthStore();
    
    // Get authentication token
    const token = await authStore.getIdToken();
    
    try {
      // Make the request
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      
      // Handle non-2xx responses
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      // Parse and return JSON
      return await response.json() as T;
    } catch (error: any) {
      console.error(`API DELETE Error (${endpoint}):`, error);
      throw new Error(`Failed to delete data: ${error.message}`);
    }
  }
}

// Export a singleton instance
const apiService = new ApiService();
export default apiService; 