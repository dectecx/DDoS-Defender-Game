export const CellType = {
  EMPTY: 'EMPTY',
  WALL: 'WALL',
  PATH: 'PATH',
  TOWER: 'TOWER'
} as const;

export type CellType = typeof CellType[keyof typeof CellType];


export interface Position {
  x: number;
  y: number;
}

export const EnemyType = {
  REQ_STD: 'REQ_STD',
  REQ_HEAVY: 'REQ_HEAVY',
  REQ_STREAM: 'REQ_STREAM',
  ZERO_DAY: 'ZERO_DAY'
} as const;

export type EnemyType = typeof EnemyType[keyof typeof EnemyType];

export const TowerType = {
  RATE_LIMIT: 'RATE_LIMIT',
  WAF: 'WAF',
  DPI: 'DPI',
  CACHE: 'CACHE',
  // Special Buff Towers
  CODE_FARMER: 'CODE_FARMER',     // Passive income
  SUPERVISOR: 'SUPERVISOR',       // Attack speed buff
  SYSTEM_ANALYST: 'SYSTEM_ANALYST' // Range buff
} as const;

export type TowerType = typeof TowerType[keyof typeof TowerType];

export interface Tower {
  id: string;
  type: TowerType;
  x: number; // Grid X
  y: number; // Grid Y
  range: number; // Grid cells
  damage: number;
  cooldown: number; // ms
  lastFired: number; // timestamp
  cost: number;
  disabledUntil: number; // timestamp, 0 if active
  
  // Experience & Leveling
  level: number;           // Current level (1-10)
  exp: number;            // Current experience
  maxExp: number;         // Experience needed for next level
  totalInvestment: number; // Total gold spent (for sell price)
}

export interface Enemy {
  id: string;
  type: EnemyType;
  hp: number;
  maxHp: number;
  speed: number;
  position: Position;
  pathIndex: number;
  slowedUntil: number; // timestamp
  active: boolean;
  status: {
    isSlowed: boolean;
    slowFactor: number;
    slowTimer: number;
  };
  
  // Rewards
  goldReward: number;  // Gold awarded on kill
  expReward: number;   // Experience awarded to tower
}

export interface Cell {
  x: number;
  y: number;
  type: CellType;
  towerId: string | null;
}

export interface GridConfig {
  width: number;
  height: number;
  cellSize: number;
}
