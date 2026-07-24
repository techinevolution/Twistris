import { describe, expect, it } from "vitest";

import {
  applyHarvestToProfile,
  createProfile,
  decodeProfile,
} from "../src/domain/profile/Profile";

describe("profile", () => {
  it("creates an empty deeply immutable demo profile", () => {
    const profile = createProfile();

    expect(profile).toEqual({
      version: 1,
      inventory: { duds: 0, pulseCharges: 0, bits: 0 },
      restoration: {
        gravityModuleRepaired: false,
        firewallSectorSecured: false,
        endlessFeedUnlocked: false,
      },
      upgrades: { unlockedIds: [], equippedIds: [] },
      stats: { totalRuns: 0, totalHarvests: 0, bestCoreLayers: 0 },
      flags: { firstRunComplete: false, firstRepairComplete: false },
    });
    expect(Object.isFrozen(profile)).toBe(true);
    expect(Object.isFrozen(profile.inventory)).toBe(true);
    expect(Object.isFrozen(profile.upgrades.unlockedIds)).toBe(true);
  });

  it("normalizes malformed version-one fields and upgrade IDs safely", () => {
    const decoded = decodeProfile({
      version: 1,
      inventory: { duds: 4.8, pulseCharges: -2, bits: "many" },
      restoration: { gravityModuleRepaired: true },
      upgrades: {
        unlockedIds: ["gyro", " gyro ", "", 2],
        equippedIds: ["unknown", "gyro"],
      },
      stats: { totalRuns: Number.POSITIVE_INFINITY },
      flags: { firstRunComplete: "yes" },
      transientAnimation: { x: 40 },
    });

    expect(decoded.source).toBe("loaded");
    expect(decoded.needsSave).toBe(true);
    expect(decoded.profile.inventory).toEqual({
      duds: 4,
      pulseCharges: 0,
      bits: 0,
    });
    expect(decoded.profile.upgrades).toEqual({
      unlockedIds: ["gyro"],
      equippedIds: ["gyro"],
    });
    expect(decoded.profile).not.toHaveProperty("transientAnimation");
  });

  it("migrates the supported flat version-zero inventory", () => {
    const decoded = decodeProfile({
      version: 0,
      bankedDuds: 12,
      bankedPulseCharges: 3,
      bits: 1,
    });

    expect(decoded.source).toBe("migrated");
    expect(decoded.needsSave).toBe(true);
    expect(decoded.profile.inventory).toEqual({
      duds: 12,
      pulseCharges: 3,
      bits: 1,
    });
    expect(decoded.profile.version).toBe(1);
  });

  it("recovers an empty profile from an unsupported version", () => {
    const decoded = decodeProfile({ version: 99, inventory: { duds: 20 } });

    expect(decoded.source).toBe("recovered");
    expect(decoded.profile).toEqual(createProfile());
  });

  it("banks a harvest and updates only approved progress statistics", () => {
    const profile = applyHarvestToProfile(createProfile(), {
      id: "harvest-1",
      earned: { duds: 8, pulseCharges: 2 },
      runStats: { coreLayersReached: 3 },
    });

    expect(profile.inventory).toEqual({
      duds: 8,
      pulseCharges: 2,
      bits: 0,
    });
    expect(profile.stats).toEqual({
      totalRuns: 1,
      totalHarvests: 1,
      bestCoreLayers: 3,
    });
    expect(profile.flags.firstRunComplete).toBe(true);
  });
});
