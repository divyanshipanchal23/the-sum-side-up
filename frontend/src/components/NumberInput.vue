<template>
  <div class="number-input-container">
    <label 
      v-if="label" 
      :for="`number-input-${inputId}`" 
      class="block text-sm font-medium text-gray-700 mb-1"
    >
      {{ label }}
    </label>
    
    <div class="flex items-center">
      <button 
        v-if="showNumberButtons" 
        @click="decrementValue"
        :disabled="isAtMin"
        class="decrement-btn rounded-l-md p-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        :class="{ 'opacity-50 cursor-not-allowed': isAtMin }"
        aria-label="Decrease value"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
        </svg>
      </button>
      
      <input
        :id="`number-input-${inputId}`"
        type="number"
        v-model="localValue"
        :min="min"
        :max="max"
        :step="step"
        class="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-black"
        :class="{ 'rounded-l-none rounded-r-none': showNumberButtons, 'rounded-md': !showNumberButtons }"
        @input="handleInput"
        @keydown.up.prevent="incrementValue"
        @keydown.down.prevent="decrementValue"
        :aria-valuemin="min"
        :aria-valuemax="max"
        :aria-valuenow="localValue"
        :aria-label="ariaLabel || label || 'Number input'"
        aria-live="polite"
      />
      
      <button 
        v-if="showNumberButtons" 
        @click="incrementValue"
        :disabled="isAtMax"
        class="increment-btn rounded-r-md p-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        :class="{ 'opacity-50 cursor-not-allowed': isAtMax }"
        aria-label="Increase value"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
    
    <div v-if="error" class="mt-1 text-sm text-red-600" role="alert">
      {{ error }}
    </div>
    
    <div v-if="helperText" class="mt-1 text-sm text-gray-500">
      {{ helperText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  modelValue: number;
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  error?: string;
  helperText?: string;
  showNumberButtons?: boolean;
  ariaLabel?: string;
}

// Generate a unique ID for the component
const inputId = uuidv4().substring(0, 8);

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  step: 1,
  showNumberButtons: false
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>();

// Local value to handle input changes
const localValue = ref(props.modelValue);

// Computed properties for input states
const isAtMin = computed(() => Number(localValue.value) <= props.min);
const isAtMax = computed(() => Number(localValue.value) >= props.max);

// Functions for increment and decrement
function incrementValue() {
  if (!isAtMax.value) {
    const newValue = Number(localValue.value) + props.step;
    // Ensure we don't exceed max value
    localValue.value = Math.min(newValue, props.max);
    emit('update:modelValue', Number(localValue.value));
  }
}

function decrementValue() {
  if (!isAtMin.value) {
    const newValue = Number(localValue.value) - props.step;
    // Ensure we don't go below min value
    localValue.value = Math.max(newValue, props.min);
    emit('update:modelValue', Number(localValue.value));
  }
}

// Handle input changes
function handleInput() {
  // Convert to number and constrain between min and max
  let newValue = Number(localValue.value);
  
  // Handle NaN
  if (isNaN(newValue)) {
    newValue = props.min;
  }
  
  // Clamp between min and max
  newValue = Math.max(Math.min(newValue, props.max), props.min);
  
  // Update local value
  localValue.value = newValue;
  
  // Emit the change
  emit('update:modelValue', newValue);
}

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  // Only update if the values are different
  if (Number(localValue.value) !== Number(newValue)) {
    localValue.value = newValue;
  }
});

onMounted(() => {
  // Ensure initial value is valid
  handleInput();
});
</script>

<style scoped>
.number-input-container {
  margin-bottom: 1rem;
}

/* Focus outline styles for better visibility */
button:focus, input:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

input[type="number"] {
  -moz-appearance: textfield; /* Firefox */
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style> 