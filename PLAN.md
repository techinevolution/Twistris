# Twistris Plan

## Current State

The prototype currently supports the title flow, falling and rotating pieces, central attachment, imbalance-driven stack rotation, centered-square growth, Pulse charge counting, an animated capacity harvest, one local profile, first-Bit crafting, and Gravity Module repair. There is no mission layer, Board reclamation, firewall, or tutorial yet.

The accepted `/next/` runtime uses `PuzzleRun` for run rules, `SessionEconomy` for atomic session banking, pure first-Bit and Gravity Module transactions for progression, `Profile` and `ProfileStore` for durable local state, and `GameApplication` for validated lifecycle transitions and typed application events. Phaser owns input and animated presentation, while browser capabilities enter through platform adapters. The retained legacy route remains centered on `game.js` for comparison.

## Current Product Goal

Release a polished browser-first demo that carries players through the complete onboarding sequence, the first mission and progression loop, one firewall-sector recovery, and an Endless Feed mode with a small upgrade set.

The modern toolchain migration, playable Phaser parity port, application/domain/platform boundaries, versioned local profile, and first complete progression loop are complete. The immediate work is the first bounded Board reclamation slice.

## Current Architecture Shape

Twistris is currently a Vite browser project with a retained legacy route, an accepted Phaser `/next/` route, typed puzzle and economy rules, a typed application controller, injected browser platform adapters, Vitest unit coverage, and the retained browser smoke harness.

The approved target is a TypeScript and Vite browser game using Phaser for scenes and animated presentation, Vitest for pure logic, Playwright for browser and visual flows, and HTML/CSS overlays for accessible interface surfaces. See [ARCHITECTURE.md](ARCHITECTURE.md) for the current and target maps.

## Next Implementation Slices

1. **Characterize current behavior - Complete**
   The browser harness now covers deterministic piece selection, locking, detached-piece and bottom-exit retry, both rotation directions, multi-layer centered-square growth, harvest totals, restart behavior, lifecycle transitions, and run-versus-banked values.

2. **Clarify runtime state - Complete**
   The existing runtime now separates session, run, lifecycle, and presentation state. One explicit phase replaces the overlapping title, launch, play, pause, and harvest booleans.

3. **Make harvest atomic - Complete**
   Harvest now creates one immutable result, applies it to the session bank exactly once, and animates presentation-only counters. Resource awards no longer depend on particle arrival or animation completion.

4. **Extract pure puzzle rules - Complete**
   The original `rules.js` boundary established board creation, attachment, rotation, balance analysis, centered-square detection, and harvest calculation without DOM or canvas access. The controller consumes those results and retains effects.

5. **Introduce the modern toolchain without changing behavior - Complete**
   The package manifest and lockfile now provide Vite, TypeScript, and Vitest plus `dev`, `build`, `test`, and `typecheck` commands. Pure rules moved first to `src/domain/rules.ts`; focused unit tests supplement the retained 62-check browser harness. The title, puzzle, controls, harvest, and visible presentation remain unchanged.

6. **Prove Phaser with one bounded visual slice - Complete**
   The isolated `/proofs/phaser.html` entry reproduces the Pulse, one falling piece, camera shake, and a two-footed Bit that emerges from the Pulse, walks a connected copper trace, and hops into a socket. Keyboard and touch input, WebGL rendering, FIT scaling, and 60 FPS presentation passed on desktop and a `390x844` mobile viewport. The existing playable controller remains untouched. Phaser adds a roughly 1.39 MB minified proof chunk, so loading boundaries remain a slice 7 concern.

7. **Port the existing playable runtime incrementally - Complete**
   Establish one long-lived motherboard World scene plus UI and presentation layers. Port current rendering, input, rotation, harvest, and title behavior into that continuous space in reviewable pieces while retaining the pure rules and characterization tests. Remove the legacy runtime only after parity is demonstrated.
   The isolated `/next/` route now reproduces the animated logo, spinning close-up Pulse, orbiting particles, Start and Enter launch, 2.05-second pullback, quarter-turn settling, HUD reveal, focus handoff, pause, restart, miss feedback, and responsive framing. That presentation lives inside the persistent World scene with typed title-closeup, guided-pullback, Pulse-home, puzzle, and Board-free camera modes. A DOM-free puzzle-run model drives the visible board, Pulse seed, falling piece, ghost, next-piece preview, normal and soft gravity, movement, piece rotation, hard drop, attachment locks, bottom-exit and detached-piece retries, balance analysis, staged board rotation, centered-square growth, run Charge awards, immutable capacity-harvest calculation, and placement metadata used by presentation. Off-balance locks freeze the active piece while the settled mass and Pulse perform the characterized 340 ms overshooting quarter-turn, then commit the rotated board. Colored Bits retain the legacy diagonal depth, inner glow, edge shimmer, and fade sparkle; older outer Bits fade, influenced Bits use the secured treatment and light agitation, and the connected mass keeps its colored outline. Completing centered layers expands the Pulse field, draws the inward energy burst, pulses the core, and updates the Charge HUD from the already-decided domain result. Reaching capacity banks the immutable result once, presents the warning and collapse, transfers Duds and Charges to their responsive HUD destinations, and returns to a clean title state. The scene mounts only the Pulse sector, preserving the future loading boundary without adding hidden Board content. The legacy `/` runtime and 63-check browser harness remain as retained comparisons until a later removal decision; progression is intentionally deferred to the following slices.

8. **Establish application, domain, and platform boundaries - Complete**
   `GameApplication` now owns validated title, launch, puzzle, pause, harvest, and return transitions; emits typed mode, restart, and harvest events; allocates session-unique harvest IDs; and exposes the current banked inventory. Pure `SessionEconomy` applies immutable harvest results exactly once outside Phaser and returns a before/after transaction for presentation. `WorldScene` retains puzzle timing, input, camera, animation, and display counters but no longer owns lifecycle or banked inventory decisions. Portable contracts now cover storage, audio, haptics, fullscreen, lifecycle, and achievements, with browser implementations injected at the `/next/` entry point. Profile, mission, and demo-board modules remain intentionally absent until their approved rules are implemented.

9. **Add local profile persistence - Complete**
   One anonymous versioned local demo profile now loads before Phaser starts. Pure validation normalizes malformed values, explicitly migrates the supported version-zero inventory shape, recovers unsupported or invalid data, and excludes transient scene state. `ProfileStore` provides create, load, save, and reset behavior through the storage adapter, including a usable in-memory fallback when storage is unavailable. `GameApplication` starts from the loaded inventory and queues each applied harvest to storage before presentation completes. The schema includes approved Duds, Pulse charges, Bits, Gravity repair, first-firewall status, Endless Feed unlock, generic upgrade IDs, run statistics, and first-run/repair flags. Mission progress, Charged Bits, Bit Dust, recipes, and named profile slots remain absent until their rules are approved.

10. **Build the first complete progression loop - Complete**
    Run-earned Duds and Pulse charges now appear in a harvest-result dialog after their atomic profile transaction. The only Craft recipe spends exactly `8 Duds + 1 Pulse charge`, adds one Bit, and saves before eight Duds circle into the Pulse and the reconstructed Bit walks into its counter. The application then offers only the Gravity Module action, consumes the ordinary Bit without another resource cost, saves the repair, and presents the Bit walking along a Pulse-connected copper trace before hopping into the module socket. The module stops shaking, reports **GRAVITY GYRO STABILIZED** and **MODULE ONLINE**, and remains repaired after reload. Pure recipe and repair transactions reject shortages, duplicates, and invalid modes. Board, firewall, mission, tutorial, Charged Bit, Bit Dust, and extra-recipe behavior remain absent.

11. **Build the first Board reclamation slice**
    Add only the Pulse region, fog boundary, broken firewall, and one Bug-held sector required by the demo. Keep reclamation outcomes pure and separate from walking-Bit and Bug presentation.

12. **Add the first mission and repeatable game loop**
    Use **FEED THE PULSE** to start the four-charge mission, return through harvest and crafting, and advance the first Board objective.

13. **Build the first-run tutorial**
    Implement the documented reveal sequence using the real title, puzzle, crafting, repair, Board, and mission systems. Support one-time automatic play plus later replay. Do not create tutorial-only economy or demo-board rules.

14. **Complete the firewall recovery and demo ending**
    Give the player an attainable Charged Bit path, send it to the broken firewall, secure the first sector, present a clear demo-complete result, and unlock **ENDLESS FEED**.

15. **Add the demo's Endless upgrade loop**
    Select and implement approximately three or four upgrades, including evaluation of the optional Gyro Override. Keep upgrade costs attainable, expose no more than two equipment slots if slots are used, and preserve the identity of automatic twisting.

16. **Harden and release the demo**
    Tune onboarding and firewall pacing, add replay/reset/settings and reduced-effects behavior, complete accessibility and performance checks, validate save migrations, and prepare the browser release. Do not expand the public scope to additional Board sectors.

## Recommended Next Slice

Begin slice 11 with only the Pulse region, its fog boundary, the broken firewall, and one Bug-held sector required by the demo. Define reclamation outcomes as pure domain transactions before adding the walking-Bit, Bug, fog, and camera presentation. Do not add missions, the tutorial, Endless Feed, a second sector, or unresolved Charged Bit fabrication in this slice.

## Deferred Work

- Fabrication beyond the established first Bit and required demo Charged Bit path.
- Mission variety beyond the demo's first objective.
- Additional Board regions or a detailed full-game campaign.
- Large crafting trees and upgrade sets beyond the demo.
- PWA installation and offline packaging.
- Capacitor projects for Android and iOS.
- A desktop wrapper and storefront integration.
- Final damaged-Pulse art direction and restoration-stage visual redesign; the current Pulse geometry is temporary.

Detailed post-demo design belongs in the gitignored local ideation area and is not part of this public implementation plan.

## Open Questions

- How does the demo create or award the Charged Bit needed for the firewall?
- Does Bit Dust belong in the demo at all?
- Does a failed Charged Bit produce recoverable Bit Dust or only a visual residue?
- What exactly makes Endless Feed endless while preserving performance and puzzle clarity?
- Which three or four upgrades ship in the demo, and what are their attainable costs?
- What limits, if any, keep Gyro Override useful without trivializing placement?
- Whether a later release needs named players or multiple local profiles; the demo starts with one anonymous local profile.
- Which desktop wrapper and storefront integrations are appropriate when a PC release is scheduled?

## Validation Path

- Run the documented `dev`, `build`, `test`, and `typecheck` commands for every stack slice.
- Open `/tests/smoke.html` through Vite and retain all 63 legacy characterization checks until parity coverage is approved.
- After the Phaser proof, use Playwright for critical browser flows and stable visual checkpoints.
- Manually verify title, controls, attachment, twist, pause, restart, harvest, HUD, keyboard, touch, and responsive layout after behavioral or visual changes.
- Target smooth 60 FPS presentation on desktop and modern mobile hardware. Pool repeated objects, cap effects, cull hidden Board entities, and bound rendering resolution.
- Test visual slices at desktop, mobile-width, high-density, and reduced-effects settings.
- Keep the working tree free of unintended generated files.

## Stop Rules

- Stop if PROJECT_OUTLINE.md, PLAN.md, and ARCHITECTURE.md disagree.
- Do not implement unresolved resource recipes as permanent save fields.
- Do not combine a behavior change with a large file move.
- Do not tie economy awards or persistence to animation timing.
- Do not add React, a backend, cloud services, a database, or a second game engine without approval.
- Do not port the full runtime to Phaser before the bounded proof is accepted.
- Do not remove the legacy runtime or smoke harness before behavioral parity is demonstrated.
- Do not let Phaser scenes determine economy, mission, demo-board, repair, or persistence outcomes.
- Do not call Capacitor, desktop-wrapper, or storefront APIs directly from domain logic.
- Do not begin PC, Android, or iOS packaging during the browser-game foundation slices.
- Do not implement the tutorial before the real systems it teaches are proven.
- Do not model title, puzzle, Pulse hub, Craft, and Board as disconnected player-visible screens.
- Do not add a second Board sector or publish detailed full-game plans as part of the demo.
- Do not promote an idea from the local private design area without Katherine's explicit approval.
