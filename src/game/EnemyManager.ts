import { EnemyType } from './types';
import type { Enemy, Position } from './types';
import { GridManager } from './GridManager';
import { GameActions } from './GameState';

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

    let hp = 100;
    let speed = 100;
    
    switch (type) {
      case EnemyType.REQ_HEAVY:
        hp = 300;
        speed = 50;
        break;
      case EnemyType.REQ_STREAM:
        hp = 30;
        speed = 200;
        break;
      case EnemyType.ZERO_DAY:
        hp = 1000;
        speed = 40;
        break;
      case EnemyType.REQ_STD:
      default:
        hp = 100;
        speed = 100;
        break;
    }

    const newEnemy: Enemy = {
      id: crypto.randomUUID(),
      type: type,
      hp: hp,
      maxHp: hp,
      speed: speed,
      pathIndex: 0,
      position: { x: startPos.x, y: startPos.y },
      active: true,
      status: {
        isSlowed: false,
        slowFactor: 1,
        slowTimer: 0
      }
    };

    this.enemies.push(newEnemy);
  }

  update(deltaTime: number) {
    this.enemies.forEach(enemy => {
      if (!enemy.active) return;

      // Handle Status Effects
      if (enemy.status.isSlowed) {
        enemy.status.slowTimer -= deltaTime * 1000;
        if (enemy.status.slowTimer <= 0) {
          enemy.status.isSlowed = false;
          enemy.status.slowFactor = 1;
        }
      }

      const path = this.gridManager.getPath();
      if (enemy.pathIndex >= path.length - 1) {
        // Reached end
        console.log('Enemy Reached Base!');
        GameActions.takeDamage(10);
        enemy.active = false;
        return;
      }

      const targetNode = path[enemy.pathIndex + 1];
      if (!targetNode) return;
      const targetPos = this.gridManager.getCanvasPosition(targetNode.x, targetNode.y);
      
      // Move towards target
      const dx = targetPos.x - enemy.position.x;
      const dy = targetPos.y - enemy.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      const currentSpeed = enemy.speed * enemy.status.slowFactor;
      const moveStep = currentSpeed * deltaTime;

      if (distance < moveStep) {
        // Reached node
        enemy.position.x = targetPos.x;
        enemy.position.y = targetPos.y;
        enemy.pathIndex++;
      } else {
        enemy.position.x += (dx / distance) * moveStep;
        enemy.position.y += (dy / distance) * moveStep;
      }
    });

    // Cleanup
    this.enemies = this.enemies.filter(e => e.active);
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.enemies.forEach(enemy => {
      let color = '#ff0000';
      let scale = 0.6;

      switch (enemy.type) {
        case EnemyType.REQ_HEAVY:
          color = '#880000'; // Dark Red
          scale = 0.8;
          break;
        case EnemyType.REQ_STREAM:
          color = '#ff8888'; // Light Red
          scale = 0.4;
          break;
        case EnemyType.ZERO_DAY:
          color = '#800080'; // Purple
          scale = 0.9;
          break;
      }

      // Visual indicator for Slow
      if (enemy.status.isSlowed) {
          color = '#00ffff'; // Cyan tint for slow
      }

      ctx.fillStyle = color;
      
      // Draw centered
      const size = this.gridManager.cellSize * scale;
      const offset = (this.gridManager.cellSize - size) / 2;
      
      ctx.fillRect(
        enemy.position.x + offset, 
        enemy.position.y + offset, 
        size, 
        size
      );

      // Draw HP Bar
      const hpPercent = enemy.hp / enemy.maxHp;
      ctx.fillStyle = '#333';
      ctx.fillRect(enemy.position.x, enemy.position.y - 5, this.gridManager.cellSize, 4);
      ctx.fillStyle = '#0f0';
      ctx.fillRect(enemy.position.x, enemy.position.y - 5, this.gridManager.cellSize * hpPercent, 4);
    });
  }
}
