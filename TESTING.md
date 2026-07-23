# Twistris Testing

## Current Approach

Twistris has no Node-based test runner or build pipeline. Verification currently uses a browser smoke harness plus manual gameplay checks.

## Browser Smoke Harness

Open [tests/smoke.html](tests/smoke.html) in a browser.

The harness loads the production runtime into a hidden test DOM and currently checks:

- test API availability
- quarter-turn rounding
- center-distance calculation
- symmetric and off-center balance profiles
- seeded center creation
- attached and detached placement detection
- deterministic piece selection
- successful lock and detached-piece retry behavior
- clockwise and counterclockwise board rotation
- centered `3x3` and `5x5` growth
- charge awards across multiple growth layers
- harvest phase startup
- exact Dud, charge, and outer-block harvest totals
- final harvest banking and run-value reset
- restart preservation of session bank values
- title, launch, play, harvest, and return lifecycle behavior

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

- exact immutable harvest-result calculation
- explicit lifecycle phases and invalid-transition prevention
- profile/session, run, and presentation reset boundaries
- skipped or interrupted harvest presentation
- malformed and older-version profile data after persistence exists

## Validation Expectations

- Logic changes: run the browser smoke harness.
- Visual or interaction changes: run the smoke harness and inspect the playable page.
- Balance changes: perform repeated left-heavy, right-heavy, early-run, and late-run manual scenarios.
- Persistence changes: test missing, valid, malformed, and older-version saves.
- Harvest changes: verify inventory awards remain correct if animation is skipped, interrupted, or reduced.
