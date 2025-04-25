/**
 * Shared type declarations for the application
 */

// Game Configuration type (matching the one in configService.ts)
export interface GameConfig {
  id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  minValue: number;
  maxValue: number;
  numberOfAddends: number;
  targetRange: {
    min: number;
    max: number;
  };
  timeLimit: number;
  hintsEnabled: boolean;
  progressionRules: {
    requiredSuccessRate: number;
    advancementThreshold: number;
  };
  isPublic: boolean;
  createdBy: string;
  created_at?: Date;
  updated_at?: Date;
}

// Game Attempt type (matching the one in progressService.ts)
export interface GameAttempt {
  id?: string;
  userId: string;
  activityId: string;
  timestamp: Date;
  target: number;
  inputs: number[];
  success: boolean;
  timeSpent: number;
}

// User Progress type (matching the one in progressService.ts)
export interface UserProgress {
  userId: string;
  activityId: string;
  attempts: number;
  successes: number;
  currentLevel: number;
  lastPlayed: Date;
  history: GameAttempt[];
}

// Game Store Configuration (matching the one in gameStore.ts)
export interface GameStoreConfig {
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