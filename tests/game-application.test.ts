import { describe, expect, it, vi } from "vitest";

import { createNoopPlatformAdapters } from "../src/app/platform/PlatformAdapters";
import { GameApplication } from "../src/app/state/GameApplication";

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
});
