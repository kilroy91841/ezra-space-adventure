# Ezra's Space Adventure Game - Design Document

**Date:** February 17, 2026
**For:** Ezra (age 6.5) and Dad
**Status:** Approved Design

## Overview

A 2D space adventure game where a magic robot must recruit allies (an alien and a psychic) to defeat an evil dragon. The game combines puzzle-solving, boss battles, and strategic combat with a power-up collection system.

## Core Concept

The player controls a magic robot exploring 6 dimensions in space. Early dimensions focus on puzzle-solving to collect power-ups and weapons. Later dimensions feature boss battles where the robot must defeat enemies to turn them into allies. The final battle requires teamwork between the robot, alien ally, and psychic ally to defeat the dragon.

## Game Structure

### 6 Dimensions

1. **Dimension 1: Memory Puzzle**
   - Purpose: Tutorial and power-up collection
   - Challenge: Memory-based puzzle to unlock exit
   - Reward: Initial weapons and power-ups

2. **Dimension 2: Alien Boss Fight**
   - Purpose: First boss battle
   - Challenge: Defeat the alien by collecting power-ups AND dodging attacks
   - Mechanic: Must collect enough power-ups to be strong enough, then bump into alien to defeat
   - Outcome: Alien turns from evil to good and joins as ally

3. **Dimension 3: Psychic Character (Story)**
   - Purpose: Narrative moment and ally recruitment
   - Type: Story-based dimension (no combat/puzzle)
   - Character: Psychic with door-opening and healing powers
   - Outcome: Psychic joins the team

4. **Dimension 4: Mini-Dragon Fight**
   - Purpose: Mid-game boss to prepare for final battle
   - Challenge: Smaller dragon with reduced health
   - Mechanic: Test the full combat system with alien ally

5. **Dimension 5: Adaptive Math Puzzle**
   - Purpose: Final preparation before dragon
   - Challenge: Math puzzles that get harder based on performance
   - Special: Psychic uses powers to open this door
   - Note: Ezra is very good at math - make it challenging!

6. **Dimension 6: Dragon Boss (Final Battle)**
   - Purpose: Epic final showdown
   - Team: Robot (player) + Alien (attacks) + Psychic (heals)
   - Challenge: Hardest boss with most health
   - Victory condition: Defeat dragon to win game

### Dimension Transitions

**Version 1:** Simple - completing puzzle/boss opens exit to next dimension
**Future:** Each dimension has unique entry/exit mechanics

## Characters

### Player Character: Magic Robot
- **Appearance:** Pixel art robot with magic antenna
- **Controls:** Arrow keys for movement
- **Primary Action:** Shoot magic blasts (spacebar)
- **Special:** Can equip multiple weapons, switch between them
- **Power System:** More power-ups = stronger attacks

### Alien (Enemy → Ally)
- **Initial State:** Evil boss in Dimension 2
- **Battle Mechanic:** Player must dodge alien attacks AND collect power-ups to defeat
- **Defeat Method:** Combination of dodging (C) and collecting power-ups (B)
- **Post-Defeat:** Becomes ally and fights alongside player
- **Ally Behavior:** Player can share power-ups with alien; alien uses those moves automatically to attack enemies
- **Vulnerability:** If hit by dragon, alien loses power-ups; if loses ALL power-ups, gets knocked out and must be revived

### Psychic Character
- **Appearance:** Story dimension character (Dimension 3)
- **Special Powers:** Can open magically locked doors (Dimension 5)
- **Role in Final Battle:** Heals robot and alien, restoring power-ups during dragon fight
- **Behavior:** Autonomous support character

### Mini-Dragon (Mid Boss)
- **Location:** Dimension 4
- **Purpose:** Practice for final dragon battle
- **Difficulty:** Moderate health, shoots attacks

### Dragon (Final Boss)
- **Location:** Dimension 6
- **Appearance:** Large pixel art dragon with wings
- **Attack Pattern:** Shoots at robot AND alien
- **Damage System:** Attacks remove power-ups from whoever gets hit
- **Challenge:** Must protect both robot and alien while defeating dragon

## Combat & Weapons System

### Weapon Types (15 Total)

1. **Shooters (5 types):** Ranged damage weapons
   - Projectiles travel distance
   - Good for keeping enemies at bay

2. **Hand-to-Hand (5 types):** Melee weapons
   - Must be close to enemy
   - Higher damage but more risk

3. **Summoning (5 types):**召唤系
   - Call creatures/effects to help
   - Strategic options

### Weapon Management
- **Satchel System:** Can carry multiple weapons
- **Active Weapon:** Only one equipped at a time
- **Switching:** Player can switch between collected weapons

### Power-Up System
- **Collection:** Find power-ups throughout dimensions
- **Effect:** More power-ups = stronger attacks
- **Sharing:** Can give power-ups to alien ally
- **Loss:** Dragon attacks remove power-ups
- **Special:** Rare extra life power-up (gives extra life to whoever collects it; can be shared if fast enough)

## Core Mechanics

### Movement
- **Control Scheme:** Arrow keys (version 1)
- **Future:** May add WASD or mouse options
- **Physics:** Smooth movement in all 4 directions

### Combat
- **Player Shooting:** Spacebar fires active weapon
- **Enemy Attacks:** Bosses shoot projectiles
- **Hit Detection:** Collision-based
- **Damage:** Getting hit removes power-ups (not instant death)

### Power-Up Loss & Recovery
- **When Robot Loses All Power-Ups:** Can still move and dodge, but can't attack until collecting more
- **When Alien Loses All Power-Ups:** Gets knocked out; robot must bring power-ups to revive
- **Extra Life:** Rare power-up that provides one additional chance

### Ally Management
- **Alien Combat:** Automatically uses moves based on power-ups shared with it
- **Target Priority:** Focuses on current boss/enemies
- **Protection:** Must be protected from enemy attacks

### Puzzle Mechanics

**Memory Puzzle (Dimension 1):**
- Purpose: Gentle introduction, collect initial items
- Difficulty: Easy to moderate

**Math Puzzle (Dimension 5):**
- Adaptive difficulty: Gets harder as player succeeds
- Challenge level: High (Ezra is excellent at math)
- Gated by: Psychic's door-opening powers

## Visual Design

### Art Style
- **Primary:** Pixel art aesthetic
- **Development Approach:**
  - Start with colored shape placeholders
  - Replace with pixel art assets later
- **Recommended Sources:** itch.io, opengameart.org, kenney.nl

### Color Palette (Placeholders)
- Robot: Blue (#00aaff)
- Alien: Green (#00ff00)
- Dragon: Red (#ff0000)
- Power-ups: Yellow (#ffff00)
- Background: Black space with white stars

## Technical Implementation Notes

### Version 1 (Minimal Viable Product)
Built a simple prototype with:
- Robot movement (arrow keys)
- Basic shooting (spacebar)
- Power-up collection
- Alien boss battle
- Dragon boss battle
- Health bars and scoring

### Full Game Features
To be implemented:
- 6 full dimensions
- All 15 weapon types
- Satchel/inventory system
- Puzzle mechanics (memory, adaptive math)
- Ally AI (alien attacks, psychic heals)
- Power-up sharing system
- Revive mechanic
- Extra life system

## Future Enhancements (Postgame)

**Phase 2 (Future Milestone):**
- Post-game difficulty mode
- Hidden bosses
- Additional rare power-ups
- Extended dimensions
- New mechanics revealed after dragon defeat

**Note:** Postgame content designed but not required for version 1 playability.

## Success Criteria

### Version 1
- ✅ Playable game with basic movement and shooting
- ✅ At least 2 boss battles (alien and dragon)
- ✅ Power-up collection system
- ✅ Visual feedback (health bars, scores)

### Full Version
- Complete all 6 dimensions
- All puzzles functional and challenging
- All 15 weapon types implemented
- Ally system fully working (alien attacks, psychic heals)
- Power-up sharing and revival mechanics
- Balanced difficulty curve
- Engaging for 6.5-year-old player

## Design Philosophy

1. **Progressive Difficulty:** Start easy (puzzles), build to intense (boss battles)
2. **Strategic Depth:** Power-up management, weapon selection, ally coordination
3. **Age-Appropriate Challenge:** Engaging for a smart 6.5-year-old
4. **Cooperative Story:** Turn enemies into friends through gameplay
5. **Replayability:** Multiple weapons and strategies to explore

---

**Status:** Ready for implementation planning
**Next Step:** Create detailed implementation plan with milestones
