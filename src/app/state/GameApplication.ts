import {
  applyHarvestResult,
  createSessionEconomyState,
  type BankedInventory,
  type HarvestAward,
  type HarvestTransaction,
  type SessionEconomyState,
} from "../../domain/economy/SessionEconomy";
import {
  createNoopPlatformAdapters,
  type PlatformAdapters,
} from "../platform/PlatformAdapters";

export type ApplicationMode =
  | "title"
  | "launching"
  | "playing"
  | "paused"
  | "harvesting";

export interface ApplicationSnapshot {
  readonly mode: ApplicationMode;
  readonly inventory: BankedInventory;
}

export type ApplicationEvent =
  | {
      readonly type: "modeChanged";
      readonly previous: ApplicationMode;
      readonly current: ApplicationMode;
    }
  | {
      readonly type: "runRestarted";
    }
  | {
      readonly type: "harvestCommitted";
      readonly transaction: HarvestTransaction;
    };

type ApplicationListener = (event: ApplicationEvent) => void;

interface GameApplicationOptions {
  platform?: PlatformAdapters;
}

export class GameApplication {
  readonly platform: PlatformAdapters;

  private currentMode: ApplicationMode = "title";
  private economy: SessionEconomyState = createSessionEconomyState();
  private nextHarvestSequence = 1;
  private readonly listeners = new Set<ApplicationListener>();

  constructor({ platform = createNoopPlatformAdapters() }: GameApplicationOptions = {}) {
    this.platform = platform;
  }

  get mode(): ApplicationMode {
    return this.currentMode;
  }

  get inventory(): BankedInventory {
    return this.economy.inventory;
  }

  get snapshot(): ApplicationSnapshot {
    return Object.freeze({
      mode: this.currentMode,
      inventory: this.economy.inventory,
    });
  }

  subscribe(listener: ApplicationListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  beginLaunch(): boolean {
    return this.transition("title", "launching");
  }

  completeLaunch(): boolean {
    return this.transition("launching", "playing");
  }

  togglePause(): ApplicationMode | null {
    if (this.transition("playing", "paused")) return "paused";
    if (this.transition("paused", "playing")) return "playing";
    return null;
  }

  restartRun(): boolean {
    if (this.currentMode !== "playing" && this.currentMode !== "paused") {
      return false;
    }
    if (this.currentMode === "paused") this.setMode("playing");
    this.emit({ type: "runRestarted" });
    return true;
  }

  createHarvestId(): string | null {
    if (this.currentMode !== "playing") return null;
    const id = `next-harvest-${this.nextHarvestSequence}`;
    this.nextHarvestSequence += 1;
    return id;
  }

  beginHarvest(result: HarvestAward): HarvestTransaction | null {
    if (this.currentMode !== "playing") return null;

    const applied = applyHarvestResult(this.economy, result);
    this.economy = applied.state;
    this.setMode("harvesting");
    this.emit({
      type: "harvestCommitted",
      transaction: applied.transaction,
    });
    return applied.transaction;
  }

  completeHarvest(): boolean {
    return this.transition("harvesting", "title");
  }

  private transition(
    expected: ApplicationMode,
    next: ApplicationMode,
  ): boolean {
    if (this.currentMode !== expected) return false;
    this.setMode(next);
    return true;
  }

  private setMode(next: ApplicationMode) {
    if (next === this.currentMode) return;
    const previous = this.currentMode;
    this.currentMode = next;
    this.emit({ type: "modeChanged", previous, current: next });
  }

  private emit(event: ApplicationEvent) {
    for (const listener of this.listeners) listener(event);
  }
}
