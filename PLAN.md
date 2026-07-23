# Twistris Plan

## Current State

The prototype currently supports the title flow, falling and rotating pieces, central attachment, imbalance-driven stack rotation, centered-square growth, Pulse charge counting, and an animated capacity harvest. Duds and charges can accumulate as session-only counters, but there is no saved profile, metagame, crafting screen, repair system, mission layer, or tutorial yet.

The browser runtime remains centered on `game.js`, but board and economy calculations now live in the DOM-free `rules.js` boundary. Lifecycle, input, rendering, animation, HUD updates, and session transactions remain controller responsibilities.

## Current Product Goal

Prepare the prototype for persistent Pulse restoration without changing the feel of the existing puzzle loop. The immediate work is architectural stabilization and trustworthy state separation, followed by the smallest complete harvest-to-profile loop.

## Current Architecture Shape

Twistris is a dependency-free browser project with one HTML entry point, one stylesheet, one JavaScript runtime, and a browser smoke harness. See [ARCHITECTURE.md](ARCHITECTURE.md) for the current map, risks, and intended boundaries.

## Next Implementation Slices

1. **Characterize current behavior - Complete**
   The browser harness now covers deterministic piece selection, locking, detached-piece retry, both rotation directions, multi-layer centered-square growth, harvest totals, restart behavior, lifecycle transitions, and run-versus-banked values.

2. **Clarify runtime state - Complete**
   The existing runtime now separates session, run, lifecycle, and presentation state. One explicit phase replaces the overlapping title, launch, play, pause, and harvest booleans.

3. **Make harvest atomic - Complete**
   Harvest now creates one immutable result, applies it to the session bank exactly once, and animates presentation-only counters. Resource awards no longer depend on particle arrival or animation completion.

4. **Extract pure puzzle rules - Complete**
   `rules.js` now owns board creation, attachment, rotation, balance analysis, centered-square detection, and harvest calculation without DOM or canvas access. The controller consumes those results and retains effects.

5. **Add local profile persistence**
   Introduce a small versioned save shape with safe load, create, reset, and migration behavior. Keep transient animation state out of the save.

6. **Separate runtime presentation**
   Incrementally isolate canvas rendering and input from the game controller. Keep the active board on canvas and prepare DOM surfaces for profile, missions, harvesting, fabrication, and repair.

7. **Build the first complete progression loop**
   Track run-earned resources, show a harvest summary, bank them to the profile, and complete one visible Pulse repair.

8. **Build the first-run tutorial**
   Teach the real, already-working run and repair systems. Do not create tutorial-only versions of unfinished mechanics.

## Recommended Next Slice

Implement slice 5 only: add a small versioned local profile with safe create, load, reset, and migration behavior.

Persist only approved banked inventory and profile progress. The approved initial inventory is Pulse charges, Duds, and Bits. Keep run state and presentation state out of storage, and do not add Charged Bits or Bit Dust until their rules are resolved. Crafting behavior itself remains outside slice 5.

## Deferred Work

- Fabrication recipes beyond the established first Bit recipe.
- Cracked-piece return and Bit Dust pressure.
- Repair-pattern placement gameplay.
- Random Charged Bits inside falling pieces.
- Mission variety beyond the first resource goal.
- Bit Battles or system-reclamation activities.
- Infinite or expanding-board mode.
- Large crafting trees, modification slots, and puzzle power upgrades.

## Open Questions

- What recipes create Charged Bits and later repair materials?
- Is Bit Dust a banked resource, an in-run pressure system, or both?
- Does the first Pulse repair restore the gyro as one puzzle-affecting exception, or should early repairs remain entirely metagame-facing?
- What ends a normal run besides reaching board capacity?
- Which subsystem unlocks missions, fabrication, and eventual infinite mode?
- Should the first profile support one named player or multiple local profiles?

## Validation Path

- Run `node --check rules.js` and `node --check game.js` when Node is available.
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
