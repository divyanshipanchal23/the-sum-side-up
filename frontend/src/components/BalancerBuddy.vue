<template>
  <div class="mascot-container" :class="{ 'animate-bounce': isAnimating }">
    <!-- Mascot Character (Simple SVG owl) -->
    <div class="mascot" @click="toggleAnimation">
      <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <!-- Body -->
        <ellipse cx="60" cy="75" rx="40" ry="35" :fill="mascotColors.body" />
        
        <!-- Head -->
        <circle cx="60" cy="50" r="30" :fill="mascotColors.head" />
        
        <!-- Eyes -->
        <g v-if="expression === 'happy' || expression === 'neutral'">
          <circle cx="45" cy="45" r="10" fill="white" />
          <circle cx="75" cy="45" r="10" fill="white" />
          <circle cx="45" cy="45" r="5" fill="black" />
          <circle cx="75" cy="45" r="5" fill="black" />
        </g>
        
        <!-- Surprised Eyes -->
        <g v-if="expression === 'surprised'">
          <circle cx="45" cy="45" r="12" fill="white" />
          <circle cx="75" cy="45" r="12" fill="white" />
          <circle cx="45" cy="45" r="6" fill="black" />
          <circle cx="75" cy="45" r="6" fill="black" />
        </g>
        
        <!-- Thinking Eyes -->
        <g v-if="expression === 'thinking'">
          <circle cx="45" cy="45" r="10" fill="white" />
          <circle cx="75" cy="45" r="10" fill="white" />
          <circle cx="45" cy="48" r="5" fill="black" />
          <circle cx="75" cy="48" r="5" fill="black" />
        </g>
        
        <!-- Beak -->
        <path d="M50,60 Q60,70 70,60 Z" :fill="mascotColors.beak" />
        
        <!-- Graduation Cap (when in teaching mode) -->
        <g v-if="hasGraduationCap">
          <rect x="40" y="25" width="40" height="5" fill="#333" />
          <rect x="45" y="15" width="30" height="10" fill="#333" />
          <rect x="57" y="5" width="6" height="10" fill="#333" />
          <circle cx="60" cy="5" r="3" fill="#FFD166" />
        </g>
        
        <!-- Eyebrows for expressions -->
        <g v-if="expression === 'thinking'">
          <path d="M35,35 Q45,30 55,35" fill="none" stroke="#333" stroke-width="2" />
          <path d="M65,35 Q75,30 85,35" fill="none" stroke="#333" stroke-width="2" />
        </g>
        
        <!-- Wings -->
        <path d="M20,75 Q40,90 20,110" :fill="mascotColors.wings" />
        <path d="M100,75 Q80,90 100,110" :fill="mascotColors.wings" />
      </svg>
    </div>
    
    <!-- Speech Bubble (only shown when there's a message) -->
    <div v-if="message && showMessage" class="speech-bubble" @click.stop="dismissMessage">
      <p class="message-text">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const props = defineProps({
  message: {
    type: String,
    default: ''
  },
  expression: {
    type: String,
    default: 'happy', // 'happy', 'neutral', 'surprised', 'thinking'
    validator: (value: string) => ['happy', 'neutral', 'surprised', 'thinking'].includes(value)
  },
  hasGraduationCap: {
    type: Boolean,
    default: true
  },
  theme: {
    type: String,
    default: 'default', // 'default', 'colorful'
  }
});

const emit = defineEmits(['messageDismissed']);

// Set up a reactive state for animation
const isAnimating = ref(false);
// Control visibility of the speech bubble
const showMessage = ref(true);

// Create computed property for mascot colors based on theme
const mascotColors = computed(() => {
  if (props.theme === 'colorful') {
    return {
      body: '#BDADEA', // Light Lavender
      head: '#4A90E2', // Primary Blue
      wings: '#BDADEA', // Light Lavender
      beak: '#FFD166'  // Sunshine Yellow
    };
  }
  return {
    body: '#BDADEA', // Light Lavender
    head: '#4A90E2', // Primary Blue
    wings: '#BDADEA', // Light Lavender
    beak: '#FFD166'  // Sunshine Yellow
  };
});

// Toggle animation state when clicked
function toggleAnimation() {
  isAnimating.value = true;
  
  // Turn off animation after 1 second
  setTimeout(() => {
    isAnimating.value = false;
  }, 1000);
}

// Function to dismiss the message bubble
function dismissMessage(event: MouseEvent) {
  event.stopPropagation(); // Prevent event bubbling
  showMessage.value = false;
  emit('messageDismissed');
}

// Watch for message changes to trigger animation and reset bubble visibility
watch(() => props.message, (newValue) => {
  if (newValue) {
    isAnimating.value = true;
    showMessage.value = true; // Show the message bubble when there's a new message
    setTimeout(() => {
      isAnimating.value = false;
    }, 1000);
  }
});
</script>

<style scoped>
.mascot-container {
  position: relative;
  display: inline-block;
  transition: transform 0.3s ease;
}

.mascot {
  cursor: pointer;
  transform-origin: bottom center;
  transition: transform 0.3s ease;
}

.mascot:hover {
  transform: scale(1.05);
}

.speech-bubble {
  position: absolute;
  top: -20px;
  right: -180px;
  background-color: white;
  border: 2px solid #4A90E2;
  border-radius: 20px;
  padding: 10px 15px;
  min-width: 150px;
  max-width: 200px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.speech-bubble:hover {
  background-color: #f8f9ff;
  transform: scale(1.03);
}

.speech-bubble::before {
  content: '';
  position: absolute;
  left: -10px;
  top: 40%;
  border-width: 10px 10px 10px 0;
  border-style: solid;
  border-color: transparent #4A90E2 transparent transparent;
}

.speech-bubble::after {
  content: '';
  position: absolute;
  left: -7px;
  top: 40%;
  border-width: 8px 8px 8px 0;
  border-style: solid;
  border-color: transparent white transparent transparent;
}

.message-text {
  font-size: 14px;
  color: #333;
  margin: 0;
}

/* Animation class applied when message changes or mascot is clicked */
.animate-bounce {
  animation: bounce 0.5s ease infinite alternate;
}

@keyframes bounce {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-10px);
  }
}
</style> 