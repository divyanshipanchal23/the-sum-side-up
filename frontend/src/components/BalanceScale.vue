<template>
  <div class="balance-scale-container">
    <div class="scale-base">
      <div class="scale-stand"></div>
      
      <div 
        class="scale-beam" 
        :class="{ 'tilted-left': tilt < 0, 'tilted-right': tilt > 0, 'balanced': tilt === 0 }"
        :style="{ transform: `rotate(${tilt}deg)` }"
      >
        <div class="scale-pan left-pan">
          <div class="scale-pan-content">
            <slot name="left-content">{{ leftValue }}</slot>
          </div>
        </div>
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
import { computed, ref, watch } from 'vue';

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

// Calculate the tilt based on the difference between leftValue and rightValue
const tilt = computed(() => {
  const diff = props.leftValue - props.rightValue;
  // Cap the tilt to a maximum of 15 degrees in either direction
  const maxTilt = 15;
  if (diff === 0) return 0;
  
  // Apply a non-linear tilt to make small differences visible
  // but prevent extreme angles for large differences
  const tiltAngle = Math.min(Math.max(diff * 2, -maxTilt), maxTilt);
  return tiltAngle;
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
  height: 200px;
}

.scale-stand {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 100px;
  background-color: #6b7280;
  border-radius: 4px;
}

.scale-beam {
  position: absolute;
  top: 50px;
  left: 50%;
  transform-origin: center;
  transform: translateX(-50%) rotate(0deg);
  width: 80%;
  height: 10px;
  background-color: #4b5563;
  border-radius: 4px;
  transition: transform 0.5s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.scale-pan {
  width: 100px;
  height: 100px;
  background-color: #6366f1;
  border-radius: 50%;
  margin-top: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.left-pan {
  margin-left: -50px;
}

.right-pan {
  margin-right: -50px;
}

.scale-pan-content {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.tilted-left {
  transform: translateX(-50%) rotate(-10deg);
}

.tilted-right {
  transform: translateX(-50%) rotate(10deg);
}

.balanced {
  transform: translateX(-50%) rotate(0deg);
}

.scale-feedback {
  margin-top: 2rem;
  font-size: 1.2rem;
  font-weight: bold;
  text-align: center;
}
</style> 