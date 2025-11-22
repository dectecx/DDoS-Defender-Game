import { reactive } from 'vue';

export interface GameState {
  money: number;
  hp: number;
  maxHp: number;
  wave: number;
  score: number;
  isGameOver: boolean;
}

export const gameState = reactive<GameState>({
  money: 500, // Initial resources
  hp: 100,
  maxHp: 100,
  wave: 1,
  score: 0,
  isGameOver: false
});

export const GameActions = {
  addMoney(amount: number) {
    gameState.money += amount;
  },
  spendMoney(amount: number): boolean {
    if (gameState.money >= amount) {
      gameState.money -= amount;
      return true;
    }
    return false;
  },
  takeDamage(amount: number) {
    gameState.hp = Math.max(0, gameState.hp - amount);
    if (gameState.hp <= 0) {
      gameState.isGameOver = true;
    }
  },
  nextWave() {
    gameState.wave++;
  }
};
