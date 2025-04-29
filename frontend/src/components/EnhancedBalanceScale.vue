<template>
  <div class="balance-scale-container">
    <!-- Fulcrum and stand with more dimension -->
    <div class="fulcrum">
      <!-- Center vertical beam (purple) -->
      <div class="vertical-beam"></div>
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
      <!-- Beam connection points for better visualization -->
      <div class="connection-point left-connection"></div>
      <div class="connection-point center-connection"></div>
      <div class="connection-point right-connection"></div>
      
      <!-- Left pan with 3D effect -->
      <div class="pan-container left" :style="leftPanStyle">
        <div class="pan-string"></div>
        <div class="pan" :class="{ 'weighted': leftWeight > 0 }">
          <div class="pan-inner">
            <!-- Display number directly inside pan -->
            <div class="pan-number">{{ leftWeight }}</div>
          </div>
        </div>
      </div>
      
      <!-- Right pan with 3D effect -->
      <div class="pan-container right" :style="rightPanStyle">
        <div class="pan-string"></div>
        <div class="pan" :class="{ 'weighted': rightWeight > 0 }">
          <div class="pan-inner">
            <!-- Display number directly inside pan -->
            <div class="pan-number">{{ rightWeight }}</div>
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
  // const weightSum = leftWeight.value + rightWeight.value;
  const scaledDiff = (diff / weightSum) * maxAngle;
  // Add negative multiplier to make it tilt down on the heavier side
  const angle = -1 * Math.max(-maxAngle, Math.min(maxAngle, scaledDiff * 2));
  // const angle = -0.5 * scaledDiff * 2;
  return angle;
});

// Create the CSS style for the beam
const beamStyle = computed(() => ({
  transform: `rotate(${beamAngle.value}deg)`,
  transition: 'transform 0.8s cubic-bezier(0.68, -0.55, 0.27, 1.55)'
}));

// Add computed styles for pans to ensure they follow the beam properly
const leftPanStyle = computed(() => ({
  transform: `rotate(${-beamAngle.value}deg)`, // Counter-rotate to stay vertical
  transition: 'transform 0.8s cubic-bezier(0.68, -0.55, 0.27, 1.55)'
}));

const rightPanStyle = computed(() => ({
  transform: `rotate(${-beamAngle.value}deg)`, // Counter-rotate to stay vertical
  transition: 'transform 0.8s cubic-bezier(0.68, -0.55, 0.27, 1.55)'
}));

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
  height: 180px; /* Increased from 150px to match the simple scale's new spacing */
  display: flex;
  justify-content: center;
  align-items: center;
  perspective: 800px;
  margin-bottom: 0;
  padding: 1rem 0; /* Added vertical padding for more space */
}

.fulcrum {
  position: absolute;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
}

/* Vertical beam styling */
.vertical-beam {
  position: absolute;
  width: 14px; /* Reduced from 16px */
  height: 110px; /* Reduced from 140px */
  background-color: #9370DB; /* Purple */
  border-radius: 4px 4px 0 0; /* Reduced from 5px */
  bottom: 12px; /* Position to connect with stand-base */
  z-index: 3; /* Ensure it's above the stand but below the beam */
}

.stand-top {
  width: 20px; /* Reduced from 24px */
  height: 6px; /* Reduced from 8px */
  background-color: #9370DB;
  border-radius: 4px; /* Reduced from 5px */
  margin-bottom: -4px; /* Reduced from -5px */
  z-index: 2;
}

.stand {
  width: 14px; /* Reduced from 16px */
  height: 90px; /* Reduced from 120px */
  background-color: transparent; /* Make invisible as we're using vertical-beam instead */
}

.stand-base {
  width: 40px; /* Reduced from 50px */
  height: 10px; /* Reduced from 12px */
  background-color: #9370DB;
  border-radius: 4px; /* Reduced from 5px */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Improved beam styling */
.beam {
  position: absolute;
  width: 450px; /* Reduced from 500px */
  height: 8px; /* Reduced from 10px */
  background: linear-gradient(90deg, #4A90E2 0%, #6FA9F7 50%, #4A90E2 100%);
  border-radius: 4px; /* Reduced from 5px */
  top: 45px; /* Adjusted from 55px */
  transform-origin: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 2;
}

/* Added visible connection points */
.connection-point {
  position: absolute;
  width: 5px; /* Reduced from 6px */
  height: 5px; /* Reduced from 6px */
  background-color: #4A90E2;
  border: 1px solid #3A75D4;
  border-radius: 50%;
  bottom: -2.5px; /* Adjusted for smaller size */
  z-index: 3;
}

.left-connection {
  left: 100px; /* Reduced from 120px */
}

.center-connection {
  left: 50%;
  transform: translateX(-50%);
}

.right-connection {
  right: 100px; /* Reduced from 120px */
}

.beam.balanced {
  animation: balance-celebration 0.8s ease-in-out;
}

/* Improved pan container positioning */
.pan-container {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform-origin: top center;
}

.pan-container.left {
  left: 100px; /* Reduced from 120px */
  top: 8px; /* Reduced from 10px */
}

.pan-container.right {
  right: 100px; /* Reduced from 120px */
  top: 8px; /* Reduced from 10px */
}

/* Improved string styling */
.pan-string {
  width: 2px;
  height: 40px; /* Reduced from 50px */
  background-color: #A0AEC0;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.2);
}

/* Fixed pan shape to be circular */
.pan {
  width: 60px; /* Reduced from 70px */
  height: 60px; /* Reduced from 70px */
  background: linear-gradient(180deg, #4A90E2 0%, #6FA9F7 100%);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2); /* Reduced from 0 4px 8px */
  transition: all 0.3s ease;
}

.pan-inner {
  width: 50px; /* Reduced from 60px */
  height: 50px; /* Reduced from 60px */
  background: #E2E8F0;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.pan-number {
  font-size: 1.3rem; /* Reduced from 1.5rem */
  font-weight: bold;
  color: #4A90E2;
}

.pan.weighted {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
}

.balance-indicator {
  position: absolute;
  top: 70px; /* Adjusted from 20px to push it further down */
  background-color: #06D6A0;
  color: white;
  padding: 0.4rem 0.8rem; /* Reduced from 0.5rem 1rem */
  border-radius: 12px; /* Reduced from 16px */
  font-weight: bold;
  font-size: 0.9rem; /* Reduced from 1rem */
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2); /* Reduced from 0 4px 8px */
  z-index: 10;
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
    width: 280px; /* Reduced from 320px */
  }
  
  .left-connection {
    left: 50px; /* Reduced from 60px */
  }
  
  .right-connection {
    right: 50px; /* Reduced from 60px */
  }
  
  .pan-container.left {
    left: 50px; /* Reduced from 60px */
  }
  
  .pan-container.right {
    right: 50px; /* Reduced from 60px */
  }
  
  .pan {
    width: 60px; /* Reduced from 80px */
    height: 60px; /* Reduced from 80px */
  }
  
  .pan-inner {
    width: 50px; /* Reduced from 70px */
    height: 50px; /* Reduced from 70px */
  }
  
  .pan-number {
    font-size: 1.25rem; /* Reduced from 1.5rem */
  }
  
  .vertical-beam {
    height: 120px; /* Reduced from 220px */
  }
  
  .pan-string {
    height: 40px; /* Reduced from 50px */
  }
}
</style> 