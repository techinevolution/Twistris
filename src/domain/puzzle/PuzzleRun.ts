import {
  attachesToStructure,
  createBoard,
  type Board,
  type GridCell,
} from "../rules";

export type PieceColor = "cyan" | "magenta";

export interface PieceShape {
  readonly name: string;
  readonly color: PieceColor;
  readonly cells: ReadonlyArray<GridCell>;
}

export interface ActivePiece {
  shape: PieceShape;
  color: PieceColor;
  cells: GridCell[];
  x: number;
  y: number;
}

export type LockOutcome = "locked" | "retried" | "capacity";

export const PUZZLE_SHAPES: ReadonlyArray<PieceShape> = Object.freeze([
  {
    name: "I",
    color: "cyan",
    cells: Object.freeze([
      { x: -1, y: 0 },
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ]),
  },
  {
    name: "O",
    color: "cyan",
    cells: Object.freeze([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ]),
  },
  {
    name: "T",
    color: "magenta",
    cells: Object.freeze([
      { x: -1, y: 0 },
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ]),
  },
  {
    name: "L",
    color: "magenta",
    cells: Object.freeze([
      { x: -1, y: 0 },
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: -1, y: 1 },
    ]),
  },
  {
    name: "J",
    color: "cyan",
    cells: Object.freeze([
      { x: -1, y: 0 },
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
    ]),
  },
  {
    name: "S",
    color: "cyan",
    cells: Object.freeze([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: -1, y: 1 },
      { x: 0, y: 1 },
    ]),
  },
  {
    name: "Z",
    color: "magenta",
    cells: Object.freeze([
      { x: -1, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ]),
  },
]);

interface PuzzleRunOptions {
  size?: number;
  random?: () => number;
}

interface AdvanceOptions {
  softDrop?: boolean;
}

const NORMAL_DROP_MS = 520;
const SOFT_DROP_MS = 120;
const LOCK_THRESHOLD_MS = 160;

export class PuzzleRun {
  readonly size: number;
  readonly center: number;
  readonly board: Board;
  current: ActivePiece | null = null;
  nextShape: PieceShape;
  piecesPlaced = 0;
  lastOutcome: LockOutcome | null = null;

  private readonly random: () => number;
  private dropElapsed = 0;
  private lockElapsed = 0;

  constructor({ size = 27, random = Math.random }: PuzzleRunOptions = {}) {
    this.size = size;
    this.center = Math.floor(size / 2);
    this.random = random;
    this.board = createBoard(size);
    this.board[this.center][this.center] = {
      color: "cyan",
      seed: true,
    };
    this.nextShape = this.randomShape();
  }

  start() {
    if (!this.current) this.spawnPiece();
  }

  move(dx: number, dy: number): boolean {
    if (!this.current || !this.canPlace(this.current, dx, dy)) return false;
    this.current.x += dx;
    this.current.y += dy;
    if (dy > 0) this.lockElapsed = 0;
    return true;
  }

  rotate(): boolean {
    if (!this.current) return false;

    const rotated = this.current.cells.map((cell) => ({
      x: -cell.y || 0,
      y: cell.x,
    }));
    const kicks = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: -1 },
      { x: 0, y: 1 },
    ];

    for (const kick of kicks) {
      if (!this.canPlace(this.current, kick.x, kick.y, rotated)) continue;
      this.current.cells = rotated;
      this.current.x += kick.x;
      this.current.y += kick.y;
      return true;
    }

    return false;
  }

  hardDrop(): LockOutcome | null {
    if (!this.current) return null;
    while (this.move(0, 1)) {
      // Move to the first collision.
    }
    return this.lock();
  }

  advance(deltaMs: number, { softDrop = false }: AdvanceOptions = {}): LockOutcome | null {
    if (!this.current) return null;

    const interval = softDrop ? SOFT_DROP_MS : NORMAL_DROP_MS;
    this.dropElapsed += deltaMs;
    let outcome: LockOutcome | null = null;

    while (this.dropElapsed >= interval && this.current) {
      this.dropElapsed -= interval;
      this.dropElapsed = Math.min(this.dropElapsed, interval);

      if (this.move(0, 1)) {
        this.lockElapsed = 0;
        continue;
      }

      this.lockElapsed += interval;
      if (this.lockElapsed >= LOCK_THRESHOLD_MS) outcome = this.lock();
    }

    return outcome;
  }

  worldCells(piece = this.current, dx = 0, dy = 0): GridCell[] {
    if (!piece) return [];
    return piece.cells.map((cell) => ({
      x: piece.x + cell.x + dx,
      y: piece.y + cell.y + dy,
    }));
  }

  ghostCells(): GridCell[] {
    if (!this.current) return [];
    let dy = 0;
    while (this.canPlace(this.current, 0, dy + 1)) dy += 1;
    return this.worldCells(this.current, 0, dy);
  }

  private randomShape(): PieceShape {
    return PUZZLE_SHAPES[Math.floor(this.random() * PUZZLE_SHAPES.length)];
  }

  private spawnPiece(shapeOverride?: PieceShape) {
    const shape = shapeOverride ?? this.nextShape;
    if (!shapeOverride) this.nextShape = this.randomShape();
    const cells = shape.cells.map((cell) => ({ ...cell }));
    const xs = cells.map((cell) => cell.x);
    const ys = cells.map((cell) => cell.y);
    const spawnX =
      this.center -
      Math.round((Math.min(...xs) + Math.max(...xs)) / 2);
    const spawnY = -Math.min(...ys) - 3;

    this.current = {
      shape,
      color: shape.color,
      cells,
      x: spawnX,
      y: spawnY,
    };
    this.dropElapsed = 0;
    this.lockElapsed = 0;
  }

  private canPlace(
    piece: ActivePiece,
    dx: number,
    dy: number,
    cells = piece.cells,
  ): boolean {
    for (const cell of cells) {
      const x = piece.x + cell.x + dx;
      const y = piece.y + cell.y + dy;
      if (x < 0 || x >= this.size || y >= this.size) return false;
      if (y >= 0 && this.board[y][x]) return false;
    }
    return true;
  }

  private lock(): LockOutcome {
    if (!this.current) return "retried";

    const landed = this.worldCells();
    if (!attachesToStructure(this.board, landed)) {
      const retryShape = this.current.shape;
      this.spawnPiece(retryShape);
      this.lastOutcome = "retried";
      return this.lastOutcome;
    }

    if (
      landed.some(
        (cell) =>
          cell.x < 0 ||
          cell.x >= this.size ||
          cell.y < 0 ||
          cell.y >= this.size,
      )
    ) {
      this.current = null;
      this.lastOutcome = "capacity";
      return this.lastOutcome;
    }

    for (const cell of landed) {
      this.board[cell.y][cell.x] = {
        color: this.current.color,
        seed: false,
      };
    }

    this.piecesPlaced += 1;
    this.current = null;
    this.spawnPiece();
    this.lastOutcome = "locked";
    return this.lastOutcome;
  }
}
