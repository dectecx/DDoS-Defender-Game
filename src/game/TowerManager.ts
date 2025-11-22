import { type Tower, TowerType, type Enemy } from './types';
import { GridManager } from './GridManager';
import { EnemyManager } from './EnemyManager';
import { ProjectileManager } from './ProjectileManager';

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

  addTower(x: number, y: number, type: TowerType) {
    let range = 3;
    let damage = 20;
    let cooldown = 500;
    let cost = 100;

    switch (type) {
      case TowerType.WAF: // AOE
        range = 2;
        damage = 10;
        cooldown = 1000;
        cost = 200;
        break;
      case TowerType.DPI: // Sniper
        range = 6;
        damage = 100;
        cooldown = 2000;
        cost = 300;
        break;
      case TowerType.CACHE: // Slow (Low damage)
        range = 3;
        damage = 5;
        cooldown = 200;
        cost = 150;
        break;
      case TowerType.RATE_LIMIT:
      default:
        range = 3;
        damage = 20;
        cooldown = 500;
        cost = 100;
        break;
    }

    const newTower: Tower = {
      id: crypto.randomUUID(),
      type: type,
      x: x,
      y: y,
      range: range,
      damage: damage,
      cooldown: cooldown,
      lastFired: 0,
      cost: cost
    };
    this.towers.push(newTower);
  }

  update(deltaTime: number, now: number) {
    this.towers.forEach(tower => {
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

  findTarget(tower: Tower): Enemy | null {
    const rangePx = tower.range * this.gridManager.cellSize;
    const towerPos = this.gridManager.getCanvasPosition(tower.x, tower.y);
    const towerCenter = {
        x: towerPos.x + this.gridManager.cellSize / 2,
        y: towerPos.y + this.gridManager.cellSize / 2
    };

    const enemiesInRange = this.enemyManager.enemies.filter(enemy => {
      if (!enemy.active) return false;
      const dx = enemy.position.x - towerCenter.x;
      const dy = enemy.position.y - towerCenter.y;
      return (dx * dx + dy * dy) <= (rangePx * rangePx);
    });

    if (enemiesInRange.length === 0) return null;

    // Targeting Strategy
    if (tower.type === TowerType.DPI) {
        // Strongest first
        return enemiesInRange.sort((a, b) => b.hp - a.hp)[0] || null;
    }

    // Default: First along path
    return enemiesInRange.sort((a, b) => b.pathIndex - a.pathIndex)[0] || null;
  }

  disableTower(towerId: string, duration: number) {
      // TODO: Implement disable logic
      // For now, just log it
      console.log(`Tower ${towerId} disabled for ${duration}ms`);
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.towers.forEach(tower => {
      const pos = this.gridManager.getCanvasPosition(tower.x, tower.y);
      
      let color = '#4488ff';
      switch (tower.type) {
        case TowerType.WAF: color = '#ff8800'; break; // Orange
        case TowerType.DPI: color = '#ff00ff'; break; // Magenta
        case TowerType.CACHE: color = '#00ffff'; break; // Cyan
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
    });
  }
}
