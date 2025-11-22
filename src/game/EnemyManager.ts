import { EnemyType } from './types';
import type { Enemy, Position } from './types';
import { GridManager } from './GridManager';

export class EnemyManager {
  enemies: Enemy[] = [];
  gridManager: GridManager;
  
  constructor(gridManager: GridManager) {
    this.gridManager = gridManager;
  }

  spawnEnemy(type: EnemyType) {
    const path = this.gridManager.getPath();
    if (path.length === 0) return;

    const startNode = path[0];
    if (!startNode) return;

    const startPos = this.gridManager.getCanvasPosition(startNode.x, startNode.y);

    const newEnemy: Enemy = {
      id: crypto.randomUUID(),
      type: type,
      hp: 100, // Default for now
      maxHp: 100,
      speed: 100, // Pixels per second
      pathIndex: 0,
      position: { x: startPos.x, y: startPos.y },
      active: true
    };

    this.enemies.push(newEnemy);
  }

  update(deltaTime: number) {
    const path = this.gridManager.getPath();
    
    this.enemies.forEach(enemy => {
      if (!enemy.active) return;

      // Target the next node in the path
      const nextNodeIndex = enemy.pathIndex + 1;
      
      // If reached end of path
      if (nextNodeIndex >= path.length) {
        enemy.active = false;
        // TODO: Deal damage to base
        console.log('Enemy reached base!');
        return;
      }

      const nextNode = path[nextNodeIndex];
      if (!nextNode) return;

      const targetPos = this.gridManager.getCanvasPosition(nextNode.x, nextNode.y);
      
      // Move towards target
      const dx = targetPos.x - enemy.position.x;
      const dy = targetPos.y - enemy.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 5) {
        // Reached the node, snap to it and increment index
        enemy.position.x = targetPos.x;
        enemy.position.y = targetPos.y;
        enemy.pathIndex++;
      } else {
        // Normalize and move
        const moveStep = enemy.speed * deltaTime;
        enemy.position.x += (dx / distance) * moveStep;
        enemy.position.y += (dy / distance) * moveStep;
      }
    });

    // Cleanup inactive enemies
    this.enemies = this.enemies.filter(e => e.active);
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.enemies.forEach(enemy => {
      ctx.fillStyle = '#ff0000'; // Red for enemies
      
      // Draw centered
      const size = this.gridManager.cellSize * 0.6;
      const offset = (this.gridManager.cellSize - size) / 2;
      
      ctx.fillRect(
        enemy.position.x + offset, 
        enemy.position.y + offset, 
        size, 
        size
      );
    });
  }
}
