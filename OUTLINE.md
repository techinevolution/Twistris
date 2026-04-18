# Twistris Outline

## 1. High Concept
Twistris is a falling-block puzzle game where tetrominoes fall from the top, attach to a central mass, and can rotate that settled stack by one 90 degree step when the structure becomes imbalanced.

The immediate run goal is to stabilize and expand the structure around the Pulse to generate charges and salvage.

The new long-term goal is to repair the Pulse over many runs. The Pulse is damaged, unstable, and no longer operating at full strength. The player is not only building a square. The player is feeding and restoring a broken machine.

## 2. Current Playable Loop
1. First-time players are dropped directly into a broken-Pulse tutorial view instead of a normal title screen.
2. The player clicks the damaged Pulse out of curiosity.
3. A lightweight command-line style prompt asks for the player's name and creates the profile.
4. The tutorial board begins in a special gyro-failure state.
5. After the first repair restores the gyro, normal run behavior begins.
6. Spawn a tetromino and show the next piece preview.
7. Player moves, rotates, soft drops, or hard drops the piece.
8. Piece only locks if it attaches to the existing structure.
9. After lock, evaluate a weighted horizontal center-of-mass imbalance.
10. If imbalance exceeds threshold, rotate the settled stack by one quarter turn.
11. Recompute the largest fully filled centered square and update the Pulse influence area.
12. Gain one Pulse charge whenever the centered square expands by one layer.
13. Continue until collapse, restart, or a future harvest/exit action.

## 3. New Direction

### A. The Pulse Is Broken
The Pulse should no longer look pristine or peerless.

Desired fantasy:
- The Pulse is ancient, cracked, dim, or partially failing.
- The player is helping it recover.
- Growth and resource collection should feel like restoration, not just score.

This changes the game from:
- "build the biggest square"

Into:
- "feed the Pulse, stabilize the structure, and slowly repair a damaged core"

### B. Runs Should Feed a Persistent Meta Loop
The current prototype has a satisfying board loop, but it ends at restart.

The new target is:
- a run produces resources,
- those resources are banked to a profile,
- banked resources unlock repairs,
- repairs change future runs.

### C. Duds Need Purpose
Right now duds are only a visual/state category.

Future intent:
- duds become salvage,
- salvage combines with Pulse charges,
- salvage plus charges can craft repairs or maintenance actions for the Pulse.

## 4. Target Meta Loop
1. Start a run with the current profile and current Pulse condition.
2. Build the centered square and survive as long as possible.
3. Generate Pulse charges from square growth.
4. Generate duds from future dud-producing board states or harvested gray blocks.
5. End the run by collapse, restart, or later by a deliberate harvest action.
6. Convert the run's collected resources into profile inventory.
7. Spend inventory on repairs, upgrades, or restorations for the Pulse.
8. Begin the next run with the updated Pulse state.

## 5. Core Planned Systems

### A. Damaged Pulse Presentation
This is the first major fiction upgrade.

Requirements:
- The Pulse needs a damaged baseline appearance in gameplay and title.
- Damage state should be readable at a glance.
- Repairs should visibly improve the Pulse over time.

Possible visual states:
- cracked casing
- dim or unstable inner light
- missing or broken corner rails
- flicker, sputter, or interference
- repaired layers gradually restoring symmetry and brightness

Important rule:
- the Pulse should have multiple repair stages, not just broken and fixed

### B. Persistent User Profiles
The game needs a save system before a repair loop makes sense.

Minimum profile data:
- player name
- total banked Pulse charges
- total banked duds
- repair progress or unlocked repair parts
- best centered square reached
- total runs
- total harvests

Likely implementation target:
- local first persistence using browser storage
- simple versioned save schema
- first profile created by clicking the Pulse and entering a name through a lightweight command-line style prompt
- support for reset profile and future export/import

### C. Post-Run Harvest / Collection
The player needs a clean way to carry run output into the profile.

Resource definitions:
- Pulse charges
  Harvest resource generated when the centered square expands by one layer.
  Banked at harvest end.
  Used as a high-value repair resource.
- Duds
  Salvaged from influenced gray blocks at harvest end.
  Banked at harvest end.
  Used as bulk repair material.

This system should answer:
- what counts as a harvested Pulse charge
- what counts as a harvested dud
- when resources are banked
- what the player sees at end of run

Working direction:
- every run ends with a harvest summary
- summary shows newly earned Pulse charges
- summary shows newly earned duds/salvage
- player confirms collection into persistent inventory

### D. Repair Crafting
This is the first real long-term spend sink.

Repairs should consume:
- Pulse charges
- duds or refined dud salvage

Repair outputs could include:
- cosmetic restoration of the Pulse
- slight gameplay support mechanics
- quality-of-life improvements
- unlocks for later mechanics

Early rule:
- repairs should improve the Pulse first, and gameplay power second

## 6. Immediate Open Design Questions
These do not block the plan, but they must be answered during implementation.

### A. What Exactly Is a Dud?
Resolved for current plan:
- Duds are salvaged from influenced gray blocks at harvest end.

### B. When Does Harvest Happen?
Resolved for current plan:
- Pulse charges and duds are both banked at harvest end.
- First implementation should use automatic harvest on run end.

### C. What Do Repairs Actually Change?
Candidate outputs:
- visual repair only
- visual repair plus title/HUD changes
- visual repair plus small board tools

Working recommendation:
- first repair milestones should be mostly visual
- later milestones can introduce new mechanics

That keeps the fiction strong without destabilizing the current board loop too early.

## 7. UI / Screen Work That Will Be Needed

### A. Profile Surface
- active player name
- total banked charges
- total banked duds
- repair progress

### B. Harvest Summary Screen
- run results
- resources earned
- best square reached
- continue to repair screen or next run

### C. Repair Screen
- show damaged Pulse state
- list repairs
- show costs in charges and duds
- preview visual impact of each repair

### D. In-Run HUD Adjustments
- distinguish run-earned resources from banked resources
- clarify whether charges are temporary, harvestable, or already owned

## 8. Technical Build Order
This is the recommended sequence for implementation.

1. Define the resource model in plain language.
   - Pulse charges: harvest resource generated when the centered square expands by one layer.
   - Duds: salvaged from influenced gray blocks at harvest end.
2. Add persistent profile storage.
   - local save schema
   - load/create/reset flow
3. Add end-of-run harvest summary.
   - convert run resources into saved profile inventory
4. Add damaged Pulse visual states.
   - baseline broken state
   - at least 2 to 3 repair stages
5. Add the first repair crafting screen.
   - spend charges and duds
   - unlock visible restoration
6. Only after that, consider repair rewards that affect gameplay.

## 9. Recommended First Milestone
The first milestone should be narrow and prove the full loop.

### Milestone: Feed the Pulse, Recover Salvage, and Complete the First Repair
- save a local profile
- track run-earned Pulse charges
- count run-earned duds at game over
- show a harvest summary
- bank both resources into the profile
- unlock one simple repair tier for the damaged Pulse
- use that first repair to reactivate the Pulse gyro so normal rotation behavior can return
- reflect that repair visually on the title and in game

If this milestone works, the game will have:
- a puzzle loop
- a meta loop
- a reason to replay
- a visible sense of restoration

## 10. What Not To Build Yet
- multiple character classes
- online accounts
- cloud sync
- large minigame branches
- combat or enemy systems
- a huge crafting tree

The current priority is to make the damaged Pulse and repair loop real before adding wider content.

## 11. Future Mechanic Directions
These are not part of the first milestone, but they are strong candidates for future production.

### A. Modification Slots
The player may eventually have two equipment or modification slots.

Purpose:
- hold crafted upgrades or support modules
- let repairs affect future runs in a clearer, more build-like way
- create longer-term decisions without needing a huge upgrade tree immediately

Working direction:
- keep the first version to 2 slots only
- use crafted items or Pulse modifications as slotted objects
- make these affect run rules, salvage behavior, stability, or repair support

Candidate slot effects:
- prevent random dud pieces from appearing
- convert incoming dud pieces into dying minos instead
- allow direct Pulse spin control on a second input axis, such as `Left` and `Right`

Future branch to explore:
- this direct-spin modification could become an alternate game mode instead of only a slot effect
- a direct-spin mode may be better suited to fast dud and charge collection than the current automatic twist system

### B. Random Dud Pieces In The Next Queue
Future pressure system:
- dud pieces can occasionally appear in the next piece preview
- the player must recognize them quickly

Possible behavior:
- if dropped off the structure or off the board correctly, they are collected immediately
- if attached to the structure, they eventually fall out or decay anyway

Design value:
- forces the player to pay attention to the queue
- creates moments where not every spawn is purely for building
- adds risk/reward around early salvage collection

### C. Dying Minos
Future pressure system:
- some active pieces are unstable or dying
- they must be integrated into the Pulse before their power fades

Possible behavior:
- if integrated in time, they help complete the structure
- if not integrated in time, they convert into duds
- once they fail, they fall away and leave holes unless repaired

Design value:
- creates time pressure beyond ordinary falling
- gives pieces more identity
- ties directly into the salvage economy and hole-repair loop

### D. Salvage-Now-Or-Build-Later Decisions
A promising future pattern is:
- collect unstable material early for salvage
- or try to integrate it cleanly before it fails

This creates a good tension:
- early collection gives resources now
- delayed integration may help the structure more
- failure creates holes and may force repair-block use

### E. Future Design Rule
As new mechanics are added, they should preferably do at least one of these:
- create tension around structure stability
- feed the salvage and repair economy
- make the player read the queue more carefully
- create new reasons to protect or repair the Pulse
