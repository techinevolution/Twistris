# Twistris

Twistris is a browser-based falling-block puzzle game built around the Pulse, a central mass that the player expands and stabilizes. Tetrominoes attach to the existing structure, the settled stack may twist when it becomes imbalanced, and there are no line clears.

The long-term direction adds a persistent metagame: runs produce Pulse charges and salvage that help restore the damaged Pulse and the wider system connected to it.

## Status

Active prototype. The core falling, attachment, twisting, centered-square growth, Pulse charge, and animated harvest loops are playable. Persistent profiles, crafting, repair progression, missions, and the first-run tutorial are planned but not implemented.

## Quick Start

Open [index.html](index.html) directly in a browser. No installation or build step is required.

To run the browser smoke checks, open [tests/smoke.html](tests/smoke.html).

## Controls

- `A` / `D` or arrow keys: move
- `W`, `X`, or Up: rotate the falling piece
- `S` or Down: soft drop
- `Space`: hard drop
- `P`: pause
- `R`: restart

## Main Workflows

- Build outward from the Pulse and complete larger centered squares.
- Earn Pulse charges when the centered square grows.
- Reach capacity and harvest Pulse charges and Dud salvage.
- Future: bank resources, fabricate repair materials, and restore the Pulse network between runs.

## Project Docs

- [Project Outline](PROJECT_OUTLINE.md): product vision and intended end state
- [Plan](PLAN.md): current execution path and next implementation slices
- [Architecture](ARCHITECTURE.md): current technical map and intended boundaries
- [Decisions](DECISIONS.md): major product and architecture decisions
- [Agent Guide](AGENTS.md): instructions for coding agents
- [TODO](TODO.md): small loose cleanup tasks only
- [Data Formats](DATA_FORMATS.md): provisional state and persistence guidance
- [Balance Plan](BALANCE_PLAN.md): current twist model and tuning targets
- [Testing](TESTING.md): browser smoke and manual verification guidance
