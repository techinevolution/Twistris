# Twistris Architecture

## Overview

Twistris is currently a small browser-native game. The browser loads a minimal HTML shell, CSS lays out the canvas and overlays, and `game.js` owns nearly all runtime behavior. This is appropriate for the prototype, but the next progression systems need clearer state and ownership boundaries before they are added.

The intended refactor is incremental. Preserve the working game, extract testable rules first, and keep the project directly openable without a build step.

## Repo Structure

- `index.html`: game shell, canvas, title overlay, HUD mounts, and keyboard focus helper
- `style.css`: responsive page layout and DOM overlay presentation
- `game.js`: constants, shapes, game state, input, puzzle rules, harvest sequence, rendering, and startup
- `tests/smoke.html`: browser smoke harness that loads the production runtime
- `PROJECT_OUTLINE.md`: intended product destination
- `PLAN.md`: current implementation order
- `DATA_FORMATS.md`: provisional state and persistence guidance
- `BALANCE_PLAN.md`: balance model and tuning notes
- `TESTING.md`: validation guidance

## Main Entry Points

- `index.html`: starts the playable game by loading `style.css` and `game.js`
- `game.js`: creates the game instance, binds browser input, sizes the canvas, and starts the animation loop
- `tests/smoke.html`: creates a hidden test DOM, loads `game.js`, and exercises the exposed test API

## Current Major Pieces

- **Game controller:** `BalanceStackGame` currently owns four explicit state buckets: page-session inventory, the current run, lifecycle phase, and transient presentation.
- **Puzzle rules:** attachment, rotation, balance, and centered-square growth live as class methods and global helpers.
- **Canvas renderer:** drawing helpers share the global canvas context and constants.
- **Input:** global keyboard sets are read directly by the game update loop.
- **Harvest:** calculation, animation phases, counter display, and session banking are currently interleaved.
- **DOM shell:** the title button and small HUD surround the canvas.

## Intended Boundaries

- **Core rules:** pure board and economy calculations with no DOM or canvas access.
- **Session state:** banked inventory that survives run resets for the current page load. This becomes part of the profile boundary when persistence is added.
- **Run state:** temporary board, piece, resource, and run-summary values.
- **Profile state:** versioned banked inventory, repair progress, unlocks, and statistics.
- **Lifecycle:** one explicit screen or game phase such as title, playing, paused, harvesting, or repairing.
- **Presentation:** canvas animation, particles, camera effects, and DOM updates that never decide economy outcomes.
- **Storage:** a small browser-storage adapter that validates and migrates profile data.
- **Metagame UI:** DOM-based profile, mission, fabrication, and repair surfaces around the canvas game.

These boundaries do not require a framework. They may begin as separate sections or browser scripts and should only become additional files when the extraction is behaviorally proven.

## Current Data Flow

1. Browser events update global key state.
2. The animation loop calls `game.update(dt)`.
3. The controller moves or locks the active piece and mutates the board.
4. A lock can grow the centered square, award run charges, or start a stack rotation.
5. Reaching capacity starts a phased harvest animation.
6. Harvest particles currently increment session bank counters as they arrive.
7. `game.draw()` renders the current state to the canvas and updates DOM HUD text.

## Intended Progression Data Flow

1. Pure run rules produce an immutable harvest result.
2. A profile transaction applies that result exactly once.
3. The updated profile is saved locally.
4. Presentation animates the already-decided result.
5. Metagame screens read the profile and offer only valid missions, recipes, and repairs.

## Persistence and State

There is no persistent save yet. `session.bankedDuds` and `session.bankedPulseCharges` survive run resets within the current page session only. Restart replaces the `run` state while preserving the `session` state.

Future persistence should use browser local storage, a versioned root object, safe defaults, and explicit migrations. Run state and animation state must not be persisted as profile inventory.

## External Services and Integrations

None currently. The project has no package manager, backend, account system, analytics service, or cloud dependency.

## Validation and Build Shape

- No build step is required.
- Browser logic checks live in `tests/smoke.html`.
- Visual and interaction checks use `index.html` directly.
- `node --check game.js` is an optional syntax check when Node is available.

## Important Invariants

- The core board has one fixed center pivot.
- Settled pieces must attach to the existing structure.
- Gravity remains downward in screen space while the settled structure may rotate.
- Centered-square growth is derived from board occupancy.
- Run-earned and banked resources are separate concepts.
- Banking happens once per harvest and does not depend on animation completion.
- Profile saves are versioned and exclude transient presentation state.
- Direct browser opening remains supported.

## Known Constraints and Risks

- `game.js` currently has a large change surface because it owns most systems.
- Browser tests require the full runtime and a simulated DOM shell.
- Random piece selection now accepts an optional injected source for deterministic browser tests.
- Harvest presentation still decides when earned resources enter the session bank.
- Canvas rendering and game mutation share global state.
- Product resource names and conversion recipes are still provisional.
