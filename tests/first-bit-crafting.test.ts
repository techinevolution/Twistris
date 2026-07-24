import { describe, expect, it } from "vitest";

import {
  FIRST_BIT_RECIPE,
  craftFirstBit,
} from "../src/domain/economy/FirstBitCrafting";
import {
  createProfile,
  updateProfile,
} from "../src/domain/profile/Profile";

describe("first Bit crafting", () => {
  it("spends the approved recipe and creates one Bit atomically", () => {
    const profile = updateProfile(createProfile(), {
      inventory: { duds: 12, pulseCharges: 3 },
    });
    const crafted = craftFirstBit(profile);

    expect(FIRST_BIT_RECIPE.costs).toEqual({
      duds: 8,
      pulseCharges: 1,
    });
    expect(crafted.transaction).toEqual({
      applied: true,
      recipeId: "first_bit",
      before: { duds: 12, pulseCharges: 3, bits: 0 },
      after: { duds: 4, pulseCharges: 2, bits: 1 },
      reason: null,
    });
    expect(crafted.profile.inventory).toEqual(
      crafted.transaction.after,
    );
    expect(profile.inventory).toEqual({
      duds: 12,
      pulseCharges: 3,
      bits: 0,
    });
  });

  it("does not mutate inventory when either resource is short", () => {
    const lowDuds = craftFirstBit(
      updateProfile(createProfile(), {
        inventory: { duds: 7, pulseCharges: 2 },
      }),
    );
    const lowCharge = craftFirstBit(
      updateProfile(createProfile(), {
        inventory: { duds: 8, pulseCharges: 0 },
      }),
    );

    expect(lowDuds.transaction.reason).toBe("insufficient_duds");
    expect(lowCharge.transaction.reason).toBe(
      "insufficient_pulse_charges",
    );
    expect(lowDuds.transaction.applied).toBe(false);
    expect(lowCharge.transaction.applied).toBe(false);
  });

  it("prevents extra first-Bit crafting after output or repair", () => {
    const stocked = updateProfile(createProfile(), {
      inventory: { duds: 40, pulseCharges: 8, bits: 1 },
    });
    const repaired = updateProfile(stocked, {
      inventory: { bits: 0 },
      restoration: { gravityModuleRepaired: true },
    });

    expect(craftFirstBit(stocked).transaction.reason).toBe(
      "bit_already_available",
    );
    expect(craftFirstBit(repaired).transaction.reason).toBe(
      "gravity_module_repaired",
    );
  });
});
