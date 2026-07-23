# Agent Guide

## Project Documents

Before starting implementation, read these files in this order:

1. README.md
   Human-facing overview: what the project is, how to run it, and current status.

2. PROJECT_OUTLINE.md
   Product vision and intended end state: what the project should become.

3. PLAN.md
   Current execution path: current state, next slices, deferred work, validation path, and stop rules.

4. ARCHITECTURE.md, if present
   Technical map: repo structure, entry points, data flow, persistence, integrations, and invariants.

5. DECISIONS.md, if present
   Major product/architecture decisions and why they were made.

6. TODO.md, if present
   Small loose cleanup tasks only. Do not treat TODO.md as the roadmap.

Rules:
- If PROJECT_OUTLINE.md and PLAN.md disagree, stop and ask for clarification before implementing.
- If ARCHITECTURE.md disagrees with PROJECT_OUTLINE.md or PLAN.md, stop and ask for clarification before implementing.
- If PLAN.md is missing a current goal, next slice, deferred list, validation path, or stop rules, update/ask before implementing.
- Do not let TODO.md override PLAN.md.
- Do not let technical evidence files replace generalist-readable summaries.

## Implementation Discipline

Start with the simplest efficient solution that satisfies the current goal while respecting the agreed architecture.

Do not add scaffolding, abstractions, validators, bridges, plugins, migrations, or automation unless they directly help the current slice work safely and clearly.

Code should be simple, but not sloppy:
- Follow the existing architecture and folder boundaries.
- Avoid spaghetti logic and hidden side effects.
- Prefer small readable functions over clever systems.
- Add tests when behavior could break, repeat, or affect important data.
- Add scaffolding only when it reduces real risk or repeated work.
- Stop before building future infrastructure that has not been requested or approved.

When unsure, choose the smallest clean implementation that can be understood, reviewed, and changed later.

## Current Technical Shape

- `index.html`: browser shell, overlays, HUD mounts, and canvas
- `style.css`: layout and DOM presentation
- `game.js`: current gameplay, state, animation, rendering, and input runtime
- `tests/smoke.html`: browser smoke-test harness

The current refactor direction is incremental. Do not rewrite the game or add a framework. Preserve direct browser opening and extract testable boundaries one slice at a time.

## Commands

- Setup: none
- Run: open `index.html` in a browser
- Test: open `tests/smoke.html` in a browser
- Syntax check: `node --check game.js` when Node is available
- Build/lint/typecheck: none currently

## Coding Conventions

- Keep the project dependency-light and browser-native.
- Prefer pure helpers for board, balance, harvest, and persistence rules.
- Keep run-earned resources separate from banked profile resources.
- Keep visual animation state separate from economy transactions.
- Use the terms in PROJECT_OUTLINE.md; unresolved names in PLAN.md remain provisional.

## Boundaries

- Do not add online accounts, cloud sync, payments, or external services without approval.
- Do not mix deferred mechanics into the current slice.
- Do not store transient animation state in a profile.
- Do not commit personal data; use synthetic profile examples.

## Validation Before Final Report

- Run the browser smoke harness for logic changes.
- Inspect `index.html` in a browser for visual or interaction changes.
- Update the relevant project doc when a product or architecture decision changes.

## Final Report

Include files changed, validation run, remaining risks or blockers, and the recommended next step from PLAN.md.
