<template>
  <div class="min-h-screen bg-gray-100 p-4">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-3xl font-bold text-indigo-600 mb-6">Game Configuration</h1>
      
      <div class="bg-white rounded-lg shadow-lg p-6">
        <!-- Configuration Form -->
        <form @submit="saveConfiguration" class="space-y-8">
          <!-- Configuration Name -->
          <div>
            <h2 class="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Basic Information</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="config-title" class="block text-sm font-medium text-gray-700 mb-1">Configuration Name</label>
                <input 
                  id="config-title" 
                  v-model="configForm.title" 
                  type="text" 
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Basic Addition for Grade 1"
                />
                <p v-if="!configForm.title && formSubmitted" class="mt-1 text-sm text-red-600">Please provide a name for this configuration</p>
              </div>
              
              <div>
                <label for="config-difficulty" class="block text-sm font-medium text-gray-700 mb-1">Difficulty Level</label>
                <select 
                  id="config-difficulty" 
                  v-model="configForm.difficulty" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
            
            <div class="mt-4">
              <label for="config-public" class="flex items-center">
                <input 
                  id="config-public" 
                  v-model="configForm.isPublic" 
                  type="checkbox"
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span class="ml-2 text-sm text-gray-700">Make this configuration available to other educators</span>
              </label>
            </div>
          </div>
          
          <!-- Number Range Settings -->
          <div>
            <h2 class="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Number Range</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Input Number Range</label>
                <div class="flex items-center space-x-4">
                  <div>
                    <label for="config-min-value" class="block text-xs text-gray-500">Min</label>
                    <NumberInput 
                      v-model="configForm.minValue"
                      :min="0" 
                      :max="configForm.maxValue - 1"
                      showNumberButtons
                      class="w-24"
                      @update:modelValue="validateRanges"
                    />
                  </div>
                  <span class="text-gray-500">to</span>
                  <div>
                    <label for="config-max-value" class="block text-xs text-gray-500">Max</label>
                    <NumberInput 
                      v-model="configForm.maxValue"
                      :min="configForm.minValue + 1" 
                      :max="100"
                      showNumberButtons
                      class="w-24"
                      @update:modelValue="validateRanges"
                    />
                  </div>
                </div>
                <p class="mt-1 text-sm text-gray-500">The range of numbers that can be input by students</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Target Number Range</label>
                <div class="flex items-center space-x-4">
                  <div>
                    <label for="config-target-min" class="block text-xs text-gray-500">Min</label>
                    <NumberInput 
                      v-model="configForm.targetRange.min"
                      :min="configForm.minValue" 
                      :max="configForm.targetRange.max - 1"
                      showNumberButtons
                      class="w-24"
                      @update:modelValue="validateRanges"
                    />
                  </div>
                  <span class="text-gray-500">to</span>
                  <div>
                    <label for="config-target-max" class="block text-xs text-gray-500">Max</label>
                    <NumberInput 
                      v-model="configForm.targetRange.max"
                      :min="configForm.targetRange.min + 1" 
                      :max="configForm.maxValue * configForm.numberOfAddends"
                      showNumberButtons
                      class="w-24"
                      @update:modelValue="validateRanges"
                    />
                  </div>
                </div>
                <p class="mt-1 text-sm text-gray-500">The range for target numbers to balance</p>
              </div>
            </div>
          </div>
          
          <!-- Addends and Time Limit -->
          <div>
            <h2 class="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Game Settings</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="config-addends" class="block text-sm font-medium text-gray-700 mb-1">Number of Addends</label>
                <div class="flex items-center space-x-4">
                  <NumberInput 
                    v-model="configForm.numberOfAddends"
                    :min="1" 
                    :max="5"
                    showNumberButtons
                    class="w-24"
                    @update:modelValue="validateRanges"
                  />
                </div>
                <p class="mt-1 text-sm text-gray-500">How many numbers students can add together</p>
              </div>
              
              <div>
                <label for="config-time-limit" class="block text-sm font-medium text-gray-700 mb-1">Time Limit (seconds)</label>
                <div class="flex items-center space-x-4">
                  <NumberInput 
                    v-model="configForm.timeLimit"
                    :min="0" 
                    :max="300"
                    showNumberButtons
                    class="w-24"
                  />
                </div>
                <p class="mt-1 text-sm text-gray-500">Set to 0 for no time limit</p>
              </div>
            </div>
            
            <div class="mt-4 space-y-2">
              <label class="flex items-center">
                <input 
                  v-model="configForm.hintsEnabled" 
                  type="checkbox"
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span class="ml-2 text-sm text-gray-700">Enable hints</span>
              </label>
            </div>
          </div>
          
          <!-- Progression Rules -->
          <div>
            <h2 class="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Progression Rules</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="config-success-rate" class="block text-sm font-medium text-gray-700 mb-1">Required Success Rate (%)</label>
                <div class="flex items-center space-x-4">
                  <NumberInput 
                    v-model="configForm.progressionRules.requiredSuccessRate"
                    :min="0" 
                    :max="100"
                    :step="5"
                    showNumberButtons
                    class="w-24"
                  />
                </div>
                <p class="mt-1 text-sm text-gray-500">Percentage of correct answers needed to advance</p>
              </div>
              
              <div>
                <label for="config-advancement-threshold" class="block text-sm font-medium text-gray-700 mb-1">Advancement Threshold</label>
                <div class="flex items-center space-x-4">
                  <NumberInput 
                    v-model="configForm.progressionRules.advancementThreshold"
                    :min="1" 
                    :max="20"
                    showNumberButtons
                    class="w-24"
                  />
                </div>
                <p class="mt-1 text-sm text-gray-500">Number of problems to solve before checking for advancement</p>
              </div>
            </div>
          </div>
          
          <!-- Game Preview -->
          <div class="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Configuration Preview</h2>
            
            <div class="flex flex-col md:flex-row md:space-x-8">
              <!-- Preview Information -->
              <div class="md:w-1/2 space-y-4">
                <div>
                  <h3 class="text-md font-medium text-gray-700">Game Setup</h3>
                  <ul class="mt-2 space-y-1 text-sm text-gray-600">
                    <li><span class="font-medium">Difficulty:</span> {{ configForm.difficulty }}</li>
                    <li><span class="font-medium">Input Numbers:</span> {{ configForm.minValue }} to {{ configForm.maxValue }}</li>
                    <li><span class="font-medium">Target Range:</span> {{ configForm.targetRange.min }} to {{ configForm.targetRange.max }}</li>
                    <li><span class="font-medium">Number of Addends:</span> {{ configForm.numberOfAddends }}</li>
                    <li v-if="configForm.timeLimit > 0"><span class="font-medium">Time Limit:</span> {{ configForm.timeLimit }} seconds</li>
                    <li v-else><span class="font-medium">Time Limit:</span> None</li>
                    <li><span class="font-medium">Hints:</span> {{ configForm.hintsEnabled ? 'Enabled' : 'Disabled' }}</li>
                  </ul>
                </div>
                
                <div>
                  <h3 class="text-md font-medium text-gray-700">Level Advancement</h3>
                  <p class="mt-2 text-sm text-gray-600">
                    Students will advance to the next level after solving 
                    {{ configForm.progressionRules.advancementThreshold }} problems with at least 
                    {{ configForm.progressionRules.requiredSuccessRate }}% accuracy.
                  </p>
                </div>
              </div>
              
              <!-- Preview Visualization -->
              <div class="md:w-1/2 mt-6 md:mt-0">
                <h3 class="text-md font-medium text-gray-700 mb-2">Example Problem:</h3>
                <div class="bg-white border border-gray-300 rounded-lg p-4">
                  <p class="text-gray-600 mb-3">Find values that add up to <span class="font-bold text-indigo-600">{{ previewTarget }}</span></p>
                  
                  <div class="flex flex-wrap gap-2 mb-4">
                    <div v-for="i in configForm.numberOfAddends" :key="i" class="bg-indigo-100 p-2 rounded-md flex items-center justify-center min-w-[3rem]">
                      <span class="text-indigo-800">?</span>
                    </div>
                    <div class="flex items-center">
                      <span class="text-gray-600 mx-2">=</span>
                      <span class="text-indigo-600 font-bold">{{ previewTarget }}</span>
                    </div>
                  </div>
                  
                  <p class="text-xs text-gray-500">
                    Students will select numbers between {{ configForm.minValue }} and {{ configForm.maxValue }}
                    to make the left side equal to {{ previewTarget }}.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Error message -->
          <div v-if="error" class="bg-red-50 border-l-4 border-red-400 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-700">{{ error }}</p>
              </div>
            </div>
          </div>
          
          <!-- Unsaved changes indicator -->
          <div v-if="formDirty && !successMessage && !error" class="bg-blue-50 border-l-4 border-blue-400 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-blue-700">You have unsaved changes. Click "Save Configuration" to save your changes.</p>
              </div>
            </div>
          </div>
          
          <!-- Success message -->
          <div v-if="successMessage" class="bg-green-50 border-l-4 border-green-400 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-green-700">{{ successMessage }}</p>
              </div>
            </div>
          </div>
          
          <!-- Buttons Section -->
          <div class="flex flex-wrap gap-4 mt-8">
            <button 
              type="submit" 
              class="px-6 py-3 bg-white text-black font-medium rounded-lg border border-indigo-600 hover:bg-gray-100 transition duration-300"
              :disabled="isLoading"
            >
              {{ isLoading ? 'Saving...' : 'Save Configuration' }}
            </button>
            
            <button 
              type="button" 
              @click="resetForm" 
              class="px-6 py-3 bg-white text-black font-medium rounded-lg border border-gray-300 hover:bg-gray-100 transition duration-300"
              :disabled="isLoading"
            >
              Reset Form
            </button>
            
            <router-link 
              to="/" 
              class="px-6 py-3 bg-white text-black font-medium rounded-lg border border-gray-300 hover:bg-gray-100 transition duration-300 inline-flex items-center"
            >
              Back to Home
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import NumberInput from '../components/NumberInput.vue';
import { useAuthStore } from '../stores/authStore';
import soundService from '../services/soundService';
import { v4 as uuidv4 } from 'uuid';
import configService, { GameConfig } from '../services/configService';
import { isEqual } from 'lodash';

const router = useRouter();
const authStore = useAuthStore();

// Form state
const formSubmitted = ref(false);
const error = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const isLoading = ref(false);
const formDirty = ref(false);  // Track if the form has unsaved changes
const lastSavedState = ref<string>('');  // Track the last saved state as JSON for comparison

// Helper function to perform deep clone of objects
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// Helper function to check if form is different from last saved state
function isFormChanged(): boolean {
  // Use lodash's isEqual for more robust comparison that handles deep structures, order, etc.
  return !isEqual(configForm.value, JSON.parse(lastSavedState.value || '{}'));
}

// Default configuration form values
const defaultConfig = {
  id: '',
  title: '',
  difficulty: 'beginner',
  minValue: 1,
  maxValue: 10,
  numberOfAddends: 2,
  targetRange: {
    min: 5,
    max: 20
  },
  timeLimit: 0, // 0 means no time limit
  hintsEnabled: true,
  progressionRules: {
    requiredSuccessRate: 80, // In percentage
    advancementThreshold: 5 // Number of problems before checking for advancement
  },
  isPublic: false,
  createdBy: ''
};

// Create reactive form with default values (using deep clone)
const configForm = ref(deepClone(defaultConfig));

// Generate a preview target number based on the configuration
const previewTarget = computed(() => {
  const min = configForm.value.targetRange.min;
  const max = configForm.value.targetRange.max;
  return Math.floor(Math.random() * (max - min + 1)) + min;
});

// Watch for form changes with specific action handling and debounce
let watchTimeout: number | null = null;
let initializing = true; // Flag to prevent watch reactions during initial form setup (reset to false at end of onMounted)

// Watch the entire ref and use deep tracking properly
watch(
  configForm,
  () => {
    // Skip changes during initialization
    if (initializing) {
      return;
    }
    
    console.log("Form change detected"); // Debug confirmation
    
    // Clear any pending timeout to debounce rapid changes
    if (watchTimeout !== null) {
      clearTimeout(watchTimeout);
    }
    
    // Immediately clear success message on ANY change
    if (successMessage.value) {
      successMessage.value = null;
    }
    
    // Debounce to avoid multiple triggers for related field changes
    watchTimeout = window.setTimeout(() => {
      // Check if the form has actually changed from last saved state
      if (isFormChanged()) {
        // Mark form as dirty (has unsaved changes)
        formDirty.value = true;
      } else {
        // If form matches the saved state, mark as not dirty
        formDirty.value = false;
      }
      
      watchTimeout = null;
    }, 150); // Increased timeout to better group related changes
  },
  { deep: true, immediate: false }
);

// Validate number ranges when changing values (without triggering save)
function validateRanges() {
  // Ensure the maximum input value is reasonable based on the number of addends
  configForm.value.maxValue = Math.min(configForm.value.maxValue, 100);
  
  // Make sure target ranges are within possible sums
  const maxPossibleSum = configForm.value.maxValue * configForm.value.numberOfAddends;
  
  // Adjust target range if necessary
  if (configForm.value.targetRange.max > maxPossibleSum) {
    configForm.value.targetRange.max = maxPossibleSum;
  }
  
  // Ensure target min is not less than smallest possible addend
  if (configForm.value.targetRange.min < configForm.value.minValue) {
    configForm.value.targetRange.min = configForm.value.minValue;
  }
  
  // Play sound effect
  soundService.play('click');
}

// Reset form to default values
function resetForm() {
  // Create a fresh copy of the default config
  const freshConfig = deepClone(defaultConfig);
  
  // Generate a new ID
  freshConfig.id = uuidv4();
  
  // Set a default title with timestamp
  const dateStr = new Date().toLocaleDateString();
  freshConfig.title = `Balance Scale Config (${dateStr})`;
  
  // Set the form to the fresh config
  configForm.value = freshConfig;
  
  // Reset form state
  formSubmitted.value = false;
  error.value = null;
  successMessage.value = null;
  
  // Update the last saved state and mark form as not dirty
  lastSavedState.value = JSON.stringify(freshConfig);
  formDirty.value = false;
  
  // Play sound effect
  soundService.play('click');
}

// Save configuration to Firestore (only when explicitly called by the submit button)
async function saveConfiguration(event: Event) {
  // Explicitly prevent default form submission behavior
  event.preventDefault();
  
  // Prevent duplicate submissions
  if (isLoading.value) {
    return;
  }
  
  // No need to save if nothing has changed
  if (!formDirty.value && lastSavedState.value !== '') {
    console.log('No changes to save');
    return;
  }
  
  formSubmitted.value = true;
  error.value = null;
  successMessage.value = null; // Clear any existing success message
  
  // Validate form
  if (!configForm.value.title.trim()) {
    error.value = 'Please provide a name for this configuration';
    soundService.play('incorrect');
    return;
  }
  
  isLoading.value = true;
  let apiErrorOccurred = false;
  
  try {
    // Generate a new ID if not editing an existing configuration
    if (!configForm.value.id) {
      configForm.value.id = uuidv4();
    }
    
    // Set creator ID
    configForm.value.createdBy = authStore.userId;
    
    // Create a copy to save (to avoid reactive changes during save)
    const configToSave = deepClone(configForm.value) as GameConfig;
    
    // Save configuration using our service
    await configService.saveConfiguration(configToSave);
    
    // Update the last saved state with the current form state
    lastSavedState.value = JSON.stringify(configForm.value);
    
    // Explicitly clear any existing success message before setting new one
    successMessage.value = null;
    
    // Show success message with configuration ID
    successMessage.value = `Configuration saved successfully! ID: ${configForm.value.id} Copy This ID to share with others!`;
    
    // Auto-hide success message after 4 seconds for better UX
    setTimeout(() => {
      // Only clear if it's the same message (in case of multiple saves)
      if (successMessage.value && successMessage.value.includes(configForm.value.id)) {
        successMessage.value = null;
      }
    }, 4000);
    
    // Play success sound
    soundService.play('correct');
    
    // Reset form state after successful save
    formSubmitted.value = false;
    formDirty.value = false;
  } catch (err: any) {
    console.error('Error saving configuration:', err);
    
    // Check if the error message indicates API error but Firestore success
    if (err.message && err.message.includes('API Error') && 
        !err.message.includes('Failed to save configuration')) {
      apiErrorOccurred = true;
      
      // Update the last saved state even with API error (Firestore succeeded)
      lastSavedState.value = JSON.stringify(configForm.value);
      
      // Explicitly clear any existing success message before setting new one
      successMessage.value = null;
      
      // Show partial success message
      successMessage.value = `Configuration saved to your account! ID: ${configForm.value.id} (Note: Could not sync to online database)`;
      
      // Auto-hide this message too
      setTimeout(() => {
        if (successMessage.value && successMessage.value.includes(configForm.value.id)) {
          successMessage.value = null;
        }
      }, 4000);
      
      soundService.play('correct');
      formDirty.value = false;  // Mark as saved even with API error
    } else {
      // Full error
      error.value = `Failed to save configuration: ${err.message}`;
      soundService.play('incorrect');
    }
  } finally {
    isLoading.value = false;
  }
}

// Initialize component
onMounted(async () => {
  // Set the creator ID on mount
  configForm.value.createdBy = authStore.userId;
  
  // Generate a new ID
  configForm.value.id = uuidv4();
  
  // Set a default title with timestamp
  const dateStr = new Date().toLocaleDateString();
  configForm.value.title = `Balance Scale Config (${dateStr})`;
  
  // Allow the component to fully mount before setting initial state
  await nextTick();
  
  // Set initial saved state
  lastSavedState.value = JSON.stringify(configForm.value);
  
  // Initially, the form is not dirty since nothing has been changed yet
  formDirty.value = false;
  
  // Mark initialization as complete
  initializing = false;
});
</script> 