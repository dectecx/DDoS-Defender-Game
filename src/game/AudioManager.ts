/**
 * AudioManager - Singleton class for managing all game audio
 * Handles sound effects, background music, volume control, and audio pooling
 */

export const SoundEffect = {
  TOWER_FIRE: 'tower_fire',
  TOWER_BUILD: 'tower_build',
  TOWER_SELL: 'tower_sell',
  TOWER_LEVEL_UP: 'tower_levelup',
  WAVE_START: 'wave_start',
  WAVE_COMPLETE: 'wave_complete',
  WAVE_CONTINUE: 'wave_continue',
  WAVE_PAUSE: 'wave_pause',
  BOSS_APPEARS: 'boss_appears',
  GAME_OVER: 'game_over'
} as const;

export type SoundEffect = typeof SoundEffect[keyof typeof SoundEffect];

export const BackgroundMusic = {
  GAMEPLAY: 'gameplay',
  BOSS_BATTLE: 'boss_battle',
  MENU: 'menu'
} as const;

export type BackgroundMusic = typeof BackgroundMusic[keyof typeof BackgroundMusic];

interface AudioSettings {
  masterVolume: number;
  sfxVolume: number;
  bgmVolume: number;
  isMuted: boolean;
}

export class AudioManager {
  private static instance: AudioManager;
  
  // Audio pools for reusing Audio objects
  private sfxPool: Map<SoundEffect, HTMLAudioElement[]> = new Map();
  private currentBGM: HTMLAudioElement | null = null;
  
  // Settings
  private settings: AudioSettings = {
    masterVolume: 1.0,
    sfxVolume: 1.0,
    bgmVolume: 0.6,
    isMuted: false
  };
  
  // Audio file paths
  private readonly SFX_BASE_PATH = '/audio/sfx/';
  private readonly BGM_BASE_PATH = '/audio/bgm/';
  
  // Pool size for each sound effect
  private readonly POOL_SIZE = 3;
  
  // Flag to track if using placeholder mode - set to false to use real audio
  private usePlaceholders = false;

  private constructor() {
    this.loadSettings();
    this.initializeAudioPools();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * Initialize audio pools for each sound effect
   */
  private initializeAudioPools(): void {
    Object.values(SoundEffect).forEach(effect => {
      const pool: HTMLAudioElement[] = [];
      for (let i = 0; i < this.POOL_SIZE; i++) {
        const audio = new Audio();
        audio.src = `${this.SFX_BASE_PATH}${effect}.mp3`;
        audio.preload = 'auto';
        
        // Mark audio as failed to load (placeholder mode)
        audio.onerror = () => {
          this.usePlaceholders = true;
        };
        
        pool.push(audio);
      }
      this.sfxPool.set(effect as SoundEffect, pool);
    });
  }

  /**
   * Get an available audio element from the pool
   */
  private getAvailableAudio(effect: SoundEffect): HTMLAudioElement | null {
    const pool = this.sfxPool.get(effect);
    if (!pool) return null;

    // Find an audio element that's not currently playing
    const available = pool.find(audio => audio.paused || audio.ended);
    
    // If all are busy, use the first one (will restart it)
    return available ?? pool[0] ?? null;
  }

  /**
   * Play a sound effect
   * @param effect Sound effect to play
   * @param volumeOverride Optional volume override (0.0 - 1.0)
   */
  public playSFX(effect: SoundEffect, volumeOverride?: number): void {
    if (this.settings.isMuted) return;

    // Placeholder mode - log to console
    if (this.usePlaceholders) {
      console.log(`🔊 SFX: ${effect}`);
      return;
    }

    const audio = this.getAvailableAudio(effect);
    if (!audio) return;

    const volume = volumeOverride ?? this.settings.sfxVolume;
    audio.volume = volume * this.settings.masterVolume;
    
    audio.currentTime = 0;
    audio.play().catch(err => {
      console.warn(`Failed to play sound effect ${effect}:`, err);
    });
  }

  /**
   * Play background music
   * @param music Background music to play
   * @param loop Whether to loop the music (default: true)
   */
  public playBGM(music: BackgroundMusic, loop: boolean = true): void {
    if (this.settings.isMuted) return;

    // Placeholder mode - log to console
    if (this.usePlaceholders) {
      console.log(`🎵 BGM: ${music} (loop: ${loop})`);
      return;
    }

    // Stop current BGM if playing
    this.stopBGM();

    this.currentBGM = new Audio(`${this.BGM_BASE_PATH}${music}.mp3`);
    this.currentBGM.loop = loop;
    this.currentBGM.volume = this.settings.bgmVolume * this.settings.masterVolume;
    
    this.currentBGM.play().catch(err => {
      console.warn(`Failed to play background music ${music}:`, err);
    });
  }

  /**
   * Stop currently playing background music
   */
  public stopBGM(): void {
    if (this.currentBGM) {
      this.currentBGM.pause();
      this.currentBGM.currentTime = 0;
      this.currentBGM = null;
    }
  }

  /**
   * Set master volume (affects all audio)
   * @param volume Volume level (0.0 - 1.0)
   */
  public setMasterVolume(volume: number): void {
    this.settings.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateBGMVolume();
    this.saveSettings();
  }

  /**
   * Set sound effects volume
   * @param volume Volume level (0.0 - 1.0)
   */
  public setSFXVolume(volume: number): void {
    this.settings.sfxVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  /**
   * Set background music volume
   * @param volume Volume level (0.0 - 1.0)
   */
  public setBGMVolume(volume: number): void {
    this.settings.bgmVolume = Math.max(0, Math.min(1, volume));
    this.updateBGMVolume();
    this.saveSettings();
  }

  /**
   * Update current BGM volume
   */
  private updateBGMVolume(): void {
    if (this.currentBGM) {
      this.currentBGM.volume = this.settings.bgmVolume * this.settings.masterVolume;
    }
  }

  /**
   * Toggle mute on/off
   * @returns New mute state
   */
  public toggleMute(): boolean {
    this.settings.isMuted = !this.settings.isMuted;
    
    if (this.settings.isMuted) {
      this.stopBGM();
    }
    
    this.saveSettings();
    return this.settings.isMuted;
  }

  /**
   * Get current mute state
   */
  public isMuted(): boolean {
    return this.settings.isMuted;
  }

  /**
   * Get current master volume
   */
  public getMasterVolume(): number {
    return this.settings.masterVolume;
  }

  /**
   * Get current SFX volume
   */
  public getSFXVolume(): number {
    return this.settings.sfxVolume;
  }

  /**
   * Get current BGM volume
   */
  public getBGMVolume(): number {
    return this.settings.bgmVolume;
  }

  /**
   * Load settings from localStorage
   */
  private loadSettings(): void {
    try {
      const saved = localStorage.getItem('audioSettings');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.settings = { ...this.settings, ...parsed };
      }
    } catch (err) {
      console.warn('Failed to load audio settings:', err);
    }
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings(): void {
    try {
      localStorage.setItem('audioSettings', JSON.stringify(this.settings));
    } catch (err) {
      console.warn('Failed to save audio settings:', err);
    }
  }

  /**
   * Enable/disable placeholder mode
   * @param usePlaceholders Whether to use placeholders
   */
  public setPlaceholderMode(usePlaceholders: boolean): void {
    this.usePlaceholders = usePlaceholders;
  }
}

// Export singleton instance
export const audioManager = AudioManager.getInstance();
