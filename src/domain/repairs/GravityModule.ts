import {
  updateProfile,
  type Profile,
  type ProfileInventory,
} from "../profile/Profile";

export const GRAVITY_MODULE_ID = "gravity_module";

export type GravityRepairFailure =
  | "already_repaired"
  | "bit_required";

export interface GravityRepairTransaction {
  readonly applied: boolean;
  readonly moduleId: typeof GRAVITY_MODULE_ID;
  readonly before: ProfileInventory;
  readonly after: ProfileInventory;
  readonly reason: GravityRepairFailure | null;
}

function result(
  profile: Profile,
  transaction: GravityRepairTransaction,
) {
  return Object.freeze({
    profile,
    transaction: Object.freeze(transaction),
  });
}

export function installGravityModuleBit(profile: Profile) {
  const before = profile.inventory;

  if (profile.restoration.gravityModuleRepaired) {
    return result(profile, {
      applied: false,
      moduleId: GRAVITY_MODULE_ID,
      before,
      after: before,
      reason: "already_repaired",
    });
  }
  if (before.bits < 1) {
    return result(profile, {
      applied: false,
      moduleId: GRAVITY_MODULE_ID,
      before,
      after: before,
      reason: "bit_required",
    });
  }

  const nextProfile = updateProfile(profile, {
    inventory: {
      bits: before.bits - 1,
    },
    restoration: {
      gravityModuleRepaired: true,
    },
    flags: {
      firstRepairComplete: true,
    },
  });
  return result(nextProfile, {
    applied: true,
    moduleId: GRAVITY_MODULE_ID,
    before,
    after: nextProfile.inventory,
    reason: null,
  });
}
