import {
  updateProfile,
  type Profile,
  type ProfileInventory,
} from "../profile/Profile";

export const FIRST_BIT_RECIPE = Object.freeze({
  id: "first_bit",
  name: "Craft Bit",
  costs: Object.freeze({
    duds: 8,
    pulseCharges: 1,
  }),
  output: Object.freeze({
    bits: 1,
  }),
});

export type FirstBitCraftFailure =
  | "gravity_module_repaired"
  | "bit_already_available"
  | "insufficient_duds"
  | "insufficient_pulse_charges";

export interface FirstBitCraftTransaction {
  readonly applied: boolean;
  readonly recipeId: typeof FIRST_BIT_RECIPE.id;
  readonly before: ProfileInventory;
  readonly after: ProfileInventory;
  readonly reason: FirstBitCraftFailure | null;
}

function result(
  profile: Profile,
  transaction: FirstBitCraftTransaction,
) {
  return Object.freeze({
    profile,
    transaction: Object.freeze(transaction),
  });
}

export function craftFirstBit(profile: Profile) {
  const before = profile.inventory;

  if (profile.restoration.gravityModuleRepaired) {
    return result(profile, {
      applied: false,
      recipeId: FIRST_BIT_RECIPE.id,
      before,
      after: before,
      reason: "gravity_module_repaired",
    });
  }
  if (before.bits > 0) {
    return result(profile, {
      applied: false,
      recipeId: FIRST_BIT_RECIPE.id,
      before,
      after: before,
      reason: "bit_already_available",
    });
  }
  if (before.duds < FIRST_BIT_RECIPE.costs.duds) {
    return result(profile, {
      applied: false,
      recipeId: FIRST_BIT_RECIPE.id,
      before,
      after: before,
      reason: "insufficient_duds",
    });
  }
  if (
    before.pulseCharges < FIRST_BIT_RECIPE.costs.pulseCharges
  ) {
    return result(profile, {
      applied: false,
      recipeId: FIRST_BIT_RECIPE.id,
      before,
      after: before,
      reason: "insufficient_pulse_charges",
    });
  }

  const nextProfile = updateProfile(profile, {
    inventory: {
      duds: before.duds - FIRST_BIT_RECIPE.costs.duds,
      pulseCharges:
        before.pulseCharges - FIRST_BIT_RECIPE.costs.pulseCharges,
      bits: before.bits + FIRST_BIT_RECIPE.output.bits,
    },
  });
  return result(nextProfile, {
    applied: true,
    recipeId: FIRST_BIT_RECIPE.id,
    before,
    after: nextProfile.inventory,
    reason: null,
  });
}
