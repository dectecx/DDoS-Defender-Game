import { type Tower, TowerType, type Enemy } from './types';
import { GridManager } from './GridManager';
import { EnemyManager } from './EnemyManager';
import { ProjectileManager } from './ProjectileManager';
import { ExperienceSystem } from './systems/ExperienceSystem';

/**
 * TowerManager - Tower manager
 * Manages tower creation, targeting, attacking, and rendering
 */
export class TowerManager {
  towers: Tower[] = [];
  gridManager: GridManager;
  enemyManager: EnemyManager;
  projectileManager: ProjectileManager;

  constructor(
    gridManager: GridManager, 
    enemyManager: EnemyManager,
    projectileManager: ProjectileManager
  ) {
    this.gridManager = gridManager;
    this.enemyManager = enemyManager;
    this.projectileManager = projectileManager;
  }

  /**
   * Add a new tower
   * @param x Grid X coordinate
   * @param y Grid Y coordinate
   * @param type Tower type
   */
  addTower(x: number, y: number, type: TowerType) {
    const baseStats = this.getBaseStats(type);

    const newTower: Tower = {
      id: crypto.randomUUID(),
      type,
      x,
      y,
      range: baseStats.range,
      damage: baseStats.damage,
      cooldown: baseStats.cooldown,
      lastFired: 0,
      cost: baseStats.cost,
      disabledUntil: 0,
      // Experience system (Phase 8)
      level: 1,
      exp: 0,
      maxExp: ExperienceSystem.calculateMaxExp(1),
      totalInvestment: baseStats.cost
    };
    
    this.towers.push(newTower);
  }

  /**
   * Update all towers' state (targeting and attacking)
   * @param deltaTime Time increment (not used)
   * @param now Current timestamp
   */
  update(_deltaTime: number, now: number) {
    this.towers.forEach(tower => {
      // If tower is disabled, skip
      if (now < tower.disabledUntil) return;

      // If tower is cooling down, skip
      if (now - tower.lastFired < tower.cooldown) return;

      const target = this.findTarget(tower);
      if (target) {
        // Fire!
        const towerPos = this.gridManager.getCanvasPosition(tower.x, tower.y);
        const centerPos = {
            x: towerPos.x + this.gridManager.cellSize / 2,
            y: towerPos.y + this.gridManager.cellSize / 2
        };
        
        this.projectileManager.spawnProjectile(centerPos, target, tower.damage);
        tower.lastFired = now;
      }
    });
  }

  /**
   * Find target enemy for tower
   * @param tower Tower instance
   * @returns Found enemy, or null
   */
  findTarget(tower: Tower): Enemy | null {
    const rangePx = tower.range * this.gridManager.cellSize;
    const towerPos = this.gridManager.getCanvasPosition(tower.x, tower.y);
    const towerCenter = {
        x: towerPos.x + this.gridManager.cellSize / 2,
        y: towerPos.y + this.gridManager.cellSize / 2
    };

    // Filter enemies in range
    const enemiesInRange = this.enemyManager.enemies.filter((enemy: Enemy) => {
      const dx = enemy.position.x - towerCenter.x;
      const dy = enemy.position.y - towerCenter.y;
      return (dx * dx + dy * dy) <= (rangePx * rangePx);
    });

    if (enemiesInRange.length === 0) return null;

    // Targeting strategy
    if (tower.type === TowerType.DPI) {
        // Prioritize the enemy with the most health (sniper mode)
        return enemiesInRange.sort((a: Enemy, b: Enemy) => b.hp - a.hp)[0] || null;
    }

    // Default: Prioritize the enemy furthest along path
    return enemiesInRange.sort((a: Enemy, b: Enemy) => b.pathIndex - a.pathIndex)[0] || null;
  }

  /**
   * Disable a tower (Boss skill)
   * @param towerId Tower ID
   * @param duration Disable duration (milliseconds)
   */
  disableTower(towerId: string, duration: number) {
      const tower = this.towers.find(t => t.id === towerId);
      if (tower) {
          tower.disabledUntil = Date.now() + duration;
          console.log(`Tower ${towerId} disabled for ${duration}ms`);
      }
  }

  /**
   * Draw all towers
   * @param ctx Canvas rendering context
   */
  draw(ctx: CanvasRenderingContext2D) {
    const now = Date.now();

    this.towers.forEach(tower => {
      const pos = this.gridManager.getCanvasPosition(tower.x, tower.y);
      
      let color = '#4488ff';
      
      // Check if tower is disabled
      if (now < tower.disabledUntil) {
          color = '#555555'; // Gray
      } else {
        switch (tower.type) {
            case TowerType.WAF: color = '#ff8800'; break; // Orange
            case TowerType.DPI: color = '#ff00ff'; break; // Magenta
            case TowerType.CACHE: color = '#00ffff'; break; // Cyan
        }
      }

      ctx.fillStyle = color;
      ctx.fillRect(
        pos.x + 5, 
        pos.y + 5, 
        this.gridManager.cellSize - 10, 
        this.gridManager.cellSize - 10
      );
      
      // Label
      ctx.fillStyle = '#fff';
      ctx.font = '10px monospace';
      ctx.fillText(tower.type.substring(0, 3), pos.x + 10, pos.y + 30);
      
      // Disable indicator
      if (now < tower.disabledUntil) {
          ctx.fillStyle = '#ff0000';
          ctx.fillText('OFF', pos.x + 15, pos.y + 45);
      }
      
      // Level indicator (Phase 8)
      if (tower.level > 1) {
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`Lv.${tower.level}`, pos.x + 5, pos.y + 15);
      }
      
      // Experience bar (Phase 8)
      const expPercent = tower.exp / tower.maxExp;
      ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
      const barWidth = (this.gridManager.cellSize - 10) * expPercent;
      ctx.fillRect(pos.x + 5, pos.y + this.gridManager.cellSize - 8, barWidth, 3);
    });
  }

  /**
   * Get base stats for a tower type
   * @param type Tower type
   * @returns Base stats object
   */
  getBaseStats(type: TowerType): {
    range: number;
    damage: number;
    cooldown: number;
    cost: number;
  } {
    switch (type) {
      case TowerType.WAF:
        return { range: 2, damage: 10, cooldown: 1000, cost: 200 };
      case TowerType.DPI:
        return { range: 6, damage: 100, cooldown: 2000, cost: 300 };
      case TowerType.CACHE:
        return { range: 3, damage: 5, cooldown: 200, cost: 150 };
      case TowerType.RATE_LIMIT:
      default:
        return { range: 3, damage: 20, cooldown: 500, cost: 100 };
    }
  }

  /**
   * Award experience to a tower (called when it kills an enemy)
   * @param towerId Tower ID
   * @param exp Experience amount
   */
  awardExperience(towerId: string, exp: number) {
    const tower = this.towers.find(t => t.id === towerId);
    if (!tower) return;

    const leveledUp = ExperienceSystem.addExperience(tower, exp);
    if (leveledUp) {
      this.recalculateStats(tower);
      console.log(`Tower ${towerId} leveled up to ${tower.level}!`);
    }
  }

  /**
   * Recalculate tower stats based on current level
   * @param tower Tower to recalculate
   */
  recalculateStats(tower: Tower) {
    const baseStats = this.getBaseStats(tower.type);
    
    tower.damage = ExperienceSystem.calculateStatIncrease(
      baseStats.damage,
      tower.level,
      'damage'
    );
    
    tower.range = ExperienceSystem.calculateStatIncrease(
      baseStats.range,
      tower.level,
      'range'
    );
    
    tower.cooldown = ExperienceSystem.calculateStatIncrease(
      baseStats.cooldown,
      tower.level,
      'cooldown'
    );
  }
}
