import Phaser from "phaser";

import {
  WorldScene,
  type PuzzleAction,
} from "../scenes/world/WorldScene";

const worldScene = new WorldScene();
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

function focusGameSurface() {
  const target = useKeySinkFocus && gameKeySink ? gameKeySink : stage;
  target?.focus({ preventScroll: true });
  document.documentElement.dataset.titleFocused =
    document.activeElement === target ? "true" : "false";
}

worldScene.onLaunchProgress = (progress) => {
  startScreen?.style.setProperty("--launch-progress", progress.toFixed(3));
};

worldScene.onLaunchComplete = () => {
  startScreen?.classList.add("is-hidden");
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

worldScene.onReturnToTitle = () => {
  startScreen?.classList.remove("is-hidden", "is-launching");
  startScreen?.style.setProperty("--launch-progress", "0");
};

worldScene.onStatusChanged = (status) => {
  if (!statusValue) return;
  statusValue.textContent = status;
  statusValue.classList.toggle("is-hidden", !status);
};

function beginLaunch() {
  if (!worldScene.startTransition()) return;
  startScreen?.classList.add("is-launching");
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
  width: 800,
  height: 800,
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: true,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 800,
  },
  scene: worldScene,
});
