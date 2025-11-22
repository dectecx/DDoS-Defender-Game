import { EnemyManager } from './EnemyManager';
import type { TowerManager } from './TowerManager';
import type { Enemy, Position } from './types';
import { GameActions } from './GameState';

/**
 * Projectile interface - represents a bullet/attack projectile
 */
export interface Projectile {
  id: string;
  x: number;
  y: number;
  targetId: string;
  speed: number;
  damage: number;
  active: boolean;
  targetX: number; // Snapshot of target position
  targetY: number;
  ownerId?: string; // Tower ID that fired this projectile (Phase 8)
}

/**
 * ProjectileManager - manages all projectiles
 * Handles spawning, movement, collision detection, and rendering
 */
export class ProjectileManager {
  projectiles: Projectile[] = [];
  enemyManager: EnemyManager;
  towerManager: TowerManager | null = null; // For experience awards (Phase 8)

  constructor(enemyManager: EnemyManager) {
    this.enemyManager = enemyManager;
  }

  /**
   * Set TowerManager reference (for experience awards)
   */
  setTowerManager(tm: TowerManager) {
    this.towerManager = tm;
  }

  /**
   * Spawn a new projectile
   * @param startPos Starting position (tower center)
   * @param target Target enemy
   * @param damage Damage to deal on hit
   * @param ownerId Tower ID that fired this projectile (optional)
   */
  spawnProjectile(startPos: Position, target: Enemy, damage: number, ownerId?: string) {
    this.projectiles.push({
      id: crypto.randomUUID(),
      x: startPos.x,
      y: startPos.y,
      targetId: target.id,
      targetX: target.position.x, // Lock on to current position
      targetY: target.position.y,
      speed: 400, // pixels per second
      damage: damage,
      active: true,
      ownerId: ownerId // Track which tower fired this
    });
  }

  /**
   * Update all projectiles
   * @param deltaTime Time delta in seconds
   */
  update(deltaTime: number) {
    this.projectiles.forEach(proj => {
      if (!proj.active) return;

      // Update target position if enemy is still alive (homing projectile)
      const targetEnemy = this.enemyManager.enemies.find((e: Enemy) => e.id === proj.targetId);
      if (targetEnemy && targetEnemy.active) {
          proj.targetX = targetEnemy.position.x;
          proj.targetY = targetEnemy.position.y;
      }

      const dx = proj.targetX - proj.x;
      const dy = proj.targetY - proj.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      const moveStep = proj.speed * deltaTime;

      if (distance < moveStep) {
        // Hit target position
        proj.active = false;
        
        // Check collision with enemies
        const hitEnemy = this.enemyManager.enemies.find((e: Enemy) => {
            if (!e.active) return false;
            const edx = e.position.x - proj.targetX;
            const edy = e.position.y - proj.targetY;
            return (edx * edx + edy * edy) < (32 * 32); // Hit radius
        });

        if (hitEnemy) {
            hitEnemy.hp -= proj.damage;
            if (hitEnemy.hp <= 0) {
                hitEnemy.active = false;
                
                // Award gold (Phase 8: use enemy's goldReward)
                const goldReward = hitEnemy.goldReward || 20;
                GameActions.addMoney(goldReward);
                
                // Award experience to tower (Phase 8)
                if (proj.ownerId && this.towerManager && hitEnemy.expReward) {
                  this.towerManager.awardExperience(proj.ownerId, hitEnemy.expReward);
                }
            }

            // Apply Status Effects
            // Low damage projectiles (CACHE tower) apply slow effect
            if (proj.damage < 20) {
                hitEnemy.status.isSlowed = true;
                hitEnemy.status.slowFactor = 0.5; // 50% slow
                hitEnemy.status.slowTimer = 3000; // 3 seconds
            }
        }

      } else {
        // Move towards target
        proj.x += (dx / distance) * moveStep;
        proj.y += (dy / distance) * moveStep;
      }
    });

    // Cleanup inactive projectiles
    this.projectiles = this.projectiles.filter(p => p.active);
  }

  /**
   * Draw all projectiles
   * @param ctx Canvas rendering context
   */
  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#ffff00'; // Yellow bullets
    this.projectiles.forEach(proj => {
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}
