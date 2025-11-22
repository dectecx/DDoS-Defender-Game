import { EnemyType } from '../types';

/**
 * Spawn schedule types for wave configuration
 */
export type SpawnScheduleType = 'interval' | 'burst' | 'custom' | 'random';

/**
 * Base spawn schedule interface
 */
export interface BaseSpawnSchedule {
  type: SpawnScheduleType;
}

/**
 * Interval-based spawning (fixed time between spawns)
 */
export interface IntervalSpawnSchedule extends BaseSpawnSchedule {
  type: 'interval';
  interval: number; // milliseconds between spawns
}

/**
 * Burst spawning (spawn multiple at specific times)
 */
export interface BurstSpawnSchedule extends BaseSpawnSchedule {
  type: 'burst';
  bursts: Array<{
    time: number;    // milliseconds from wave start
    count: number;   // number to spawn at this time
  }>;
}

/**
 * Custom spawn schedule (exact times for each spawn)
 */
export interface CustomSpawnSchedule extends BaseSpawnSchedule {
  type: 'custom';
  times: number[]; // array of spawn times in milliseconds
}

/**
 * Random spawn schedule (random intervals within range)
 */
export interface RandomSpawnSchedule extends BaseSpawnSchedule {
  type: 'random';
  minInterval: number;
  maxInterval: number;
  duration: number; // total duration to spawn over
}

/**
 * Union type for all spawn schedules
 */
export type SpawnSchedule = 
  | IntervalSpawnSchedule 
  | BurstSpawnSchedule 
  | CustomSpawnSchedule 
  | RandomSpawnSchedule;

/**
 * Enemy spawn configuration for a wave
 */
export interface EnemySpawnConfig {
  type: EnemyType;
  count: number;
  spawnSchedule: SpawnSchedule;
}

/**
 * Wave rewards configuration
 */
export interface WaveRewards {
  baseGold: number;   // Gold awarded on wave completion
  bonusGold: number;  // Maximum bonus for early completion
}

/**
 * Complete wave configuration
 */
export interface WaveConfig {
  waveId: number;
  enemies: EnemySpawnConfig[];
  waveTimeout: number;      // Milliseconds until forced next wave
  rewards: WaveRewards;
  isBossWave?: boolean;
}

/**
 * Level configuration with multiple waves
 */
export interface LevelConfig {
  levelId: number;
  mapWidth: number;
  mapHeight: number;
  initialResources: number;
  mapLayout: number[][];
  waves: WaveConfig[];
}

/**
 * Spawn tracker for managing enemy spawning
 */
export interface SpawnTracker {
  enemyType: EnemyType;
  totalCount: number;
  spawnedCount: number;
  schedule: SpawnSchedule;
  nextSpawnTime: number;
  randomTimes?: number[]; // For random schedules
}
