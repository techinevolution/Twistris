# Twistris Plan

## Current State

The prototype currently supports the title flow, falling and rotating pieces, central attachment, imbalance-driven stack rotation, centered-square growth, Pulse charge counting, and an animated capacity harvest. Duds and charges can accumulate as session-only counters, but there is no saved profile, metagame, crafting screen, repair system, mission layer, or tutorial yet.

The current runtime is concentrated in `game.js`. Gameplay rules, lifecycle state, input, rendering, animation, HUD updates, and harvest banking share one class and several global helpers.

## Current Product Goal

Prepare the prototype for persistent Pulse restoration without changing the feel of the existing puzzle loop. The immediate work is architectural stabilization and trustworthy state separation, followed by the smallest complete harvest-to-profile loop.

## Current Architecture Shape

Twistris is a dependency-free browser project with one HTML entry point, one stylesheet, one JavaScript runtime, and a browser smoke harness. See [ARCHITECTURE.md](ARCHITECTURE.md) for the current map, risks, and intended boundaries.

## Next Implementation Slices

1. **Characterize current behavior**
   Add deterministic coverage for locking, detached-piece retry, board rotation, centered-square growth, harvest totals, restart behavior, and run-versus-banked values.

2. **Clarify runtime state**
   Separate profile, run, lifecycle, and presentation state inside the existing runtime. Replace overlapping lifecycle booleans with an explicit phase while preserving behavior.

3. **Make harvest atomic**
   Calculate one immutable harvest result, bank it once, and animate a visual copy. Resource awards must not depend on particle arrival timing.

4. **Extract pure puzzle rules**
   Move board creation, attachment, rotation, balance analysis, centered-square detection, and harvest calculation behind a DOM-free boundary that the smoke harness can test directly.

5. **Add local profile persistence**
   Introduce a small versioned save shape with safe load, create, reset, and migration behavior. Keep transient animation state out of the save.

6. **Separate runtime presentation**
   Incrementally isolate canvas rendering and input from the game controller. Keep the active board on canvas and prepare DOM surfaces for profile, missions, harvesting, fabrication, and repair.

7. **Build the first complete progression loop**
   Track run-earned resources, show a harvest summary, bank them to the profile, and complete one visible Pulse repair.

8. **Build the first-run tutorial**
   Teach the real, already-working run and repair systems. Do not create tutorial-only versions of unfinished mechanics.

## Recommended Next Slice

Implement slice 1 only: strengthen the browser smoke harness and introduce deterministic test seams without changing game behavior or splitting production files yet.

This gives the refactor a safety net and provides evidence that later state and file moves preserve the game.

## Deferred Work

- Final Dud-to-Bit-to-Charged-Bit recipes.
- Cracked-piece return and Bit Dust pressure.
- Repair-pattern placement gameplay.
- Random Charged Bits inside falling pieces.
- Mission variety beyond the first resource goal.
- Bit Battles or system-reclamation activities.
- Infinite or expanding-board mode.
- Large crafting trees, modification slots, and puzzle power upgrades.

## Open Questions

- What exact recipes convert Duds into Bits and Bits into Charged Bits?
- Is Bit Dust a banked resource, an in-run pressure system, or both?
- Does the first Pulse repair restore the gyro as one puzzle-affecting exception, or should early repairs remain entirely metagame-facing?
- What ends a normal run besides reaching board capacity?
- Which subsystem unlocks missions, fabrication, and eventual infinite mode?
- Should the first profile support one named player or multiple local profiles?

## Validation Path

- Run `node --check game.js` when Node is available.
- Open `tests/smoke.html` and confirm all browser smoke checks pass.
- Open `index.html` and manually verify title, controls, attachment, twist, pause, restart, harvest, HUD, and responsive layout after behavioral or visual changes.
- Keep the working tree free of unintended generated files.

## Stop Rules

- Stop if PROJECT_OUTLINE.md, PLAN.md, and ARCHITECTURE.md disagree.
- Do not implement unresolved resource recipes as permanent save fields.
- Do not combine a behavior change with a large file move.
- Do not tie economy awards or persistence to animation timing.
- Do not add a framework, bundler, backend, or external service without approval.
- Do not begin tutorial, Bit Battle, or infinite-mode work before the first progression loop is proven.
