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

### Resource Direction Under Evaluation

The current design language is promising but not yet a locked recipe system:

- **Duds:** inert or damaged salvage.
- **Bits:** reconstructed building material made from salvage.
- **Charged Bits:** activated components that can power systems.
- **Bit Dust:** material produced by shattered or processed blocks and potentially used as fabrication binder.
- **Pulse charges:** energy generated through centered-square growth.

Possible run behavior includes a missed piece returning in a cracked state, then shattering into Bit Dust after another failed placement. Some falling pieces may eventually contain a naturally Charged Bit. Exact conversion rates, penalties, and storage rules remain open design questions.

## UX Expectations

- The active puzzle should remain readable, restrained, and responsive.
- The Pulse should be the strongest visual and narrative anchor.
- Harvesting should clearly communicate what was earned and what was banked.
- Repair should feel physical and constructive, not like clicking a generic upgrade button.
- The puzzle run may remain canvas-based; menus and metagame surfaces should prioritize clarity and accessibility.
- New systems should be introduced gradually through visible restoration.

## Examples of Success

- A new player understands that building centered squares feeds the Pulse.
- A completed run produces a clear, trustworthy harvest result.
- The player can see the Pulse and its network improving across sessions.
- Repair placement reuses the player's spatial knowledge without duplicating the pressure of the falling-block run.
- A mission gives a run purpose while still allowing expressive play.
- An eventual infinite mode offers long-form mastery without replacing finite campaign runs.

## Future Directions

These fit the world but are not committed implementation work:

- Bit Battles or another system-reclamation activity.
- Overrun network nodes and recoverable subsystems.
- Infinite or expanding-board modes.
- Charged cells embedded in falling tetrominoes.
- Cracked pieces, Bit Dust pressure, and salvage-versus-placement decisions.
- Specialized Bits, modification slots, or support modules.

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
