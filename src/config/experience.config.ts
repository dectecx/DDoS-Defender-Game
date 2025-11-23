/**
 * Experience and leveling configuration
 */
export const ExperienceConfig = {
  /** Base experience required for first level up */
  baseExpRequired: 100,
  
  /** Maximum tower level */
  maxLevel: 10,
  
  /** Experience scaling factor per level */
  expScaling: 1.5,
  
  /** Stat growth multipliers per level */
  statGrowth: {
    /** Damage multiplier per level (1.05 = +5% per level) */
    damage: 1.05,
    
    /** Range multiplier per level (1.02 = +2% per level) */
    range: 1.02,
    
    /** Cooldown multiplier per level (0.98 = -2% per level, faster) */
    cooldown: 0.98
  }
} as const;
