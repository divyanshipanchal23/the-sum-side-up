import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface GameConfig {
  minValue: number;
  maxValue: number;
  maxAddends: number;
  targetRange: {
    min: number;
    max: number;
  };
  timeLimit: number | null;
  hintsEnabled: boolean;
}

export interface GameState {
  targetNumber: number;
  addends: number[];
  attempts: number;
  successes: number;
  currentLevel: number;
  isComplete: boolean;
  lastAttemptCorrect: boolean | null;
}

export const useGameStore = defineStore('game', () => {
  // Default game configuration
  const config = ref<GameConfig>({
    minValue: 1,
    maxValue: 10,
    maxAddends: 2,
    targetRange: {
      min: 5,
      max: 15
    },
    timeLimit: null,
    hintsEnabled: true
  });

  // Game state
  const gameState = ref<GameState>({
    targetNumber: 0,
    addends: [0, 0],
    attempts: 0,
    successes: 0,
    currentLevel: 1,
    isComplete: false,
    lastAttemptCorrect: null
  });

  // Computed properties
  const sum = computed(() => {
    return gameState.value.addends.reduce((a, b) => a + b, 0);
  });

  const isBalanced = computed(() => {
    return sum.value === gameState.value.targetNumber;
  });

  const difference = computed(() => {
    return sum.value - gameState.value.targetNumber;
  });

  const successRate = computed(() => {
    if (gameState.value.attempts === 0) return 0;
    return (gameState.value.successes / gameState.value.attempts) * 100;
  });

  // Actions
  function startNewGame() {
    // Generate a new target number based on the current config
    const min = config.value.targetRange.min;
    const max = config.value.targetRange.max;
    gameState.value.targetNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    
    // Reset game state
    gameState.value.addends = Array(config.value.maxAddends).fill(0);
    gameState.value.isComplete = false;
    gameState.value.lastAttemptCorrect = null;
  }

  function setAddend(index: number, value: number) {
    if (index >= 0 && index < gameState.value.addends.length) {
      gameState.value.addends[index] = value;
    }
  }

  function checkBalance() {
    gameState.value.attempts++;
    gameState.value.lastAttemptCorrect = isBalanced.value;
    
    if (isBalanced.value) {
      gameState.value.successes++;
      gameState.value.isComplete = true;
      
      // Check for level up conditions
      if (successRate.value >= 80 && gameState.value.attempts >= 5) {
        levelUp();
      }
    }
  }

  function levelUp() {
    gameState.value.currentLevel++;
    
    // Adjust difficulty based on level
    if (gameState.value.currentLevel % 3 === 0) {
      // Every third level, increase the maximum value
      config.value.maxValue += 5;
    }
    
    if (gameState.value.currentLevel % 5 === 0) {
      // Every fifth level, increase the target range
      config.value.targetRange.max += 10;
    }
    
    if (gameState.value.currentLevel % 10 === 0 && config.value.maxAddends < 5) {
      // Every tenth level, add another addend (up to 5)
      config.value.maxAddends++;
      gameState.value.addends.push(0);
    }
  }

  function updateConfig(newConfig: Partial<GameConfig>) {
    config.value = { ...config.value, ...newConfig };
  }

  function resetGame() {
    // First set the game state with default values
    gameState.value = {
      targetNumber: Math.floor(Math.random() * (config.value.targetRange.max - config.value.targetRange.min + 1)) + config.value.targetRange.min,
      addends: Array(config.value.maxAddends).fill(0),
      attempts: 0,
      successes: 0,
      currentLevel: 1,
      isComplete: false,
      lastAttemptCorrect: null
    };
    
    // No need to call startNewGame since we already set the targetNumber
  }

  return {
    config,
    gameState,
    sum,
    isBalanced,
    difference,
    successRate,
    startNewGame,
    setAddend,
    checkBalance,
    levelUp,
    updateConfig,
    resetGame
  };
}); 