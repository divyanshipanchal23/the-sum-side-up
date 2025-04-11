import { Howl } from 'howler';

// Define sound types for better type checking
export type SoundType = 'start' | 'correct' | 'incorrect' | 'levelUp' | 'click';

class SoundService {
  private sounds: Record<SoundType, Howl>;
  private isMuted: boolean = false;

  constructor() {
    // Initialize sounds with relative paths
    this.sounds = {
      start: new Howl({
        src: ['/sounds/game-start.mp3'],
        volume: 0.7
      }),
      correct: new Howl({
        src: ['/sounds/correct-answer.mp3'],
        volume: 0.7
      }),
      incorrect: new Howl({
        src: ['/sounds/incorrect-answer.mp3'],
        volume: 0.6
      }),
      levelUp: new Howl({
        src: ['/sounds/level-up.mp3'],
        volume: 0.8
      }),
      click: new Howl({
        src: ['/sounds/button-click.mp3'],
        volume: 0.4
      })
    };
  }

  /**
   * Play a sound if not muted
   */
  play(sound: SoundType): void {
    if (!this.isMuted) {
      this.sounds[sound].play();
    }
  }

  /**
   * Mute all sounds
   */
  mute(): void {
    this.isMuted = true;
    Object.values(this.sounds).forEach(sound => sound.mute(true));
  }

  /**
   * Unmute all sounds
   */
  unmute(): void {
    this.isMuted = false;
    Object.values(this.sounds).forEach(sound => sound.mute(false));
  }

  /**
   * Toggle muted state
   */
  toggleMute(): boolean {
    if (this.isMuted) {
      this.unmute();
    } else {
      this.mute();
    }
    return this.isMuted;
  }

  /**
   * Get current mute state
   */
  getMuteState(): boolean {
    return this.isMuted;
  }
}

// Create a singleton instance
const soundService = new SoundService();

export default soundService; 