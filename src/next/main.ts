import Phaser from "phaser";

import { WorldScene } from "../scenes/world/WorldScene";

const worldScene = new WorldScene();
const stage = document.querySelector<HTMLElement>("#phaserTitle");
const startScreen = document.querySelector<HTMLElement>("#startScreen");
const startButton = document.querySelector<HTMLButtonElement>("#startButton");
const gameKeySink = document.querySelector<HTMLInputElement>("#gameKeySink");
const useKeySinkFocus = /Mac/.test(navigator.platform || navigator.userAgent);

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

startButton?.addEventListener("click", () => {
  if (!worldScene.startTransition()) return;
  startScreen?.classList.add("is-launching");
  focusGameSurface();
});

stage?.addEventListener("pointerdown", focusGameSurface);
gameKeySink?.addEventListener("input", () => {
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
