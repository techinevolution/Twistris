# Twistris Testing

## Current Approach

Twistris has no Node-based test runner or build pipeline. Verification currently uses a browser smoke harness plus manual gameplay checks.

## Browser Smoke Harness

Open [tests/smoke.html](tests/smoke.html) in a browser.

The harness loads the production runtime into a hidden test DOM and currently checks:

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

## Validation Expectations

- Logic changes: run the browser smoke harness.
- Pure-rule changes: also run `node --check rules.js` and a DOM-free direct sanity call when practical.
- Visual or interaction changes: run the smoke harness and inspect the playable page.
- Balance changes: perform repeated left-heavy, right-heavy, early-run, and late-run manual scenarios.
- Persistence changes: test missing, valid, malformed, and older-version saves.
- Harvest changes: verify inventory awards remain correct if animation is skipped, interrupted, or reduced.
