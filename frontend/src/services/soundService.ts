import { Howl } from 'howler';

// Define sound types for better type checking
export type SoundType = 'start' | 'correct' | 'incorrect' | 'levelUp' | 'click' | 'tick';

class SoundService {
  private sounds: Record<SoundType, Howl>;
  private isMuted: boolean = false;
  private soundsLoaded: boolean = false;
  
  // Keep track of which sounds have failed to prevent repeated errors
  private failedSounds: Set<SoundType> = new Set();
  
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
        html5: true,
        preload: true,
        onload: () => console.log('Sound loaded: game-start.mp3'),
        onloaderror: (id, err) => {
          console.error('Error loading sound: game-start.mp3', err);
          this.failedSounds.add('start');
        },
        onplayerror: (id, err) => console.error('Error playing sound: game-start.mp3', err)
      }),
      correct: new Howl({
        src: ['/sounds/correct-answer.mp3'],
        volume: 0.7,
        html5: true,
        preload: true,
        onload: () => console.log('Sound loaded: correct-answer.mp3'),
        onloaderror: (id, err) => {
          console.error('Error loading sound: correct-answer.mp3', err);
          this.failedSounds.add('correct');
        },
        onplayerror: (id, err) => console.error('Error playing sound: correct-answer.mp3', err)
      }),
      incorrect: new Howl({
        src: ['/sounds/incorrect-answer.mp3'],
        volume: 0.6,
        html5: true,
        preload: true,
        onload: () => console.log('Sound loaded: incorrect-answer.mp3'),
        onloaderror: (id, err) => {
          console.error('Error loading sound: incorrect-answer.mp3', err);
          this.failedSounds.add('incorrect');
        },
        onplayerror: (id, err) => console.error('Error playing sound: incorrect-answer.mp3', err)
      }),
      levelUp: new Howl({
        src: ['/sounds/level-up.mp3'],
        volume: 0.8,
        html5: true,
        preload: true,
        onload: () => console.log('Sound loaded: level-up.mp3'),
        onloaderror: (id, err) => {
          console.error('Error loading sound: level-up.mp3', err);
          this.failedSounds.add('levelUp');
        },
        onplayerror: (id, err) => console.error('Error playing sound: level-up.mp3', err)
      }),
      click: new Howl({
        src: ['/sounds/button-click.mp3'],
        volume: 0.4,
        html5: true,
        preload: true,
        onload: () => console.log('Sound loaded: button-click.mp3'),
        onloaderror: (id, err) => {
          console.error('Error loading sound: button-click.mp3', err);
          this.failedSounds.add('click');
        },
        onplayerror: (id, err) => console.error('Error playing sound: button-click.mp3', err)
      }),
      // Add a tick sound for countdown
      tick: new Howl({
        src: ['/sounds/tick.mp3'],
        volume: 0.3,
        html5: true,
        preload: true,
        onload: () => console.log('Sound loaded: tick.mp3'),
        onloaderror: (id, err) => {
          console.error('Error loading sound: tick.mp3', err);
          this.failedSounds.add('tick');
        },
        onplayerror: (id, err) => console.error('Error playing sound: tick.mp3', err)
      })
    };

    // Simpler initialization approach 
    this.initializeAudio();
    
    // Check if all sounds are loaded
    setTimeout(() => {
      this.checkSoundsLoaded();
    }, 2000);
  }
  
  /**
   * Initialize audio - attempt to unlock audio playback
   */
  private initializeAudio(): void {
    // Try to unlock audio immediately - this won't work until user interaction,
    // but we'll set it up anyway and it might help in some browsers
    try {
      // Create and play a silent sound to unlock audio
      const silentSound = new Howl({
        src: ['data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAAcAAAAIAAAOsAA4ODg4ODg4ODg4ODhVVVVVVVVVVVVVVVVxcXFxcXFxcXFxcXFxjo6Ojo6Ojo6Ojo6OqqqqqqqqqqqqqqqqqsfHx8fHx8fHx8fHx+Pj4+Pj4+Pj4+Pj4+P///////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAYAAAAAAAAADrBE+YclAAAAAAAAAAAAAAAAAAAAAP/7kGQAAAAAAGkAAAAKAAANIAAAAQAAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEAAAGkAAAAKAAANIAAAAQAAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEAAAGkAAAAKAAANIAAAAQAAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEAAAGkAAAAKAAANIAAAAQAAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEAAAGkAAAAKAAANIAAAAQAAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEMmg5kAomkixXP/7kmRAj/wAAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEMse5J1uTRp///5L5X0v//////+SvpL5dmS+XL//8kIvpMMZIRvxvKX5L5dL//8uX0vl2//+X//5L5X/+XZdmZe6Tdmf/L//////5JkxL5dmSAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQZECP8AAAGkAAAAIAAANIAAAAQAAAaQAAAAgAAA0gAAABExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU='],
        volume: 0.001,
        html5: true,
        format: ['mp3'],
        onend: () => {
          console.log('Silent sound played successfully - audio may be unlocked');
        }
      });
      
      silentSound.play();
      
      // Also try to resume AudioContext if it exists
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().then(() => {
          console.log('AudioContext resumed successfully');
        }).catch(err => {
          console.warn('Failed to resume AudioContext:', err);
        });
      }
    } catch (err) {
      console.warn('Failed initial audio unlock attempt:', err);
    }
    
    // Add listener for user interaction to unlock audio
    const unlockAudio = () => {
      // Try playing a sound on user interaction
      this.playUnlockSound();
      
      // Resume AudioContext if suspended
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(console.error);
      }
      
      // Remove the event listeners once audio is unlocked
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
    
    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);
    document.addEventListener('keydown', unlockAudio);
  }
  
  /**
   * Play a silent sound to unlock audio on iOS/Safari
   */
  private playUnlockSound(): void {
    try {
      const unlockSound = new Howl({
        src: ['data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAAcAAAAIAAAOsAA4ODg4ODg4ODg4ODhVVVVVVVVVVVVVVVVxcXFxcXFxcXFxcXFxjo6Ojo6Ojo6Ojo6OqqqqqqqqqqqqqqqqqsfHx8fHx8fHx8fHx+Pj4+Pj4+Pj4+Pj4+P///////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAA6w9Sr2nQAAAAAAAAAAAAAAAAAAAAD/+5JkAA/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAARMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ=='],
        volume: 0.001,
        format: ['mp3'],
        html5: true,
        onend: () => console.log('Unlock sound played successfully')
      });
      
      unlockSound.play();
      console.log('Attempted to play unlock sound');
    } catch (err) {
      console.warn('Error playing unlock sound:', err);
    }
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
   * This version is simpler and more robust
   */
  play(sound: SoundType): void {
    // Don't try to play sounds if muted
    if (this.isMuted) {
      console.log(`Sound ${sound} not played (muted)`);
      return;
    }
    
    // Don't try to play sounds that have already failed to load
    if (this.failedSounds.has(sound)) {
      console.log(`Sound ${sound} not played (previously failed to load)`);
      this.playFallbackSound(sound);
      return;
    }
    
    console.log(`Attempting to play sound: ${sound}`);
    
    try {
      // Try to play the sound with Howler
      const id = this.sounds[sound].play();
      
      // Check if Howler successfully started playback
      if (id === undefined || id === null) {
        console.warn(`Howler couldn't start playback for ${sound}, using fallback`);
        this.playFallbackSound(sound);
      }
    } catch (error) {
      console.error(`Error playing sound ${sound}:`, error);
      this.playFallbackSound(sound);
    }
  }
  
  /**
   * Play a fallback sound when Howler fails
   */
  private playFallbackSound(sound: SoundType): void {
    // If we have a Web Audio context, use it for fallback sounds
    if (this.audioContext) {
      try {
        this.playToneWithWebAudio(sound);
      } catch (e) {
        console.error(`Fallback sound also failed for ${sound}:`, e);
      }
    } else {
      console.log(`No fallback available for sound: ${sound}`);
    }
  }
  
  /**
   * Generate a simple tone based on the sound type using Web Audio API
   */
  private playToneWithWebAudio(sound: SoundType): void {
    if (!this.audioContext) {
      console.error('Cannot play tone - No Audio Context available');
      return;
    }
    
    try {
      console.log(`Generating Web Audio tone for ${sound}`);
      
      // Make sure the audio context is running
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      
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
        case 'tick':
          oscillator.type = 'sine';
          oscillator.frequency.value = 550; // Around C#5
          gainNode.gain.value = 0.2;
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