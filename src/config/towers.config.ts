import { TowerType } from '../game/types';

/**
 * Tower statistics interface
 */
export interface TowerStats {
  range: number;
  damage: number;
  cooldown: number;
  baseCost: number;
  description: string;
  displayName: string;
}

/**
 * Tower configuration - All tower stats and properties
 */
export const TowerConfig: Record<TowerType, TowerStats> = {
  [TowerType.RATE_LIMIT]: {
    range: 3,
    damage: 20,
    cooldown: 500,
    baseCost: 100,
    displayName: 'Rate Limiter',
    description: 'Basic defense tower with balanced stats'
  },
  
  [TowerType.WAF]: {
    range: 2,
    damage: 10,
    cooldown: 1000,
    baseCost: 200,
    displayName: 'WAF',
    description: 'Web Application Firewall - short range, slower attack'
  },
  
  [TowerType.DPI]: {
    range: 6,
    damage: 100,
    cooldown: 2000,
    baseCost: 300,
    displayName: 'DPI',
    description: 'Deep Packet Inspection - long range sniper tower'
  },
  
  [TowerType.CACHE]: {
    range: 3,
    damage: 5,
    cooldown: 200,
    baseCost: 150,
    displayName: 'Cache',
    description: 'Fast attacking cache system'
  },
  
  [TowerType.CODE_FARMER]: {
    range: 0,
    damage: 0,
    cooldown: 999999,
    baseCost: 250,
    displayName: 'Code Farmer',
    description: 'Generates passive income (5 gold/sec)'
  },
  
  [TowerType.SUPERVISOR]: {
    range: 2,
    damage: 0,
    cooldown: 999999,
    baseCost: 300,
    displayName: 'Supervisor',
    description: 'Increases attack speed of nearby towers (+20%)'
  },
  
  [TowerType.SYSTEM_ANALYST]: {
    range: 2,
    damage: 0,
    cooldown: 999999,
    baseCost: 350,
    displayName: 'System Analyst',
    description: 'Increases range of nearby towers (+1 cell)'
  }
} as const;

/**
 * Tower pricing configuration
 */
export const TowerPricing = {
  /** Cost increment for each CODE_FARMER tower */
  codeFarmerIncrement: 100,
  
  /** Percentage of investment returned when selling (0.7 = 70%) */
  sellPriceRatio: 0.7
} as const;
