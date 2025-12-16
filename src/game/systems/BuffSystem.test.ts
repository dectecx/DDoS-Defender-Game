import { describe, it, expect, beforeEach } from 'vitest';
import { BuffSystem, BuffType } from './BuffSystem';
import type { Tower } from '../types';
import { TowerType } from '../types';

// Helper to create mock tower
function createMockTower(id: string, x: number, y: number, type: TowerType = TowerType.WAF): Tower {
  return {
    id,
    type,
    x,
    y,
    level: 1,
    exp: 0,
    maxExp: 100,
    damage: 10,
    range: 3,
    cooldown: 1000,
    lastFired: 0,
    cost: 100,
    disabledUntil: 0,
    totalInvestment: 100,
  };
}

describe('BuffSystem', () => {
  let buffSystem: BuffSystem;

  beforeEach(() => {
    buffSystem = new BuffSystem();
  });

  describe('applyBuff / getTotalBuff', () => {
    it('should apply a buff to a tower', () => {
      buffSystem.applyBuff('tower1', 'source1', BuffType.ATTACK_SPEED, 0.1);

      const total = buffSystem.getTotalBuff('tower1', BuffType.ATTACK_SPEED);
      expect(total).toBe(0.1);
    });

    it('should stack buffs from different sources', () => {
      buffSystem.applyBuff('tower1', 'source1', BuffType.ATTACK_SPEED, 0.1);
      buffSystem.applyBuff('tower1', 'source2', BuffType.ATTACK_SPEED, 0.1);

      const total = buffSystem.getTotalBuff('tower1', BuffType.ATTACK_SPEED);
      expect(total).toBe(0.2);
    });

    it('should limit attack speed stacks to 2', () => {
      buffSystem.applyBuff('tower1', 'source1', BuffType.ATTACK_SPEED, 0.1);
      buffSystem.applyBuff('tower1', 'source2', BuffType.ATTACK_SPEED, 0.1);
      buffSystem.applyBuff('tower1', 'source3', BuffType.ATTACK_SPEED, 0.1);

      // Should only count first 2 stacks
      const total = buffSystem.getTotalBuff('tower1', BuffType.ATTACK_SPEED);
      expect(total).toBe(0.2);
    });

    it('should limit range stacks to 2', () => {
      buffSystem.applyBuff('tower1', 'source1', BuffType.RANGE, 1);
      buffSystem.applyBuff('tower1', 'source2', BuffType.RANGE, 1);
      buffSystem.applyBuff('tower1', 'source3', BuffType.RANGE, 1);

      const total = buffSystem.getTotalBuff('tower1', BuffType.RANGE);
      expect(total).toBe(2);
    });

    it('should update existing buff from same source', () => {
      buffSystem.applyBuff('tower1', 'source1', BuffType.ATTACK_SPEED, 0.1);
      buffSystem.applyBuff('tower1', 'source1', BuffType.ATTACK_SPEED, 0.2);

      const total = buffSystem.getTotalBuff('tower1', BuffType.ATTACK_SPEED);
      expect(total).toBe(0.2);
    });

    it('should return 0 for tower with no buffs', () => {
      const total = buffSystem.getTotalBuff('unknown', BuffType.ATTACK_SPEED);
      expect(total).toBe(0);
    });
  });

  describe('removeBuffsFromSource', () => {
    it('should remove all buffs from a specific source', () => {
      buffSystem.applyBuff('tower1', 'source1', BuffType.ATTACK_SPEED, 0.1);
      buffSystem.applyBuff('tower1', 'source2', BuffType.ATTACK_SPEED, 0.1);
      buffSystem.applyBuff('tower2', 'source1', BuffType.RANGE, 1);

      buffSystem.removeBuffsFromSource('source1');

      expect(buffSystem.getTotalBuff('tower1', BuffType.ATTACK_SPEED)).toBe(0.1); // source2 remains
      expect(buffSystem.getTotalBuff('tower2', BuffType.RANGE)).toBe(0);
    });
  });

  describe('removeAllBuffs', () => {
    it('should remove all buffs from a tower', () => {
      buffSystem.applyBuff('tower1', 'source1', BuffType.ATTACK_SPEED, 0.1);
      buffSystem.applyBuff('tower1', 'source2', BuffType.RANGE, 1);

      buffSystem.removeAllBuffs('tower1');

      expect(buffSystem.getTotalBuff('tower1', BuffType.ATTACK_SPEED)).toBe(0);
      expect(buffSystem.getTotalBuff('tower1', BuffType.RANGE)).toBe(0);
    });
  });

  describe('income towers', () => {
    it('should register and track income towers', () => {
      buffSystem.registerIncomeTower('farmer1');
      buffSystem.registerIncomeTower('farmer2');

      expect(buffSystem.getPassiveIncome()).toBe(10); // 2 * 5 gold/sec
    });

    it('should unregister income towers', () => {
      buffSystem.registerIncomeTower('farmer1');
      buffSystem.registerIncomeTower('farmer2');
      buffSystem.unregisterIncomeTower('farmer1');

      expect(buffSystem.getPassiveIncome()).toBe(5);
    });
  });

  describe('applyAreaBuffs', () => {
    it('should apply buffs to towers in range', () => {
      const buffTower = createMockTower('buff', 0, 0, TowerType.SUPERVISOR);
      const nearTower = createMockTower('near', 1, 1);
      const farTower = createMockTower('far', 10, 10);

      buffSystem.applyAreaBuffs(
        buffTower,
        [buffTower, nearTower, farTower],
        BuffType.ATTACK_SPEED,
        0.1,
        3 // range in cells
      );

      expect(buffSystem.getTotalBuff('near', BuffType.ATTACK_SPEED)).toBe(0.1);
      expect(buffSystem.getTotalBuff('far', BuffType.ATTACK_SPEED)).toBe(0);
    });

    it('should not buff self', () => {
      const buffTower = createMockTower('buff', 0, 0, TowerType.SUPERVISOR);

      buffSystem.applyAreaBuffs(
        buffTower,
        [buffTower],
        BuffType.ATTACK_SPEED,
        0.1,
        5
      );

      expect(buffSystem.getTotalBuff('buff', BuffType.ATTACK_SPEED)).toBe(0);
    });
  });

  describe('clear', () => {
    it('should clear all buffs and income towers', () => {
      buffSystem.applyBuff('tower1', 'source1', BuffType.ATTACK_SPEED, 0.1);
      buffSystem.registerIncomeTower('farmer1');

      buffSystem.clear();

      expect(buffSystem.getTotalBuff('tower1', BuffType.ATTACK_SPEED)).toBe(0);
      expect(buffSystem.getPassiveIncome()).toBe(0);
    });
  });
});
