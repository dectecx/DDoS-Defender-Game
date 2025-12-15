import { CellType } from './types';
import type { Cell, GridConfig, Position } from './types';
import { Pathfinder } from './systems/Pathfinder';

/**
 * GridManager - Grid and map manager
 * Manages the game grid, map layout, path definition, and coordinate conversion
 */
export class GridManager {
  width: number;
  height: number;
  cellSize: number;
  grid: Cell[][];
  
  private pathCoordinates: Position[] = [];
  private pathfinder: Pathfinder;

  constructor(config: GridConfig) {
    this.width = config.width;
    this.height = config.height;
    this.cellSize = config.cellSize;
    this.grid = [];
    this.pathfinder = new Pathfinder();
  }

  /**
   * Initialize the grid with map layout
   * @param mapLayout 2D array where 0 = EMPTY, 1 = PATH, 2 = BLOCKED
   */
  initialize(mapLayout?: number[][]) {
    this.grid = [];
    this.pathCoordinates = [];

    // Default layout if none provided (Fallback)
    const layout = mapLayout || Array(this.height).fill(0).map(() => Array(this.width).fill(0));

    // First pass: build the grid and find start/end positions
    let startPos: Position | null = null;
    let endPos: Position | null = null;

    for (let y = 0; y < this.height; y++) {
      const row: Cell[] = [];
      for (let x = 0; x < this.width; x++) {
        const value = layout[y]?.[x];
        let cellType: CellType = CellType.EMPTY;

        if (value === 1) {
          cellType = CellType.PATH;

          // Track potential start (leftmost path cell)
          if (startPos === null || x < startPos.x || (x === startPos.x && y < startPos.y)) {
            // Check if this is an edge cell (potential entry point)
            if (x === 0 || y === 0 || x === this.width - 1 || y === this.height - 1) {
              startPos = { x, y };
            }
          }

          // Track potential end (rightmost path cell)
          if (endPos === null || x > endPos.x || (x === endPos.x && y > endPos.y)) {
            // Check if this is an edge cell (potential exit point)
            if (x === 0 || y === 0 || x === this.width - 1 || y === this.height - 1) {
              endPos = { x, y };
            }
          }
        } else if (value === 2) {
          cellType = CellType.BLOCKED;
        }

        row.push({
          x,
          y,
          type: cellType,
          towerId: null
        });
      }
      this.grid.push(row);
    }

    // Use A* pathfinding to calculate the path
    if (startPos && endPos) {
      console.log(`Pathfinding from (${startPos.x}, ${startPos.y}) to (${endPos.x}, ${endPos.y})`);
      this.pathCoordinates = this.pathfinder.findPath(startPos, endPos, this.grid);
      console.log(`Path calculated: ${this.pathCoordinates.length} nodes`);
    } else {
      console.error('Could not determine start/end positions from map layout');
    }
  }

  /**
   * Recalculate path (for future dynamic path support when towers block the path)
   */
  recalculatePath(): Position[] {
    if (this.pathCoordinates.length < 2) return [];

    const start = this.pathCoordinates[0]!;
    const end = this.pathCoordinates[this.pathCoordinates.length - 1]!;

    this.pathCoordinates = this.pathfinder.findPath(start, end, this.grid);
    return this.pathCoordinates;
  }


  /**
   * Draw the grid
   * @param ctx Canvas rendering context
   */
  draw(ctx: CanvasRenderingContext2D) {
    if (!ctx) return;

    // Draw Grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const cell = this.grid[y]?.[x];
        if (!cell) continue;

        const posX = x * this.cellSize;
        const posY = y * this.cellSize;

        // Draw Cell Background
        if (cell.type === CellType.PATH) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.fillRect(posX, posY, this.cellSize, this.cellSize);
        } else if (cell.type === CellType.WALL) {
          ctx.fillStyle = '#444';
          ctx.fillRect(posX, posY, this.cellSize, this.cellSize);
        } else if (cell.type === CellType.BLOCKED) {
          // Blocked cells: dark with diagonal lines
          ctx.fillStyle = '#1a1a1a';
          ctx.fillRect(posX, posY, this.cellSize, this.cellSize);
          
          // Draw diagonal lines for visual distinction
          ctx.save();
          ctx.strokeStyle = '#333';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(posX, posY);
          ctx.lineTo(posX + this.cellSize, posY + this.cellSize);
          ctx.moveTo(posX + this.cellSize, posY);
          ctx.lineTo(posX, posY + this.cellSize);
          ctx.stroke();
          ctx.restore();
        }

        // Draw Grid Lines
        ctx.strokeRect(posX, posY, this.cellSize, this.cellSize);
      }
    }
  }

  /**
   * Get color for a cell type
   * @param type Cell type
   * @returns Hex color string
   */
  getCellColor(type: CellType): string {
    switch (type) {
      case CellType.EMPTY: return '#222'; // Dark background
      case CellType.PATH: return '#3a3a3a'; // Slightly lighter path
      case CellType.WALL: return '#111';
      case CellType.TOWER: return '#444';
      case CellType.BLOCKED: return '#1a1a1a'; // Very dark for obstacles
      default: return '#000';
    }
  }

  /**
   * Convert canvas coordinates to grid coordinates
   * @param canvasX Canvas X position
   * @param canvasY Canvas Y position
   * @returns Grid position
   */
  getGridPosition(canvasX: number, canvasY: number): Position {
    return {
      x: Math.floor(canvasX / this.cellSize),
      y: Math.floor(canvasY / this.cellSize)
    };
  }

  /**
   * Convert grid coordinates to canvas coordinates
   * @param gridX Grid X position
   * @param gridY Grid Y position
   * @returns Canvas position (top-left of cell)
   */
  getCanvasPosition(gridX: number, gridY: number): Position {
    return {
      x: gridX * this.cellSize,
      y: gridY * this.cellSize
    };
  }
  
  /**
   * Get the enemy path
   * @returns Array of positions defining the path
   */
  getPath(): Position[] {
      return this.pathCoordinates;
  }
  
  /**
   * Check if a grid position is valid
   * @param pos Grid position
   * @returns True if position is within grid bounds
   */
  isValidPosition(pos: Position): boolean {
    return pos.x >= 0 && pos.x < this.width && pos.y >= 0 && pos.y < this.height;
  }

  /**
   * Get cell at specific grid position
   * @param x Grid X coordinate
   * @param y Grid Y coordinate
   * @returns Cell if found, null otherwise
   */
  getCell(x: number, y: number): Cell | null {
    return this.grid[y]?.[x] || null;
  }

  /**
   * Set cell type at specific grid position
   * @param x Grid X coordinate
   * @param y Grid Y coordinate
   * @param type New cell type
   */
  setCell(x: number, y: number, type: CellType) {
    const cell = this.grid[y]?.[x];
    if (cell) {
      cell.type = type;
      if (type === CellType.EMPTY) {
        cell.towerId = null;
      }
    }
  }

  /**
   * Draw spawn and base markers at path endpoints
   * @param ctx Canvas rendering context
   * @param timestamp Current timestamp for animations
   */
  drawPathMarkers(ctx: CanvasRenderingContext2D, timestamp: number) {
    if (this.pathCoordinates.length === 0) return;
    
    const spawnPos = this.pathCoordinates[0]!;  // Safe: checked length > 0
    const basePos = this.pathCoordinates[this.pathCoordinates.length - 1]!;
    
    // Pulsing animation (0.75 to 1.0 scale)
    const pulseScale = 0.95 + Math.sin(timestamp * 0.003) * 0.05;
    
    // Draw Spawn Marker (red/orange - where enemies appear)
    this.drawMarker(ctx, spawnPos, '#ff4444', 'SPAWN', pulseScale);
    
    // Draw Base Marker (cyan/green - what we're protecting)
    this.drawMarker(ctx, basePos, '#00ff88', 'BASE', pulseScale);
  }

  /**
   * Draw a marker at a grid position
   * @param ctx Canvas rendering context
   * @param gridPos Grid position
   * @param color Marker color
   * @param label Text label
   * @param scale Animation scale factor
   */
  private drawMarker(
    ctx: CanvasRenderingContext2D, 
    gridPos: Position, 
    color: string, 
    label: string, 
    scale: number
  ) {
    const centerX = (gridPos.x * this.cellSize) + (this.cellSize / 2);
    const centerY = (gridPos.y * this.cellSize) + (this.cellSize / 2);
    const radius = (this.cellSize / 3) * scale;
    
    // Outer glow
    ctx.save();
    ctx.globalAlpha = 0.3 * scale;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // Inner circle
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Label text
    ctx.fillStyle = '#000';
    ctx.font = `bold ${Math.floor(this.cellSize / 5)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, centerX, centerY);
  }
}
