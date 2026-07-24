# Twistris Architecture

## Overview

Twistris is currently a Vite-served browser game with a retained legacy comparison route and an accepted Phaser runtime at `/next/`. Typed puzzle, economy, and profile modules own outcomes, `GameApplication` owns lifecycle and progression transactions, Phaser owns animated presentation, and browser capabilities enter through injected platform adapters.

The approved target remains browser-first and uses TypeScript, Vite, Phaser, Vitest, and Playwright. The Phaser proof is accepted, but the migration remains incremental: preserve the working game and port only after behavioral and visual parity can be demonstrated. The final presentation uses one long-lived motherboard World scene rather than separate player-visible title, puzzle, crafting, and Board scenes.

The tracked architecture is sized for the demo: onboarding, one mission loop, Gravity repair, one firewall sector, Endless Feed, and a small upgrade set. It should keep clean expansion boundaries without building the full campaign in advance.

## Repo Structure

- `index.html`: game shell, canvas, title overlay, HUD mounts, and keyboard focus helper
- `style.css`: responsive page layout and DOM overlay presentation
- `src/domain/rules.ts`: typed DOM-free board, balance, centered-square, and harvest calculations
- `src/domain/puzzle/PuzzleRun.ts`: typed DOM-free active-piece, gravity, ghost, attachment, retry, lock, balance, and pending-rotation state for the Phaser port
- `src/domain/economy/SessionEconomy.ts`: pure page-session inventory and exactly-once harvest transactions
- `src/domain/profile/Profile.ts`: pure versioned profile creation, validation, migration, and harvest updates
- `src/app/state/ProfileStore.ts`: platform-neutral local profile load, save, recovery, and reset behavior
- `src/app/state/GameApplication.ts`: validated application modes, typed events, harvest IDs, profile saves, and session-economy coordination
- `src/app/platform/PlatformAdapters.ts`: portable storage, audio, haptics, fullscreen, lifecycle, and achievements contracts
- `game.js`: constants, shapes, game state, input, controller effects, harvest presentation, rendering, and startup
- `next/index.html`: accepted Phaser runtime shell
- `src/next/`: Phaser runtime bootstrap, browser platform adapters, and DOM overlay behavior
- `src/scenes/world/`: persistent Phaser World scene; the title is one presentation phase inside it
- `src/presentation/camera/`: typed camera modes shared by the World scene and later Board controls
- `proofs/phaser.html`: isolated Phaser proof page
- `src/proof/phaser-proof.ts`: bounded scene, input, tween, camera, and diagnostics proof
- `src/proof/phaser-proof.css`: proof-only page layout and touch controls
- `tests/rules.test.ts`: Vitest unit coverage for the pure rules module
- `tests/puzzle-run.test.ts`: Vitest characterization for the typed Phaser-port puzzle model
- `tests/smoke.html`: browser smoke harness that loads the production runtime
- `package.json` and `package-lock.json`: development commands and pinned dependency graph
- `tsconfig.json`: strict TypeScript settings for typed source and tests
- `vite.config.ts`: production entries for the playable game and isolated proof
- `PROJECT_OUTLINE.md`: intended product destination
- `PLAN.md`: current implementation order
- `DATA_FORMATS.md`: current profile contract and provisional future data
- `BALANCE_PLAN.md`: balance model and tuning notes
- `TESTING.md`: validation guidance

## Main Entry Points

- `index.html`: starts the playable game by loading `style.css` and the module-based `game.js`
- `src/domain/rules.ts`: exports the frozen `TwistrisRules` API without reading browser UI state
- `game.js`: imports the rules API, creates the game instance, binds browser input, sizes the canvas, and starts the animation loop
- `next/index.html`: loads the accepted Phaser route while `/` remains the retained legacy comparison
- `proofs/phaser.html`: loads the isolated Phaser motion proof without importing the playable controller
- `tests/smoke.html`: loads production scripts, tests rules directly, and exercises controller integration through a hidden test DOM

## Current Major Pieces

- **Game controller:** `BalanceStackGame` currently owns four explicit state buckets: page-session inventory, the current run, lifecycle phase, and transient presentation.
- **Puzzle rules:** `src/domain/rules.ts` owns pure board creation, attachment, rotation, balance, centered-square, and harvest calculations.
- **Canvas renderer:** drawing helpers share the global canvas context and constants.
- **Input:** global keyboard sets are read directly by the game update loop.
- **Harvest:** the controller creates an immutable result, applies it once to session inventory, and gives the animation a presentation copy.
- **DOM shell:** the title button and small HUD surround the canvas.
- **Phaser proof:** a separate page proves Twistris-styled rendering, camera shake, tweens, keyboard/touch input, FIT scaling, walking Bits, and lightweight runtime diagnostics.
- **World scene runtime:** the accepted parity port keeps title, puzzle, pause, restart, growth, twist, harvest, responsive framing, focus handoff, and return-to-title presentation inside one persistent World scene. Its camera controller distinguishes title close-up, guided pullback, Pulse home, puzzle, and free Board modes. Only the Pulse sector is currently mounted.
- **Typed puzzle run:** `/next/` renders its active piece, ghost, settled cells, and next-piece preview from a DOM-free model that consumes the existing attachment, balance, and board-rotation rules.
- **Twist presentation:** a successful off-balance lock stages a separate rotated board, freezes puzzle input, turns the settled mass and Pulse through the characterized 340 ms overshoot, then commits the staged board.
- **Core-growth presentation:** the typed puzzle run derives completed centered layers and awards run Charges before exposing a one-shot presentation event. The World scene consumes that event for the neutral field, inward burst, Pulse scale, and DOM HUD update without making economy outcomes depend on animation.
- **Application controller:** `GameApplication` validates title, launch, puzzle, pause, harvest, and return transitions; publishes typed application events; and coordinates page-session transactions without importing Phaser or browser APIs.
- **Session economy:** `SessionEconomy` applies immutable harvest results once and returns a frozen before/after transaction. It has no scene, DOM, storage, or timing dependency.
- **Local profile:** `Profile` defines and validates the version-one progression record. `ProfileStore` serializes it through the injected storage adapter and safely creates, migrates, recovers, or resets without importing Phaser.
- **Capacity harvest:** the typed puzzle run creates the immutable harvest classification and result. `GameApplication` commits it through `SessionEconomy` before `WorldScene` begins the collapse and resource-transfer presentation.
- **Platform boundary:** portable contracts cover storage, audio, haptics, fullscreen, lifecycle, and achievements. The `/next/` browser entry injects browser implementations; no domain module calls browser or wrapper APIs.

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
    world/
  presentation/
    camera/
    layers/
  ui/
    scene/
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
- **Application state:** typed events and explicit mode changes between first-run prelude, Pulse hub, puzzle, harvest, crafting, repair, Board, and pause.
- **World scene:** one long-lived Phaser scene owns the visible Pulse, motherboard, puzzle space, modules, traces, Bits, Bugs, and camera.
- **Sector residency:** the World scene does not require every Board sector to be instantiated. Compact sector state persists separately while only revealed sectors near the camera are mounted, awakened, rendered, and interactive.
- **Presentation layers:** staged title/Tetris elements, fog, particles, camera effects, walking Bits, Bugs, HUD anchors, and interaction layers appear or transform without replacing the World scene or deciding outcomes.
- **Camera controller:** explicit camera modes handle guided tutorial framing, Pulse-home framing, puzzle framing, and free Board exploration. Desktop wheel/drag and touch pinch/drag inputs feed this controller without changing domain outcomes.
- **UI scene and DOM overlays:** accessible dialogs and commands may sit above the World scene without owning game outcomes.
- **Tutorial director:** coordinates documented beats through real application events without owning economy or demo-board rules.
- **Storage:** a platform-neutral adapter that validates and migrates the same serialized profile in browser or packaged builds.
- **Platform adapters:** storage, audio, haptics, fullscreen, lifecycle, achievements, and later storefront integration.
- **World-anchored UI:** HTML/CSS overlays provide accessible text and commands while Phaser keeps the Pulse, motherboard, and first firewall sector visibly present.

`src/domain/rules.ts` is the first migrated production boundary. It must remain free of Phaser, DOM, storage, and platform dependencies.

## Current `/next/` Data Flow

1. Browser input reaches the persistent `WorldScene`.
2. `PuzzleRun` moves or locks the active piece and produces puzzle outcomes without Phaser or DOM access.
3. A lock can grow the centered square, award run Charges, or stage a board rotation.
4. Reaching capacity creates an immutable harvest result.
5. `GameApplication` validates the harvest transition and commits the result through `SessionEconomy` exactly once.
6. `GameApplication` applies the same accepted result to the in-memory profile and queues a storage write.
7. The typed application event boundary publishes the mode and transaction after inventory is decided.
8. `WorldScene` animates collapse and display-only counters toward the already-banked totals.
9. The DOM shell presents accessible controls and counters without deciding gameplay or economy outcomes.

## Intended Progression Data Flow

1. Pure run rules produce an immutable harvest result.
2. A profile transaction applies that result exactly once.
3. The updated profile is saved locally.
4. Presentation animates the already-decided result.
5. Pure demo-board and mission rules calculate valid firewall actions and objectives.
6. Scenes and overlays present only those valid missions, recipes, repairs, and first-sector actions.

## Persistence and State

The `/next/` route loads one anonymous version-one profile from `twistris.profile` before creating Phaser. Browser local storage is the first adapter; packaged builds may later use platform storage while preserving the same payload. Missing data creates a default, malformed or unsupported data recovers safely, and the supported version-zero shape migrates its inventory. Storage failure leaves a usable in-memory profile and emits an application event after failed harvest saves.

The profile persists approved inventory, restoration milestones, generic upgrade IDs, run statistics, and first-run/repair flags. Applied harvest IDs and the next harvest sequence remain page-session safeguards. Run state, animation state, mission progress, unresolved resources, recipes, wrapper paths, permissions, and platform handles are not persisted.

## External Services and Integrations

The project now uses npm for local development dependencies. It still has no backend, account system, analytics service, or cloud dependency.

The current foundation includes Vite, TypeScript, Vitest, and Phaser. Phaser powers the isolated proof and the incrementally ported `/next/` World scene while the legacy route remains available for parity. PWA packaging, Capacitor mobile shells, desktop wrappers, storefront SDKs, and platform achievements remain deferred.

## Validation and Build Shape

Current:

- Vite supplies development and production builds.
- TypeScript checks the migrated source boundary.
- Vitest owns pure-rule unit tests.
- The 63-check browser harness remains at `/tests/smoke.html` through the Vite server.
- The accepted Phaser proof remains at `/proofs/phaser.html` for visual, input, responsive, and frame-pacing checks.
- The accepted Phaser parity runtime remains at `/next/`; `/` and its harness stay available as retained comparisons.
- Manual visual and interaction checks use the Vite-served game.
- `node --check game.js` remains available for the legacy controller.

Next:

- Slice 10 introduces the first pure crafting and Gravity Module repair transactions without putting progression outcomes in Phaser.
- Playwright will own critical browser flows, responsive checks, and selected visual comparisons after it is introduced.
- The legacy smoke harness remains until equivalent coverage and runtime parity are approved.

## Important Invariants

- The core board has one fixed center pivot.
- Settled pieces lock only after a downward collision with existing structure; side adjacency alone never causes attachment.
- The bottom board edge is an exit boundary, never an attachment surface; any shape reaching it retries before adjacency is evaluated.
- Gravity remains downward in screen space while the settled structure may rotate.
- Centered-square growth is derived from board occupancy.
- Run-earned and banked resources are separate concepts.
- Banking happens once per harvest and does not depend on animation completion.
- Profile saves are versioned and exclude transient presentation state.
- The browser build remains canonical across web, desktop-wrapper, Android, and iOS packaging.
- Platform APIs are accessed only through adapters.
- Simulation outcomes are independent of render frame rate and visual-effect quality.
- Board camera position and zoom are presentation state, bounded to revealed world space, and never affect puzzle or economy calculations.
- Continuous world coordinates do not imply continuous resource use. Fog-hidden or distant sectors may remain unmounted or asleep, then reconstruct their presentation from compact domain and profile state when needed.

## Known Constraints and Risks

- `game.js` still has a large change surface because controller, input, presentation, and rendering remain together.
- Controller tests require the full runtime and a simulated DOM shell; pure rules can run without either.
- Random piece selection now accepts an optional injected source for deterministic browser tests.
- The accepted `/next/` session transaction is separated, but the retained legacy comparison still owns its older transaction internally.
- The legacy controller remains JavaScript and is not yet covered by TypeScript.
- Canvas rendering and game mutation share global state.
- The first Bit recipe and Charged Bits' firewall role are approved, but Charged Bit recipes, exact firewall rules, Bit Dust, and later conversions remain provisional.
- Migrating rendering can subtly change input feel, timing, scaling, and the current visual identity.
- Running legacy and Phaser paths in parallel for too long would create duplicate behavior and maintenance cost.
- The isolated Phaser proof builds to roughly 1.39 MB minified before gzip; the playable port should use deliberate loading and chunk boundaries rather than putting the engine on unrelated pages.
- Fog, blur, particles, Bugs, and walking Bits can pressure mobile rendering if objects are not pooled, culled, and bounded.
- Vite ends the permanent direct-`file://` workflow after migration; development uses a local server and releases use production builds.
- Clean expansion boundaries must not become speculative full-game infrastructure during demo development.
