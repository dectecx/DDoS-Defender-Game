import { EnemyManager } from './EnemyManager';
import { GameActions, gameState } from './GameState';
import { EnemyType } from './types';
import level1 from './levels/level1.json';

/**
 * Wave configuration interface
 */
interface WaveConfig {
  waveId: number;
  enemyType: string;
  count: number;
  spawnInterval: number;
  delayBeforeWave: number;
}

/**
 * WaveManager - Wave and level progression manager
 * Manages wave loading, enemy spawning timing, and level completion
 */
export class WaveManager {
  enemyManager: EnemyManager;
  currentWaveIndex: number = 0;
  currentWaveConfig: WaveConfig | null = null;
  
  enemiesSpawnedInWave: number = 0;
  timeSinceLastSpawn: number = 0;
  waveDelayTimer: number = 0;
  isWaveActive: boolean = false;
  isLevelComplete: boolean = false;

  constructor(enemyManager: EnemyManager) {
    this.enemyManager = enemyManager;
    this.startLevel();
  }

  /**
   * Start the level from wave 0
   */
  startLevel() {
    this.currentWaveIndex = 0;
    this.loadWave(this.currentWaveIndex);
  }

  /**
   * Load a specific wave by index
   * @param index Wave index
   */
  loadWave(index: number) {
    if (index >= level1.waves.length) {
      this.isLevelComplete = true;
      console.log('Level Complete!');
      GameActions.setVictory();
      return;
    }

    this.currentWaveConfig = level1.waves[index] || null;
    if (!this.currentWaveConfig) {
        console.error('Invalid wave config');
        return;
    }

    this.enemiesSpawnedInWave = 0;
    this.timeSinceLastSpawn = 0;
    this.waveDelayTimer = this.currentWaveConfig.delayBeforeWave / 1000; // Convert to seconds
    this.isWaveActive = false;
    
    gameState.wave = this.currentWaveConfig.waveId;
    console.log(`Preparing Wave ${gameState.wave}`);
  }

  /**
   * Update wave state and spawn enemies
   * @param deltaTime Time delta in seconds
   */
  update(deltaTime: number) {
    if (this.isLevelComplete) return;
    if (!this.currentWaveConfig) return;

    // Handle delay before wave starts
    if (!this.isWaveActive) {
      this.waveDelayTimer -= deltaTime;
      if (this.waveDelayTimer <= 0) {
        this.isWaveActive = true;
        console.log(`Wave ${gameState.wave} Started!`);
      }
      return;
    }

    // Handle Spawning
    this.timeSinceLastSpawn += deltaTime * 1000; // Convert back to ms for comparison
    
    if (this.timeSinceLastSpawn >= this.currentWaveConfig.spawnInterval) {
      if (this.enemiesSpawnedInWave < this.currentWaveConfig.count) {
        this.spawnEnemy();
        this.timeSinceLastSpawn = 0;
      } else {
        // All enemies spawned for this wave
        // Wait for all enemies to be defeated before proceeding
        if (this.enemyManager.enemies.length === 0) {
            this.currentWaveIndex++;
            this.loadWave(this.currentWaveIndex);
        }
      }
    }
  }

  /**
   * Spawn a single enemy based on current wave config
   */
  spawnEnemy() {
    if (!this.currentWaveConfig) return;
    
    const typeStr = this.currentWaveConfig.enemyType;
    // Map string to enum
    let type: EnemyType = EnemyType.REQ_STD;
    if (typeStr === 'REQ_HEAVY') type = EnemyType.REQ_HEAVY;
    if (typeStr === 'REQ_STREAM') type = EnemyType.REQ_STREAM;
    if (typeStr === 'ZERO_DAY') type = EnemyType.ZERO_DAY;

    this.enemyManager.spawnEnemy(type);
    this.enemiesSpawnedInWave++;
  }
}
