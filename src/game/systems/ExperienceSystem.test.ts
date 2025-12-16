import { describe, it, expect, beforeEach } from 'vitest';
import { ExperienceSystem } from './ExperienceSystem';
import type { Tower } from '../types';
import { TowerType } from '../types';

// Helper to create mock tower
function createMockTower(level: number = 1, exp: number = 0): Tower {
  return {
    id: 'test-tower',
    type: TowerType.RATE_LIMIT,
    x: 0,
    y: 0,
    level,
    exp,
    maxExp: ExperienceSystem.calculateMaxExp(level),
    damage: 10,
    range: 3,
    cooldown: 1000,
    lastFired: 0,
    cost: 100,
    disabledUntil: 0,
    totalInvestment: 100,
  };
}

describe('ExperienceSystem', () => {
  describe('calculateMaxExp', () => {
    it('should return base exp for level 1', () => {
      const exp = ExperienceSystem.calculateMaxExp(1);
      expect(exp).toBe(100); // baseExpRequired
    });

    it('should scale exp for higher levels', () => {
      const level1 = ExperienceSystem.calculateMaxExp(1);
      const level2 = ExperienceSystem.calculateMaxExp(2);
      const level3 = ExperienceSystem.calculateMaxExp(3);

      expect(level2).toBeGreaterThan(level1);
      expect(level3).toBeGreaterThan(level2);
    });

    it('should return Infinity for max level', () => {
      const exp = ExperienceSystem.calculateMaxExp(ExperienceSystem.MAX_LEVEL);
      expect(exp).toBe(Infinity);
    });
  });

  describe('calculateStatIncrease', () => {
    it('should return base value at level 1', () => {
      const damage = ExperienceSystem.calculateStatIncrease(10, 1, 'damage');
      expect(damage).toBe(10);
    });

    it('should increase stats at higher levels', () => {
      const damageLevel1 = ExperienceSystem.calculateStatIncrease(10, 1, 'damage');
      const damageLevel2 = ExperienceSystem.calculateStatIncrease(10, 2, 'damage');

      expect(damageLevel2).toBeGreaterThan(damageLevel1);
    });

    it('should decrease cooldown at higher levels', () => {
      const cooldownLevel1 = ExperienceSystem.calculateStatIncrease(1000, 1, 'cooldown');
      const cooldownLevel2 = ExperienceSystem.calculateStatIncrease(1000, 2, 'cooldown');
      
      // Cooldown multiplier < 1, so it should decrease
      expect(cooldownLevel2).toBeLessThan(cooldownLevel1);
    });
  });

  describe('addExperience', () => {
    it('should add experience to tower', () => {
      const tower = createMockTower(1, 0);
      
      ExperienceSystem.addExperience(tower, 50);
      
      expect(tower.exp).toBe(50);
    });

    it('should return false when no level up', () => {
      const tower = createMockTower(1, 0);
      
      const result = ExperienceSystem.addExperience(tower, 50);
      
      expect(result).toBe(false);
    });

    it('should return true and level up when exp exceeds maxExp', () => {
      const tower = createMockTower(1, 99);
      
      const result = ExperienceSystem.addExperience(tower, 10);
      
      expect(result).toBe(true);
      expect(tower.level).toBe(2);
    });

    it('should not add exp to max level tower', () => {
      const tower = createMockTower(ExperienceSystem.MAX_LEVEL, 0);
      
      const result = ExperienceSystem.addExperience(tower, 100);
      
      expect(result).toBe(false);
    });
  });

  describe('levelUp', () => {
    it('should increase level', () => {
      const tower = createMockTower(1, 100);
      
      ExperienceSystem.levelUp(tower);
      
      expect(tower.level).toBe(2);
    });

    it('should carry over excess exp', () => {
      const tower = createMockTower(1, 120);
      
      ExperienceSystem.levelUp(tower);
      
      expect(tower.exp).toBe(20); // 120 - 100
    });

    it('should update maxExp for new level', () => {
      const tower = createMockTower(1, 100);
      const originalMaxExp = tower.maxExp;
      
      ExperienceSystem.levelUp(tower);
      
      expect(tower.maxExp).toBeGreaterThan(originalMaxExp);
    });

    it('should not level up past max level', () => {
      const tower = createMockTower(ExperienceSystem.MAX_LEVEL, 0);
      
      const result = ExperienceSystem.levelUp(tower);
      
      expect(result).toBe(false);
      expect(tower.level).toBe(ExperienceSystem.MAX_LEVEL);
    });
  });

  describe('getLevelProgress', () => {
    it('should return 0 for no exp', () => {
      const tower = createMockTower(1, 0);
      
      const progress = ExperienceSystem.getLevelProgress(tower);
      
      expect(progress).toBe(0);
    });

    it('should return 50 for half exp', () => {
      const tower = createMockTower(1, 50);
      
      const progress = ExperienceSystem.getLevelProgress(tower);
      
      expect(progress).toBe(50);
    });

    it('should return 100 for max level tower', () => {
      const tower = createMockTower(ExperienceSystem.MAX_LEVEL, 0);
      
      const progress = ExperienceSystem.getLevelProgress(tower);
      
      expect(progress).toBe(100);
    });
  });

  describe('getStatMultipliers', () => {
    it('should return 1 for all stats at level 1', () => {
      const multipliers = ExperienceSystem.getStatMultipliers(1);
      
      expect(multipliers.damage).toBe(1);
      expect(multipliers.range).toBe(1);
      expect(multipliers.cooldown).toBe(1);
    });

    it('should increase damage/range multipliers at higher levels', () => {
      const level1 = ExperienceSystem.getStatMultipliers(1);
      const level3 = ExperienceSystem.getStatMultipliers(3);
      
      expect(level3.damage).toBeGreaterThan(level1.damage);
      expect(level3.range).toBeGreaterThan(level1.range);
    });

    it('should decrease cooldown multiplier at higher levels', () => {
      const level1 = ExperienceSystem.getStatMultipliers(1);
      const level3 = ExperienceSystem.getStatMultipliers(3);
      
      expect(level3.cooldown).toBeLessThan(level1.cooldown);
    });
  });
});
