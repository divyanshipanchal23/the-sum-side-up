<template>
  <div class="star-reward-container">
    <h3 class="reward-title">{{ rewardTitle }}</h3>
    <div class="stars-container">
      <div 
        v-for="i in 3" 
        :key="i" 
        class="star-wrapper"
        :class="{ 'star-earned': i <= starsEarned, 'star-unearned': i > starsEarned }"
      >
        <svg 
          :class="{'appear-animation': i <= starsEarned && animateStars}" 
          viewBox="0 0 51 48" 
          width="40" 
          height="40"
        >
          <path 
            :fill="i <= starsEarned ? '#FFD166' : '#e2e8f0'"
            d="M25.5 0l6.2 18.9h19.9l-16.1 11.7 6.2 18.9-16.1-11.7-16.1 11.7 6.2-18.9-16.2-11.7h19.9z"
          />
        </svg>
      </div>
    </div>
    <p class="reward-message">{{ message }}</p>
    
    <!-- Confetti container (only shown when stars are earned) -->
    <div v-if="showConfetti" class="confetti-container">
      <div 
        v-for="i in confettiCount" 
        :key="i" 
        class="confetti-piece"
        :style="confettiStyle(i)"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';

const props = defineProps({
  stars: {
    type: Number,
    default: 0,
    validator: (value: number) => value >= 0 && value <= 3
  },
  title: {
    type: String,
    default: 'Great job!'
  },
  timeSpent: {
    type: Number,
    default: 0
  },
  accuracy: {
    type: Number,
    default: 0
  }, 
  showConfetti: {
    type: Boolean,
    default: true
  }
});

// Animate stars appearing one by one
const animateStars = ref(false);
const starsEarned = ref(0);

// Compute a message based on stars earned
const message = computed(() => {
  switch (starsEarned.value) {
    case 0:
      return "Keep practicing!";
    case 1:
      return "Good effort!";
    case 2:
      return "Well done!";
    case 3:
      return "Outstanding!";
    default:
      return "Try again!";
  }
});

// Compute title based on props or use default
const rewardTitle = computed(() => {
  return props.title;
});

// Set up confetti count and generate random styles for confetti pieces
const confettiCount = 50;

function confettiStyle(index: number) {
  // Create random sizes, colors, and animations for confetti pieces
  const colors = ['#FFD166', '#EF476F', '#06D6A0', '#4A90E2', '#BDADEA'];
  const size = Math.floor(Math.random() * 10) + 5; // 5-15px
  const colorIndex = Math.floor(Math.random() * colors.length);
  const left = Math.random() * 100; // 0-100%
  const animationDuration = (Math.random() * 3) + 2; // 2-5s
  const animationDelay = Math.random() * 2; // 0-2s
  
  return {
    '--size': `${size}px`,
    '--color': colors[colorIndex],
    '--left': `${left}%`,
    '--animation-duration': `${animationDuration}s`,
    '--animation-delay': `${animationDelay}s`,
  };
}

// Animate stars appearing one after another
function animateStarsSequentially() {
  starsEarned.value = 0;
  animateStars.value = true;
  
  // Animate each star with a delay
  const starDelay = 300; // ms
  for (let i = 1; i <= props.stars; i++) {
    setTimeout(() => {
      starsEarned.value = i;
    }, i * starDelay);
  }
}

// Watch for changes in props.stars to trigger animation
watch(() => props.stars, (newVal) => {
  if (newVal > 0) {
    animateStarsSequentially();
  }
}, { immediate: false });

// Initialize animations when component mounts
onMounted(() => {
  setTimeout(() => {
    animateStarsSequentially();
  }, 300);
});
</script>

<style scoped>
.star-reward-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.15);
  overflow: hidden;
  cursor: pointer;
}

.reward-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #4A90E2;
  margin-bottom: 1rem;
}

.stars-container {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.star-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
}

.star-earned svg {
  filter: drop-shadow(0 0 4px rgba(255, 209, 102, 0.8));
}

.star-unearned svg {
  opacity: 0.5;
}

.reward-message {
  font-size: 1.125rem;
  color: #4b5563;
  text-align: center;
}

/* Appear animation for stars */
.appear-animation {
  animation: appear 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  transform: scale(0);
}

@keyframes appear {
  0% {
    transform: scale(0) rotate(-15deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(10deg);
  }
  100% {
    transform: scale(1) rotate(0);
    opacity: 1;
  }
}

/* Confetti styles */
.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.confetti-piece {
  position: absolute;
  width: var(--size);
  height: var(--size);
  background-color: var(--color);
  top: -20px;
  left: var(--left);
  opacity: 0;
  animation: fall var(--animation-duration) ease-in-out var(--animation-delay) forwards;
}

@keyframes fall {
  0% {
    top: -20px;
    transform: rotate(0deg) translateX(0);
    opacity: 1;
  }
  50% {
    opacity: 1;
  }
  100% {
    top: 100%;
    transform: rotate(720deg) translateX(calc(var(--left) - 50%));
    opacity: 0;
  }
}
</style> 