<template>
  <div 
    class="mascot-container" 
    :class="[state, position, { 'draggable': isMobile, 'dragging': isDragging }]"
    :style="draggableStyle"
    ref="mascotContainerRef"
  >
    <Transition name="bubble">
      <div class="speech-bubble" v-if="message && showMessage" @click="handleBubbleClick">
        <p class="message-text">{{ message }}</p>
      </div>
    </Transition>
    
    <div class="reset-button" v-if="isMobile && isCustomPositioned" @click="resetPosition">
      Reset
    </div>
    
    <div 
      class="mascot" 
      :class="[animation, { 'hovered': isHovered }]" 
      @click="handleClick"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <div class="mascot-body">
        <div class="owl-body"></div>
        <div class="owl-eyes">
          <div class="eye left">
            <div class="pupil" :style="eyeStyle"></div>
          </div>
          <div class="eye right">
            <div class="pupil" :style="eyeStyle"></div>
          </div>
        </div>
        <div class="owl-beak"></div>
        <div class="owl-wings">
          <div class="wing left"></div>
          <div class="wing right"></div>
        </div>
        <div class="owl-feet">
          <div class="foot left"></div>
          <div class="foot right"></div>
        </div>
        <div v-if="state === 'celebrating'" class="graduation-cap"></div>
      </div>
      <div v-if="isMobile" class="drag-handle" aria-hidden="true">
        <span>Drag me</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  state: {
    type: String,
    default: 'idle', // idle, thinking, happy, celebrating, hint
  },
  message: {
    type: String,
    default: '',
  },
  position: {
    type: String,
    default: 'bottom-right', // top-left, top-right, bottom-left, bottom-right
  },
  animation: {
    type: String,
    default: '', // bounce, wave, spin, etc.
  }
});

const emit = defineEmits(['messageDismissed']);

// Control visibility of the speech bubble
const showMessage = ref(true);

// Interactive eye movement
const mousePosition = ref({ x: 0, y: 0 });
const eyeStyle = computed(() => {
  // Calculate eye movement based on mouse position
  // Limit the movement to a small range
  const maxMove = 3;
  const x = Math.max(-maxMove, Math.min(maxMove, (mousePosition.value.x / window.innerWidth - 0.5) * 10));
  const y = Math.max(-maxMove, Math.min(maxMove, (mousePosition.value.y / window.innerHeight - 0.5) * 10));
  
  return {
    transform: `translate(${x}px, ${y}px)`
  };
});

const handleMouseMove = (e: MouseEvent) => {
  mousePosition.value = { x: e.clientX, y: e.clientY };
};

// Separate handlers for bubble click and mascot click
const handleBubbleClick = (e: MouseEvent) => {
  e.stopPropagation(); // Prevent event from reaching the mascot
  if (props.message) {
    showMessage.value = false;
    emit('messageDismissed');
  }
};

// Handle click on the mascot itself
const handleClick = () => {
  // Don't trigger click when dragging on mobile
  if (isDragging.value) return;
  
  // If there's a message and it's not showing, make it visible again
  if (props.message && !showMessage.value) {
    showMessage.value = true;
  } else if (props.message && showMessage.value) {
    // If message is already showing, dismiss it
    showMessage.value = false;
    emit('messageDismissed');
  }
};

// Add hover animation
const isHovered = ref(false);

const handleMouseEnter = () => {
  isHovered.value = true;
};

const handleMouseLeave = () => {
  isHovered.value = false;
};

// Mobile drag functionality
const isMobile = ref(false);
const isDragging = ref(false);
const dragOffset = ref({ x: 0, y: 0 });
const position = ref({ x: null, y: null });
const isCustomPositioned = ref(false);
const mascotContainerRef = ref(null);

// Computed style for draggable positioning
const draggableStyle = computed(() => {
  if (position.value.x !== null && position.value.y !== null) {
    return {
      position: 'fixed',
      left: `${position.value.x}px`,
      top: `${position.value.y}px`,
      transform: 'none'
    };
  }
  return {};
});

// Load saved position from localStorage
const loadSavedPosition = () => {
  const savedPosition = localStorage.getItem('mascotPosition');
  if (savedPosition) {
    try {
      position.value = JSON.parse(savedPosition);
      isCustomPositioned.value = true;
    } catch (e) {
      console.error('Failed to parse saved mascot position:', e);
    }
  }
};

// Save position to localStorage
const savePosition = () => {
  localStorage.setItem('mascotPosition', JSON.stringify(position.value));
  isCustomPositioned.value = true;
};

// Reset position
const resetPosition = (e?: Event) => {
  if (e) e.stopPropagation();
  
  // Clear custom position
  position.value = { x: null, y: null };
  isCustomPositioned.value = false;
  
  // Remove from localStorage
  localStorage.removeItem('mascotPosition');
};

// Touch event handlers
const handleTouchStart = (e: TouchEvent) => {
  if (!isMobile.value) return;
  
  isDragging.value = true;
  const touch = e.touches[0];
  const rect = (mascotContainerRef.value as HTMLElement).getBoundingClientRect();
  
  // Calculate offset from the touch position to the top-left corner of the mascot
  dragOffset.value = {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top
  };
};

const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return;
  
  // Prevent default to stop scrolling when dragging
  e.preventDefault();
  
  const touch = e.touches[0];
  
  // Calculate new position based on touch position and drag offset
  position.value = {
    x: touch.clientX - dragOffset.value.x,
    y: touch.clientY - dragOffset.value.y
  };
};

const handleTouchEnd = () => {
  if (!isDragging.value) return;
  
  isDragging.value = false;
  
  // Don't save if moved off-screen
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  if (
    position.value.x < 0 || 
    position.value.x > width - 60 || 
    position.value.y < 0 || 
    position.value.y > height - 60
  ) {
    // If mascot is dragged off-screen, reset it to a safe position
    position.value = {
      x: Math.max(10, Math.min(width - 80, position.value.x)),
      y: Math.max(10, Math.min(height - 80, position.value.y))
    };
  }
  
  savePosition();
};

// Check for mobile device
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

// Watch for message changes to reset bubble visibility
watch(() => props.message, (newValue, oldValue) => {
  console.log(`Message changed from "${oldValue}" to "${newValue}"`);
  if (newValue && newValue !== oldValue) {
    showMessage.value = true;
  }
}, { immediate: true });

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('resize', checkMobile);
  
  // Check if we're on a mobile device
  checkMobile();
  
  // Load saved position if on mobile
  if (isMobile.value) {
    loadSavedPosition();
  }
  
  // Ensure message is visible on mount if one exists
  if (props.message) {
    showMessage.value = true;
  }
});

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove);
  window.removeEventListener('resize', checkMobile);
});
</script>

<style scoped>
.mascot-container {
  position: absolute;
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
}

/* When mascot is draggable (mobile), add specific styles */
.mascot-container.draggable {
  position: fixed;
  transition: none; /* Disable transition for smoother dragging */
  z-index: 999; /* Ensure it's above other elements */
}

/* Visual indication when dragging */
.mascot-container.dragging {
  opacity: 0.8;
  filter: brightness(1.2);
}

.bottom-right {
  bottom: 1rem;
  right: 1rem;
}

.top-right {
  top: 1rem;
  right: 1rem;
}

.bottom-left {
  bottom: 1rem;
  left: 1rem;
}

.top-left {
  top: 1rem;
  left: 1rem;
}

.center-left {
  top: 50%;
  left: 1rem;
  transform: translateY(-50%);
}

.bottom-center {
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
}

.top-center {
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

/* New position class for welcome screen with right-side speech bubble */
.top-center-right {
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

.mascot {
  width: 120px;
  height: 120px;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.mascot.hovered {
  transform: scale(1.1);
}

/* Drag handle that appears on mobile */
.drag-handle {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 10px;
  color: #666;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  opacity: 0.8;
  pointer-events: none; /* Ensures it doesn't interfere with touch events */
  animation: fadeInOut 3s infinite;
}

@keyframes fadeInOut {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

/* Additional styles for mobile */
@media (max-width: 768px) {
  .mascot-container.draggable .mascot {
    /* Add a subtle pulse effect to hint it's draggable */
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
}

.mascot-body {
  position: relative;
  width: 100%;
  height: 100%;
}

.owl-body {
  position: absolute;
  width: 100px;
  height: 120px;
  background-color: #9370DB;
  border-radius: 50%;
  bottom: 0;
  left: 10px;
}

.owl-eyes {
  position: absolute;
  top: 30px;
  left: 20px;
  width: 80px;
  display: flex;
  justify-content: space-between;
  z-index: 2;
}

.eye {
  width: 30px;
  height: 30px;
  background-color: white;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid #333;
}

.pupil {
  width: 12px;
  height: 12px;
  background-color: #333;
  border-radius: 50%;
  transition: transform 0.2s ease;
}

.owl-beak {
  position: absolute;
  top: 55px;
  left: 50px;
  width: 20px;
  height: 15px;
  background-color: #FFD166;
  clip-path: polygon(0% 0%, 100% 0%, 50% 100%);
  z-index: 1;
}

.owl-wings {
  position: absolute;
  bottom: 20px;
  width: 100%;
  display: flex;
  justify-content: space-between;
}

.wing {
  width: 25px;
  height: 60px;
  background-color: #7A5DC7;
  border-radius: 50%;
}

.wing.left {
  transform: rotate(-20deg);
  left: 0;
}

.wing.right {
  transform: rotate(20deg);
  right: 0;
}

.owl-feet {
  position: absolute;
  bottom: 0;
  left: 35px;
  width: 50px;
  display: flex;
  justify-content: space-between;
}

.foot {
  width: 15px;
  height: 10px;
  background-color: #FFD166;
  border-radius: 50% 50% 0 0;
}

.graduation-cap {
  position: absolute;
  top: 5px;
  left: 30px;
  width: 60px;
  height: 15px;
  background-color: #333;
  border-radius: 5px;
  z-index: 3;
}

.graduation-cap::before {
  content: '';
  position: absolute;
  top: -15px;
  left: 20px;
  width: 20px;
  height: 20px;
  background-color: #333;
  transform: rotate(45deg);
}

.graduation-cap::after {
  content: '';
  position: absolute;
  top: 0;
  left: 30px;
  width: 10px;
  height: 20px;
  background-color: #FFD166;
  border-radius: 0 0 5px 5px;
}

/* Improved speech bubble styling */
.speech-bubble {
  position: absolute;
  background-color: white;
  border: 2px solid #4A90E2;
  border-radius: 20px;
  padding: 10px 15px;
  min-width: 150px;
  max-width: 200px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
  z-index: 60;
}

/* Position the speech bubble for different mascot positions */
.bottom-right .speech-bubble,
.bottom-left .speech-bubble,
.bottom-center .speech-bubble {
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
}

.top-right .speech-bubble,
.top-left .speech-bubble,
.top-center .speech-bubble {
  bottom: -60px;
  left: 50%;
  transform: translateX(-50%);
}

/* New position for welcome screen - speech bubble on right side */
.top-center-right .speech-bubble {
  right: -230px;
  top: 40%;
  transform: translateY(-50%);
  max-width: 220px;
}

.center-left .speech-bubble {
  right: -180px;
  top: 40%;
  transform: translateY(-50%);
}

/* Mobile specific speech bubble positioning */
@media (max-width: 768px) {
  /* For draggable mascots, position speech bubble above the mascot */
  .mascot-container.draggable .speech-bubble {
    top: -80px;
    left: 50%;
    transform: translateX(-50%);
    min-width: 120px;
    max-width: 180px;
    font-size: 0.8rem;
  }
  
  /* Adjust arrow for mobile speech bubbles */
  .mascot-container.draggable .speech-bubble:after {
    bottom: -10px;
    top: auto;
    left: 50%;
    transform: translateX(-50%);
    border-width: 10px 10px 0;
    border-color: white transparent transparent;
  }
  
  /* Adjust border arrow for mobile speech bubbles */
  .mascot-container.draggable .speech-bubble:before {
    bottom: -12px;
    top: auto;
    left: 50%;
    transform: translateX(-50%);
    border-width: 12px 12px 0;
    border-color: #4A90E2 transparent transparent;
  }
}

.message-text {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
  color: #333;
}

@media (max-width: 768px) {
  .message-text {
    font-size: 0.8rem;
  }
}

.speech-bubble:after {
  content: '';
  position: absolute;
  border-style: solid;
}

/* Position the arrow based on container position */
.center-left .speech-bubble:after,
.top-center-right .speech-bubble:after {
  left: -10px;
  top: 50%;
  transform: translateY(-50%);
  border-width: 10px 10px 10px 0;
  border-color: transparent white transparent transparent;
}

.bottom-center .speech-bubble:after,
.bottom-right .speech-bubble:after,
.bottom-left .speech-bubble:after {
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 10px 10px 0;
  border-color: white transparent transparent;
}

.top-center .speech-bubble:after,
.top-right .speech-bubble:after,
.top-left .speech-bubble:after {
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 0 10px 10px;
  border-color: transparent transparent white;
}

/* Add a speech bubble border arrow */
.speech-bubble:before {
  content: '';
  position: absolute;
  border-style: solid;
  /* Border arrow will be positioned in similar places as the white arrow but slightly offset */
}

.center-left .speech-bubble:before,
.top-center-right .speech-bubble:before {
  left: -12px;
  top: 50%;
  transform: translateY(-50%);
  border-width: 12px 12px 12px 0;
  border-color: transparent #4A90E2 transparent transparent;
}

.bottom-center .speech-bubble:before,
.bottom-right .speech-bubble:before,
.bottom-left .speech-bubble:before {
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 12px 12px 0;
  border-color: #4A90E2 transparent transparent;
}

.top-center .speech-bubble:before,
.top-right .speech-bubble:before,
.top-left .speech-bubble:before {
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 0 12px 12px;
  border-color: transparent transparent #4A90E2;
}

/* Animations */
.bounce {
  animation: bounce 1s infinite alternate;
}

.wave {
  animation: wave 2s infinite;
}

.spin {
  animation: spin 1s;
}

.celebrating .owl-wings {
  animation: flap-wings 0.5s infinite alternate;
}

.thinking .owl-eyes .pupil {
  animation: blink 3s infinite;
}

.happy .owl-body {
  animation: happy-wiggle 1s infinite alternate;
}

.hint .speech-bubble {
  animation: pulse 1s infinite alternate;
}

/* Animation keyframes */
@keyframes bounce {
  from { transform: translateY(0); }
  to { transform: translateY(-10px); }
}

@keyframes wave {
  0% { transform: rotate(0deg); }
  10% { transform: rotate(14deg); }
  20% { transform: rotate(-8deg); }
  30% { transform: rotate(14deg); }
  40% { transform: rotate(-4deg); }
  50% { transform: rotate(10deg); }
  60% { transform: rotate(0deg); }
  100% { transform: rotate(0deg); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes flap-wings {
  from { transform: scaleY(1) rotate(0deg); }
  to { transform: scaleY(1.1) rotate(10deg); }
}

@keyframes blink {
  0%, 45%, 55%, 100% { transform: scale(1); }
  50% { transform: scale(0.1); }
}

@keyframes happy-wiggle {
  0% { transform: rotate(-3deg); }
  100% { transform: rotate(3deg); }
}

@keyframes pulse {
  from { transform: scale(1); box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
  to { transform: scale(1.05); box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2); }
}

.bubble-enter-active,
.bubble-leave-active {
  transition: all 0.3s ease;
}

.bubble-enter-from,
.bubble-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Responsive adjustments for small screens */
@media (max-width: 768px) {
  .speech-bubble {
    max-width: 180px;
    min-width: 100px;
    font-size: 0.8rem;
  }
  
  .center-left .speech-bubble {
    left: 110px;
  }
}

/* Reset button styling */
.reset-button {
  position: absolute;
  top: -30px;
  right: 0;
  background-color: rgba(255, 255, 255, 0.9);
  color: #4A90E2;
  border: 1px solid #4A90E2;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 10px;
  cursor: pointer;
  z-index: 2;
}

.reset-button:active {
  background-color: #4A90E2;
  color: white;
}
</style> 