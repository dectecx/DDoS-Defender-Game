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
    const newTower: Tower = {
      id: crypto.randomUUID(),
      type: type,
      x: x,
      y: y,
      range: 3, // Grid cells
      damage: 20,
      cooldown: 500, // ms
      lastFired: 0,
      cost: 100
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
        // Center of the cell
        const centerPos = {
            x: towerPos.x + this.gridManager.cellSize / 2,
            y: towerPos.y + this.gridManager.cellSize / 2
        };
        
        this.projectileManager.spawnProjectile(centerPos, target.id, tower.damage);
        tower.lastFired = now;
      }
    });
  }

  findTarget(tower: Tower): Enemy | null {
    // Simple strategy: First enemy in range
    // Convert range to pixels for distance check
    const rangePx = tower.range * this.gridManager.cellSize;
    const towerPos = this.gridManager.getCanvasPosition(tower.x, tower.y);
    const towerCenter = {
        x: towerPos.x + this.gridManager.cellSize / 2,
        y: towerPos.y + this.gridManager.cellSize / 2
    };

    // Filter enemies in range
    const enemiesInRange = this.enemyManager.enemies.filter(enemy => {
      if (!enemy.active) return false;
      const dx = enemy.position.x - towerCenter.x;
      const dy = enemy.position.y - towerCenter.y;
      return (dx * dx + dy * dy) <= (rangePx * rangePx);
    });

    if (enemiesInRange.length === 0) return null;

    // Sort by path index (furthest along path)
    return enemiesInRange.sort((a, b) => b.pathIndex - a.pathIndex)[0] ?? null;
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.towers.forEach(tower => {
      const pos = this.gridManager.getCanvasPosition(tower.x, tower.y);
      
      // Draw Tower Base
      ctx.fillStyle = '#4488ff'; // Blue tower
      ctx.fillRect(
        pos.x + 5, 
        pos.y + 5, 
        this.gridManager.cellSize - 10, 
        this.gridManager.cellSize - 10
      );

      // Draw Range (Optional, maybe only on hover)
      // ctx.strokeStyle = 'rgba(68, 136, 255, 0.2)';
      // ctx.beginPath();
      // ctx.arc(
      //   pos.x + this.gridManager.cellSize/2, 
      //   pos.y + this.gridManager.cellSize/2, 
      //   tower.range * this.gridManager.cellSize, 
      //   0, Math.PI*2
      // );
      // ctx.stroke();
    });
  }
}
