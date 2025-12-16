import { describe, it, expect, beforeEach } from 'vitest';
import { GridManager } from './GridManager';
import { CellType } from './types';

describe('GridManager', () => {
  let gridManager: GridManager;

  beforeEach(() => {
    gridManager = new GridManager({ width: 5, height: 5, cellSize: 50 });
  });

  describe('initialization', () => {
    it('should create grid with correct dimensions', () => {
      // Use a simple path layout so A* can find a path
      const layout = [
        [1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
      ];
      gridManager.initialize(layout);

      expect(gridManager.grid.length).toBe(5);
      expect(gridManager.grid[0]?.length).toBe(5);
    });

    it('should parse mapLayout correctly', () => {
      const layout = [
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 0],
      ];

      gridManager = new GridManager({ width: 3, height: 3, cellSize: 50 });
      gridManager.initialize(layout);

      expect(gridManager.grid[0]?.[0]?.type).toBe(CellType.EMPTY);
      expect(gridManager.grid[0]?.[1]?.type).toBe(CellType.PATH);
      expect(gridManager.grid[1]?.[1]?.type).toBe(CellType.PATH);
    });

    it('should parse blocked cells', () => {
      const layout = [
        [0, 2, 0],
        [1, 1, 1],
        [0, 2, 0],
      ];

      gridManager = new GridManager({ width: 3, height: 3, cellSize: 50 });
      gridManager.initialize(layout);

      expect(gridManager.grid[0]?.[1]?.type).toBe(CellType.BLOCKED);
      expect(gridManager.grid[2]?.[1]?.type).toBe(CellType.BLOCKED);
    });
  });

  describe('getCanvasPosition', () => {
    it('should convert grid coordinates to canvas coordinates', () => {
      gridManager.initialize([[1, 1, 1, 1, 1]]);

      const pos = gridManager.getCanvasPosition(2, 3);

      expect(pos.x).toBe(100); // 2 * 50
      expect(pos.y).toBe(150); // 3 * 50
    });

    it('should handle (0, 0)', () => {
      gridManager.initialize([[1, 1, 1, 1, 1]]);

      const pos = gridManager.getCanvasPosition(0, 0);

      expect(pos.x).toBe(0);
      expect(pos.y).toBe(0);
    });
  });

  describe('getGridPosition', () => {
    it('should convert canvas coordinates to grid coordinates', () => {
      gridManager.initialize([[1, 1, 1, 1, 1]]);

      const pos = gridManager.getGridPosition(125, 175);

      expect(pos.x).toBe(2); // floor(125/50)
      expect(pos.y).toBe(3); // floor(175/50)
    });

    it('should handle edge of cell', () => {
      gridManager.initialize([[1, 1, 1, 1, 1]]);

      const pos = gridManager.getGridPosition(49, 49);

      expect(pos.x).toBe(0);
      expect(pos.y).toBe(0);
    });
  });

  describe('getCell', () => {
    it('should return cell at given position', () => {
      const layout = [
        [0, 1, 0],
        [0, 1, 0],
      ];

      gridManager = new GridManager({ width: 3, height: 2, cellSize: 50 });
      gridManager.initialize(layout);

      const cell = gridManager.getCell(1, 0);

      expect(cell?.type).toBe(CellType.PATH);
      expect(cell?.x).toBe(1);
      expect(cell?.y).toBe(0);
    });

    it('should return null for out of bounds', () => {
      gridManager.initialize([[1, 1, 1, 1, 1]]);

      expect(gridManager.getCell(-1, 0)).toBeNull();
      expect(gridManager.getCell(0, -1)).toBeNull();
      expect(gridManager.getCell(100, 0)).toBeNull();
    });
  });

  describe('setCell', () => {
    it('should update cell type', () => {
      gridManager.initialize([[1, 1, 1, 1, 1]]);

      gridManager.setCell(2, 0, CellType.TOWER);

      expect(gridManager.getCell(2, 0)?.type).toBe(CellType.TOWER);
    });
  });

  describe('getPath', () => {
    it('should return calculated path', () => {
      const layout = [
        [0, 0, 0],
        [1, 1, 1],
        [0, 0, 0],
      ];

      gridManager = new GridManager({ width: 3, height: 3, cellSize: 50 });
      gridManager.initialize(layout);

      const path = gridManager.getPath();

      expect(path.length).toBeGreaterThan(0);
    });
  });

  describe('isValidPosition', () => {
    it('should return true for valid positions', () => {
      gridManager.initialize([[1, 1, 1, 1, 1]]);

      expect(gridManager.isValidPosition({ x: 0, y: 0 })).toBe(true);
      expect(gridManager.isValidPosition({ x: 4, y: 4 })).toBe(true);
    });

    it('should return false for out of bounds', () => {
      gridManager.initialize([[1, 1, 1, 1, 1]]);

      expect(gridManager.isValidPosition({ x: -1, y: 0 })).toBe(false);
      expect(gridManager.isValidPosition({ x: 0, y: -1 })).toBe(false);
      expect(gridManager.isValidPosition({ x: 10, y: 0 })).toBe(false);
    });
  });
});
