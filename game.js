"use strict";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const statusValue = document.getElementById("statusValue");
const startScreen = document.getElementById("startScreen");
const startButton = document.getElementById("startButton");

const GRID_SIZE = 27;
const CELL_SIZE = 24;
const CENTER = Math.floor(GRID_SIZE / 2);
const TICK_BASE = 0.52;
const TICK_SOFT = 0.12;
const LOCK_THRESHOLD = 0.16;
const BALANCE_THRESHOLD = 8;
const ROTATION_STEP = Math.PI / 2;
const ROTATION_ANIM_TIME = 0.34;
const FADE_DURATION = 4;

const COLORS = {
  cyan: "#4aa8d8",
  magenta: "#c63a62",
  ghost: "rgba(255,255,255,0.18)",
  grid: "rgba(125, 155, 178, 0.08)",
  coreLine: "rgba(255,255,255,0.95)",
  edgeCyan: "#66c1ef",
  edgeMagenta: "#ef5b87",
  bg: "#091723",
};

const SHAPES = [
  {
    name: "I",
    color: "cyan",
    cells: [
      { x: -1, y: 0 },
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ],
  },
  {
    name: "O",
    color: "cyan",
    cells: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ],
  },
  {
    name: "T",
    color: "magenta",
    cells: [
      { x: -1, y: 0 },
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ],
  },
  {
    name: "L",
    color: "magenta",
    cells: [
      { x: -1, y: 0 },
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: -1, y: 1 },
    ],
  },
  {
    name: "J",
    color: "cyan",
    cells: [
      { x: -1, y: 0 },
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
    ],
  },
  {
    name: "S",
    color: "cyan",
    cells: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: -1, y: 1 },
      { x: 0, y: 1 },
    ],
  },
  {
    name: "Z",
    color: "magenta",
    cells: [
      { x: -1, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ],
  },
];

const keys = new Set();
const justPressed = new Set();
let canvasWidth = canvas.clientWidth;
let canvasHeight = canvas.clientHeight;
let canvasRatio = Math.min(window.devicePixelRatio || 1, 2);

class BalanceStackGame {
  constructor() {
    this.started = false;
    this.resetState();
    this.updateStartScreen();
  }

  resetState() {
    this.board = this.makeGrid();
    this.current = null;
    this.nextShape = this.randomShape();
    this.ghost = [];
    this.dropTimer = 0;
    this.moveTimer = 0;
    this.lastMoveDir = 0;
    this.lockTimer = 0;
    this.gameOver = false;
    this.piecesPlaced = 0;
    this.lockSequence = 0;
    this.rotationCount = 0;
    this.orientationTurns = 0;
    this.lastBalance = 0;
    this.coreLayers = 0;
    this.paused = false;
    this.rotationVisual = 0;
    this.rotationTimer = 0;
    this.pendingBoard = null;
    this.pendingOrientationTurns = 0;

    this.seedCore();
    this.setStatus("");
    this.updateHUD();
  }

  startGame() {
    this.started = true;
    this.resetState();
    this.spawnPiece();
    this.updateGhost();
    this.updateStartScreen();
  }

  restart() {
    this.started = true;
    this.resetState();
    this.spawnPiece();
    this.updateGhost();
    this.updateStartScreen();
  }

  makeGrid() {
    return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
  }

  seedCore() {
    this.board[CENTER][CENTER] = { color: "cyan", seed: true, age: 999 };
  }

  setStatus(text) {
    if (statusValue) {
      statusValue.textContent = text;
      statusValue.classList.toggle("is-hidden", !text);
    }
  }

  updateStartScreen() {
    if (startScreen) {
      startScreen.classList.toggle("is-hidden", this.started);
    }
  }

  randomShape() {
    return SHAPES[Math.floor(Math.random() * SHAPES.length)];
  }

  spawnPiece() {
    const shape = this.nextShape;
    this.nextShape = this.randomShape();
    const cells = shape.cells.map((cell) => ({ ...cell }));
    const bounds = this.boundsForCells(cells);
    const spawnX = CENTER - Math.round((bounds.minX + bounds.maxX) / 2);
    const spawnY = -bounds.minY - 3;

    this.current = {
      color: shape.color,
      cells,
      x: spawnX,
      y: spawnY,
    };
  }

  boundsForCells(cells) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const cell of cells) {
      minX = Math.min(minX, cell.x);
      minY = Math.min(minY, cell.y);
      maxX = Math.max(maxX, cell.x);
      maxY = Math.max(maxY, cell.y);
    }
    return { minX, minY, maxX, maxY };
  }

  worldCells(piece, dx = 0, dy = 0, cells = piece.cells) {
    return cells.map((cell) => ({
      x: piece.x + cell.x + dx,
      y: piece.y + cell.y + dy,
    }));
  }

  canPlace(piece, dx, dy, cells = piece.cells) {
    for (const cell of this.worldCells(piece, dx, dy, cells)) {
      if (cell.x < 0 || cell.x >= GRID_SIZE || cell.y >= GRID_SIZE) {
        return false;
      }
      if (cell.y >= 0 && this.board[cell.y][cell.x]) {
        return false;
      }
    }
    return true;
  }

  movePiece(dx, dy) {
    if (!this.current || this.gameOver) return false;
    if (!this.canPlace(this.current, dx, dy)) return false;
    this.current.x += dx;
    this.current.y += dy;
    this.updateGhost();
    return true;
  }

  rotatePiece() {
    if (!this.current || this.gameOver) return;

    // Piece rotation is still local 90-degree tetromino rotation.
    const rotated = this.current.cells.map((cell) => ({
      x: -cell.y,
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
      if (this.canPlace(this.current, kick.x, kick.y, rotated)) {
        this.current.cells = rotated;
        this.current.x += kick.x;
        this.current.y += kick.y;
        this.updateGhost();
        return;
      }
    }
  }

  updateGhost() {
    if (!this.current) {
      this.ghost = [];
      return;
    }

    let dy = 0;
    while (this.canPlace(this.current, 0, dy + 1)) {
      dy += 1;
    }
    this.ghost = this.worldCells(this.current, 0, dy);
  }

  hardDrop() {
    if (!this.current || this.gameOver) return;
    while (this.movePiece(0, 1)) {
      // Drop until collision.
    }
    this.lockPiece();
  }

  update(dt) {
    if (!this.started) {
      if (justPressed.has("Enter")) {
        this.startGame();
      }
      this.updateHUD();
      return;
    }

    if (justPressed.has("KeyP") && !this.gameOver) {
      this.paused = !this.paused;
      this.setStatus(this.paused ? "Paused" : "");
    }

    if (justPressed.has("KeyR")) {
      this.restart();
      return;
    }

    if (!this.gameOver) {
      if (!this.paused && !this.isRotating()) {
        this.handleInput(dt);
        this.tickFall(dt);
        this.updateBlockAges(dt);
      }
    }

    this.updateRotationAnimation(dt);
    this.updateHUD();
  }

  handleInput(dt) {
    // Left/right are always screen-left and screen-right because pieces always fall from the top.
    const leftKey = keys.has("ArrowLeft") || keys.has("KeyA");
    const rightKey = keys.has("ArrowRight") || keys.has("KeyD");

    if (justPressed.has("ArrowUp") || justPressed.has("KeyW") || justPressed.has("KeyX")) {
      this.rotatePiece();
    }

    if (justPressed.has("Space")) {
      this.hardDrop();
      return;
    }

    let desired = 0;
    if (leftKey && !rightKey) desired = -1;
    if (rightKey && !leftKey) desired = 1;

    if (desired !== this.lastMoveDir) {
      this.moveTimer = 0;
      this.lastMoveDir = desired;
      if (desired !== 0) {
        this.movePiece(desired, 0);
      }
    } else if (desired !== 0) {
      this.moveTimer += dt;
      if (this.moveTimer >= 0.12) {
        this.moveTimer = 0.05;
        this.movePiece(desired, 0);
      }
    } else {
      this.moveTimer = 0;
    }
  }

  tickFall(dt) {
    if (!this.current) return;
    const soft = keys.has("ArrowDown") || keys.has("KeyS");
    const tickRate = soft ? TICK_SOFT : TICK_BASE;

    // Locking is standard falling-block behavior with constant downward gravity.
    this.dropTimer += dt;
    if (this.dropTimer < tickRate) return;

    this.dropTimer -= tickRate;
    this.dropTimer = Math.min(this.dropTimer, tickRate);

    if (!this.movePiece(0, 1)) {
      this.lockTimer += tickRate;
      if (this.lockTimer >= LOCK_THRESHOLD) {
        this.lockPiece();
      }
    } else {
      this.lockTimer = 0;
    }
  }

  lockPiece() {
    if (!this.current) return;

    const landed = this.worldCells(this.current);
    if (!this.attachesToStructure(landed)) {
      this.setStatus("Missed the stack");
      this.current = null;
      this.lockTimer = 0;
      this.spawnPiece();
      this.updateGhost();
      return;
    }

    this.piecesPlaced += 1;
    this.lockSequence += 1;

    for (const cell of landed) {
      // Collapse only if a locked structure extends outside the playable field.
      if (cell.x < 0 || cell.x >= GRID_SIZE || cell.y < 0 || cell.y >= GRID_SIZE) {
        this.gameOver = true;
        return;
      }
      this.board[cell.y][cell.x] = {
        color: this.current.color,
        seed: false,
        age: 0,
        placementId: this.lockSequence,
      };
    }

    this.evaluateBalance(landed);
    this.recalculateCoreSquare();
    this.current = null;
    this.lockTimer = 0;
    this.spawnPiece();
    this.updateGhost();
  }

  attachesToStructure(landed) {
    for (const cell of landed) {
      const neighbors = [
        { x: cell.x - 1, y: cell.y },
        { x: cell.x + 1, y: cell.y },
        { x: cell.x, y: cell.y - 1 },
        { x: cell.x, y: cell.y + 1 },
      ];

      for (const neighbor of neighbors) {
        if (neighbor.x < 0 || neighbor.x >= GRID_SIZE || neighbor.y < 0 || neighbor.y >= GRID_SIZE) {
          continue;
        }
        if (this.board[neighbor.y][neighbor.x]) {
          return true;
        }
      }
    }
    return false;
  }

  evaluateBalance(landedCells) {
    // Balance is a torque-like weighted sum around the center, so farther blocks matter more.
    let massScore = 0;
    for (let y = 0; y < GRID_SIZE; y += 1) {
      for (let x = 0; x < GRID_SIZE; x += 1) {
        if (!this.board[y][x]) continue;
        const relX = x - CENTER;
        const relY = y - CENTER;
        const distance = Math.hypot(relX, relY);
        massScore += relX * (1 + distance * 0.28);
      }
    }

    this.lastBalance = massScore;
    const centeredPlacement = averageCenterDistance(landedCells) <= 2.3;

    if (centeredPlacement && Math.abs(massScore) < BALANCE_THRESHOLD * 1.35) {
      return;
    }

    if (massScore > BALANCE_THRESHOLD) {
      this.rotateStructure(1);
    } else if (massScore < -BALANCE_THRESHOLD) {
      this.rotateStructure(-1);
    }
  }

  rotateStructure(direction) {
    const nextBoard = this.makeGrid();

    // The stack rotates around the fixed center, while the field and falling lane stay still.
    for (let y = 0; y < GRID_SIZE; y += 1) {
      for (let x = 0; x < GRID_SIZE; x += 1) {
        const block = this.board[y][x];
        if (!block) continue;

        const relX = x - CENTER;
        const relY = y - CENTER;
        let nextX;
        let nextY;

        if (direction > 0) {
          nextX = CENTER - relY;
          nextY = CENTER + relX;
        } else {
          nextX = CENTER + relY;
          nextY = CENTER - relX;
        }

        if (nextX < 0 || nextX >= GRID_SIZE || nextY < 0 || nextY >= GRID_SIZE) {
          this.setStatus("Rotation blocked");
          return;
        }

        nextBoard[nextY][nextX] = { ...block };
      }
    }

    this.pendingBoard = nextBoard;
    this.pendingOrientationTurns = (this.orientationTurns + direction + 4) % 4;
    this.rotationCount += 1;
    this.startRotationAnimation(direction);
  }

  startRotationAnimation(direction) {
    // Animate the visible mass through the full quarter-turn, then commit the rotated board state.
    this.rotationVisual = 0;
    this.rotationTimer = ROTATION_ANIM_TIME;
    this.rotationDirection = direction;
  }

  updateRotationAnimation(dt) {
    if (this.rotationTimer <= 0) {
      this.rotationVisual = 0;
      return;
    }

    this.rotationTimer = Math.max(0, this.rotationTimer - dt);
    const progress = 1 - this.rotationTimer / ROTATION_ANIM_TIME;
    const overshoot = 1.08;
    const eased = 1 + (overshoot + 1) * Math.pow(progress - 1, 3) + overshoot * Math.pow(progress - 1, 2);
    this.rotationVisual = this.rotationDirection * ROTATION_STEP * eased;

    if (this.rotationTimer <= 0 && this.pendingBoard) {
      this.board = this.pendingBoard;
      this.pendingBoard = null;
      this.orientationTurns = this.pendingOrientationTurns;
      this.rotationVisual = 0;
    }
  }

  isRotating() {
    return this.rotationTimer > 0;
  }

  updateBlockAges(dt) {
    for (let y = 0; y < GRID_SIZE; y += 1) {
      for (let x = 0; x < GRID_SIZE; x += 1) {
        const block = this.board[y][x];
        if (!block || block.seed) continue;
        if (block.placementId === this.lockSequence) continue;
        block.age = Math.min(12, (block.age || 0) + dt);
      }
    }
  }

  recalculateCoreSquare() {
    // The core only grows when the stack contains a larger complete square centered on the pivot.
    let layers = 0;
    const maxLayers = Math.min(CENTER, 8);

    for (let r = 0; r <= maxLayers; r += 1) {
      let full = true;
      for (let y = CENTER - r; y <= CENTER + r && full; y += 1) {
        for (let x = CENTER - r; x <= CENTER + r; x += 1) {
          if (!this.board[y][x]) {
            full = false;
            break;
          }
        }
      }
      if (!full) break;
      layers = r;
    }

    this.coreLayers = layers;
  }

  draw() {
    ctx.setTransform(canvasRatio, 0, 0, canvasRatio, 0, 0);

    const width = canvasWidth;
    const height = canvasHeight;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = COLORS.bg;
    roundRect(ctx, 0, 0, width, height, 22, true);

    ctx.save();
    ctx.translate(width / 2, height / 2);
    drawGrid(ctx);
    this.drawStructure();
    drawCoreSquare(ctx, this.coreLayers, this.rotationVisual);
    this.drawGhostPiece();
    this.drawCurrentPiece();
    ctx.restore();

    drawSpawnPreview(ctx, this.nextShape);

    if (this.gameOver) {
      drawOverlay(ctx, width, height, "Stack collapsed", "Press R to restart");
    } else if (this.paused) {
      drawOverlay(ctx, width, height, "Paused", "Press P to resume");
    }
  }

  drawStructure() {
    ctx.save();
    ctx.rotate(this.rotationVisual);
    for (let y = 0; y < GRID_SIZE; y += 1) {
      for (let x = 0; x < GRID_SIZE; x += 1) {
        const block = this.board[y][x];
        if (!block) continue;
        drawCellFill(ctx, x, y, block.color, this.blockFade(x, y));
      }
    }
    drawMassOutline(ctx, this.board);
    ctx.restore();
  }

  drawCurrentPiece() {
    if (!this.current || this.gameOver) return;
    for (const cell of this.worldCells(this.current)) {
      drawActiveCell(ctx, cell.x, cell.y, this.current.color);
    }
  }

  drawGhostPiece() {
    for (const cell of this.ghost) {
      drawGhostCell(ctx, cell.x, cell.y);
    }
  }

  blockFade(x, y) {
    const block = this.board[y] && this.board[y][x];
    const age = block && typeof block.age === "number" ? block.age : 1;
    const dist = Math.max(Math.abs(x - CENTER), Math.abs(y - CENTER));
    if (dist <= this.coreLayers) return 1;
    const target = dist <= this.coreLayers + 2 ? 0.42 : 0.14;
    const fadeProgress = clamp(age / FADE_DURATION, 0, 1);
    return 1 - (1 - target) * fadeProgress;
  }

  updateHUD() {
    // The minimal top status should stay quiet during game-over; the main overlay handles that state.
  }
}

function averageCenterDistance(cells) {
  let total = 0;
  for (const cell of cells) {
    total += Math.hypot(cell.x - CENTER, cell.y - CENTER);
  }
  return total / Math.max(1, cells.length);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function drawGrid(context) {
  const boardLength = GRID_SIZE * CELL_SIZE;
  context.strokeStyle = COLORS.grid;
  context.lineWidth = 1;
  for (let i = 0; i <= GRID_SIZE; i += 1) {
    const offset = -boardLength / 2 + i * CELL_SIZE;
    context.beginPath();
    context.moveTo(-boardLength / 2, offset);
    context.lineTo(boardLength / 2, offset);
    context.stroke();
  }
  for (let i = 0; i <= GRID_SIZE; i += 1) {
    const offset = -boardLength / 2 + i * CELL_SIZE;
    context.beginPath();
    context.moveTo(offset, -boardLength / 2);
    context.lineTo(offset, boardLength / 2);
    context.stroke();
  }
}

function drawCoreSquare(context, layers, angle) {
  const sideCells = layers * 2 + 1;
  const solidSize = sideCells * CELL_SIZE;
  const inset = 6;

  context.save();
  context.rotate(angle);
  context.fillStyle = "rgba(255,255,255,0.08)";
  roundRect(context, -solidSize / 2, -solidSize / 2, solidSize, solidSize, 8, true);
  context.fillStyle = "rgba(255,255,255,0.14)";
  roundRect(context, -solidSize / 2 + 2, -solidSize / 2 + 2, solidSize - 4, solidSize - 4, 6, true);
  context.strokeStyle = COLORS.coreLine;
  context.lineWidth = 7;
  context.setLineDash([14, 10]);
  roundRect(
    context,
    -solidSize / 2 + inset,
    -solidSize / 2 + inset,
    solidSize - inset * 2,
    solidSize - inset * 2,
    Math.max(6, 18 - layers),
    false
  );
  context.stroke();
  context.setLineDash([]);
  context.strokeStyle = "rgba(255,255,255,0.26)";
  context.lineWidth = 2;
  context.beginPath();
  context.arc(0, 0, 16, 0, Math.PI * 2);
  context.stroke();
  context.restore();
}

function drawCellFill(context, gridX, gridY, colorKey, alpha) {
  const x = (gridX - CENTER) * CELL_SIZE;
  const y = (gridY - CENTER) * CELL_SIZE;
  const inset = 1.5;
  const color = COLORS[colorKey];

  context.save();
  context.fillStyle = hexToRgba(color, alpha);
  roundRect(context, x - CELL_SIZE / 2 + inset, y - CELL_SIZE / 2 + inset, CELL_SIZE - inset * 2, CELL_SIZE - inset * 2, 3, true);
  context.restore();
}

function drawActiveCell(context, gridX, gridY, colorKey) {
  const x = (gridX - CENTER) * CELL_SIZE;
  const y = (gridY - CENTER) * CELL_SIZE;
  const inset = 1.5;
  const color = COLORS[colorKey];

  context.save();
  context.fillStyle = color;
  context.strokeStyle = colorKey === "cyan" ? COLORS.edgeCyan : COLORS.edgeMagenta;
  context.lineWidth = 2;
  roundRect(context, x - CELL_SIZE / 2 + inset, y - CELL_SIZE / 2 + inset, CELL_SIZE - inset * 2, CELL_SIZE - inset * 2, 3, true);
  context.stroke();
  context.restore();
}

function drawGhostCell(context, gridX, gridY) {
  const x = (gridX - CENTER) * CELL_SIZE;
  const y = (gridY - CENTER) * CELL_SIZE;
  const inset = 2;
  context.save();
  context.fillStyle = COLORS.ghost;
  context.strokeStyle = "rgba(255,255,255,0.18)";
  context.lineWidth = 2;
  roundRect(context, x - CELL_SIZE / 2 + inset, y - CELL_SIZE / 2 + inset, CELL_SIZE - inset * 2, CELL_SIZE - inset * 2, 3, true);
  context.stroke();
  context.restore();
}

function drawMassOutline(context, board) {
  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const block = board[y][x];
      if (!block) continue;

      const left = x > 0 ? board[y][x - 1] : null;
      const right = x < GRID_SIZE - 1 ? board[y][x + 1] : null;
      const up = y > 0 ? board[y - 1][x] : null;
      const down = y < GRID_SIZE - 1 ? board[y + 1][x] : null;
      if (left && right && up && down) continue;

      const cx = (x - CENTER) * CELL_SIZE;
      const cy = (y - CENTER) * CELL_SIZE;
      const half = CELL_SIZE / 2 - 1.5;
      context.strokeStyle = block.color === "cyan" ? COLORS.edgeCyan : COLORS.edgeMagenta;
      context.lineWidth = 4;
      context.lineCap = "round";

      if (!up) {
        context.beginPath();
        context.moveTo(cx - half, cy - half);
        context.lineTo(cx + half, cy - half);
        context.stroke();
      }
      if (!right) {
        context.beginPath();
        context.moveTo(cx + half, cy - half);
        context.lineTo(cx + half, cy + half);
        context.stroke();
      }
      if (!down) {
        context.beginPath();
        context.moveTo(cx - half, cy + half);
        context.lineTo(cx + half, cy + half);
        context.stroke();
      }
      if (!left) {
        context.beginPath();
        context.moveTo(cx - half, cy - half);
        context.lineTo(cx - half, cy + half);
        context.stroke();
      }
    }
  }
}

function drawSpawnPreview(context, piece) {
  if (!piece) return;
  const boxX = canvasWidth - 168;
  const boxY = 36;

  context.save();
  context.fillStyle = "rgba(255,255,255,0.02)";
  context.strokeStyle = "rgba(125, 155, 178, 0.16)";
  context.lineWidth = 1;
  roundRect(context, boxX, boxY, 132, 132, 18, true);
  context.stroke();
  context.fillStyle = "#eef7ff";
  context.font = "700 14px Segoe UI, sans-serif";
  context.fillText("Next piece", boxX + 18, boxY + 24);

  const size = 26;
  for (const cell of piece.cells) {
    const px = boxX + 62 + cell.x * size;
    const py = boxY + 70 + cell.y * size;
    context.fillStyle = hexToRgba(COLORS[piece.color], 0.16);
    context.strokeStyle = COLORS[piece.color];
    context.lineWidth = 2;
    roundRect(context, px, py, size - 2, size - 2, 4, true);
    context.stroke();
  }
  context.restore();
}

function drawOverlay(context, width, height, title, subtitle) {
  context.save();
  context.fillStyle = "rgba(3, 9, 15, 0.68)";
  roundRect(context, 0, 0, width, height, 22, true);
  context.fillStyle = "#eef7ff";
  context.textAlign = "center";
  context.font = "800 44px Segoe UI, sans-serif";
  context.fillText(title, width / 2, height / 2 - 8);
  context.fillStyle = "#8ea0b3";
  context.font = "600 18px Segoe UI, sans-serif";
  context.fillText(subtitle, width / 2, height / 2 + 28);
  context.restore();
}

function roundRect(context, x, y, w, h, r, fill) {
  const radius = Math.min(r, w / 2, h / 2);
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + w, y, x + w, y + h, radius);
  context.arcTo(x + w, y + h, x, y + h, radius);
  context.arcTo(x, y + h, x, y, radius);
  context.arcTo(x, y, x + w, y, radius);
  if (fill) context.fill();
}

function hexToRgba(hex, alpha) {
  const value = parseInt(hex.replace("#", ""), 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const game = new BalanceStackGame();

if (startButton) {
  startButton.addEventListener("click", () => {
    game.startGame();
  });
}

function resizeCanvas() {
  canvasRatio = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  canvasWidth = Math.max(1, Math.floor(rect.width));
  canvasHeight = Math.max(1, Math.floor(rect.height));
  canvas.width = Math.floor(canvasWidth * canvasRatio);
  canvas.height = Math.floor(canvasHeight * canvasRatio);
}

window.addEventListener("keydown", (event) => {
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space"].includes(event.code)) {
    event.preventDefault();
  }
  if (!keys.has(event.code)) {
    justPressed.add(event.code);
  }
  keys.add(event.code);
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.code);
});

window.addEventListener("blur", () => {
  keys.clear();
  justPressed.clear();
});

window.addEventListener("resize", resizeCanvas);

let previous = performance.now();
resizeCanvas();
function frame(now) {
  const dt = Math.min(0.033, (now - previous) / 1000);
  previous = now;
  game.update(dt);
  game.draw();
  justPressed.clear();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
