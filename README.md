# Twistris

Twistris is a browser-based falling-block puzzle prototype where tetrominoes always fall from the top, attach to a central mass, and can rotate that settled mass by one 90 degree step when the structure becomes imbalanced.

The goal is to grow the largest centered square. There are no line clears.

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
