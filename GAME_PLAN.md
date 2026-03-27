# Twistris Game Plan

## 1. High Concept
Twistris is a falling-block puzzle prototype where tetrominoes always drop from the top, build onto a central mass, and may rotate that accumulated stack by one 90 degree step after lock if the structure becomes imbalanced.

The goal is not clearing lines. The goal is growing a larger centered square around the core.

## 2. Current Core Loop
1. Start from the title screen.
2. Spawn a tetromino and show the next piece preview.
3. Player moves, rotates, soft drops, or hard drops the piece.
4. Piece only locks if it attaches to the existing structure.
5. After lock, evaluate left/right weighted mass imbalance.
6. If imbalance exceeds threshold, rotate the settled stack by one quarter turn.
7. Recompute the largest fully filled centered square and update the core outline.
8. Spawn the next piece and repeat.

## 3. Implemented Features

### Falling Block Controls
- `A/D` or arrow keys move horizontally.
- `W`, `Up`, or `X` rotates the active tetromino by 90 degrees.
- `S` or `Down` soft drops at a slower stepped rate.
- `Space` hard drops instantly.
- `P` pauses and resumes.
- `R` restarts immediately into a live run.

### Structure Rules
- Pieces always fall in screen-space from the top.
- There are no line clears.
- New pieces must attach to the existing structure or they are discarded as a miss.
- The seeded starting core is a single center block.

### Rotation Rules
- The field stays fixed on screen.
- Only the settled stack rotates.
- Rotation happens after lock, at most once per drop.
- Rotation amount is exactly 90 degrees.
- Rotation direction is determined by weighted left/right mass around the center.
- If rotation would push the stack outside the playfield, that rotation is blocked.

### Core Square Rules
- The core grows only when the stack contains a larger complete centered square.
- The dotted square is drawn inside the filled square, not outside it.
- The solid center mass and the dotted outline both scale from the detected square size.

### Presentation
- Minimal matte UI.
- Centered title chip and small status chip.
- Start screen with a start button.
- Next piece preview.
- Pause and game-over overlays.
- Outer blocks fade gradually, while freshly placed blocks remain solid until the following lock.
- Outline rendering is based on the outer perimeter of the stack, not on every individual cell.

## 4. Current Fail / State Rules
- Title state on load. Game does not auto-start.
- Pause state toggled with `P`.
- Game over only when a locked piece would extend outside the playfield.
- Rotation blocked if a quarter-turn would place any settled block outside bounds.

## 5. Current Design Intent
- Make square-building the main skill expression.
- Make twist behavior understandable from the mass distribution.
- Keep movement familiar so the novelty comes from the rotating stack, not strange controls.
- Preserve a readable central target with minimal UI clutter.

## 6. Current Design Constraints
- No line clear system.
- No scoring economy yet.
- No level progression or multiple modes yet.
- No hold piece system.
- No sound or advanced effects.
- No physics engine; all motion and balance are grid-based and heuristic-driven.

## 7. Current Open Problems
- Balance may still need tuning so turns feel intuitive in edge cases.
- Detached-piece discard works, but it may eventually need a better recovery mechanic.
- The prototype currently has no long-term reward loop beyond trying to grow the square.
- The game does not yet communicate why a rotation happened beyond the visible movement.

## 8. Best Next Mechanics

### A. Square Growth Rewards
- Grant points or a stability bonus only when the centered square expands by one layer.

### B. Stability Meter
- Track several balanced placements in a row.
- Cash that streak into a one-time safety tool like rotation cancel or stack brace.

### C. Miss Buffer
- Instead of discarding detached pieces outright, send one missed piece into a temporary tray.

### D. Preview Depth
- Expand the preview from 1 next piece to 2 or 3.

### E. Rotation Forecast
- Before lock, show whether the current placement is likely to twist left, right, or stay stable.

## 9. Short-Term Build Priorities
1. Stabilize the current rotation heuristic and visual turn behavior.
2. Improve feedback for blocked rotations and discarded misses.
3. Add a small reward loop tied to centered square growth.
4. Add at least one forgiveness mechanic so mistakes create interesting decisions instead of dead turns.
