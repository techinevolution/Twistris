# Twistris Architecture

## Overview

Twistris is currently a small browser-native game. The browser loads a minimal HTML shell, CSS lays out the canvas and overlays, `rules.js` owns pure puzzle and harvest calculations, and `game.js` owns runtime orchestration and presentation.

The approved target remains browser-first but adds TypeScript, Vite, Phaser, Vitest, and Playwright. The migration must be incremental: preserve the working game, prove the engine with one bounded visual slice, and port only after behavioral and visual parity can be demonstrated.

The tracked architecture is sized for the demo: onboarding, one mission loop, Gravity repair, one firewall sector, Endless Feed, and a small upgrade set. It should keep clean expansion boundaries without building the full campaign in advance.

## Repo Structure

- `index.html`: game shell, canvas, title overlay, HUD mounts, and keyboard focus helper
- `style.css`: responsive page layout and DOM overlay presentation
- `rules.js`: DOM-free board, balance, centered-square, and harvest calculations
- `game.js`: constants, shapes, game state, input, controller effects, harvest presentation, rendering, and startup
- `tests/smoke.html`: browser smoke harness that loads the production runtime
- `PROJECT_OUTLINE.md`: intended product destination
- `PLAN.md`: current implementation order
- `DATA_FORMATS.md`: provisional state and persistence guidance
- `BALANCE_PLAN.md`: balance model and tuning notes
- `TESTING.md`: validation guidance

## Main Entry Points

- `index.html`: starts the playable game by loading `style.css`, `rules.js`, and `game.js`
- `rules.js`: exposes the frozen `TwistrisRules` API without reading browser UI state
- `game.js`: creates the game instance, binds browser input, sizes the canvas, and starts the animation loop
- `tests/smoke.html`: loads production scripts, tests rules directly, and exercises controller integration through a hidden test DOM

## Current Major Pieces

- **Game controller:** `BalanceStackGame` currently owns four explicit state buckets: page-session inventory, the current run, lifecycle phase, and transient presentation.
- **Puzzle rules:** `rules.js` owns pure board creation, attachment, rotation, balance, centered-square, and harvest calculations.
- **Canvas renderer:** drawing helpers share the global canvas context and constants.
- **Input:** global keyboard sets are read directly by the game update loop.
- **Harvest:** the controller creates an immutable result, applies it once to session inventory, and gives the animation a presentation copy.
- **DOM shell:** the title button and small HUD surround the canvas.

## Approved Target Stack

- **TypeScript:** typed game state, events, profiles, recipes, missions, demo-board nodes, and adapters.
- **Vite:** development server, module graph, assets, and production browser build.
- **Phaser:** scene lifecycle, rendering, cameras, tweens, input, audio, and animated game objects.
- **Vitest:** direct tests for pure puzzle, economy, profile, mission, and demo-board logic.
- **Playwright:** critical browser flows, responsive interaction checks, and stable visual checkpoints.
- **HTML/CSS overlays:** accessible dialogs, warnings, crafting, missions, settings, and text-heavy interfaces.
- **Local profile storage:** browser storage first, accessed through a portable adapter.

React, a backend, cloud services, a database, and a second game engine are not part of the approved foundation.

## Target Source Shape

```text
src/
  domain/
    puzzle/
    economy/
    demo-board/
    missions/
    profile/
  app/
    state/
    tutorial/
    platform/
  scenes/
    boot-title/
    puzzle/
    board/
  ui/
    dialogs/
    crafting/
    missions/
    counters/
```

This is an ownership map, not permission to create every directory at once. Each migration slice should add only the boundary it proves.

## Intended Boundaries

- **Core rules:** pure board and economy calculations with no DOM or canvas access.
- **Session state:** banked inventory that survives run resets for the current page load. This becomes part of the profile boundary when persistence is added.
- **Run state:** temporary board, piece, resource, and run-summary values.
- **Profile state:** versioned banked inventory, demo repair progress, first-sector status, Endless unlock, selected upgrades, and statistics.
- **Application state:** typed events and explicit transitions between title, tutorial, menu, puzzle, harvest, crafting, repair, Board, and pause.
- **Scenes:** Phaser owns presentation lifecycle, cameras, input routing, tweens, audio, and visible game objects.
- **Tutorial director:** coordinates documented beats through real application events without owning economy or demo-board rules.
- **Presentation:** animation, particles, camera effects, walking Bits, Bugs, fog, and DOM updates that never decide outcomes.
- **Storage:** a platform-neutral adapter that validates and migrates the same serialized profile in browser or packaged builds.
- **Platform adapters:** storage, audio, haptics, fullscreen, lifecycle, achievements, and later storefront integration.
- **Metagame UI:** HTML/CSS overlays for accessible text and commands, with Phaser rendering the Pulse region and first firewall sector.

`rules.js` is the first extracted production boundary. It should migrate into the typed domain without acquiring Phaser, DOM, storage, or platform dependencies.

## Current Data Flow

1. Browser events update global key state.
2. The animation loop calls `game.update(dt)`.
3. The controller moves or locks the active piece and mutates the board.
4. A lock can grow the centered square, award run charges, or start a stack rotation.
5. Reaching capacity creates an immutable harvest result and banks it once.
6. A phased harvest animation advances display-only counters toward the already-banked totals.
7. `game.draw()` renders the current state to the canvas and updates DOM HUD text.

## Intended Progression Data Flow

1. Pure run rules produce an immutable harvest result.
2. A profile transaction applies that result exactly once.
3. The updated profile is saved locally.
4. Presentation animates the already-decided result.
5. Pure demo-board and mission rules calculate valid firewall actions and objectives.
6. Scenes and overlays present only those valid missions, recipes, repairs, and first-sector actions.

## Persistence and State

There is no persistent save yet. `session.bankedDuds` and `session.bankedPulseCharges` survive run resets within the current page session only. Restart replaces the `run` state while preserving the `session` state.

Future persistence should use a versioned root object, safe defaults, and explicit migrations. Browser local storage is the first adapter; packaged builds may later use platform storage while preserving the same payload. Run state, animation state, wrapper paths, permissions, and platform handles must not be persisted as profile inventory.

## External Services and Integrations

None currently. The project has no package manager, backend, account system, analytics service, or cloud dependency.

The approved foundation adds local development dependencies and Phaser only. PWA packaging, Capacitor mobile shells, desktop wrappers, storefront SDKs, and platform achievements remain deferred.

## Validation and Build Shape

Current:

- No build step is required.
- Browser logic checks live in `tests/smoke.html`.
- Visual and interaction checks use `index.html` directly.
- `node --check rules.js` and `node --check game.js` provide syntax checks.

Target:

- Vite supplies development and production builds.
- TypeScript supplies type checking.
- Vitest owns pure domain and transaction tests.
- Playwright owns critical browser flows, responsive checks, and selected visual comparisons.
- The legacy smoke harness remains until equivalent coverage and runtime parity are approved.

## Important Invariants

- The core board has one fixed center pivot.
- Settled pieces must attach to the existing structure.
- Gravity remains downward in screen space while the settled structure may rotate.
- Centered-square growth is derived from board occupancy.
- Run-earned and banked resources are separate concepts.
- Banking happens once per harvest and does not depend on animation completion.
- Profile saves are versioned and exclude transient presentation state.
- The browser build remains canonical across web, desktop-wrapper, Android, and iOS packaging.
- Platform APIs are accessed only through adapters.
- Simulation outcomes are independent of render frame rate and visual-effect quality.

## Known Constraints and Risks

- `game.js` still has a large change surface because controller, input, presentation, and rendering remain together.
- Controller tests require the full runtime and a simulated DOM shell; pure rules can run without either.
- Random piece selection now accepts an optional injected source for deterministic browser tests.
- The session transaction still lives inside the game controller.
- Production startup depends on loading `rules.js` before `game.js`.
- Canvas rendering and game mutation share global state.
- The first Bit recipe and Charged Bits' firewall role are approved, but Charged Bit recipes, exact firewall rules, Bit Dust, and later conversions remain provisional.
- Migrating rendering can subtly change input feel, timing, scaling, and the current visual identity.
- Running legacy and Phaser paths in parallel for too long would create duplicate behavior and maintenance cost.
- Fog, blur, particles, Bugs, and walking Bits can pressure mobile rendering if objects are not pooled, culled, and bounded.
- Vite ends the permanent direct-`file://` workflow after migration; development uses a local server and releases use production builds.
- Clean expansion boundaries must not become speculative full-game infrastructure during demo development.
