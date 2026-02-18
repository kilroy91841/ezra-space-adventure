# Two-Player Co-op Mode Design

**Date:** 2026-02-18
**Feature:** Add second playable character for Ezra and Ronen to play together
**Status:** Approved

## Overview

Add a 2-player cooperative mode where Ezra (Player 1) controls the main character with keyboard, and Ronen (Player 2) controls a companion character that follows Player 1 and shoots with Tab key. Both players share health and lives but have independent weapon selection.

## Requirements Summary

- Player count selection: Choose 1 or 2 players before character selection
- Each player selects their own character
- Player 2 auto-follows Player 1 at 50-100 pixel distance
- Player 2 shoots with Tab key (smart auto-aim toward enemies, or up if no enemies nearby)
- Independent weapons: P1 uses 1-4 keys, P2 uses Q/E/R/T keys
- Shared health and lives pool
- Works in both Adventure and Practice modes

## Architecture: Dual Player Objects Approach

### Core Principle
Create two separate Player instances (player1 and player2). Both are full Player entities with equal capabilities, but Player 2 has AI-controlled movement while Player 1 is user-controlled.

### Game Variables
```javascript
// Replace single player with two player objects
let player1 = null;  // Ezra's character
let player2 = null;  // Ronen's character (only exists in 2-player mode)
let playerCount = 1; // Track whether 1 or 2 players

// Shared resources (unchanged)
let playerHealth = 100;
let playerLives = 4;
let playerProjectiles = []; // Combined projectiles from both players
```

### Player Properties
Each player has:
- Own weapon and inventory
- Own character type (visual appearance)
- Own position and velocity
- Own currentWeaponIndex (for independent weapon switching)
- Shared health/lives (global variables)

## Game Flow Changes

### New Screen Sequence

**Current:**
```
Character Selection → Mode Selection → Game Start
```

**With 2-Player:**
```
Player Count Selection → P1 Character Selection → [P2 Character Selection] → Mode Selection → Game Start
```

### Player Count Selection Screen

**Layout:**
- Two large boxes with visual previews
  - **1 Player box:** Single character silhouette/icon
  - **2 Players box:** Two character silhouettes side-by-side
- Hover effects with yellow border (consistent with current UI)
- Click to select, or press 1/2 keys as shortcuts

### Character Selection Changes

**1-Player Mode:**
- Works exactly as it does now
- Single character selection screen

**2-Player Mode:**
- First screen: "EZRA - CHOOSE YOUR CHARACTER"
  - Shows CHARACTER_LIST, Ezra clicks to select
- Second screen: "RONEN - CHOOSE YOUR CHARACTER"
  - Shows CHARACTER_LIST again, Ronen clicks to select
- Both selections saved to player1 and player2 character types

### Mode Selection
- No changes to UI
- 2-player mode works in BOTH Adventure and Practice modes
- Both players see the selection together

## Input Handling

### Player 1 Controls (Unchanged)
- **Arrow Keys:** Movement
- **WASD:** Shoot in direction (W=up, A=left, S=down, D=right)
- **Spacebar:** Shoot straight up
- **Keys 1-4:** Switch weapons

### Player 2 Controls (New)
- **Movement:** AI-controlled (follows Player 1)
- **Tab Key:** Smart shooting
  - Default: Shoots straight up
  - If enemy within ~200 pixels: Auto-aims toward nearest enemy
- **Q, E, R, T Keys:** Switch weapons
  - Q → Weapon slot 0
  - E → Weapon slot 1
  - R → Weapon slot 2
  - T → Weapon slot 3

### Input Implementation
```javascript
// Player 2 shooting (new)
if (keys['Tab'] && player2) {
    const nearestEnemy = findNearestEnemy(player2, 200);
    if (nearestEnemy) {
        // Calculate angle to enemy
        const angle = Math.atan2(
            nearestEnemy.y - player2.y,
            nearestEnemy.x - player2.x
        );
        // Create angled projectile
        const proj = player2.weapon.shoot();
        proj.vx = Math.cos(angle) * speed;
        proj.vy = Math.sin(angle) * speed;
    } else {
        // Shoot straight up
        const proj = player2.weapon.shoot();
        proj.vy = -speed;
    }
}

// Player 2 weapon switching (new)
if (keys['q']) player2.currentWeaponIndex = 0;
if (keys['e']) player2.currentWeaponIndex = 1;
if (keys['r']) player2.currentWeaponIndex = 2;
if (keys['t']) player2.currentWeaponIndex = 3;
```

## AI Follow System

### Follow Behavior
Player 2 automatically moves to stay close to Player 1, maintaining a comfortable distance.

### Algorithm
```javascript
function updatePlayer2Follow(deltaTime) {
    const targetDistance = 70; // Sweet spot (50-100 pixel range)
    const followSpeed = player1.speed; // Match Player 1's speed

    // Calculate distance to Player 1
    const dx = player1.x - player2.x;
    const dy = player1.y - player2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // If too far, move toward Player 1
    if (distance > targetDistance) {
        const moveX = (dx / distance) * followSpeed;
        const moveY = (dy / distance) * followSpeed;
        player2.setVelocity(moveX, moveY);
    } else {
        // Close enough, match Player 1's velocity
        player2.setVelocity(player1.vx, player1.vy);
    }
}
```

### Characteristics
- Smooth movement - no jerky teleporting
- Maintains 70-pixel distance as optimal range
- Matches Player 1's velocity when close (moves together as a unit)
- Catches up when Player 1 moves away
- Uses same boundary checks as Player 1 (stays on screen)

### Visual Effect
Player 2 appears to "orbit" or "escort" Player 1, staying nearby without overlapping or colliding.

## Smart Shooting System

### Enemy Detection
```javascript
function findNearestEnemy(player, maxDistance) {
    let nearestEnemy = null;
    let shortestDistance = maxDistance;

    const allEnemies = [];

    // Check boss
    if (currentDimension.boss && !currentDimension.boss.defeated && !currentDimension.boss.isAlly) {
        allEnemies.push(currentDimension.boss);
    }

    // Check chasing enemies
    const chasingEnemies = currentDimension.getChasingEnemies ?
        currentDimension.getChasingEnemies() : [];
    allEnemies.push(...chasingEnemies.filter(e => e.active && !e.isAlly));

    // Find closest within range
    for (const enemy of allEnemies) {
        const dist = Math.sqrt(
            Math.pow(enemy.x - player.x, 2) +
            Math.pow(enemy.y - player.y, 2)
        );
        if (dist < shortestDistance) {
            nearestEnemy = enemy;
            shortestDistance = dist;
        }
    }

    return nearestEnemy;
}
```

### Shooting Behavior

**If enemy found within 200 pixels:**
- Calculate angle from Player 2 to enemy center
- Create projectile aimed in that direction
- Uses Player 2's currently selected weapon
- Respects weapon cooldown timers

**If no enemy nearby:**
- Shoot straight up (0, -speed)
- Simple and predictable fallback

### Weapon Integration
- Uses Player 2's current weapon (selected via Q/E/R/T)
- Same damage and projectile properties as Player 1
- Same cooldown system as Player 1
- Projectiles added to shared `playerProjectiles` array

## Collision Detection

### Enemy → Player Collisions

**Shared Invulnerability:**
When either player is hit, brief invulnerability applies to BOTH players to prevent double-damage from the same attack.

```javascript
// Check both players against all enemies
[player1, player2].forEach(player => {
    if (!player) return; // Skip if 1-player mode

    // Enemy projectiles
    enemyProjectiles.forEach(proj => {
        if (proj.collidesWith(player) && invulnerableTimer <= 0 && shieldTimer <= 0) {
            playerHealth -= proj.damage; // Shared health
            invulnerableTimer = 60; // Both players invulnerable briefly
            // Hit effects...
        }
    });

    // Chasing enemies
    chasingEnemies.forEach(enemy => {
        if (enemy.collidesWith(player) && invulnerableTimer <= 0) {
            playerHealth -= 15;
            invulnerableTimer = 60;
        }
    });

    // Boss collision
    if (currentDimension.boss && currentDimension.boss.collidesWith(player)) {
        playerHealth -= 20;
        invulnerableTimer = 60;
    }
});
```

### Player Projectiles → Enemy Collisions

No changes needed - both players' projectiles are in the same `playerProjectiles` array and use existing collision logic.

### Power-up Collection

Either player can collect power-ups:
```javascript
[player1, player2].forEach(player => {
    if (!player) return;

    powerups.forEach(powerup => {
        if (powerup.collidesWith(player)) {
            // Apply effect to shared resources
            // Same as single-player behavior
        }
    });
});
```

### Hazard Interactions

Stage hazards (lava, trampolines, ice) affect both players:
```javascript
[player1, player2].forEach(player => {
    if (!player) return;

    hazards.forEach(hazard => {
        if (hazard.collidesWith(player)) {
            // Apply hazard effect
        }
    });
});
```

## UI & Rendering

### Player Rendering
```javascript
// Main game loop rendering
player1.render(ctx);
if (player2) {
    player2.render(ctx);
}
```

### Weapon Selector Display

**Current (1-player):**
```
WEAPONS: [1] [2] [3] [4]
```

**With 2-player:**
```
EZRA:  [1] [2] [3] [4]
RONEN: [Q] [E] [R] [T]
```

- Each section shows 4 weapon boxes
- Currently selected weapon highlighted with yellow border
- Position: Left side of screen for P1, right side or below for P2

### Health & Lives Display

No changes needed:
- Single health bar (top left) - represents shared health
- Heart icons below - show shared lives count
- Both players draw from same pool

### Projectile Rendering

- All projectiles in single `playerProjectiles` array
- No visual distinction between P1 and P2 shots (same team)
- Optional: Could add subtle color tint if desired

### Character Name Labels (Optional)

Small text labels above each character:
- "EZRA" above Player 1 (in their character color)
- "RONEN" above Player 2 (in their character color)
- Helps distinguish players, especially with different character types

### Screen Boundaries

Both players share same boundary constraints - neither can move off screen edges.

## Implementation Notes

### Player Creation
```javascript
// In character selection
if (playerCount === 1) {
    player1 = new Player(centerX, centerY, selectedCharacter1);
    player2 = null;
} else {
    player1 = new Player(centerX, centerY, selectedCharacter1);
    player2 = new Player(centerX + 60, centerY + 30, selectedCharacter2);
}
```

### Game Loop Integration
```javascript
// Update phase
player1.update(deltaTime);
if (player2) {
    updatePlayer2Follow(deltaTime);
    player2.update(deltaTime);
}

// Render phase
player1.render(ctx);
if (player2) {
    player2.render(ctx);
}
```

### Mode Compatibility

**Adventure Mode:**
- Full 2-player support
- Both players progress through dimensions together
- Shared completion of objectives

**Practice Mode:**
- Full 2-player support
- Both players can practice with all weapons
- Useful for Ronen to learn controls with Ezra

## Testing Considerations

### Key Scenarios to Test

1. **Player count selection:** Clicking and keyboard shortcuts
2. **Character selection:** Both players picking same vs different characters
3. **Follow behavior:** Player 2 staying close, catching up, matching velocity
4. **Smart shooting:** Auto-aim at various distances, fallback to up-shooting
5. **Weapon switching:** Independent weapon selection for both players
6. **Collision detection:** Either player triggering damage, shared invulnerability
7. **Power-up collection:** Either player collecting, effects applying correctly
8. **Boss fights:** Both players damaging boss, boss attacks hitting either player
9. **Dimension transitions:** Both players moving to next dimension together
10. **Practice mode:** Both players able to use practice features

### Edge Cases

- Player 2 getting stuck at screen boundaries while following
- Both players collecting same power-up simultaneously
- Smart shooting when multiple enemies at same distance
- Weapon switching during cooldown periods
- Dimension completion with both players alive

## Success Criteria

- [x] Design approved by Ezra's dad
- [ ] Player count selection screen functional
- [ ] Both players can select different characters
- [ ] Player 2 follows Player 1 smoothly at ~70 pixel distance
- [ ] Tab key shoots with smart auto-aim (or up if no enemies)
- [ ] Q/E/R/T switch Player 2's weapons independently
- [ ] Both players share health and lives pool
- [ ] Collision detection works for both players
- [ ] Works in both Adventure and Practice modes
- [ ] UI clearly shows both players' weapons and states
- [ ] Ronen (younger player) finds it easy and fun to use

## Future Enhancements (Out of Scope)

- Player revival system if one player "dies" first
- 3+ player support
- Split-screen mode
- Player 2 AI difficulty settings
- Cooperative combo attacks
- Per-player score tracking
