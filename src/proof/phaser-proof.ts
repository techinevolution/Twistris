import Phaser from "phaser";

const STAGE_SIZE = 800;
const CELL_SIZE = 34;
const COLORS = {
  bg: 0x091723,
  panel: 0x0d1c29,
  grid: 0x7d9bb2,
  cyan: 0x4aa8d8,
  cyanEdge: 0x8fe6ff,
  magenta: 0xc63a62,
  magentaEdge: 0xff9ac3,
  white: 0xf8fdff,
  copper: 0xb76b42,
  copperGlow: 0xf0a36d,
};

type ProofState = "ready" | "walking" | "installed";
type ProofAction = "left" | "right" | "rotate" | "trigger";

interface ProofSnapshot {
  state: ProofState;
  fps: number;
  fallingPiece: {
    angle: number;
    x: number;
    y: number;
  };
  walkingBit: {
    visible: boolean;
    x: number;
    y: number;
  };
}

interface ProofApi {
  act(action: ProofAction): void;
  snapshot(): ProofSnapshot | null;
}

declare global {
  interface Window {
    __TWISTRIS_PHASER_PROOF__: ProofApi;
  }
}

function createCellGraphic(
  scene: Phaser.Scene,
  color: number,
  edge: number,
  size = CELL_SIZE,
): Phaser.GameObjects.Graphics {
  const graphic = scene.add.graphics();
  const half = size / 2;

  graphic.fillStyle(COLORS.panel, 1);
  graphic.fillRoundedRect(-half, -half, size, size, 5);
  graphic.fillStyle(color, 1);
  graphic.fillRoundedRect(-half + 3, -half + 3, size - 6, size - 6, 4);
  graphic.lineStyle(2, edge, 0.95);
  graphic.strokeRoundedRect(-half + 3, -half + 3, size - 6, size - 6, 4);
  graphic.fillStyle(COLORS.white, 0.42);
  graphic.fillRoundedRect(-half + 8, -half + 8, size - 16, size - 16, 3);
  graphic.fillStyle(COLORS.white, 0.2);
  graphic.fillRect(-half + 6, -half + 6, size * 0.45, 3);

  return graphic;
}

function createPulse(scene: Phaser.Scene): Phaser.GameObjects.Container {
  const container = scene.add.container(STAGE_SIZE / 2, STAGE_SIZE / 2);
  const plate = scene.add.graphics();

  plate.fillStyle(0x2f3546, 1);
  plate.fillRoundedRect(-58, -58, 116, 116, 12);
  plate.fillStyle(0x51586f, 1);
  plate.fillRoundedRect(-46, -46, 92, 92, 9);
  plate.lineStyle(2, 0xe6eeff, 0.18);
  plate.strokeRoundedRect(-46, -46, 92, 92, 9);
  plate.fillStyle(0x161926, 1);
  plate.fillRoundedRect(-31, -31, 62, 62, 7);

  const accents = scene.add.graphics();
  accents.lineStyle(6, 0x98edff, 1);
  accents.beginPath();
  accents.moveTo(-34, -22);
  accents.lineTo(-34, -34);
  accents.lineTo(-22, -34);
  accents.moveTo(34, 22);
  accents.lineTo(34, 34);
  accents.lineTo(22, 34);
  accents.strokePath();
  accents.lineStyle(6, 0xffadd6, 1);
  accents.beginPath();
  accents.moveTo(22, -34);
  accents.lineTo(34, -34);
  accents.lineTo(34, -22);
  accents.moveTo(-34, 22);
  accents.lineTo(-34, 34);
  accents.lineTo(-22, 34);
  accents.strokePath();

  const core = createCellGraphic(scene, 0xeef4ff, 0xffffff, 48);
  core.setName("pulse-core");

  container.add([plate, accents, core]);
  scene.tweens.add({
    targets: core,
    scale: 1.08,
    duration: 820,
    ease: "Sine.InOut",
    yoyo: true,
    repeat: -1,
  });

  return container;
}

function createTetromino(scene: Phaser.Scene): Phaser.GameObjects.Container {
  const piece = scene.add.container(STAGE_SIZE / 2, 92);
  const cells = [
    { x: -1, y: 0 },
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
  ];

  for (const cell of cells) {
    const graphic = createCellGraphic(scene, COLORS.magenta, COLORS.magentaEdge);
    graphic.setPosition(cell.x * CELL_SIZE, cell.y * CELL_SIZE);
    piece.add(graphic);
  }

  return piece;
}

function createWalkingBit(scene: Phaser.Scene) {
  const container = scene.add.container(474, 400);
  const cell = createCellGraphic(scene, COLORS.cyan, COLORS.cyanEdge, 30);
  const feet = scene.add.graphics();

  feet.fillStyle(0xb9efff, 1);
  feet.fillRoundedRect(-11, 15, 8, 7, 2);
  feet.fillRoundedRect(3, 15, 8, 7, 2);
  container.add([feet, cell]);
  container.setVisible(false);

  return { container, feet };
}

class PhaserProofScene extends Phaser.Scene {
  private state: ProofState = "ready";
  private fallingPiece!: Phaser.GameObjects.Container;
  private walkingBit!: Phaser.GameObjects.Container;
  private walkingFeet!: Phaser.GameObjects.Graphics;
  private pulse!: Phaser.GameObjects.Container;
  private socketGlow!: Phaser.GameObjects.Arc;
  private stateNode = document.querySelector<HTMLElement>("#proofState");
  private fpsNode = document.querySelector<HTMLElement>("#proofFps");
  private fpsSample = 60;
  private fpsElapsed = 0;
  private diagnosticsElapsed = 0;

  constructor() {
    super("PhaserProof");
  }

  create() {
    proofScene = this;
    this.cameras.main.setBackgroundColor(COLORS.bg);
    this.drawGrid();
    this.drawCopperTrace();
    this.drawSocket();

    this.pulse = createPulse(this);
    this.fallingPiece = createTetromino(this);
    const walking = createWalkingBit(this);
    this.walkingBit = walking.container;
    this.walkingFeet = walking.feet;

    this.startDropCycle();
    this.bindKeyboard();
    document.documentElement.dataset.proofCamera = "idle";
    this.publishState("ready");
  }

  update(_time: number, delta: number) {
    this.fpsElapsed += delta;
    this.diagnosticsElapsed += delta;

    if (this.diagnosticsElapsed >= 100) {
      this.diagnosticsElapsed = 0;
      this.publishDiagnostics();
    }

    if (this.fpsElapsed < 300) return;

    this.fpsElapsed = 0;
    this.fpsSample = Math.round(this.game.loop.actualFps || 0);
    if (this.fpsNode) {
      this.fpsNode.textContent = `${this.fpsSample} FPS`;
    }
    this.publishDiagnostics();
  }

  act(action: ProofAction) {
    if (action === "left") {
      this.movePiece(-1);
      return;
    }
    if (action === "right") {
      this.movePiece(1);
      return;
    }
    if (action === "rotate") {
      this.rotatePiece();
      return;
    }
    this.sendBit();
  }

  snapshot(): ProofSnapshot {
    return {
      state: this.state,
      fps: this.fpsSample,
      fallingPiece: {
        angle: this.fallingPiece.angle,
        x: Math.round(this.fallingPiece.x),
        y: Math.round(this.fallingPiece.y),
      },
      walkingBit: {
        visible: this.walkingBit.visible,
        x: Math.round(this.walkingBit.x),
        y: Math.round(this.walkingBit.y),
      },
    };
  }

  private drawGrid() {
    const grid = this.add.graphics();
    grid.lineStyle(1, COLORS.grid, 0.1);

    for (let offset = 76; offset <= STAGE_SIZE - 76; offset += CELL_SIZE) {
      grid.lineBetween(offset, 52, offset, STAGE_SIZE - 52);
      grid.lineBetween(52, offset, STAGE_SIZE - 52, offset);
    }
  }

  private drawCopperTrace() {
    const trace = this.add.graphics();
    const paths = [
      [
        { x: 342, y: 400 },
        { x: 132, y: 400 },
        { x: 132, y: 584 },
        { x: 236, y: 584 },
      ],
      [
        { x: 400, y: 342 },
        { x: 400, y: 158 },
        { x: 282, y: 158 },
      ],
      [
        { x: 400, y: 458 },
        { x: 400, y: 610 },
        { x: 516, y: 610 },
      ],
      [
        { x: 458, y: 400 },
        { x: 594, y: 400 },
      ],
    ];

    for (const path of paths) {
      trace.lineStyle(10, 0x101a23, 0.9);
      trace.beginPath();
      trace.moveTo(path[0].x, path[0].y);
      for (const point of path.slice(1)) {
        trace.lineTo(point.x, point.y);
      }
      trace.strokePath();

      trace.lineStyle(3, COLORS.copper, 0.85);
      trace.beginPath();
      trace.moveTo(path[0].x, path[0].y);
      for (const point of path.slice(1)) {
        trace.lineTo(point.x, point.y);
      }
      trace.strokePath();

      trace.lineStyle(1, COLORS.copperGlow, 0.5);
      trace.beginPath();
      trace.moveTo(path[0].x, path[0].y - 3);
      for (const point of path.slice(1)) {
        trace.lineTo(point.x, point.y - 3);
      }
      trace.strokePath();
    }
  }

  private drawSocket() {
    const socket = this.add.graphics();
    socket.fillStyle(0x0c141d, 1);
    socket.fillRoundedRect(594, 386, 52, 52, 7);
    socket.lineStyle(3, 0x778a99, 0.72);
    socket.strokeRoundedRect(598, 390, 44, 44, 5);
    socket.lineStyle(2, COLORS.copperGlow, 0.55);
    socket.lineBetween(576, 400, 594, 400);

    this.socketGlow = this.add.circle(620, 412, 26, COLORS.cyanEdge, 0);
    this.socketGlow.setStrokeStyle(3, COLORS.cyanEdge, 0);
  }

  private bindKeyboard() {
    this.input.keyboard?.on("keydown-LEFT", () => this.act("left"));
    this.input.keyboard?.on("keydown-A", () => this.act("left"));
    this.input.keyboard?.on("keydown-RIGHT", () => this.act("right"));
    this.input.keyboard?.on("keydown-D", () => this.act("right"));
    this.input.keyboard?.on("keydown-UP", () => this.act("rotate"));
    this.input.keyboard?.on("keydown-W", () => this.act("rotate"));
    this.input.keyboard?.on("keydown-SPACE", () => this.act("trigger"));
  }

  private startDropCycle() {
    this.fallingPiece.setPosition(STAGE_SIZE / 2, 92);
    this.tweens.add({
      targets: this.fallingPiece,
      y: 284,
      duration: 1750,
      ease: "Sine.In",
      onComplete: () => {
        this.triggerCameraResponse(150, 0.0045);
        this.time.delayedCall(520, () => this.startDropCycle());
      },
    });
  }

  private movePiece(direction: -1 | 1) {
    const destination = Phaser.Math.Clamp(
      this.fallingPiece.x + direction * CELL_SIZE,
      180,
      STAGE_SIZE - 180,
    );
    this.tweens.add({
      targets: this.fallingPiece,
      x: destination,
      duration: 90,
      ease: "Quad.Out",
    });
  }

  private rotatePiece() {
    this.tweens.add({
      targets: this.fallingPiece,
      angle: this.fallingPiece.angle + 90,
      duration: 150,
      ease: "Back.Out",
    });
  }

  private sendBit() {
    if (this.state !== "ready") return;

    this.publishState("walking");
    this.walkingBit.setVisible(true);
    this.walkingBit.setAlpha(1);
    this.walkingBit.setScale(1);
    this.walkingBit.setAngle(0);
    this.walkingBit.setPosition(474, 400);
    this.walkingFeet.setVisible(true);

    this.tweens.add({
      targets: this.walkingFeet,
      y: 3,
      duration: 95,
      ease: "Sine.InOut",
      yoyo: true,
      repeat: 7,
    });
    this.tweens.add({
      targets: this.walkingBit,
      x: 576,
      duration: 780,
      ease: "Sine.InOut",
      onComplete: () => this.hopIntoSocket(),
    });
  }

  private hopIntoSocket() {
    const startX = this.walkingBit.x;
    const startY = this.walkingBit.y;
    this.walkingFeet.setVisible(false);

    this.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 440,
      ease: "Sine.InOut",
      onUpdate: (tween) => {
        const progress = tween.getValue() ?? 0;
        this.walkingBit.x = Phaser.Math.Linear(startX, 620, progress);
        this.walkingBit.y = Phaser.Math.Linear(startY, 412, progress) - Math.sin(progress * Math.PI) * 64;
        this.walkingBit.angle = progress * 180;
      },
      onComplete: () => this.installBit(),
    });
  }

  private installBit() {
    this.publishState("installed");
    this.walkingBit.setPosition(620, 412);
    this.walkingBit.setAngle(0);
    this.walkingBit.setScale(0.82);
    this.socketGlow.setFillStyle(COLORS.cyanEdge, 0.16);
    this.socketGlow.setStrokeStyle(3, COLORS.cyanEdge, 0.9);
    this.triggerCameraResponse(420, 0.007);

    this.tweens.add({
      targets: this.pulse,
      scale: 1.14,
      duration: 180,
      ease: "Quad.Out",
      yoyo: true,
    });
    this.time.delayedCall(1500, () => {
      this.walkingBit.setVisible(false);
      this.socketGlow.setFillStyle(COLORS.cyanEdge, 0);
      this.socketGlow.setStrokeStyle(3, COLORS.cyanEdge, 0);
      this.publishState("ready");
    });
  }

  private publishState(state: ProofState) {
    this.state = state;
    if (this.stateNode) {
      this.stateNode.textContent = state.toUpperCase();
    }
    document.documentElement.dataset.proofState = state;
    this.publishDiagnostics();
  }

  private triggerCameraResponse(duration: number, intensity: number) {
    document.documentElement.dataset.proofCamera = "shaking";
    this.cameras.main.shake(duration, intensity);
    this.time.delayedCall(duration, () => {
      document.documentElement.dataset.proofCamera = "idle";
    });
  }

  private publishDiagnostics() {
    const root = document.documentElement;
    root.dataset.proofFps = String(this.fpsSample);
    root.dataset.proofRenderer =
      this.game.renderer.type === Phaser.WEBGL ? "webgl" : "canvas";
    root.dataset.proofPieceX = String(Math.round(this.fallingPiece.x));
    root.dataset.proofPieceY = String(Math.round(this.fallingPiece.y));
    root.dataset.proofPieceAngle = String(Math.round(this.fallingPiece.angle));
    root.dataset.proofBitVisible = String(this.walkingBit.visible);
    root.dataset.proofBitX = String(Math.round(this.walkingBit.x));
    root.dataset.proofBitY = String(Math.round(this.walkingBit.y));
  }
}

let proofScene: PhaserProofScene | null = null;

window.__TWISTRIS_PHASER_PROOF__ = {
  act(action) {
    proofScene?.act(action);
  },
  snapshot() {
    return proofScene?.snapshot() ?? null;
  },
};

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "phaserProof",
  backgroundColor: COLORS.bg,
  width: STAGE_SIZE,
  height: STAGE_SIZE,
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: true,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: STAGE_SIZE,
    height: STAGE_SIZE,
  },
  scene: PhaserProofScene,
});

for (const control of document.querySelectorAll<HTMLButtonElement>("[data-action]")) {
  control.addEventListener("click", () => {
    const action = control.dataset.action as ProofAction | undefined;
    if (action) {
      window.__TWISTRIS_PHASER_PROOF__.act(action);
    }
  });
}
