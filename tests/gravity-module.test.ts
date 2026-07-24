import { describe, expect, it } from "vitest";

import {
  installGravityModuleBit,
} from "../src/domain/repairs/GravityModule";
import {
  createProfile,
  updateProfile,
} from "../src/domain/profile/Profile";

describe("Gravity Module repair", () => {
  it("consumes one ordinary Bit and records the completed repair", () => {
    const profile = updateProfile(createProfile(), {
      inventory: { bits: 1 },
    });
    const repaired = installGravityModuleBit(profile);

    expect(repaired.transaction).toEqual({
      applied: true,
      moduleId: "gravity_module",
      before: { duds: 0, pulseCharges: 0, bits: 1 },
      after: { duds: 0, pulseCharges: 0, bits: 0 },
      reason: null,
    });
    expect(
      repaired.profile.restoration.gravityModuleRepaired,
    ).toBe(true);
    expect(repaired.profile.flags.firstRepairComplete).toBe(true);
  });

  it("requires a Bit and cannot repair the module twice", () => {
    const emptyProfile = createProfile();
    const missing = installGravityModuleBit(emptyProfile);
    const repairedProfile = updateProfile(createProfile(), {
      restoration: { gravityModuleRepaired: true },
      flags: { firstRepairComplete: true },
    });
    const duplicate = installGravityModuleBit(repairedProfile);

    expect(missing.transaction.reason).toBe("bit_required");
    expect(duplicate.transaction.reason).toBe("already_repaired");
    expect(missing.profile).toBe(emptyProfile);
    expect(duplicate.profile).toBe(repairedProfile);
  });
});
