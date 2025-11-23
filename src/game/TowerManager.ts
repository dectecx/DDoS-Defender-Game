import { type Tower, TowerType, type Enemy } from './types';
import { GridManager } from './GridManager';
import { EnemyManager } from './EnemyManager';
import { ProjectileManager } from './ProjectileManager';
import { ExperienceSystem } from './systems/ExperienceSystem';
import { BuffSystem, BuffType } from './systems/BuffSystem';

/**
 * TowerManager - Tower manager
 * Manages tower creation, targeting, attacking, and rendering
 */
export class TowerManager {
  towers: Tower[] = [];
  gridManager: GridManager;
  enemyManager: EnemyManager;
  projectileManager: ProjectileManager;
  buffSystem: BuffSystem;

  constructor(
    gridManager: GridManager, 
    enemyManager: EnemyManager,
    projectileManager: ProjectileManager
  ) {
    this.gridManager = gridManager;
    this.enemyManager = enemyManager;
    this.projectileManager = projectileManager;
    this.buffSystem = new BuffSystem();
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
      level: 1,
      exp: 0,
      maxExp: ExperienceSystem.calculateMaxExp(1),
      totalInvestment: baseStats.cost
    };
    
    this.towers.push(newTower);
    
    // Register buff towers and apply their effects
    if (type === TowerType.CODE_FARMER) {
      this.buffSystem.registerIncomeTower(newTower.id);
    } else if (type === TowerType.SUPERVISOR || type === TowerType.SYSTEM_ANALYST) {
      // Apply area buffs immediately
      this.updateBuffTowerEffects(newTower);
    }
  }

  /**
   * Update all towers' state (targeting and attacking)
   * @param deltaTime Time increment (not used)
   * @param now Current timestamp
   */
  update(_deltaTime: number, now: number) {
    this.towers.forEach(tower => {
      // Buff towers don't attack
      if (tower.type === TowerType.CODE_FARMER || 
          tower.type === TowerType.SUPERVISOR ||
          tower.type === TowerType.SYSTEM_ANALYST) {
        return;
      }

      // If tower is disabled, skip
      if (now < tower.disabledUntil) return;

      // Apply buff effects to tower stats
      const buffedCooldown = this.getBuffedCooldown(tower);
      
      // If tower is cooling down, skip
      if (now - tower.lastFired < buffedCooldown) return;

      const target = this.findTarget(tower);
      if (target) {
        // Fire!
        const towerPos = this.gridManager.getCanvasPosition(tower.x, tower.y);
        const centerPos = {
            x: towerPos.x + this.gridManager.cellSize / 2,
            y: towerPos.y + this.gridManager.cellSize / 2
        };
        
        this.projectileManager.spawnProjectile(centerPos, target, tower.damage, tower.id);
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
    // Apply range buffs
    const buffedRange = this.getBuffedRange(tower);
    const rangePx = buffedRange * this.gridManager.cellSize;
    
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
   * Sell a tower
   * @param towerId Tower ID to sell
   * @returns Gold refunded, or 0 if tower not found
   */
  sellTower(towerId: string): number {
    const tower = this.towers.find(t => t.id === towerId);
    if (!tower) return 0;

    // Calculate sell price (70% of total investment)
    const sellPrice = Math.floor(tower.totalInvestment * 0.7);

    // Clean up buff system
    if (tower.type === TowerType.CODE_FARMER) {
      this.buffSystem.unregisterIncomeTower(towerId);
    } else if (tower.type === TowerType.SUPERVISOR || tower.type === TowerType.SYSTEM_ANALYST) {
      // Remove buffs this tower was providing
      this.buffSystem.removeBuffsFromSource(towerId);
    }
    
    // Remove buffs applied to this tower
    this.buffSystem.removeAllBuffs(towerId);

    // Remove tower from array
    this.towers = this.towers.filter(t => t.id !== towerId);

    // Clear grid cell
    this.gridManager.setCell(tower.x, tower.y, 'EMPTY');

    console.log(`Tower ${towerId} sold for ${sellPrice}g`);
    return sellPrice;
  }

  /**
   * Get tower at specific grid position
   * @param gridX Grid X coordinate
   * @param gridY Grid Y coordinate
   * @returns Tower if found, null otherwise
   */
  getTowerAt(gridX: number, gridY: number): Tower | null {
    return this.towers.find(t => t.x === gridX && t.y === gridY) || null;
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
            // Special Buff Towers
            case TowerType.CODE_FARMER: color = '#ffd700'; break; // Gold
            case TowerType.SUPERVISOR: color = '#ff6b6b'; break; // Red
            case TowerType.SYSTEM_ANALYST: color = '#4ecdc4'; break; // Teal
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
      
      // Level indicator
      if (tower.level > 1) {
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`Lv.${tower.level}`, pos.x + 5, pos.y + 15);
      }
      
      // Experience bar
      const expPercent = tower.exp / tower.maxExp;
      ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
      const barWidth = (this.gridManager.cellSize - 10) * expPercent;
      ctx.fillRect(pos.x + 5, pos.y + this.gridManager.cellSize - 8, barWidth, 3);
    });
  }

  /**
   * Draw range indicator for a specific tower
   * @param ctx Canvas context
   * @param towerId Tower ID to show range for
   */
  drawRangeIndicator(ctx: CanvasRenderingContext2D, towerId: string) {
    const tower = this.towers.find(t => t.id === towerId);
    if (!tower) return;

    const towerPos = this.gridManager.getCanvasPosition(tower.x, tower.y);
    const centerX = towerPos.x + this.gridManager.cellSize / 2;
    const centerY = towerPos.y + this.gridManager.cellSize / 2;

    // Determine range and color based on tower type
    let range = tower.range;
    let color = '#00ff00';
    let label = 'Attack Range';

    if (tower.type === TowerType.SUPERVISOR || tower.type === TowerType.SYSTEM_ANALYST) {
      color = '#ffd700';
      label = 'Buff Range';
    } else if (tower.type === TowerType.CODE_FARMER) {
      return; // CODE_FARMER has no range
    } else {
      range = this.getBuffedRange(tower);
    }

    const rangePx = range * this.gridManager.cellSize;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color + '1a';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    ctx.beginPath();
    ctx.arc(centerX, centerY, rangePx, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.fillStyle = color;
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(label, centerX, centerY - rangePx - 10);

    ctx.restore();
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
        return { range: 3, damage: 20, cooldown: 500, cost: 100 };
      // Special Buff Towers
      case TowerType.CODE_FARMER: {
        // Dynamic pricing: base 250 + 100 per existing CODE_FARMER
        const existingCount = this.towers.filter(t => t.type === TowerType.CODE_FARMER).length;
        const cost = 250 + (existingCount * 100);
        return { range: 0, damage: 0, cooldown: 999999, cost }; // Passive income, doesn't attack
      }
      case TowerType.SUPERVISOR:
        return { range: 2, damage: 0, cooldown: 999999, cost: 300 }; // Attack speed buff, range = buff area
      case TowerType.SYSTEM_ANALYST:
        return { range: 2, damage: 0, cooldown: 999999, cost: 350 }; // Range buff, range = buff area
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

  /**
   * Update buff effects for a buff tower (SUPERVISOR or SYSTEM_ANALYST)
   * @param buffTower The buff tower
   */
  private updateBuffTowerEffects(buffTower: Tower) {
    if (buffTower.type === TowerType.SUPERVISOR) {
      // Apply attack speed buff (+20% = cooldown * 0.8)
      this.buffSystem.applyAreaBuffs(
        buffTower,
        this.towers,
        BuffType.ATTACK_SPEED,
        0.2, // 20% reduction
        buffTower.range
      );
    } else if (buffTower.type === TowerType.SYSTEM_ANALYST) {
      // Apply range buff (+1 cell)
      this.buffSystem.applyAreaBuffs(
        buffTower,
        this.towers,
        BuffType.RANGE,
        1, // +1 cell
        buffTower.range
      );
    }
  }

  /**
   * Get buffed cooldown for a tower
   * @param tower Tower
   * @returns Cooldown with buffs applied
   */
  private getBuffedCooldown(tower: Tower): number {
    const attackSpeedBuff = this.buffSystem.getTotalBuff(tower.id, BuffType.ATTACK_SPEED);
    // Attack speed buff reduces cooldown
    return tower.cooldown * (1 - attackSpeedBuff);
  }

  /**
   * Get buffed range for a tower
   * @param tower Tower
   * @returns Range with buffs applied
   */
  private getBuffedRange(tower: Tower): number {
    const rangeBuff = this.buffSystem.getTotalBuff(tower.id, BuffType.RANGE);
    return tower.range + rangeBuff;
  }
}
