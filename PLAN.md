# Twistris Plan

## Current State

The prototype currently supports the title flow, falling and rotating pieces, central attachment, imbalance-driven stack rotation, centered-square growth, Pulse charge counting, and an animated capacity harvest. Duds and charges can accumulate as session-only counters, but there is no saved profile, metagame, crafting screen, repair system, mission layer, or tutorial yet.

The browser runtime remains centered on `game.js`, but board and economy calculations now live in the typed, DOM-free `src/domain/rules.ts` boundary. Lifecycle, input, rendering, animation, HUD updates, and session transactions remain controller responsibilities.

## Current Product Goal

Release a polished browser-first demo that carries players through the complete onboarding sequence, the first mission and progression loop, one firewall-sector recovery, and an Endless Feed mode with a small upgrade set.

The modern toolchain migration is complete. The immediate work is a bounded Phaser proof. Demo persistence and metagame implementation follow only after the new presentation stack proves that it can reproduce the current game smoothly.

## Current Architecture Shape

Twistris is currently a Vite browser project with one HTML entry point, one stylesheet, one legacy JavaScript controller, a typed pure-rules module, Vitest unit coverage, and the retained browser smoke harness.

The approved target is a TypeScript and Vite browser game using Phaser for scenes and animated presentation, Vitest for pure logic, Playwright for browser and visual flows, and HTML/CSS overlays for accessible interface surfaces. See [ARCHITECTURE.md](ARCHITECTURE.md) for the current and target maps.

## Next Implementation Slices

1. **Characterize current behavior - Complete**
   The browser harness now covers deterministic piece selection, locking, detached-piece retry, both rotation directions, multi-layer centered-square growth, harvest totals, restart behavior, lifecycle transitions, and run-versus-banked values.

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

7. **Port the existing playable runtime incrementally**
   Establish one long-lived motherboard World scene plus UI and presentation layers. Port current rendering, input, rotation, harvest, and title behavior into that continuous space in reviewable pieces while retaining the pure rules and characterization tests. Remove the legacy runtime only after parity is demonstrated.
   **In progress:** the isolated `/next/` route reproduces the animated logo, spinning close-up Pulse, orbiting particles, Start control, 2.05-second pullback, quarter-turn settling, HUD reveal, responsive framing, and focus handoff. Desktop and `390x844` mobile checks hold 60 FPS. This Boot/Title scene is migration scaffolding; it must be folded into the persistent World scene rather than becoming a player-visible screen boundary. The current `/` game remains unchanged.

8. **Establish application, domain, and platform boundaries**
   Separate puzzle, economy, profile, mission, and demo-board logic from Phaser scenes. Add a typed application event boundary and adapters for storage, audio, haptics, fullscreen, lifecycle, and later platform achievements. Do not call wrapper-specific APIs from domain logic.

9. **Add local profile persistence**
   Introduce a small versioned save shape with safe load, create, reset, and migration behavior. Persist demo inventory, Gravity Module repair, first-sector status, mission progress, Endless Feed unlock, selected upgrades, and tutorial flags only when their rules are approved. Keep transient animation and scene state out of the save.

10. **Build the first complete progression loop**
    Track run-earned resources, show a harvest result, bank it to the profile, craft the first Bit, and install it in the Gravity Module.

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

Continue slice 7 by establishing the persistent motherboard World scene on `/next/` and moving the accepted title presentation into one of its layers.

Once that continuous world boundary is proven, render the board, settled Pulse seed, falling piece, ghost, and next-piece preview inside it while consuming the existing typed rules. Match movement, rotation, drop timing, focus, and responsive behavior before porting twist and harvest presentation. Do not create player-visible page swaps between title, puzzle, Pulse hub, Craft, or Board; do not add progression or remove the legacy controller.

## Deferred Work

- Fabrication beyond the established first Bit and required demo Charged Bit path.
- Mission variety beyond the demo's first objective.
- Additional Board regions or a detailed full-game campaign.
- Large crafting trees and upgrade sets beyond the demo.
- PWA installation and offline packaging.
- Capacitor projects for Android and iOS.
- A desktop wrapper and storefront integration.

Detailed post-demo design belongs in the gitignored local ideation area and is not part of this public implementation plan.

## Open Questions

- How does the demo create or award the Charged Bit needed for the firewall?
- Does Bit Dust belong in the demo at all?
- Does a failed Charged Bit produce recoverable Bit Dust or only a visual residue?
- What exactly makes Endless Feed endless while preserving performance and puzzle clarity?
- Which three or four upgrades ship in the demo, and what are their attainable costs?
- What limits, if any, keep Gyro Override useful without trivializing placement?
- Should the first profile support one named player or multiple local profiles?
- Which desktop wrapper and storefront integrations are appropriate when a PC release is scheduled?

## Validation Path

- Run the documented `dev`, `build`, `test`, and `typecheck` commands for every stack slice.
- Open `/tests/smoke.html` through Vite and retain all 62 legacy characterization checks until parity coverage is approved.
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
