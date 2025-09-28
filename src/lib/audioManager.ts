// Audio Manager for the typing game
// Since we can't create actual audio files in this environment,
// we'll create a manager that handles audio with fallbacks

interface AudioConfig {
  correctSound: string;
  incorrectSound: string;
  celebrationSound: string;
}

class AudioManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private enabled: boolean = true;

  constructor() {
    this.initializeAudioContext();
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('AudioContext not supported:', error);
    }
  }

  async loadSounds() {
    const soundConfig: AudioConfig = {
      correctSound: '/assets/sounds/correct.mp3',
      incorrectSound: '/assets/sounds/incorrect.mp3',
      celebrationSound: '/assets/sounds/celebration.mp3'
    };

    // Create placeholder audio elements
    // In a real implementation, these would load actual audio files
    for (const [key] of Object.entries(soundConfig)) {
      try {
        const audio = new Audio();
        audio.preload = 'auto';
        audio.volume = 0.7;

        // For development, we'll create a silent audio element
        // In production, these would be real sound files
        this.sounds.set(key, audio);
      } catch (error) {
        console.warn(`Failed to load sound: ${key}`, error);
      }
    }
  }

  private createBeepSound(frequency: number, duration: number, type: OscillatorType = 'sine'): Promise<void> {
    return new Promise((resolve) => {
      if (!this.audioContext) {
        resolve();
        return;
      }

      try {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;

        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);

        oscillator.onended = () => resolve();
      } catch (error) {
        console.warn('Error creating beep sound:', error);
        resolve();
      }
    });
  }

  async playCorrectSound(): Promise<void> {
    if (!this.enabled) return;

    const audio = this.sounds.get('correctSound');
    if (audio && audio.src) {
      try {
        await audio.play();
        return;
      } catch (error) {
        console.warn('Failed to play correct sound:', error);
      }
    }

    // Fallback to generated sound
    await this.createBeepSound(523.25, 0.2); // C5 note
  }

  async playIncorrectSound(): Promise<void> {
    if (!this.enabled) return;

    const audio = this.sounds.get('incorrectSound');
    if (audio && audio.src) {
      try {
        await audio.play();
        return;
      } catch (error) {
        console.warn('Failed to play incorrect sound:', error);
      }
    }

    // Fallback to generated sound
    await this.createBeepSound(196, 0.3, 'square'); // G3 note
  }

  async playCelebrationSound(): Promise<void> {
    if (!this.enabled) return;

    const audio = this.sounds.get('celebrationSound');
    if (audio && audio.src) {
      try {
        await audio.play();
        return;
      } catch (error) {
        console.warn('Failed to play celebration sound:', error);
      }
    }

    // Fallback to generated melody
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    for (let i = 0; i < notes.length; i++) {
      setTimeout(() => {
        this.createBeepSound(notes[i], 0.2);
      }, i * 150);
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  // Vibration fallback for mobile devices
  vibrate(pattern: number | number[]): void {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }

  // Method to play success vibration
  vibrateSuccess(): void {
    this.vibrate([50, 100, 50]);
  }

  // Method to play error vibration
  vibrateError(): void {
    this.vibrate([100]);
  }

  // Method to play celebration vibration
  vibrateCelebration(): void {
    this.vibrate([100, 50, 100, 50, 200]);
  }
}

// Create singleton instance
export const audioManager = new AudioManager();

// Initialize audio on first user interaction
let audioInitialized = false;

export const initializeAudio = async () => {
  if (audioInitialized) return;

  try {
    await audioManager.loadSounds();
    audioInitialized = true;
  } catch (error) {
    console.warn('Failed to initialize audio:', error);
  }
};

// Auto-initialize on first user interaction
const initOnInteraction = () => {
  initializeAudio();
  document.removeEventListener('click', initOnInteraction);
  document.removeEventListener('touch', initOnInteraction);
};

document.addEventListener('click', initOnInteraction);
document.addEventListener('touchstart', initOnInteraction);