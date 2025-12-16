import { EnemyManager } from './EnemyManager';
import { GameActions, gameState } from './GameState';
import { EnemyType } from './types';
import type { 
  WaveConfig, 
  SpawnTracker, 
  IntervalSpawnSchedule,
  BurstSpawnSchedule,
  CustomSpawnSchedule,
  RandomSpawnSchedule
} from './types/WaveTypes';
import level1Data from './levels/level1.json';

// Type assertion for level data
const level1 = level1Data as { waves: WaveConfig[] };

/**
 * WaveManager - Enhanced wave and level progression manager
 * Supports multi-enemy spawning with complex spawn schedules
 */
export class WaveManager {
  enemyManager: EnemyManager;
  currentWaveIndex: number = 0;
  currentWaveConfig: WaveConfig | null = null;
  
  spawnTrackers: SpawnTracker[] = [];
  waveStartTime: number = 0;
  lastSpawnTime: number = 0;
  isWaveActive: boolean = false;
  isLevelComplete: boolean = false;
  
  // Wave progress tracking
  totalEnemiesInWave: number = 0;
  enemiesSpawned: number = 0;
  
  // Wave transition state
  isInTransition: boolean = false;
  transitionStartTime: number = 0;
  
  onWaveTransitionStart: ((wave: number, rewards: { baseGold: number, bonusGold: number }, timeout: number) => void) | null = null;

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

    // Initialize spawn trackers for each enemy type
    this.spawnTrackers = this.currentWaveConfig.enemies.map(enemyConfig => {
      const tracker: SpawnTracker = {
        enemyType: enemyConfig.type as EnemyType,
        totalCount: enemyConfig.count,
        spawnedCount: 0,
        schedule: enemyConfig.spawnSchedule,
        nextSpawnTime: 0
      };

      // Pre-calculate random spawn times if needed
      if (tracker.schedule.type === 'random') {
        const randomSchedule = tracker.schedule as RandomSpawnSchedule;
        tracker.randomTimes = this.generateRandomSpawnTimes(
          enemyConfig.count,
          randomSchedule.minInterval,
          randomSchedule.maxInterval,
          randomSchedule.duration
        );
      }

      return tracker;
    });

    this.waveStartTime = 0;
    this.lastSpawnTime = 0;
    this.isWaveActive = false;
    this.isInTransition = false;
    
    // Calculate total enemies in this wave
    this.totalEnemiesInWave = this.spawnTrackers.reduce((sum, tracker) => sum + tracker.totalCount, 0);
    this.enemiesSpawned = 0;
    
    gameState.wave = this.currentWaveConfig.waveId;
    console.log(`Wave ${gameState.wave} loaded with ${this.totalEnemiesInWave} enemies`);
    
    // Start wave immediately (no delay for now, can be added later)
    this.startWave();
  }

  /**
   * Start the current wave
   */
  startWave() {
    this.isWaveActive = true;
    this.waveStartTime = Date.now();
    console.log(`Wave ${gameState.wave} started!`);
  }

  /**
   * Generate random spawn times for random schedule
   */
  private generateRandomSpawnTimes(
    count: number,
    minInterval: number,
    maxInterval: number,
    duration: number
  ): number[] {
    const times: number[] = [];
    let currentTime = 0;

    for (let i = 0; i < count; i++) {
      const interval = minInterval + Math.random() * (maxInterval - minInterval);
      currentTime += interval;
      
      if (currentTime > duration) {
        currentTime = duration * Math.random(); // Spawn within duration
      }
      
      times.push(currentTime);
    }

    return times.sort((a, b) => a - b);
  }

  /**
   * Update wave state and spawn enemies
   * @param _deltaTime Time delta in seconds (unused, using real time instead)
   */
  update(_deltaTime: number) {
    if (this.isLevelComplete) return;
    if (!this.currentWaveConfig) return;
    if (this.isInTransition) return; // Don't update during transition

    if (!this.isWaveActive) return;

    const now = Date.now();
    const elapsedTime = now - this.waveStartTime;

    // Process each spawn tracker
    this.spawnTrackers.forEach(tracker => {
      if (tracker.spawnedCount >= tracker.totalCount) return;

      switch (tracker.schedule.type) {
        case 'interval':
          this.processIntervalSpawn(tracker, elapsedTime);
          break;
        case 'burst':
          this.processBurstSpawn(tracker, elapsedTime);
          break;
        case 'custom':
          this.processCustomSpawn(tracker, elapsedTime);
          break;
        case 'random':
          this.processRandomSpawn(tracker, elapsedTime);
          break;
      }
    });

    // Check if all enemies have been spawned and defeated
    const allSpawned = this.spawnTrackers.every(t => t.spawnedCount >= t.totalCount);
    const enemyCount = this.enemyManager.enemies.length;
    
    // Debug logging
    if (allSpawned && enemyCount === 0) {
      console.log(`Wave ${this.currentWaveConfig?.waveId} complete! All enemies spawned and defeated.`);
      this.completeWave();
    }
  }

  /**
   * Process interval-based spawning
   */
  private processIntervalSpawn(tracker: SpawnTracker, elapsedTime: number) {
    const schedule = tracker.schedule as IntervalSpawnSchedule;
    const expectedSpawns = Math.floor(elapsedTime / schedule.interval);

    while (tracker.spawnedCount < expectedSpawns && tracker.spawnedCount < tracker.totalCount) {
      this.spawnEnemy(tracker.enemyType);
      tracker.spawnedCount++;
    }
  }

  /**
   * Process burst spawning
   */
  private processBurstSpawn(tracker: SpawnTracker, elapsedTime: number) {
    const schedule = tracker.schedule as BurstSpawnSchedule;

    schedule.bursts.forEach(burst => {
      if (elapsedTime >= burst.time && tracker.spawnedCount < tracker.totalCount) {
        const spawnCount = Math.min(burst.count, tracker.totalCount - tracker.spawnedCount);

        for (let i = 0; i < spawnCount; i++) {
          this.spawnEnemy(tracker.enemyType);
          tracker.spawnedCount++;
        }
      }
    });
  }

  /**
   * Process custom spawn schedule
   */
  private processCustomSpawn(tracker: SpawnTracker, elapsedTime: number) {
    const schedule = tracker.schedule as CustomSpawnSchedule;

    while (tracker.spawnedCount < schedule.times.length &&
           elapsedTime >= schedule.times[tracker.spawnedCount]!) {
      this.spawnEnemy(tracker.enemyType);
      tracker.spawnedCount++;
    }
  }

  /**
   * Process random spawn schedule
   */
  private processRandomSpawn(tracker: SpawnTracker, elapsedTime: number) {
    if (!tracker.randomTimes) return;

    while (tracker.spawnedCount < tracker.randomTimes.length &&
           elapsedTime >= tracker.randomTimes[tracker.spawnedCount]!) {
     this.spawnEnemy(tracker.enemyType);
      tracker.spawnedCount++;
    }
  }

  /**
   * Spawn a single enemy
   */
  private spawnEnemy(type: EnemyType) {
    this.enemyManager.spawnEnemy(type);
  }

  /**
   * Complete the current wave and trigger transition
   */
  private completeWave() {
    if (!this.currentWaveConfig) return;

    console.log(`=== Wave ${this.currentWaveConfig.waveId} Completing ===`);

    this.isWaveActive = false;
    this.isInTransition = true;
    this.transitionStartTime = Date.now();

    // Award base gold
    GameActions.addMoney(this.currentWaveConfig.rewards.baseGold);
    console.log(`Awarded ${this.currentWaveConfig.rewards.baseGold} base gold`);

    // HP recovery every 5 waves
    if (this.currentWaveConfig.waveId % 5 === 0) {
      const healAmount = 5; // 5% of max HP
      GameActions.healBase(healAmount);
      console.log(`Wave ${this.currentWaveConfig.waveId}: Healed ${healAmount} HP`);
    }

    // Trigger transition UI
    console.log(`Triggering wave transition UI callback...`);
    console.log(`Callback exists: ${!!this.onWaveTransitionStart}`);

    if (this.onWaveTransitionStart) {
      this.onWaveTransitionStart(
        this.currentWaveConfig.waveId,
        this.currentWaveConfig.rewards,
        this.currentWaveConfig.waveTimeout
      );
      console.log(`Wave transition callback triggered successfully`);
    } else {
      console.warn(`Wave transition callback NOT SET!`);
    }
  }

  /**
   * Start next wave (called by transition UI)
   * @param bonusGold Bonus gold earned from early completion
   */
  startNextWave(bonusGold: number) {
    // Award bonus gold
    if (bonusGold > 0) {
      GameActions.addMoney(bonusGold);
      console.log(`Bonus gold awarded: +${bonusGold}g`);
    }

    this.isInTransition = false;
    this.currentWaveIndex++;
    this.loadWave(this.currentWaveIndex);
  }
}
