/**
 * Core game configuration
 */
export const GameConfig = {
  /** Initial player state */
  player: {
    /** Starting money/gold */
    startingMoney: 500,
    
    /** Starting HP */
    startingHP: 100,
    
    /** Maximum HP */
    maxHP: 100
  },
  
  /** Grid/Map settings */
  grid: {
    /** Grid width in cells */
    width: 20,
    
    /** Grid height in cells */
    height: 12,
    
    /** Cell size in pixels */
    cellSize: 64
  },
  
  /** Wave progression settings */
  waves: {
    /** Heal every N waves */
    healInterval: 5,
    
    /** HP restored on heal */
    healAmount: 5,
    
    /** Boss wave every N waves */
    bossInterval: 10
  },
  
  /** Projectile settings */
  projectile: {
    /** Projectile speed in pixels/second */
    speed: 400
  }
} as const;
