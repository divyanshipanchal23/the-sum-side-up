<template>
  <div class="number-controls">
    <h3 class="controls-title">Your Numbers:</h3>
    
    <div class="numbers-container">
      <TransitionGroup name="number-item">
        <div 
          v-for="(number, index) in numbers" 
          :key="index"
          class="number-item"
        >
          <div class="number-label">Number {{ index + 1 }}</div>
          <div class="number-control">
            <button 
              class="control-button decrease" 
              @click="updateNumber(index, -1)"
              :disabled="number <= minValue"
            >
              <span class="button-icon">−</span>
            </button>
            
            <div class="number-value" :style="getNumberStyle(number)">
              {{ number }}
            </div>
            
            <button 
              class="control-button increase" 
              @click="updateNumber(index, 1)"
              :disabled="number >= maxValue"
            >
              <span class="button-icon">+</span>
            </button>
          </div>
        </div>
      </TransitionGroup>
      
      <div class="sum-container">
        <div class="sum-label">Sum:</div>
        <div class="sum-value" :class="{ 
          'matching': sum === targetValue,
          'ready-to-check': sum === targetValue 
        }">
          {{ sum }}
        </div>
      </div>
      
      <div class="controls-actions">
        <button 
          v-if="numbers.length < maxNumbers" 
          class="action-button add-number"
          @click="addNumber"
        >
          Add Number
        </button>
        
        <button 
          v-if="numbers.length > 1" 
          class="action-button remove-number"
          @click="removeNumber"
        >
          Remove Number
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import soundService from '../services/soundService';

const props = defineProps({
  initialNumbers: {
    type: Array as () => number[],
    default: () => [0, 0]
  },
  minValue: {
    type: Number,
    default: 1
  },
  maxValue: {
    type: Number,
    default: 10
  },
  maxNumbers: {
    type: Number,
    default: 4
  },
  targetValue: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['update:numbers', 'sum-change', 'check-answer']);

const numbers = ref([...props.initialNumbers]);

const sum = computed(() => {
  // Make sure we're using numbers, not strings
  const total = numbers.value.reduce((total, num) => {
    return total + Number(num);
  }, 0);
  
  // Immediately emit the sum whenever it changes
  nextTick(() => {
    emit('sum-change', total);
  });
  
  return total;
});

// Generate a unique color based on the number value
const getNumberStyle = (value: number) => {
  const colors = [
    '#4A90E2', // blue
    '#FF8A65', // coral
    '#FFD166', // yellow
    '#06D6A0', // mint
    '#BDADEA', // lavender
    '#FF5C8D', // pink
    '#46CDCF', // teal
    '#FFA41B', // orange
    '#5D5FEF', // indigo
    '#00B8A9', // turquoise
  ];
  
  const colorIndex = Math.abs(value) % colors.length;
  
  return {
    backgroundColor: colors[colorIndex],
    color: 'white',
    borderColor: colors[colorIndex]
  };
};

const updateNumber = (index: number, change: number) => {
  const newValue = numbers.value[index] + change;
  
  if (newValue >= props.minValue && newValue <= props.maxValue) {
    // Play a sound for feedback
    soundService.play('click');
    
    const updatedNumbers = [...numbers.value];
    updatedNumbers[index] = newValue;
    numbers.value = updatedNumbers;
    emit('update:numbers', numbers.value);
    emit('sum-change', sum.value);
  }
};

const addNumber = () => {
  if (numbers.value.length < props.maxNumbers) {
    soundService.play('click');
    // Create a new array (important for reactivity)
    const newNumbers = [...numbers.value, 0];
    numbers.value = newNumbers;
    
    console.log('Adding number, new numbers array:', newNumbers);
    
    // Important: Emit the update with the new array
    emit('update:numbers', newNumbers);
    
    // Also emit the sum change
    emit('sum-change', sum.value);
  } else {
    console.warn('Cannot add more numbers. Maximum reached:', props.maxNumbers);
  }
};

const removeNumber = () => {
  if (numbers.value.length > 1) {
    soundService.play('click');
    // Create a new array (important for reactivity)
    const newNumbers = [...numbers.value];
    newNumbers.pop();
    numbers.value = newNumbers;
    
    console.log('Removing number, new numbers array:', newNumbers);
    
    // Important: Emit the update with the new array
    emit('update:numbers', newNumbers);
    
    // Also emit the sum change
    emit('sum-change', sum.value);
  } else {
    console.warn('Cannot remove numbers. Minimum one number required.');
  }
};

// Modified: Remove auto-checking behavior but keep visual feedback
watch(sum, (newSum) => {
  // Check if sum matches target
  if (newSum === props.targetValue) {
    console.log('Sum matches target, but NOT auto-triggering check-answer');
    // We no longer automatically emit the check-answer event
    // The user will need to click the Check Answer button
    
    // We still emit sum-change to update UI and show the matching state
    emit('sum-change', newSum);
  }
});

// Watch for external changes to initialNumbers
watch(() => props.initialNumbers, (newNumbers) => {
  console.log('initialNumbers watch triggered:', {
    new: newNumbers,
    current: numbers.value
  });
  
  // Only update if there's a real difference
  if (JSON.stringify(newNumbers) !== JSON.stringify(numbers.value)) {
    console.log('Updating internal numbers from props:', newNumbers);
    
    // Create a fresh array to ensure reactivity
    numbers.value = [...newNumbers];
  }
}, { deep: true, immediate: true });

onMounted(() => {
  // Initialize with correct values
  numbers.value = [...props.initialNumbers];
  // Initial sum emission
  emit('sum-change', sum.value);
});
</script>

<style scoped>
.number-controls {
  background-color: #F0EBFF;
  border-radius: 16px;
  padding: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.controls-title {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #4A4A4A;
}

.numbers-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.number-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.number-label {
  font-weight: bold;
  font-size: 0.8rem;
  color: #666;
}

.number-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-button {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background-color: white;
  color: #4A4A4A;
  font-size: 1.25rem;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.control-button:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}

.control-button:active:not(:disabled) {
  transform: scale(0.95);
}

.control-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button-icon {
  line-height: 1;
}

.number-value {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: #4A90E2;
  color: white;
  font-size: 1.25rem;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.sum-container {
  display: flex;
  align-items: center;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 2px dashed #D1D5DB;
}

.sum-label {
  font-weight: bold;
  font-size: 1rem;
  margin-right: 0.75rem;
  color: #4A4A4A;
}

.sum-value {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  background-color: #FFD166;
  color: #4A4A4A;
  font-size: 1.5rem;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
}

.sum-value.matching {
  background-color: #06D6A0;
  color: white;
  animation: pulse 1s infinite alternate;
  box-shadow: 0 0 15px rgba(6, 214, 160, 0.5);
}

.sum-value.ready-to-check::after {
  content: "✓";
  position: absolute;
  bottom: -16px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: #06D6A0;
  font-weight: bold;
}

.controls-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.action-button {
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: none;
  font-weight: bold;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.add-number {
  background-color: #4A90E2;
  color: white;
}

.remove-number {
  background-color: #F3F4F6;
  color: #4A4A4A;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.action-button:active {
  transform: translateY(0);
}

.number-item-enter-active,
.number-item-leave-active {
  transition: all 0.5s ease;
}

.number-item-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.number-item-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@keyframes pulse {
  from {
    box-shadow: 0 0 5px rgba(6, 214, 160, 0.5);
  }
  to {
    box-shadow: 0 0 15px rgba(6, 214, 160, 0.8);
  }
}

/* Make it responsive for smaller screens */
@media (max-width: 768px) {
  .number-controls {
    padding: 0.75rem;
  }
  
  .control-button {
    width: 28px;
    height: 28px;
  }
  
  .number-value {
    width: 36px;
    height: 36px;
    font-size: 1.1rem;
  }
  
  .sum-value {
    width: 40px;
    height: 40px;
    font-size: 1.25rem;
  }
  
  .controls-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .action-button {
    padding: 0.4rem 0.6rem;
    font-size: 0.8rem;
  }
}
</style> 