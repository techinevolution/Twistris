# Data Formats

## Purpose
This document describes the intended shape of runtime state and persisted save data for Twistris.

It is not a code-level API contract yet. It is implementation guidance so new systems use consistent names and responsibilities.

## 1. Naming Rules
- Use `camelCase` for JavaScript object keys.
- Use explicit resource names:
  - `pulseCharges`
  - `duds`
  - `repairBlocks`
- Distinguish `run-earned` values from `banked` profile values.
- Keep save data versioned from the start.

## 2. Runtime Concepts

### Pulse Charges
- Harvest resource generated when the centered square expands by one layer.
- Exists during a run as a run-earned value.
- Becomes banked profile currency at harvest end.

### Duds
- Salvaged from influenced gray blocks at harvest end.
- May also be granted by scripted tutorial events.
- Becomes banked profile salvage at harvest end unless the tutorial intentionally grants it early.

### Repair Blocks
- Crafted resource created from `8 duds + 1 pulseCharge`.
- Used to plug voids or holes that prevent Pulse growth.

## 3. Suggested Runtime State
Suggested top-level buckets inside the game state:

```js
{
  profile: {},
  run: {},
  tutorial: {},
  crafting: {},
  repair: {}
}
```

### `profile`
Long-term saved progression.

```js
{
  version: 1,
  playerName: "Katherine",
  banked: {
    pulseCharges: 0,
    duds: 0,
    repairBlocks: 0
  },
  pulse: {
    repairTier: 0,
    gyroRestored: false,
    unlockedRepairs: []
  },
  stats: {
    totalRuns: 0,
    totalHarvests: 0,
    bestCoreLayers: 0
  },
  flags: {
    firstRunComplete: false,
    namePromptSeen: false,
    firstRepairComplete: false
  }
}
```

### `run`
Temporary values earned or tracked during the current run only.

```js
{
  earned: {
    pulseCharges: 0,
    duds: 0
  },
  summary: {
    coreLayersReached: 0,
    collapseReason: "out_of_bounds_lock"
  },
  harvestReady: false
}
```

### `tutorial`
Special gating for the first-run scripted opening.

```js
{
  active: false,
  phase: "intro",
  gyroDisabled: true,
  scriptedDudDrops: 0,
  grantedStartingCharge: false,
  firstCraftComplete: false
}
```

### `crafting`
State needed for current recipe and auto-use flows.

```js
{
  availableRecipes: [
    {
      id: "repair_block_mk1",
      costs: { duds: 8, pulseCharges: 1 },
      output: { repairBlocks: 1 }
    }
  ],
  lastCraftResult: null
}
```

### `repair`
Current repair interaction state.

```js
{
  pendingVoidCell: null,
  autoPlugEnabled: true,
  selectedRepairId: null
}
```

## 4. Harvest Summary Shape
Suggested shape for the run-end harvest screen:

```js
{
  earned: {
    pulseCharges: 2,
    duds: 11
  },
  bankBefore: {
    pulseCharges: 3,
    duds: 20,
    repairBlocks: 1
  },
  bankAfter: {
    pulseCharges: 5,
    duds: 31,
    repairBlocks: 1
  },
  runStats: {
    coreLayersReached: 2,
    bestSquareSide: 5
  }
}
```

## 5. Repair Definition Shape
Suggested format for repair definitions:

```js
{
  id: "gyro_bootstrap",
  name: "Gyro Bootstrap",
  costs: {
    pulseCharges: 1,
    duds: 8
  },
  effects: {
    gyroRestored: true,
    repairTierDelta: 1
  },
  visualState: "gyro_online"
}
```

## 6. Profile Persistence Rules
- Save to browser local storage first.
- Use one root save object per player profile.
- Include `version` for migrations.
- Keep a clear separation between banked profile data and current-run data.
- Do not persist transient animation state.

## 7. Fields That Should Stay Derived
These should generally be computed, not saved:
- current centered square size from board occupancy
- current influence area from `coreLayers`
- next-piece preview layout positions
- balance profile values

## 8. Migration Rule
Whenever saved data changes incompatibly:
- bump `version`
- add a migration path in code
- note the change in [OUTLINE.md](/Users/katherinephillips/Documents/Twistris/OUTLINE.md) or [TODO.md](/Users/katherinephillips/Documents/Twistris/TODO.md) if it affects milestone work

## 9. Next Data Shapes To Formalize
- named profile list or single-profile container
- tutorial message event payloads
- void-detection result shape
- dud queue-piece state
- dying-mino timer state
