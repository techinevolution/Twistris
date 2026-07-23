import Phaser from "phaser";

import {
  PuzzleRun,
  type PieceColor,
  type PieceShape,
} from "../../domain/puzzle/PuzzleRun";
import {
  WorldCameraController,
  type WorldCameraMode,
} from "../../presentation/camera/WorldCameraController";

const STAGE_SIZE = 800;
const GRID_SIZE = 27;
const CELL_SIZE = 24;
const IDLE_ZOOM = 6.35;
const IDLE_PULSE_SCALE = 1.06;
const IDLE_GRID_ALPHA = 0.36;
const LAUNCH_DURATION = 2050;
const ROTATION_DURATION = 340;
const HEARTBEAT_CYCLE = 1740;
const HEARTBEAT_WINDOW = 820;

const COLORS = {
  bg: 0x091723,
  grid: 0x7d9bb2,
  cyan: 0x4aa8d8,
  magenta: 0xc63a62,
  cyanEdge: 0x8fe6ff,
  magentaEdge: 0xff9ac3,
  white: 0xf8fdff,
};

type WorldPhase = "title" | "launching" | "playing";
export type PuzzleAction =
  | "left"
  | "right"
  | "rotate"
  | "softDrop"
  | "hardDrop";

interface LogoCell {
  color: "cyan" | "magenta";
  seed: number;
  x: number;
  y: number;
}

const LOGO_PATTERNS: Record<string, string[]> = {
  T: ["111", "010", "010", "010", "010"],
  W: ["10001", "10001", "10101", "10101", "01010"],
  I: ["1", "1", "1", "1", "1"],
  S: ["111", "100", "111", "001", "111"],
  R: ["1110", "1001", "1110", "1010", "1001"],
};

function createLogoLayout(): { cells: LogoCell[]; columns: number } {
  const words = [
    { color: "cyan" as const, text: "TWIS" },
    { color: "magenta" as const, text: "TRIS" },
  ];
  const cells: LogoCell[] = [];
  let column = 0;

  for (let wordIndex = 0; wordIndex < words.length; wordIndex += 1) {
    const word = words[wordIndex];
    for (let letterIndex = 0; letterIndex < word.text.length; letterIndex += 1) {
      const pattern = LOGO_PATTERNS[word.text[letterIndex]];
      const width = Math.max(...pattern.map((row) => row.length));

      for (let y = 0; y < pattern.length; y += 1) {
        for (let x = 0; x < pattern[y].length; x += 1) {
          if (pattern[y][x] !== "1") continue;
          cells.push({
            color: word.color,
            seed: x * 0.83 + y * 0.47 + wordIndex * 2.13 + letterIndex * 0.61,
            x: column + x,
            y,
          });
        }
      }

      column += width;
      if (letterIndex < word.text.length - 1) column += 1;
    }
    if (wordIndex < words.length - 1) column += 1;
  }

  return { cells, columns: Math.max(1, column) };
}

function createTechCell(
  scene: Phaser.Scene,
  color: "cyan" | "magenta",
  size: number,
  bright = false,
): Phaser.GameObjects.Container {
  const palette =
    color === "cyan"
      ? {
          edge: bright ? 0xd9f8ff : COLORS.cyanEdge,
          panel: bright ? 0xa6efff : 0x72cef2,
          shell: bright ? 0x4aa8d8 : 0x10293e,
        }
      : {
          edge: bright ? 0xffd2e4 : COLORS.magentaEdge,
          panel: bright ? 0xffb0cd : 0xf06e9d,
          shell: bright ? 0xc63a62 : 0x351322,
        };
  const container = scene.add.container();
  const graphic = scene.add.graphics();
  const half = size / 2;

  graphic.fillStyle(palette.shell, 1);
  graphic.fillRoundedRect(-half, -half, size, size, Math.min(3.4, size * 0.14));
  graphic.fillStyle(palette.panel, 0.98);
  graphic.fillRoundedRect(-half + size * 0.07, -half + size * 0.07, size * 0.86, size * 0.86, 2.5);
  graphic.lineStyle(Math.max(1, size * 0.07), palette.edge, 0.88);
  graphic.strokeRoundedRect(-half + size * 0.07, -half + size * 0.07, size * 0.86, size * 0.86, 2.5);
  graphic.fillStyle(COLORS.white, bright ? 0.58 : 0.42);
  graphic.fillRoundedRect(-half + size * 0.23, -half + size * 0.23, size * 0.54, size * 0.54, 2);
  graphic.fillStyle(COLORS.white, 0.1);
  graphic.fillRect(-half + size * 0.13, -half + size * 0.13, size * 0.44, Math.max(1, size * 0.07));
  container.add(graphic);

  return container;
}

function createPulse(scene: Phaser.Scene): Phaser.GameObjects.Container {
  const container = scene.add.container(0, 0);
  const plate = scene.add.graphics();
  const pulseSize = CELL_SIZE * 1.02;
  const plateHalf = pulseSize / 2;
  const slabSize = CELL_SIZE * 0.78;
  const chamberSize = CELL_SIZE * 0.54;

  plate.fillStyle(0x2f3546, 1);
  plate.fillRoundedRect(-plateHalf, -plateHalf, pulseSize, pulseSize, 3);
  plate.fillStyle(0x5c647d, 1);
  plate.fillRoundedRect(-slabSize / 2, -slabSize / 2, slabSize, slabSize, 2);
  plate.lineStyle(1, 0xe6eeff, 0.16);
  plate.strokeRoundedRect(-slabSize / 2, -slabSize / 2, slabSize, slabSize, 2);
  plate.fillStyle(0x161926, 1);
  plate.fillRoundedRect(-chamberSize / 2, -chamberSize / 2, chamberSize, chamberSize, 2);

  const accents = scene.add.graphics();
  const half = slabSize / 2;
  const length = 4.5;
  const drawAccent = (color: number, xSign: -1 | 1, ySign: -1 | 1) => {
    accents.lineStyle(2.4, color, 1);
    accents.beginPath();
    accents.moveTo(xSign * (half - length), ySign * half);
    accents.lineTo(xSign * half, ySign * half);
    accents.lineTo(xSign * half, ySign * (half - length));
    accents.strokePath();
  };
  drawAccent(0x98edff, -1, -1);
  drawAccent(0xffadd6, 1, -1);
  drawAccent(0xffadd6, -1, 1);
  drawAccent(0x98edff, 1, 1);

  const core = createTechCell(scene, "cyan", CELL_SIZE * 0.36, true);
  container.add([plate, accents, core]);
  scene.tweens.add({
    targets: core,
    scale: 1.035,
    duration: 710,
    ease: "Sine.InOut",
    yoyo: true,
    repeat: -1,
  });

  return container;
}

export class WorldScene extends Phaser.Scene {
  onLaunchComplete: (() => void) | null = null;
  onLaunchProgress: ((progress: number) => void) | null = null;

  private phase: WorldPhase = "title";
  private readonly cameraController = new WorldCameraController("title-closeup");
  private readonly mountedSectors = new Set<string>();
  private world!: Phaser.GameObjects.Container;
  private pulseSector!: Phaser.GameObjects.Container;
  private structureContainer!: Phaser.GameObjects.Container;
  private grid!: Phaser.GameObjects.Graphics;
  private structureGraphics!: Phaser.GameObjects.Graphics;
  private pieceGraphics!: Phaser.GameObjects.Graphics;
  private previewGraphics!: Phaser.GameObjects.Graphics;
  private previewLabel!: Phaser.GameObjects.Text;
  private pulse!: Phaser.GameObjects.Container;
  private logo!: Phaser.GameObjects.Container;
  private particles: Phaser.GameObjects.Arc[] = [];
  private elapsed = 0;
  private launchElapsed = 0;
  private titleSpinDegrees = 0;
  private settleDegrees = 0;
  private fpsElapsed = 0;
  private fps = 60;
  private ready = false;
  private puzzle = new PuzzleRun();
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private letterKeys!: Record<"left" | "right" | "rotateW" | "rotateX" | "softDrop", Phaser.Input.Keyboard.Key>;
  private horizontalDirection = 0;
  private horizontalRepeatElapsed = 0;
  private rotationElapsed = 0;

  constructor() {
    super("World");
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.bg);
    this.world = this.add.container(STAGE_SIZE / 2, STAGE_SIZE / 2);
    this.world.setName("world-root");
    this.pulseSector = this.add.container(0, 0);
    this.pulseSector.setName("sector:pulse");
    this.grid = this.createGrid();
    this.structureContainer = this.add.container(0, 0);
    this.structureContainer.setName("pulse-structure");
    this.structureGraphics = this.add.graphics();
    this.pieceGraphics = this.add.graphics();
    this.previewGraphics = this.add.graphics();
    this.previewLabel = this.add.text(250, -347, "Next piece", {
      color: "#eef7ff",
      fontFamily: '"Segoe UI", Helvetica, Arial, sans-serif',
      fontSize: "14px",
      fontStyle: "bold",
    });
    this.previewLabel.setVisible(false);
    this.pulse = createPulse(this);
    this.structureContainer.add([this.structureGraphics, this.pulse]);
    this.createParticles();
    this.pulseSector.add([
      this.grid,
      this.structureContainer,
      this.pieceGraphics,
      this.previewGraphics,
      this.previewLabel,
      ...this.particles,
    ]);
    this.world.add(this.pulseSector);
    this.mountSector("pulse");
    this.world.setScale(IDLE_ZOOM);
    this.grid.setAlpha(IDLE_GRID_ALPHA);
    this.pulse.setScale(IDLE_PULSE_SCALE);
    this.logo = this.createLogo();
    this.bindPuzzleInput();
    this.ready = true;
    this.publishDiagnostics();
  }

  update(_time: number, delta: number) {
    this.elapsed += delta;
    this.fpsElapsed += delta;

    if (this.phase === "title") {
      this.titleSpinDegrees += Phaser.Math.RadToDeg(0.82) * (delta / 1000);
      this.pulse.setAngle(this.titleSpinDegrees);
      this.updateParticles();
    } else if (this.phase === "launching") {
      this.updateLaunch(delta);
      this.updateParticles();
    } else {
      for (const particle of this.particles) particle.setVisible(false);
      this.updatePuzzle(delta);
    }

    if (this.fpsElapsed >= 300) {
      this.fpsElapsed = 0;
      this.fps = Math.round(this.game.loop.actualFps || 0);
      this.publishDiagnostics();
    }
  }

  startTransition(): boolean {
    if (!this.ready || this.phase !== "title") return false;

    this.phase = "launching";
    this.setCameraMode("guided-pullback");
    this.launchElapsed = 0;
    this.settleDegrees = Math.round(this.titleSpinDegrees / 90) * 90;
    this.publishDiagnostics();
    return true;
  }

  act(action: PuzzleAction): boolean {
    if (this.phase !== "playing" || this.puzzle.pendingRotation) return false;

    let changed = false;
    if (action === "left") changed = this.puzzle.move(-1, 0);
    if (action === "right") changed = this.puzzle.move(1, 0);
    if (action === "rotate") changed = this.puzzle.rotate();
    if (action === "softDrop") changed = this.puzzle.move(0, 1);
    if (action === "hardDrop") changed = this.puzzle.hardDrop() !== null;
    this.renderPuzzle();
    this.publishDiagnostics();
    return changed;
  }

  private updateLaunch(delta: number) {
    this.launchElapsed = Math.min(LAUNCH_DURATION, this.launchElapsed + delta);
    const progress = this.launchElapsed / LAUNCH_DURATION;
    const eased = Phaser.Math.Easing.Cubic.InOut(progress);

    this.world.setScale(Phaser.Math.Linear(IDLE_ZOOM, 1, eased));
    this.grid.setAlpha(Phaser.Math.Linear(IDLE_GRID_ALPHA, 1, eased));
    this.pulse.setScale(Phaser.Math.Linear(IDLE_PULSE_SCALE, 1, eased));
    this.pulse.setAngle(Phaser.Math.Linear(this.titleSpinDegrees, this.settleDegrees, eased));
    this.logo.setAlpha(Phaser.Math.Clamp(1 - progress * 1.18, 0, 1));
    this.logo.y = -progress * 18;
    this.onLaunchProgress?.(progress);
    this.publishDiagnostics();

    if (progress < 1) return;

    this.phase = "playing";
    this.setCameraMode("puzzle");
    this.world.setScale(1);
    this.grid.setAlpha(1);
    this.pulse.setScale(1);
    this.pulse.setAngle(0);
    this.logo.setVisible(false);
    this.puzzle.start();
    this.previewLabel.setVisible(true);
    this.renderPuzzle();
    this.onLaunchComplete?.();
    this.publishDiagnostics();
  }

  private createGrid(): Phaser.GameObjects.Graphics {
    const grid = this.add.graphics();
    const boardLength = GRID_SIZE * CELL_SIZE;
    const half = boardLength / 2;
    grid.lineStyle(1, COLORS.grid, 0.08);

    for (let index = 0; index <= GRID_SIZE; index += 1) {
      const offset = -half + index * CELL_SIZE;
      grid.lineBetween(offset, -half, offset, half);
      grid.lineBetween(-half, offset, half, offset);
    }

    return grid;
  }

  private bindPuzzleInput() {
    const keyboard = this.input.keyboard;
    if (!keyboard) return;

    this.cursors = keyboard.createCursorKeys();
    this.letterKeys = keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      rotateW: Phaser.Input.Keyboard.KeyCodes.W,
      rotateX: Phaser.Input.Keyboard.KeyCodes.X,
      softDrop: Phaser.Input.Keyboard.KeyCodes.S,
    }) as typeof this.letterKeys;
    keyboard.addCapture([
      Phaser.Input.Keyboard.KeyCodes.LEFT,
      Phaser.Input.Keyboard.KeyCodes.RIGHT,
      Phaser.Input.Keyboard.KeyCodes.UP,
      Phaser.Input.Keyboard.KeyCodes.DOWN,
      Phaser.Input.Keyboard.KeyCodes.SPACE,
      Phaser.Input.Keyboard.KeyCodes.A,
      Phaser.Input.Keyboard.KeyCodes.D,
      Phaser.Input.Keyboard.KeyCodes.S,
      Phaser.Input.Keyboard.KeyCodes.W,
      Phaser.Input.Keyboard.KeyCodes.X,
    ]);
  }

  private updatePuzzle(delta: number) {
    if (this.puzzle.pendingRotation) {
      this.updateStructureRotation(delta);
      this.renderPuzzle();
      return;
    }

    if (!this.puzzle.current || !this.cursors || !this.letterKeys) {
      this.renderPuzzle();
      return;
    }

    const leftDown = this.cursors.left.isDown || this.letterKeys.left.isDown;
    const rightDown = this.cursors.right.isDown || this.letterKeys.right.isDown;
    const direction = leftDown === rightDown ? 0 : leftDown ? -1 : 1;

    if (direction !== this.horizontalDirection) {
      this.horizontalDirection = direction;
      this.horizontalRepeatElapsed = 0;
      if (direction !== 0) this.puzzle.move(direction, 0);
    } else if (direction !== 0) {
      this.horizontalRepeatElapsed += delta;
      if (this.horizontalRepeatElapsed >= 120) {
        this.horizontalRepeatElapsed = 50;
        this.puzzle.move(direction, 0);
      }
    }

    if (
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.letterKeys.rotateW) ||
      Phaser.Input.Keyboard.JustDown(this.letterKeys.rotateX)
    ) {
      this.puzzle.rotate();
    }

    if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
      this.puzzle.hardDrop();
    } else {
      this.puzzle.advance(delta, {
        softDrop:
          this.cursors.down.isDown || this.letterKeys.softDrop.isDown,
      });
    }

    this.renderPuzzle();
  }

  private renderPuzzle() {
    if (
      !this.structureGraphics ||
      !this.pieceGraphics ||
      !this.previewGraphics
    ) {
      return;
    }

    this.structureGraphics.clear();
    this.pieceGraphics.clear();
    this.previewGraphics.clear();
    if (this.phase !== "playing") return;

    for (const cell of this.puzzle.ghostCells()) {
      this.drawPuzzleCell(
        this.pieceGraphics,
        cell.x,
        cell.y,
        "cyan",
        0.2,
        true,
      );
    }

    for (let y = 0; y < this.puzzle.size; y += 1) {
      for (let x = 0; x < this.puzzle.size; x += 1) {
        const block = this.puzzle.board[y][x];
        if (!block || block.seed) continue;
        this.drawPuzzleCell(
          this.structureGraphics,
          x,
          y,
          block.color === "magenta" ? "magenta" : "cyan",
        );
      }
    }

    if (this.puzzle.current) {
      for (const cell of this.puzzle.worldCells()) {
        this.drawPuzzleCell(
          this.pieceGraphics,
          cell.x,
          cell.y,
          this.puzzle.current.color,
        );
      }
    }

    this.drawPreview(this.puzzle.nextShape);
  }

  private updateStructureRotation(delta: number) {
    const pending = this.puzzle.pendingRotation;
    if (!pending) return;

    this.rotationElapsed = Math.min(
      ROTATION_DURATION,
      this.rotationElapsed + delta,
    );
    const progress = this.rotationElapsed / ROTATION_DURATION;
    const overshoot = 1.08;
    const offset = progress - 1;
    const eased =
      1 +
      (overshoot + 1) * Math.pow(offset, 3) +
      overshoot * Math.pow(offset, 2);
    this.structureContainer.setAngle(pending.direction * 90 * eased);
    this.publishDiagnostics();

    if (progress < 1) return;

    this.puzzle.commitPendingRotation();
    this.structureContainer.setAngle(0);
    this.rotationElapsed = 0;
    this.publishDiagnostics();
  }

  private drawPuzzleCell(
    graphics: Phaser.GameObjects.Graphics,
    gridX: number,
    gridY: number,
    color: PieceColor,
    alpha = 1,
    ghost = false,
    size = CELL_SIZE,
  ) {
    const x = (gridX - this.puzzle.center) * CELL_SIZE;
    const y = (gridY - this.puzzle.center) * CELL_SIZE;
    const half = size / 2;
    const edge = color === "cyan" ? COLORS.cyanEdge : COLORS.magentaEdge;
    const panel = color === "cyan" ? COLORS.cyan : COLORS.magenta;

    if (ghost) {
      graphics.fillStyle(COLORS.white, alpha * 0.38);
      graphics.fillRoundedRect(x - half + 2, y - half + 2, size - 4, size - 4, 3);
      graphics.lineStyle(2, COLORS.white, alpha * 0.8);
      graphics.strokeRoundedRect(x - half + 2, y - half + 2, size - 4, size - 4, 3);
      return;
    }

    graphics.fillStyle(0x10293e, alpha);
    graphics.fillRoundedRect(x - half, y - half, size, size, 3);
    graphics.fillStyle(panel, alpha);
    graphics.fillRoundedRect(x - half + 1.7, y - half + 1.7, size - 3.4, size - 3.4, 2.5);
    graphics.lineStyle(1.6, edge, alpha * 0.92);
    graphics.strokeRoundedRect(x - half + 1.7, y - half + 1.7, size - 3.4, size - 3.4, 2.5);
    graphics.fillStyle(COLORS.white, alpha * 0.28);
    graphics.fillRoundedRect(x - half + 6, y - half + 6, size - 12, size - 12, 2);
  }

  private drawPreview(shape: PieceShape) {
    const graphics = this.previewGraphics;
    const boxX = 232;
    const boxY = -364;
    const boxSize = 132;
    graphics.fillStyle(COLORS.white, 0.02);
    graphics.fillRoundedRect(boxX, boxY, boxSize, boxSize, 18);
    graphics.lineStyle(1, COLORS.grid, 0.16);
    graphics.strokeRoundedRect(boxX, boxY, boxSize, boxSize, 18);

    const previewSize = 26;
    const xs = shape.cells.map((cell) => cell.x);
    const ys = shape.cells.map((cell) => cell.y);
    const centerX = (Math.min(...xs) + Math.max(...xs)) / 2;
    const centerY = (Math.min(...ys) + Math.max(...ys)) / 2;

    for (const cell of shape.cells) {
      const gridX =
        this.puzzle.center +
        (298 + (cell.x - centerX) * previewSize) / CELL_SIZE;
      const gridY =
        this.puzzle.center +
        (-286 + (cell.y - centerY) * previewSize) / CELL_SIZE;
      this.drawPuzzleCell(
        graphics,
        gridX,
        gridY,
        shape.color,
        0.96,
        false,
        previewSize - 4,
      );
    }
  }

  private createLogo(): Phaser.GameObjects.Container {
    const layout = createLogoLayout();
    const pitch = 12.6;
    const cellSize = 13.9;
    const logoWidth = (layout.columns - 1) * pitch + cellSize;
    const startX = STAGE_SIZE / 2 - logoWidth / 2 + cellSize / 2;
    const logo = this.add.container(0, 0);

    for (const cell of layout.cells) {
      const graphic = createTechCell(this, cell.color, cellSize, true);
      graphic.setPosition(startX + cell.x * pitch, 74 + cell.y * pitch + cellSize / 2);
      const flickerDelay = Math.round((cell.seed % 1) * 560);
      this.tweens.add({
        targets: graphic,
        alpha: 0.78,
        duration: 820 + flickerDelay,
        delay: flickerDelay,
        ease: "Sine.InOut",
        yoyo: true,
        repeat: -1,
      });
      logo.add(graphic);
    }

    return logo;
  }

  private createParticles() {
    for (let index = 0; index < 24; index += 1) {
      const cyan = index < 12;
      const particle = this.add.circle(0, 0, cyan ? 1.65 : 1.85, cyan ? COLORS.cyan : COLORS.magenta, 0);
      this.particles.push(particle);
    }
  }

  private updateParticles() {
    const cycleTime = this.elapsed % HEARTBEAT_CYCLE;
    if (cycleTime > HEARTBEAT_WINDOW) {
      for (const particle of this.particles) particle.setVisible(false);
      return;
    }

    const progress = cycleTime / HEARTBEAT_WINDOW;
    const beat = Math.pow(Math.sin(progress * Math.PI), 1.15);
    for (let index = 0; index < this.particles.length; index += 1) {
      const particle = this.particles[index];
      const setIndex = index % 12;
      const cyan = index < 12;
      const angle = -Math.PI / 2 + (setIndex * Math.PI * 2) / 12 + (cyan ? 0 : Math.PI / 12);
      const radius = CELL_SIZE * (cyan ? 0.28 : 0.42) + beat * CELL_SIZE * 0.92;
      particle.setPosition(Math.cos(angle) * radius, Math.sin(angle) * radius);
      particle.setAlpha(beat * (setIndex % 2 === 0 ? 0.8 : 0.58));
      particle.setVisible(beat > 0.001);
    }
  }

  private publishDiagnostics() {
    const root = document.documentElement;
    root.dataset.worldScene = "active";
    root.dataset.worldCameraMode = this.cameraController.mode;
    root.dataset.worldMountedSectors = [...this.mountedSectors].sort().join(",");
    root.dataset.worldPuzzleActive = String(this.phase === "playing");
    root.dataset.worldPuzzlePiecesPlaced = String(this.puzzle.piecesPlaced);
    root.dataset.worldPuzzleCurrent = this.puzzle.current?.shape.name ?? "";
    root.dataset.worldPuzzleX = String(this.puzzle.current?.x ?? "");
    root.dataset.worldPuzzleY = String(this.puzzle.current?.y ?? "");
    root.dataset.worldPuzzleNext = this.puzzle.nextShape.name;
    root.dataset.worldPuzzleOutcome = this.puzzle.lastOutcome ?? "";
    root.dataset.worldPuzzleRotating = String(Boolean(this.puzzle.pendingRotation));
    root.dataset.worldPuzzleRotationCount = String(this.puzzle.rotationCount);
    root.dataset.worldPuzzleOrientation = String(this.puzzle.orientationTurns);
    root.dataset.worldPuzzleBalance = this.puzzle.lastBalance.toFixed(3);
    root.dataset.worldPuzzleStructureAngle = this.structureContainer
      ? this.structureContainer.angle.toFixed(1)
      : "0";
    root.dataset.titlePhase = this.phase;
    root.dataset.titleFps = String(this.fps);
    root.dataset.titleRenderer =
      this.game.renderer.type === Phaser.WEBGL ? "webgl" : "canvas";
    root.dataset.titleWorldScale = this.world ? this.world.scaleX.toFixed(3) : "0";
    root.dataset.titlePulseAngle = this.pulse ? this.pulse.angle.toFixed(1) : "0";
  }

  private mountSector(sectorId: string) {
    this.mountedSectors.add(sectorId);
  }

  private setCameraMode(mode: WorldCameraMode) {
    this.cameraController.setMode(mode);
  }
}
