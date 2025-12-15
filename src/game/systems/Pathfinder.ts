import type { Position, Cell } from '../types';
import { CellType } from '../types';

/**
 * A* Pathfinding node
 */
interface PathNode {
  x: number;
  y: number;
  g: number;  // Cost from start
  h: number;  // Heuristic (estimated cost to end)
  f: number;  // Total cost (g + h)
  parent: PathNode | null;
}

/**
 * Pathfinder - A* pathfinding algorithm implementation
 * Calculates optimal path from start to end on a grid
 */
export class Pathfinder {
  /**
   * Find path using A* algorithm
   * @param start Start position (grid coordinates)
   * @param end End position (grid coordinates)
   * @param grid 2D grid of cells
   * @returns Array of positions representing the path, empty if no path found
   */
  findPath(start: Position, end: Position, grid: Cell[][]): Position[] {
    const height = grid.length;
    const width = grid[0]?.length || 0;
    
    if (height === 0 || width === 0) return [];
    
    // Validate start and end positions
    if (!this.isValidPosition(start, width, height) || 
        !this.isValidPosition(end, width, height)) {
      console.error('Invalid start or end position');
      return [];
    }
    
    const openSet: PathNode[] = [];
    const closedSet: Set<string> = new Set();
    
    // Initialize start node
    const startNode: PathNode = {
      x: start.x,
      y: start.y,
      g: 0,
      h: this.heuristic(start, end),
      f: 0,
      parent: null
    };
    startNode.f = startNode.g + startNode.h;
    
    openSet.push(startNode);
    
    // 4-directional movement (up, down, left, right)
    const directions = [
      { dx: 0, dy: -1 },  // Up
      { dx: 0, dy: 1 },   // Down
      { dx: -1, dy: 0 },  // Left
      { dx: 1, dy: 0 }    // Right
    ];
    
    while (openSet.length > 0) {
      // Find node with lowest f score
      let currentIndex = 0;
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i]!.f < openSet[currentIndex]!.f) {
          currentIndex = i;
        }
      }
      
      const current = openSet[currentIndex]!;
      
      // Check if we reached the goal
      if (current.x === end.x && current.y === end.y) {
        return this.reconstructPath(current);
      }
      
      // Move current from openSet to closedSet
      openSet.splice(currentIndex, 1);
      closedSet.add(`${current.x},${current.y}`);
      
      // Explore neighbors
      for (const dir of directions) {
        const neighborX = current.x + dir.dx;
        const neighborY = current.y + dir.dy;
        
        // Skip if out of bounds
        if (!this.isValidPosition({ x: neighborX, y: neighborY }, width, height)) {
          continue;
        }
        
        // Skip if already visited
        if (closedSet.has(`${neighborX},${neighborY}`)) {
          continue;
        }
        
        // Skip if not walkable (only PATH cells are walkable)
        const cell = grid[neighborY]?.[neighborX];
        if (!cell || cell.type !== CellType.PATH) {
          continue;
        }
        
        const tentativeG = current.g + 1;
        
        // Check if neighbor is in openSet
        let neighbor = openSet.find(n => n.x === neighborX && n.y === neighborY);
        
        if (!neighbor) {
          // Add new node to openSet
          neighbor = {
            x: neighborX,
            y: neighborY,
            g: tentativeG,
            h: this.heuristic({ x: neighborX, y: neighborY }, end),
            f: 0,
            parent: current
          };
          neighbor.f = neighbor.g + neighbor.h;
          openSet.push(neighbor);
        } else if (tentativeG < neighbor.g) {
          // Found a better path to this node
          neighbor.g = tentativeG;
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.parent = current;
        }
      }
    }
    
    // No path found
    console.warn('No path found from', start, 'to', end);
    return [];
  }
  
  /**
   * Manhattan distance heuristic
   */
  private heuristic(a: Position, b: Position): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }
  
  /**
   * Check if position is within grid bounds
   */
  private isValidPosition(pos: Position, width: number, height: number): boolean {
    return pos.x >= 0 && pos.x < width && pos.y >= 0 && pos.y < height;
  }
  
  /**
   * Reconstruct path from end node to start
   */
  private reconstructPath(endNode: PathNode): Position[] {
    const path: Position[] = [];
    let current: PathNode | null = endNode;
    
    while (current !== null) {
      path.unshift({ x: current.x, y: current.y });
      current = current.parent;
    }
    
    return path;
  }
}
