# Twistris Project Outline

## Goal

Release a polished browser-first Twistris demo that introduces the damaged Pulse, teaches the puzzle and restoration loops, lets the player secure one broken firewall sector, and unlocks a replayable Endless Feed mode with a small set of upgrades.

## Intended End State

The demo should have two connected rhythms:

- A focused puzzle run built around attachment, imbalance, quarter-turn twists, and centered-square growth.
- A compact metagame where harvested materials repair the Gravity Module, recover one firewall sector from Bugs, and unlock optional Endless upgrades.

The demo reveals that the Pulse belongs to a larger dormant or overrun network, but it deliberately stops after the first secured sector. The remaining Board stays obscured so a future full game can expand the world without the public demo repository defining that campaign in detail.

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
3. Fabricate the material required by the current demo objective.
4. Repair the Gravity Module during onboarding.
5. Recover and secure the first firewall sector.
6. Unlock Endless Feed and the demo's optional upgrades.

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
- A visibly damaged Pulse that improves through the tutorial and first sector recovery.
- One guided four-charge mission.
- One firewall-sector reclamation objective.
- A repair layer based on constructing and placing Bits and a Charged Bit.
- Endless Feed as the replayable mode unlocked at demo completion.
- A small set of upgrades that gives Endless players goals and alternate play options.
- A first-run tutorial built after the systems it teaches are stable in normal play.

### Damaged Pulse Presentation

The Pulse should begin ancient, cracked, dim, and partially failing. Its condition must be readable at a glance, and feeding or repairing it should feel like restoring a machine rather than increasing a score.

Possible damage and recovery details include:

- Cracked casing and missing or broken corner rails.
- Dim, unstable inner light.
- Flicker, sputter, sparks, and visual interference.
- Repaired layers gradually restoring symmetry and brightness.

The demo should show at least the broken baseline, the stabilized Gravity Module, and the secured firewall result. The Pulse's condition should be reflected both in gameplay and in the title presentation.

The Pulse is the network's central processor. Every visible copper trace should connect physically back to the Pulse, then radiate outward toward modules, sockets, and obscured Board regions.

### Persistent Player Profile

The demo requires a local-first profile that survives browser sessions. The profile should communicate:

- Player name.
- Banked Pulse charges and Duds.
- Repair progress and unlocked parts or systems.
- Firewall-sector and Endless Feed status.
- Unlocked and equipped demo upgrades.
- Best centered square reached.
- Total runs and harvests.

Run-earned resources remain separate from banked inventory until harvest. Profile data should support reset without requiring an online account. Export and import are optional release-polish work, not a requirement for the first demo build.

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

Repair is the demo's progression sink. The first guided fabrication recipe is established:

**8 Duds + 1 Pulse charge = 1 Bit**

The damaged Pulse acts as the fabricator: Duds and a charge enter it, and a reconstructed Bit emerges. The demo still needs a clear, attainable way to create or obtain the Charged Bit used to secure the firewall. Bit Dust behavior remains optional.

Demo repair rewards should prioritize:

- Visible restoration of the Pulse and motherboard.
- Reconnection of the Gravity Module and first firewall sector.
- Quality-of-life support.
- A small optional upgrade set for Endless Feed.

The first repairs should improve the Pulse before they increase player power. Repair should feel physical: fabricate parts, fit them into damaged locations, and visibly bring systems online.

### Resource Direction

The current resource language is:

- **Duds:** inert or damaged salvage.
- **Bits:** reconstructed building material used to replace missing components and repair physical system breaks.
- **Charged Bits:** activated components that provide continuing power to defenses and other active systems.
- **Bit Dust:** material produced by shattered or processed blocks and potentially used as fabrication binder.
- **Pulse charges:** energy generated through centered-square growth.

In the established harvest loop, Duds come from influenced gray blocks at harvest end and Pulse charges come from centered-square growth. Both become banked resources through the harvest transaction.

The Charged Bit acquisition rule, whether the failed firewall component leaves recoverable Bit Dust, and whether Bit Dust belongs in the demo remain open design questions.

When Bits or Charged Bits travel outside a tetromino, counter, or installed socket, they use a simple shared animation language: two tiny feet appear, the square walks along surfaces or copper traces, and it makes a small hop into its destination slot. This should remain a compact, readable animation rather than a full character performance.

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
24. Zoom back toward the Pulse, following copper traces to the broken Gravity Module on its left and briefly revealing a damaged location shaped to receive a Bit.
25. Pull back into the first metagame view with the Pulse on the left. Copper traces lead toward the options on the right. Unavailable options are blacked or scratched out; **BOARD**, **CRAFT**, and a disabled gray **QUIT** are the only visible choices.
26. Begin a guided sequence with an arrow pointing toward the flashing **CRAFT** option.
27. Make **CRAFT** the only available interaction.
28. When the player selects it, blur the Pulse slightly and open an interface headed **CRAFTING**. Its only recipe is **CRAFT BIT**.
29. Have the player select **CRAFT BIT**.
30. Fade the crafting interface and drift the view back until the Pulse is centered.
31. Stream eight Duds from the lower-right Dud counter, reducing it from eight to zero, and circle them around the Pulse twice.
32. Feed the eight circling Duds into the cracked side of the Pulse.
33. Make the Pulse pulse as one Pulse charge is consumed, reducing its counter from one to zero.
34. Emit one newly fabricated Bit from the same side of the Pulse. Give it two tiny feet when it lands.
35. Have the Bit walk to the bottom of the screen and hop into its newly introduced inventory counter at one. The Dud and Pulse charge counters remain visible at zero.
36. Shift the view to the left of the Pulse and reveal the damaged Gravity Module with its empty Bit-shaped upgrade slot.
37. Highlight the module with a guided arrow and have the player select it.
38. Have the Bit hop out of its counter, walk along an illuminated copper trace on its tiny feet, and jump into the Gravity Module's upgrade slot. Reduce the Bit counter from one to zero.
39. Send a brief activation current from the Pulse through the repaired connection without consuming another resource or turning the installed component into a Charged Bit.
40. Align the Gravity Module, stop its shaking, and bring it online.
41. Settle the unstable structure and stop the Pulse's uncontrolled rotation.
42. Display **GRAVITY GYRO STABILIZED** and **MODULE ONLINE**.
43. Pull back to the **BOARD** view. Show only the Pulse region and one nearby section; obscure everything beyond them with dark interference and fog of war.
44. Present the nearby section as operational and protected, with a Charged Bit installed in a firewall socket at its boundary.
45. Make the old Charged Bit flicker, crack, and finally break. It may leave behind Bit Dust, but whether that material is awarded remains unresolved.
46. Shut down the firewall's illuminated boundary. Corrupt or flash the copper traces leading into the fog.
47. Send Bugs out of the darkness, along the exposed traces, and into the formerly safe section.
48. Display **FIREWALL FAILURE** and **SECTOR COMPROMISED**.
49. Make the section visibly infested, but stop the Bugs before they reach the Pulse. This creates a clear recovery objective without immediately threatening a game over.
50. Leave the broken firewall socket visible as a destination for a future Charged Bit.
51. Return to the Pulse menu after the Board reveal.
52. Add a new **FEED THE PULSE** option and draw attention to it. This is the game's diegetic Play button.
53. Have the player select **FEED THE PULSE** to begin their first normal run.
54. Present the first mission: generate four Pulse charges.
55. Open the active puzzle with the repaired Gravity Module online and give the player full movement, rotation, and placement control for the first time.

The title confirmation and **FEED THE PULSE** confirmation are the player's only inputs before crafting begins. The staged I tetromino and loose Bit position themselves automatically.

This full fabrication animation teaches that the Pulse converts harvested material into useful parts. Later crafts should use a faster version of the same visual language so repeated fabrication remains satisfying without becoming tedious.

The Gravity Module repair establishes the functional difference between resource types: ordinary Bits repair missing structure, while Charged Bits later provide sustained power for systems such as firewalls. The wider Board and Bug threat should be introduced only after the Gravity Module is stable.

After onboarding, **FEED THE PULSE** remains the primary action for starting a puzzle run. Missions give each run a clear restoration objective, beginning with the simple goal of generating four Pulse charges.

## UX Expectations

- The active puzzle should remain readable, restrained, and responsive.
- The Pulse should be the strongest visual and narrative anchor.
- Harvesting should clearly communicate what was earned and what was banked.
- Repair should feel physical and constructive, not like clicking a generic upgrade button.
- The puzzle run may remain canvas-based; menus and metagame surfaces should prioritize clarity and accessibility.
- New systems should be introduced gradually through visible restoration.

### Metagame Surfaces

The demo restoration loop will need:

- A profile surface showing the active player, banked inventory, and repair progress.
- A harvest summary showing run results, resources earned, and the best centered square reached.
- A fabrication and repair surface showing damaged systems, material costs, assembly patterns, and the visible effect of each repair.
- An in-run HUD that clearly distinguishes run-earned resources from banked inventory.

These should feel like parts of the damaged machine and network rather than conventional shop or upgrade menus.

## Examples of Success

- A new player completes the full reveal and understands that building centered squares feeds the Pulse.
- A completed run produces a clear, trustworthy harvest result.
- The player repairs the Gravity Module and secures the first firewall sector.
- Repair placement reuses the player's spatial knowledge without duplicating the pressure of the falling-block run.
- The four-charge mission gives the first unrestricted run a clear purpose.
- Endless Feed unlocks at a satisfying demo endpoint and remains enjoyable without requiring unfinished campaign content.
- Three or four upgrades give interested players additional demo goals and ways to alter Endless play.

## Demo Completion Loop

1. Complete the first-run reveal through the Gravity Module repair and firewall breach.
2. Select **FEED THE PULSE** and complete the first four-charge mission.
3. Harvest and fabricate the resources required by the firewall objective.
4. Create or obtain a Charged Bit.
5. Send the Charged Bit to the broken firewall slot and secure the infested sector.
6. Display a clear demo completion result and unlock **ENDLESS FEED**.
7. Let players continue earning and unlocking a small set of optional upgrades.

The firewall recovery should hint at a larger world without requiring extended grinding. The intended target is a short path of roughly one or two normal runs after onboarding, subject to playtesting.

## Demo Upgrades Under Evaluation

The released demo should contain approximately three or four meaningful upgrades, selected through implementation and playtesting rather than committing to every candidate:

- **Gyro Override:** optional manual quarter-turn control of the Pulse, distinct from the repaired automatic Gravity Module.
- **Queue Scanner:** shows another upcoming tetromino.
- **Balance Sensor:** previews the likely twist direction.
- **Salvage Stabilizer:** gives unstable salvage another chance before it is lost.
- **Charge Capacitor:** protects or increases limited charge capacity.
- **Dud Compressor:** improves one defined salvage or crafting transaction.
- **Firewall Relay:** supports the secured demo sector.

The demo may expose no more than two equipped modification slots if equipment choices are included. Gyro Override should remain optional because it significantly changes puzzle control and may require a cooldown, resource constraint, or between-piece restriction.

## Beyond The Demo

The full game may open more of the Board and extend its restoration systems. The tracked repository intentionally leaves that direction broad. Detailed post-demo ideas belong in the gitignored local design area until Katherine explicitly promotes one into the public project scope.

## Non-Goals

- Conventional line-clearing Tetris progression.
- More than the first recoverable firewall sector.
- A detailed public roadmap for the full Board campaign.
- A large combat system or sprawling crafting tree.
- Online accounts, competitive services, or cloud infrastructure.
- Power upgrades that overwhelm the puzzle's readable balance.

## Platform And Performance Direction

- The browser is the primary development and release platform.
- The same web game should remain packageable for Windows, macOS, and Linux, and later for Android and iOS.
- Desktop and mobile packages should wrap the web build rather than fork puzzle, economy, progression, or tutorial logic.
- Keyboard, controller, and touch input should meet through one action layer.
- Platform capabilities such as storage, haptics, fullscreen, lifecycle, and achievements must sit behind replaceable adapters.
- The game should target smooth 60 FPS presentation on desktop and modern mobile hardware, with bounded resolution, pooled repeated objects, culled off-screen or fog-hidden entities, and a reduced-effects option.
- Save data must remain portable and versioned across browser and packaged builds.

## Non-Negotiable Boundaries

- No line clears in the core mode.
- The Pulse remains the center of both gameplay and progression.
- Resources earned during a run are not banked until a defined harvest transaction.
- Repair animation cannot determine whether inventory is awarded.
- Persistent data must be local-first, versioned, and recoverable from invalid saves.
- Twistris remains browser-first even when optional desktop and mobile packages are added.
- Platform packaging cannot fork core game rules or progression data.
