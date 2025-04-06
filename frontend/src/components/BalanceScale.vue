<template>
  <div class="balance-scale-container" :key="`scale-${leftValue}-${rightValue}-${tilt}`">
    <div class="scale-base">
      <!-- Base and stand -->
      <div class="scale-stand-base"></div>
      <div class="scale-stand"></div>
      <div class="scale-fulcrum"></div>
      
      <!-- Beam with pivot point -->
      <div 
        class="scale-beam" 
        :class="{ 'tilted-left': tilt < 0, 'tilted-right': tilt > 0, 'balanced': tilt === 0 }"
        :style="{ transform: `translateX(-50%) rotate(${tilt}deg)` }"
      >
        <div class="pivot-point"></div>
        
        <!-- Left chain and pan -->
        <div class="scale-chain left-chain"></div>
        <div class="scale-pan left-pan">
          <div class="scale-pan-content">
            <slot name="left-content">{{ leftValue }}</slot>
          </div>
        </div>
        
        <!-- Right chain and pan -->
        <div class="scale-chain right-chain"></div>
        <div class="scale-pan right-pan">
          <div class="scale-pan-content">
            <slot name="right-content">{{ rightValue }}</slot>
          </div>
        </div>
      </div>
    </div>
    
    <div class="scale-feedback" v-if="showFeedback">
      <div v-if="tilt < 0" class="text-red-500">
        Left side is heavier
      </div>
      <div v-else-if="tilt > 0" class="text-red-500">
        Right side is heavier
      </div>
      <div v-else class="text-green-500">
        The scale is balanced!
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUpdated } from 'vue';

interface Props {
  leftValue?: number;
  rightValue?: number;
  showFeedback?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  leftValue: 0,
  rightValue: 0,
  showFeedback: true
});

// For forcing re-renders when values change
const forceUpdate = ref(0);

// Log when props change (for debugging)
watch(() => props.leftValue, (newVal, oldVal) => {
  console.log(`LeftValue changed: ${oldVal} -> ${newVal}`);
  forceUpdate.value++;
}, { immediate: true });

// Add a more explicit watcher for the rightValue (target number)
watch(() => props.rightValue, (newVal, oldVal) => {
  console.log(`RightValue (target) changed: ${oldVal} -> ${newVal}`);
  if (newVal !== 0) {
    console.log('Target number is not zero, forcing scale update');
    forceUpdate.value += 3; // Force a more aggressive update
  }
}, { immediate: true });

// Calculate the tilt based on the difference between leftValue and rightValue
const tilt = computed(() => {
  const diff = props.leftValue - props.rightValue;
  console.log(`Calculating tilt: leftValue=${props.leftValue}, rightValue=${props.rightValue}, diff=${diff}`);
  
  // Cap the tilt to a maximum of 15 degrees in either direction
  const maxTilt = 15;
  if (diff === 0) return 0;
  
  // Apply a non-linear tilt to make small differences more visible
  // Use a cubic function to increase sensitivity for small differences
  const cubicFactor = 0.1;
  
  // FIXED: Invert the direction to match physical expectations
  // When left > right, diff is positive, we want a negative tilt (left down)
  // When left < right, diff is negative, we want a positive tilt (right down)
  const direction = diff > 0 ? -1 : 1;
  const tiltAngle = direction * Math.min(Math.pow(Math.abs(diff), 1/3) * 5, maxTilt);
  
  console.log(`Calculated tilt angle: ${tiltAngle}`);
  return tiltAngle;
});

onMounted(() => {
  console.log("BalanceScale mounted");
  console.log(`Initial values: leftValue=${props.leftValue}, rightValue=${props.rightValue}`);
  
  // If rightValue is not zero, force an initial update
  if (props.rightValue !== 0) {
    console.log('Target number is not zero on mount, forcing initial update');
    setTimeout(() => {
      forceUpdate.value += 5;
    }, 100); // Short delay to ensure Vue has finished rendering
  }
});

onUpdated(() => {
  console.log("BalanceScale updated");
  console.log(`Current values: leftValue=${props.leftValue}, rightValue=${props.rightValue}, tilt=${tilt.value}`);
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
</style> 