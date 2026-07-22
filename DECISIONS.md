# Twistris Decisions

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
