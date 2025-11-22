import { EnemyManager } from './EnemyManager';
import { GameActions, gameState } from './GameState';
import { EnemyType } from './types';
import level1 from './levels/level1.json';

interface WaveConfig {
  waveId: number;
  enemyType: string;
  count: number;
  spawnInterval: number;
  delayBeforeWave: number;
}

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

  startLevel() {
    this.currentWaveIndex = 0;
    this.loadWave(this.currentWaveIndex);
  }

  loadWave(index: number) {
    if (index >= level1.waves.length) {
      this.isLevelComplete = true;
      console.log('Level Complete!');
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
        // Check if all enemies are dead to proceed to next wave
        // For now, we just wait until the last one is spawned and then immediately queue next wave logic?
        // Better: Wait for enemy count to be 0.
        if (this.enemyManager.enemies.length === 0) {
            this.currentWaveIndex++;
            this.loadWave(this.currentWaveIndex);
        }
      }
    }
  }

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
