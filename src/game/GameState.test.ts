import { describe, it, expect, beforeEach, vi } from 'vitest';

// 使用 vi.hoisted() 創建可以在 mock 和測試中引用的變數
const { MockGameConfig } = vi.hoisted(() => ({
  MockGameConfig: {
    player: {
      startingMoney: 1000,
      startingHP: 200,
      maxHP: 200
    }
  }
}));

vi.mock('../config/game.config', () => ({
  GameConfig: MockGameConfig
}));

import { gameState, GameActions } from './GameState';

describe('GameState', () => {
  beforeEach(() => {
    GameActions.resetGame();
  });

  describe('initial state', () => {
    it('should have correct initial values from mocked config', () => {
      expect(gameState.money).toBe(MockGameConfig.player.startingMoney);
      expect(gameState.hp).toBe(MockGameConfig.player.startingHP);
      expect(gameState.maxHp).toBe(MockGameConfig.player.maxHP);
      expect(gameState.wave).toBe(1);
      expect(gameState.score).toBe(0);
      expect(gameState.isGameOver).toBe(false);
      expect(gameState.isVictory).toBe(false);
    });
  });

  describe('addMoney', () => {
    it('should add money to current balance', () => {
      GameActions.addMoney(100);
      expect(gameState.money).toBe(MockGameConfig.player.startingMoney + 100);
    });

    it('should handle multiple additions', () => {
      GameActions.addMoney(100);
      GameActions.addMoney(50);
      expect(gameState.money).toBe(MockGameConfig.player.startingMoney + 150);
    });
  });

  describe('spendMoney', () => {
    it('should deduct money when sufficient balance', () => {
      const result = GameActions.spendMoney(200);
      expect(result).toBe(true);
      expect(gameState.money).toBe(MockGameConfig.player.startingMoney - 200);
    });

    it('should return false when insufficient balance', () => {
      const overSpendAmount = MockGameConfig.player.startingMoney + 100;
      const result = GameActions.spendMoney(overSpendAmount);
      expect(result).toBe(false);
      expect(gameState.money).toBe(MockGameConfig.player.startingMoney);
    });

    it('should not deduct if not enough money', () => {
      GameActions.spendMoney(400);
      GameActions.spendMoney(400);
      const result = GameActions.spendMoney(400);
      expect(result).toBe(false);
      expect(gameState.money).toBe(MockGameConfig.player.startingMoney - 800);
    });
  });

  describe('takeDamage', () => {
    it('should reduce HP', () => {
      GameActions.takeDamage(50);
      expect(gameState.hp).toBe(MockGameConfig.player.startingHP - 50);
    });

    it('should set game over when HP reaches 0', () => {
      GameActions.takeDamage(MockGameConfig.player.startingHP);
      expect(gameState.hp).toBe(0);
      expect(gameState.isGameOver).toBe(true);
    });

    it('should not go below 0 HP', () => {
      GameActions.takeDamage(MockGameConfig.player.maxHP + 100);
      expect(gameState.hp).toBe(0);
    });
  });

  describe('healBase', () => {
    it('should heal HP', () => {
      GameActions.takeDamage(100);
      GameActions.healBase(50);
      expect(gameState.hp).toBe(MockGameConfig.player.startingHP - 100 + 50);
    });

    it('should not exceed maxHp', () => {
      GameActions.healBase(100);
      expect(gameState.hp).toBe(MockGameConfig.player.maxHP);
    });
  });

  describe('setVictory', () => {
    it('should set victory state', () => {
      GameActions.setVictory();
      expect(gameState.isVictory).toBe(true);
    });
  });

  describe('resetGame', () => {
    it('should reset all values to mocked config values', () => {
      GameActions.addMoney(500);
      GameActions.takeDamage(100);
      gameState.wave = 5;
      gameState.isGameOver = true;

      GameActions.resetGame();

      expect(gameState.money).toBe(MockGameConfig.player.startingMoney);
      expect(gameState.hp).toBe(MockGameConfig.player.startingHP);
      expect(gameState.wave).toBe(1);
      expect(gameState.isGameOver).toBe(false);
    });
  });
});
