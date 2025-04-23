import { Howl } from 'howler';

// Define sound types for better type checking
export type SoundType = 'start' | 'correct' | 'incorrect' | 'levelUp' | 'click';

class SoundService {
  private sounds: Record<SoundType, Howl>;
  private isMuted: boolean = false;
  private soundsLoaded: boolean = false;
  
  // Web Audio API context as a fallback
  private audioContext: AudioContext | null = null;

  constructor() {
    console.log('Initializing SoundService...');
    
    // Try to initialize Web Audio API
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('Web Audio API initialized successfully');
    } catch (e) {
      console.error('Failed to initialize Web Audio API:', e);
    }
    
    // Initialize sounds with relative paths
    this.sounds = {
      start: new Howl({
        src: ['/sounds/game-start.mp3'],
        volume: 0.7,
        onload: () => console.log('Sound loaded: game-start.mp3'),
        onloaderror: (id, err) => console.error('Error loading sound: game-start.mp3', err),
        onplayerror: (id, err) => console.error('Error playing sound: game-start.mp3', err)
      }),
      correct: new Howl({
        src: ['/sounds/correct-answer.mp3'],
        volume: 0.7,
        onload: () => console.log('Sound loaded: correct-answer.mp3'),
        onloaderror: (id, err) => console.error('Error loading sound: correct-answer.mp3', err),
        onplayerror: (id, err) => console.error('Error playing sound: correct-answer.mp3', err)
      }),
      incorrect: new Howl({
        src: ['/sounds/incorrect-answer.mp3'],
        volume: 0.6,
        onload: () => console.log('Sound loaded: incorrect-answer.mp3'),
        onloaderror: (id, err) => console.error('Error loading sound: incorrect-answer.mp3', err),
        onplayerror: (id, err) => console.error('Error playing sound: incorrect-answer.mp3', err)
      }),
      levelUp: new Howl({
        src: ['/sounds/level-up.mp3'],
        volume: 0.8,
        onload: () => console.log('Sound loaded: level-up.mp3'),
        onloaderror: (id, err) => console.error('Error loading sound: level-up.mp3', err),
        onplayerror: (id, err) => console.error('Error playing sound: level-up.mp3', err)
      }),
      click: new Howl({
        src: ['/sounds/button-click.mp3'],
        volume: 0.4,
        onload: () => console.log('Sound loaded: button-click.mp3'),
        onloaderror: (id, err) => console.error('Error loading sound: button-click.mp3', err),
        onplayerror: (id, err) => console.error('Error playing sound: button-click.mp3', err)
      })
    };

    // Check if all sounds are loaded
    setTimeout(() => {
      this.checkSoundsLoaded();
    }, 2000);
  }

  /**
   * Check if all sounds are loaded
   */
  private checkSoundsLoaded(): void {
    console.log('Checking sound loading status...');
    let allLoaded = true;

    // Check each sound
    Object.entries(this.sounds).forEach(([key, sound]) => {
      const isLoaded = sound.state() === 'loaded';
      console.log(`Sound ${key}: ${isLoaded ? 'Loaded' : 'Not loaded'}`);
      if (!isLoaded) allLoaded = false;
    });

    this.soundsLoaded = allLoaded;
    console.log(`All sounds ${allLoaded ? 'successfully loaded' : 'failed to load completely'}`);
  }

  /**
   * Play a sound if not muted
   */
  play(sound: SoundType): void {
    if (this.isMuted) {
      console.log(`Sound ${sound} not played (muted)`);
      return;
    }
    
    console.log(`Attempting to play sound: ${sound}`);
    
    // First try using Howler
    try {
      const id = this.sounds[sound].play();
      console.log(`Howler sound ${sound} play called with id: ${id}`);
    } catch (error) {
      console.error(`Error playing Howler sound ${sound}:`, error);
      // If Howler fails, fall back to Web Audio API
      this.playToneWithWebAudio(sound);
    }
  }
  
  /**
   * Generate a simple tone based on the sound type
   */
  private playToneWithWebAudio(sound: SoundType): void {
    if (!this.audioContext) {
      console.error('Cannot play tone - No Audio Context available');
      return;
    }
    
    try {
      console.log(`Generating Web Audio tone for ${sound}`);
      
      // Create an oscillator
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      // Connect everything
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Set frequency based on sound type
      switch(sound) {
        case 'start':
          oscillator.type = 'sine';
          oscillator.frequency.value = 440; // A4
          gainNode.gain.value = 0.3;
          break;
        case 'correct':
          oscillator.type = 'sine';
          oscillator.frequency.value = 880; // A5
          gainNode.gain.value = 0.3;
          break;
        case 'incorrect':
          oscillator.type = 'triangle';
          oscillator.frequency.value = 220; // A3
          gainNode.gain.value = 0.3;
          break;
        case 'levelUp':
          oscillator.type = 'sine';
          oscillator.frequency.value = 1320; // E6
          gainNode.gain.value = 0.3;
          break;
        case 'click':
          oscillator.type = 'square';
          oscillator.frequency.value = 660; // E5
          gainNode.gain.value = 0.1;
          break;
      }
      
      // Schedule the tone
      const now = this.audioContext.currentTime;
      oscillator.start(now);
      
      // Set a short duration and fade out
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      oscillator.stop(now + 0.5);
      
      console.log(`Web Audio tone for ${sound} generated successfully`);
    } catch (e) {
      console.error(`Error generating Web Audio tone for ${sound}:`, e);
    }
  }

  /**
   * Mute all sounds
   */
  mute(): void {
    console.log('Muting all sounds');
    this.isMuted = true;
    Object.values(this.sounds).forEach(sound => sound.mute(true));
  }

  /**
   * Unmute all sounds
   */
  unmute(): void {
    console.log('Unmuting all sounds');
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
    console.log(`Sound is now ${this.isMuted ? 'muted' : 'unmuted'}`);
    return this.isMuted;
  }

  /**
   * Get current mute state
   */
  getMuteState(): boolean {
    return this.isMuted;
  }

  /**
   * Get sound loading status
   */
  areSoundsLoaded(): boolean {
    return this.soundsLoaded;
  }
}

// Create a singleton instance
const soundService = new SoundService();

export default soundService; 