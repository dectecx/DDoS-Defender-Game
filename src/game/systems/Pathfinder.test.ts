import { describe, it, expect } from 'vitest';
import { Pathfinder } from './Pathfinder';
import { CellType } from '../types';
import type { Cell, Position } from '../types';

/**
 * Helper function to create a grid from a layout
 * 0 = EMPTY, 1 = PATH, 2 = BLOCKED
 */
function createGrid(layout: number[][]): Cell[][] {
  return layout.map((row, y) =>
    row.map((value, x) => ({
      x,
      y,
      type: value === 1 ? CellType.PATH : value === 2 ? CellType.BLOCKED : CellType.EMPTY,
      towerId: null,
    }))
  );
}

describe('Pathfinder', () => {
  const pathfinder = new Pathfinder();

  describe('findPath', () => {
    it('should find a straight horizontal path', () => {
      const layout = [
        [1, 1, 1, 1, 1],
      ];
      const grid = createGrid(layout);
      const start: Position = { x: 0, y: 0 };
      const end: Position = { x: 4, y: 0 };

      const path = pathfinder.findPath(start, end, grid);

      expect(path).toHaveLength(5);
      expect(path[0]).toEqual({ x: 0, y: 0 });
      expect(path[4]).toEqual({ x: 4, y: 0 });
    });

    it('should find a straight vertical path', () => {
      const layout = [
        [1],
        [1],
        [1],
        [1],
      ];
      const grid = createGrid(layout);
      const start: Position = { x: 0, y: 0 };
      const end: Position = { x: 0, y: 3 };

      const path = pathfinder.findPath(start, end, grid);

      expect(path).toHaveLength(4);
      expect(path[0]).toEqual({ x: 0, y: 0 });
      expect(path[3]).toEqual({ x: 0, y: 3 });
    });

    it('should find an L-shaped path', () => {
      const layout = [
        [1, 1, 1],
        [0, 0, 1],
        [0, 0, 1],
      ];
      const grid = createGrid(layout);
      const start: Position = { x: 0, y: 0 };
      const end: Position = { x: 2, y: 2 };

      const path = pathfinder.findPath(start, end, grid);

      expect(path).toHaveLength(5);
      expect(path[0]).toEqual({ x: 0, y: 0 });
      expect(path[path.length - 1]).toEqual({ x: 2, y: 2 });
    });

    it('should return empty array when no path exists', () => {
      const layout = [
        [1, 0, 1],
        [0, 0, 0],
        [1, 0, 1],
      ];
      const grid = createGrid(layout);
      const start: Position = { x: 0, y: 0 };
      const end: Position = { x: 2, y: 2 };

      const path = pathfinder.findPath(start, end, grid);

      expect(path).toHaveLength(0);
    });

    it('should avoid blocked cells', () => {
      const layout = [
        [1, 1, 1, 1, 1],
        [0, 0, 2, 0, 0],
        [1, 1, 1, 1, 1],
      ];
      const grid = createGrid(layout);
      const start: Position = { x: 0, y: 0 };
      const end: Position = { x: 4, y: 0 };

      const path = pathfinder.findPath(start, end, grid);

      // Should stay on row 0 since it's all PATH
      expect(path).toHaveLength(5);
      expect(path.every(p => p.y === 0)).toBe(true);
    });

    it('should find shortest path around obstacle', () => {
      const layout = [
        [1, 1, 1],
        [1, 0, 1],
        [1, 1, 1],
      ];
      const grid = createGrid(layout);
      const start: Position = { x: 0, y: 0 };
      const end: Position = { x: 2, y: 2 };

      const path = pathfinder.findPath(start, end, grid);

      // Shortest path should be 5 nodes (around the obstacle)
      expect(path).toHaveLength(5);
    });

    it('should return empty array for invalid start position', () => {
      const layout = [[1, 1, 1]];
      const grid = createGrid(layout);
      const start: Position = { x: -1, y: 0 };
      const end: Position = { x: 2, y: 0 };

      const path = pathfinder.findPath(start, end, grid);

      expect(path).toHaveLength(0);
    });

    it('should return empty array for empty grid', () => {
      const grid: Cell[][] = [];
      const start: Position = { x: 0, y: 0 };
      const end: Position = { x: 0, y: 0 };

      const path = pathfinder.findPath(start, end, grid);

      expect(path).toHaveLength(0);
    });
  });
});
