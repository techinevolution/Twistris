import Phaser from "phaser";

import { GameApplication } from "../app/state/GameApplication";
import { ProfileStore } from "../app/state/ProfileStore";
import { FIRST_BIT_RECIPE } from "../domain/economy/FirstBitCrafting";
import {
  createProfile,
  updateProfile,
} from "../domain/profile/Profile";
import {
  WorldScene,
  type PuzzleAction,
} from "../scenes/world/WorldScene";
import { createBrowserPlatform } from "./createBrowserPlatform";

const GAME_STAGE_SIZE = 800;
const platform = createBrowserPlatform();
const profileStore = new ProfileStore(platform.storage);
const profileLoad = await profileStore.load();
const useSliceTenTestProfile =
  import.meta.env.DEV &&
  new URLSearchParams(window.location.search).get("testProfile") ===
    "slice10";
const loadedProfile = useSliceTenTestProfile
  ? updateProfile(createProfile(), {
      inventory: { duds: 8, pulseCharges: 1 },
      flags: { firstRunComplete: true },
    })
  : profileLoad.profile;
const application = new GameApplication({
  platform,
  profile: loadedProfile,
  profilePersistence: useSliceTenTestProfile
    ? undefined
    : profileStore,
});
document.documentElement.dataset.profileLoadSource =
  useSliceTenTestProfile ? "slice10-test" : profileLoad.source;
document.documentElement.dataset.profilePersisted = String(
  useSliceTenTestProfile ? false : profileLoad.persisted,
);
const worldScene = new WorldScene(application);
const stage = document.querySelector<HTMLElement>("#phaserTitle");
const startScreen = document.querySelector<HTMLElement>("#startScreen");
const startButton = document.querySelector<HTMLButtonElement>("#startButton");
const craftButton = document.querySelector<HTMLButtonElement>("#craftButton");
const repairButton =
  document.querySelector<HTMLButtonElement>("#repairButton");
const gameKeySink = document.querySelector<HTMLInputElement>("#gameKeySink");
const statusValue = document.querySelector<HTMLElement>("#statusValue");
const pulseChargeCounter =
  document.querySelector<HTMLElement>("#pulseChargeCounter");
const dudCounter = document.querySelector<HTMLElement>("#dudCounter");
const bitCounter = document.querySelector<HTMLElement>("#bitCounter");
const harvestResultDialog =
  document.querySelector<HTMLElement>("#harvestResultDialog");
const harvestDudsEarned =
  document.querySelector<HTMLElement>("#harvestDudsEarned");
const harvestChargesEarned =
  document.querySelector<HTMLElement>("#harvestChargesEarned");
const harvestContinueButton =
  document.querySelector<HTMLButtonElement>("#harvestContinueButton");
const craftingDialog =
  document.querySelector<HTMLElement>("#craftingDialog");
const craftBitButton =
  document.querySelector<HTMLButtonElement>("#craftBitButton");
const craftCancelButton =
  document.querySelector<HTMLButtonElement>("#craftCancelButton");
const craftingStatus =
  document.querySelector<HTMLElement>("#craftingStatus");
const repairCompleteDialog =
  document.querySelector<HTMLElement>("#repairCompleteDialog");
const repairContinueButton =
  document.querySelector<HTMLButtonElement>("#repairContinueButton");
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

worldScene.onBitsChanged = (bits) => {
  if (!bitCounter) return;
  const nextText = `Bits ${bits}`;
  if (bitCounter.textContent === nextText) return;
  bitCounter.textContent = nextText;
  bitCounter.classList.remove("is-awarded");
  void bitCounter.offsetWidth;
  bitCounter.classList.add("is-awarded");
};

worldScene.onStatusChanged = (status) => {
  if (!statusValue) return;
  statusValue.textContent = status;
  statusValue.classList.toggle("is-hidden", !status);
};

let pendingHarvestSummary: {
  readonly duds: number;
  readonly pulseCharges: number;
} | null = null;

function updateInventoryCounters() {
  if (pulseChargeCounter) {
    pulseChargeCounter.textContent =
      `Pulse charges ${application.inventory.pulseCharges}`;
  }
  if (dudCounter) {
    dudCounter.textContent = `Duds ${application.inventory.duds}`;
  }
  if (bitCounter) {
    bitCounter.textContent = `Bits ${application.profile.inventory.bits}`;
  }
}

function renderHubActions() {
  const profile = application.profile;
  const repairComplete =
    profile.restoration.gravityModuleRepaired;
  if (startButton) {
    startButton.hidden =
      profile.inventory.bits > 0 && !repairComplete;
  }
  if (craftButton) {
    craftButton.hidden =
      repairComplete ||
      profile.inventory.bits > 0 ||
      !profile.flags.firstRunComplete;
  }
  if (repairButton) {
    repairButton.hidden =
      repairComplete || profile.inventory.bits < 1;
  }
  updateInventoryCounters();
}

function showHarvestResult() {
  if (!pendingHarvestSummary || !harvestResultDialog) return;
  if (harvestDudsEarned) {
    harvestDudsEarned.textContent = `+${pendingHarvestSummary.duds}`;
  }
  if (harvestChargesEarned) {
    harvestChargesEarned.textContent =
      `+${pendingHarvestSummary.pulseCharges}`;
  }
  harvestResultDialog.hidden = false;
  harvestContinueButton?.focus();
}

application.subscribe((event) => {
  if (event.type === "harvestCommitted") {
    pendingHarvestSummary = {
      duds:
        event.transaction.after.duds -
        event.transaction.before.duds,
      pulseCharges:
        event.transaction.after.pulseCharges -
        event.transaction.before.pulseCharges,
    };
    return;
  }
  if (event.type === "profileSaveFailed") {
    worldScene.onStatusChanged?.("Profile save unavailable");
    return;
  }
  if (event.type !== "modeChanged") return;
  if (event.current === "launching") {
    startScreen?.classList.add("is-launching");
  } else if (
    event.current === "playing" &&
    event.previous === "launching"
  ) {
    startScreen?.classList.add("is-hidden");
  } else if (
    event.current === "crafting" ||
    event.current === "repairing"
  ) {
    startScreen?.classList.add("is-hidden");
  } else if (event.current === "title") {
    startScreen?.classList.remove("is-hidden", "is-launching");
    startScreen?.style.setProperty("--launch-progress", "0");
    renderHubActions();
    if (event.previous === "harvesting") showHarvestResult();
  }
});

function beginLaunch() {
  if (!worldScene.startTransition()) return;
  focusGameSurface();
}

startButton?.addEventListener("click", beginLaunch);
craftButton?.addEventListener("click", () => {
  if (!application.openCrafting()) return;
  if (craftingStatus) craftingStatus.textContent = "";
  if (craftBitButton) {
    craftBitButton.disabled =
      application.inventory.duds < FIRST_BIT_RECIPE.costs.duds ||
      application.inventory.pulseCharges <
        FIRST_BIT_RECIPE.costs.pulseCharges;
  }
  if (craftingDialog) craftingDialog.hidden = false;
  craftBitButton?.focus();
});
craftCancelButton?.addEventListener("click", () => {
  if (!application.cancelCrafting()) return;
  if (craftingDialog) craftingDialog.hidden = true;
  renderHubActions();
  craftButton?.focus();
});
craftBitButton?.addEventListener("click", () => {
  const transaction = application.craftFirstBit();
  if (!transaction) return;
  if (!transaction.applied) {
    if (craftingStatus) {
      craftingStatus.textContent =
        transaction.reason === "insufficient_duds"
          ? "Eight Duds are required."
          : "One Pulse charge is required.";
    }
    return;
  }

  if (craftingDialog) craftingDialog.hidden = true;
  worldScene.presentFirstBitCraft(transaction, () => {
    application.completeCrafting();
    renderHubActions();
    repairButton?.focus();
  });
});
repairButton?.addEventListener("click", () => {
  const transaction = application.beginGravityRepair();
  if (!transaction?.applied) return;
  worldScene.presentGravityModuleRepair(transaction, () => {
    application.completeGravityRepair();
    renderHubActions();
    if (repairCompleteDialog) repairCompleteDialog.hidden = false;
    repairContinueButton?.focus();
  });
});
harvestContinueButton?.addEventListener("click", () => {
  pendingHarvestSummary = null;
  if (harvestResultDialog) harvestResultDialog.hidden = true;
  renderHubActions();
  if (craftButton && !craftButton.hidden) {
    craftButton.focus();
  } else {
    startButton?.focus();
  }
});
repairContinueButton?.addEventListener("click", () => {
  if (repairCompleteDialog) repairCompleteDialog.hidden = true;
  worldScene.restoreTitleView();
  startButton?.focus();
});
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

renderHubActions();

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
