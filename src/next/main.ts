import Phaser from "phaser";

import { GameApplication } from "../app/state/GameApplication";
import { ProfileStore } from "../app/state/ProfileStore";
import {
  WorldScene,
  type PuzzleAction,
} from "../scenes/world/WorldScene";
import { createBrowserPlatform } from "./createBrowserPlatform";

const GAME_STAGE_SIZE = 800;
const platform = createBrowserPlatform();
const profileStore = new ProfileStore(platform.storage);
const profileLoad = await profileStore.load();
const application = new GameApplication({
  platform,
  profile: profileLoad.profile,
  profilePersistence: profileStore,
});
document.documentElement.dataset.profileLoadSource = profileLoad.source;
document.documentElement.dataset.profilePersisted = String(
  profileLoad.persisted,
);
const worldScene = new WorldScene(application);
const stage = document.querySelector<HTMLElement>("#phaserTitle");
const startScreen = document.querySelector<HTMLElement>("#startScreen");
const startButton = document.querySelector<HTMLButtonElement>("#startButton");
const gameKeySink = document.querySelector<HTMLInputElement>("#gameKeySink");
const statusValue = document.querySelector<HTMLElement>("#statusValue");
const pulseChargeCounter =
  document.querySelector<HTMLElement>("#pulseChargeCounter");
const dudCounter = document.querySelector<HTMLElement>("#dudCounter");
const useKeySinkFocus = /Mac/.test(navigator.platform || navigator.userAgent);
const testActions = new Set<PuzzleAction>([
  "left",
  "right",
  "rotate",
  "softDrop",
  "hardDrop",
  "pause",
  "restart",
]);

function getHarvestTarget(element: HTMLElement | null) {
  const canvas = stage?.querySelector("canvas");
  if (!canvas || !element) return null;

  const canvasRect = canvas.getBoundingClientRect();
  const targetRect = element.getBoundingClientRect();
  if (canvasRect.width <= 0 || canvasRect.height <= 0) return null;

  return {
    x:
      ((targetRect.left + targetRect.width / 2 - canvasRect.left) /
        canvasRect.width) *
        GAME_STAGE_SIZE -
      GAME_STAGE_SIZE / 2,
    y:
      ((targetRect.top + targetRect.height / 2 - canvasRect.top) /
        canvasRect.height) *
        GAME_STAGE_SIZE -
      GAME_STAGE_SIZE / 2,
  };
}

worldScene.resolveHarvestTargets = () => {
  const charges = getHarvestTarget(pulseChargeCounter);
  const duds = getHarvestTarget(dudCounter);
  return charges && duds ? { charges, duds } : null;
};

function focusGameSurface() {
  const target = useKeySinkFocus && gameKeySink ? gameKeySink : stage;
  target?.focus({ preventScroll: true });
  document.documentElement.dataset.titleFocused =
    document.activeElement === target ? "true" : "false";
}

worldScene.onLaunchProgress = (progress) => {
  startScreen?.style.setProperty("--launch-progress", progress.toFixed(3));
};

worldScene.onPulseChargesChanged = (charges) => {
  if (pulseChargeCounter) {
    const nextText = `Pulse charges ${charges}`;
    if (pulseChargeCounter.textContent === nextText) return;
    pulseChargeCounter.textContent = nextText;
    pulseChargeCounter.classList.remove("is-awarded");
    void pulseChargeCounter.offsetWidth;
    pulseChargeCounter.classList.add("is-awarded");
  }
};

worldScene.onDudsChanged = (duds) => {
  if (dudCounter) {
    const nextText = `Duds ${duds}`;
    if (dudCounter.textContent === nextText) return;
    dudCounter.textContent = nextText;
    dudCounter.classList.remove("is-awarded");
    void dudCounter.offsetWidth;
    dudCounter.classList.add("is-awarded");
  }
};

if (pulseChargeCounter) {
  pulseChargeCounter.textContent =
    `Pulse charges ${application.inventory.pulseCharges}`;
}
if (dudCounter) {
  dudCounter.textContent = `Duds ${application.inventory.duds}`;
}

worldScene.onStatusChanged = (status) => {
  if (!statusValue) return;
  statusValue.textContent = status;
  statusValue.classList.toggle("is-hidden", !status);
};

application.subscribe((event) => {
  if (event.type !== "modeChanged") return;
  if (event.current === "launching") {
    startScreen?.classList.add("is-launching");
  } else if (
    event.current === "playing" &&
    event.previous === "launching"
  ) {
    startScreen?.classList.add("is-hidden");
  } else if (event.current === "title") {
    startScreen?.classList.remove("is-hidden", "is-launching");
    startScreen?.style.setProperty("--launch-progress", "0");
  }
});

function beginLaunch() {
  if (!worldScene.startTransition()) return;
  focusGameSurface();
}

startButton?.addEventListener("click", beginLaunch);
window.addEventListener("keydown", (event) => {
  if (
    event.repeat &&
    (event.code === "Enter" ||
      event.code === "KeyP" ||
      event.code === "KeyR")
  ) {
    event.preventDefault();
    return;
  }
  if (event.code === "Enter") {
    event.preventDefault();
    beginLaunch();
  } else if (event.code === "KeyP") {
    event.preventDefault();
    worldScene.act("pause");
  } else if (event.code === "KeyR") {
    event.preventDefault();
    worldScene.act("restart");
  }
});

stage?.addEventListener("pointerdown", focusGameSurface);
gameKeySink?.addEventListener("input", () => {
  if (import.meta.env.DEV && gameKeySink.value.startsWith("test:")) {
    const action = gameKeySink.value.split(":")[1] as PuzzleAction;
    if (testActions.has(action)) worldScene.act(action);
  }
  gameKeySink.value = "";
});

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "phaserTitle",
  backgroundColor: "#091723",
  width: GAME_STAGE_SIZE,
  height: GAME_STAGE_SIZE,
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: true,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_STAGE_SIZE,
    height: GAME_STAGE_SIZE,
  },
  scene: worldScene,
});
