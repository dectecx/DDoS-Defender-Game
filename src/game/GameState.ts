import { reactive } from 'vue';

/**
 * GameState interface - Global game state
 */
export interface GameState {
  money: number;
  hp: number;
  maxHp: number;
  wave: number;
  score: number;
  isGameOver: boolean;
  isVictory: boolean;
}

/**
 * Reactive game state object
 */
export const gameState = reactive<GameState>({
  money: 500, // Initial resources
  hp: 100,
  maxHp: 100,
  wave: 1,
  score: 0,
  isGameOver: false,
  isVictory: false
});

/**
 * GameActions - Actions to modify game state
 */
export const GameActions = {
  /**
   * Add money to player's resources
   */
  addMoney(amount: number) {
    gameState.money += amount;
  },
  
  /**
   * Spend money if player has enough
   * @returns True if successful, false otherwise
   */
  spendMoney(amount: number): boolean {
    if (gameState.money >= amount) {
      gameState.money -= amount;
      return true;
    }
    return false;
  },
  
  /**
   * Apply damage to the base
   */
  takeDamage(amount: number) {
    gameState.hp -= amount;
    if (gameState.hp <= 0) {
      gameState.hp = 0;
      gameState.isGameOver = true;
    }
  },
  
  /**
   * Heal the base (capped at max HP)
   */
  healBase(amount: number) {
    gameState.hp = Math.min(gameState.hp + amount, gameState.maxHp);
  },
  
  /**
   * Set victory state
   */
  setVictory() {
    gameState.isVictory = true;
  },
  
  /**
   * Advance to next wave
   */
  nextWave() {
    gameState.wave++;
  }
};
