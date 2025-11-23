/**
 * Buff system configuration
 */
export const BuffConfig = {
  /** Attack speed buff configuration (SUPERVISOR tower) */
  attackSpeed: {
    /** Attack speed bonus multiplier (0.2 = +20% attack speed) */
    bonus: 0.2,
    
    /** Maximum number of buff stacks */
    maxStacks: 2,
    
    /** Buff range in grid cells */
    buffRange: 2
  },
  
  /** Range buff configuration (SYSTEM_ANALYST tower) */
  range: {
    /** Range bonus in grid cells */
    bonus: 1,
    
    /** Maximum number of buff stacks */
    maxStacks: 2,
    
    /** Buff range in grid cells */
    buffRange: 2
  },
  
  /** Passive income configuration (CODE_FARMER tower) */
  passiveIncome: {
    /** Gold generated per second per CODE_FARMER */
    goldPerSecond: 5,
    
    /** Minimum CODE_FARMER towers needed */
    farmersNeeded: 1
  }
} as const;
