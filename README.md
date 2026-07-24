# Twistris

Twistris is a browser-based falling-block puzzle game built around the Pulse, a central mass that the player expands and stabilizes. Tetrominoes attach to the existing structure, the settled stack may twist when it becomes imbalanced, and there are no line clears.

This repository is focused on a public demo: reveal the damaged Pulse, teach the puzzle and crafting loops, repair the Gravity Module, recover one firewall sector from Bugs, and unlock a replayable Endless Feed mode with a small upgrade set.

The intended game is one continuous motherboard world. Puzzle play, the Pulse hub, Craft, Board, harvest, and repair are connected camera views and interaction modes centered on the Pulse rather than separate screens.

## Status

Active demo prototype. The playable Phaser runtime at `/next/` now carries one complete progression loop: puzzle play produces a harvest result, Duds and Pulse charges bank to the versioned local profile, the Pulse fabricates the first Bit for `8 Duds + 1 Pulse charge`, and that Bit walks into the Gravity Module to repair it. All progression outcomes save before their animations. Slice 10 adds the harvest-result dialog, one bounded Craft recipe, the Bit counter, a connected Gravity Module, and its walking installation presentation inside the persistent World scene. The current Pulse artwork remains provisional and will receive a dedicated damaged-machine redesign later. The trusted legacy route and browser harness remain available for comparison. The first Board sector, missions, Endless Feed, demo upgrades, and the first-run tutorial are planned but not implemented.

## Quick Start

Install the development dependencies once:

```sh
npm install
```

Start the local development server:

```sh
npm run dev
```

Open the URL printed by Vite. The game now uses browser modules and must be served rather than opened through `file://`.

## Development Commands

- `npm run dev`: start the Vite development server
- `npm run build`: create the production build in `dist/`
- `npm test`: run the Vitest unit suite
- `npm run typecheck`: check the TypeScript source

While the legacy controller remains, open `/tests/smoke.html` through the Vite development server for the full browser characterization harness.

The isolated Phaser proof is available at `/proofs/phaser.html`. It does not replace or modify the playable game.

The accepted Phaser parity runtime is available at `/next/`. The legacy `/` route remains the trusted comparison until its later removal is explicitly approved.

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
- Bank resources, fabricate the first Bit, and restore the Gravity Module.
- Demo target: secure one firewall sector and unlock Endless Feed.
- Demo target: earn a small set of optional Endless upgrades.

## Demo Boundary

The tracked project stops at one recovered firewall sector and a replayable Endless mode. The remaining Board stays obscured and the full-game campaign is intentionally unspecified here.

Broader ideas may be developed locally under `notes/private/`, which is ignored by Git. Nothing from that area is public scope until Katherine explicitly promotes it into the tracked project documents.

## Platform Direction

The browser is the primary target. The approved architecture keeps one portable web game codebase that can later be packaged for PC, Android, and iOS without forking core gameplay or progression logic.

The current foundation uses TypeScript, Vite, Vitest, and Phaser. Phaser powers the accepted proof and `/next/` runtime; application, profile, and economy decisions remain engine-independent, and browser storage, audio, haptics, fullscreen, lifecycle, and achievement capabilities sit behind platform adapters. Playwright remains planned for later browser automation.

## Project Docs

- [Project Outline](PROJECT_OUTLINE.md): product vision and intended end state
- [Plan](PLAN.md): current execution path and next implementation slices
- [Architecture](ARCHITECTURE.md): current technical map and intended boundaries
- [Decisions](DECISIONS.md): major product and architecture decisions
- [Agent Guide](AGENTS.md): instructions for coding agents
- [TODO](TODO.md): small loose cleanup tasks only
- [Data Formats](DATA_FORMATS.md): current profile contract and provisional future data
- [Balance Plan](BALANCE_PLAN.md): current twist model and tuning targets
- [Testing](TESTING.md): browser smoke and manual verification guidance
