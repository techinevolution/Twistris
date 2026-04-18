# Twistris TODO

## First Milestone
Feed the Pulse, recover salvage, and complete the first repair.

This milestone should prove the full loop:
- the player meets a damaged Pulse
- the player completes a guided first interaction
- the player gains a charge
- the player recovers dud salvage
- the player crafts the first repair material
- the player reactivates the gyro that allows the Pulse to spin again
- the player uses it to solve a blocked square-growth problem
- the run ends and the result is saved to a persistent profile

## Tutorial Stage Checklist
This section is the single checklist for everything needed to make the first-run tutorial stage real.

### Pre-Entry / First-Run Presentation
- [ ] Skip the normal title-screen start flow for first-time players.
- [ ] Open the game directly into the broken-Pulse tutorial view.
- [ ] Reuse the current title-screen visual language as a base, but make the whole scene feel damaged and failing.
- [ ] Remove any need for a `Start` button on first run.
- [ ] Make the Pulse itself the clear point of curiosity and interaction.
- [ ] Make the broken scene readable before the player clicks anything.

### Entry / Profile Creation
- [ ] Let the player begin by clicking directly on the Pulse.
- [ ] Show a lightweight command-line style prompt asking for the player's name.
- [ ] Create the player profile immediately from that name entry.
- [ ] Use the saved player name in tutorial messaging.

### Tutorial Board Setup
- [ ] Create a special first-run tutorial state.
- [ ] Start the camera much more zoomed in on the damaged Pulse.
- [ ] Show the Pulse in a visibly broken state from the first frame.
- [ ] Seed the tutorial board with one attached straight tetromino at the bottom of the Pulse.
- [ ] Optionally seed a second attached dud tetromino so the opening feels unstable and desperate.
- [ ] Ensure the tutorial setup is intentionally not a full normal run state.

### Gyro Failure Setup
- [ ] Disable Pulse rotation during the tutorial opening.
- [ ] Treat the missing spin as a failed gyro or comparable broken stabilizer system.
- [ ] Make sure the lack of rotation reads as a system failure, not a random rule change.

### Scripted Breakdown Beat
- [ ] Script one attached tutorial tetromino to fall away immediately.
- [ ] Script the remaining attached dud structure to break away just after the player places the first block that completes a charge.
- [ ] Count the fallen dud pieces as recovered salvage for the tutorial beat.

### First Charge / Salvage Teaching
- [ ] Start the player with one Pulse charge for the tutorial/crafting beat, or grant it in-scene.
- [ ] Make the first successful tutorial placement complete exactly one Pulse charge.
- [ ] Add stronger feedback for gaining a Pulse charge.
- [ ] Show a message explaining that salvage was recovered from the fallen dud pieces.

### First Craft / Repair Beat
- [ ] Add the first craft recipe: `8 duds + 1 Pulse charge = 1 repair block`.
- [ ] Show the cost clearly before the craft is confirmed.
- [ ] Deduct the recipe cost correctly.
- [ ] Add feedback when the craft completes.
- [ ] Detect the blocking hole or void.
- [ ] Show a message such as `Void detected`.
- [ ] Automatically or near-automatically place the crafted repair block into the required hole.
- [ ] Visually show the block traveling into the hole or being absorbed into position.

### Tutorial Completion
- [ ] Show that the first repair reactivates the gyro or stabilizer system.
- [ ] Restore normal Pulse rotation only after the gyro repair completes.
- [ ] Transition cleanly from the scripted tutorial slice into the normal game loop.

### Tutorial Persistence / Aftercare
- [ ] Save first-run tutorial completion state.
- [ ] Make sure tutorial exceptions do not break the normal harvest rules.
- [ ] Decide whether tutorial salvage is granted instantly or only shown again at harvest end.
- [ ] Verify the normal run still ends in a harvest summary after the tutorial is complete.

## 1. Tutorial Slice

### Goal
Build a short opening sequence that teaches the fiction and the first repair mechanic before the full game opens up.

Mechanical purpose:
- the tutorial exists to reactivate the Pulse gyro
- the gyro repair is what re-enables normal Pulse spin behavior
- until the gyro is restored, the opening state does not run like the full game

### Tasks
- [ ] Create a special first-run tutorial state.
- [ ] Start the camera much more zoomed in on the damaged Pulse.
- [ ] Show the Pulse in a visibly broken state from the first frame.
- [ ] Seed the tutorial board with one attached straight tetromino at the bottom of the Pulse.
- [ ] Optionally seed a second attached dud tetromino so the opening feels unstable and desperate.
- [ ] Disable Pulse rotation during this first interaction.
- [ ] Treat the missing spin as a failed gyro or comparable broken stabilizer system.
- [ ] Script one attached tutorial tetromino to fall away immediately.
- [ ] Script the remaining attached dud structure to break away just after the player places the first block that completes a charge.
- [ ] Ensure the tutorial setup is intentionally not a full normal run state.
- [ ] Transition from the scripted tutorial slice into the normal game loop once the first repair/craft beat is understood.
- [ ] Restore normal Pulse rotation only after the gyro repair completes.

### Notes
- The opening should feel like the player is arriving just as the Pulse is failing.
- The Pulse should look beaten, unstable, and on its last limb.
- The tutorial board is allowed to break normal rules if it creates a better first story beat.
- The lack of rotation should read as a system failure, not a random rules exception.
- On first run, this opening replaces the normal title-screen start flow.

## 2. First Guided Resource Beat

### Goal
Teach the player what a Pulse charge is and why salvage matters.

### Tasks
- [ ] Start the player with one Pulse charge for the tutorial/crafting beat.
- [ ] Make the first successful tutorial placement complete exactly one Pulse charge.
- [ ] Add stronger feedback for gaining a Pulse charge.
- [ ] Reserve space for future charge sound support.
- [ ] Count the fallen dud pieces as collected salvage for the tutorial.
- [ ] Show a simple message after the collapse/tutorial breakaway explaining that salvage was recovered.

### Notes
- This first beat should make the player understand that charges are precious.
- The player should also understand that broken gray material is useful, not just trash.

## 3. Resource Rules For Milestone One

### Canonical Rules
- Pulse charges are generated when the centered square expands by one layer.
- Duds are salvaged from influenced gray blocks at harvest end.
- For the tutorial slice, fallen scripted dud pieces can also count as recovered salvage.

### Tasks
- [ ] Track run-earned Pulse charges separately from banked profile charges.
- [ ] Track run-earned dud salvage separately from banked profile salvage.
- [ ] Decide whether tutorial salvage is granted instantly or only shown at harvest end.
- [ ] Make sure tutorial exceptions do not break the normal harvest rules.

## 4. First Crafting Rule

### Goal
Turn salvage into a simple useful object right away.

### Working Rule
- `8 duds + 1 Pulse charge = 1 repair block`

### Tasks
- [ ] Add a craftable repair block resource.
- [ ] Name the resource in UI.
- [ ] Keep the internal system flexible in case the public name changes to `Mino`, `Repair Mino`, or something similar later.
- [ ] Add the first craft recipe: `8 duds + 1 Pulse charge`.
- [ ] Show the cost clearly before the craft is confirmed.
- [ ] Deduct the recipe cost from available resources.
- [ ] Add simple feedback when the craft completes.

### Notes
- This should be the first meaningful spend sink for charges and salvage.
- The first craft should feel automatic enough that the player does not get stuck in menu friction.

## 5. Hole Repair / Void Plugging

### Goal
Use the crafted block to solve a missing-cell problem that prevents Pulse growth.

### Tasks
- [ ] Detect when a missing cell is blocking the next centered square expansion.
- [ ] Add a message such as `Void detected` when that state appears.
- [ ] Let the crafted repair block plug the required hole.
- [ ] For milestone one, keep placement automatic or near-automatic.
- [ ] Visually show the block traveling into the hole or being absorbed into position.
- [ ] Prevent wasting the crafted block on irrelevant cells in the first milestone.

### Notes
- The first version should prefer clarity over flexibility.
- Automatic placement is fine if it teaches the mechanic cleanly.

## 6. Damaged Pulse Visual States

### Goal
Make the Pulse feel broken before repairs and improved after them.

### Tasks
- [ ] Design a baseline broken Pulse state for title and gameplay.
- [ ] Add at least one visible repair improvement for milestone one.
- [ ] Make the first repair visibly affect the Pulse immediately.
- [ ] Show that the first repair reactivates the gyro or stabilizer system.
- [ ] Keep the broken and repaired states readable even when zoomed out.
- [ ] Reserve room for multiple future repair stages instead of only broken/fixed.

### Broken-State Ideas
- cracked housing
- unstable inner light
- missing or bent outer rails
- intermittent flicker
- chipped corners
- failed gyro or inert stabilizer assembly

## 7. Persistent Profile Work

### Goal
Save the player’s progress so the repair loop matters.

### Tasks
- [ ] Open the first session by having the player click directly on the Pulse.
- [ ] Show a lightweight command-line style prompt asking for the player's name.
- [ ] Create the profile immediately from that name entry.
- [ ] Use the saved player name in tutorial and future system messages.
- [ ] Create a local profile save schema.
- [ ] Save banked Pulse charges.
- [ ] Save banked dud salvage.
- [ ] Save crafted repair block count.
- [ ] Save repair progress/state of the Pulse.
- [ ] Save first-run tutorial completion state.
- [ ] Save basic stats such as total runs, total harvests, and best square size.
- [ ] Add safe load, create, and reset profile flows.

## 8. Harvest Summary Screen

### Goal
Turn run end into a clear banking moment.

### Tasks
- [ ] Add a harvest summary screen at run end.
- [ ] Show Pulse charges earned this run.
- [ ] Show dud salvage earned this run.
- [ ] Show any crafted repair blocks if relevant.
- [ ] Show what gets banked to the profile.
- [ ] Confirm the updated profile totals after banking.

### Notes
- Even if the tutorial grants resources immediately, the normal run structure should still end in a harvest summary.

## 9. UI / Messaging Tasks

### Core Messages
- [ ] Intro/tutorial message for the damaged Pulse state.
- [ ] Pulse charge gained message.
- [ ] Salvage recovered message.
- [ ] Craft complete message.
- [ ] `Void detected` or equivalent hole-repair message.
- [ ] First repair complete message.

### Screen Surfaces
- [ ] Tutorial overlay or message system.
- [ ] Pulse-click name prompt for first profile creation.
- [ ] Craft prompt or lightweight crafting panel.
- [ ] Repair confirmation screen or repair panel.
- [ ] Profile totals display.

## 10. Technical Delivery Order
Build in this order unless implementation pressure forces a change.

1. Tutorial state and scripted opening board.
2. Broken Pulse visuals.
3. Run resource tracking.
4. Profile save/load.
5. Harvest summary.
6. First craft recipe.
7. Automatic void detection and repair-block placement.
8. First visible repair completion and gyro reactivation.

## 11. Open Questions
- [ ] Should tutorial salvage bank immediately or wait for the first harvest screen?
- [ ] Should the player literally start with one banked Pulse charge, or should the tutorial grant it in-scene before crafting?
- [ ] What should the crafted block be called in the final fiction?
- [ ] Does the first repair only restore visuals, or also unlock one support mechanic?
- [ ] What is the final system name: `gyro`, `stabilizer`, or something more Pulse-specific?
- [ ] What exact tone should the command-line name prompt use?

## 12. Done Means
This milestone is done when:
- a new player can start the game and understand the Pulse is damaged
- the player earns or receives the first Pulse charge
- the player recovers dud salvage
- the player crafts the first repair block
- the player restores the gyro so the Pulse can rotate again
- the player uses that block to solve a blocked square-growth problem
- the run result is saved to a persistent profile
- the Pulse visibly improves after the first repair

## 13. Future Backlog
Do not pull these into milestone one unless they become necessary.

### Modification Slots
- [ ] Add 2 player modification slots for crafted upgrades or Pulse modules.
- [ ] Define what kinds of crafted items can be slotted.
- [ ] Decide whether slots modify salvage, stability, queue behavior, or repair efficiency.
- [ ] Test a modification that prevents random dud pieces from appearing.
- [ ] Test a modification that converts incoming dud pieces into dying minos instead.
- [ ] Test a modification that gives direct Pulse spin control on a second input, such as `Left` and `Right`.
- [ ] Decide whether direct Pulse spin should stay a slot effect or become a separate game mode.

### Random Dud Queue Pieces
- [ ] Add occasional dud pieces to the next piece queue.
- [ ] Teach the player that these are salvage opportunities, not normal build pieces.
- [ ] Let intentionally discarded dud pieces collect instantly.
- [ ] Decide what happens if the player attaches a dud piece anyway.

### Dying Minos
- [ ] Add unstable minos that lose power over time.
- [ ] If not integrated in time, convert them into duds.
- [ ] Make failed dying minos fall away and leave holes.
- [ ] Feed those failed pieces back into salvage collection.

### Tension / Difficulty Expansion
- [ ] Add more mechanics that force the player to read the queue more carefully.
- [ ] Add more mechanics that create holes, decay, or repair pressure.
- [ ] Add more mechanics that make salvage versus structure decisions interesting.
- [ ] Explore whether direct Pulse spin creates a more fun salvage-collection mode than automatic turning.
