# Two-Player Co-op Mode Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add 2-player cooperative mode where Ronen (Player 2) follows Ezra (Player 1) and shoots with Tab key

**Architecture:** Dual Player Objects approach - create player1 and player2 as separate Player instances. Player 2 has AI-controlled movement that follows Player 1. Both share health/lives but have independent weapons.

**Tech Stack:** HTML5 Canvas, Vanilla JavaScript, ES6 Modules

---

## Phase 1: Core Infrastructure & Player Count Selection

### Task 1: Add Player Count Selection Screen Variables

**Files:**
- Modify: `game.html` (around line 105-115, game state variables)

**Step 1: Add new game state variables**

Locate the game state variables section (after line 105) and add:

```javascript
// Player count selection
let playerCountSelected = false;
let playerCount = 1; // 1 or 2
let hoveredPlayerCount = null; // '1player' or '2player'

// Character selection (modify existing)
let characterSelected = false;
let player1CharacterSelected = false; // New: track P1 selection
let player2CharacterSelected = false; // New: track P2 selection
let selectedCharacter1 = null; // Rename from selectedCharacter
let selectedCharacter2 = null; // New: for player 2
let hoveredCharacterIndex = -1;
```

**Step 2: Refactor player variable**

Find `const player = new Player(...)` declaration (around line 125) and change to:

```javascript
// Players (was single 'player')
let player1 = null;
let player2 = null;
```

**Step 3: Add weapon index tracking**

Add after player variables:

```javascript
// Weapon indices for independent selection
let player1WeaponIndex = 0;
let player2WeaponIndex = 0;
```

**Step 4: Test compilation**

Run: Open game.html in browser
Expected: Game loads without errors (may not work fully yet)

**Step 5: Commit**

```bash
git add game.html
git commit -m "feat: add player count variables and refactor player to player1/player2"
```

---

### Task 2: Create Player Count Selection Screen UI

**Files:**
- Modify: `game.html` (mouse move handler, click handler, render loop)

**Step 1: Add mouse move handler for player count screen**

Find the mouse move event listener (around line 155), add BEFORE character selection check:

```javascript
// Player count selection hover (add before character selection)
if (!playerCountSelected) {
    const onePlayerBtn = { x: canvas.width / 2 - 350, y: 300, width: 300, height: 150 };
    const twoPlayerBtn = { x: canvas.width / 2 + 50, y: 300, width: 300, height: 150 };

    if (mx >= onePlayerBtn.x && mx <= onePlayerBtn.x + onePlayerBtn.width &&
        my >= onePlayerBtn.y && my <= onePlayerBtn.y + onePlayerBtn.height) {
        hoveredPlayerCount = '1player';
    } else if (mx >= twoPlayerBtn.x && mx <= twoPlayerBtn.x + twoPlayerBtn.width &&
               my >= twoPlayerBtn.y && my <= twoPlayerBtn.y + twoPlayerBtn.height) {
        hoveredPlayerCount = '2player';
    } else {
        hoveredPlayerCount = null;
    }
    canvas.style.cursor = hoveredPlayerCount ? 'pointer' : 'default';
    return;
}
```

**Step 2: Add click handler for player count screen**

Find the click event listener (around line 220), add BEFORE character selection check:

```javascript
// Player count selection click (add before character selection)
if (!playerCountSelected) {
    const onePlayerBtn = { x: canvas.width / 2 - 350, y: 300, width: 300, height: 150 };
    const twoPlayerBtn = { x: canvas.width / 2 + 50, y: 300, width: 300, height: 150 };

    const clickX = e.offsetX * (canvas.width / canvas.offsetWidth);
    const clickY = e.offsetY * (canvas.height / canvas.offsetHeight);

    if (clickX >= onePlayerBtn.x && clickX <= onePlayerBtn.x + onePlayerBtn.width &&
        clickY >= onePlayerBtn.y && clickY <= onePlayerBtn.y + onePlayerBtn.height) {
        playerCount = 1;
        playerCountSelected = true;
    } else if (clickX >= twoPlayerBtn.x && clickX <= twoPlayerBtn.x + twoPlayerBtn.width &&
               clickY >= twoPlayerBtn.y && clickY <= twoPlayerBtn.y + twoPlayerBtn.height) {
        playerCount = 2;
        playerCountSelected = true;
    }
    return;
}
```

**Step 3: Add keyboard shortcuts for player count**

Find the keydown event listener (around line 297), add AFTER debug mode checks:

```javascript
// Player count selection shortcuts
if (!playerCountSelected && !characterSelected) {
    if (e.key === '1') {
        playerCount = 1;
        playerCountSelected = true;
        return;
    } else if (e.key === '2') {
        playerCount = 2;
        playerCountSelected = true;
        return;
    }
}
```

**Step 4: Add rendering for player count screen**

Find the game loop function (around line 400), add BEFORE character selection rendering:

```javascript
// Player count selection screen (add before character selection)
if (!playerCountSelected) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw stars
    stars.forEach(star => {
        ctx.fillStyle = '#fff';
        ctx.fillRect(star.x, star.y, star.size, star.size);
    });

    // Title
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 48px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText("HOW MANY PLAYERS?", canvas.width / 2, 150);

    // 1 Player button
    const onePlayerBtn = { x: canvas.width / 2 - 350, y: 300, width: 300, height: 150 };
    const oneHovered = hoveredPlayerCount === '1player';
    ctx.fillStyle = oneHovered ? '#0088ff' : '#0066cc';
    ctx.fillRect(onePlayerBtn.x, onePlayerBtn.y, onePlayerBtn.width, onePlayerBtn.height);
    ctx.strokeStyle = oneHovered ? '#ffff00' : '#fff';
    ctx.lineWidth = oneHovered ? 4 : 2;
    ctx.strokeRect(onePlayerBtn.x, onePlayerBtn.y, onePlayerBtn.width, onePlayerBtn.height);

    // 1 Player icon (single silhouette)
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(onePlayerBtn.x + 150, onePlayerBtn.y + 60, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(onePlayerBtn.x + 130, onePlayerBtn.y + 85, 40, 50);

    ctx.fillStyle = '#000';
    ctx.font = 'bold 28px Courier New';
    ctx.fillText('1 PLAYER', onePlayerBtn.x + onePlayerBtn.width / 2, onePlayerBtn.y + onePlayerBtn.height - 20);

    // 2 Players button
    const twoPlayerBtn = { x: canvas.width / 2 + 50, y: 300, width: 300, height: 150 };
    const twoHovered = hoveredPlayerCount === '2player';
    ctx.fillStyle = twoHovered ? '#00aa00' : '#008800';
    ctx.fillRect(twoPlayerBtn.x, twoPlayerBtn.y, twoPlayerBtn.width, twoPlayerBtn.height);
    ctx.strokeStyle = twoHovered ? '#ffff00' : '#fff';
    ctx.lineWidth = twoHovered ? 4 : 2;
    ctx.strokeRect(twoPlayerBtn.x, twoPlayerBtn.y, twoPlayerBtn.width, twoPlayerBtn.height);

    // 2 Players icons (two silhouettes)
    ctx.fillStyle = '#fff';
    // Player 1 silhouette
    ctx.beginPath();
    ctx.arc(twoPlayerBtn.x + 110, twoPlayerBtn.y + 60, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(twoPlayerBtn.x + 92, twoPlayerBtn.y + 82, 36, 45);
    // Player 2 silhouette
    ctx.beginPath();
    ctx.arc(twoPlayerBtn.x + 190, twoPlayerBtn.y + 60, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(twoPlayerBtn.x + 172, twoPlayerBtn.y + 82, 36, 45);

    ctx.fillStyle = '#000';
    ctx.font = 'bold 28px Courier New';
    ctx.fillText('2 PLAYERS', twoPlayerBtn.x + twoPlayerBtn.width / 2, twoPlayerBtn.y + twoPlayerBtn.height - 20);

    // Instructions
    ctx.fillStyle = '#fff';
    ctx.font = '18px Courier New';
    ctx.fillText('Press 1 or 2, or click to choose', canvas.width / 2, 500);

    requestAnimationFrame(gameLoop);
    return;
}
```

**Step 5: Test player count screen**

Run: Open game.html in browser
Expected:
- See "HOW MANY PLAYERS?" screen
- Hover shows yellow border
- Click or press 1/2 advances to character selection
- Console shows no errors

**Step 6: Commit**

```bash
git add game.html
git commit -m "feat: add player count selection screen with 1 or 2 player options"
```

---

### Task 3: Update Character Selection for 2-Player Mode

**Files:**
- Modify: `game.html` (character selection rendering and logic)

**Step 1: Update character selection condition**

Find the character selection rendering (around line 410), change the condition from:

```javascript
if (!characterSelected) {
```

to:

```javascript
if (playerCountSelected && !characterSelected) {
```

**Step 2: Add player-specific titles**

Inside the character selection rendering, find the title text (around line 420) and replace:

```javascript
// OLD:
ctx.fillText("CHOOSE YOUR CHARACTER", canvas.width / 2, 100);

// NEW:
if (playerCount === 1 || !player1CharacterSelected) {
    ctx.fillText("EZRA - CHOOSE YOUR CHARACTER", canvas.width / 2, 100);
} else if (!player2CharacterSelected) {
    ctx.fillText("RONEN - CHOOSE YOUR CHARACTER", canvas.width / 2, 100);
}
```

**Step 3: Update character selection click handler**

Find the character selection click logic (around line 236) and replace:

```javascript
// OLD:
selectedCharacter = char;
characterSelected = true;

// NEW:
if (playerCount === 1) {
    selectedCharacter1 = char;
    player1CharacterSelected = true;
    characterSelected = true; // Done after 1 selection
} else if (!player1CharacterSelected) {
    selectedCharacter1 = char;
    player1CharacterSelected = true;
    // Don't set characterSelected yet - need P2
} else if (!player2CharacterSelected) {
    selectedCharacter2 = char;
    player2CharacterSelected = true;
    characterSelected = true; // Done after both selected
}
```

**Step 4: Test character selection**

Run: Open game.html in browser
Expected:
- 1-player mode: Works as before
- 2-player mode: Shows "EZRA" screen, then "RONEN" screen
- Both selections saved correctly

**Step 5: Commit**

```bash
git add game.html
git commit -m "feat: add separate character selection for Player 2 in 2-player mode"
```

---

### Task 4: Create Player Instances Based on Player Count

**Files:**
- Modify: `game.html` (after mode selection, player initialization)

**Step 1: Find mode selection click handler**

Locate where `gameModeSelected` is set to true (around line 250), in both Adventure and Practice button handlers.

**Step 2: Update Adventure mode player initialization**

Find the Adventure mode button click (around line 185), replace player initialization:

```javascript
// OLD:
gameModeSelected = true;
isPracticeMode = false;

// NEW:
gameModeSelected = true;
isPracticeMode = false;

// Create players based on count
const centerX = (CANVAS_WIDTH - 40) / 2;
const centerY = (CANVAS_HEIGHT - 50) / 2;

player1 = new Player(centerX, centerY, selectedCharacter1);
player1.weapon = new IceShooter();
player1.inventory = [
    new IceShooter(),
    new FireShooter(),
    new GiantSword(),
    new BigBomb()
];

if (playerCount === 2) {
    player2 = new Player(centerX + 60, centerY + 30, selectedCharacter2);
    player2.weapon = new IceShooter();
    player2.inventory = [
        new IceShooter(),
        new FireShooter(),
        new GiantSword(),
        new BigBomb()
    ];
}
```

**Step 3: Update Practice mode player initialization**

Find the Practice mode button click (around line 260), add similar player creation:

```javascript
// OLD:
gameModeSelected = true;
isPracticeMode = true;
gameStarted = true;

player.weapon = new IceShooter();
player.inventory = [/*...*/];

// NEW:
gameModeSelected = true;
isPracticeMode = true;
gameStarted = true;

// Create players based on count
const centerX = (CANVAS_WIDTH - 40) / 2;
const centerY = (CANVAS_HEIGHT - 50) / 2;

player1 = new Player(centerX, centerY, selectedCharacter1);
player1.weapon = new IceShooter();
player1.inventory = [
    new IceShooter(),
    new FireShooter(),
    new GiantSword(),
    new BigBomb()
];

if (playerCount === 2) {
    player2 = new Player(centerX + 60, centerY + 30, selectedCharacter2);
    player2.weapon = new IceShooter();
    player2.inventory = [
        new IceShooter(),
        new FireShooter(),
        new GiantSword(),
        new BigBomb()
    ];
}
```

**Step 4: Update all player references in game loop**

Find references to `player.` in the game loop and update to `player1.`:
- `player.setVelocity` → `player1.setVelocity`
- `player.update` → `player1.update`
- `player.x`, `player.y` → `player1.x`, `player1.y`
- etc.

This is a find-and-replace operation. Make sure to exclude practice museum checks.

**Step 5: Test player creation**

Run: Open game.html in browser
Expected:
- 1-player mode: Creates player1 only
- 2-player mode: Creates both player1 and player2
- Both players have weapons and inventory
- Game loads without errors

**Step 6: Commit**

```bash
git add game.html
git commit -m "feat: create player1 and player2 instances based on player count"
```

---

## Phase 2: Player 2 Movement (AI Follow)

### Task 5: Implement AI Follow System

**Files:**
- Modify: `game.html` (add follow function, update game loop)

**Step 1: Add findNearestEnemy helper function**

Add before the game loop function (around line 140):

```javascript
// Find nearest enemy to a player (for Player 2 smart shooting)
function findNearestEnemy(player, maxDistance) {
    let nearestEnemy = null;
    let shortestDistance = maxDistance;

    const allEnemies = [];

    // Check boss
    if (currentDimension && currentDimension.boss &&
        !currentDimension.boss.defeated && !currentDimension.boss.isAlly) {
        allEnemies.push(currentDimension.boss);
    }

    // Check chasing enemies
    if (currentDimension && currentDimension.getChasingEnemies) {
        const chasingEnemies = currentDimension.getChasingEnemies();
        allEnemies.push(...chasingEnemies.filter(e => e && e.active && !e.isAlly));
    }

    // Find closest within range
    for (const enemy of allEnemies) {
        const dist = Math.sqrt(
            Math.pow(enemy.x + enemy.width/2 - (player.x + player.width/2), 2) +
            Math.pow(enemy.y + enemy.height/2 - (player.y + player.height/2), 2)
        );
        if (dist < shortestDistance) {
            nearestEnemy = enemy;
            shortestDistance = dist;
        }
    }

    return nearestEnemy;
}
```

**Step 2: Add Player 2 follow function**

Add after findNearestEnemy:

```javascript
// Update Player 2 AI follow behavior
function updatePlayer2Follow(deltaTime) {
    if (!player2 || !player1) return;

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

**Step 3: Call follow function in game loop**

Find where `player1.update(deltaTime)` is called (around line 580), add after it:

```javascript
player1.update(deltaTime);

// Update Player 2 follow behavior
if (player2) {
    updatePlayer2Follow(deltaTime);
    player2.update(deltaTime);
}
```

**Step 4: Test follow behavior**

Run: Open game.html in browser with 2-player mode
Expected:
- Player 2 spawns near Player 1
- Player 2 follows Player 1 as they move
- Maintains ~70 pixel distance
- Moves smoothly without jerking

**Step 5: Commit**

```bash
git add game.html
git commit -m "feat: add AI follow system for Player 2"
```

---

## Phase 3: Player 2 Shooting

### Task 6: Add Tab Key Shooting for Player 2

**Files:**
- Modify: `game.html` (keydown handler, shooting logic)

**Step 1: Add Tab key detection**

Find the shooting input section (around line 589-620), add AFTER Player 1 shooting logic:

```javascript
// PLAYER 2 SHOOTING (Tab key with smart auto-aim)
if (keys['Tab'] && player2 && gameStarted && !isPracticeMode) {
    shouldShoot = true; // Use existing shouldShoot flag

    // Smart auto-aim
    const nearestEnemy = findNearestEnemy(player2, 200);

    if (nearestEnemy) {
        // Aim toward nearest enemy
        const dx = (nearestEnemy.x + nearestEnemy.width/2) - (player2.x + player2.width/2);
        const dy = (nearestEnemy.y + nearestEnemy.height/2) - (player2.y + player2.height/2);
        const distance = Math.sqrt(dx * dx + dy * dy);

        shootDirX = dx / distance;
        shootDirY = dy / distance;
    } else {
        // No enemy nearby, shoot straight up
        shootDirX = 0;
        shootDirY = -1;
    }
}
```

**Step 2: Update shooting execution for Player 2**

Find where projectiles are created from shooting (around line 630), update to handle both players:

```javascript
// Shooting for Player 1
if (shouldShoot && player1.weapon) {
    const newProjectiles = player1.weapon.shoot(
        player1.x + player1.width / 2 - 4,
        player1.y,
        shootDirX,
        shootDirY
    );

    if (newProjectiles && newProjectiles.length > 0) {
        playerProjectiles.push(...newProjectiles);
    }
}

// Shooting for Player 2 (if exists)
if (keys['Tab'] && player2 && player2.weapon) {
    const nearestEnemy = findNearestEnemy(player2, 200);
    let p2ShootDirX = 0;
    let p2ShootDirY = -1;

    if (nearestEnemy) {
        const dx = (nearestEnemy.x + nearestEnemy.width/2) - (player2.x + player2.width/2);
        const dy = (nearestEnemy.y + nearestEnemy.height/2) - (player2.y + player2.height/2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        p2ShootDirX = dx / distance;
        p2ShootDirY = dy / distance;
    }

    const newProjectiles = player2.weapon.shoot(
        player2.x + player2.width / 2 - 4,
        player2.y,
        p2ShootDirX,
        p2ShootDirY
    );

    if (newProjectiles && newProjectiles.length > 0) {
        playerProjectiles.push(...newProjectiles);
    }
}
```

**Step 3: Prevent Tab from switching focus**

Add to the keydown handler at the very beginning:

```javascript
window.addEventListener('keydown', (e) => {
    // Prevent Tab from changing browser focus
    if (e.key === 'Tab') {
        e.preventDefault();
    }

    // ... rest of handler
});
```

**Step 4: Test Player 2 shooting**

Run: Open game.html in browser with 2-player mode
Expected:
- Tab key shoots from Player 2
- When enemy nearby, shoots toward enemy
- When no enemy, shoots straight up
- Respects weapon cooldowns

**Step 5: Commit**

```bash
git add game.html
git commit -m "feat: add Tab key shooting for Player 2 with smart auto-aim"
```

---

## Phase 4: Independent Weapon Switching

### Task 7: Add Q/E/R/T Weapon Switching for Player 2

**Files:**
- Modify: `game.html` (keydown handler, weapon switching logic)

**Step 1: Add Player 2 weapon switching**

Find the weapon switching section (around line 359), add AFTER Player 1 weapon switching:

```javascript
// Player 2 weapon switching (Q/E/R/T)
if (player2 && (!currentDimension || !currentDimension.handleKeyPress)) {
    if (e.key === 'q' || e.key === 'Q') {
        player2WeaponIndex = 0;
        if (player2.inventory.length > 0) {
            player2.weapon = player2.inventory[0];
        }
    } else if (e.key === 'e' || e.key === 'E') {
        player2WeaponIndex = 1;
        if (player2.inventory.length > 1) {
            player2.weapon = player2.inventory[1];
        }
    } else if (e.key === 'r' || e.key === 'R') {
        player2WeaponIndex = 2;
        if (player2.inventory.length > 2) {
            player2.weapon = player2.inventory[2];
        }
    } else if (e.key === 't' || e.key === 'T') {
        player2WeaponIndex = 3;
        if (player2.inventory.length > 3) {
            player2.weapon = player2.inventory[3];
        }
    }
}
```

**Step 2: Update Player 1 weapon switching to use player1WeaponIndex**

Find Player 1 weapon switching (keys 1-4), update to use `player1WeaponIndex`:

```javascript
// Player 1 weapon switching (1-4)
if (!currentDimension || !currentDimension.handleKeyPress) {
    if (e.key >= '1' && e.key <= '4') {
        const index = parseInt(e.key) - 1;
        if (index < player1.inventory.length) {
            player1WeaponIndex = index;
            player1.weapon = player1.inventory[player1WeaponIndex];
        }
    }
}
```

**Step 3: Test weapon switching**

Run: Open game.html in browser with 2-player mode
Expected:
- Keys 1-4 switch Player 1 weapons
- Keys Q/E/R/T switch Player 2 weapons
- Each player can select different weapons
- Weapon changes reflected in shooting

**Step 4: Commit**

```bash
git add game.html
git commit -m "feat: add independent weapon switching for Player 2 with Q/E/R/T keys"
```

---

## Phase 5: Collision Detection Updates

### Task 8: Update Enemy Collisions for Both Players

**Files:**
- Modify: `game.html` (collision detection sections)

**Step 1: Update enemy projectile collisions**

Find enemy projectile collision detection (around line 740), wrap in loop:

```javascript
// Enemy projectiles vs players (check both)
const enemyProjectiles = currentDimension.getEnemyProjectiles ?
    currentDimension.getEnemyProjectiles() : [];

[player1, player2].forEach(player => {
    if (!player) return; // Skip if player doesn't exist

    enemyProjectiles.forEach(proj => {
        if (proj.active && proj.collidesWith(player) && invulnerableTimer <= 0 && shieldTimer <= 0) {
            player.removePowerup();
            playerHealth -= proj.damage; // Shared health
            invulnerableTimer = 60; // Shared invulnerability
            particles.push(...createHitEffect(
                player.x + player.width / 2,
                player.y + player.height / 2,
                proj.color
            ));
            proj.destroy();

            if (playerHealth <= 0) {
                playerLives--;
                if (playerLives <= 0) {
                    location.reload();
                } else {
                    playerHealth = MAX_HEALTH;
                    invulnerableTimer = 120;
                    // Reset both players to center
                    const centerX = (CANVAS_WIDTH - 40) / 2;
                    const centerY = (CANVAS_HEIGHT - 50) / 2;
                    player1.x = centerX;
                    player1.y = centerY;
                    if (player2) {
                        player2.x = centerX + 60;
                        player2.y = centerY + 30;
                    }
                }
            }
        }
    });
});
```

**Step 2: Update chasing enemy collisions**

Find chasing enemy collision (around line 780), wrap in loop:

```javascript
// Chasing enemies vs players (check both)
const chasingEnemies = currentDimension.getChasingEnemies ?
    currentDimension.getChasingEnemies() : [];

[player1, player2].forEach(player => {
    if (!player) return;

    chasingEnemies.forEach(alien => {
        if (alien && alien.collidesWith(player) && invulnerableTimer <= 0) {
            player.removePowerup();
            playerHealth -= 15; // Shared health
            invulnerableTimer = 60; // Shared invulnerability

            if (playerHealth <= 0) {
                playerLives--;
                if (playerLives <= 0) {
                    location.reload();
                } else {
                    playerHealth = MAX_HEALTH;
                    invulnerableTimer = 120;
                    const centerX = (CANVAS_WIDTH - 40) / 2;
                    const centerY = (CANVAS_HEIGHT - 50) / 2;
                    player1.x = centerX;
                    player1.y = centerY;
                    if (player2) {
                        player2.x = centerX + 60;
                        player2.y = centerY + 30;
                    }
                }
            } else {
                // Knockback
                const dx = player.x - alien.x;
                const dy = player.y - alien.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance > 0) {
                    player.x += (dx / distance) * 20;
                    player.y += (dy / distance) * 20;
                }
            }
        }
    });
});
```

**Step 3: Update boss collision**

Find boss collision check (around line 670 for boss damage), already handles single player. Update to check both:

Actually, boss collision with PLAYER should also be wrapped. Find where boss attacks player (if it exists as direct collision, not just projectiles).

**Step 4: Test collision detection**

Run: Open game.html in browser with 2-player mode
Expected:
- Either player getting hit reduces shared health
- Invulnerability applies to both players
- Both players reset on death
- Game over when lives reach 0

**Step 5: Commit**

```bash
git add game.html
git commit -m "feat: update enemy collision detection for both players"
```

---

### Task 9: Update Power-up and Hazard Collection

**Files:**
- Modify: `game.html` (power-up and hazard collision)

**Step 1: Update power-up collection**

Find power-up collision (around line 860), wrap in player loop:

```javascript
// Power-up collection (either player can collect)
[player1, player2].forEach(player => {
    if (!player) return;

    powerups.forEach(powerup => {
        if (powerup.active && powerup.collidesWith(player)) {
            powerup.collect();

            // Handle special power-ups
            if (powerup.type === 'speed') {
                speedBoostTimer = powerup.duration;
                player1.speed = BOOSTED_SPEED;
                if (player2) player2.speed = BOOSTED_SPEED;
            } else if (powerup.type === 'life') {
                playerLives++;
            } else if (powerup.type === 'shield') {
                shieldTimer = powerup.duration;
            } else if (powerup.type === 'health') {
                playerHealth = Math.min(MAX_HEALTH, playerHealth + powerup.healAmount);
            } else {
                // Regular power-up
                player.addPowerup();
                engine.state.score += 100;
            }

            particles.push(...createSparkle(
                powerup.x + powerup.width / 2,
                powerup.y + powerup.height / 2
            ));

            // Track collection for dimensions
            if (currentDimension.collectPowerup) {
                currentDimension.collectPowerup();
            }
        }
    });
});
```

**Step 2: Update hazard interactions**

Find hazard collision (around line 884), wrap in player loop:

```javascript
// Hazard interactions (affect either player)
[player1, player2].forEach(player => {
    if (!player) return;

    hazards.forEach(hazard => {
        if (hazard.collidesWith(player)) {
            if (hazard.type === 'lava' && invulnerableTimer <= 0 && shieldTimer <= 0) {
                playerHealth -= hazard.damage;
                invulnerableTimer = 30;
                particles.push(...createHitEffect(
                    player.x + player.width / 2,
                    player.y + player.height / 2,
                    '#ff4400'
                ));
            } else if (hazard.type === 'trampoline' && player.vy >= 0) {
                bounceVelocityY = -hazard.bounceForce;
                hazard.bounce();
                particles.push(...createSparkle(
                    hazard.x + hazard.width / 2,
                    hazard.y
                ));
            } else if (hazard.type === 'ice') {
                player.vx *= hazard.slipperiness;
                player.vy *= hazard.slipperiness;
            }
        }
    });
});
```

**Step 3: Test power-up and hazard interactions**

Run: Open game.html in browser with 2-player mode
Expected:
- Either player can collect power-ups
- Effects apply to shared resources (health, lives, shield)
- Speed boost affects both players
- Hazards affect either player correctly

**Step 4: Commit**

```bash
git add game.html
git commit -m "feat: update power-up and hazard collection for both players"
```

---

## Phase 6: UI Updates

### Task 10: Render Both Players

**Files:**
- Modify: `game.html` (rendering section)

**Step 1: Update player rendering**

Find where player is rendered (around line 960), update to:

```javascript
// Render players
player1.render(ctx);
if (player2) {
    player2.render(ctx);
}
```

**Step 2: Add player name labels**

Add after player rendering:

```javascript
// Player name labels
ctx.font = 'bold 14px Courier New';
ctx.textAlign = 'center';

ctx.fillStyle = player1.color;
ctx.fillText('EZRA', player1.x + player1.width / 2, player1.y - 5);

if (player2) {
    ctx.fillStyle = player2.color;
    ctx.fillText('RONEN', player2.x + player2.width / 2, player2.y - 5);
}

ctx.textAlign = 'left'; // Reset
```

**Step 3: Test player rendering**

Run: Open game.html in browser with 2-player mode
Expected:
- Both players visible
- Names appear above each player
- Names use player colors

**Step 4: Commit**

```bash
git add game.html
git commit -m "feat: render both players with name labels"
```

---

### Task 11: Update Weapon Selector UI

**Files:**
- Modify: `game.html` (weapon selector rendering)

**Step 1: Update weapon selector layout**

Find weapon selector rendering (around line 980), update to:

```javascript
// WEAPON SELECTOR - Player 1
ctx.fillStyle = '#fff';
ctx.font = 'bold 16px Courier New';
ctx.fillText('EZRA:', 10, 95);

const weaponBoxSize = 70;
const weaponBoxY = 105;
player1.inventory.forEach((weapon, index) => {
    const x = 10 + index * (weaponBoxSize + 10);
    const isSelected = player1WeaponIndex === index;

    ctx.fillStyle = isSelected ? '#ffff00' : '#333';
    ctx.fillRect(x, weaponBoxY, weaponBoxSize, weaponBoxSize);

    ctx.strokeStyle = isSelected ? '#ff00ff' : '#666';
    ctx.lineWidth = isSelected ? 4 : 2;
    ctx.strokeRect(x, weaponBoxY, weaponBoxSize, weaponBoxSize);

    // Weapon icon
    ctx.fillStyle = weapon.color || '#fff';
    ctx.font = 'bold 40px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText(weapon.emoji || '?', x + weaponBoxSize / 2, weaponBoxY + 50);

    // Key label
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Courier New';
    ctx.fillText((index + 1).toString(), x + weaponBoxSize / 2, weaponBoxY + weaponBoxSize - 5);
});

// WEAPON SELECTOR - Player 2 (if exists)
if (player2) {
    const p2LabelY = 200; // Below player 1 weapons
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Courier New';
    ctx.textAlign = 'left';
    ctx.fillText('RONEN:', 10, p2LabelY);

    const p2WeaponBoxY = p2LabelY + 10;
    const keyLabels = ['Q', 'E', 'R', 'T'];

    player2.inventory.forEach((weapon, index) => {
        const x = 10 + index * (weaponBoxSize + 10);
        const isSelected = player2WeaponIndex === index;

        ctx.fillStyle = isSelected ? '#ffff00' : '#333';
        ctx.fillRect(x, p2WeaponBoxY, weaponBoxSize, weaponBoxSize);

        ctx.strokeStyle = isSelected ? '#ff00ff' : '#666';
        ctx.lineWidth = isSelected ? 4 : 2;
        ctx.strokeRect(x, p2WeaponBoxY, weaponBoxSize, weaponBoxSize);

        // Weapon icon
        ctx.fillStyle = weapon.color || '#fff';
        ctx.font = 'bold 40px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText(weapon.emoji || '?', x + weaponBoxSize / 2, p2WeaponBoxY + 50);

        // Key label
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Courier New';
        ctx.fillText(keyLabels[index], x + weaponBoxSize / 2, p2WeaponBoxY + weaponBoxSize - 5);
    });

    ctx.textAlign = 'left'; // Reset
}
```

**Step 2: Test weapon selector UI**

Run: Open game.html in browser with 2-player mode
Expected:
- Player 1 weapons at top ("EZRA:")
- Player 2 weapons below ("RONEN:")
- Selected weapon highlighted for each player
- Correct key labels (1-4 and Q/E/R/T)

**Step 3: Commit**

```bash
git add game.html
git commit -m "feat: add separate weapon selector UI for Player 2"
```

---

## Phase 7: Testing & Polish

### Task 12: Test All Game Modes

**Files:**
- Test: Manual playtesting

**Step 1: Test 1-player mode**

Run: Open game.html, select 1 player
Expected:
- Works exactly as before
- No Player 2 visible
- No errors in console

**Step 2: Test 2-player Adventure mode**

Run: Open game.html, select 2 players, choose Adventure
Test checklist:
- [ ] Player 2 follows Player 1
- [ ] Tab shoots (auto-aims when enemy nearby)
- [ ] Q/E/R/T switches Player 2 weapons
- [ ] Shared health/lives work correctly
- [ ] Both players can collect power-ups
- [ ] Both players affected by hazards
- [ ] Boss fights work with both players
- [ ] Dimension transitions work

**Step 3: Test 2-player Practice mode**

Run: Open game.html, select 2 players, choose Practice
Test checklist:
- [ ] Both players in practice museum
- [ ] Player 2 can shoot at practice targets
- [ ] Weapon switching works for both
- [ ] No errors with boss spawning

**Step 4: Test edge cases**

Test:
- Both players on same power-up (should only collect once)
- Player 2 at screen edge while following
- Weapon switching during cooldown
- Tab shooting with no enemies vs with enemies
- Both players damaged simultaneously

**Step 5: Document any issues**

Create list of any bugs found, then fix them.

**Step 6: Commit**

```bash
git add game.html index.html
git commit -m "test: verify 2-player mode in all game modes and fix edge cases"
```

---

### Task 13: Final Polish and Deploy

**Files:**
- Modify: `game.html`, `index.html`

**Step 1: Add helpful instructions**

Find the controls display (around line 1020), update to include 2-player controls:

```javascript
// Controls display
ctx.fillStyle = '#fff';
ctx.font = '16px Courier New';
let controlsY = 550;

if (!player2) {
    ctx.fillText('Arrow Keys = Move | Space = Shoot | 1-4 = Switch Weapons', canvas.width / 2, controlsY);
} else {
    ctx.font = '14px Courier New';
    ctx.fillText('P1: Arrow Keys = Move | Space/WASD = Shoot | 1-4 = Weapons', 10, controlsY);
    ctx.fillText('P2: Follows P1 | Tab = Smart Shoot | Q/E/R/T = Weapons', 10, controlsY + 20);
}
```

**Step 2: Test keyboard mode toggle**

Verify M key still works to toggle keyboard/mouse mode for Player 1.

**Step 3: Update index.html**

Copy game.html changes to index.html for GitHub Pages:

```bash
cp game.html index.html
git add index.html
```

**Step 4: Final commit and push**

```bash
git commit -m "feat: complete 2-player co-op mode implementation

- Player count selection screen
- Separate character selection for each player
- Player 2 AI follow system (70px distance)
- Tab key smart shooting with auto-aim
- Independent weapon switching (1-4 for P1, Q/E/R/T for P2)
- Shared health and lives system
- Updated collision detection for both players
- Dual weapon selector UI
- Player name labels
- Works in Adventure and Practice modes

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"

git push origin master
```

**Step 5: Test deployed version**

Open: https://kilroy91841.github.io/ezra-space-adventure/
Expected: 2-player mode works on GitHub Pages

---

## Implementation Notes

**Key Points:**
- All player references changed from `player` to `player1`
- Player 2 only exists when `playerCount === 2`
- Shared health/lives are global variables
- Both players' projectiles go in same `playerProjectiles` array
- Collision loops check both players with `[player1, player2].forEach()`
- Follow system runs every frame before player2.update()
- Smart shooting checks for enemies within 200 pixels

**Testing Reminders:**
- Test with same characters and different characters
- Test in both Adventure and Practice modes
- Verify 1-player mode still works correctly
- Check console for any errors
- Test all weapons for both players
- Verify dimension transitions
- Test game over and restart scenarios

## Success Criteria

All checkboxes from design document:
- [x] Player count selection screen functional
- [x] Both players can select different characters
- [x] Player 2 follows Player 1 smoothly at ~70 pixel distance
- [x] Tab key shoots with smart auto-aim (or up if no enemies)
- [x] Q/E/R/T switch Player 2's weapons independently
- [x] Both players share health and lives pool
- [x] Collision detection works for both players
- [x] Works in both Adventure and Practice modes
- [x] UI clearly shows both players' weapons and states
- [ ] Ronen (younger player) finds it easy and fun to use (real-world test!)
