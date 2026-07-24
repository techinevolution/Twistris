import {
  applyHarvestResult,
  createSessionEconomyState,
  updateSessionInventory,
  type BankedInventory,
  type HarvestAward,
  type HarvestTransaction,
  type SessionEconomyState,
} from "../../domain/economy/SessionEconomy";
import {
  craftFirstBit as applyFirstBitCraft,
  type FirstBitCraftTransaction,
} from "../../domain/economy/FirstBitCrafting";
import {
  createNoopPlatformAdapters,
  type PlatformAdapters,
} from "../platform/PlatformAdapters";
import {
  applyHarvestToProfile,
  createProfile,
  type Profile,
} from "../../domain/profile/Profile";
import type { ProfilePersistence } from "./ProfileStore";
import {
  installGravityModuleBit,
  type GravityRepairTransaction,
} from "../../domain/repairs/GravityModule";

export type ApplicationMode =
  | "title"
  | "launching"
  | "playing"
  | "paused"
  | "harvesting"
  | "crafting"
  | "repairing";

export interface ApplicationSnapshot {
  readonly mode: ApplicationMode;
  readonly inventory: BankedInventory;
  readonly profile: Profile;
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
    }
  | {
      readonly type: "profileSaveFailed";
    }
  | {
      readonly type: "firstBitCrafted";
      readonly transaction: FirstBitCraftTransaction;
    }
  | {
      readonly type: "gravityModuleRepaired";
      readonly transaction: GravityRepairTransaction;
    };

type ApplicationListener = (event: ApplicationEvent) => void;

interface GameApplicationOptions {
  platform?: PlatformAdapters;
  profile?: Profile;
  profilePersistence?: ProfilePersistence;
}

export class GameApplication {
  readonly platform: PlatformAdapters;

  private currentMode: ApplicationMode = "title";
  private currentProfile: Profile;
  private economy: SessionEconomyState;
  private nextHarvestSequence = 1;
  private readonly listeners = new Set<ApplicationListener>();
  private pendingProfileSave: Promise<void> = Promise.resolve();

  constructor({
    platform = createNoopPlatformAdapters(),
    profile = createProfile(),
    profilePersistence,
  }: GameApplicationOptions = {}) {
    this.platform = platform;
    this.currentProfile = profile;
    this.economy = createSessionEconomyState(profile.inventory);
    this.profilePersistence = profilePersistence;
  }

  private readonly profilePersistence?: ProfilePersistence;

  get mode(): ApplicationMode {
    return this.currentMode;
  }

  get inventory(): BankedInventory {
    return this.economy.inventory;
  }

  get profile(): Profile {
    return this.currentProfile;
  }

  get snapshot(): ApplicationSnapshot {
    return Object.freeze({
      mode: this.currentMode,
      inventory: this.economy.inventory,
      profile: this.currentProfile,
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
    if (applied.transaction.applied) {
      this.currentProfile = applyHarvestToProfile(
        this.currentProfile,
        result,
      );
      this.queueProfileSave(this.currentProfile);
    }
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

  openCrafting(): boolean {
    return this.transition("title", "crafting");
  }

  cancelCrafting(): boolean {
    return this.transition("crafting", "title");
  }

  craftFirstBit(): FirstBitCraftTransaction | null {
    if (this.currentMode !== "crafting") return null;
    const crafted = applyFirstBitCraft(this.currentProfile);
    if (!crafted.transaction.applied) return crafted.transaction;

    this.commitProfile(crafted.profile);
    this.emit({
      type: "firstBitCrafted",
      transaction: crafted.transaction,
    });
    return crafted.transaction;
  }

  completeCrafting(): boolean {
    return this.transition("crafting", "title");
  }

  beginGravityRepair(): GravityRepairTransaction | null {
    if (this.currentMode !== "title") return null;
    const repaired = installGravityModuleBit(this.currentProfile);
    if (!repaired.transaction.applied) return repaired.transaction;

    this.commitProfile(repaired.profile);
    this.setMode("repairing");
    this.emit({
      type: "gravityModuleRepaired",
      transaction: repaired.transaction,
    });
    return repaired.transaction;
  }

  completeGravityRepair(): boolean {
    return this.transition("repairing", "title");
  }

  flushProfileSave(): Promise<void> {
    return this.pendingProfileSave;
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

  private commitProfile(profile: Profile) {
    this.currentProfile = profile;
    this.economy = updateSessionInventory(
      this.economy,
      profile.inventory,
    );
    this.queueProfileSave(profile);
  }

  private queueProfileSave(profile: Profile) {
    if (!this.profilePersistence) return;
    this.pendingProfileSave = this.pendingProfileSave
      .then(() => this.profilePersistence?.save(profile))
      .then(() => undefined)
      .catch(() => {
        this.emit({ type: "profileSaveFailed" });
      });
  }
}
