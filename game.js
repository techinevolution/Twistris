"use strict";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const isEmbedded = window.self !== window.top;

document.documentElement.classList.toggle("is-embedded", isEmbedded);

const statusValue = document.getElementById("statusValue");
const currencyValue = document.getElementById("currencyValue");
const startScreen = document.getElementById("startScreen");
const startButton = document.getElementById("startButton");
const boardWrap = document.querySelector(".board-wrap");
const gameKeySink = document.getElementById("gameKeySink");
const GAME_CONTROL_CODES = new Set([
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Space",
  "Enter",
  "KeyA",
  "KeyD",
  "KeyS",
  "KeyW",
  "KeyX",
  "KeyP",
  "KeyR",
]);
const useKeySinkFocus = /Mac/.test(navigator.platform || navigator.userAgent);

function focusGameSurface() {
  const active = document.activeElement;
  const focusTarget = useKeySinkFocus && gameKeySink ? gameKeySink : canvas;
  if (
    active &&
    active !== document.body &&
    active !== document.documentElement &&
    active !== focusTarget &&
    typeof active.blur === "function"
  ) {
    active.blur();
  }
  if (focusTarget && typeof focusTarget.focus === "function") {
    focusTarget.focus({ preventScroll: true });
  }
}

const STAGE_SIZE = 800;
const GRID_SIZE = 27;
const CELL_SIZE = 24;
const CENTER = Math.floor(GRID_SIZE / 2);
const TICK_BASE = 0.52;
const TICK_SOFT = 0.12;
const LOCK_THRESHOLD = 0.16;
const BALANCE_BASE_THRESHOLD = 0.82;
const BALANCE_CORE_THRESHOLD_STEP = 0.14;
const BALANCE_CENTER_BRACE_BONUS = 0.36;
const BALANCE_OUTER_RING_WEIGHT = 0.35;
const BALANCE_SHIFT_MULTIPLIER = 1.65;
const BALANCE_PLACEMENT_IMPULSE = 0.12;
const BALANCE_CENTERED_BUFFER = 0.2;
const ROTATION_STEP = Math.PI / 2;
const ROTATION_ANIM_TIME = 0.34;
const FADE_DURATION = 4;
const INTRO_LAUNCH_TIME = 2.05;
const INTRO_IDLE_CAMERA_ZOOM = 6.35;
const INTRO_IDLE_PULSE_SCALE = 1.06;
const INTRO_IDLE_GRID_ALPHA = 0.36;
const PULSE_HEARTBEAT_CYCLE = 1.74;
const PULSE_HEARTBEAT_WINDOW = 0.82;
const PULSE_PARTICLE_COUNT = 24;
const HARVEST_IMPACT_TIME = 0.744;
const HARVEST_FALL_TIME = 0.84;
const HARVEST_DUD_EMIT_INTERVAL = 0.04;
const HARVEST_DUD_TRAVEL_TIME = 0.34;
const HARVEST_CHARGE_EMIT_INTERVAL = 0.216;
const HARVEST_CHARGE_TRAVEL_TIME = 0.456;
const HARVEST_RETURN_TIME = 1.02;
const HARVEST_MAX_ZOOM = 1.08;
const HARVEST_COUNTER_X_INSET = 126;
const HARVEST_COUNTER_Y = STAGE_SIZE - 48;
const HARVEST_COUNTER_VALUE_Y = 13;

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

const LOGO_PATTERNS = {
  T: [
    "111",
    "010",
    "010",
    "010",
    "010",
  ],
  W: [
    "10001",
    "10001",
    "10101",
    "10101",
    "01010",
  ],
  I: [
    "1",
    "1",
    "1",
    "1",
    "1",
  ],
  S: [
    "111",
    "100",
    "111",
    "001",
    "111",
  ],
  R: [
    "1110",
    "1001",
    "1110",
    "1010",
    "1001",
  ],
};

const START_LOGO_WORDS = [
  { text: "TWIS", colorKey: "cyan" },
  { text: "TRIS", colorKey: "magenta" },
];
const START_LOGO_ROW_COUNT = 5;
const START_LOGO_LETTER_GAP = 1;
const START_LOGO_WORD_GAP = 1;
const START_LOGO_CELL_PITCH = 12.6;
const START_LOGO_CELL_SIZE = 13.9;
const START_LOGO_TOP = 74;
const START_LOGO_LAYOUT = createStartLogoLayout();

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
let renderTime = 0;

class BalanceStackGame {
  constructor() {
    this.started = false;
    this.elapsedTime = 0;
    this.bankedDuds = 0;
    this.bankedPulseCharges = 0;
    this.harvestSequence = null;
    this.coreParticles = [];
    this.pulseParticles = [];
    this.resetIntroState(true);
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
    this.harvestSequence = null;
    this.piecesPlaced = 0;
    this.lockSequence = 0;
    this.rotationCount = 0;
    this.orientationTurns = 0;
    this.lastBalance = 0;
    this.coreLayers = 0;
    this.coreChargeCount = 0;
    this.coreGrowthCount = 0;
    this.paused = false;
    this.rotationVisual = 0;
    this.rotationTimer = 0;
    this.pendingBoard = null;
    this.pendingOrientationTurns = 0;
    this.coreParticles = [];
    this.pulseParticles = [];
    this.pulseParticleTimer = 0;
    this.setHarvestPresentation(false);

    this.seedCore();
    this.setStatus("");
    this.updateHUD();
  }

  startGame() {
    this.beginStartSequence();
  }

  restart() {
    this.resetIntroState(false);
    this.started = true;
    this.setHarvestPresentation(false);
    this.resetState();
    this.spawnPiece();
    this.updateGhost();
    this.updateStartScreen();
  }

  resetIntroState(showTitle) {
    this.launching = false;
    this.launchProgress = 0;
    this.titleSpinAngle = 0;
    this.titleSettleAngle = 0;
    this.titleSpinSpeed = showTitle ? 0.95 : 0;
    this.titleCameraZoom = showTitle ? INTRO_IDLE_CAMERA_ZOOM : 1;
    this.titlePulseScale = showTitle ? INTRO_IDLE_PULSE_SCALE : 1;
    this.titleGridAlpha = showTitle ? INTRO_IDLE_GRID_ALPHA : 1;
  }

  setHarvestPresentation(active) {
    if (boardWrap) {
      boardWrap.classList.toggle("is-harvesting", active);
    }
  }

  beginStartSequence() {
    if (this.started || this.launching) return;
    this.launching = true;
    this.launchProgress = 0;
    this.titleSettleAngle = nearestQuarterTurn(this.titleSpinAngle);
    this.updateStartScreen();
  }

  finishStartSequence() {
    this.resetIntroState(false);
    this.started = true;
    this.setHarvestPresentation(false);
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
      startScreen.classList.toggle("is-launching", this.launching);
      startScreen.style.setProperty("--launch-progress", this.launching ? this.launchProgress.toFixed(3) : "0");
    }
    if (startButton) {
      startButton.disabled = this.launching;
    }
  }

  randomShape() {
    return SHAPES[Math.floor(Math.random() * SHAPES.length)];
  }

  spawnPiece(shapeOverride = null) {
    const shape = shapeOverride || this.nextShape;
    if (!shapeOverride) {
      this.nextShape = this.randomShape();
    }
    const cells = shape.cells.map((cell) => ({ ...cell }));
    const bounds = this.boundsForCells(cells);
    const spawnX = CENTER - Math.round((bounds.minX + bounds.maxX) / 2);
    const spawnY = -bounds.minY - 3;

    this.current = {
      shape,
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
    if (!this.current || this.gameOver || this.harvestSequence) return;
    while (this.movePiece(0, 1)) {
      // Drop until collision.
    }
    this.lockPiece();
  }

  update(dt) {
    this.elapsedTime += dt;
    this.updateCoreParticles(dt);
    this.updatePulseParticles(dt);

    if (!this.started) {
      if (justPressed.has("Enter")) {
        this.startGame();
      }
      this.updateIntroAnimation(dt);
      this.updateHUD();
      return;
    }

    if (this.harvestSequence) {
      this.updateHarvestSequence(dt);
      this.updateRotationAnimation(dt);
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
      const retryShape = this.current.shape;
      this.setStatus("Missed the stack");
      this.current = null;
      this.lockTimer = 0;
      this.spawnPiece(retryShape);
      this.updateGhost();
      return;
    }

    this.piecesPlaced += 1;
    this.lockSequence += 1;

    for (const cell of landed) {
      // Collapse only if a locked structure extends outside the playable field.
      if (cell.x < 0 || cell.x >= GRID_SIZE || cell.y < 0 || cell.y >= GRID_SIZE) {
        this.startHarvestSequence();
        return;
      }
      this.board[cell.y][cell.x] = {
        color: this.current.color,
        seed: false,
        age: 0,
        placementId: this.lockSequence,
      };
    }

    this.recalculateCoreSquare();
    this.evaluateBalance(landed);
    this.current = null;
    this.lockTimer = 0;
    this.spawnPiece();
    this.updateGhost();
  }

  startHarvestSequence() {
    if (this.harvestSequence) return;

    const dudBlocks = [];
    const outerBlocks = [];
    for (let y = 0; y < GRID_SIZE; y += 1) {
      for (let x = 0; x < GRID_SIZE; x += 1) {
        const block = this.board[y][x];
        if (!block || block.seed) continue;

        const influenced = this.coreLayers > 0 && Math.max(Math.abs(x - CENTER), Math.abs(y - CENTER)) <= this.coreLayers;
        const descriptor = {
          x,
          y,
          color: block.color,
          seed: x * 0.73 + y * 1.17 + (block.color === "cyan" ? 0.18 : 0.48),
          driftX: (hashUnit(x * 17.13 + y * 11.7) - 0.5) * 46,
          fallDistance: 220 + hashUnit(x * 8.9 + y * 3.7) * 170,
          fallDelay: hashUnit(x * 2.7 + y * 5.1) * 0.34,
          fallSpin: (hashUnit(x * 13.2 + y * 9.4) - 0.5) * 0.34,
        };

        if (influenced) {
          dudBlocks.push(descriptor);
        } else {
          outerBlocks.push(descriptor);
        }
      }
    }

    this.current = null;
    this.ghost = [];
    this.lockTimer = 0;
    this.dropTimer = 0;
    this.moveTimer = 0;
    this.lastMoveDir = 0;
    this.paused = false;
    this.gameOver = false;
    this.setStatus("");
    this.setHarvestPresentation(true);
    keys.clear();
    justPressed.clear();

    this.harvestSequence = {
      phase: "impact",
      phaseTime: 0,
      outerBlocks,
      dudBlocks,
      activeDudParticles: [],
      activeChargeParticles: [],
      emittedDuds: 0,
      emittedCharges: 0,
      visibleDuds: dudBlocks.length,
      displayDuds: this.bankedDuds,
      displayCharges: this.bankedPulseCharges,
      dudCounterPulse: 0,
      chargeCounterPulse: 0,
      harvestedDuds: dudBlocks.length,
      harvestedCharges: this.coreChargeCount,
      impactLabel: "Capacity Reached",
    };
  }

  advanceHarvestPhase(nextPhase) {
    if (!this.harvestSequence) return;
    this.harvestSequence.phase = nextPhase;
    this.harvestSequence.phaseTime = 0;
  }

  updateHarvestSequence(dt) {
    const harvest = this.harvestSequence;
    if (!harvest) return;

    harvest.phaseTime += dt;
    harvest.dudCounterPulse = Math.max(0, harvest.dudCounterPulse - dt / 0.24);
    harvest.chargeCounterPulse = Math.max(0, harvest.chargeCounterPulse - dt / 0.24);

    if (harvest.phase === "impact") {
      if (harvest.phaseTime >= HARVEST_IMPACT_TIME) {
        this.advanceHarvestPhase("fall");
      }
      return;
    }

    if (harvest.phase === "fall") {
      if (harvest.phaseTime >= HARVEST_FALL_TIME) {
        if (harvest.dudBlocks.length > 0) {
          this.advanceHarvestPhase("duds");
        } else if (harvest.harvestedCharges > 0) {
          this.advanceHarvestPhase("charges");
        } else {
          this.advanceHarvestPhase("return");
        }
      }
      return;
    }

    if (harvest.phase === "duds") {
      while (
        harvest.emittedDuds < harvest.dudBlocks.length &&
        harvest.phaseTime >= harvest.emittedDuds * HARVEST_DUD_EMIT_INTERVAL
      ) {
        const block = harvest.dudBlocks[harvest.emittedDuds];
        const startX = STAGE_SIZE / 2 + (block.x - CENTER) * CELL_SIZE;
        const startY = STAGE_SIZE / 2 + (block.y - CENTER) * CELL_SIZE;
        harvest.activeDudParticles.push({
          age: 0,
          duration: HARVEST_DUD_TRAVEL_TIME,
          startX,
          startY,
          controlX: startX + (STAGE_SIZE - HARVEST_COUNTER_X_INSET - startX) * 0.38,
          controlY: startY + 18 + hashUnit(block.seed * 12.3) * 42,
          targetX: STAGE_SIZE - HARVEST_COUNTER_X_INSET,
          targetY: HARVEST_COUNTER_Y + HARVEST_COUNTER_VALUE_Y,
          color: block.color,
          seed: block.seed,
          arrived: false,
        });
        harvest.emittedDuds += 1;
        harvest.visibleDuds = Math.max(0, harvest.dudBlocks.length - harvest.emittedDuds);
      }

      for (const particle of harvest.activeDudParticles) {
        particle.age = Math.min(particle.duration, particle.age + dt);
      }

      const remainingDuds = [];
      for (const particle of harvest.activeDudParticles) {
        if (!particle.arrived && particle.age >= particle.duration) {
          particle.arrived = true;
          this.bankedDuds += 1;
          harvest.displayDuds = this.bankedDuds;
          harvest.dudCounterPulse = 1;
        }
        if (!particle.arrived) {
          remainingDuds.push(particle);
        }
      }
      harvest.activeDudParticles = remainingDuds;

      if (harvest.emittedDuds >= harvest.dudBlocks.length && harvest.activeDudParticles.length === 0) {
        if (harvest.harvestedCharges > 0) {
          this.advanceHarvestPhase("charges");
        } else {
          this.advanceHarvestPhase("return");
        }
      }
      return;
    }

    if (harvest.phase === "charges") {
      while (
        harvest.emittedCharges < harvest.harvestedCharges &&
        harvest.phaseTime >= harvest.emittedCharges * HARVEST_CHARGE_EMIT_INTERVAL
      ) {
        harvest.activeChargeParticles.push({
          age: 0,
          duration: HARVEST_CHARGE_TRAVEL_TIME,
          targetX: HARVEST_COUNTER_X_INSET,
          targetY: HARVEST_COUNTER_Y + HARVEST_COUNTER_VALUE_Y,
          arrived: false,
        });
        harvest.emittedCharges += 1;
      }

      for (const particle of harvest.activeChargeParticles) {
        particle.age = Math.min(particle.duration, particle.age + dt);
      }

      const remainingCharges = [];
      for (const particle of harvest.activeChargeParticles) {
        if (!particle.arrived && particle.age >= particle.duration) {
          particle.arrived = true;
          this.bankedPulseCharges += 1;
          harvest.displayCharges = this.bankedPulseCharges;
          harvest.chargeCounterPulse = 1;
        }
        if (!particle.arrived) {
          remainingCharges.push(particle);
        }
      }
      harvest.activeChargeParticles = remainingCharges;

      if (harvest.emittedCharges >= harvest.harvestedCharges && harvest.activeChargeParticles.length === 0) {
        this.advanceHarvestPhase("return");
      }
      return;
    }

    if (harvest.phase === "return" && harvest.phaseTime >= HARVEST_RETURN_TIME) {
      this.finishHarvestSequence();
    }
  }

  finishHarvestSequence() {
    this.setHarvestPresentation(false);
    this.resetIntroState(true);
    this.started = false;
    this.resetState();
    this.updateStartScreen();
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
    const landedLookup = new Set(landedCells.map((cell) => cellKey(cell.x, cell.y)));
    const previousProfile = analyzeBalanceProfile(this.board, this.coreLayers, landedLookup);
    const totalProfile = analyzeBalanceProfile(this.board, this.coreLayers);
    const offsetDelta = totalProfile.weightedOffset - previousProfile.weightedOffset;
    // Use a normalized center-of-mass offset so large stacks stay readable instead of accumulating arbitrary torque.
    const tipPressure =
      totalProfile.weightedOffset +
      offsetDelta * BALANCE_SHIFT_MULTIPLIER +
      averageHorizontalOffset(landedCells) * BALANCE_PLACEMENT_IMPULSE;
    const centeredPlacement = averageCenterDistance(landedCells) <= 2.3;
    const stabilityThreshold =
      BALANCE_BASE_THRESHOLD +
      this.coreLayers * BALANCE_CORE_THRESHOLD_STEP +
      totalProfile.braceRatio * BALANCE_CENTER_BRACE_BONUS;

    this.lastBalance = tipPressure;

    if (centeredPlacement && Math.abs(tipPressure) < stabilityThreshold + BALANCE_CENTERED_BUFFER) {
      return;
    }

    if (tipPressure > stabilityThreshold) {
      this.rotateStructure(1);
    } else if (tipPressure < -stabilityThreshold) {
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

  updateIntroAnimation(dt) {
    if (!this.launching) {
      this.titleSpinSpeed = lerp(this.titleSpinSpeed, 0.82, clamp(dt * 1.8, 0, 1));
      this.titleCameraZoom = lerp(this.titleCameraZoom, INTRO_IDLE_CAMERA_ZOOM, clamp(dt * 1.5, 0, 1));
      this.titlePulseScale = lerp(this.titlePulseScale, INTRO_IDLE_PULSE_SCALE, clamp(dt * 1.6, 0, 1));
      this.titleGridAlpha = lerp(this.titleGridAlpha, INTRO_IDLE_GRID_ALPHA, clamp(dt * 1.6, 0, 1));
      this.titleSpinAngle += this.titleSpinSpeed * dt;
      return;
    }

    this.launchProgress = clamp(this.launchProgress + dt / INTRO_LAUNCH_TIME, 0, 1);
    const eased = easeInOutCubic(this.launchProgress);
    this.titleSpinSpeed = lerp(this.titleSpinSpeed, 0, clamp(dt * 2.6, 0, 1));
    this.titleSpinAngle += this.titleSpinSpeed * dt;
    this.titleSpinAngle = lerpAngle(
      this.titleSpinAngle,
      this.titleSettleAngle,
      clamp(dt * (1.2 + eased * 4.2), 0, 1)
    );
    this.titleCameraZoom = lerp(INTRO_IDLE_CAMERA_ZOOM, 1, eased);
    this.titlePulseScale = lerp(INTRO_IDLE_PULSE_SCALE, 1, eased);
    this.titleGridAlpha = lerp(INTRO_IDLE_GRID_ALPHA, 1, eased);
    this.updateStartScreen();

    if (this.launchProgress >= 1) {
      this.finishStartSequence();
    }
  }

  updateCoreParticles(dt) {
    if (this.coreParticles.length === 0) return;

    for (const particle of this.coreParticles) {
      particle.age += dt;
    }

    this.coreParticles = this.coreParticles.filter((particle) => particle.age < particle.life);
  }

  updatePulseParticles(dt) {
    if (this.started) {
      this.pulseParticleTimer = 0;
      this.pulseParticles = [];
      return;
    }

    this.pulseParticleTimer = (this.pulseParticleTimer + dt) % PULSE_HEARTBEAT_CYCLE;

    if (this.pulseParticleTimer > PULSE_HEARTBEAT_WINDOW) {
      this.pulseParticles = [];
      return;
    }

    const beatProgress = clamp(this.pulseParticleTimer / PULSE_HEARTBEAT_WINDOW, 0, 1);
    const beat = Math.pow(Math.sin(beatProgress * Math.PI), 1.15);
    if (beat <= 0.001) {
      this.pulseParticles = [];
      return;
    }
    const baseRadius = CELL_SIZE * 0.36;
    const travel = CELL_SIZE * 0.92;
    const majorSize = 1.8 + beat * 0.52;
    const minorSize = 1.2 + beat * 0.36;
    const particlesPerSet = Math.max(6, Math.floor(PULSE_PARTICLE_COUNT / 2));
    const configs = [
      {
        alphaMajor: 0.72,
        alphaMinor: 0.56,
        angleOffset: 0,
        colorKey: "cyan",
        layer: "back",
        radiusOffset: -CELL_SIZE * 0.08,
        sizeScale: 0.92,
      },
      {
        alphaMajor: 0.86,
        alphaMinor: 0.68,
        angleOffset: Math.PI / particlesPerSet,
        colorKey: "magenta",
        layer: "front",
        radiusOffset: CELL_SIZE * 0.06,
        sizeScale: 1.02,
      },
    ];

    this.pulseParticles = [];
    for (const config of configs) {
      for (let index = 0; index < particlesPerSet; index += 1) {
        const angle = -Math.PI / 2 + config.angleOffset + (index * Math.PI * 2) / particlesPerSet;
        const isMajor = index % 2 === 0;
        this.pulseParticles.push({
          angle,
          alpha: beat * (isMajor ? config.alphaMajor : config.alphaMinor),
          colorKey: config.colorKey,
          layer: config.layer,
          radius: baseRadius + beat * travel + config.radiusOffset,
          size: (isMajor ? majorSize : minorSize) * config.sizeScale,
        });
      }
    }
  }

  spawnCoreGrowthParticles(gainedLayers) {
    const burstCount = 14 + gainedLayers * 10;
    const ringHalf = ((this.coreLayers * 2 + 1) * CELL_SIZE) / 2 + CELL_SIZE * 1.25;

    for (let i = 0; i < burstCount; i += 1) {
      const side = Math.floor(Math.random() * 4);
      const offset = lerp(-ringHalf, ringHalf, Math.random());
      let startX = 0;
      let startY = 0;

      if (side === 0) {
        startX = -ringHalf;
        startY = offset;
      } else if (side === 1) {
        startX = ringHalf;
        startY = offset;
      } else if (side === 2) {
        startX = offset;
        startY = -ringHalf;
      } else {
        startX = offset;
        startY = ringHalf;
      }

      this.coreParticles.push({
        age: 0,
        life: 0.75 + Math.random() * 0.35,
        size: 2 + Math.random() * 2.4,
        startX,
        startY,
      });
    }
  }

  recalculateCoreSquare() {
    // The core only grows when the stack contains a larger complete square centered on the pivot.
    const previousLayers = this.coreLayers;
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

    const gainedLayers = Math.max(0, layers - previousLayers);
    if (gainedLayers > 0) {
      this.coreGrowthCount += gainedLayers;
      this.coreChargeCount += gainedLayers;
      this.spawnCoreGrowthParticles(gainedLayers);
    }
  }

  getCoreVisualState() {
    const pulse = 0.5 + 0.5 * Math.sin(this.elapsedTime * 2.2);
    const blockSpin = this.started ? 0 : this.titleSpinAngle;

    return {
      blockSpin,
      cameraZoom: this.started ? 1 : this.titleCameraZoom,
      gridAlpha: this.started ? 1 : this.titleGridAlpha,
      pulse,
      pulseScale: this.started ? 1 : this.titlePulseScale,
    };
  }

  getHarvestViewState() {
    const harvest = this.harvestSequence;
    if (!harvest) return null;

    let cameraZoom = 1;
    let shakeX = 0;
    let shakeY = 0;
    let messageAlpha = 0;
    let fieldAlpha = 1;

    if (harvest.phase === "impact") {
      const progress = clamp(harvest.phaseTime / HARVEST_IMPACT_TIME, 0, 1);
      const swell = progress < 0.56 ? easeOutCubic(progress / 0.56) : 1 - easeInCubic((progress - 0.56) / 0.44);
      const slam = clamp((progress - 0.6) / 0.28, 0, 1);
      cameraZoom = 1 + swell * (HARVEST_MAX_ZOOM - 1);
      const shakeStrength = (1 - slam) * Math.sin(slam * Math.PI * 4) * 7.5;
      shakeX = Math.sin(this.elapsedTime * 62) * shakeStrength;
      shakeY = Math.cos(this.elapsedTime * 54) * shakeStrength * 0.72;
      messageAlpha = clamp(progress * 1.4, 0, 1);
    } else if (harvest.phase === "fall") {
      const progress = clamp(harvest.phaseTime / HARVEST_FALL_TIME, 0, 1);
      const shakeStrength = (1 - progress) * 4.2;
      shakeX = Math.sin(this.elapsedTime * 48) * shakeStrength;
      shakeY = Math.cos(this.elapsedTime * 44) * shakeStrength * 0.68;
      messageAlpha = 1 - progress;
    } else if (harvest.phase === "duds") {
      const totalSpan = Math.max(HARVEST_DUD_EMIT_INTERVAL * Math.max(1, harvest.dudBlocks.length), HARVEST_DUD_TRAVEL_TIME);
      const progress = clamp(harvest.phaseTime / totalSpan, 0, 1);
      fieldAlpha = 1 - easeOutCubic(progress);
    } else if (harvest.phase === "return") {
      const progress = clamp(harvest.phaseTime / HARVEST_RETURN_TIME, 0, 1);
      cameraZoom = lerp(1, INTRO_IDLE_CAMERA_ZOOM, easeInOutCubic(progress));
      fieldAlpha = 1 - progress;
    }

    return { cameraZoom, shakeX, shakeY, messageAlpha, fieldAlpha };
  }

  draw() {
    ctx.setTransform(canvasRatio, 0, 0, canvasRatio, 0, 0);
    renderTime = this.elapsedTime;

    const frameWidth = canvasWidth;
    const frameHeight = canvasHeight;
    const stage = getStageLayout(frameWidth, frameHeight);
    const width = STAGE_SIZE;
    const height = STAGE_SIZE;

    ctx.clearRect(0, 0, frameWidth, frameHeight);
    ctx.fillStyle = COLORS.bg;
    roundRect(ctx, 0, 0, frameWidth, frameHeight, 22, true);

    const coreVisual = this.getCoreVisualState();
    const harvestView = this.getHarvestViewState();
    ctx.save();
    ctx.translate(stage.offsetX, stage.offsetY);
    ctx.scale(stage.scale, stage.scale);
    roundRect(ctx, 0, 0, width, height, 22, true);
    if (!this.started) {
      drawStartLogo(ctx, width, this.launching ? this.launchProgress : 0);
    }
    const boardZoom = harvestView ? harvestView.cameraZoom : coreVisual.cameraZoom;
    const boardGridAlpha = harvestView ? 1 : coreVisual.gridAlpha;
    const boardShakeX = harvestView ? harvestView.shakeX : 0;
    const boardShakeY = harvestView ? harvestView.shakeY : 0;
    const influenceAlpha = harvestView ? harvestView.fieldAlpha : 1;
    ctx.translate(width / 2 + boardShakeX, height / 2 + boardShakeY);
    ctx.scale(boardZoom, boardZoom);
    drawGrid(ctx, boardGridAlpha);
    if (harvestView) {
      this.drawHarvestStructure();
    } else {
      this.drawStructure();
    }
    drawCoreField(ctx, this.coreLayers, this.rotationVisual, coreVisual, this.started && this.coreLayers > 0, influenceAlpha);
    drawCoreParticles(ctx, this.coreParticles);
    drawPulseParticles(ctx, this.pulseParticles, coreVisual, "back");
    drawCoreSquare(ctx, this.coreLayers, this.rotationVisual, coreVisual, this.started && this.coreLayers > 0);
    drawPulseParticles(ctx, this.pulseParticles, coreVisual, "front");
    if (this.started && !harvestView) {
      this.drawGhostPiece();
      this.drawCurrentPiece();
    }
    ctx.restore();

    if (this.started && !harvestView) {
      ctx.save();
      ctx.translate(stage.offsetX, stage.offsetY);
      ctx.scale(stage.scale, stage.scale);
      drawSpawnPreview(ctx, this.nextShape, width, height);
      ctx.restore();
    }

    if (harvestView) {
      ctx.save();
      ctx.translate(stage.offsetX, stage.offsetY);
      ctx.scale(stage.scale, stage.scale);
      this.drawHarvestOverlay(harvestView, width, height);
      ctx.restore();
    } else if (this.gameOver) {
      ctx.save();
      ctx.translate(stage.offsetX, stage.offsetY);
      ctx.scale(stage.scale, stage.scale);
      drawOverlay(ctx, width, height, "Stack collapsed", "Press R to restart");
      ctx.restore();
    } else if (this.paused) {
      ctx.save();
      ctx.translate(stage.offsetX, stage.offsetY);
      ctx.scale(stage.scale, stage.scale);
      drawOverlay(ctx, width, height, "Paused", "Press P to resume");
      ctx.restore();
    }
  }

  drawStructure() {
    ctx.save();
    ctx.rotate(this.rotationVisual);
    for (let y = 0; y < GRID_SIZE; y += 1) {
      for (let x = 0; x < GRID_SIZE; x += 1) {
        const block = this.board[y][x];
        if (!block || block.seed) continue;
        const influenced = this.coreLayers > 0 && Math.max(Math.abs(x - CENTER), Math.abs(y - CENTER)) <= this.coreLayers;
        const shake = influenced ? getInfluenceShakeOffset(x, y, this.elapsedTime) : { x: 0, y: 0 };
        const alpha = influenced ? Math.max(0.68, this.blockFade(x, y) * 0.82) : this.blockFade(x, y);
        if (influenced) {
          drawInfluencedCellFill(ctx, x, y, block.color, alpha, shake.x, shake.y);
        } else {
          drawCellFill(ctx, x, y, block.color, alpha, shake.x, shake.y);
        }
        if (influenced) {
          drawInfluenceCellMask(ctx, x, y, shake.x, shake.y);
        }
      }
    }
    drawMassOutline(ctx, this.board);
    ctx.restore();
  }

  drawHarvestStructure() {
    const harvest = this.harvestSequence;
    if (!harvest) return;

    ctx.save();
    ctx.rotate(this.rotationVisual);

    const fallProgress = harvest.phase === "fall" ? clamp(harvest.phaseTime / HARVEST_FALL_TIME, 0, 1) : 0;
    const showOuter = harvest.phase === "impact" || harvest.phase === "fall";

    if (showOuter) {
      for (const block of harvest.outerBlocks) {
        const localProgress = clamp((fallProgress - block.fallDelay) / Math.max(0.001, 1 - block.fallDelay), 0, 1);
        const eased = easeInCubic(localProgress);
        const x = (block.x - CENTER) * CELL_SIZE + block.driftX * eased;
        const y = (block.y - CENTER) * CELL_SIZE + block.fallDistance * eased;
        const alpha = 1 - easeOutCubic(localProgress);
        if (alpha <= 0.01) continue;
        drawFloatingCell(ctx, x, y, block.color, alpha, false, block.seed, CELL_SIZE - 0.6, block.fallSpin * localProgress);
      }
    }

    const dudsVisible = harvest.phase === "impact" || harvest.phase === "fall" || harvest.phase === "duds";
    if (dudsVisible) {
      const emittedCount = harvest.dudBlocks.length - harvest.visibleDuds;
      for (let index = 0; index < harvest.dudBlocks.length; index += 1) {
        const block = harvest.dudBlocks[index];
        if (index < emittedCount) continue;

        let alpha = 1;
        if (harvest.phase === "duds") {
          const phaseFade = clamp(harvest.phaseTime / Math.max(0.001, HARVEST_DUD_TRAVEL_TIME * 1.5), 0, 1);
          alpha = 1 - phaseFade * 0.22;
        }
        drawFloatingCell(
          ctx,
          (block.x - CENTER) * CELL_SIZE,
          (block.y - CENTER) * CELL_SIZE,
          block.color,
          alpha,
          true,
          block.seed,
          CELL_SIZE - 0.6
        );
      }
    }

    ctx.restore();
  }

  drawHarvestOverlay(harvestView, width, height) {
    const harvest = this.harvestSequence;
    if (!harvest) return;

    const chargeCounter = { x: HARVEST_COUNTER_X_INSET, y: HARVEST_COUNTER_Y };
    const dudCounter = { x: width - HARVEST_COUNTER_X_INSET, y: HARVEST_COUNTER_Y };
    const chargeTarget = { x: chargeCounter.x, y: chargeCounter.y + HARVEST_COUNTER_VALUE_Y };
    const pulseOrigin = { x: width / 2 + harvestView.shakeX, y: height / 2 + harvestView.shakeY };
    const overlayAlpha = harvest.phase === "return" ? 1 - clamp(harvest.phaseTime / HARVEST_RETURN_TIME, 0, 1) : 1;

    if (harvest.phase === "impact" || harvest.phase === "fall") {
      ctx.save();
      ctx.globalAlpha = harvestView.messageAlpha * overlayAlpha;
      ctx.textAlign = "center";
      ctx.fillStyle = "#eef7ff";
      ctx.font = '800 34px "Segoe UI", Helvetica, Arial, sans-serif';
      ctx.fillText(harvest.impactLabel, width / 2, 92);
      ctx.restore();
    }

    this.drawHarvestCounter(
      chargeCounter.x,
      chargeCounter.y,
      "Pulse charges",
      harvest.displayCharges,
      "#ffffff",
      "rgba(255,255,255,0.14)",
      overlayAlpha,
      harvest.chargeCounterPulse
    );
    this.drawHarvestCounter(
      dudCounter.x,
      dudCounter.y,
      "Duds",
      harvest.displayDuds,
      "#a9b1b8",
      "rgba(169,177,184,0.12)",
      overlayAlpha,
      harvest.dudCounterPulse
    );

    if (harvest.phase === "charges" || harvest.phase === "return" || harvest.activeChargeParticles.length > 0) {
      ctx.save();
      ctx.lineCap = "round";
      ctx.shadowColor = `rgba(255,255,255,${overlayAlpha * 0.45})`;
      ctx.shadowBlur = 14;
      ctx.strokeStyle = `rgba(255,255,255,${overlayAlpha * 0.46})`;
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(pulseOrigin.x, pulseOrigin.y);
      ctx.lineTo(chargeTarget.x, chargeTarget.y);
      ctx.stroke();
      ctx.restore();
    }

    for (const particle of harvest.activeDudParticles) {
      const progress = clamp(particle.age / particle.duration, 0, 1);
      const x = quadraticBezier(particle.startX, particle.controlX, particle.targetX, progress);
      const y = quadraticBezier(particle.startY, particle.controlY, particle.targetY, progress);
      const size = lerp(11.5, 6.2, easeOutCubic(progress));
      drawFloatingCell(ctx, x, y, particle.color, 0.96 * overlayAlpha, true, particle.seed, size);
    }

    for (const particle of harvest.activeChargeParticles) {
      const progress = clamp(particle.age / particle.duration, 0, 1);
      const x = lerp(pulseOrigin.x, particle.targetX, easeInOutCubic(progress));
      const y = lerp(pulseOrigin.y, particle.targetY, easeInOutCubic(progress));
      const radius = lerp(5.5, 4.2, progress);
      ctx.save();
      ctx.fillStyle = `rgba(255,255,255,${overlayAlpha * 0.95})`;
      ctx.shadowColor = `rgba(255,255,255,${overlayAlpha * 0.85})`;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  drawHarvestCounter(x, y, label, value, numberColor, borderColor, alpha = 1, pulse = 0) {
    const pop = 1 + easeOutCubic(pulse) * 0.16;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.fillStyle = "rgba(7, 19, 29, 0.9)";
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1;
    roundRect(ctx, -74, -26, 148, 52, 18, true);
    ctx.stroke();
    ctx.fillStyle = "rgba(142,160,179,0.82)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = '700 11px "Segoe UI", Helvetica, Arial, sans-serif';
    ctx.fillText(label.toUpperCase(), 0, -8);
    ctx.fillStyle = numberColor;
    ctx.save();
    ctx.translate(0, 13);
    ctx.scale(pop, pop);
    ctx.font = '800 22px "Segoe UI", Helvetica, Arial, sans-serif';
    ctx.fillText(String(value), 0, 0);
    ctx.restore();
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
    if (currencyValue) {
      currencyValue.textContent = `Pulse charges ${this.coreChargeCount}`;
    }
  }
}

function averageCenterDistance(cells) {
  let total = 0;
  for (const cell of cells) {
    total += Math.hypot(cell.x - CENTER, cell.y - CENTER);
  }
  return total / Math.max(1, cells.length);
}

function averageHorizontalOffset(cells) {
  let total = 0;
  for (const cell of cells) {
    total += cell.x - CENTER;
  }
  return total / Math.max(1, cells.length);
}

function analyzeBalanceProfile(board, coreLayers, excludedCells = null) {
  let totalWeight = 0;
  let totalTorque = 0;
  let braceWeight = 0;
  const braceRadius = Math.max(1, coreLayers + 1);

  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const block = board[y][x];
      if (!block) continue;
      if (excludedCells && excludedCells.has(cellKey(x, y))) continue;

      const relX = x - CENTER;
      const ring = Math.max(Math.abs(relX), Math.abs(y - CENTER));
      const outerRing = Math.max(0, ring - braceRadius);
      const weight = 1 + outerRing * BALANCE_OUTER_RING_WEIGHT;

      totalWeight += weight;
      totalTorque += relX * weight;

      if (ring <= braceRadius) {
        braceWeight += weight;
      }
    }
  }

  return {
    braceRatio: totalWeight > 0 ? braceWeight / totalWeight : 0,
    weightedOffset: totalWeight > 0 ? totalTorque / totalWeight : 0,
  };
}

function cellKey(x, y) {
  return `${x},${y}`;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpAngle(from, to, t) {
  const delta = Math.atan2(Math.sin(to - from), Math.cos(to - from));
  return from + delta * t;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function nearestQuarterTurn(angle) {
  return Math.round(angle / ROTATION_STEP) * ROTATION_STEP;
}

function hashUnit(value) {
  const raw = Math.sin(value) * 43758.5453123;
  return raw - Math.floor(raw);
}

function getInfluenceShakeOffset(gridX, gridY, time) {
  const seed = hashUnit(gridX * 12.9898 + gridY * 78.233);
  const window = Math.floor(time * 3.2 + seed * 9.7);
  const active = hashUnit(window * 19.17 + seed * 41.83);
  if (active < 0.9) {
    return { x: 0, y: 0 };
  }

  const strength = 0.088 + hashUnit(window * 7.31 + seed * 29.7) * 0.264;
  return {
    x: Math.sin(time * 33 + seed * 40) * strength,
    y: Math.cos(time * 29 + seed * 35) * strength * 0.82,
  };
}

function easeInCubic(value) {
  return value * value * value;
}

function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
}

function easeInOutCubic(value) {
  return value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function drawGrid(context, alpha = 1) {
  const boardLength = GRID_SIZE * CELL_SIZE;
  context.save();
  context.globalAlpha = alpha;
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
  context.restore();
}

function drawCoreParticles(context, particles) {
  if (!particles || particles.length === 0) return;

  context.save();
  for (const particle of particles) {
    const progress = clamp(particle.age / particle.life, 0, 1);
    const eased = easeInCubic(progress);
    const x = lerp(particle.startX, 0, eased);
    const y = lerp(particle.startY, 0, eased);
    const size = lerp(particle.size, 1, progress);
    const alpha = 1 - progress;

    context.strokeStyle = `rgba(255,255,255,${alpha * 0.28})`;
    context.lineWidth = Math.max(1, size * 0.9);
    context.beginPath();
    context.moveTo(particle.startX, particle.startY);
    context.lineTo(x, y);
    context.stroke();

    context.fillStyle = `rgba(255,255,255,${alpha * 0.95})`;
    context.beginPath();
    context.arc(x, y, size, 0, Math.PI * 2);
    context.fill();
  }
  context.restore();
}

function drawPulseParticles(context, particles, visual, layer = "all") {
  if (!particles || particles.length === 0) return;

  context.save();
  context.rotate(visual ? visual.blockSpin : 0);
  for (const particle of particles) {
    if (layer !== "all" && particle.layer !== layer) continue;
    const x = Math.cos(particle.angle) * particle.radius;
    const y = Math.sin(particle.angle) * particle.radius;
    const size = particle.size;
    const alpha = particle.alpha;
    const half = size / 2;
    const fillColor = particle.colorKey === "cyan" ? COLORS.cyan : COLORS.magenta;
    const edgeColor = particle.colorKey === "cyan" ? COLORS.edgeCyan : COLORS.edgeMagenta;

    context.fillStyle = hexToRgba(fillColor, alpha * 0.62);
    context.strokeStyle = hexToRgba(edgeColor, alpha);
    context.lineWidth = Math.max(0.8, size * 0.18);
    roundRect(context, x - half, y - half, size, size, Math.min(1.3, size * 0.22), true);
    context.stroke();
  }
  context.restore();
}

function drawPulseCornerAccent(context, halfSize, length, color, xSign, ySign) {
  const outerInset = 3;
  const outerX = xSign * (halfSize - outerInset);
  const outerY = ySign * (halfSize - outerInset);
  const innerX = xSign * Math.max(0, halfSize - length);
  const innerY = ySign * Math.max(0, halfSize - length);

  context.save();
  context.strokeStyle = color;
  context.shadowColor = color;
  context.shadowBlur = 8;
  context.lineWidth = 1.8;
  context.lineCap = "square";
  context.beginPath();
  context.moveTo(innerX, outerY);
  context.lineTo(outerX, outerY);
  context.lineTo(outerX, innerY);
  context.stroke();
  context.restore();
}

function drawCoreField(context, layers, angle, visual, showInfluence, alphaScale = 1) {
  if (!showInfluence || layers <= 0) return;

  const fieldSize = (layers * 2 + 1) * CELL_SIZE - 3;
  const fieldHalf = fieldSize / 2;
  const shadeAlpha = (0.24 + Math.min(0.14, layers * 0.024)) * alphaScale;
  const outlineAlpha = (0.46 + (visual ? visual.pulse : 0.5) * 0.12) * alphaScale;
  const inset = Math.min(6, Math.max(3, CELL_SIZE * 0.18));

  context.save();
  context.rotate((visual ? visual.blockSpin : 0) + angle);
  context.fillStyle = `rgba(3, 8, 14, ${shadeAlpha})`;
  roundRect(context, -fieldHalf, -fieldHalf, fieldSize, fieldSize, 4, true);

  context.strokeStyle = `rgba(10,18,28,${outlineAlpha * 0.65})`;
  context.lineWidth = 4;
  context.setLineDash([7, 7]);
  roundRect(context, -fieldHalf + inset, -fieldHalf + inset, fieldSize - inset * 2, fieldSize - inset * 2, 2, false);
  context.stroke();
  context.strokeStyle = `rgba(255,255,255,${outlineAlpha})`;
  context.lineWidth = 2.15;
  context.setLineDash([7, 7]);
  roundRect(context, -fieldHalf + inset, -fieldHalf + inset, fieldSize - inset * 2, fieldSize - inset * 2, 2, false);
  context.stroke();
  context.setLineDash([]);
  context.restore();
}

function drawCoreSquare(context, layers, angle, visual, showInfluence) {
  const pulse = visual ? visual.pulse : 0.5;
  const pulseScale = visual && visual.pulseScale ? visual.pulseScale : 1;
  const pulseSize = CELL_SIZE * 1.02 * pulseScale;
  const slabSize = CELL_SIZE * 0.78 * pulseScale;
  const chamberSize = CELL_SIZE * 0.54 * pulseScale;
  const chamberInnerSize = Math.max(CELL_SIZE * 0.24, chamberSize - CELL_SIZE * 0.16 * pulseScale);
  const coreBlockSize = CELL_SIZE * (0.35 + pulse * 0.012) * pulseScale;

  context.save();
  context.rotate((visual ? visual.blockSpin : 0) + angle);

  const plateHalf = pulseSize / 2;
  const outerFill = context.createLinearGradient(-plateHalf, -plateHalf, plateHalf, plateHalf);
  outerFill.addColorStop(0, "#51586f");
  outerFill.addColorStop(0.5, "#3f4659");
  outerFill.addColorStop(1, "#2f3546");
  context.fillStyle = outerFill;
  roundRect(context, -plateHalf, -plateHalf, pulseSize, pulseSize, 3, true);

  const slabFill = context.createLinearGradient(-slabSize / 2, -slabSize / 2, slabSize / 2, slabSize / 2);
  slabFill.addColorStop(0, "#6d7590");
  slabFill.addColorStop(0.42, "#5c647d");
  slabFill.addColorStop(1, "#4b5368");
  context.fillStyle = slabFill;
  roundRect(context, -slabSize / 2, -slabSize / 2, slabSize, slabSize, 2, true);

  context.strokeStyle = "rgba(230,238,255,0.14)";
  context.lineWidth = 0.9;
  roundRect(context, -slabSize / 2, -slabSize / 2, slabSize, slabSize, 2, false);
  context.stroke();

  const chamberFill = context.createLinearGradient(-chamberSize / 2, -chamberSize / 2, chamberSize / 2, chamberSize / 2);
  chamberFill.addColorStop(0, "#32384b");
  chamberFill.addColorStop(1, "#1d2232");
  context.fillStyle = chamberFill;
  roundRect(context, -chamberSize / 2, -chamberSize / 2, chamberSize, chamberSize, 1.6, true);

  const wellFill = context.createLinearGradient(
    -chamberInnerSize / 2,
    -chamberInnerSize / 2,
    chamberInnerSize / 2,
    chamberInnerSize / 2
  );
  wellFill.addColorStop(0, "#161926");
  wellFill.addColorStop(1, "#0d101a");
  context.fillStyle = wellFill;
  roundRect(context, -chamberInnerSize / 2, -chamberInnerSize / 2, chamberInnerSize, chamberInnerSize, 1, true);

  drawPulseCornerAccent(context, slabSize / 2, Math.max(4.5, slabSize * 0.23), "#98edff", -1, -1);
  drawPulseCornerAccent(context, slabSize / 2, Math.max(4.5, slabSize * 0.23), "#ffadd6", 1, -1);
  drawPulseCornerAccent(context, slabSize / 2, Math.max(4.5, slabSize * 0.23), "#ffadd6", -1, 1);
  drawPulseCornerAccent(context, slabSize / 2, Math.max(4.5, slabSize * 0.23), "#98edff", 1, 1);

  const outerInset = coreBlockSize / 2;
  const blockFill = context.createLinearGradient(-outerInset, -outerInset, outerInset, outerInset);
  blockFill.addColorStop(0, "#fefeff");
  blockFill.addColorStop(0.45, "#eef4ff");
  blockFill.addColorStop(1, "#b8c7ff");
  context.fillStyle = blockFill;
  roundRect(context, -outerInset, -outerInset, coreBlockSize, coreBlockSize, 3, true);

  context.strokeStyle = "rgba(240,246,255,0.96)";
  context.lineWidth = 1.7;
  roundRect(context, -outerInset, -outerInset, coreBlockSize, coreBlockSize, 3, false);
  context.stroke();

  const innerInset = coreBlockSize * 0.16;
  const innerSize = coreBlockSize - innerInset * 2;
  const innerFill = context.createLinearGradient(-innerSize / 2, -innerSize / 2, innerSize / 2, innerSize / 2);
  innerFill.addColorStop(0, "rgba(255,255,255,0.96)");
  innerFill.addColorStop(1, "rgba(226,235,255,0.34)");
  context.fillStyle = innerFill;
  roundRect(context, -innerSize / 2, -innerSize / 2, innerSize, innerSize, 2, true);
  context.restore();
}

function getTetrominoPalette(colorKey, influenced = false) {
  if (influenced) {
    return colorKey === "cyan"
      ? {
          core: "#c3ccd3",
          edge: "#d8e0e6",
          glow: "#eef4f8",
          panelA: "#98a1a8",
          panelB: "#707880",
          shellA: "#2b3037",
          shellB: "#171b20",
          sparkle: "#e6edf2",
        }
      : {
          core: "#8a9097",
          edge: "#bcc2c7",
          glow: "#d7dde2",
          panelA: "#666c73",
          panelB: "#464b51",
          shellA: "#262a2f",
          shellB: "#14181c",
          sparkle: "#d6dce0",
        };
  }

  return colorKey === "cyan"
    ? {
        core: "#f8fdff",
        edge: "#8fe6ff",
        glow: "#d4fbff",
        panelA: "#72cef2",
        panelB: "#2c80a9",
        shellA: "#10293e",
        shellB: "#08121c",
        sparkle: "#e6fbff",
      }
    : {
        core: "#fff7fb",
        edge: "#ff9ac3",
        glow: "#ffd1e6",
        panelA: "#f06e9d",
        panelB: "#8e2f56",
        shellA: "#351322",
        shellB: "#170911",
        sparkle: "#ffe3f0",
      };
}

function getStartLogoPalette(colorKey) {
  return colorKey === "cyan"
    ? {
        core: "#ffffff",
        edge: "#d9f8ff",
        glow: "#baf3ff",
        panelA: "#a6efff",
        panelB: "#67c8eb",
        shellA: "#7bdcf8",
        shellB: "#4aa8d8",
        sparkle: "#f2feff",
      }
    : {
        core: "#fffaff",
        edge: "#ffd2e4",
        glow: "#ffbfd8",
        panelA: "#ffb0cd",
        panelB: "#f06e9d",
        shellA: "#f58ab0",
        shellB: "#c63a62",
        sparkle: "#fff1f8",
      };
}

function drawTechCellRect(context, x, y, size, palette, options = {}) {
  const alpha = options.alpha ?? 1;
  const flicker = options.flicker ?? false;
  const sparkle = options.sparkle ?? 0;
  const seed = options.seed ?? 0;
  const radius = Math.min(3.4, size * 0.14);
  const half = size / 2;
  const shellInset = size * 0.02;
  const panelInset = size * 0.065;
  const lightInset = size * 0.16;
  const coreInset = size * 0.24;
  const shellSize = size - shellInset * 2;
  const panelSize = size - panelInset * 2;
  const lightSize = size - lightInset * 2;
  const coreSize = size - coreInset * 2;
  const flickerWave = 0.55 + 0.45 * Math.sin(renderTime * 11 + seed * 6.2);
  const shimmerWave = 0.55 + 0.45 * Math.sin(renderTime * 7.5 + seed * 9.7);
  const lightAlpha = alpha * (flicker ? 0.2 + flickerWave * 0.34 : 0.18);
  const coreAlpha = alpha * (flicker ? 0.46 + flickerWave * 0.28 : 0.44);
  const edgeAlpha = alpha * (flicker ? 0.64 + shimmerWave * 0.2 : 0.7);

  context.save();
  context.translate(x, y);

  const shellFill = context.createLinearGradient(-half, -half, half, half);
  shellFill.addColorStop(0, hexToRgba(palette.shellA, alpha));
  shellFill.addColorStop(1, hexToRgba(palette.shellB, alpha));
  context.fillStyle = shellFill;
  roundRect(context, -half + shellInset, -half + shellInset, shellSize, shellSize, radius, true);

  const panelFill = context.createLinearGradient(-half, -half, half, half);
  panelFill.addColorStop(0, hexToRgba(palette.panelA, alpha * 0.98));
  panelFill.addColorStop(1, hexToRgba(palette.panelB, alpha * 0.96));
  context.fillStyle = panelFill;
  roundRect(context, -half + panelInset, -half + panelInset, panelSize, panelSize, radius * 0.82, true);

  context.strokeStyle = hexToRgba(palette.edge, edgeAlpha * 0.9);
  context.lineWidth = Math.max(0.9, size * 0.08);
  roundRect(context, -half + panelInset, -half + panelInset, panelSize, panelSize, radius * 0.82, false);
  context.stroke();

  context.fillStyle = "rgba(255,255,255,0.06)";
  roundRect(context, -half + panelInset + 1.2, -half + panelInset + 1.2, panelSize * 0.52, Math.max(2, panelSize * 0.12), 1.1, true);

  const backlightFill = context.createLinearGradient(-half, -half, half, half);
  backlightFill.addColorStop(0, `rgba(255,255,255,${lightAlpha})`);
  backlightFill.addColorStop(1, hexToRgba(palette.glow, lightAlpha * 0.52));
  context.fillStyle = backlightFill;
  roundRect(context, -half + lightInset, -half + lightInset, lightSize, lightSize, radius * 0.58, true);

  const coreFill = context.createLinearGradient(-half, -half, half, half);
  coreFill.addColorStop(0, `rgba(255,255,255,${coreAlpha})`);
  coreFill.addColorStop(1, hexToRgba(palette.core, coreAlpha));
  context.fillStyle = coreFill;
  roundRect(context, -half + coreInset, -half + coreInset, coreSize, coreSize, radius * 0.42, true);

  if (sparkle > 0.01) {
    const sparkleAlpha = alpha * sparkle * 0.28;
    const sparkleX = (-0.18 + hashUnit(seed * 14.7) * 0.38) * size;
    const sparkleY = (-0.16 + hashUnit(seed * 22.1) * 0.36) * size;
    const sparkleRadius = size * (0.11 + hashUnit(seed * 31.4) * 0.06);
    const sparkleX2 = (0.08 + hashUnit(seed * 41.8) * 0.26) * size;
    const sparkleY2 = (0.02 + hashUnit(seed * 53.2) * 0.28) * size;
    const sparkleRadius2 = size * (0.06 + hashUnit(seed * 63.6) * 0.04);

    context.fillStyle = hexToRgba(palette.sparkle, sparkleAlpha);
    context.beginPath();
    context.arc(sparkleX, sparkleY, sparkleRadius, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = hexToRgba(palette.sparkle, sparkleAlpha * 0.72);
    context.beginPath();
    context.arc(sparkleX2, sparkleY2, sparkleRadius2, 0, Math.PI * 2);
    context.fill();
  }

  context.restore();
}

function drawFloatingCell(context, x, y, colorKey, alpha, influenced, seed, size = CELL_SIZE - 0.6, rotation = 0) {
  const palette = getTetrominoPalette(colorKey, influenced);
  context.save();
  context.translate(x, y);
  if (rotation) {
    context.rotate(rotation);
  }
  drawTechCellRect(context, 0, 0, size, palette, {
    alpha,
    flicker: !influenced,
    seed,
    sparkle: influenced ? 0 : clamp((1 - alpha) * 1.1, 0, 0.36),
  });
  context.restore();
}

function createStartLogoLayout() {
  const cells = [];
  let column = 0;

  for (let wordIndex = 0; wordIndex < START_LOGO_WORDS.length; wordIndex += 1) {
    const word = START_LOGO_WORDS[wordIndex];

    for (let letterIndex = 0; letterIndex < word.text.length; letterIndex += 1) {
      const letter = word.text[letterIndex];
      const pattern = LOGO_PATTERNS[letter];
      const width = Math.max(...pattern.map((row) => row.length));

      for (let y = 0; y < pattern.length; y += 1) {
        for (let x = 0; x < pattern[y].length; x += 1) {
          if (pattern[y][x] !== "1") continue;
          cells.push({
            x: column + x,
            y,
            colorKey: word.colorKey,
            seed: x * 0.83 + y * 0.47 + wordIndex * 2.13 + letterIndex * 0.61,
          });
        }
      }

      column += width;
      if (letterIndex < word.text.length - 1) {
        column += START_LOGO_LETTER_GAP;
      }
    }

    if (wordIndex < START_LOGO_WORDS.length - 1) {
      column += START_LOGO_WORD_GAP;
    }
  }

  return {
    cols: Math.max(1, column),
    rows: START_LOGO_ROW_COUNT,
    cells,
  };
}

function drawStartLogo(context, width, launchProgress = 0) {
  const fade = clamp(1 - launchProgress * 1.18, 0, 1);
  if (fade <= 0.01) return;

  const logoWidth = (START_LOGO_LAYOUT.cols - 1) * START_LOGO_CELL_PITCH + START_LOGO_CELL_SIZE;
  const startX = width / 2 - logoWidth / 2 + START_LOGO_CELL_SIZE / 2;
  const startY = START_LOGO_TOP - launchProgress * 18 + START_LOGO_CELL_SIZE / 2;

  context.save();
  context.globalAlpha = fade;
  for (const cell of START_LOGO_LAYOUT.cells) {
    const x = startX + cell.x * START_LOGO_CELL_PITCH;
    const y = startY + cell.y * START_LOGO_CELL_PITCH;
    const palette = getStartLogoPalette(cell.colorKey);
    drawTechCellRect(context, x, y, START_LOGO_CELL_SIZE, palette, {
      alpha: 1,
      flicker: true,
      seed: cell.seed,
      sparkle: 0,
    });
  }
  context.restore();
}

function drawCellFill(context, gridX, gridY, colorKey, alpha, offsetX = 0, offsetY = 0) {
  const x = (gridX - CENTER) * CELL_SIZE + offsetX;
  const y = (gridY - CENTER) * CELL_SIZE + offsetY;
  const palette = getTetrominoPalette(colorKey, false);
  const sparkle = clamp((1 - alpha) * 1.4, 0, 0.42);
  const seed = gridX * 0.73 + gridY * 1.17 + (colorKey === "cyan" ? 0.12 : 0.41);
  drawTechCellRect(context, x, y, CELL_SIZE - 0.6, palette, {
    alpha,
    flicker: true,
    seed,
    sparkle,
  });
}

function drawInfluencedCellFill(context, gridX, gridY, colorKey, alpha, offsetX = 0, offsetY = 0) {
  const x = (gridX - CENTER) * CELL_SIZE + offsetX;
  const y = (gridY - CENTER) * CELL_SIZE + offsetY;
  const palette = getTetrominoPalette(colorKey, true);
  const seed = gridX * 0.73 + gridY * 1.17 + (colorKey === "cyan" ? 0.18 : 0.48);
  drawTechCellRect(context, x, y, CELL_SIZE - 0.6, palette, {
    alpha,
    flicker: false,
    seed,
    sparkle: 0,
  });
}

function drawInfluenceCellMask(context, gridX, gridY, offsetX = 0, offsetY = 0) {
  const x = (gridX - CENTER) * CELL_SIZE + offsetX;
  const y = (gridY - CENTER) * CELL_SIZE + offsetY;
  const inset = 1.5;

  context.save();
  context.fillStyle = "rgba(6, 8, 12, 0.12)";
  roundRect(context, x - CELL_SIZE / 2 + inset, y - CELL_SIZE / 2 + inset, CELL_SIZE - inset * 2, CELL_SIZE - inset * 2, 3, true);
  context.restore();
}

function drawActiveCell(context, gridX, gridY, colorKey) {
  const x = (gridX - CENTER) * CELL_SIZE;
  const y = (gridY - CENTER) * CELL_SIZE;
  const palette = getTetrominoPalette(colorKey, false);
  const seed = gridX * 0.91 + gridY * 1.29 + (colorKey === "cyan" ? 0.2 : 0.52);
  drawTechCellRect(context, x, y, CELL_SIZE - 0.2, palette, {
    alpha: 1,
    flicker: true,
    seed,
    sparkle: 0,
  });
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
      if (!block || block.seed) continue;

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
  const boxX = STAGE_SIZE - 168;
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
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const cell of piece.cells) {
    minX = Math.min(minX, cell.x);
    minY = Math.min(minY, cell.y);
    maxX = Math.max(maxX, cell.x);
    maxY = Math.max(maxY, cell.y);
  }
  const previewCenterX = boxX + 66;
  const previewCenterY = boxY + 78;
  const pieceCenterX = (minX + maxX) / 2;
  const pieceCenterY = (minY + maxY) / 2;
  for (const cell of piece.cells) {
    const px = previewCenterX + (cell.x - pieceCenterX) * size;
    const py = previewCenterY + (cell.y - pieceCenterY) * size;
    const palette = getTetrominoPalette(piece.color, false);
    const seed = cell.x * 0.87 + cell.y * 1.13 + (piece.color === "cyan" ? 0.23 : 0.57);
    drawTechCellRect(context, px, py, size - 4, palette, {
      alpha: 0.96,
      flicker: true,
      seed,
      sparkle: 0,
    });
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

function getStageLayout(width, height) {
  const scale = Math.max(0.1, Math.min(width / STAGE_SIZE, height / STAGE_SIZE));
  return {
    offsetX: (width - STAGE_SIZE * scale) / 2,
    offsetY: (height - STAGE_SIZE * scale) / 2,
    scale,
  };
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

function quadraticBezier(start, control, end, t) {
  const inverse = 1 - t;
  return inverse * inverse * start + 2 * inverse * t * control + t * t * end;
}

const game = new BalanceStackGame();

if (typeof window !== "undefined") {
  window.__TWISTRIS_TEST_API__ = {
    BalanceStackGame,
    GRID_SIZE,
    CENTER,
    SHAPES,
    analyzeBalanceProfile,
    averageCenterDistance,
    averageHorizontalOffset,
    clamp,
    nearestQuarterTurn,
  };
}

if (startButton) {
  startButton.addEventListener("click", () => {
    game.startGame();
    focusGameSurface();
  });
}

if (gameKeySink) {
  gameKeySink.addEventListener("input", () => {
    gameKeySink.value = "";
  });
}

canvas.addEventListener("pointerdown", () => {
  focusGameSurface();
});

canvas.addEventListener("touchstart", () => {
  focusGameSurface();
}, { passive: true });

function resizeCanvas() {
  canvasRatio = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  canvasWidth = Math.max(1, Math.floor(rect.width));
  canvasHeight = Math.max(1, Math.floor(rect.height));
  canvas.width = Math.floor(canvasWidth * canvasRatio);
  canvas.height = Math.floor(canvasHeight * canvasRatio);
}

window.addEventListener("keydown", (event) => {
  if (GAME_CONTROL_CODES.has(event.code)) {
    focusGameSurface();
    event.preventDefault();
    event.stopPropagation();
  }
  if (!keys.has(event.code)) {
    justPressed.add(event.code);
  }
  keys.add(event.code);
}, true);

window.addEventListener("keyup", (event) => {
  if (GAME_CONTROL_CODES.has(event.code)) {
    event.preventDefault();
    event.stopPropagation();
  }
  keys.delete(event.code);
}, true);

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
