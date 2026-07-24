import Phaser from "phaser";

import { GameApplication } from "../../app/state/GameApplication";
import {
  PuzzleRun,
  type LockOutcome,
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
const CORE_GROWTH_DURATION = 960;
const BLOCK_FADE_DURATION = 4000;
const HARVEST_IMPACT_DURATION = 744;
const HARVEST_FALL_DURATION = 840;
const HARVEST_DUD_INTERVAL = 40;
const HARVEST_DUD_TRAVEL_DURATION = 340;
const HARVEST_CHARGE_INTERVAL = 216;
const HARVEST_CHARGE_TRAVEL_DURATION = 456;
const HARVEST_RETURN_DURATION = 1020;
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

interface PuzzleCellPalette {
  core: number;
  edge: number;
  glow: number;
  panelA: number;
  panelMid: number;
  panelB: number;
  shellA: number;
  shellMid: number;
  shellB: number;
  sparkle: number;
}

function getPuzzleCellPalette(
  color: PieceColor,
  influenced: boolean,
): PuzzleCellPalette {
  if (influenced) {
    return color === "cyan"
      ? {
          core: 0xc3ccd3,
          edge: 0xd8e0e6,
          glow: 0xeef4f8,
          panelA: 0x98a1a8,
          panelMid: 0x848b91,
          panelB: 0x707880,
          shellA: 0x2b3037,
          shellMid: 0x21262b,
          shellB: 0x171b20,
          sparkle: 0xe6edf2,
        }
      : {
          core: 0x8a9097,
          edge: 0xbcc2c7,
          glow: 0xd7dde2,
          panelA: 0x666c73,
          panelMid: 0x565b62,
          panelB: 0x464b51,
          shellA: 0x262a2f,
          shellMid: 0x1d2125,
          shellB: 0x14181c,
          sparkle: 0xd6dce0,
        };
  }

  return color === "cyan"
    ? {
        core: 0xf8fdff,
        edge: COLORS.cyanEdge,
        glow: 0xd4fbff,
        panelA: 0x72cef2,
        panelMid: 0x4fa7ce,
        panelB: 0x2c80a9,
        shellA: 0x10293e,
        shellMid: 0x0c1d2d,
        shellB: 0x08121c,
        sparkle: 0xe6fbff,
      }
    : {
        core: 0xfff7fb,
        edge: COLORS.magentaEdge,
        glow: 0xffd1e6,
        panelA: 0xf06e9d,
        panelMid: 0xbf4f79,
        panelB: 0x8e2f56,
        shellA: 0x351322,
        shellMid: 0x26101a,
        shellB: 0x170911,
        sparkle: 0xffe3f0,
      };
}

type WorldPhase =
  | "title"
  | "launching"
  | "playing"
  | "paused"
  | "harvesting";
type HarvestPhase = "impact" | "fall" | "duds" | "charges" | "return";
export type PuzzleAction =
  | "left"
  | "right"
  | "rotate"
  | "softDrop"
  | "hardDrop"
  | "pause"
  | "restart";

interface LogoCell {
  color: "cyan" | "magenta";
  seed: number;
  x: number;
  y: number;
}

interface Point {
  x: number;
  y: number;
}

interface HarvestSequence {
  readonly id: string;
  readonly harvest: ReturnType<PuzzleRun["createHarvest"]>;
  readonly startingDuds: number;
  readonly startingCharges: number;
  phase: HarvestPhase;
  phaseElapsed: number;
  displayedDuds: number;
  displayedCharges: number;
}

interface HarvestTargets {
  readonly charges: Readonly<Point>;
  readonly duds: Readonly<Point>;
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

function hashUnit(value: number): number {
  const wave = Math.sin(value * 12.9898) * 43758.5453;
  return wave - Math.floor(wave);
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
  onLaunchProgress: ((progress: number) => void) | null = null;
  onPulseChargesChanged: ((charges: number) => void) | null = null;
  onDudsChanged: ((duds: number) => void) | null = null;
  onStatusChanged: ((status: string) => void) | null = null;
  resolveHarvestTargets: (() => HarvestTargets | null) | null = null;

  private readonly cameraController = new WorldCameraController("title-closeup");
  private readonly mountedSectors = new Set<string>();
  private world!: Phaser.GameObjects.Container;
  private pulseSector!: Phaser.GameObjects.Container;
  private structureContainer!: Phaser.GameObjects.Container;
  private grid!: Phaser.GameObjects.Graphics;
  private coreFieldGraphics!: Phaser.GameObjects.Graphics;
  private structureGraphics!: Phaser.GameObjects.Graphics;
  private coreGrowthGraphics!: Phaser.GameObjects.Graphics;
  private harvestGraphics!: Phaser.GameObjects.Graphics;
  private harvestLabel!: Phaser.GameObjects.Text;
  private pauseLabel!: Phaser.GameObjects.Text;
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
  private letterKeys!: Record<
    | "left"
    | "right"
    | "rotateW"
    | "rotateX"
    | "softDrop",
    Phaser.Input.Keyboard.Key
  >;
  private horizontalDirection = 0;
  private horizontalRepeatElapsed = 0;
  private rotationElapsed = 0;
  private coreGrowthElapsed = CORE_GROWTH_DURATION;
  private coreGrowthBoundaryHalf = 0;
  private coreGrowthParticleCount = 0;
  private harvestSequence: HarvestSequence | null = null;
  private harvestTargets: HarvestTargets = {
    charges: { x: -285, y: 340 },
    duds: { x: 285, y: 340 },
  };

  constructor(private readonly application: GameApplication) {
    super("World");
  }

  private get phase(): WorldPhase {
    return this.application.mode;
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
    this.coreFieldGraphics = this.add.graphics();
    this.structureGraphics = this.add.graphics();
    this.coreGrowthGraphics = this.add.graphics();
    this.harvestGraphics = this.add.graphics();
    this.pieceGraphics = this.add.graphics();
    this.previewGraphics = this.add.graphics();
    this.previewLabel = this.add.text(250, -347, "Next piece", {
      color: "#eef7ff",
      fontFamily: '"Segoe UI", Helvetica, Arial, sans-serif',
      fontSize: "14px",
      fontStyle: "bold",
    });
    this.previewLabel.setVisible(false);
    this.harvestLabel = this.add.text(0, -270, "CAPACITY REACHED", {
      color: "#f8fdff",
      fontFamily: '"Segoe UI", Helvetica, Arial, sans-serif',
      fontSize: "24px",
      fontStyle: "bold",
      letterSpacing: 2,
    });
    this.harvestLabel.setOrigin(0.5);
    this.harvestLabel.setBackgroundColor("rgba(7, 19, 29, 0.92)");
    this.harvestLabel.setPadding(14, 8);
    this.harvestLabel.setVisible(false);
    this.pauseLabel = this.add.text(0, 0, "PAUSED\nPress P to resume", {
      align: "center",
      color: "#f8fdff",
      fontFamily: '"Segoe UI", Helvetica, Arial, sans-serif',
      fontSize: "24px",
      fontStyle: "bold",
      lineSpacing: 8,
    });
    this.pauseLabel.setOrigin(0.5);
    this.pauseLabel.setBackgroundColor("rgba(7, 19, 29, 0.94)");
    this.pauseLabel.setPadding(22, 16);
    this.pauseLabel.setVisible(false);
    this.pulse = createPulse(this);
    this.structureContainer.add([
      this.coreFieldGraphics,
      this.structureGraphics,
      this.coreGrowthGraphics,
      this.pulse,
    ]);
    this.createParticles();
    this.pulseSector.add([
      this.grid,
      this.structureContainer,
      this.pieceGraphics,
      this.previewGraphics,
      this.previewLabel,
      this.harvestGraphics,
      this.harvestLabel,
      this.pauseLabel,
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
    } else if (this.phase === "harvesting") {
      for (const particle of this.particles) particle.setVisible(false);
      this.updateHarvest(delta);
    } else if (this.phase === "paused") {
      for (const particle of this.particles) particle.setVisible(false);
    } else {
      for (const particle of this.particles) particle.setVisible(false);
      this.updateCoreGrowth(delta);
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
    if (!this.application.beginLaunch()) return false;

    this.setCameraMode("guided-pullback");
    this.launchElapsed = 0;
    this.settleDegrees = Math.round(this.titleSpinDegrees / 90) * 90;
    this.publishDiagnostics();
    return true;
  }

  act(action: PuzzleAction): boolean {
    if (action === "pause") return this.togglePause();
    if (action === "restart") return this.restartRun();
    if (this.phase !== "playing" || this.puzzle.pendingRotation) return false;

    let changed = false;
    let outcome: LockOutcome | null = null;
    if (action === "left") changed = this.puzzle.move(-1, 0);
    if (action === "right") changed = this.puzzle.move(1, 0);
    if (action === "rotate") changed = this.puzzle.rotate();
    if (action === "softDrop") changed = this.puzzle.move(0, 1);
    if (action === "hardDrop") {
      outcome = this.puzzle.hardDrop();
      changed = outcome !== null;
    }
    this.consumeCoreGrowth();
    if (outcome === "retried") {
      this.onStatusChanged?.("Missed the stack");
    }
    if (outcome === "capacity") {
      this.startHarvest();
      return true;
    }
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

    if (!this.application.completeLaunch()) return;
    this.setCameraMode("puzzle");
    this.world.setScale(1);
    this.grid.setAlpha(1);
    this.pulse.setScale(1);
    this.pulse.setAngle(0);
    this.logo.setVisible(false);
    this.puzzle.start();
    this.onStatusChanged?.("");
    this.onPulseChargesChanged?.(this.puzzle.pulseCharges);
    this.previewLabel.setVisible(true);
    this.renderPuzzle();
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

  private togglePause(): boolean {
    const mode = this.application.togglePause();
    if (mode === "paused") {
      this.pauseLabel.setVisible(true);
      this.onStatusChanged?.("Paused");
      this.publishDiagnostics();
      return true;
    }
    if (mode === "playing") {
      this.pauseLabel.setVisible(false);
      this.onStatusChanged?.("");
      this.publishDiagnostics();
      return true;
    }
    return false;
  }

  private restartRun(): boolean {
    if (!this.application.restartRun()) return false;

    this.puzzle = new PuzzleRun();
    this.puzzle.start();
    this.harvestSequence = null;
    this.coreGrowthElapsed = CORE_GROWTH_DURATION;
    this.horizontalDirection = 0;
    this.horizontalRepeatElapsed = 0;
    this.rotationElapsed = 0;
    this.world.setScale(1);
    this.grid.setAlpha(1);
    this.structureContainer.setAngle(0);
    this.pulse.setScale(1);
    this.pulse.setAngle(0);
    this.logo.setVisible(false);
    this.previewLabel.setVisible(true);
    this.harvestLabel.setVisible(false);
    this.pauseLabel.setVisible(false);
    this.onPulseChargesChanged?.(0);
    this.onDudsChanged?.(this.application.inventory.duds);
    this.onStatusChanged?.("");
    this.setCameraMode("puzzle");
    this.renderPuzzle();
    this.publishDiagnostics();
    return true;
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

    let outcome: LockOutcome | null = null;
    if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
      outcome = this.puzzle.hardDrop();
    } else {
      outcome = this.puzzle.advance(delta, {
        softDrop:
          this.cursors.down.isDown || this.letterKeys.softDrop.isDown,
      });
    }

    this.consumeCoreGrowth();
    if (outcome === "retried") {
      this.onStatusChanged?.("Missed the stack");
    }
    if (outcome === "capacity") {
      this.startHarvest();
      return;
    }
    this.updateBlockAges(delta);
    this.renderPuzzle();
  }

  private renderPuzzle() {
    if (
      !this.structureGraphics ||
      !this.coreFieldGraphics ||
      !this.coreGrowthGraphics ||
      !this.pieceGraphics ||
      !this.previewGraphics
    ) {
      return;
    }

    this.structureGraphics.clear();
    this.pieceGraphics.clear();
    this.previewGraphics.clear();
    if (this.phase !== "playing") return;

    this.drawCoreField();

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
        const influenced =
          this.puzzle.coreLayers > 0 &&
          Math.max(
            Math.abs(x - this.puzzle.center),
            Math.abs(y - this.puzzle.center),
          ) <= this.puzzle.coreLayers;
        const shake = influenced
          ? this.influenceShake(x, y)
          : { x: 0, y: 0 };
        const fade = this.blockFade(x, y);
        const alpha = influenced ? Math.max(0.68, fade * 0.82) : fade;
        this.drawPuzzleCell(
          this.structureGraphics,
          x + shake.x / CELL_SIZE,
          y + shake.y / CELL_SIZE,
          block.color === "magenta" ? "magenta" : "cyan",
          alpha,
          false,
          CELL_SIZE,
          influenced,
        );
      }
    }
    this.drawMassOutline();

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

  private updateBlockAges(delta: number) {
    for (const row of this.puzzle.board) {
      for (const block of row) {
        if (!block || block.seed) continue;
        if (block.placementId === this.puzzle.lockSequence) continue;
        const age = typeof block.age === "number" ? block.age : 0;
        block.age = Math.min(12000, age + delta);
      }
    }
  }

  private blockFade(x: number, y: number): number {
    const block = this.puzzle.board[y]?.[x];
    const age =
      block && typeof block.age === "number" ? block.age : 1000;
    const distance = Math.max(
      Math.abs(x - this.puzzle.center),
      Math.abs(y - this.puzzle.center),
    );
    if (distance <= this.puzzle.coreLayers) return 1;
    const target =
      distance <= this.puzzle.coreLayers + 2 ? 0.42 : 0.14;
    const progress = Phaser.Math.Clamp(age / BLOCK_FADE_DURATION, 0, 1);
    return Phaser.Math.Linear(1, target, progress);
  }

  private influenceShake(x: number, y: number) {
    const time = this.elapsed / 1000;
    const seed = hashUnit(x * 12.9898 + y * 78.233);
    const window = Math.floor(time * 3.2 + seed * 9.7);
    const active = hashUnit(window * 19.17 + seed * 41.83);
    if (active < 0.9) return { x: 0, y: 0 };
    const strength =
      0.088 + hashUnit(window * 7.31 + seed * 29.7) * 0.264;
    return {
      x: Math.sin(time * 33 + seed * 40) * strength,
      y: Math.cos(time * 29 + seed * 35) * strength * 0.82,
    };
  }

  private drawMassOutline() {
    const graphics = this.structureGraphics;
    const board = this.puzzle.board;
    const half = CELL_SIZE / 2 - 1.5;

    for (let y = 0; y < this.puzzle.size; y += 1) {
      for (let x = 0; x < this.puzzle.size; x += 1) {
        const block = board[y][x];
        if (!block || block.seed) continue;
        const left = x > 0 ? board[y][x - 1] : null;
        const right = x < this.puzzle.size - 1 ? board[y][x + 1] : null;
        const up = y > 0 ? board[y - 1][x] : null;
        const down = y < this.puzzle.size - 1 ? board[y + 1][x] : null;
        if (left && right && up && down) continue;

        const centerX = (x - this.puzzle.center) * CELL_SIZE;
        const centerY = (y - this.puzzle.center) * CELL_SIZE;
        const edge =
          block.color === "magenta" ? COLORS.magentaEdge : COLORS.cyanEdge;
        graphics.lineStyle(4, edge, 1);
        if (!up) {
          graphics.lineBetween(
            centerX - half,
            centerY - half,
            centerX + half,
            centerY - half,
          );
        }
        if (!right) {
          graphics.lineBetween(
            centerX + half,
            centerY - half,
            centerX + half,
            centerY + half,
          );
        }
        if (!down) {
          graphics.lineBetween(
            centerX - half,
            centerY + half,
            centerX + half,
            centerY + half,
          );
        }
        if (!left) {
          graphics.lineBetween(
            centerX - half,
            centerY - half,
            centerX - half,
            centerY + half,
          );
        }
      }
    }
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

  private startHarvest() {
    if (this.phase !== "playing" || this.harvestSequence) return;

    const id = this.application.createHarvestId();
    if (!id) return;
    const harvest = this.puzzle.createHarvest(id);
    this.harvestTargets = this.resolveHarvestTargets?.() ?? this.harvestTargets;
    const transaction = this.application.beginHarvest(harvest.result);
    if (!transaction) return;
    const startingDuds = transaction.before.duds;
    const startingCharges = transaction.before.pulseCharges;
    this.harvestSequence = {
      id,
      harvest,
      startingDuds,
      startingCharges,
      phase: "impact",
      phaseElapsed: 0,
      displayedDuds: startingDuds,
      displayedCharges: startingCharges,
    };
    this.previewLabel.setVisible(false);
    this.pauseLabel.setVisible(false);
    this.onStatusChanged?.("");
    this.onDudsChanged?.(startingDuds);
    this.onPulseChargesChanged?.(startingCharges);
    this.cameras.main.shake(260, 0.004);
    this.renderHarvest();
    this.publishDiagnostics();
  }

  private advanceHarvestPhase(phase: HarvestPhase) {
    if (!this.harvestSequence) return;
    this.harvestSequence.phase = phase;
    this.harvestSequence.phaseElapsed = 0;
  }

  private updateHarvest(delta: number) {
    const sequence = this.harvestSequence;
    if (!sequence) return;

    sequence.phaseElapsed += delta;

    if (
      sequence.phase === "impact" &&
      sequence.phaseElapsed >= HARVEST_IMPACT_DURATION
    ) {
      this.advanceHarvestPhase("fall");
    } else if (
      sequence.phase === "fall" &&
      sequence.phaseElapsed >= HARVEST_FALL_DURATION
    ) {
      if (sequence.harvest.dudCells.length > 0) {
        this.advanceHarvestPhase("duds");
      } else if (sequence.harvest.result.earned.pulseCharges > 0) {
        this.advanceHarvestPhase("charges");
      } else {
        this.advanceHarvestPhase("return");
      }
    } else if (sequence.phase === "duds") {
      const dudCount = sequence.harvest.dudCells.length;
      const arrived = Math.min(
        dudCount,
        Math.max(
          0,
          Math.floor(
            (sequence.phaseElapsed - HARVEST_DUD_TRAVEL_DURATION) /
              HARVEST_DUD_INTERVAL,
          ) + 1,
        ),
      );
      const displayed = sequence.startingDuds + arrived;
      if (displayed !== sequence.displayedDuds) {
        sequence.displayedDuds = displayed;
        this.onDudsChanged?.(displayed);
      }
      const duration =
        Math.max(0, dudCount - 1) * HARVEST_DUD_INTERVAL +
        HARVEST_DUD_TRAVEL_DURATION;
      if (sequence.phaseElapsed >= duration) {
        if (sequence.harvest.result.earned.pulseCharges > 0) {
          this.advanceHarvestPhase("charges");
        } else {
          this.advanceHarvestPhase("return");
        }
      }
    } else if (sequence.phase === "charges") {
      const chargeCount = sequence.harvest.result.earned.pulseCharges;
      const arrived = Math.min(
        chargeCount,
        Math.max(
          0,
          Math.floor(
            (sequence.phaseElapsed - HARVEST_CHARGE_TRAVEL_DURATION) /
              HARVEST_CHARGE_INTERVAL,
          ) + 1,
        ),
      );
      const displayed = sequence.startingCharges + arrived;
      if (displayed !== sequence.displayedCharges) {
        sequence.displayedCharges = displayed;
        this.onPulseChargesChanged?.(displayed);
      }
      const duration =
        Math.max(0, chargeCount - 1) * HARVEST_CHARGE_INTERVAL +
        HARVEST_CHARGE_TRAVEL_DURATION;
      if (sequence.phaseElapsed >= duration) {
        this.advanceHarvestPhase("return");
      }
    } else if (
      sequence.phase === "return" &&
      sequence.phaseElapsed >= HARVEST_RETURN_DURATION
    ) {
      this.finishHarvest();
      return;
    }

    this.renderHarvest();
    this.publishDiagnostics();
  }

  private renderHarvest() {
    const sequence = this.harvestSequence;
    if (!sequence) return;

    this.coreFieldGraphics.clear();
    this.structureGraphics.clear();
    this.coreGrowthGraphics.clear();
    this.pieceGraphics.clear();
    this.previewGraphics.clear();
    this.harvestGraphics.clear();

    const phase = sequence.phase;
    const phaseElapsed = sequence.phaseElapsed;
    const impactProgress = Phaser.Math.Clamp(
      phaseElapsed / HARVEST_IMPACT_DURATION,
      0,
      1,
    );
    const impactPulse =
      phase === "impact" ? Math.sin(impactProgress * Math.PI) : 0;
    this.world.setScale(1 + impactPulse * 0.08);
    this.harvestLabel.setVisible(phase === "impact" || phase === "fall");
    this.harvestLabel.setAlpha(
      phase === "fall"
        ? 1 -
            Phaser.Math.Clamp(phaseElapsed / HARVEST_FALL_DURATION, 0, 1)
        : 1,
    );

    if (phase === "impact" || phase === "fall") {
      this.drawCoreField();
      for (const cell of sequence.harvest.dudCells) {
        this.drawHarvestCell(cell.x, cell.y, cell.color, 1, CELL_SIZE, true);
      }

      const fallProgress =
        phase === "fall"
          ? Phaser.Math.Clamp(phaseElapsed / HARVEST_FALL_DURATION, 0, 1)
          : 0;
      const easedFall = fallProgress * fallProgress;
      for (const cell of sequence.harvest.outerCells) {
        const drift =
          (hashUnit(cell.x * 17.13 + cell.y * 11.7) - 0.5) * 1.9;
        const distance =
          9 + hashUnit(cell.x * 8.9 + cell.y * 3.7) * 7;
        this.drawHarvestCell(
          cell.x + drift * easedFall,
          cell.y + distance * easedFall,
          cell.color,
          1 - fallProgress,
        );
      }
      return;
    }

    if (phase === "duds") {
      const { x: targetX, y: targetY } = this.harvestTargets.duds;
      sequence.harvest.dudCells.forEach((cell, index) => {
        const localTime = phaseElapsed - index * HARVEST_DUD_INTERVAL;
        if (localTime < 0) {
          this.drawHarvestCell(cell.x, cell.y, cell.color, 1, CELL_SIZE, true);
          return;
        }
        if (localTime >= HARVEST_DUD_TRAVEL_DURATION) return;

        const progress = Phaser.Math.Clamp(
          localTime / HARVEST_DUD_TRAVEL_DURATION,
          0,
          1,
        );
        const eased = Phaser.Math.Easing.Cubic.In(progress);
        const startX = (cell.x - this.puzzle.center) * CELL_SIZE;
        const startY = (cell.y - this.puzzle.center) * CELL_SIZE;
        const x = Phaser.Math.Linear(startX, targetX, eased);
        const y = Phaser.Math.Linear(startY, targetY, eased);
        this.drawHarvestPixel(
          x,
          y,
          cell.color,
          1 - progress * 0.28,
          Phaser.Math.Linear(CELL_SIZE, 8, progress),
          true,
        );
      });
      return;
    }

    if (phase === "charges") {
      const { x: targetX, y: targetY } = this.harvestTargets.charges;
      const chargeCount = sequence.harvest.result.earned.pulseCharges;
      for (let index = 0; index < chargeCount; index += 1) {
        const localTime = phaseElapsed - index * HARVEST_CHARGE_INTERVAL;
        if (
          localTime < 0 ||
          localTime >= HARVEST_CHARGE_TRAVEL_DURATION
        ) {
          continue;
        }
        const progress = Phaser.Math.Clamp(
          localTime / HARVEST_CHARGE_TRAVEL_DURATION,
          0,
          1,
        );
        const eased = Phaser.Math.Easing.Cubic.InOut(progress);
        const x = Phaser.Math.Linear(0, targetX, eased);
        const y = Phaser.Math.Linear(0, targetY, eased);
        const radius = Phaser.Math.Linear(6, 3, progress);
        this.harvestGraphics.fillStyle(0xf2d27a, 1 - progress * 0.2);
        this.harvestGraphics.fillCircle(x, y, radius);
        this.harvestGraphics.lineStyle(2, 0xffffff, 0.42 * (1 - progress));
        this.harvestGraphics.lineBetween(0, 0, x, y);
      }
    }
  }

  private drawHarvestCell(
    gridX: number,
    gridY: number,
    color: unknown,
    alpha = 1,
    size = CELL_SIZE,
    influenced = false,
  ) {
    const x = (gridX - this.puzzle.center) * CELL_SIZE;
    const y = (gridY - this.puzzle.center) * CELL_SIZE;
    this.drawHarvestPixel(x, y, color, alpha, size, influenced);
  }

  private drawHarvestPixel(
    x: number,
    y: number,
    color: unknown,
    alpha: number,
    size: number,
    influenced: boolean,
  ) {
    const gridX = this.puzzle.center + x / CELL_SIZE;
    const gridY = this.puzzle.center + y / CELL_SIZE;
    this.drawPuzzleCell(
      this.harvestGraphics,
      gridX,
      gridY,
      color === "magenta" ? "magenta" : "cyan",
      alpha,
      false,
      size,
      influenced,
    );
  }

  private finishHarvest() {
    if (!this.application.completeHarvest()) return;
    this.harvestSequence = null;
    this.puzzle = new PuzzleRun();
    this.coreGrowthElapsed = CORE_GROWTH_DURATION;
    this.world.setScale(IDLE_ZOOM);
    this.grid.setAlpha(IDLE_GRID_ALPHA);
    this.structureContainer.setAngle(0);
    this.pulse.setScale(IDLE_PULSE_SCALE);
    this.pulse.setAngle(this.titleSpinDegrees);
    this.logo.setVisible(true);
    this.logo.setAlpha(1);
    this.logo.y = 0;
    this.previewLabel.setVisible(false);
    this.harvestLabel.setVisible(false);
    this.pauseLabel.setVisible(false);
    this.coreFieldGraphics.clear();
    this.structureGraphics.clear();
    this.coreGrowthGraphics.clear();
    this.pieceGraphics.clear();
    this.previewGraphics.clear();
    this.harvestGraphics.clear();
    this.setCameraMode("title-closeup");
    this.onStatusChanged?.("");
    this.publishDiagnostics();
  }

  private consumeCoreGrowth() {
    const growth = this.puzzle.takeCoreGrowth();
    if (!growth) return;

    this.coreGrowthElapsed = 0;
    this.coreGrowthBoundaryHalf =
      ((growth.coreLayers * 2 + 1) * CELL_SIZE) / 2 + CELL_SIZE * 1.25;
    this.coreGrowthParticleCount = 14 + growth.gainedLayers * 10;
    this.onPulseChargesChanged?.(growth.pulseCharges);
    this.publishDiagnostics();
  }

  private updateCoreGrowth(delta: number) {
    if (this.coreGrowthElapsed >= CORE_GROWTH_DURATION) {
      this.coreGrowthGraphics.clear();
      this.pulse.setScale(1);
      return;
    }

    this.coreGrowthElapsed = Math.min(
      CORE_GROWTH_DURATION,
      this.coreGrowthElapsed + delta,
    );
    const progress = this.coreGrowthElapsed / CORE_GROWTH_DURATION;
    const pulse = Math.sin(progress * Math.PI);
    this.pulse.setScale(1 + pulse * 0.22);
    this.drawCoreGrowthParticles(progress);
    this.drawCoreField();
    this.publishDiagnostics();
  }

  private drawCoreField() {
    const graphics = this.coreFieldGraphics;
    graphics.clear();
    if (this.puzzle.coreLayers <= 0) return;

    const fieldSize =
      (this.puzzle.coreLayers * 2 + 1) * CELL_SIZE - 3;
    const fieldHalf = fieldSize / 2;
    const growthProgress =
      this.coreGrowthElapsed < CORE_GROWTH_DURATION
        ? this.coreGrowthElapsed / CORE_GROWTH_DURATION
        : 1;
    const growthPulse =
      this.coreGrowthElapsed < CORE_GROWTH_DURATION
        ? Math.sin(growthProgress * Math.PI)
        : 0;

    graphics.fillStyle(0x03080e, 0.24 + growthPulse * 0.1);
    graphics.fillRoundedRect(
      -fieldHalf,
      -fieldHalf,
      fieldSize,
      fieldSize,
      4,
    );
    graphics.lineStyle(4, 0x0a121c, 0.34 + growthPulse * 0.2);
    graphics.strokeRoundedRect(
      -fieldHalf + 4,
      -fieldHalf + 4,
      fieldSize - 8,
      fieldSize - 8,
      2,
    );
    graphics.lineStyle(2, COLORS.white, 0.5 + growthPulse * 0.42);
    graphics.strokeRoundedRect(
      -fieldHalf + 4,
      -fieldHalf + 4,
      fieldSize - 8,
      fieldSize - 8,
      2,
    );
  }

  private drawCoreGrowthParticles(progress: number) {
    const graphics = this.coreGrowthGraphics;
    graphics.clear();
    const eased = progress * progress * progress;
    const alpha = 1 - progress;
    const startHalf = this.coreGrowthBoundaryHalf;

    for (let index = 0; index < this.coreGrowthParticleCount; index += 1) {
      const side = index % 4;
      const sideIndex = Math.floor(index / 4);
      const sideCount = Math.ceil(this.coreGrowthParticleCount / 4);
      const unit = (sideIndex + 0.5) / sideCount;
      const offset = Phaser.Math.Linear(-startHalf, startHalf, unit);
      const startX = side === 0 ? -startHalf : side === 1 ? startHalf : offset;
      const startY = side === 2 ? -startHalf : side === 3 ? startHalf : offset;
      const x = Phaser.Math.Linear(startX, 0, eased);
      const y = Phaser.Math.Linear(startY, 0, eased);
      const radius = Phaser.Math.Linear(3.2, 1, progress);

      graphics.lineStyle(Math.max(1, radius * 0.8), COLORS.white, alpha * 0.24);
      graphics.lineBetween(startX, startY, x, y);
      graphics.fillStyle(COLORS.white, alpha * 0.94);
      graphics.fillCircle(x, y, radius);
    }
  }

  private drawPuzzleCell(
    graphics: Phaser.GameObjects.Graphics,
    gridX: number,
    gridY: number,
    color: PieceColor,
    alpha = 1,
    ghost = false,
    size = CELL_SIZE,
    influenced = false,
  ) {
    const x = (gridX - this.puzzle.center) * CELL_SIZE;
    const y = (gridY - this.puzzle.center) * CELL_SIZE;
    const half = size / 2;

    if (ghost) {
      graphics.fillStyle(COLORS.white, alpha * 0.38);
      graphics.fillRoundedRect(x - half + 2, y - half + 2, size - 4, size - 4, 3);
      graphics.lineStyle(2, COLORS.white, alpha * 0.8);
      graphics.strokeRoundedRect(x - half + 2, y - half + 2, size - 4, size - 4, 3);
      return;
    }

    const palette = getPuzzleCellPalette(color, influenced);
    const seed =
      gridX * 0.73 +
      gridY * 1.17 +
      (color === "cyan" ? (influenced ? 0.18 : 0.12) : influenced ? 0.48 : 0.41);
    const flickerWave = 0.55 + 0.45 * Math.sin((this.elapsed / 1000) * 11 + seed * 6.2);
    const shimmerWave = 0.55 + 0.45 * Math.sin((this.elapsed / 1000) * 7.5 + seed * 9.7);
    const lightAlpha = alpha * (influenced ? 0.18 : 0.2 + flickerWave * 0.34);
    const coreAlpha = alpha * (influenced ? 0.44 : 0.46 + flickerWave * 0.28);
    const edgeAlpha = alpha * (influenced ? 0.7 : 0.64 + shimmerWave * 0.2);
    const radius = Math.min(3.4, size * 0.14);
    const shellInset = size * 0.02;
    const panelInset = size * 0.065;
    const lightInset = size * 0.16;
    const coreInset = size * 0.24;
    const shellSize = size - shellInset * 2;
    const panelSize = size - panelInset * 2;
    const lightSize = size - lightInset * 2;
    const coreSize = size - coreInset * 2;

    graphics.fillGradientStyle(
      palette.shellA,
      palette.shellMid,
      palette.shellMid,
      palette.shellB,
      alpha,
      alpha,
      alpha,
      alpha,
    );
    graphics.fillRoundedRect(
      x - half + shellInset,
      y - half + shellInset,
      shellSize,
      shellSize,
      radius,
    );

    graphics.fillGradientStyle(
      palette.panelA,
      palette.panelMid,
      palette.panelMid,
      palette.panelB,
      alpha * 0.98,
      alpha * 0.97,
      alpha * 0.97,
      alpha * 0.96,
    );
    graphics.fillRoundedRect(
      x - half + panelInset,
      y - half + panelInset,
      panelSize,
      panelSize,
      radius * 0.82,
    );
    graphics.lineStyle(Math.max(0.9, size * 0.08), palette.edge, edgeAlpha * 0.9);
    graphics.strokeRoundedRect(
      x - half + panelInset,
      y - half + panelInset,
      panelSize,
      panelSize,
      radius * 0.82,
    );

    graphics.fillStyle(COLORS.white, alpha * 0.06);
    graphics.fillRoundedRect(
      x - half + panelInset + 1.2,
      y - half + panelInset + 1.2,
      panelSize * 0.52,
      Math.max(2, panelSize * 0.12),
      1.1,
    );

    graphics.fillGradientStyle(
      COLORS.white,
      palette.glow,
      palette.glow,
      palette.glow,
      lightAlpha,
      lightAlpha * 0.78,
      lightAlpha * 0.78,
      lightAlpha * 0.52,
    );
    graphics.fillRoundedRect(
      x - half + lightInset,
      y - half + lightInset,
      lightSize,
      lightSize,
      radius * 0.58,
    );

    graphics.fillGradientStyle(
      COLORS.white,
      palette.core,
      palette.core,
      palette.core,
      coreAlpha,
      coreAlpha * 0.86,
      coreAlpha * 0.86,
      coreAlpha,
    );
    graphics.fillRoundedRect(
      x - half + coreInset,
      y - half + coreInset,
      coreSize,
      coreSize,
      radius * 0.42,
    );

    const sparkle = influenced ? 0 : Phaser.Math.Clamp((1 - alpha) * 1.4, 0, 0.42);
    if (sparkle > 0.01) {
      const sparkleAlpha = alpha * sparkle * 0.28;
      graphics.fillStyle(palette.sparkle, sparkleAlpha);
      graphics.fillCircle(
        x + (-0.18 + hashUnit(seed * 14.7) * 0.38) * size,
        y + (-0.16 + hashUnit(seed * 22.1) * 0.36) * size,
        size * (0.11 + hashUnit(seed * 31.4) * 0.06),
      );
      graphics.fillStyle(palette.sparkle, sparkleAlpha * 0.72);
      graphics.fillCircle(
        x + (0.08 + hashUnit(seed * 41.8) * 0.26) * size,
        y + (0.02 + hashUnit(seed * 53.2) * 0.28) * size,
        size * (0.06 + hashUnit(seed * 63.6) * 0.04),
      );
    }
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
    root.dataset.applicationMode = this.application.mode;
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
    root.dataset.worldPuzzleCoreLayers = String(this.puzzle.coreLayers);
    root.dataset.worldPuzzlePulseCharges = String(this.puzzle.pulseCharges);
    root.dataset.worldPuzzleCoreGrowthActive = String(
      this.coreGrowthElapsed < CORE_GROWTH_DURATION,
    );
    root.dataset.worldHarvestPhase = this.harvestSequence?.phase ?? "";
    root.dataset.worldBankedDuds = String(this.application.inventory.duds);
    root.dataset.worldBankedPulseCharges = String(
      this.application.inventory.pulseCharges,
    );
    root.dataset.worldHarvestChargeTarget = `${this.harvestTargets.charges.x.toFixed(1)},${this.harvestTargets.charges.y.toFixed(1)}`;
    root.dataset.worldHarvestDudTarget = `${this.harvestTargets.duds.x.toFixed(1)},${this.harvestTargets.duds.y.toFixed(1)}`;
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
