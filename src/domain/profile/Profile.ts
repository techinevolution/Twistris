import type {
  BankedInventory,
  HarvestAward,
} from "../economy/SessionEconomy";

export const PROFILE_VERSION = 1 as const;

export interface ProfileInventory extends BankedInventory {
  readonly bits: number;
}

export interface Profile {
  readonly version: typeof PROFILE_VERSION;
  readonly inventory: ProfileInventory;
  readonly restoration: {
    readonly gravityModuleRepaired: boolean;
    readonly firewallSectorSecured: boolean;
    readonly endlessFeedUnlocked: boolean;
  };
  readonly upgrades: {
    readonly unlockedIds: ReadonlyArray<string>;
    readonly equippedIds: ReadonlyArray<string>;
  };
  readonly stats: {
    readonly totalRuns: number;
    readonly totalHarvests: number;
    readonly bestCoreLayers: number;
  };
  readonly flags: {
    readonly firstRunComplete: boolean;
    readonly firstRepairComplete: boolean;
  };
}

export type ProfileDecodeSource = "loaded" | "migrated" | "recovered";

export interface ProfileDecodeResult {
  readonly profile: Profile;
  readonly source: ProfileDecodeSource;
  readonly needsSave: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toCount(value: unknown): number {
  return typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0
    ? Math.floor(value)
    : 0;
}

function toBoolean(value: unknown): boolean {
  return value === true;
}

function toIds(value: unknown): ReadonlyArray<string> {
  if (!Array.isArray(value)) return Object.freeze([]);
  return Object.freeze(
    [
      ...new Set(
        value
          .filter((id): id is string => typeof id === "string")
          .map((id) => id.trim())
          .filter(Boolean),
      ),
    ],
  );
}

function freezeProfile(input: {
  inventory?: Record<string, unknown>;
  restoration?: Record<string, unknown>;
  upgrades?: Record<string, unknown>;
  stats?: Record<string, unknown>;
  flags?: Record<string, unknown>;
} = {}): Profile {
  const inventory = input.inventory ?? {};
  const restoration = input.restoration ?? {};
  const upgrades = input.upgrades ?? {};
  const stats = input.stats ?? {};
  const flags = input.flags ?? {};
  const unlockedIds = toIds(upgrades.unlockedIds);
  const unlocked = new Set(unlockedIds);
  const equippedIds = Object.freeze(
    toIds(upgrades.equippedIds).filter((id) => unlocked.has(id)),
  );

  return Object.freeze({
    version: PROFILE_VERSION,
    inventory: Object.freeze({
      duds: toCount(inventory.duds),
      pulseCharges: toCount(inventory.pulseCharges),
      bits: toCount(inventory.bits),
    }),
    restoration: Object.freeze({
      gravityModuleRepaired: toBoolean(
        restoration.gravityModuleRepaired,
      ),
      firewallSectorSecured: toBoolean(
        restoration.firewallSectorSecured,
      ),
      endlessFeedUnlocked: toBoolean(
        restoration.endlessFeedUnlocked,
      ),
    }),
    upgrades: Object.freeze({
      unlockedIds,
      equippedIds,
    }),
    stats: Object.freeze({
      totalRuns: toCount(stats.totalRuns),
      totalHarvests: toCount(stats.totalHarvests),
      bestCoreLayers: toCount(stats.bestCoreLayers),
    }),
    flags: Object.freeze({
      firstRunComplete: toBoolean(flags.firstRunComplete),
      firstRepairComplete: toBoolean(flags.firstRepairComplete),
    }),
  });
}

export function createProfile(): Profile {
  return freezeProfile();
}

function normalizeVersionOne(value: Record<string, unknown>): Profile {
  return freezeProfile({
    inventory: isRecord(value.inventory) ? value.inventory : undefined,
    restoration: isRecord(value.restoration)
      ? value.restoration
      : undefined,
    upgrades: isRecord(value.upgrades) ? value.upgrades : undefined,
    stats: isRecord(value.stats) ? value.stats : undefined,
    flags: isRecord(value.flags) ? value.flags : undefined,
  });
}

function migrateVersionZero(value: Record<string, unknown>): Profile {
  return freezeProfile({
    inventory: {
      duds: value.bankedDuds,
      pulseCharges: value.bankedPulseCharges,
      bits: value.bits,
    },
  });
}

export function decodeProfile(value: unknown): ProfileDecodeResult {
  if (!isRecord(value)) {
    return Object.freeze({
      profile: createProfile(),
      source: "recovered",
      needsSave: true,
    });
  }

  if (value.version === 0) {
    return Object.freeze({
      profile: migrateVersionZero(value),
      source: "migrated",
      needsSave: true,
    });
  }

  if (value.version !== PROFILE_VERSION) {
    return Object.freeze({
      profile: createProfile(),
      source: "recovered",
      needsSave: true,
    });
  }

  const profile = normalizeVersionOne(value);
  return Object.freeze({
    profile,
    source: "loaded",
    needsSave: JSON.stringify(value) !== JSON.stringify(profile),
  });
}

export function applyHarvestToProfile(
  profile: Profile,
  result: HarvestAward,
): Profile {
  return freezeProfile({
    inventory: {
      ...profile.inventory,
      duds: profile.inventory.duds + result.earned.duds,
      pulseCharges:
        profile.inventory.pulseCharges + result.earned.pulseCharges,
    },
    restoration: { ...profile.restoration },
    upgrades: {
      unlockedIds: profile.upgrades.unlockedIds,
      equippedIds: profile.upgrades.equippedIds,
    },
    stats: {
      totalRuns: profile.stats.totalRuns + 1,
      totalHarvests: profile.stats.totalHarvests + 1,
      bestCoreLayers: Math.max(
        profile.stats.bestCoreLayers,
        toCount(result.runStats?.coreLayersReached),
      ),
    },
    flags: {
      ...profile.flags,
      firstRunComplete: true,
    },
  });
}
