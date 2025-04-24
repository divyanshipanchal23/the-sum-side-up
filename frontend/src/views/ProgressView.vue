<template>
  <div class="min-h-screen bg-gray-100 p-4">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-3xl font-bold text-indigo-600 mb-6">Learning Progress</h1>
      
      <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div v-if="isLoading" class="py-8 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
          <p class="mt-2 text-gray-600">Loading your progress...</p>
        </div>
        
        <div v-else-if="error" class="bg-red-50 border-l-4 border-red-500 p-4">
          <p class="text-red-700">{{ error }}</p>
          <button 
            @click="loadAllProgress" 
            class="mt-2 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
          >
            Try Again
          </button>
        </div>
        
        <div v-else>
          <!-- Overall Progress Summary -->
          <div class="mb-8">
            <h2 class="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Overall Progress</h2>
            
            <div v-if="!hasProgress" class="text-center py-8">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p class="text-gray-600">No progress data yet. Start playing to see your statistics!</p>
              <router-link 
                to="/game" 
                class="mt-4 inline-block px-4 py-2 bg-white text-black rounded border border-indigo-600 hover:bg-gray-100"
              >
                Play More Games
              </router-link>
            </div>
            
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div class="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                <p class="text-sm font-medium text-gray-800">Total Activities</p>
                <p class="text-2xl font-bold text-gray-900">{{ activities.length }}</p>
              </div>
              
              <div class="bg-green-50 p-4 rounded-lg border border-green-100">
                <p class="text-sm font-medium text-gray-800">Success Rate</p>
                <p class="text-2xl font-bold text-gray-900">{{ overallSuccessRate }}%</p>
              </div>
              
              <div class="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <p class="text-sm font-medium text-gray-800">Total Attempts</p>
                <p class="text-2xl font-bold text-gray-900">{{ totalAttempts }}</p>
              </div>
              
              <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p class="text-sm font-medium text-gray-800">Last Played</p>
                <p class="text-2xl font-bold text-gray-900">{{ lastPlayedFormatted }}</p>
              </div>
            </div>
          </div>
          
          <!-- Activities Progress -->
          <div>
            <h2 class="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Activities Progress</h2>
            
            <div v-if="activities.length === 0" class="text-center py-6">
              <p class="text-gray-600">No activities completed yet.</p>
            </div>
            
            <div v-else class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity ID
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Level
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Success
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attempts
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Played
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="activity in activities" :key="activity.activityId" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">{{ activity.activityId }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">{{ activity.currentLevel }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">{{ activity.successes }} / {{ activity.attempts }}</div>
                      <div class="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                        <div class="bg-white border border-green-600 h-2.5 rounded-full" :style="{ width: `${(activity.successes / activity.attempts) * 100}%` }"></div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ activity.attempts }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ formatDate(activity.lastPlayed) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        @click="viewActivityDetails(activity)"
                        class="px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 mr-2 text-sm"
                      >
                        View Details
                      </button>
                      <router-link
                        :to="`/game?configId=${activity.activityId}`"
                        class="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm"
                      >
                        Continue
                      </router-link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- Activity Details Modal -->
          <div v-if="selectedActivity" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div class="p-6">
                <div class="flex justify-between items-center mb-4">
                  <h3 class="text-lg font-semibold text-gray-900">Activity Details: {{ selectedActivity.activityId }}</h3>
                  <button @click="selectedActivity = null" class="text-gray-500 hover:text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div class="bg-indigo-50 p-4 rounded-lg">
                    <p class="text-sm font-medium text-gray-800">Current Level</p>
                    <p class="text-2xl font-bold text-gray-900">{{ selectedActivity.currentLevel }}</p>
                  </div>
                  
                  <div class="bg-green-50 p-4 rounded-lg">
                    <p class="text-sm font-medium text-gray-800">Success Rate</p>
                    <p class="text-2xl font-bold text-gray-900">{{ (selectedActivity.successes / selectedActivity.attempts * 100).toFixed(1) }}%</p>
                  </div>
                  
                  <div class="bg-purple-50 p-4 rounded-lg">
                    <p class="text-sm font-medium text-gray-800">Attempts</p>
                    <p class="text-2xl font-bold text-gray-900">{{ selectedActivity.attempts }}</p>
                  </div>
                </div>
                
                <h4 class="font-medium text-gray-900 mb-2">Recent Attempts</h4>
                
                <div v-if="selectedActivity.history.length === 0" class="text-center py-4 bg-gray-50 rounded-lg">
                  <p class="text-gray-600">No detailed history available.</p>
                </div>
                
                <div v-else class="overflow-x-auto mb-4">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Target
                        </th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Input Values
                        </th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Result
                        </th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time (sec)
                        </th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr v-for="attempt in selectedActivity.history" :key="attempt.id" class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {{ formatDateTime(attempt.timestamp) }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {{ attempt.target }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {{ attempt.inputs.join(' + ') }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span 
                            :class="attempt.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" 
                            class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                          >
                            {{ attempt.success ? 'Correct' : 'Incorrect' }}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {{ attempt.timeSpent.toFixed(1) }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div class="flex justify-end">
                  <button 
                    @click="selectedActivity = null" 
                    class="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="flex justify-center">
        <router-link to="/" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
          Back to Home
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/authStore';
import progressService, { UserProgress } from '../services/progressService';
import soundService from '../services/soundService';

// Initialize auth store
const authStore = useAuthStore();

// State variables
const isLoading = ref(true);
const error = ref<string | null>(null);
const activities = ref<UserProgress[]>([]);
const selectedActivity = ref<UserProgress | null>(null);

// Computed properties
const hasProgress = computed(() => activities.value.length > 0);

const totalAttempts = computed(() => {
  return activities.value.reduce((sum, activity) => sum + activity.attempts, 0);
});

const totalSuccesses = computed(() => {
  return activities.value.reduce((sum, activity) => sum + activity.successes, 0);
});

const overallSuccessRate = computed(() => {
  if (totalAttempts.value === 0) return 0;
  return ((totalSuccesses.value / totalAttempts.value) * 100).toFixed(1);
});

const lastPlayedFormatted = computed(() => {
  if (activities.value.length === 0) return 'N/A';
  
  // Find the most recent activity
  const mostRecent = [...activities.value].sort(
    (a, b) => new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime()
  )[0];
  
  return formatDate(mostRecent.lastPlayed);
});

// Utility functions
function formatDate(date: any): string {
  if (!date) return 'N/A';
  
  try {
    // Handle different types of date inputs that might come from Firestore
    let d: Date;
    
    // If it's a Firestore Timestamp object with seconds and nanoseconds
    if (date && typeof date === 'object' && 'seconds' in date) {
      d = new Date(date.seconds * 1000);
    } 
    // If it's a regular Date object or ISO string
    else {
      d = new Date(date);
    }
    
    // Check if the date is valid
    if (isNaN(d.getTime())) {
      console.error('Invalid date format:', date);
      return 'Invalid Date';
    }
    
    return d.toLocaleDateString();
  } catch (err) {
    console.error('Error formatting date:', err, date);
    return 'Invalid Date';
  }
}

function formatDateTime(date: any): string {
  if (!date) return 'N/A';
  
  try {
    // Handle different types of date inputs that might come from Firestore
    let d: Date;
    
    // If it's a Firestore Timestamp object with seconds and nanoseconds
    if (date && typeof date === 'object' && 'seconds' in date) {
      d = new Date(date.seconds * 1000);
    } 
    // If it's a regular Date object or ISO string
    else {
      d = new Date(date);
    }
    
    // Check if the date is valid
    if (isNaN(d.getTime())) {
      console.error('Invalid date format:', date);
      return 'Invalid Date';
    }
    
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } catch (err) {
    console.error('Error formatting date:', err, date);
    return 'Invalid Date';
  }
}

// View activity details
function viewActivityDetails(activity: UserProgress) {
  soundService.play('click');
  
  // If we don't have the history yet, fetch it
  if (activity.history.length === 0) {
    loadActivityDetails(activity.activityId);
  } else {
    selectedActivity.value = activity;
  }
}

// Load detailed activity information including history
async function loadActivityDetails(activityId: string) {
  try {
    const detailedActivity = await progressService.getUserProgressForActivity(activityId);
    if (detailedActivity) {
      // Find and update the activity in our list
      const index = activities.value.findIndex(a => a.activityId === activityId);
      if (index !== -1) {
        activities.value[index] = detailedActivity;
      }
      
      // Set as selected
      selectedActivity.value = detailedActivity;
    }
  } catch (err: any) {
    error.value = `Failed to load activity details: ${err.message}`;
  }
}

// Load all progress data
async function loadAllProgress() {
  isLoading.value = true;
  error.value = null;
  
  try {
    if (!authStore.isAuthenticated) {
      throw new Error('You must be logged in to view progress');
    }
    
    // Load all progress from the service
    activities.value = await progressService.getAllUserProgress();
  } catch (err: any) {
    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
}

// Load data on component mount
onMounted(() => {
  loadAllProgress();
});
</script> 