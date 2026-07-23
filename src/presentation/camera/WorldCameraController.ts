export const WORLD_CAMERA_MODES = [
  "title-closeup",
  "guided-pullback",
  "pulse-home",
  "puzzle",
  "board-free",
] as const;

export type WorldCameraMode = (typeof WORLD_CAMERA_MODES)[number];

export class WorldCameraController {
  private currentMode: WorldCameraMode;

  constructor(initialMode: WorldCameraMode) {
    this.currentMode = initialMode;
  }

  get mode(): WorldCameraMode {
    return this.currentMode;
  }

  get allowsFreeNavigation(): boolean {
    return this.currentMode === "board-free";
  }

  setMode(mode: WorldCameraMode) {
    this.currentMode = mode;
  }
}
