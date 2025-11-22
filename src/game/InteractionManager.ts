import { GridManager } from './GridManager';
import { GameActions } from './GameState';
import { CellType, TowerType } from './types';

export class InteractionManager {
  gridManager: GridManager;

  constructor(gridManager: GridManager) {
    this.gridManager = gridManager;
  }

  handleClick(canvasX: number, canvasY: number) {
    const gridPos = this.gridManager.getGridPosition(canvasX, canvasY);
    
    if (!this.gridManager.isValidPosition(gridPos)) return;

    const cell = this.gridManager.grid[gridPos.y]?.[gridPos.x];

    if (!cell) return;

    // Simple toggle for MVP: Click empty -> Build Tower
    // In real game, we'd select a tower type from UI first.
    // For now, default to RATE_LIMIT tower.
    
    if (cell.type === CellType.EMPTY) {
      const cost = 100; // Hardcoded cost for now
      if (GameActions.spendMoney(cost)) {
        cell.type = CellType.TOWER;
        cell.towerId = crypto.randomUUID(); // Placeholder, actual tower creation handled by TowerManager
        console.log(`Built tower at ${gridPos.x}, ${gridPos.y}`);
        return { action: 'BUILD', x: gridPos.x, y: gridPos.y, type: TowerType.RATE_LIMIT };
      } else {
        console.log('Not enough money!');
      }
    } else if (cell.type === CellType.TOWER) {
      console.log('Tower already exists here.');
    } else {
      console.log('Cannot build here.');
    }
    
    return null;
  }
}
