# Twistris Project Outline

## Goal

Create a distinctive falling-block game where the player builds around a damaged central Pulse, harvests useful material from each run, and gradually restores a larger networked system.

## Intended End State

Twistris should have two connected rhythms:

- A focused puzzle run built around attachment, imbalance, quarter-turn twists, and centered-square growth.
- A slower metagame where harvested materials are refined, fabricated, and placed into damaged Pulse systems.

The Pulse is the centerpiece of a larger dormant or overrun network. Repairing it should visibly restore that world, reveal new systems, and unlock additional activities without turning the main puzzle into a conventional upgrade race.

## Audience

- Players who enjoy spatial puzzle games and improving through understanding rather than reflex alone.
- Players who like persistent restoration, collection, and a visible sense of rebuilding between runs.
- Players who want an approachable core loop with room for long-term mastery.

## Core Workflows

### Puzzle Run

1. Begin a run from the Pulse or a selected mission.
2. Move and rotate falling tetrominoes.
3. Attach each piece to the existing central structure.
4. Read imbalance and adapt when the settled structure twists.
5. Complete larger centered squares to generate Pulse charges.
6. Reach capacity or another run-ending condition.
7. Harvest the run's charges and salvage.

### Pulse Restoration

1. Return to the Pulse network after a run.
2. Review harvested resources and mission progress.
3. Refine salvage into useful repair material.
4. Fabricate assemblies for damaged subsystems.
5. Place assemblies into repair patterns or system schematics.
6. Bring repaired systems online and reveal the next restoration goal.

## Major Features

### Established Core

- Falling tetrominoes with familiar movement and rotation.
- Attachment to one central mass rather than a floor.
- Automatic quarter-turn twists caused by imbalance.
- Centered-square growth as the primary run objective.
- Pulse charges earned from square growth.
- Automatic harvest presentation at run capacity.

### Intended Progression

- A local persistent player profile.
- Clear separation between run-earned and banked resources.
- A visibly damaged Pulse with multiple repair stages.
- A network of systems that can be restored over many runs.
- Run missions, beginning with understandable charge and salvage goals.
- A repair layer based on constructing and placing block-shaped assemblies.
- A first-run tutorial built after the systems it teaches are stable in normal play.

### Damaged Pulse Presentation

The Pulse should begin ancient, cracked, dim, and partially failing. Its condition must be readable at a glance, and feeding or repairing it should feel like restoring a machine rather than increasing a score.

Possible damage and recovery details include:

- Cracked casing and missing or broken corner rails.
- Dim, unstable inner light.
- Flicker, sputter, sparks, and visual interference.
- Repaired layers gradually restoring symmetry and brightness.

The Pulse should have multiple visible repair stages rather than a single broken-or-fixed state. Its condition should be reflected both in gameplay and in the title presentation.

### Persistent Player Profile

The restoration loop requires a local-first profile that survives browser sessions. The profile should eventually communicate:

- Player name.
- Banked Pulse charges and Duds.
- Repair progress and unlocked parts or systems.
- Best centered square reached.
- Total runs and harvests.

Run-earned resources remain separate from banked inventory until harvest. Profile data should support reset and, later, export and import without requiring an online account.

### Harvest Presentation

Every completed run should produce a clear harvest result showing newly earned Pulse charges and Duds before they are banked. The established capacity-harvest presentation is:

1. Announce **CAPACITY REACHED** without requiring player input.
2. Zoom the stack slightly toward the screen.
3. Slam the board back into place with a brief shake.
4. Let the non-Dud outer blocks fall away after the impact.
5. Hold the Dud square intact momentarily.
6. Fade the Dud square and stream each Dud into its lower resource counter.
7. Highlight the Pulse charge counter after Dud collection finishes.
8. Draw a beam toward the charge counter and send one traveling pulse for each earned charge.
9. Return the view to the resting Pulse state after both resources are collected.

The inventory transaction must not depend on whether these animations finish.

### Repair And Fabrication

Repair is the first long-term resource sink. Duds, refined salvage, Bits, Charged Bits, and Pulse charges may contribute to different repair recipes, but exact recipes remain open.

Early repair rewards should prioritize:

- Visible restoration of the Pulse and motherboard.
- Reconnection of damaged systems and access to new metagame surfaces.
- Quality-of-life support.
- Carefully limited puzzle-affecting mechanics only after the core restoration loop is proven.

The first repairs should improve the Pulse before they increase player power. Repair should feel physical: fabricate parts, fit them into damaged locations, and visibly bring systems online.

### Resource Direction Under Evaluation

The current design language is promising but not yet a locked recipe system:

- **Duds:** inert or damaged salvage.
- **Bits:** reconstructed building material made from salvage.
- **Charged Bits:** activated components that can power systems.
- **Bit Dust:** material produced by shattered or processed blocks and potentially used as fabrication binder.
- **Pulse charges:** energy generated through centered-square growth.

In the established harvest loop, Duds come from influenced gray blocks at harvest end and Pulse charges come from centered-square growth. Both become banked resources through the harvest transaction.

Possible future run behavior includes a missed piece returning in a cracked state, then shattering into Bit Dust after another failed placement. Some falling pieces may eventually contain a naturally Charged Bit. Exact conversion rates, penalties, and storage rules remain open design questions.

### First-Run Reveal Sequence

The first-run tutorial should initially disguise Twistris as a conventional falling-block game, then reveal the damaged Pulse and the larger restoration layer:

1. Show the current animated **TWISTRIS** title by itself, without explanation.
2. After a short pause, display a small machine-like notification: **GAME IN PROGRESS**.
3. Prompt the player to select **OK** to continue.
4. After the player selects OK, dismiss the title and reveal a conventional falling-block interface. Four horizontal rows are nearly complete, with one vertical four-cell gap and an I tetromino waiting above it.
5. Without player control, automatically drop the I tetromino into the gap. Its four Bits complete what appears to be a standard four-line clear.
6. Flash the completed rows and begin a familiar confirmation sound as though the game is about to clear them.
7. Corrupt or muffle the sound. Make the rows stutter, distort, or remain illuminated instead of clearing, then display **WARNING: STACK DESTABILIZED**.
8. Display a second warning: **PULSE DEFENSE ACTIVATED**.
9. Zoom in while all the blocks shake. One block breaks apart and begins flashing, revealing it as the damaged Pulse.
10. Zoom back out. The remaining lower interface structure that supports the blocks breaks away and falls.
11. Leave a smaller number of blocks clinging to the Pulse.
12. Make those blocks shake and display **GRAVITY GYRO UNSTABLE**.
13. Drop more blocks away. With too much weight still attached, the failing Pulse spins the remaining blocks around it.
14. Leave a convenient single-Bit slot at the top of the Pulse.
15. Change the pure-black background into a blurred, partial view of the computer-like motherboard around the Pulse.
16. Display **GRAVITY GYRO FAILURE IMMINENT**.
17. Automatically drop a loose square Bit from the top toward the prepared slot.
18. Pause it for a notification: **FEED THE PULSE** and **PRESS OK**.
19. When the player selects **OK**, let the Bit fall into place.
20. Play the existing charge animation. Blocks inside the expanded charge area become Duds as they do during a normal run.
21. Move the Duds into the resource counters at the bottom of the screen and store them.
22. Leave only the broken Pulse. Deblur and zoom out to reveal the sparking, damaged motherboard.
23. Hold on the full reveal long enough for the player to absorb it, currently estimated at five to ten seconds.
24. Zoom back toward the Pulse, following copper traces to a damaged location shaped to receive a Bit.
25. Introduce crafting by having the player make the Bit needed for that repair. The recipe, interaction, and exact crafting presentation remain unresolved.

The title confirmation and **FEED THE PULSE** confirmation are the player's only inputs before crafting begins. The staged I tetromino and loose Bit position themselves automatically.

## UX Expectations

- The active puzzle should remain readable, restrained, and responsive.
- The Pulse should be the strongest visual and narrative anchor.
- Harvesting should clearly communicate what was earned and what was banked.
- Repair should feel physical and constructive, not like clicking a generic upgrade button.
- The puzzle run may remain canvas-based; menus and metagame surfaces should prioritize clarity and accessibility.
- New systems should be introduced gradually through visible restoration.

### Metagame Surfaces

The larger restoration loop will need:

- A profile surface showing the active player, banked inventory, and repair progress.
- A harvest summary showing run results, resources earned, and the best centered square reached.
- A fabrication and repair surface showing damaged systems, material costs, assembly patterns, and the visible effect of each repair.
- An in-run HUD that clearly distinguishes run-earned resources from banked inventory.

These should feel like parts of the damaged machine and network rather than conventional shop or upgrade menus.

## Examples of Success

- A new player understands that building centered squares feeds the Pulse.
- A completed run produces a clear, trustworthy harvest result.
- The player can see the Pulse and its network improving across sessions.
- Repair placement reuses the player's spatial knowledge without duplicating the pressure of the falling-block run.
- A mission gives a run purpose while still allowing expressive play.
- An eventual infinite mode offers long-form mastery without replacing finite campaign runs.

## Future Directions

These fit the world but are not committed implementation work:

### Network Reclamation

- Bit Battles or another system-reclamation activity could recover overrun network nodes.
- Restoring one subsystem should reveal or reconnect others, making the Pulse the center of a larger repairable network.
- Infinite or expanding-board modes may provide long-form mastery after the finite restoration campaign establishes its rules.

### Charged And Unstable Pieces

- Some falling tetrominoes may contain a naturally Charged Bit.
- Dud pieces may occasionally appear in the next queue, requiring the player to recognize whether to collect, discard, or integrate them.
- Dying pieces may lose power if they are not integrated into the Pulse in time, convert into Duds, fall away, and leave holes.
- A missed piece may return cracked, then shatter into Bit Dust after another failed placement.

These mechanics should create a salvage-now-or-build-later decision: collect unstable material early for a reliable resource, or risk integrating it for greater structural value.

### Modification Slots

The player may eventually equip a small number of fabricated modifications, initially no more than two. Possible effects include:

- Preventing random Dud pieces.
- Converting incoming Dud pieces into dying pieces.
- Changing salvage, stability, or repair support rules.
- Allowing direct Pulse rotation through a second input axis.

Direct Pulse rotation may prove better as an alternate mode than as an equipped modification. It could support faster Dud and charge collection without replacing the automatic-twist identity of the core mode.

### Future Mechanic Test

New mechanics should preferably do at least one of the following:

- Create tension around structural stability.
- Feed the salvage and repair economy.
- Make the player read the queue more carefully.
- Create new reasons to protect, feed, or repair the Pulse.

## Non-Goals

- Conventional line-clearing Tetris progression.
- A large combat system during the first milestone.
- A sprawling crafting tree before the first repair loop is proven.
- Online accounts, competitive services, or cloud infrastructure.
- Power upgrades that overwhelm the puzzle's readable balance.

## Non-Negotiable Boundaries

- No line clears in the core mode.
- The Pulse remains the center of both gameplay and progression.
- Resources earned during a run are not banked until a defined harvest transaction.
- Repair animation cannot determine whether inventory is awarded.
- Persistent data must be local-first, versioned, and recoverable from invalid saves.
- The project remains dependency-light and directly openable in a browser unless a later decision explicitly changes that constraint.
