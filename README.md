# Twistris

Twistris is a browser-based falling-block puzzle game built around the Pulse, a central mass that the player expands and stabilizes. Tetrominoes attach to the existing structure, the settled stack may twist when it becomes imbalanced, and there are no line clears.

This repository is focused on a public demo: reveal the damaged Pulse, teach the puzzle and crafting loops, repair the Gravity Module, recover one firewall sector from Bugs, and unlock a replayable Endless Feed mode with a small upgrade set.

## Status

Active demo prototype. The core falling, attachment, twisting, centered-square growth, Pulse charge, and animated harvest loops are playable. The stack migration, persistent profile, crafting, Gravity repair, first firewall sector, Endless Feed, demo upgrades, and first-run tutorial are planned but not implemented.

## Quick Start

Open [index.html](index.html) directly in a browser. No installation or build step is required.

To run the browser smoke checks, open [tests/smoke.html](tests/smoke.html).

These are the current prototype commands. The next approved refactor slice introduces Vite, TypeScript, and automated package scripts; update this section when that slice lands.

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
- Demo target: bank resources, fabricate the first Bit, and restore the Gravity Module.
- Demo target: secure one firewall sector and unlock Endless Feed.
- Demo target: earn a small set of optional Endless upgrades.

## Demo Boundary

The tracked project stops at one recovered firewall sector and a replayable Endless mode. The remaining Board stays obscured and the full-game campaign is intentionally unspecified here.

Broader ideas may be developed locally under `notes/private/`, which is ignored by Git. Nothing from that area is public scope until Katherine explicitly promotes it into the tracked project documents.

## Platform Direction

The browser is the primary target. The approved architecture keeps one portable web game codebase that can later be packaged for PC, Android, and iOS without forking core gameplay or progression logic.

The planned foundation uses TypeScript, Vite, Phaser, Vitest, Playwright, and HTML/CSS overlays. None of those dependencies are installed yet.

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
