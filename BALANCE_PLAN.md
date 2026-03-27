# Twistris Balance Plan

## 1. Purpose
This document tracks the current balance model for Twistris and the main tuning targets for the prototype.

The game is not balanced around score races or line clearing. It is balanced around three things:
- how readable falling and locking feel,
- how often the stack twists,
- how quickly the player can grow the centered square.

## 2. Current Simulation Rules

### Falling
- Gravity is always downward in screen space.
- Base fall tick: `0.52s`
- Soft drop tick: `0.12s`
- Lock threshold after grounded contact: `0.16s`

### Rotation
- Post-lock twist only.
- Twist amount: `90 degrees`
- Maximum: one twist check per placed piece.
- Twist is blocked if any rotated settled cell would leave the board.

### Board
- Grid size: `27 x 27`
- Center pivot: middle cell of the grid.
- Seeded structure: one block at exact center.

## 3. Current Balance Heuristic

### Structure Attachment Rule
- A landed piece must touch the existing structure by edge adjacency.
- If it does not attach, it is discarded and the next piece spawns.

This keeps the game focused on building onto a single central mass and avoids stranded junk at the floor.

### Mass / Rotation Rule
Current imbalance is calculated as a weighted left-right torque-like sum:
- Each settled block contributes based on horizontal offset from center.
- Blocks farther from center contribute more than near-center blocks.
- Recently dropped pieces no longer receive extra weight.

Current formula idea in code:
- `mass += relX * (1 + distance * 0.28)`

Trigger behavior:
- If `mass > threshold`, twist right.
- If `mass < -threshold`, twist left.
- If within threshold, no twist.

Current threshold:
- `8`

## 4. Current Visual Balance Rules

### Core Square
- The centered square only grows if every cell in the next square layer is filled.
- Current HUD/display value is the side length of that fully completed centered square.
- The dotted line is inset inside the completed square.

### Fade Behavior
- Newly locked blocks remain fully solid until the next lock.
- Older blocks fade gradually over about `4s`.
- Core-area blocks remain fully opaque.
- Outer shell fades more heavily than near-core blocks.

### Outline Behavior
- Only the external perimeter of the stack is outlined.
- Internal seams between neighboring blocks are visually suppressed.

## 5. Current Strengths
- Falling controls now feel familiar and readable.
- The title/start flow and pause state are clean.
- Matte rendering performs better than the older glow-heavy version.
- The central square goal is now visually aligned with the actual structure.

## 6. Current Risks

### A. Twist Direction Confidence
The latest direction fix aligns sign mapping with the current rotation transform, but this should still be treated as a tuning hotspot until repeated play confirms it feels correct.

### B. Discarded Misses
Detached pieces disappearing is clean, but severe misses currently waste turns without creating a recovery option.

### C. Threshold Sensitivity
With the current threshold and distance multiplier, small off-center builds can still feel more influential than expected depending on the local shape.

### D. Core Growth Pace
Requiring fully completed centered squares is correct for the concept, but may be too strict without some extra reward or helper system.

## 7. Recommended Tuning Targets

### Falling Feel
- Keep normal fall readable and calm.
- Keep soft drop faster than default, but not fast enough to skip visual ownership.
- Preserve one-step-per-frame fall logic to avoid jitter.

### Twist Frequency
Target behavior:
- Early game: many placements should remain stable.
- Mid game: off-center additions should twist often enough to matter.
- Late game: larger outer arms should create clear predictable turns.

If twists are too frequent:
- Raise threshold slightly.
- Lower the distance multiplier.

If twists are too weak:
- Lower threshold slightly.
- Raise the distance multiplier.

### Growth Pressure
Target behavior:
- The player should usually be able to expand from `1x1` to `3x3`.
- Reaching `5x5` should feel like a meaningful achievement.
- Larger squares should probably require either cleaner planning or a future support mechanic.

## 8. Recommended Next Mechanics for Balance

### A. Growth Scoring
Reward only completed square expansion.
- This makes the intended goal explicit.

### B. Stability Banking
Grant a “stability charge” after several balanced placements.
- Spend it to cancel one rotation or rescue one detached drop.

### C. Miss Tray
Instead of destroying a detached piece immediately, send it to a one-slot tray.
- If the player misses again while the tray is full, then punish them.

### D. Rotation Preview
Show `left`, `stable`, or `right` preview before lock.
- This would help players learn the actual weight model.

## 9. Immediate Tuning Checklist
- [ ] Confirm left-heavy and right-heavy twist directions through play.
- [ ] Test the current threshold against early, mid, and large stack shapes.
- [ ] Decide whether detached-piece discard is temporary or permanent.
- [ ] Decide whether square growth should directly drive score or another resource.
- [ ] Decide whether blocked rotations should have a stronger visual response.
