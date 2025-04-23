<template>
  <div 
    class="balance-scale-container" 
    :key="`scale-${leftValue}-${rightValue}`"
    role="img" 
    :aria-label="`Balance scale with ${leftValue} on the left side and ${rightValue} on the right side. ${getBalanceDescription}`"
  >
    <div class="scale-base">
      <!-- Base and stand -->
      <div class="scale-stand-base"></div>
      <div class="scale-stand"></div>
      <div class="scale-fulcrum"></div>
      
      <!-- Beam with pivot point -->
      <div 
        class="scale-beam" 
        :class="{ 'tilted-left': tilt > 0, 'tilted-right': tilt < 0, 'balanced': tilt === 0 }"
        :style="{ transform: `translateX(-50%) rotate(${tilt}deg)` }"
      >
        <div class="pivot-point"></div>
        
        <!-- Left chain and pan -->
        <div class="scale-chain left-chain"></div>
        <div class="scale-pan left-pan">
          <div class="scale-pan-content" aria-live="polite">
            <slot name="left-content">{{ leftValue }}</slot>
          </div>
        </div>
        
        <!-- Right chain and pan -->
        <div class="scale-chain right-chain"></div>
        <div class="scale-pan right-pan">
          <div class="scale-pan-content" aria-live="polite">
            <slot name="right-content">{{ rightValue }}</slot>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Display the values numerically for clarity -->
    <div class="scale-values flex justify-between w-full px-8 mt-2">
      <div class="left-value text-blue-600 font-semibold">
        Left: {{ leftValue }}
      </div>
      <div class="right-value text-indigo-600 font-semibold">
        Right: {{ rightValue }}
      </div>
    </div>
    
    <div class="scale-feedback" v-if="showFeedback" aria-live="assertive">
      <div v-if="tilt > 0" class="text-red-500">
        Right side is heavier
      </div>
      <div v-else-if="tilt < 0" class="text-red-500">
        Left side is heavier
      </div>
      <div v-else class="text-green-500">
        The scale is balanced!
      </div>
    </div>
    
    <!-- Screen reader only text for balance state -->
    <div class="sr-only" aria-live="assertive">
      {{ getBalanceDescription }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { useGameStore } from '@/stores/gameStore';

const props = defineProps<{
  leftValue: number;
  rightValue: number;
  showFeedback?: boolean;
  showBalanceLine?: boolean;
}>();

// Expose reset method to parent component
defineExpose({
  resetScale
});

// Set up game store for target number
const gameStore = useGameStore();
// Create a computed property to access the targetNumber
const targetNumber = computed(() => gameStore.targetNumber);

// Create internal refs for left and right values to avoid direct prop binding issues
const leftValue = ref(Number(props.leftValue) || 0);
const rightValue = ref(Number(props.rightValue) || 0);

// Computed property for whether the scale is balanced
const isBalanced = computed(() => {
  const tolerance = 0.0001; // Small tolerance for floating point errors
  return Math.abs(leftValue.value - rightValue.value) <= tolerance;
});

// Computed property for tilt calculation based on internal values
const tilt = computed(() => {
  // Skip calculation if both values are zero
  if (leftValue.value === 0 && rightValue.value === 0) return 0;
  
  // Get the difference between left and right
  const diff = leftValue.value - rightValue.value;
  
  // Calculate the angle with a maximum tilt of 15 degrees
  // Use a hyperbolic tangent function to create a smooth transition
  // Added negative sign to make the beam tilt down on the heavier side
  const maxAngle = 15; // maximum rotation in degrees
  const scaleFactor = 0.1; // controls how quickly it reaches max angle
  const angle = -1 * Math.tanh(diff * scaleFactor) * maxAngle;
  
  return angle;
});

// Feedback message based on balance state
const feedbackMessage = computed(() => {
  if (isBalanced.value) {
    return 'Balanced!';
  } else if (leftValue.value > rightValue.value) {
    const diff = leftValue.value - rightValue.value;
    return `Left side is heavier by ${diff.toFixed(1)}`;
  } else {
    const diff = rightValue.value - leftValue.value;
    return `Right side is heavier by ${diff.toFixed(1)}`;
  }
});

// Watch props to update internal values
watch(() => props.leftValue, (newValue) => {
  const numValue = Number(newValue);
  console.log(`Left prop changed to ${newValue}, setting leftValue to ${numValue}`);
  leftValue.value = numValue;
}, { immediate: true });

watch(() => props.rightValue, (newValue) => {
  const numValue = Number(newValue);
  console.log(`Right prop changed to ${newValue}, setting rightValue to ${numValue}`);
  rightValue.value = numValue;
}, { immediate: true });

// Watch target number to detect changes
watch(() => targetNumber.value, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    console.log(`Target number changed in BalanceScale: ${oldValue} -> ${newValue}`);
    
    // Reset internal values when target changes
    if (props.rightValue !== rightValue.value) {
      console.log(`Resetting rightValue from ${rightValue.value} to ${props.rightValue}`);
      rightValue.value = Number(props.rightValue);
    }
  }
}, { immediate: true });

// Function to reset the scale when called from parent
function resetScale() {
  console.log('Resetting scale values to defaults');
  leftValue.value = Number(props.leftValue) || 0;
  rightValue.value = Number(props.rightValue) || 0;
}

onMounted(() => {
  console.log('BalanceScale mounted with values:', { 
    left: props.leftValue, 
    right: props.rightValue,
    target: targetNumber.value
  });
});

// Computed property for screen reader descriptions
const getBalanceDescription = computed(() => {
  if (tilt.value > 0) {
    return `The scale is tilted to the right. ${leftValue.value} is less than ${rightValue.value}.`;
  } else if (tilt.value < 0) {
    return `The scale is tilted to the left. ${leftValue.value} is greater than ${rightValue.value}.`;
  } else {
    return `The scale is balanced. ${leftValue.value} equals ${rightValue.value}.`;
  }
});
</script>

<style scoped>
.balance-scale-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 0;
}

.scale-base {
  position: relative;
  width: 100%;
  height: 300px; /* Increased height for better proportions */
}

/* Base of the stand */
.scale-stand-base {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 15px;
  background-color: #4b5563;
  border-radius: 4px;
}

/* Vertical stand */
.scale-stand {
  position: absolute;
  bottom: 15px; /* Sits on top of the base */
  left: 50%;
  transform: translateX(-50%);
  width: 14px;
  height: 150px;
  background-color: #6b7280;
  border-radius: 4px;
}

/* Fulcrum at the top of the stand */
.scale-fulcrum {
  position: absolute;
  bottom: 165px; /* Stand height + base height */
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 15px;
  background-color: #4b5563;
  border-radius: 50% 50% 0 0;
  z-index: 5;
}

/* Horizontal beam */
.scale-beam {
  position: absolute;
  bottom: 180px; /* Adjusted to sit properly on the fulcrum */
  left: 50%;
  transform-origin: center center; /* Rotate from exact center */
  width: 70%;
  height: 8px;
  background-color: #4b5563;
  border-radius: 4px;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); /* Bouncy, more noticeable animation */
}

/* Center pivot point */
.pivot-point {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 14px;
  background-color: #9ca3af;
  border-radius: 50%;
  border: 2px solid #6b7280;
  z-index: 10;
}

/* Chains connecting beam to pans */
.scale-chain {
  position: absolute;
  width: 2px;
  height: 60px;
  background-color: #9ca3af;
  top: 4px; /* Start from beam */
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); /* Match beam animation */
}

.left-chain {
  left: 20%;
}

.right-chain {
  right: 20%;
}

/* Scale pans */
.scale-pan {
  position: absolute;
  width: 80px;
  height: 80px;
  background-color: #6366f1;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  top: 64px; /* Chain height + beam height */
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); /* Match beam animation */
}

.left-pan {
  left: 20%;
  transform: translateX(-50%);
}

.right-pan {
  right: 20%;
  transform: translateX(50%);
}

.scale-pan-content {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

/* Tilt classes are now handled by the :style binding */
.tilted-left, .tilted-right, .balanced {
  /* These classes can be used for additional styling */
}

.scale-feedback {
  margin-top: 2rem;
  font-size: 1.2rem;
  font-weight: bold;
  text-align: center;
}

/* Screen reader only class */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.scale-info {
  display: flex;
  justify-content: space-around;
  margin-bottom: 10px;
  font-size: 0.8rem;
  color: #777;
}

.scale-value {
  background-color: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
}
</style> 