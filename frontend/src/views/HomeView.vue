<template>
  <div class="game-home-container">
    <!-- Animated background elements -->
    <div class="floating-elements">
      <div v-for="n in 12" :key="`element-${n}`" 
           class="floating-element" 
           :class="`element-${n}`"
           :style="getRandomStyle()">
        {{ getRandomMathSymbol() }}
      </div>
    </div>
    
    <!-- Main content card with playful design -->
    <div class="content-card">
      <!-- Mascot and title section -->
      <div class="header-section">
        <div class="mascot-container">
          <div class="owl-character">
            <div class="owl-body"></div>
            <div class="owl-eyes">
              <div class="eye left"><div class="pupil"></div></div>
              <div class="eye right"><div class="pupil"></div></div>
            </div>
            <div class="owl-beak"></div>
            <div class="owl-wings">
              <div class="wing left"></div>
              <div class="wing right"></div>
            </div>
            <div class="graduation-cap"></div>
          </div>
        </div>
        
        <div class="title-container">
          <h1 class="game-title">The Sum Side Up</h1>
          <div class="subtitle-container">
            <p class="game-subtitle">Learn addition through visual intuition and interactive balance scales!</p>
          </div>
        </div>
      </div>
      
      <!-- Status message (Debug information) -->
      <div class="status-message" v-if="firebaseStatus">
        <div class="status-icon" :class="{'success': !firebaseStatus.includes('failed'), 'error': firebaseStatus.includes('failed')}">
          <span v-if="firebaseStatus.includes('failed')">✕</span>
          <span v-else>✓</span>
        </div>
        <p>{{ firebaseStatus }}</p>
      </div>
      
      <div v-if="errorMessage" class="status-message error-message">
        <div class="status-icon error">✕</div>
        <p>{{ errorMessage }}</p>
      </div>
      
      <!-- Navigation buttons with icons and animations -->
      <div class="navigation-buttons">
        <div v-if="isAuthenticated">
          <router-link to="/game" class="nav-button play-button">
            <div class="button-icon">🎮</div>
            <span class="button-text">Start Playing</span>
            <div class="button-shine"></div>
          </router-link>
          
          <router-link to="/config" class="nav-button configure-button">
            <div class="button-icon">⚙️</div>
            <span class="button-text">Configure Games</span>
            <div class="button-shine"></div>
          </router-link>
          
          <router-link to="/progress" class="nav-button progress-button">
            <div class="button-icon">📊</div>
            <span class="button-text">View Progress</span>
            <div class="button-shine"></div>
          </router-link>
        </div>
        
        <div v-else>
          <router-link to="/game" class="nav-button play-button">
            <div class="button-icon">🎮</div>
            <span class="button-text">Start Playing</span>
            <div class="button-shine"></div>
          </router-link>
          
          <router-link to="/auth" class="nav-button auth-button">
            <div class="button-icon">🔑</div>
            <span class="button-text">Sign In / Register</span>
            <div class="button-shine"></div>
          </router-link>
        </div>
      </div>
      
      <!-- Sign out button -->
      <button v-if="isAuthenticated" class="sign-out-button" @click="handleLogout">
        <span>Sign Out</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/authStore';
import { useRouter } from 'vue-router';
import { computed, onMounted, ref } from 'vue';
import soundService from '../services/soundService';
import { auth } from '../services/firebase';

const authStore = useAuthStore();
const router = useRouter();
const firebaseStatus = ref('Checking Firebase status...');
const errorMessage = ref('');

const isAuthenticated = computed(() => authStore.isAuthenticated);

// Random style generator for floating elements
const getRandomStyle = () => {
  const size = Math.floor(Math.random() * 30) + 20; // 20-50px
  const top = Math.floor(Math.random() * 80) + 10; // 10-90%
  const left = Math.floor(Math.random() * 80) + 10; // 10-90%
  const animationDuration = Math.floor(Math.random() * 20) + 10; // 10-30s
  const delay = Math.floor(Math.random() * 10); // 0-10s
  
  return {
    width: `${size}px`,
    height: `${size}px`,
    top: `${top}%`,
    left: `${left}%`,
    animationDuration: `${animationDuration}s`,
    animationDelay: `${delay}s`
  };
};

// Random math symbol generator
const getRandomMathSymbol = () => {
  const symbols = ['+', '=', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  return symbols[Math.floor(Math.random() * symbols.length)];
};

async function handleLogout() {
  try {
    soundService.play('click');
    await authStore.logout();
    router.push('/');
  } catch (error) {
    console.error('Logout failed:', error);
    errorMessage.value = error instanceof Error ? error.message : 'Unknown error during logout';
  }
}

onMounted(() => {
  try {
    // Check if Firebase is initialized
    if (auth) {
      firebaseStatus.value = 'Firebase initialized successfully';
      
      // Verify we can access auth methods
      if (typeof auth.onAuthStateChanged === 'function') {
        console.log('Firebase auth methods are available');
      } else {
        firebaseStatus.value = 'Firebase auth API is not available';
      }
    } else {
      firebaseStatus.value = 'Firebase initialization failed';
    }
  } catch (err) {
    console.error('Error checking Firebase status:', err);
    firebaseStatus.value = 'Error checking Firebase status';
    errorMessage.value = err instanceof Error ? err.message : 'Unknown error';
  }
});
</script>

<style scoped>
.game-home-container {
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #F0EBFF 0%, #E6F7FF 100%);
  position: relative;
  overflow: hidden;
  padding: 20px;
}

/* Floating background elements */
.floating-elements {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 1;
  pointer-events: none;
}

.floating-element {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  font-weight: bold;
  color: white;
  animation: float linear infinite;
  opacity: 0.6;
}

.element-1, .element-5, .element-9 { background-color: #4A90E2; }
.element-2, .element-6, .element-10 { background-color: #FFD166; }
.element-3, .element-7, .element-11 { background-color: #06D6A0; }
.element-4, .element-8, .element-12 { background-color: #EF476F; }

@keyframes float {
  0% {
    transform: translateY(100vh) rotate(0deg);
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
  }
}

/* Main content card */
.content-card {
  background-color: white;
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1), 0 1px 8px rgba(0, 0, 0, 0.05);
  width: 90%;
  max-width: 800px;
  padding: 30px;
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 25px;
}

/* Header with mascot and title */
.header-section {
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 10px;
}

.mascot-container {
  width: 120px;
  height: 120px;
  position: relative;
}

.owl-character {
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
  animation: blink 3s infinite;
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

.title-container {
  flex: 1;
  padding-left: 20px;
}

.game-title {
  font-size: 2.5rem;
  color: #4A90E2;
  margin: 0;
  background: linear-gradient(90deg, #4A90E2, #9370DB);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  animation: title-bounce 2s ease-in-out infinite alternate;
}

.subtitle-container {
  margin-top: 5px;
}

.game-subtitle {
  font-size: 1rem;
  color: #666;
  margin: 0;
}

/* Status message */
.status-message {
  display: flex;
  align-items: center;
  background-color: #F0FFF4;
  padding: 10px 15px;
  border-radius: 10px;
  border-left: 4px solid #06D6A0;
  width: 100%;
}

.error-message {
  background-color: #FFF5F5;
  border-left: 4px solid #EF476F;
}

.status-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 10px;
}

.status-icon.success {
  background-color: #06D6A0;
  color: white;
}

.status-icon.error {
  background-color: #EF476F;
  color: white;
}

.status-message p {
  margin: 0;
  color: #2D3748;
}

/* Navigation buttons */
.navigation-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  max-width: 400px;
}

.nav-button {
  position: relative;
  display: flex;
  align-items: center;
  padding: 15px 20px;
  border-radius: 15px;
  border: none;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 0 rgba(0, 0, 0, 0.1);
  text-decoration: none;
  width: 100%;
  margin-bottom: 15px;
}

.nav-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 7px 0 rgba(0, 0, 0, 0.1);
}

.nav-button:active {
  transform: translateY(2px);
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.1);
}

.button-icon {
  font-size: 1.5rem;
  margin-right: 15px;
}

.button-text {
  z-index: 2;
}

.button-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50px;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.3) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  animation: shine 3s infinite;
}

.play-button {
  background-color: #4A90E2;
  color: white;
}

.configure-button {
  background-color: #FFD166;
  color: #333;
}

.progress-button {
  background-color: #06D6A0;
  color: white;
}

.auth-button {
  background-color: #9370DB;
  color: white;
}

/* Sign out button */
.sign-out-button {
  background-color: transparent;
  color: #718096;
  border: 1px solid #CBD5E0;
  padding: 8px 15px;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sign-out-button:hover {
  background-color: #F7FAFC;
  color: #4A5568;
}

/* Animations */
@keyframes blink {
  0%, 45%, 55%, 100% { transform: scale(1); }
  50% { transform: scale(0.1); }
}

@keyframes title-bounce {
  0% { transform: translateY(0); }
  100% { transform: translateY(-5px); }
}

@keyframes shine {
  0% { left: -100%; }
  20% { left: 100%; }
  100% { left: 100%; }
}

/* Responsive design */
@media (max-width: 600px) {
  .header-section {
    flex-direction: column;
    text-align: center;
  }
  
  .title-container {
    padding-left: 0;
    margin-top: 10px;
  }
  
  .game-title {
    font-size: 2rem;
  }
}
</style> 