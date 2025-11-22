import { GridManager } from './GridManager';
import { GameActions } from './GameState';
import { CellType, TowerType } from './types';
import type { TowerManager } from './TowerManager';

/**
 * InteractionManager - User interaction manager
 * Handles mouse clicks on the grid for tower placement and selection
 */
export class InteractionManager {
  gridManager: GridManager;
  towerManager: TowerManager | null = null;

  constructor(gridManager: GridManager) {
    this.gridManager = gridManager;
  }

  /**
   * Set TowerManager reference for dynamic cost calculation
   */
  setTowerManager(tm: TowerManager) {
    this.towerManager = tm;
  }

  /**
   * Handle a click on the canvas
   * @param canvasX Canvas X position  
   * @param canvasY Canvas Y position
   * @param selectedTowerType Tower type to build
   * @returns Action result or null
   */
  handleClick(
    canvasX: number, 
    canvasY: number, 
    selectedTowerType: TowerType
  ): { action: 'BUILD' | 'SELECT', x: number, y: number, type: TowerType } | null {
    const gridPos = this.gridManager.getGridPosition(canvasX, canvasY);
    
    if (!this.gridManager.isValidPosition(gridPos)) return null;

    const cell = this.gridManager.grid[gridPos.y]?.[gridPos.x];
    if (!cell) return null;

    // If clicking on a tower, return SELECT action
    if (cell.type === CellType.TOWER) {
      return {
        action: 'SELECT',
        x: gridPos.x,
        y: gridPos.y,
        type: selectedTowerType // Not used for SELECT
      };
    }

    // If clicking on empty space, try to build
    if (cell.type === CellType.EMPTY) {
      // Get cost from TowerManager for dynamic pricing (e.g., CODE_FARMER)
      let cost = 100;
      if (this.towerManager) {
        const stats = this.towerManager.getBaseStats(selectedTowerType);
        cost = stats.cost;
      } else {
        // Fallback to hardcoded costs if TowerManager not set
        switch (selectedTowerType) {
          case TowerType.WAF: cost = 200; break;
          case TowerType.DPI: cost = 300; break;
          case TowerType.CACHE: cost = 150; break;
          case TowerType.CODE_FARMER: cost = 250; break;
          case TowerType.SUPERVISOR: cost = 300; break;
          case TowerType.SYSTEM_ANALYST: cost = 350; break;
          case TowerType.RATE_LIMIT: default: cost = 100; break;
        }
      }

      if (GameActions.spendMoney(cost)) {
        cell.type = CellType.TOWER;
        cell.towerId = crypto.randomUUID();
        console.log(`Built ${selectedTowerType} at ${gridPos.x}, ${gridPos.y} for ${cost}g`);
        return { action: 'BUILD', x: gridPos.x, y: gridPos.y, type: selectedTowerType };
      } else {
        console.log('Not enough money!');
      }
    } else {
      console.log('Cannot build here.');
    }
    
    return null;
  }
}
