# Twistris Testing

## Current Approach

Twistris uses Vitest for typed pure-rule tests, TypeScript for compile-time checks, Vite for development and production builds, and the retained browser smoke harness for controller characterization.

Do not remove the smoke harness merely because the new runner exists. Its controller coverage remains required until equivalent automated coverage and runtime parity are approved.

## Browser Smoke Harness

Run `npm run dev`, then open `/tests/smoke.html` from the URL printed by Vite.

The harness loads the production runtime into a hidden test DOM and currently runs 63 checks covering:

- test API availability
- DOM-free rules API availability and independent board creation
- quarter-turn rounding
- center-distance calculation
- symmetric and off-center balance profiles plus direction decisions
- seeded center creation
- direct attached and detached placement detection
- deterministic piece selection
- successful lock and detached-piece retry behavior
- bottom-edge exit retry before side-adjacency evaluation
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
- every tetromino that reaches the bottom edge passes through and retries even when its final cells sit beside settled structure
- side adjacency never locks a piece while its downward path remains clear
- a floor-bound miss has no ghost suggesting that it can lock to the bottom edge
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

## Phaser Migration Route

Run `npm run dev`, then compare `/next/` with `/`.

Current World-scene title parity checks:

- the block-built TWISTRIS logo retains its cyan and magenta treatment
- the close Pulse spins over the faint grid with heartbeat particles
- Start begins one transition and ignores repeated activation
- the transition takes approximately 2.05 seconds and settles on a quarter turn
- the logo and Start control fade while the board pulls back
- the normal board framing and Pulse charge HUD appear at completion
- keyboard focus moves to the game surface
- desktop and `390x844` mobile layouts remain square, centered, and free of overlap
- the scene holds stable frame pacing without browser warnings
- diagnostics report one active World scene, the expected camera mode, and only the Pulse sector mounted

Current `/next/` puzzle checks:

- Enter starts the same guarded launch as the Start button
- Start finishes in the `puzzle` camera mode without replacing the World scene
- the Pulse seed, falling piece, ghost, and next-piece preview share the mounted Pulse sector
- Arrow keys or WASD move, rotate, and soft-drop the active piece
- Space hard-drops and locks an attached piece
- a detached piece retries with the same shape and does not alter settled cells
- normal and soft gravity retain the characterized legacy timing
- next-piece state advances only after a successful lock
- puzzle input does not scroll the browser page
- an off-balance lock stages the same direction chosen by the pure balance rule
- the settled mass and Pulse rotate while the active piece, ghost, grid, and preview stay upright
- puzzle input and gravity pause throughout the 340 ms rotation
- the rotated board commits only when the visual quarter-turn completes
- completing a centered `3x3` turns its enclosed Bits neutral and reveals the Pulse field
- one run Charge is awarded for each newly completed centered layer
- a multi-layer completion updates the Charge total atomically before presentation
- core growth draws an inward white energy burst and briefly expands the Pulse
- Charge feedback can overlap a staged twist without changing the awarded result
- the bottom Charge HUD updates once and remains readable at desktop and mobile widths
- older outer Bits fade while the newest placement remains readable
- secured Bits retain their neutral treatment and light agitation
- the colored mass outline follows the exposed boundary of the settled structure
- `P` pauses gravity and input with visible feedback, then resumes the same run
- `R` starts a fresh run while preserving page-session bank values
- misses display feedback without changing the settled board
- a piece locking above the top boundary enters `harvesting` instead of leaving the run frozen with no active piece
- capacity creates one immutable result and banks its Duds and Charges exactly once
- `CAPACITY REACHED` remains readable over the occupied top of the stack
- outer blocks fall away before secured Duds stream to the right counter
- run Charges transfer to the left counter after the Dud transfer
- harvest completion restores the title and Start control with a fresh run ready
- a second run does not reapply the previous harvest result

The route is not a replacement for `/` until all gameplay and presentation parity checks pass.

Future continuous-Board camera checks:

- selecting **BOARD** animates outward from the current Pulse-home framing
- desktop drag pans and the mouse wheel zooms without page scrolling
- one-finger drag pans and pinch gestures zoom on touch screens
- camera bounds prevent navigation beyond intentionally visible world space
- recentering returns smoothly to the Pulse home framing
- camera movement does not alter puzzle, mission, economy, or persistence outcomes
- fog-hidden or distant sector presentation can sleep or unload without losing durable sector state
- returning to a previously visited sector reconstructs its secured, infested, repaired, and discovered state correctly

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
- Stack migration changes: run `npm run build`, `npm test`, `npm run typecheck`, the 63-check browser harness, and a manual playable-page check until parity is approved.
