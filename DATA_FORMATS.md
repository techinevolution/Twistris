# Twistris Data Formats

## Purpose

This document records the current version-one local profile contract plus provisional guidance for future runtime data. [PLAN.md](PLAN.md) controls when additional shapes are implemented, and unresolved resources must not be treated as permanent schema.

## Stable Rules

- Use `camelCase` for JavaScript keys.
- Keep the root save object versioned.
- Separate session/profile, run, lifecycle, and presentation state.
- Keep run-earned resources separate from banked inventory.
- Apply each harvest result exactly once.
- Do not persist board-derived values or transient animation state.
- Validate loaded data and fall back safely when a save is missing or malformed.
- Keep the serialized profile format portable across browser, desktop-wrapper, Android, and iOS storage adapters.
- Keep platform-specific paths, handles, permissions, and wrapper metadata outside the profile payload.

## Suggested Top-Level Runtime Shape

```js
{
  session: {},
  run: {},
  lifecycle: {},
  presentation: {}
}
```

### `session` and `profile`

The current `/next/` runtime loads one anonymous local profile before Phaser starts. `GameApplication` seeds `SessionEconomy` from its banked Duds and Pulse charges, commits an applied harvest to both boundaries, and queues the updated profile for storage before harvest presentation completes.

```js
{
  bankedPulseCharges: 0,
  bankedDuds: 0,
  nextHarvestSequence: 1,
  appliedHarvestResultIds: []
}
```

The sequence is application metadata and the applied-ID list belongs to the page-session economy state. They are not persistent profile fields. Repeated application of the same result remains idempotent within the running application.

The version-one profile is the demo's local progression record. Pulse charges, Duds, and Bits are approved inventory keys. Charged Bits, Bit Dust, mission progress, recipes, player names, and multiple save slots remain provisional and are not serialized.

```ts
{
  version: 1,
  inventory: {
    pulseCharges: 0,
    duds: 0,
    bits: 0
  },
  restoration: {
    gravityModuleRepaired: false,
    firewallSectorSecured: false,
    endlessFeedUnlocked: false
  },
  upgrades: {
    unlockedIds: [],
    equippedIds: []
  },
  stats: {
    totalRuns: 0,
    totalHarvests: 0,
    bestCoreLayers: 0
  },
  flags: {
    firstRunComplete: false,
    firstRepairComplete: false
  }
}
```

The storage key is `twistris.profile`. Loaded values are normalized to finite nonnegative integers, strict booleans, unique non-empty upgrade IDs, and equipped IDs that are already unlocked. Missing data creates and stores a default profile. Malformed or unsupported data recovers to the default profile. The supported version-zero migration preserves the former flat Dud, Pulse-charge, and Bit counts.

### `run`

Temporary state for one puzzle run.

```js
{
  phase: "playing",
  earned: {
    pulseCharges: 0,
    duds: 0
  },
  summary: {
    coreLayersReached: 0,
    endReason: null
  }
}
```

### `lifecycle`

One explicit application phase rather than several overlapping booleans.

```js
{
  phase: "title"
}
```

Candidate phases include `title`, `playing`, `paused`, `harvesting`, `profile`, `fabricating`, and `repairing`.

### `presentation`

Animation and view state only. None of this should determine profile inventory.

```js
{
  harvestAnimation: null,
  rotationAnimation: null,
  particles: []
}
```

## Harvest Result

The core rule layer should produce one immutable result before presentation begins.

```js
{
  id: "run-local-sequence-id",
  earned: {
    pulseCharges: 2,
    duds: 11,
    bitDust: 0
  },
  runStats: {
    coreLayersReached: 2,
    bestSquareSide: 5
  },
  endReason: "capacity_reached"
}
```

`SessionEconomy` records that the result was applied, then `GameApplication` updates and queues the profile save before the animation. Presentation remains independent of the storage write.

## Repair Definitions

Repair definitions should be data-driven once recipes and subsystem rules are approved.

The first implemented recipe and repair are deliberately code-level constants rather than a general recipe catalog:

```ts
{
  recipeId: "first_bit",
  costs: { duds: 8, pulseCharges: 1 },
  output: { bits: 1 }
}

{
  moduleId: "gravity_module",
  cost: { bits: 1 },
  effect: { gravityModuleRepaired: true }
}
```

Both transactions return immutable before/after inventory plus an applied flag and guarded failure reason. The accepted profile saves before presentation. Installing the ordinary Bit consumes no Pulse charge and does not create a Charged Bit.

```js
{
  id: "example_system_repair",
  name: "Example System Repair",
  costs: {},
  prerequisites: [],
  effects: {
    restoredSystem: "example_system"
  },
  visualState: "example_system_online"
}
```

## Derived Values

Do not save values that can be recomputed safely:

- centered square size from board occupancy
- Pulse influence area from centered-square growth
- balance profile and twist prediction
- preview layout positions
- particle positions and animation timers

## Migration Rule

When persisted data changes incompatibly:

1. Bump `version`.
2. Add an explicit migration from supported older versions.
3. Preserve inventory when possible.
4. Fall back to a recoverable default rather than leaving the game unusable.
5. Record product-impacting changes in DECISIONS.md and schedule implementation in PLAN.md.

## Open Data Questions

- Whether post-demo releases need named players or multiple local profiles.
- The demo's Charged Bit source or fabrication recipe.
- Whether Bit Dust exists in inventory, only during a run, or both.
- Four-charge mission and first-firewall progress shapes.
- Endless Feed unlock and demo-upgrade definition shapes.
- Whether duplicate-harvest IDs eventually need to survive a browser process interruption; current IDs protect one running application session.
