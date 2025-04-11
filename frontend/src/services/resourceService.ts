/**
 * Resource optimization service for preloading and managing app resources
 */
class ResourceService {
  private imageCache: Map<string, HTMLImageElement> = new Map();
  private preloadedSounds: Set<string> = new Set();
  private resourceLoadPromises: Promise<void>[] = [];

  /**
   * Preload a sound file
   * @param soundUrl URL of the sound to preload
   */
  preloadSound(soundUrl: string): Promise<void> {
    if (this.preloadedSounds.has(soundUrl)) {
      return Promise.resolve();
    }

    const promise = new Promise<void>((resolve) => {
      const audio = new Audio();
      audio.src = soundUrl;
      
      // Just load metadata, not the entire file
      audio.preload = 'metadata';
      
      audio.oncanplaythrough = () => {
        this.preloadedSounds.add(soundUrl);
        resolve();
      };
      
      audio.onerror = () => {
        console.warn(`Failed to preload sound: ${soundUrl}`);
        resolve(); // Resolve anyway to avoid blocking
      };
      
      // Start loading
      audio.load();
    });
    
    this.resourceLoadPromises.push(promise);
    return promise;
  }

  /**
   * Preload an image
   * @param imageUrl URL of the image to preload
   */
  preloadImage(imageUrl: string): Promise<HTMLImageElement> {
    if (this.imageCache.has(imageUrl)) {
      return Promise.resolve(this.imageCache.get(imageUrl)!);
    }

    const promise = new Promise<HTMLImageElement>((resolve) => {
      const img = new Image();
      img.src = imageUrl;
      
      img.onload = () => {
        this.imageCache.set(imageUrl, img);
        resolve(img);
      };
      
      img.onerror = () => {
        console.warn(`Failed to preload image: ${imageUrl}`);
        resolve(img); // Resolve anyway to avoid blocking
      };
    });
    
    return promise;
  }

  /**
   * Preload all game resources
   * This can be called during initial app load to preload critical assets
   */
  preloadGameResources(): Promise<void[]> {
    // Preload all sounds
    this.preloadSound('/sounds/game-start.mp3');
    this.preloadSound('/sounds/correct-answer.mp3');
    this.preloadSound('/sounds/incorrect-answer.mp3');
    this.preloadSound('/sounds/level-up.mp3');
    this.preloadSound('/sounds/button-click.mp3');

    // Return a promise that resolves when all resources are loaded
    return Promise.all(this.resourceLoadPromises);
  }

  /**
   * Get a preloaded image if available
   * @param imageUrl URL of the image to get
   */
  getImage(imageUrl: string): HTMLImageElement | undefined {
    return this.imageCache.get(imageUrl);
  }

  /**
   * Clear the resource cache
   * Useful when needing to free up memory
   */
  clearCache(): void {
    this.imageCache.clear();
    this.preloadedSounds.clear();
    this.resourceLoadPromises = [];
  }
}

// Export a singleton instance
const resourceService = new ResourceService();
export default resourceService; 