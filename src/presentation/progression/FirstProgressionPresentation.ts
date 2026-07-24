import Phaser from "phaser";

import type { FirstBitCraftTransaction } from "../../domain/economy/FirstBitCrafting";
import type { Profile } from "../../domain/profile/Profile";
import type { GravityRepairTransaction } from "../../domain/repairs/GravityModule";
import { createTechCell } from "../TechCell";
import type { WorldCameraMode } from "../camera/WorldCameraController";

const FIRST_BIT_DUD_COUNT = 8;
const CYAN_EDGE = 0x8fe6ff;

interface Point {
  readonly x: number;
  readonly y: number;
}

interface ResourceTargets {
  readonly charges: Readonly<Point>;
  readonly duds: Readonly<Point>;
}

interface ProgressionTargets {
  readonly bits: Readonly<Point>;
}

export type ProgressionPresentationState =
  | "idle"
  | "crafting"
  | "bit-ready"
  | "repairing"
  | "module-online";

interface FirstProgressionOptions {
  readonly profile: Profile;
  readonly world: Phaser.GameObjects.Container;
  readonly grid: Phaser.GameObjects.Graphics;
  readonly pulse: Phaser.GameObjects.Container;
  readonly logo: Phaser.GameObjects.Container;
  readonly titleScale: number;
  readonly titlePulseScale: number;
  readonly titleGridAlpha: number;
  readonly resolveResourceTargets: () => ResourceTargets | null;
  readonly resolveProgressionTargets: () => ProgressionTargets | null;
  readonly setCameraMode: (mode: WorldCameraMode) => void;
  readonly onDudsChanged: (value: number) => void;
  readonly onPulseChargesChanged: (value: number) => void;
  readonly onBitsChanged: (value: number) => void;
  readonly onStatusChanged: (value: string) => void;
}

function createWalkingBit(scene: Phaser.Scene) {
  const container = scene.add.container();
  const feet = scene.add.graphics();
  feet.fillStyle(0xb9efff, 1);
  feet.fillRoundedRect(-10, 14, 7, 6, 2);
  feet.fillRoundedRect(3, 14, 7, 6, 2);
  const cell = createTechCell(scene, "cyan", 28, true);
  container.add([feet, cell]);
  container.setVisible(false);
  return { container, feet };
}

export class FirstProgressionPresentation {
  private readonly layer: Phaser.GameObjects.Container;
  private readonly trace: Phaser.GameObjects.Graphics;
  private readonly module: Phaser.GameObjects.Container;
  private readonly socketGlow: Phaser.GameObjects.Arc;
  private readonly installedBit: Phaser.GameObjects.Container;
  private readonly walkingBit: Phaser.GameObjects.Container;
  private readonly walkingFeet: Phaser.GameObjects.Graphics;
  private resourceTargets: ResourceTargets = {
    charges: { x: -285, y: 340 },
    duds: { x: 285, y: 340 },
  };
  private progressionTargets: ProgressionTargets = {
    bits: { x: 0, y: 340 },
  };
  private currentState: ProgressionPresentationState = "idle";

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly options: FirstProgressionOptions,
  ) {
    this.layer = scene.add.container(0, 0);
    this.layer.setName("progression-presentation");
    this.trace = scene.add.graphics();
    const gravityModule = this.createGravityModule();
    this.module = gravityModule.module;
    this.socketGlow = gravityModule.socketGlow;
    this.installedBit = gravityModule.installedBit;
    const walking = createWalkingBit(scene);
    this.walkingBit = walking.container;
    this.walkingFeet = walking.feet;
    this.layer.add([this.trace, this.module, this.walkingBit]);

    if (options.profile.restoration.gravityModuleRepaired) {
      scene.tweens.killTweensOf(this.module);
      this.module.setPosition(-196, 0);
      this.module.setAngle(0);
      this.socketGlow.setFillStyle(CYAN_EDGE, 0.16);
      this.socketGlow.setStrokeStyle(3, CYAN_EDGE, 0.92);
    }
    this.setModuleVisible(
      options.profile.inventory.bits > 0 ||
        options.profile.restoration.gravityModuleRepaired,
    );
  }

  get state(): ProgressionPresentationState {
    return this.currentState;
  }

  get displayObject(): Phaser.GameObjects.Container {
    return this.layer;
  }

  get moduleVisible(): boolean {
    return this.module.visible;
  }

  get walkingBitVisible(): boolean {
    return this.walkingBit.visible;
  }

  presentCraft(
    transaction: FirstBitCraftTransaction,
    onComplete: () => void,
  ) {
    if (!transaction.applied) return;

    this.currentState = "crafting";
    this.prepareView();
    this.resourceTargets =
      this.options.resolveResourceTargets() ?? this.resourceTargets;
    this.progressionTargets =
      this.options.resolveProgressionTargets() ??
      this.progressionTargets;
    this.setModuleVisible(false);
    this.options.onStatusChanged("FABRICATING BIT");

    let completedDuds = 0;
    for (let index = 0; index < FIRST_BIT_DUD_COUNT; index += 1) {
      const dud = createTechCell(
        this.scene,
        index % 2 === 0 ? "cyan" : "magenta",
        14,
      );
      dud.setPosition(
        this.resourceTargets.duds.x,
        this.resourceTargets.duds.y,
      );
      this.layer.add(dud);
      const startAngle =
        -Math.PI / 2 + (index / FIRST_BIT_DUD_COUNT) * Math.PI * 2;

      this.scene.tweens.addCounter({
        from: 0,
        to: 1,
        delay: index * 70,
        duration: 1900,
        ease: "Sine.InOut",
        onUpdate: (tween) => {
          const progress = tween.getValue() ?? 0;
          let angle = startAngle;
          let radius = 72;
          if (progress < 0.2) {
            const enter = progress / 0.2;
            dud.x = Phaser.Math.Linear(
              this.resourceTargets.duds.x,
              Math.cos(angle) * radius,
              enter,
            );
            dud.y = Phaser.Math.Linear(
              this.resourceTargets.duds.y,
              Math.sin(angle) * radius,
              enter,
            );
            return;
          }

          const orbitProgress = Math.min(
            1,
            (progress - 0.2) / 0.62,
          );
          angle += orbitProgress * Math.PI * 4;
          if (progress > 0.82) {
            radius *= 1 - (progress - 0.82) / 0.18;
          }
          dud.setPosition(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius,
          );
          dud.setScale(Math.max(0.35, radius / 72));
        },
        onComplete: () => {
          dud.destroy();
          completedDuds += 1;
          this.options.onDudsChanged(
            transaction.before.duds - completedDuds,
          );
          if (completedDuds === FIRST_BIT_DUD_COUNT) {
            this.finishFabrication(transaction, onComplete);
          }
        },
      });
    }
  }

  presentRepair(
    transaction: GravityRepairTransaction,
    onComplete: () => void,
  ) {
    if (!transaction.applied) return;

    this.currentState = "repairing";
    this.prepareView();
    this.progressionTargets =
      this.options.resolveProgressionTargets() ??
      this.progressionTargets;
    this.setModuleVisible(true);
    this.installedBit.setVisible(false);
    this.socketGlow.setFillStyle(CYAN_EDGE, 0.06);
    this.socketGlow.setStrokeStyle(3, CYAN_EDGE, 0.35);
    this.options.onBitsChanged(transaction.after.bits);
    this.options.onStatusChanged("INSTALL BIT · GRAVITY MODULE");

    const start = this.progressionTargets.bits;
    this.walkingBit.setVisible(true);
    this.walkingBit.setAlpha(1);
    this.walkingBit.setScale(1);
    this.walkingBit.setAngle(0);
    this.walkingBit.setPosition(start.x, start.y);
    this.walkingFeet.setVisible(true);
    this.walkingFeet.y = 0;
    this.scene.tweens.add({
      targets: this.walkingFeet,
      y: 3,
      duration: 95,
      ease: "Sine.InOut",
      yoyo: true,
      repeat: 9,
    });
    this.scene.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 1180,
      ease: "Sine.InOut",
      onUpdate: (tween) => {
        const progress = tween.getValue() ?? 0;
        this.walkingBit.x = Phaser.Math.Linear(
          start.x,
          -148,
          progress,
        );
        this.walkingBit.y =
          Phaser.Math.Linear(start.y, 0, progress) -
          Math.abs(Math.sin(progress * Math.PI * 8)) * 8;
      },
      onComplete: () => this.hopIntoModule(onComplete),
    });
  }

  restoreTitleView() {
    this.currentState = "idle";
    this.walkingBit.setVisible(false);
    this.options.world.setScale(this.options.titleScale);
    this.options.grid.setAlpha(this.options.titleGridAlpha);
    this.options.pulse.setScale(this.options.titlePulseScale);
    this.options.logo.setVisible(true);
    this.options.logo.setAlpha(1);
    this.options.logo.y = 0;
    this.options.setCameraMode("title-closeup");
    this.options.onStatusChanged("");
  }

  private finishFabrication(
    transaction: FirstBitCraftTransaction,
    onComplete: () => void,
  ) {
    this.options.onPulseChargesChanged(
      transaction.after.pulseCharges,
    );
    this.scene.tweens.add({
      targets: this.options.pulse,
      scale: 1.18,
      duration: 220,
      ease: "Quad.Out",
      yoyo: true,
      onComplete: () =>
        this.scene.time.delayedCall(160, () =>
          this.walkToCounter(transaction, onComplete),
        ),
    });
  }

  private walkToCounter(
    transaction: FirstBitCraftTransaction,
    onComplete: () => void,
  ) {
    const target = this.progressionTargets.bits;
    this.walkingBit.setVisible(true);
    this.walkingBit.setAlpha(1);
    this.walkingBit.setScale(1);
    this.walkingBit.setAngle(0);
    this.walkingBit.setPosition(0, 0);
    this.walkingFeet.setVisible(true);
    this.walkingFeet.y = 0;
    this.scene.tweens.add({
      targets: this.walkingFeet,
      y: 3,
      duration: 92,
      ease: "Sine.InOut",
      yoyo: true,
      repeat: 8,
    });
    this.scene.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 1220,
      ease: "Sine.InOut",
      onUpdate: (tween) => {
        const progress = tween.getValue() ?? 0;
        this.walkingBit.x = Phaser.Math.Linear(0, target.x, progress);
        this.walkingBit.y =
          Phaser.Math.Linear(0, target.y, progress) -
          Math.abs(Math.sin(progress * Math.PI * 8)) * 7 -
          Math.sin(
            (Math.max(0, progress - 0.78) / 0.22) * Math.PI,
          ) *
            34;
      },
      onComplete: () => {
        this.walkingBit.setVisible(false);
        this.options.onBitsChanged(transaction.after.bits);
        this.currentState = "bit-ready";
        this.setModuleVisible(true);
        this.options.onStatusChanged(
          "BIT READY · GRAVITY MODULE OFFLINE",
        );
        onComplete();
      },
    });
  }

  private hopIntoModule(onComplete: () => void) {
    const startX = this.walkingBit.x;
    const startY = this.walkingBit.y;
    this.walkingFeet.setVisible(false);
    this.scene.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 480,
      ease: "Sine.InOut",
      onUpdate: (tween) => {
        const progress = tween.getValue() ?? 0;
        this.walkingBit.x = Phaser.Math.Linear(
          startX,
          this.module.x,
          progress,
        );
        this.walkingBit.y =
          Phaser.Math.Linear(startY, 0, progress) -
          Math.sin(progress * Math.PI) * 58;
        this.walkingBit.angle = progress * 180;
      },
      onComplete: () => {
        this.walkingBit.setVisible(false);
        this.installedBit.setVisible(true);
        this.module.setPosition(-196, 0);
        this.module.setAngle(0);
        this.scene.tweens.killTweensOf(this.module);
        this.socketGlow.setFillStyle(CYAN_EDGE, 0.16);
        this.socketGlow.setStrokeStyle(3, CYAN_EDGE, 0.92);
        this.trace.setAlpha(1);
        this.scene.tweens.add({
          targets: this.trace,
          alpha: 0.42,
          duration: 130,
          ease: "Sine.InOut",
          yoyo: true,
          repeat: 5,
        });
        this.scene.tweens.add({
          targets: this.options.pulse,
          scale: 1.14,
          duration: 180,
          ease: "Quad.Out",
          yoyo: true,
        });
        this.scene.cameras.main.shake(360, 0.0055);
        this.currentState = "module-online";
        this.options.onStatusChanged(
          "GRAVITY GYRO STABILIZED · MODULE ONLINE",
        );
        this.scene.time.delayedCall(1450, onComplete);
      },
    });
  }

  private prepareView() {
    this.options.logo.setVisible(false);
    this.options.world.setScale(1);
    this.options.grid.setAlpha(0.28);
    this.options.pulse.setScale(1);
    this.options.pulse.setAngle(0);
    this.options.setCameraMode("pulse-home");
  }

  private setModuleVisible(visible: boolean) {
    this.trace.setVisible(visible);
    this.module.setVisible(visible);
  }

  private createGravityModule() {
    this.trace.lineStyle(12, 0x101a23, 0.92);
    this.trace.lineBetween(0, 0, -164, 0);
    this.trace.lineStyle(4, 0x9d5c3b, 0.9);
    this.trace.lineBetween(0, 0, -164, 0);
    this.trace.lineStyle(1, 0xf0a36d, 0.55);
    this.trace.lineBetween(0, -3, -164, -3);

    const module = this.scene.add.container(-196, 0);
    module.setName("gravity-module");
    const body = this.scene.add.graphics();
    body.fillStyle(0x0a131c, 0.98);
    body.fillRoundedRect(-42, -42, 84, 84, 6);
    body.lineStyle(3, 0x687b89, 0.78);
    body.strokeRoundedRect(-38, -38, 76, 76, 5);
    body.lineStyle(2, 0x9d5c3b, 0.72);
    body.lineBetween(32, 0, 42, 0);
    body.fillStyle(0x050a0f, 1);
    body.fillRoundedRect(-18, -18, 36, 36, 4);
    body.lineStyle(2, 0x687b89, 0.7);
    body.strokeRoundedRect(-16, -16, 32, 32, 3);

    const socketGlow = this.scene.add.circle(
      0,
      0,
      21,
      CYAN_EDGE,
      0,
    );
    socketGlow.setStrokeStyle(3, CYAN_EDGE, 0);
    const installedBit = createTechCell(
      this.scene,
      "cyan",
      26,
      true,
    );
    installedBit.setVisible(
      this.options.profile.restoration.gravityModuleRepaired,
    );
    const label = this.scene.add.text(
      0,
      55,
      "GRAVITY MODULE",
      {
        color: "#aebbc5",
        fontFamily: '"Segoe UI", Helvetica, Arial, sans-serif',
        fontSize: "11px",
        fontStyle: "bold",
      },
    );
    label.setOrigin(0.5);
    module.add([body, socketGlow, installedBit, label]);
    this.scene.tweens.add({
      targets: module,
      y: 3,
      angle: 1.2,
      duration: 110,
      ease: "Sine.InOut",
      yoyo: true,
      repeat: -1,
    });
    return { module, socketGlow, installedBit };
  }
}
