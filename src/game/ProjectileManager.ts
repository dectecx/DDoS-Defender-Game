import { EnemyManager } from './EnemyManager';
import type { Enemy, Position } from './types';
import { GameActions } from './GameState';

export interface Projectile {
  id: string;
  x: number;
  y: number;
  targetId: string;
  speed: number;
  damage: number;
  active: boolean;
  targetX: number; // Snapshot of target pos
  targetY: number;
}

export class ProjectileManager {
  projectiles: Projectile[] = [];
  enemyManager: EnemyManager;

  constructor(enemyManager: EnemyManager) {
    this.enemyManager = enemyManager;
  }

  spawnProjectile(startPos: Position, target: Enemy, damage: number) {
    this.projectiles.push({
      id: crypto.randomUUID(),
      x: startPos.x,
      y: startPos.y,
      targetId: target.id,
      targetX: target.position.x, // Lock on to current position (or predict?)
      targetY: target.position.y, // For now, simple lock-on to current pos
      speed: 400, // pixels per second
      damage: damage,
      active: true
    });
  }

  update(deltaTime: number) {
    this.projectiles.forEach(proj => {
      if (!proj.active) return;

      // Update target position if enemy is still alive
      const targetEnemy = this.enemyManager.enemies.find(e => e.id === proj.targetId);
      if (targetEnemy && targetEnemy.active) {
          proj.targetX = targetEnemy.position.x;
          proj.targetY = targetEnemy.position.y;
      } else {
          // Target dead, continue to last known pos? Or destroy?
          // Let's continue to last known pos
      }

      const dx = proj.targetX - proj.x;
      const dy = proj.targetY - proj.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      const moveStep = proj.speed * deltaTime;

      if (distance < moveStep) {
        // Hit target position
        proj.active = false;
        
        // Check collision with enemies
        // Simple check: find enemy closest to target pos
        const hitEnemy = this.enemyManager.enemies.find(e => {
            if (!e.active) return false;
            const edx = e.position.x - proj.targetX;
            const edy = e.position.y - proj.targetY;
            return (edx * edx + edy * edy) < (32 * 32); // Hit radius
        });

        if (hitEnemy) {
            hitEnemy.hp -= proj.damage;
            if (hitEnemy.hp <= 0) {
                hitEnemy.active = false;
                GameActions.addMoney(20);
            }

            // Apply Status Effects
            // Assuming we add an 'effect' property to Projectile in the future
            // For now, let's hack it: if damage is low (CACHE tower), apply slow
            if (proj.damage < 20) { // CACHE tower has low damage
                hitEnemy.status.isSlowed = true;
                hitEnemy.status.slowFactor = 0.5;
                hitEnemy.status.slowTimer = 3000; // 3 seconds
            }
        }

      } else {
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
