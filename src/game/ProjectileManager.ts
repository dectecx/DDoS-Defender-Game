import { EnemyManager } from './EnemyManager';
import type { Enemy, Position } from './types';

export interface Projectile {
  id: string;
  x: number;
  y: number;
  targetId: string;
  speed: number;
  damage: number;
  active: boolean;
}

export class ProjectileManager {
  projectiles: Projectile[] = [];
  enemyManager: EnemyManager;

  constructor(enemyManager: EnemyManager) {
    this.enemyManager = enemyManager;
  }

  spawnProjectile(startPos: Position, targetId: string, damage: number) {
    this.projectiles.push({
      id: crypto.randomUUID(),
      x: startPos.x,
      y: startPos.y,
      targetId: targetId,
      speed: 400, // pixels per second
      damage: damage,
      active: true
    });
  }

  update(deltaTime: number) {
    this.projectiles.forEach(proj => {
      if (!proj.active) return;

      const target = this.enemyManager.enemies.find(e => e.id === proj.targetId);
      
      if (!target || !target.active) {
        proj.active = false; // Target lost
        return;
      }

      // Move towards target
      const dx = target.position.x - proj.x;
      const dy = target.position.y - proj.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 10) {
        // Hit!
        target.hp -= proj.damage;
        if (target.hp <= 0) {
          target.active = false;
          // TODO: Add money on kill
        }
        proj.active = false;
      } else {
        const moveStep = proj.speed * deltaTime;
        proj.x += (dx / distance) * moveStep;
        proj.y += (dy / distance) * moveStep;
      }
    });

    this.projectiles = this.projectiles.filter(p => p.active);
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#ffff00'; // Yellow bullets
    this.projectiles.forEach(proj => {
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}
