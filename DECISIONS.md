# Twistris Decisions

## 2026-07-23: Keep Application And Platform Decisions Outside Phaser

Decision: Use a typed application controller for lifecycle and session transactions, pure domain modules for puzzle and economy outcomes, and injected platform adapters for storage, audio, haptics, fullscreen, lifecycle, and achievements.

Reason: The persistent World scene should coordinate animation and input without becoming the owner of inventory, progression, saves, missions, Board outcomes, or wrapper APIs.

Consequences: `WorldScene` may present application decisions but does not bank harvests or validate lifecycle transitions. Browser implementations are wired at the `/next/` entry point, packaged builds can replace them without changing domain rules, and future profile, mission, and demo-board logic receives its own tested module only when that slice implements real approved behavior.

## 2026-07-23: Keep The World Continuous Without Loading It All

Decision: Preserve one connected Board coordinate space while mounting and simulating only the revealed sectors close enough to the active camera or current interaction.

Reason: The player should experience one physical motherboard, but fog-hidden regions do not need graphics, particles, Bugs, physics, or input handlers consuming phone and desktop resources.

Consequences: Durable sector facts live in compact domain and profile state. A sector presentation can be created or awakened as it becomes relevant and slept or removed when it leaves the active region. Unloading presentation must not discard secured, infested, repaired, discovered, or mission state.

## 2026-07-23: Explore The Board Through The Existing World Camera

Decision: Make **BOARD** pull the existing camera outward and enable free navigation across the revealed motherboard instead of opening a separate map screen.

Reason: Continuous panning and zooming preserves the physical relationship between the Pulse, copper traces, modules, fog, and the first firewall sector.

Consequences: Desktop input uses drag-to-pan and mouse-wheel zoom; touch input uses one-finger pan and pinch-to-zoom. Camera movement must be bounded to revealed space, preserve the Pulse as a recenter landmark, and remain separate from puzzle simulation outcomes.

## 2026-07-23: Keep The Entire Game On One Continuous Board

Decision: Present puzzle play, the Pulse hub, crafting, repair, harvest, and Board activity as modes and camera framings of one persistent motherboard world.

Reason: The first-run reveal already establishes spatial continuity: the false Tetris interface breaks away to expose the Pulse and motherboard underneath. Keeping that language makes the Pulse feel like the central processor of a real connected system rather than a menu selection.

Consequences: The recurring title/home view is the Pulse hub with **FEED THE PULSE**, **BOARD**, and **CRAFT**. Phaser should use one long-lived World scene for the visible machine, with camera movement, presentation layers, and accessible overlays handling mode changes. Full-screen scene replacement may be used internally only when it does not break the player's sense of one physical Board. The current isolated Boot/Title parity route is migration scaffolding, not the final world structure.

## 2026-07-23: Accept Phaser For The Incremental Presentation Port

Decision: Accept the bounded Phaser motion proof and proceed with an incremental playable-runtime port. Keep the proof isolated until each real scene reaches behavioral and visual parity.

Reason: The proof reproduced Twistris's Pulse, falling-piece motion, camera response, keyboard and touch input, responsive FIT scaling, and the walking-Bit socket jump at 60 FPS on desktop and a `390x844` mobile viewport. The existing game and all 62 browser checks remained unchanged.

Consequences: Slice 7 may begin with Boot/Title parity, but it must not rewrite the entire controller at once. The proof's roughly 1.39 MB minified Phaser chunk also makes deliberate loading and chunk boundaries a release concern.

## 2026-07-22: Scope The Public Repository To The Demo

Decision: Make the tracked Twistris repository entirely about releasing the demo. The demo ends after the player completes onboarding, repairs the Gravity Module, secures the first firewall sector, unlocks Endless Feed, and gains access to a small upgrade set.

Reason: This produces a complete, testable, replayable release without requiring the full Board campaign to be designed or built first.

Consequences: Additional Board regions, campaign structure, large crafting trees, and detailed post-demo systems are outside the tracked scope. The public demo may hint that more Board exists, but it does not specify what lies beyond the first sector.

## 2026-07-22: Keep Full-Game Ideation Local Until Promoted

Decision: Store speculative post-demo ideas under the gitignored `notes/private/` area. Do not track or publish them until Katherine explicitly promotes an idea into the project outline, decisions, and plan.

Reason: The private area preserves creative exploration while keeping GitHub focused on the demo and avoiding accidental promises about the full game.

Consequences: Local notes are not a source of truth for implementation. Agents must follow tracked project documents and must not commit the private ideation directory.

## 2026-07-22: Modernize Around A Browser-First Game Stack

Decision: Migrate Twistris incrementally to TypeScript and Vite, use Phaser for scenes and animated presentation, use Vitest for pure logic, and use Playwright for critical browser and visual flows.

Reason: The documented onboarding, crafting, first Board sector, fog, Bugs, camera work, and walking Bits exceed the safe scope of the current 2,177-line runtime. A game-oriented scene and tween system addresses the difficult presentation work while typed domain modules protect economy and progression behavior.

Consequences: A local development server and production build replace direct `file://` opening after the toolchain migration. The current runtime and smoke harness remain until the new stack proves behavioral and visual parity. React, a backend, and additional engines are not part of the approved stack.

## 2026-07-22: Keep One Portable Web Game Codebase

Decision: Treat the browser build as canonical and preserve later packaging paths to PC, Android, and iOS through thin wrappers and platform adapters.

Reason: Phaser targets desktop and mobile browsers, while the same web build can later be wrapped for stores without rewriting the game.

Consequences: Browser standards are the default. Platform-specific storage, haptics, fullscreen, lifecycle, achievements, and storefront calls must remain behind adapters. PWA, Capacitor, desktop-wrapper, and storefront work are deferred until the browser game is ready.

## 2026-07-22: Make Performance A Cross-Platform Constraint

Decision: Target smooth 60 FPS presentation on desktop and modern mobile hardware. Cap render resolution, pool repeated Bits, Bugs, and particles, cull hidden Board entities, suspend unnecessary work in the background, and provide reduced effects.

Reason: The puzzle simulation is modest, but fog, blur, particles, swarms, and long cinematic sequences can create avoidable rendering pressure on phones.

Consequences: Every visual slice needs desktop and mobile-class validation. Domain simulation must remain independent of render frame rate, and visual effects may scale down without changing outcomes.

## 2026-07-22: Give Bits A Shared Walking Animation

Decision: Ordinary Bits and Charged Bits travel with two tiny feet. They walk along surfaces or copper traces and make a small hop into counters, upgrade slots, and firewall sockets.

Reason: The movement gives individual Bits personality, makes resource travel easy to follow, and supports the visual idea of small units moving across the Board without requiring elaborate character animation.

Consequences: The first fabricated Bit walks to its counter and later walks to the Gravity Module before jumping into place. Charged Bits use the same visual language. The animation should stay simple and reusable so routine crafting and Board actions remain quick.

## 2026-07-22: Use Feed The Pulse As The Play Action

Decision: After the first Board threat reveal, return to the Pulse menu and introduce **FEED THE PULSE** as the persistent action for starting puzzle runs. The first normal mission is to generate four Pulse charges.

Reason: The label connects ordinary play directly to the restoration fiction, while a simple charge goal lets the player practice the core square-growth loop after the guided cinematic sequence.

Consequences: The first unrestricted puzzle run begins only after the Gravity Module is repaired and the Bug threat is revealed. Mission variety beyond this first charge goal remains deferred.

## 2026-07-22: Reveal The Board Threat Through A Firewall Failure

Decision: After the Gravity Module repair, reveal a small protected Board region surrounded by fog of war. An old Charged Bit fails, its firewall collapses, and Bugs swarm the exposed section without reaching the Pulse.

Reason: A visible system failure teaches Bugs, fog of war, firewalls, and the defensive purpose of Charged Bits through one event instead of explanatory menus.

Consequences: The broken firewall becomes the player's next clear restoration objective. Charged Bits provide sustained security to reclaimed regions. Whether a failed Charged Bit produces collectible Bit Dust remains unresolved.

## 2026-07-22: Use The First Bit To Restore The Gravity Module

Decision: After the tutorial fabricates its first Bit, install that ordinary Bit into the broken Gravity Module to stabilize the gyro. Do not charge the Bit or consume another resource during installation.

Reason: Bits should repair missing structure, while Charged Bits should remain distinct as sustained power sources for defenses and other active systems. Teaching those roles separately keeps the resource ladder understandable.

Consequences: The first repair is an intentional puzzle-affecting exception that restores normal rotation behavior. A brief activation current may visually bring the repaired module online, but it is not a Charged Bit transaction. The wider Board and Bug reveal follows this repair.

## 2026-07-22: Fabricate The First Bit Through The Pulse

Decision: Establish the first recipe as `8 Duds + 1 Pulse charge = 1 Bit`. During the first-run sequence, the Pulse visibly consumes the resources and emits the fabricated Bit.

Reason: This teaches the resource relationship without presenting crafting as an abstract shop transaction, while reinforcing that the damaged Pulse is both the game's center and a machine the player is learning to restore.

Consequences: The profile may treat Bits as approved inventory. Charged Bit and Bit Dust recipes remain unresolved. The tutorial uses the full fabrication animation, while repeat crafting should use a faster version of the same visual language.

## 2026-07-22: Use Project Compass Documents

Decision: Use README.md for orientation, PROJECT_OUTLINE.md for product direction, PLAN.md for execution order, ARCHITECTURE.md for technical boundaries, DECISIONS.md for durable choices, and TODO.md only for small loose cleanup.

Reason: The earlier outline and TODO mixed shipped behavior, future vision, duplicate roadmaps, and technical guidance. Clear ownership prevents contradictory instructions.

Consequences: PLAN.md is the implementation roadmap. TODO.md cannot override it.

## 2026-07-22: Preserve the Browser-Native Project Shape

Decision: Keep Twistris dependency-light, directly openable in a browser, and free of a required build pipeline during the current refactor.

Reason: The prototype works with a very small surface area, and the planned state boundaries do not require a framework.

Consequences: Refactors should use browser-compatible JavaScript and incremental file extraction.

Status: Superseded by **Modernize Around A Browser-First Game Stack** after the full onboarding and Board scope was defined.

## 2026-07-22: Refactor Incrementally Before Adding the Metagame

Decision: Add characterization coverage and state boundaries before profiles, crafting, missions, repair placement, or tutorial work.

Reason: Gameplay, rendering, animation, input, and economy currently share one runtime. Adding progression directly would increase regression risk.

Consequences: Do not combine major behavior changes with large code moves.

## 2026-07-22: Keep Progression Centered on Pulse Restoration

Decision: Runs should feed a persistent restoration layer focused on the damaged Pulse and its wider network. Early progression should emphasize visible restoration and new metagame access before puzzle power.

Reason: This gives harvested resources a clear purpose while preserving the identity and balance of the main puzzle.

Consequences: Combat, large crafting trees, and strong board upgrades remain deferred.

## 2026-07-22: Treat New Resource Names as Provisional

Decision: Duds, Bits, Charged Bits, Bit Dust, and Pulse charges are the current design vocabulary, but recipes and save fields are not locked yet.

Reason: The resource ladder is promising, while conversion rates and the role of Bit Dust still need play-oriented design decisions.

Consequences: Do not create a permanent persistence schema around unresolved recipes.

## 2026-07-22: Separate Runtime Ownership Before File Extraction

Decision: Keep `BalanceStackGame` in one production file for now, but divide its mutable state into `session`, `run`, `lifecycle`, and `presentation` buckets. Represent lifecycle with one validated phase.

Reason: Clear reset and transition boundaries reduce progression risk without combining the behavioral refactor with a large code move.

Consequences: Run restart replaces run state, session inventory survives within the page load, and later slices can extract pure rules or persistence one boundary at a time.

## 2026-07-22: Bank Harvest Results Before Presentation

Decision: Represent each harvest as an immutable result with a session-unique ID, apply it through an idempotent transaction, and let animation modify display counters only.

Reason: Earned inventory must survive skipped, interrupted, shortened, or changed animation timing without being duplicated.

Consequences: Harvest presentation can evolve independently, while future profile persistence must retain result identity and exactly-once application semantics.

## 2026-07-22: Keep Puzzle Rules DOM-Free

Decision: Load a dependency-free `rules.js` before `game.js` and place board creation, attachment, rotation, balance, centered-square, and harvest calculations behind its frozen API.

Reason: Puzzle behavior needs direct deterministic testing and should not depend on canvas, DOM mounts, animation state, or controller side effects.

Consequences: `game.js` consumes rule results and retains orchestration and effects. New puzzle calculations should enter through this pure boundary unless their ownership clearly belongs elsewhere.

Status: The boundary remains active, but slice 5 migrated its implementation to the typed `src/domain/rules.ts` module and Vite now resolves the import.
