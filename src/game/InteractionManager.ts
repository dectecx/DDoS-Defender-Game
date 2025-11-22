import { GridManager } from './GridManager';
import { GameActions } from './GameState';
import { CellType, TowerType } from './types';

/**
 * InteractionManager - User interaction manager
 * Handles mouse clicks on the grid and tower placement logic
 */
export class InteractionManager {
  gridManager: GridManager;

  constructor(gridManager: GridManager) {
    this.gridManager = gridManager;
  }

  /**
   * Handle a click on the canvas
   * @param canvasX Canvas X position
   * @param canvasY Canvas Y position
   * @param selectedTowerType Tower type to build
   * @returns Build action result or null
   */
  handleClick(canvasX: number, canvasY: number, selectedTowerType: TowerType) {
    const gridPos = this.gridManager.getGridPosition(canvasX, canvasY);
    
    if (!this.gridManager.isValidPosition(gridPos)) return;

    const cell = this.gridManager.grid[gridPos.y]?.[gridPos.x];

    if (!cell) return;

    if (cell.type === CellType.EMPTY) {
      // Calculate cost based on tower type
      let cost = 100;
      switch (selectedTowerType) {
        case TowerType.WAF: cost = 200; break;
        case TowerType.DPI: cost = 300; break;
        case TowerType.CACHE: cost = 150; break;
        case TowerType.RATE_LIMIT: default: cost = 100; break;
      }

      if (GameActions.spendMoney(cost)) {
        cell.type = CellType.TOWER;
        cell.towerId = crypto.randomUUID();
        console.log(`Built ${selectedTowerType} at ${gridPos.x}, ${gridPos.y}`);
        return { action: 'BUILD', x: gridPos.x, y: gridPos.y, type: selectedTowerType };
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
