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
- `src/domain/rules.ts`: pure board, balance, centered-square, and harvest calculations
- `game.js`: controller state, animation, rendering, input, and runtime effects
- `tests/rules.test.ts`: Vitest coverage for the typed rules boundary
- `tests/smoke.html`: browser smoke-test harness

The approved refactor direction is incremental migration to TypeScript, Vite, and Phaser. Do not rewrite the game in one pass. Follow the slice order in PLAN.md, preserve the legacy runtime until parity is proven, and add only the tooling or boundary owned by the current slice.

## Demo Scope

This repository targets the public demo only:

- complete onboarding and first unrestricted mission
- Gravity Module repair
- one broken firewall sector
- one sector recovery and demo-complete result
- Endless Feed unlock
- approximately three or four demo upgrades

Do not add further Board sectors, a detailed full-game campaign, or speculative post-demo mechanics to tracked files. Broader ideation belongs in the gitignored `notes/private/` area until Katherine explicitly promotes it.

## Commands

- Setup: `npm install`
- Run: `npm run dev`
- Unit tests: `npm test`
- Type check: `npm run typecheck`
- Production build: `npm run build`
- Browser characterization: open `/tests/smoke.html` through the Vite development server
- Legacy controller syntax check: `node --check game.js`

## Coding Conventions

- Keep the game browser-first and packageable for future desktop and mobile wrappers.
- Prefer pure helpers for board, balance, harvest, and persistence rules.
- Keep run-earned resources separate from banked profile resources.
- Keep visual animation state separate from economy transactions.
- Keep Phaser out of puzzle, economy, demo-board, mission, profile, and persistence rules.
- Access storage, audio, haptics, fullscreen, lifecycle, achievements, and storefront features through platform adapters.
- Keep simulation outcomes independent of frame rate and reduced-effects settings.
- Use the terms in PROJECT_OUTLINE.md; unresolved names in PLAN.md remain provisional.

## Boundaries

- Do not add online accounts, cloud sync, payments, or external services without approval.
- Do not mix deferred mechanics into the current slice.
- Do not let local private design notes override PROJECT_OUTLINE.md or PLAN.md.
- Do not store transient animation state in a profile.
- Do not commit personal data; use synthetic profile examples.
- Do not add React, a backend, cloud services, a database, or a second engine without approval.
- Do not start Capacitor, desktop-wrapper, or storefront packaging before PLAN.md schedules it.

## Validation Before Final Report

- Run the browser smoke harness for logic changes.
- Inspect `index.html` in a browser for visual or interaction changes.
- During and after migration, run the package build, test, and typecheck commands introduced by the active slice.
- Validate visual slices at desktop and mobile-class viewports and report performance limitations honestly.
- Update the relevant project doc when a product or architecture decision changes.

## Final Report

Include files changed, validation run, remaining risks or blockers, and the recommended next step from PLAN.md.
