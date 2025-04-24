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
      <div class="left-value text-primary font-semibold">
        Left: {{ leftValue }}
      </div>
      <div class="right-value text-accent-purple font-semibold">
        Right: {{ rightValue }}
      </div>
    </div>
    
    <div class="scale-feedback" v-if="showFeedback" aria-live="assertive">
      <div v-if="tilt > 0" class="text-accent-red">
        Right side is heavier
      </div>
      <div v-else-if="tilt < 0" class="text-accent-red">
        Left side is heavier
      </div>
      <div v-else class="text-secondary">
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
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 100px;
  height: 20px;
  background-color: #FFD166; /* Sunshine Yellow */
  border-radius: 6px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Vertical stand */
.scale-stand {
  position: absolute;
  left: 50%;
  bottom: 20px;
  transform: translateX(-50%);
  width: 20px;
  height: 180px;
  background-color: #4A90E2; /* Primary Blue */
  border-radius: 6px 6px 0 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Fulcrum (the peak part where the beam balances) */
.scale-fulcrum {
  position: absolute;
  left: 50%;
  bottom: 200px;
  transform: translateX(-50%);
  width: 40px;
  height: 15px;
  background-color: #BDADEA; /* Light Lavender */
  border-radius: 6px;
  z-index: 5;
}

/* Beam that tilts */
.scale-beam {
  position: absolute;
  left: 50%;
  bottom: 210px;
  width: 80%;
  height: 8px;
  background-color: #4A90E2; /* Primary Blue */
  border-radius: 4px;
  transform-origin: center center;
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 4;
}

.pivot-point {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 14px;
  background-color: #BDADEA; /* Light Lavender */
  border-radius: 50%;
  border: 2px solid #4A90E2; /* Primary Blue */
  z-index: 10;
}

/* Chains connecting beam to pans */
.scale-chain {
  position: absolute;
  width: 2px;
  height: 60px;
  background-color: #BDADEA; /* Light Lavender */
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
  background-color: #4A90E2; /* Primary Blue */
  border: 3px solid #BDADEA; /* Light Lavender */
}

.right-pan {
  right: 20%;
  transform: translateX(50%);
  background-color: #BDADEA; /* Light Lavender */
  border: 3px solid #4A90E2; /* Primary Blue */
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

.scale-values {
  background-color: #F0EBFF; /* Secondary Background */
  padding: 8px 16px;
  border-radius: 10px;
  margin-top: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
</style> 