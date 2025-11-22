import { EnemyType } from './types';
import type { Enemy } from './types';
import { GridManager } from './GridManager';
import { GameActions } from './GameState';
import type { TowerManager } from './TowerManager';

/**
 * EnemyManager - Enemy manager
 * Manages enemy generation, movement, state updates, and rendering
 */
export class EnemyManager {
  enemies: Enemy[] = [];
  gridManager: GridManager;
  towerManager: TowerManager | null = null; // For Boss skill, avoid circular dependency

  constructor(gridManager: GridManager) {
    this.gridManager = gridManager;
  }

  /**
   * Set TowerManager reference (for Boss skill)
   */
  setTowerManager(tm: TowerManager) {
      this.towerManager = tm;
  }

  /**
   * Spawn an enemy
   * @param type Enemy type
   */
  spawnEnemy(type: EnemyType) {
    const path = this.gridManager.getPath();
    if (path.length === 0) return;

    const startNode = path[0];
    if (!startNode) return;

    const startPos = this.gridManager.getCanvasPosition(startNode.x, startNode.y);

    // Set enemy attributes based on type
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

  /**
   * Update all enemy states
   * @param deltaTime Time increment (seconds)
   */
  update(deltaTime: number) {
    this.enemies.forEach(enemy => {
      if (!enemy.active) return;

      // Handle status effects (slow)
      if (enemy.status.isSlowed) {
        enemy.status.slowTimer -= deltaTime * 1000;
        if (enemy.status.slowTimer <= 0) {
          enemy.status.isSlowed = false;
          enemy.status.slowFactor = 1;
        }
      }

      // Boss skill: Blackout (Blackout)
      // 1% chance to trigger skill per frame
      if (enemy.type === EnemyType.ZERO_DAY && this.towerManager) {
          if (Math.random() < 0.01) {
              // Find towers in range
              const range = 5 * this.gridManager.cellSize;
              this.towerManager.towers.forEach(tower => {
                  const towerPos = this.gridManager.getCanvasPosition(tower.x, tower.y);
                  const dx = towerPos.x - enemy.position.x;
                  const dy = towerPos.y - enemy.position.y;
                  if (dx*dx + dy*dy < range*range) {
                      this.towerManager!.disableTower(tower.id, 5000); // Paralyze for 5 seconds
                  }
              });
          }
      }

      // Path movement logic
      const path = this.gridManager.getPath();
      if (enemy.pathIndex >= path.length - 1) {
        // Arrived at destination
        console.log('Enemy reached base!');
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
        // Arrived at node
        enemy.position.x = targetPos.x;
        enemy.position.y = targetPos.y;
        enemy.pathIndex++;
      } else {
        enemy.position.x += (dx / distance) * moveStep;
        enemy.position.y += (dy / distance) * moveStep;
      }
    });

    // Clean up dead enemies
    this.enemies = this.enemies.filter(e => e.active);
  }

  /**
   * Draw all enemies
   * @param ctx Canvas rendering context
   */
  draw(ctx: CanvasRenderingContext2D) {
    this.enemies.forEach(enemy => {
      let color = '#ff0000';
      let scale = 0.6;

      // Set color and size based on type
      switch (enemy.type) {
        case EnemyType.REQ_HEAVY:
          color = '#880000'; // Deep red (tank)
          scale = 0.8;
          break;
        case EnemyType.REQ_STREAM:
          color = '#ff8888'; // Light red (fast)
          scale = 0.4;
          break;
        case EnemyType.ZERO_DAY:
          color = '#800080'; // Purple (Boss)
          scale = 0.9;
          break;
      }

      // Visual indicator for slow effect
      if (enemy.status.isSlowed) {
          color = '#00ffff'; // Blue indicates slow
      }

      ctx.fillStyle = color;
      
      // Draw enemy (centered)
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
