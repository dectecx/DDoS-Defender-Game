import { CellType } from './types';
import type { Cell, GridConfig, Position } from './types';

export class GridManager {
  width: number;
  height: number;
  cellSize: number;
  grid: Cell[][];
  
  // Hardcoded path for MVP
  // A simple path from left to right
  private pathCoordinates: Position[] = [
    { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 },
    { x: 3, y: 3 }, { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 },
    { x: 6, y: 4 }, { x: 7, y: 4 }, { x: 7, y: 3 }, { x: 7, y: 2 },
    { x: 8, y: 2 }, { x: 9, y: 2 }, { x: 10, y: 2 }, { x: 11, y: 2 },
    { x: 12, y: 2 }, { x: 13, y: 2 }, { x: 14, y: 2 }, { x: 15, y: 2 },
    { x: 16, y: 2 }, { x: 17, y: 2 }, { x: 18, y: 2 }, { x: 19, y: 2 }
  ];

  constructor(config: GridConfig) {
    this.width = config.width;
    this.height = config.height;
    this.cellSize = config.cellSize;
    this.grid = [];
    this.initialize();
  }

  initialize() {
    // Initialize empty grid
    for (let y = 0; y < this.height; y++) {
      const row: Cell[] = [];
      for (let x = 0; x < this.width; x++) {
        row.push({
          x,
          y,
          type: CellType.EMPTY,
          towerId: null
        });
      }
      this.grid.push(row);
    }

    // Set path cells
    this.pathCoordinates.forEach(pos => {
      if (this.isValidPosition(pos)) {
        const row = this.grid[pos.y];
        if (row) {
          const cell = row[pos.x];
          if (cell) {
            cell.type = CellType.PATH;
          }
        }
      }
    });
  }

  isValidPosition(pos: Position): boolean {
    return pos.x >= 0 && pos.x < this.width && pos.y >= 0 && pos.y < this.height;
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const row = this.grid[y];
        if (!row) continue;
        
        const cell = row[x];
        if (!cell) continue;

        const px = x * this.cellSize;
        const py = y * this.cellSize;

        // Draw cell background
        ctx.fillStyle = this.getCellColor(cell.type);
        ctx.fillRect(px, py, this.cellSize, this.cellSize);

        // Draw grid lines
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(px, py, this.cellSize, this.cellSize);
      }
    }
  }

  getCellColor(type: CellType): string {
    switch (type) {
      case CellType.EMPTY: return '#222'; // Dark background
      case CellType.PATH: return '#3a3a3a'; // Slightly lighter path (Fiber optic cable look)
      case CellType.WALL: return '#111';
      case CellType.TOWER: return '#444';
      default: return '#000';
    }
  }

  getGridPosition(canvasX: number, canvasY: number): Position {
    return {
      x: Math.floor(canvasX / this.cellSize),
      y: Math.floor(canvasY / this.cellSize)
    };
  }

  getCanvasPosition(gridX: number, gridY: number): Position {
    return {
      x: gridX * this.cellSize,
      y: gridY * this.cellSize
    };
  }
  
  getPath(): Position[] {
      return this.pathCoordinates;
  }
}
