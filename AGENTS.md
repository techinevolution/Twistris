# AGENTS.md

## Purpose
This file is a short map for coding agents working in Twistris.

Keep this file brief. Put detailed product, balance, and milestone planning in the dedicated docs listed below.

## Project
Twistris is a browser-based falling-block puzzle game where tetrominoes attach to a central mass called the Pulse. The stack may rotate after lock if the structure becomes imbalanced. There are no line clears.

Current long-term direction:
- feed and repair a damaged Pulse across many runs
- harvest Pulse charges and dud salvage
- save progress to a persistent local profile

## Source Of Truth
- [README.md](/Users/katherinephillips/Documents/Twistris/README.md): player-facing project summary
- [OUTLINE.md](/Users/katherinephillips/Documents/Twistris/OUTLINE.md): product direction, milestone definitions, future mechanics
- [TODO.md](/Users/katherinephillips/Documents/Twistris/TODO.md): active implementation backlog
- [DATA_FORMATS.md](/Users/katherinephillips/Documents/Twistris/DATA_FORMATS.md): runtime state and persistence guidance
- [BALANCE_PLAN.md](/Users/katherinephillips/Documents/Twistris/BALANCE_PLAN.md): twist heuristic and tuning targets
- [TESTING.md](/Users/katherinephillips/Documents/Twistris/TESTING.md): verification strategy and smoke checks

If this file and those docs disagree, update this file to match the deeper docs unless the deeper docs are clearly stale.

## Code Map
- [index.html](/Users/katherinephillips/Documents/Twistris/index.html): shell, overlays, HUD mounts, canvas
- [style.css](/Users/katherinephillips/Documents/Twistris/style.css): layout, overlays, title presentation
- [game.js](/Users/katherinephillips/Documents/Twistris/game.js): gameplay loop, state, rendering, tutorial/title logic
- [tests/smoke.html](/Users/katherinephillips/Documents/Twistris/tests/smoke.html): browser smoke-test harness

## Current Milestone
Build the first milestone from [TODO.md](/Users/katherinephillips/Documents/Twistris/TODO.md):
- Feed the Pulse, recover salvage, and complete the first repair.

Key milestone rules:
- first session starts by clicking the Pulse and entering a player name
- the tutorial exists to restore the failed gyro/stabilizer so the Pulse can spin again
- Pulse rotation is intentionally disabled until that repair is complete
- Pulse charges come from centered square growth
- duds come from influenced gray blocks at harvest end
- first craft rule is `8 duds + 1 Pulse charge = 1 repair block`

## Working Rules
- Keep the game dependency-light and openable directly in a browser.
- Prefer extracting or preserving pure logic helpers when changing board rules so they remain testable.
- When adding new systems, update the relevant planning doc in the same change if the design has shifted.
- Use current project vocabulary consistently:
  - Pulse
  - Pulse charges
  - Duds
  - Harvest
  - Repair block
- Future mechanics belong in the backlog unless they are explicitly being pulled into the active milestone.

## Testing Expectations
- For visual or interaction changes, verify in a browser with [index.html](/Users/katherinephillips/Documents/Twistris/index.html).
- For logic regressions, use [tests/smoke.html](/Users/katherinephillips/Documents/Twistris/tests/smoke.html).
- If you change balance, attachment, core-growth, harvest, or profile rules, add or update smoke coverage where practical.
- This repo currently has no Node-based test runner. Do not assume npm, node, or bundler tooling exists.

## Good Candidate Test Targets
- attachment to the existing structure
- core square growth detection
- balance profile direction and stability
- preview layout math
- profile save/load shape
- tutorial gating for gyro-disabled vs gyro-restored states

## Avoid
- bloating this file into a full design document
- introducing build-tool assumptions without adding the tooling explicitly
- mixing future backlog mechanics into milestone one without updating the docs first
