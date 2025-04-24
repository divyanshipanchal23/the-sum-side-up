<template>
  <div class="balance-scale-container">
    <!-- Fulcrum and stand with more dimension -->
    <div class="fulcrum">
      <div class="stand-top"></div>
      <div class="stand"></div>
      <div class="stand-base"></div>
    </div>
    
    <!-- Beam with physics-based animation -->
    <div 
      class="beam" 
      :class="{ 'balanced': isBalanced, 'left-heavy': leftWeight > rightWeight, 'right-heavy': rightWeight > leftWeight }"
      :style="beamStyle"
    >
      <!-- Left pan with 3D effect -->
      <div class="pan-container left">
        <div class="pan-string"></div>
        <div class="pan" :class="{ 'weighted': leftWeight > 0 }">
          <div class="pan-inner">
            <div class="pan-content">
              <TransitionGroup name="number-block">
                <div 
                  v-for="(block, index) in leftBlocks" 
                  :key="`left-${index}`" 
                  class="number-block"
                  :style="getBlockStyle(block)"
                >
                  {{ block }}
                </div>
              </TransitionGroup>
              <div v-if="!leftBlocks.length && leftWeight > 0" class="sum-value">{{ leftWeight }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Right pan with 3D effect -->
      <div class="pan-container right">
        <div class="pan-string"></div>
        <div class="pan" :class="{ 'weighted': rightWeight > 0 }">
          <div class="pan-inner">
            <div class="pan-content">
              <TransitionGroup name="number-block">
                <div 
                  v-for="(block, index) in rightBlocks" 
                  :key="`right-${index}`" 
                  class="number-block target-block"
                  :style="getBlockStyle(block)"
                >
                  {{ block }}
                </div>
              </TransitionGroup>
              <div v-if="!rightBlocks.length && rightWeight > 0" class="sum-value target-value">{{ rightWeight }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Balance indicator with animation -->
    <Transition name="fade-scale">
      <div v-if="isBalanced && showFeedback" class="balance-indicator">
        <div class="indicator-text">Balanced!</div>
      </div>
    </Transition>
    
    <!-- Weight indicators -->
    <div class="weight-indicators">
      <div class="weight left">Left: {{ leftWeight }}</div>
      <div class="weight right">Right: {{ rightWeight }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';

const props = defineProps({
  // Support both direct values and block arrays for flexibility
  leftValue: {
    type: Number,
    default: 0
  },
  rightValue: {
    type: Number,
    default: 0
  },
  leftBlocks: {
    type: Array as () => number[],
    default: () => []
  },
  rightBlocks: {
    type: Array as () => number[],
    default: () => []
  },
  showFeedback: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['balanced', 'unbalanced']);

// Calculate weights based on direct values or block arrays
const leftWeight = computed(() => 
  props.leftBlocks.length > 0 
    ? props.leftBlocks.reduce((sum, num) => sum + num, 0)
    : props.leftValue
);

const rightWeight = computed(() => 
  props.rightBlocks.length > 0 
    ? props.rightBlocks.reduce((sum, num) => sum + num, 0)
    : props.rightValue
);

// Determine if the scale is balanced (within a small tolerance)
const isBalanced = computed(() => {
  const tolerance = 0.0001; // Small tolerance for floating point errors
  return Math.abs(leftWeight.value - rightWeight.value) <= tolerance && (leftWeight.value > 0 || rightWeight.value > 0);
});

// Calculate the beam angle based on weight difference
const beamAngle = computed(() => {
  if (isBalanced.value) return 0;
  
  const diff = leftWeight.value - rightWeight.value;
  // Limit the angle to a reasonable range (-20 to 20 degrees)
  const maxAngle = 20;
  // Scale the angle based on the relative weight difference
  const weightSum = Math.max(1, leftWeight.value + rightWeight.value);
  const scaledDiff = (diff / weightSum) * maxAngle;
  const angle = Math.max(-maxAngle, Math.min(maxAngle, scaledDiff * 2));
  
  return angle;
});

// Create the CSS style for the beam
const beamStyle = computed(() => ({
  transform: `rotate(${beamAngle.value}deg)`,
  transition: 'transform 0.8s cubic-bezier(0.68, -0.55, 0.27, 1.55)'
}));

// Generate a unique color based on the number value
const getBlockStyle = (value: number) => {
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
  
  const colorIndex = Math.abs(Math.floor(value)) % colors.length;
  const size = Math.min(50, Math.max(30, 30 + Math.abs(value) * 2)); // Size based on value
  
  return {
    backgroundColor: colors[colorIndex],
    width: `${size}px`,
    height: `${size}px`,
  };
};

// Emit events when balance state changes
watch(isBalanced, (newValue) => {
  if (newValue) {
    emit('balanced');
  } else {
    emit('unbalanced');
  }
});

// Function to reset the scale (can be called from parent)
const resetScale = () => {
  console.log('Enhanced balance scale reset');
};

// Expose methods to parent component
defineExpose({
  resetScale
});

onMounted(() => {
  console.log('Enhanced balance scale mounted with values:', { 
    left: leftWeight.value, 
    right: rightWeight.value
  });
});
</script>

<style scoped>
.balance-scale-container {
  position: relative;
  width: 100%;
  height: 350px;
  display: flex;
  justify-content: center;
  align-items: center;
  perspective: 800px;
}

.fulcrum {
  position: absolute;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
}

.stand-top {
  width: 30px;
  height: 10px;
  background-color: #9370DB;
  border-radius: 5px;
  margin-bottom: -5px;
  z-index: 2;
}

.stand {
  width: 20px;
  height: 120px;
  background: linear-gradient(90deg, #7A5DC7 0%, #9370DB 50%, #7A5DC7 100%);
  border-radius: 5px;
  box-shadow: -3px 0 6px rgba(0, 0, 0, 0.1), 3px 0 6px rgba(0, 0, 0, 0.1);
}

.stand-base {
  width: 60px;
  height: 15px;
  background: linear-gradient(90deg, #7A5DC7 0%, #9370DB 50%, #7A5DC7 100%);
  border-radius: 5px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.beam {
  position: absolute;
  width: 350px;
  height: 12px;
  background: linear-gradient(90deg, #5B86E5 0%, #7AA0F7 50%, #5B86E5 100%);
  border-radius: 6px;
  top: 120px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transform-origin: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 2;
}

.beam.balanced {
  animation: balance-celebration 0.8s ease-in-out;
}

.beam.left-heavy {
  transform-origin: center;
}

.beam.right-heavy {
  transform-origin: center;
}

.pan-container {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform-origin: top;
}

.pan-container.left {
  left: 20px;
}

.pan-container.right {
  right: 20px;
}

.pan-string {
  width: 2px;
  height: 60px;
  background-color: #A0AEC0;
  margin-bottom: -5px;
}

.pan {
  width: 100px;
  height: 20px;
  background: linear-gradient(180deg, #7AA0F7 0%, #5B86E5 100%);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  transform: perspective(500px) rotateX(10deg);
}

.pan-inner {
  width: 90px;
  height: 15px;
  background: linear-gradient(180deg, #E2E8F0 0%, #CBD5E0 100%);
  border-radius: 45%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.pan.weighted {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
  transform: perspective(500px) rotateX(0deg);
}

.pan-content {
  position: absolute;
  top: -50px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 5px;
  width: 120px;
}

.sum-value {
  font-size: 2rem;
  font-weight: bold;
  color: #4A90E2;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.target-value {
  color: #9370DB;
}

.number-block {
  width: 40px;
  height: 40px;
  background-color: #4A90E2;
  color: white;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-size: 1.2rem;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.target-block {
  background-color: #9370DB;
}

.number-block-enter-active,
.number-block-leave-active {
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.number-block-enter-from {
  opacity: 0;
  transform: translateY(-30px) scale(0.5);
}

.number-block-leave-to {
  opacity: 0;
  transform: translateY(30px) scale(0.5);
}

.balance-indicator {
  position: absolute;
  top: 50px;
  background-color: #06D6A0;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 20px;
  font-weight: bold;
  font-size: 1.2rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.weight-indicators {
  position: absolute;
  bottom: 10px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 50px;
}

.weight {
  background-color: rgba(255, 255, 255, 0.8);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.weight.left {
  color: #5B86E5;
}

.weight.right {
  color: #9370DB;
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.5);
}

@keyframes balance-celebration {
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(3deg);
  }
  75% {
    transform: rotate(-3deg);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .beam {
    width: 280px;
  }
  
  .pan-container.left {
    left: 10px;
  }
  
  .pan-container.right {
    right: 10px;
  }
  
  .pan {
    width: 80px;
  }
  
  .pan-inner {
    width: 72px;
  }
  
  .number-block {
    width: 30px;
    height: 30px;
    font-size: 1rem;
  }
}
</style> 