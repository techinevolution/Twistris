# Twistris Testing

## Current Approach

Twistris uses Vitest for typed pure-rule tests, TypeScript for compile-time checks, Vite for development and production builds, and the retained browser smoke harness for controller characterization.

Do not remove the smoke harness merely because the new runner exists. Its controller coverage remains required until equivalent automated coverage and runtime parity are approved.

## Browser Smoke Harness

Run `npm run dev`, then open `/tests/smoke.html` from the URL printed by Vite.

The harness loads the production runtime into a hidden test DOM and currently runs 62 checks covering:

- test API availability
- DOM-free rules API availability and independent board creation
- quarter-turn rounding
- center-distance calculation
- symmetric and off-center balance profiles plus direction decisions
- seeded center creation
- direct attached and detached placement detection
- deterministic piece selection
- successful lock and detached-piece retry behavior
- direct non-mutating rotation plus controller clockwise and counterclockwise rotation
- direct centered-square detection plus controller `3x3` and `5x5` growth
- charge awards across multiple growth layers
- harvest phase startup
- direct harvest classification plus exact Dud, charge, and outer-block totals
- immutable harvest results and exact atomic banking
- duplicate-result protection
- completed and skipped harvest-presentation banking
- presentation counter animation without inventory mutation
- final harvest run-value reset
- restart preservation of session bank values
- session, run, lifecycle, and presentation state ownership
- title, launch, play, pause, harvest, and return phase behavior
- repeated-action and invalid-phase guards

The harness is a characterization safety net, not complete unit coverage.

## Manual Checks

Open [index.html](index.html) and verify:

- title and Pulse presentation load correctly
- Start begins a run and keyboard focus works
- active-piece movement, rotation, soft drop, and hard drop work
- detached pieces retry correctly
- attached pieces update the central structure
- left-heavy and right-heavy structures twist in the expected direction
- Pulse charges update when the centered square grows
- next-piece preview remains centered
- pause and restart work
- reaching capacity starts harvest automatically
- Dud and charge counters animate and the game returns to the Pulse screen
- desktop, mobile-width, and embedded sizing remain readable

## Next Coverage Targets

Add focused coverage as the corresponding state boundaries are introduced:

- malformed and older-version profile data after persistence exists
- pure crafting, mission, and first-sector transactions
- tutorial event ordering without waiting for real animation durations
- platform-adapter contracts using browser-safe fakes

## Automated Stack

- **Vitest, active:** pure puzzle rules now; economy, profile, mission, demo-board, migration, and transaction rules as those modules arrive.
- **TypeScript, active:** compile-time checks for migrated source, tests, and future typed contracts.
- **Vite, active:** development server and production asset/module validation.
- **Playwright, planned:** title-to-run flow, keyboard and touch input, scene transitions, responsive layouts, tutorial checkpoints, and selected visual comparisons.

The browser smoke harness may be retired only after its characterization cases have equivalent coverage and the Phaser runtime has demonstrated parity.

## Phaser Proof

Run `npm run dev`, then open `/proofs/phaser.html`.

Verify:

- the falling T piece loops without resizing the layout
- arrow keys or `A`/`D` move the piece
- Up or `W` rotates the piece
- Space or the action control starts the walking-Bit sequence
- the Bit emerges from the Pulse, walks with two visible feet, and hops into the connected socket
- every copper trace physically connects to the Pulse
- landing and installation trigger brief camera responses
- the scene reports stable frame pacing without browser warnings
- the square scene remains correctly framed at desktop and `390x844` mobile viewport sizes

The proof is not the playable game and must remain isolated until its presentation patterns are ported through slice 7.

## Demo Acceptance Flow

The release candidate must verify the complete public demo:

1. First-run reveal completes without unintended input.
2. The first Bit is crafted and walks into the Gravity Module upgrade slot.
3. The gyro stabilizes before the firewall failure and Bug reveal.
4. **FEED THE PULSE** starts the four-charge mission with full controls.
5. Harvested resources are banked exactly once.
6. The player can obtain the demo Charged Bit and secure the first firewall sector.
7. The demo-complete result unlocks Endless Feed.
8. Endless Feed remains replayable across save and reload.
9. The selected demo upgrades unlock, equip, save, and affect only their documented rules.
10. No inaccessible second sector or unfinished full-game surface appears in the release.

## Performance Validation

- Target smooth 60 FPS presentation on desktop and modern mobile hardware.
- Test at desktop, mobile-width, high-density, and reduced-effects settings.
- Include at least one modest Android-class device or profile and one older supported iPhone-class device before a mobile release.
- Check long tutorial sequences, harvest particles, walking Bits, Bug swarms, fog, blur, and Board camera movement.
- Pool repeated objects, cull off-camera and fog-hidden entities, and cap resolution and effect counts.
- Pause unnecessary simulation and animation when the page or packaged app enters the background.
- Performance reductions may change visual density but must never change economy, mission, repair, or demo-board outcomes.

## Validation Expectations

- Logic changes: run the browser smoke harness.
- Pure-rule changes: also run `npm test` and `npm run typecheck`.
- Visual or interaction changes: run the smoke harness and inspect the playable page.
- Balance changes: perform repeated left-heavy, right-heavy, early-run, and late-run manual scenarios.
- Persistence changes: test missing, valid, malformed, and older-version saves.
- Harvest changes: verify inventory awards remain correct if animation is skipped, interrupted, or reduced.
- Stack migration changes: run `npm run build`, `npm test`, `npm run typecheck`, the 62-check browser harness, and a manual playable-page check until parity is approved.
