# AGENTS.md

## Project
Working title: **Twistris**

Twistris is a browser-based falling-block puzzle prototype where tetrominoes always fall from the top, attach to a central mass, and can rotate that settled mass by one 90 degree step if the overall structure becomes imbalanced.

The defining objective is to grow a larger centered square. There are no line clears.

---

## 1. Core Gameplay Agent
Responsible for the main loop already implemented in the prototype.

### Responsibilities
- Handle title screen and start flow
- Spawn pieces
- Process movement, rotation, soft drop, hard drop
- Lock pieces when grounded
- Enforce that new pieces attach to the existing structure
- Trigger post-lock balance evaluation

### Current state
- Implemented

---

## 2. Piece Agent
Handles tetromino definitions and active-piece control.

### Responsibilities
- Store tetromino shapes
- Spawn the current piece and next-piece preview
- Apply 90 degree piece rotation
- Support minimal kick logic
- Generate ghost position

### Current state
- Implemented

---

## 3. Stack Agent
Owns the persistent structure built by the player.

### Responsibilities
- Store settled blocks on the grid
- Validate attachment to the central mass
- Reject detached landed pieces
- Expose stack shape for balance and rendering

### Current state
- Implemented

---

## 4. Balance Agent
Controls the game’s signature twist rule.

### Responsibilities
- Evaluate left-versus-right mass around the center
- Weight outer blocks more strongly than near-center blocks
- Decide whether the structure is stable or should rotate
- Remain readable and tunable, not physically realistic

### Current state
- Implemented, still a tuning hotspot

---

## 5. Rotation Agent
Handles the quarter-turn of the settled stack.

### Responsibilities
- Rotate the settled board state by exactly 90 degrees
- Block rotations that would move cells outside the field
- Animate the visible turn smoothly
- Keep gameplay paused during turn animation

### Current state
- Implemented

---

## 6. Core Square Agent
Tracks the central square objective.

### Responsibilities
- Detect the largest fully completed centered square
- Draw the solid core and dotted inner outline
- Keep the outline inside occupied cells only
- Drive any future score or growth reward systems

### Current state
- Implemented for detection and rendering

---

## 7. Input / Feel Agent
Keeps the game readable and responsive.

### Responsibilities
- Familiar falling-block controls
- Clean soft drop behavior
- Pause and restart handling
- Prevent jitter or multi-step fall glitches

### Current state
- Implemented, with ongoing tuning

---

## 8. Visual Feedback Agent
Communicates the state of the stack clearly.

### Responsibilities
- Matte board rendering
- Outer-perimeter outline only
- Gradual fade on older outer blocks
- Status chip for exceptional states only
- Start screen and overlays

### Current state
- Implemented

---

## 9. Missing / Future Systems
These are the most natural next systems for Twistris.

### A. Growth Reward Agent
- Reward completed square expansion with score or another resource

### B. Stability Agent
- Bank balanced placements into a future rescue or cancel action

### C. Recovery Agent
- Add a miss tray, hold tray, or other forgiveness mechanic for detached drops

### D. Forecast Agent
- Preview likely twist direction before lock

---

## 10. Recommended Next Build Order
1. Confirm twist direction and threshold tuning
2. Add a reward for square growth
3. Add one recovery mechanic for detached placements
4. Add a twist-direction preview before lock
5. Revisit progression, score, or mode ideas only after the core loop feels strong
