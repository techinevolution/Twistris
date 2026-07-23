# Twistris Decisions

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

Consequences: `game.js` consumes rule results and retains orchestration and effects. New puzzle calculations should enter through `rules.js` unless their ownership clearly belongs elsewhere.
