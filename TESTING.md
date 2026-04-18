# Testing

## Current Approach
Twistris does not currently have a Node-based test runner or build pipeline.

Verification is split into:
- browser smoke checks
- manual gameplay checks

## Smoke Harness
Open [tests/smoke.html](/Users/katherinephillips/Documents/Twistris/tests/smoke.html) in a browser.

This harness is intended to catch regressions in logic that should stay stable even while the visuals evolve.

Current coverage targets:
- seeded center block exists
- attachment rule around the seeded center
- centered square growth detection
- balance profile sign for symmetric vs off-center mass
- quarter-turn rounding helper

## Manual Checks
Open [index.html](/Users/katherinephillips/Documents/Twistris/index.html) in a browser and verify:
- title loads correctly
- Pulse can be started from the title
- active piece movement and rotation still work
- detached pieces retry correctly
- Pulse charges update when the centered square grows
- next-piece preview remains centered
- game over and pause overlays still render correctly

## What Should Get More Coverage Next
- persistent profile save/load
- harvest summary calculations
- tutorial gating before and after gyro restoration
- repair-block crafting cost deduction
- void-detection and auto-plug behavior
