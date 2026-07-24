import { describe, expect, it, vi } from "vitest";

import { createNoopPlatformAdapters } from "../src/app/platform/PlatformAdapters";
import { GameApplication } from "../src/app/state/GameApplication";
import { ProfileStore } from "../src/app/state/ProfileStore";
import { createProfile } from "../src/domain/profile/Profile";

describe("GameApplication", () => {
  it("owns validated title, launch, play, and pause transitions", () => {
    const application = new GameApplication();

    expect(application.mode).toBe("title");
    expect(application.completeLaunch()).toBe(false);
    expect(application.beginLaunch()).toBe(true);
    expect(application.beginLaunch()).toBe(false);
    expect(application.completeLaunch()).toBe(true);
    expect(application.togglePause()).toBe("paused");
    expect(application.togglePause()).toBe("playing");
  });

  it("emits typed mode and restart events", () => {
    const application = new GameApplication();
    const listener = vi.fn();
    application.subscribe(listener);

    application.beginLaunch();
    application.completeLaunch();
    application.restartRun();

    expect(listener).toHaveBeenNthCalledWith(1, {
      type: "modeChanged",
      previous: "title",
      current: "launching",
    });
    expect(listener).toHaveBeenNthCalledWith(2, {
      type: "modeChanged",
      previous: "launching",
      current: "playing",
    });
    expect(listener).toHaveBeenNthCalledWith(3, {
      type: "runRestarted",
    });
  });

  it("commits harvest inventory before presentation completes", () => {
    const application = new GameApplication();
    application.beginLaunch();
    application.completeLaunch();
    const listener = vi.fn();
    application.subscribe(listener);

    const id = application.createHarvestId();
    const transaction = application.beginHarvest({
      id: id ?? "missing",
      earned: { duds: 8, pulseCharges: 2 },
    });

    expect(id).toBe("next-harvest-1");
    expect(transaction?.applied).toBe(true);
    expect(application.mode).toBe("harvesting");
    expect(application.inventory).toEqual({ duds: 8, pulseCharges: 2 });
    expect(listener).toHaveBeenNthCalledWith(1, {
      type: "modeChanged",
      previous: "playing",
      current: "harvesting",
    });
    expect(listener).toHaveBeenNthCalledWith(2, {
      type: "harvestCommitted",
      transaction,
    });
    expect(application.completeHarvest()).toBe(true);
    expect(application.mode).toBe("title");
  });

  it("preserves banked inventory across a run restart", () => {
    const application = new GameApplication();
    application.beginLaunch();
    application.completeLaunch();
    const id = application.createHarvestId();
    application.beginHarvest({
      id: id ?? "missing",
      earned: { duds: 8, pulseCharges: 2 },
    });
    application.completeHarvest();
    application.beginLaunch();
    application.completeLaunch();

    expect(application.restartRun()).toBe(true);
    expect(application.inventory).toEqual({ duds: 8, pulseCharges: 2 });
  });

  it("receives platform capabilities through injection", () => {
    const platform = createNoopPlatformAdapters();
    const application = new GameApplication({ platform });

    expect(application.platform).toBe(platform);
  });

  it("starts session inventory from the loaded profile", () => {
    const profile = {
      ...createProfile(),
      inventory: { duds: 11, pulseCharges: 3, bits: 1 },
    };
    const application = new GameApplication({ profile });

    expect(application.inventory).toEqual({ duds: 11, pulseCharges: 3 });
    expect(application.profile.inventory.bits).toBe(1);
  });

  it("persists an applied harvest before presentation completes", async () => {
    const save = vi.fn(async (_profile: ReturnType<typeof createProfile>) => {});
    const application = new GameApplication({
      profilePersistence: {
        save,
        async reset() {
          return createProfile();
        },
      },
    });
    application.beginLaunch();
    application.completeLaunch();

    application.beginHarvest({
      id: "harvest-1",
      earned: { duds: 8, pulseCharges: 2 },
      runStats: { coreLayersReached: 3 },
    });
    await application.flushProfileSave();

    expect(application.mode).toBe("harvesting");
    expect(save).toHaveBeenCalledOnce();
    expect(save.mock.calls[0][0].inventory).toEqual({
      duds: 8,
      pulseCharges: 2,
      bits: 0,
    });
    expect(save.mock.calls[0][0].stats).toEqual({
      totalRuns: 1,
      totalHarvests: 1,
      bestCoreLayers: 3,
    });
  });

  it("keeps gameplay usable and reports a failed profile save", async () => {
    const application = new GameApplication({
      profilePersistence: {
        async save() {
          throw new Error("storage unavailable");
        },
        async reset() {
          return createProfile();
        },
      },
    });
    const listener = vi.fn();
    application.subscribe(listener);
    application.beginLaunch();
    application.completeLaunch();

    const transaction = application.beginHarvest({
      id: "harvest-1",
      earned: { duds: 5, pulseCharges: 1 },
    });
    await application.flushProfileSave();

    expect(transaction?.applied).toBe(true);
    expect(application.inventory).toEqual({ duds: 5, pulseCharges: 1 });
    expect(listener).toHaveBeenCalledWith({ type: "profileSaveFailed" });
  });

  it("restores both harvested currencies through a save and reload", async () => {
    let serialized: string | null = null;
    const store = new ProfileStore({
      async read() {
        return serialized;
      },
      async write(_key, value) {
        serialized = value;
      },
      async remove() {
        serialized = null;
      },
    });
    const initial = await store.load();
    const firstApplication = new GameApplication({
      profile: initial.profile,
      profilePersistence: store,
    });
    firstApplication.beginLaunch();
    firstApplication.completeLaunch();
    firstApplication.beginHarvest({
      id: "harvest-1",
      earned: { duds: 14, pulseCharges: 3 },
    });
    await firstApplication.flushProfileSave();

    const reloaded = await store.load();
    const secondApplication = new GameApplication({
      profile: reloaded.profile,
      profilePersistence: store,
    });

    expect(secondApplication.inventory).toEqual({
      duds: 14,
      pulseCharges: 3,
    });
  });

  it("owns and persists the first craft-to-repair progression loop", async () => {
    const save = vi.fn(async (_profile: ReturnType<typeof createProfile>) => {});
    const profile = {
      ...createProfile(),
      inventory: { duds: 10, pulseCharges: 2, bits: 0 },
    };
    const application = new GameApplication({
      profile,
      profilePersistence: {
        save,
        async reset() {
          return createProfile();
        },
      },
    });
    const listener = vi.fn();
    application.subscribe(listener);

    expect(application.openCrafting()).toBe(true);
    const crafted = application.craftFirstBit();
    expect(crafted?.applied).toBe(true);
    expect(application.mode).toBe("crafting");
    expect(application.profile.inventory).toEqual({
      duds: 2,
      pulseCharges: 1,
      bits: 1,
    });
    expect(application.completeCrafting()).toBe(true);

    const repaired = application.beginGravityRepair();
    expect(repaired?.applied).toBe(true);
    expect(application.mode).toBe("repairing");
    expect(application.profile.inventory.bits).toBe(0);
    expect(
      application.profile.restoration.gravityModuleRepaired,
    ).toBe(true);
    expect(application.profile.flags.firstRepairComplete).toBe(true);
    expect(application.completeGravityRepair()).toBe(true);
    await application.flushProfileSave();

    expect(save).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenCalledWith({
      type: "firstBitCrafted",
      transaction: crafted,
    });
    expect(listener).toHaveBeenCalledWith({
      type: "gravityModuleRepaired",
      transaction: repaired,
    });
  });

  it("rejects progression commands outside their valid modes", () => {
    const application = new GameApplication();

    expect(application.craftFirstBit()).toBeNull();
    expect(application.beginGravityRepair()?.reason).toBe(
      "bit_required",
    );
    expect(application.completeCrafting()).toBe(false);
    expect(application.completeGravityRepair()).toBe(false);
  });
});
