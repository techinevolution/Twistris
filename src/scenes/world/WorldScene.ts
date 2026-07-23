import Phaser from "phaser";

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

type TitlePhase = "title" | "launching" | "playing-preview";

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

  private phase: TitlePhase = "title";
  private readonly cameraController = new WorldCameraController("title-closeup");
  private readonly mountedSectors = new Set<string>();
  private world!: Phaser.GameObjects.Container;
  private pulseSector!: Phaser.GameObjects.Container;
  private grid!: Phaser.GameObjects.Graphics;
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
    this.pulse = createPulse(this);
    this.createParticles();
    this.pulseSector.add([this.grid, ...this.particles, this.pulse]);
    this.world.add(this.pulseSector);
    this.mountSector("pulse");
    this.world.setScale(IDLE_ZOOM);
    this.grid.setAlpha(IDLE_GRID_ALPHA);
    this.pulse.setScale(IDLE_PULSE_SCALE);
    this.logo = this.createLogo();
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

    this.phase = "playing-preview";
    this.setCameraMode("pulse-home");
    this.world.setScale(1);
    this.grid.setAlpha(1);
    this.pulse.setScale(1);
    this.pulse.setAngle(0);
    this.logo.setVisible(false);
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
