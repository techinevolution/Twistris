# Twistris

Twistris is a browser-based falling-block puzzle game inspired by Tetris. Tetrominoes fall from the top, but instead of clearing lines they attach to a central mass that can rotate by one 90 degree step when the structure becomes imbalanced.

The goal is to grow the largest centered square. There are no line clears.

Each time the centered square expands by one layer, the player earns a Pulse charge. These charges are intended to become a spendable currency for future repair and board-shaping mechanics.

## Run

Open [index.html](/Users/katherinephillips/Documents/Twistris/index.html) in a browser.

## Controls

- `A` / `D`: move
- `W`: rotate piece
- `S`: soft drop
- `Space`: hard drop
- `P`: pause
- `R`: restart

## Project Files

- `index.html`: game shell and HUD
- `style.css`: presentation and layout
- `game.js`: gameplay loop, stack logic, balance checks, and rendering
- `OUTLINE.md`: game vision and system direction
- `TODO.md`: active production backlog
- `DATA_FORMATS.md`: runtime state and persistence guidance
- `BALANCE_PLAN.md`: twist and tuning notes
- `TESTING.md`: smoke checks and manual verification
