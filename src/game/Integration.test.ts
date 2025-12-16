import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GridManager } from './GridManager';
import { TowerManager } from './TowerManager';
import { EnemyManager } from './EnemyManager';
import { ProjectileManager } from './ProjectileManager';
import { GameActions, gameState } from './GameState';
import { TowerType } from './types';

// Mock dependencies
const { mockAddProjectile } = vi.hoisted(() => ({
  mockAddProjectile: vi.fn()
}));

vi.mock('./ProjectileManager', () => ({
  ProjectileManager: class {
    addProjectile = mockAddProjectile;
    update = vi.fn();
    draw = vi.fn();
  }
}));

vi.mock('./AudioManager', () => ({
  AudioManager: {
    getInstance: () => ({
      playSound: vi.fn(),
      playBGM: vi.fn(),
      stopBGM: vi.fn()
    })
  }
}));

vi.stubGlobal('crypto', {
    randomUUID: () => 'test-uuid-' + Math.random()
});

describe('Integration Tests', () => {
    it('should place tower and deduct money', () => {
        vi.useFakeTimers();
        GameActions.resetGame();
        gameState.money = 1000;

        const gridManager = new GridManager({ width: 10, height: 10, cellSize: 50 });
        gridManager.initialize();

        const enemyManager = new EnemyManager(gridManager);
        // @ts-ignore
        const projectileManager = new ProjectileManager(enemyManager);
        const towerManager = new TowerManager(gridManager, enemyManager, projectileManager);

        const initialMoney = gameState.money;
        const towerCost = towerManager.getBaseStats(TowerType.RATE_LIMIT).cost;

        towerManager.addTower(5, 5, TowerType.RATE_LIMIT);
        GameActions.addMoney(-towerCost);

        expect(towerManager.towers.length).toBe(1);
        expect(gameState.money).toBe(initialMoney - towerCost);

        vi.useRealTimers();
    });
});
