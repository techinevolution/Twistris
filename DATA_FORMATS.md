# Twistris Data Formats

## Purpose

This document records provisional state and persistence guidance. It is not yet a code-level contract. [PLAN.md](PLAN.md) controls when these shapes are implemented, and unresolved resources must not be treated as permanent schema.

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

### `session` and future `profile`

The current `/next/` runtime has a page-session inventory only. `GameApplication` coordinates it through the pure `SessionEconomy` boundary until profile persistence is implemented.

```js
{
  bankedPulseCharges: 0,
  bankedDuds: 0,
  nextHarvestSequence: 1,
  appliedHarvestResultIds: []
}
```

The sequence is application metadata and the applied-ID list belongs to the session-economy state. Persistence may replace their implementation later, but repeated application of the same result must remain idempotent.

The future `profile` is the demo's local progression record. Pulse charges, Duds, and Bits are approved initial inventory keys. Charged Bits and Bit Dust remain provisional.

```js
{
  version: 1,
  playerName: "Sample Player",
  inventory: {
    pulseCharges: 0,
    duds: 0,
    bits: 0
  },
  pulse: {
    repairStage: 0,
    gravityModuleRepaired: false
  },
  demo: {
    firewallSectorSecured: false,
    endlessFeedUnlocked: false,
    unlockedUpgrades: [],
    equippedUpgrades: []
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

`SessionEconomy` records that the result was applied and updates banked inventory before the animation. A future profile transaction must preserve that ordering and save independently of presentation.

## Repair Definitions

Repair definitions should be data-driven once recipes and subsystem rules are approved.

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

- Single local profile or multiple named profiles.
- The demo's Charged Bit source or fabrication recipe.
- Whether Bit Dust exists in inventory, only during a run, or both.
- Four-charge mission and first-firewall progress shapes.
- Endless Feed unlock and demo-upgrade definition shapes.
- Safe duplicate-harvest protection strategy.
