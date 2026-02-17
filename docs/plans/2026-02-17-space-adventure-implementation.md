# Ezra's Space Adventure Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a complete 6-dimension space adventure game with puzzles, boss battles, weapon system, and ally mechanics for a 6.5-year-old player.

**Architecture:** Refactor existing prototype from monolithic game.html into modular JavaScript architecture with separate game engine, entity system, dimension manager, and weapon system. Use vanilla JavaScript with HTML5 Canvas for rendering. Follow TDD for all game logic modules.

**Tech Stack:** HTML5, Canvas API, Vanilla JavaScript (ES6+), Browser-based (no build tools)

---

## Task 1: Project Structure Setup

**Files:**
- Create: `src/engine/GameEngine.js`
- Create: `src/entities/Entity.js`
- Create: `src/entities/Player.js`
- Create: `tests/engine/GameEngine.test.html`
- Create: `package.json` (for documentation only, not for build)

**Step 1: Create basic project structure**

```bash
mkdir -p src/engine src/entities src/weapons src/dimensions src/allies tests/engine tests/entities
```

**Step 2: Create package.json for documentation**

Create: `package.json`
```json
{
  "name": "ezras-space-adventure",
  "version": "1.0.0",
  "description": "A space adventure game for Ezra",
  "main": "game.html",
  "scripts": {
    "test": "open tests/runner.html"
  },
  "author": "Ezra & Dad",
  "license": "MIT"
}
```

**Step 3: Create README**

Create: `README.md`
```markdown
# Ezra's Space Adventure

A magic robot's journey through space to defeat the dragon!

## Play the Game
Open `game.html` in your browser.

## Run Tests
Open `tests/runner.html` in your browser.

## Architecture
- `src/engine/` - Core game loop and state management
- `src/entities/` - Game characters (robot, bosses, allies)
- `src/weapons/` - Weapon system (15 weapon types)
- `src/dimensions/` - Dimension logic and puzzles
- `src/allies/` - Ally AI and behavior
```

**Step 4: Commit structure**

```bash
git add package.json README.md
git commit -m "feat: add project structure and documentation"
```

---

## Task 2: Game Engine Core (TDD)

**Files:**
- Create: `tests/engine/GameEngine.test.html`
- Create: `src/engine/GameEngine.js`

**Step 1: Write failing test for GameEngine initialization**

Create: `tests/engine/GameEngine.test.html`
```html
<!DOCTYPE html>
<html>
<head>
    <title>GameEngine Tests</title>
    <style>
        body { font-family: monospace; padding: 20px; background: #1a1a1a; color: #0f0; }
        .pass { color: #0f0; }
        .fail { color: #f00; }
    </style>
</head>
<body>
    <h1>GameEngine Tests</h1>
    <div id="results"></div>

    <script type="module">
        import { GameEngine } from '../../src/engine/GameEngine.js';

        const results = [];

        function test(name, fn) {
            try {
                fn();
                results.push({ name, status: 'pass' });
            } catch (error) {
                results.push({ name, status: 'fail', error: error.message });
            }
        }

        function assert(condition, message) {
            if (!condition) throw new Error(message || 'Assertion failed');
        }

        // Test: Engine initializes with default state
        test('GameEngine initializes with default state', () => {
            const engine = new GameEngine();
            assert(engine.state !== undefined, 'Engine should have state');
            assert(engine.state.running === false, 'Engine should not be running initially');
        });

        // Test: Engine can start and stop
        test('GameEngine can start', () => {
            const engine = new GameEngine();
            engine.start();
            assert(engine.state.running === true, 'Engine should be running after start');
        });

        test('GameEngine can stop', () => {
            const engine = new GameEngine();
            engine.start();
            engine.stop();
            assert(engine.state.running === false, 'Engine should stop');
        });

        // Render results
        const resultsDiv = document.getElementById('results');
        results.forEach(r => {
            const div = document.createElement('div');
            div.className = r.status;
            div.textContent = `${r.status.toUpperCase()}: ${r.name}`;
            if (r.error) div.textContent += ` - ${r.error}`;
            resultsDiv.appendChild(div);
        });
    </script>
</body>
</html>
```

**Step 2: Run test to verify it fails**

Open: `tests/engine/GameEngine.test.html` in browser
Expected: FAIL - "Cannot import GameEngine"

**Step 3: Write minimal GameEngine implementation**

Create: `src/engine/GameEngine.js`
```javascript
export class GameEngine {
    constructor() {
        this.state = {
            running: false,
            currentDimension: null,
            entities: [],
            score: 0
        };
        this.lastFrameTime = 0;
    }

    start() {
        this.state.running = true;
    }

    stop() {
        this.state.running = false;
    }

    update(deltaTime) {
        if (!this.state.running) return;

        // Update all entities
        this.state.entities.forEach(entity => {
            if (entity.update) entity.update(deltaTime);
        });
    }

    addEntity(entity) {
        this.state.entities.push(entity);
    }

    removeEntity(entity) {
        const index = this.state.entities.indexOf(entity);
        if (index > -1) {
            this.state.entities.splice(index, 1);
        }
    }
}
```

**Step 4: Run test to verify it passes**

Refresh: `tests/engine/GameEngine.test.html`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add tests/engine/GameEngine.test.html src/engine/GameEngine.js
git commit -m "feat: add GameEngine with start/stop lifecycle"
```

---

## Task 3: Entity Base Class (TDD)

**Files:**
- Create: `tests/entities/Entity.test.html`
- Create: `src/entities/Entity.js`

**Step 1: Write failing test for Entity**

Create: `tests/entities/Entity.test.html`
```html
<!DOCTYPE html>
<html>
<head>
    <title>Entity Tests</title>
    <style>
        body { font-family: monospace; padding: 20px; background: #1a1a1a; color: #0f0; }
        .pass { color: #0f0; }
        .fail { color: #f00; }
    </style>
</head>
<body>
    <h1>Entity Tests</h1>
    <div id="results"></div>

    <script type="module">
        import { Entity } from '../../src/entities/Entity.js';

        const results = [];

        function test(name, fn) {
            try {
                fn();
                results.push({ name, status: 'pass' });
            } catch (error) {
                results.push({ name, status: 'fail', error: error.message });
            }
        }

        function assert(condition, message) {
            if (!condition) throw new Error(message || 'Assertion failed');
        }

        test('Entity initializes with position and size', () => {
            const entity = new Entity(100, 200, 30, 40);
            assert(entity.x === 100, 'X should be 100');
            assert(entity.y === 200, 'Y should be 200');
            assert(entity.width === 30, 'Width should be 30');
            assert(entity.height === 40, 'Height should be 40');
        });

        test('Entity detects collision with another entity', () => {
            const e1 = new Entity(0, 0, 50, 50);
            const e2 = new Entity(25, 25, 50, 50);
            const e3 = new Entity(100, 100, 50, 50);

            assert(e1.collidesWith(e2), 'Overlapping entities should collide');
            assert(!e1.collidesWith(e3), 'Non-overlapping entities should not collide');
        });

        test('Entity has active state', () => {
            const entity = new Entity(0, 0, 10, 10);
            assert(entity.active === true, 'Entity should be active by default');
            entity.destroy();
            assert(entity.active === false, 'Entity should be inactive after destroy');
        });

        // Render results
        const resultsDiv = document.getElementById('results');
        results.forEach(r => {
            const div = document.createElement('div');
            div.className = r.status;
            div.textContent = `${r.status.toUpperCase()}: ${r.name}`;
            if (r.error) div.textContent += ` - ${r.error}`;
            resultsDiv.appendChild(div);
        });
    </script>
</body>
</html>
```

**Step 2: Run test to verify it fails**

Open: `tests/entities/Entity.test.html` in browser
Expected: FAIL - "Cannot import Entity"

**Step 3: Write Entity base class**

Create: `src/entities/Entity.js`
```javascript
export class Entity {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.active = true;
    }

    update(deltaTime) {
        // Override in subclasses
    }

    render(ctx) {
        // Override in subclasses
    }

    collidesWith(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }

    destroy() {
        this.active = false;
    }

    getBounds() {
        return {
            left: this.x,
            right: this.x + this.width,
            top: this.y,
            bottom: this.y + this.height
        };
    }
}
```

**Step 4: Run test to verify it passes**

Refresh: `tests/entities/Entity.test.html`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add tests/entities/Entity.test.html src/entities/Entity.js
git commit -m "feat: add Entity base class with collision detection"
```

---

## Task 4: Player Entity (TDD)

**Files:**
- Create: `tests/entities/Player.test.html`
- Create: `src/entities/Player.js`

**Step 1: Write failing test for Player**

Create: `tests/entities/Player.test.html`
```html
<!DOCTYPE html>
<html>
<head>
    <title>Player Tests</title>
    <style>
        body { font-family: monospace; padding: 20px; background: #1a1a1a; color: #0f0; }
        .pass { color: #0f0; }
        .fail { color: #f00; }
    </style>
</head>
<body>
    <h1>Player Tests</h1>
    <div id="results"></div>

    <script type="module">
        import { Player } from '../../src/entities/Player.js';

        const results = [];

        function test(name, fn) {
            try {
                fn();
                results.push({ name, status: 'pass' });
            } catch (error) {
                results.push({ name, status: 'fail', error: error.message });
            }
        }

        function assert(condition, message) {
            if (!condition) throw new Error(message || 'Assertion failed');
        }

        test('Player initializes with powerups', () => {
            const player = new Player(100, 100);
            assert(player.powerups === 0, 'Should start with 0 powerups');
        });

        test('Player can add powerups', () => {
            const player = new Player(100, 100);
            player.addPowerup();
            assert(player.powerups === 1, 'Should have 1 powerup');
            player.addPowerup();
            assert(player.powerups === 2, 'Should have 2 powerups');
        });

        test('Player can lose powerups', () => {
            const player = new Player(100, 100);
            player.addPowerup();
            player.addPowerup();
            player.removePowerup();
            assert(player.powerups === 1, 'Should have 1 powerup after losing one');
        });

        test('Player powerups cannot go below 0', () => {
            const player = new Player(100, 100);
            player.removePowerup();
            assert(player.powerups === 0, 'Powerups should not go negative');
        });

        test('Player moves with velocity', () => {
            const player = new Player(100, 100);
            player.vx = 5;
            player.vy = 3;
            player.update(1);
            assert(player.x === 105, 'X should increase by vx');
            assert(player.y === 103, 'Y should increase by vy');
        });

        // Render results
        const resultsDiv = document.getElementById('results');
        results.forEach(r => {
            const div = document.createElement('div');
            div.className = r.status;
            div.textContent = `${r.status.toUpperCase()}: ${r.name}`;
            if (r.error) div.textContent += ` - ${r.error}`;
            resultsDiv.appendChild(div);
        });
    </script>
</body>
</html>
```

**Step 2: Run test to verify it fails**

Open: `tests/entities/Player.test.html` in browser
Expected: FAIL

**Step 3: Write Player class**

Create: `src/entities/Player.js`
```javascript
import { Entity } from './Entity.js';

export class Player extends Entity {
    constructor(x, y) {
        super(x, y, 30, 30);
        this.powerups = 0;
        this.speed = 5;
        this.vx = 0;
        this.vy = 0;
        this.color = '#00aaff';
        this.weapon = null;
        this.inventory = [];
    }

    addPowerup() {
        this.powerups++;
    }

    removePowerup() {
        if (this.powerups > 0) {
            this.powerups--;
        }
    }

    update(deltaTime) {
        // Apply velocity
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
    }

    setVelocity(vx, vy) {
        this.vx = vx;
        this.vy = vy;
    }

    render(ctx) {
        // Robot body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Robot eyes
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(this.x + 5, this.y + 5, 8, 8);
        ctx.fillRect(this.x + 17, this.y + 5, 8, 8);

        // Magic antenna
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x + 15, this.y);
        ctx.lineTo(this.x + 15, this.y - 10);
        ctx.stroke();
        ctx.fillStyle = '#ff00ff';
        ctx.beginPath();
        ctx.arc(this.x + 15, this.y - 10, 4, 0, Math.PI * 2);
        ctx.fill();
    }
}
```

**Step 4: Run test to verify it passes**

Refresh: `tests/entities/Player.test.html`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add tests/entities/Player.test.html src/entities/Player.js
git commit -m "feat: add Player entity with powerup management"
```

---

## Task 5: Weapon System - Base Class (TDD)

**Files:**
- Create: `tests/weapons/Weapon.test.html`
- Create: `src/weapons/Weapon.js`

**Step 1: Write failing test for Weapon**

Create: `tests/weapons/Weapon.test.html`
```html
<!DOCTYPE html>
<html>
<head>
    <title>Weapon Tests</title>
    <style>
        body { font-family: monospace; padding: 20px; background: #1a1a1a; color: #0f0; }
        .pass { color: #0f0; }
        .fail { color: #f00; }
    </style>
</head>
<body>
    <h1>Weapon Tests</h1>
    <div id="results"></div>

    <script type="module">
        import { Weapon, WeaponType } from '../../src/weapons/Weapon.js';

        const results = [];

        function test(name, fn) {
            try {
                fn();
                results.push({ name, status: 'pass' });
            } catch (error) {
                results.push({ name, status: 'fail', error: error.message });
            }
        }

        function assert(condition, message) {
            if (!condition) throw new Error(message || 'Assertion failed');
        }

        test('Weapon has type and damage', () => {
            const weapon = new Weapon('Laser', WeaponType.SHOOTER, 10);
            assert(weapon.name === 'Laser', 'Name should be Laser');
            assert(weapon.type === WeaponType.SHOOTER, 'Type should be SHOOTER');
            assert(weapon.baseDamage === 10, 'Damage should be 10');
        });

        test('Weapon calculates damage with powerups', () => {
            const weapon = new Weapon('Laser', WeaponType.SHOOTER, 10);
            const damage = weapon.calculateDamage(3);
            assert(damage === 13, 'Damage should be 10 + 3 powerups');
        });

        test('WeaponType enum exists', () => {
            assert(WeaponType.SHOOTER !== undefined);
            assert(WeaponType.MELEE !== undefined);
            assert(WeaponType.SUMMON !== undefined);
        });

        // Render results
        const resultsDiv = document.getElementById('results');
        results.forEach(r => {
            const div = document.createElement('div');
            div.className = r.status;
            div.textContent = `${r.status.toUpperCase()}: ${r.name}`;
            if (r.error) div.textContent += ` - ${r.error}`;
            resultsDiv.appendChild(div);
        });
    </script>
</body>
</html>
```

**Step 2: Run test to verify it fails**

Open: `tests/weapons/Weapon.test.html`
Expected: FAIL

**Step 3: Write Weapon base class**

Create: `src/weapons/Weapon.js`
```javascript
export const WeaponType = {
    SHOOTER: 'shooter',
    MELEE: 'melee',
    SUMMON: 'summon'
};

export class Weapon {
    constructor(name, type, baseDamage) {
        this.name = name;
        this.type = type;
        this.baseDamage = baseDamage;
    }

    calculateDamage(powerups) {
        return this.baseDamage + powerups;
    }

    fire(player, entities) {
        // Override in subclasses
        return [];
    }
}
```

**Step 4: Run test to verify it passes**

Refresh: `tests/weapons/Weapon.test.html`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add tests/weapons/Weapon.test.html src/weapons/Weapon.js
git commit -m "feat: add Weapon base class with damage calculation"
```

---

## Task 6: Dimension System (TDD)

**Files:**
- Create: `tests/dimensions/Dimension.test.html`
- Create: `src/dimensions/Dimension.js`
- Create: `src/dimensions/DimensionManager.js`

**Step 1: Write failing test for Dimension**

Create: `tests/dimensions/Dimension.test.html`
```html
<!DOCTYPE html>
<html>
<head>
    <title>Dimension Tests</title>
    <style>
        body { font-family: monospace; padding: 20px; background: #1a1a1a; color: #0f0; }
        .pass { color: #0f0; }
        .fail { color: #f00; }
    </style>
</head>
<body>
    <h1>Dimension Tests</h1>
    <div id="results"></div>

    <script type="module">
        import { Dimension, DimensionType } from '../../src/dimensions/Dimension.js';
        import { DimensionManager } from '../../src/dimensions/DimensionManager.js';

        const results = [];

        function test(name, fn) {
            try {
                fn();
                results.push({ name, status: 'pass' });
            } catch (error) {
                results.push({ name, status: 'fail', error: error.message });
            }
        }

        function assert(condition, message) {
            if (!condition) throw new Error(message || 'Assertion failed');
        }

        test('Dimension has number and type', () => {
            const dim = new Dimension(1, DimensionType.PUZZLE, 'Memory Puzzle');
            assert(dim.number === 1);
            assert(dim.type === DimensionType.PUZZLE);
            assert(dim.name === 'Memory Puzzle');
        });

        test('Dimension tracks completion', () => {
            const dim = new Dimension(1, DimensionType.PUZZLE, 'Test');
            assert(dim.completed === false);
            dim.complete();
            assert(dim.completed === true);
        });

        test('DimensionManager tracks current dimension', () => {
            const manager = new DimensionManager();
            manager.addDimension(new Dimension(1, DimensionType.PUZZLE, 'D1'));
            manager.addDimension(new Dimension(2, DimensionType.BOSS, 'D2'));

            assert(manager.getCurrentDimension().number === 1);
        });

        test('DimensionManager can advance to next dimension', () => {
            const manager = new DimensionManager();
            manager.addDimension(new Dimension(1, DimensionType.PUZZLE, 'D1'));
            manager.addDimension(new Dimension(2, DimensionType.BOSS, 'D2'));

            manager.nextDimension();
            assert(manager.getCurrentDimension().number === 2);
        });

        // Render results
        const resultsDiv = document.getElementById('results');
        results.forEach(r => {
            const div = document.createElement('div');
            div.className = r.status;
            div.textContent = `${r.status.toUpperCase()}: ${r.name}`;
            if (r.error) div.textContent += ` - ${r.error}`;
            resultsDiv.appendChild(div);
        });
    </script>
</body>
</html>
```

**Step 2: Run test to verify it fails**

Open: `tests/dimensions/Dimension.test.html`
Expected: FAIL

**Step 3: Write Dimension classes**

Create: `src/dimensions/Dimension.js`
```javascript
export const DimensionType = {
    PUZZLE: 'puzzle',
    BOSS: 'boss',
    STORY: 'story'
};

export class Dimension {
    constructor(number, type, name) {
        this.number = number;
        this.type = type;
        this.name = name;
        this.completed = false;
        this.entities = [];
    }

    complete() {
        this.completed = true;
    }

    update(deltaTime, gameState) {
        // Override in subclasses
    }

    render(ctx) {
        // Override in subclasses
    }

    onEnter(gameState) {
        // Called when dimension becomes active
    }

    onExit(gameState) {
        // Called when leaving dimension
    }
}
```

Create: `src/dimensions/DimensionManager.js`
```javascript
export class DimensionManager {
    constructor() {
        this.dimensions = [];
        this.currentIndex = 0;
    }

    addDimension(dimension) {
        this.dimensions.push(dimension);
    }

    getCurrentDimension() {
        return this.dimensions[this.currentIndex];
    }

    nextDimension() {
        if (this.currentIndex < this.dimensions.length - 1) {
            const current = this.getCurrentDimension();
            if (current) current.onExit();

            this.currentIndex++;

            const next = this.getCurrentDimension();
            if (next) next.onEnter();
        }
    }

    canAdvance() {
        const current = this.getCurrentDimension();
        return current && current.completed;
    }
}
```

**Step 4: Run test to verify it passes**

Refresh: `tests/dimensions/Dimension.test.html`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add tests/dimensions/Dimension.test.html src/dimensions/Dimension.js src/dimensions/DimensionManager.js
git commit -m "feat: add Dimension system with manager"
```

---

## Task 7: Integrate Refactored Code Into game.html

**Files:**
- Modify: `game.html` (complete rewrite to use modules)
- Create: `game-legacy.html` (backup of original)

**Step 1: Backup current game.html**

```bash
cp game.html game-legacy.html
git add game-legacy.html
git commit -m "backup: preserve original prototype as game-legacy.html"
```

**Step 2: Rewrite game.html to use modules**

Modify: `game.html`
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ezra's Space Adventure!</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            background: #000;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            font-family: 'Courier New', monospace;
            color: #fff;
        }
        #gameCanvas {
            border: 3px solid #00ff00;
            background: #000;
            box-shadow: 0 0 20px #00ff00;
        }
        .info {
            margin-top: 20px;
            font-size: 18px;
            text-align: center;
        }
        .controls {
            margin-top: 10px;
            padding: 15px;
            background: #111;
            border: 2px solid #00ff00;
            border-radius: 10px;
        }
        .title {
            font-size: 32px;
            color: #00ff00;
            text-shadow: 0 0 10px #00ff00;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="title">🤖 EZRA'S SPACE ADVENTURE 🚀</div>
    <canvas id="gameCanvas" width="800" height="600"></canvas>
    <div class="info">
        <div style="font-size: 24px; color: #00ff00; margin-bottom: 10px;"><span id="message">Welcome! Starting adventure...</span></div>
        <div>Dimension: <span id="dimension">1</span> | Power-Ups: <span id="powerups">0</span> | Score: <span id="score">0</span></div>
    </div>
    <div class="controls">
        <strong>Controls:</strong> Arrow Keys = Move | SPACEBAR = Shoot Magic
    </div>

    <script type="module">
        import { GameEngine } from './src/engine/GameEngine.js';
        import { Player } from './src/entities/Player.js';

        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');

        // Initialize game engine
        const engine = new GameEngine();

        // Create player
        const player = new Player(400, 500);
        engine.addEntity(player);

        // Keyboard input
        const keys = {};
        window.addEventListener('keydown', (e) => {
            keys[e.key] = true;

            if (e.key === ' ') {
                e.preventDefault();
                // TODO: Fire weapon
            }
        });

        window.addEventListener('keyup', (e) => {
            keys[e.key] = false;
        });

        // Create stars
        const stars = [];
        for (let i = 0; i < 100; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2,
                speed: Math.random() * 2 + 1
            });
        }

        // Game loop
        let lastTime = 0;
        function gameLoop(currentTime) {
            const deltaTime = (currentTime - lastTime) / 16.67; // Normalize to 60fps
            lastTime = currentTime;

            // Handle player input
            let vx = 0, vy = 0;
            if (keys['ArrowLeft']) vx = -player.speed;
            if (keys['ArrowRight']) vx = player.speed;
            if (keys['ArrowUp']) vy = -player.speed;
            if (keys['ArrowDown']) vy = player.speed;
            player.setVelocity(vx, vy);

            // Constrain player to canvas
            if (player.x < 0) player.x = 0;
            if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;
            if (player.y < 0) player.y = 0;
            if (player.y > canvas.height - player.height) player.y = canvas.height - player.height;

            // Update engine
            engine.update(deltaTime);

            // Update stars
            stars.forEach(star => {
                star.y += star.speed * deltaTime;
                if (star.y > canvas.height) {
                    star.y = 0;
                    star.x = Math.random() * canvas.width;
                }
            });

            // Render
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw stars
            stars.forEach(star => {
                ctx.fillStyle = '#fff';
                ctx.fillRect(star.x, star.y, star.size, star.size);
            });

            // Draw entities
            engine.state.entities.forEach(entity => {
                entity.render(ctx);
            });

            // Update UI
            document.getElementById('powerups').textContent = player.powerups;
            document.getElementById('score').textContent = engine.state.score;

            requestAnimationFrame(gameLoop);
        }

        // Start game
        engine.start();
        requestAnimationFrame(gameLoop);
    </script>
</body>
</html>
```

**Step 3: Test the refactored game**

Open: `game.html` in browser
Expected: Robot appears and moves with arrow keys (no shooting yet, no bosses yet)

**Step 4: Commit refactored game**

```bash
git add game.html
git commit -m "refactor: migrate game.html to use modular architecture"
```

---

## Task 8: Implement 15 Weapon Types

**Files:**
- Create: `src/weapons/ShooterWeapons.js`
- Create: `src/weapons/MeleeWeapons.js`
- Create: `src/weapons/SummonWeapons.js`
- Create: `src/entities/Projectile.js`

**Step 1: Create Projectile entity**

Create: `src/entities/Projectile.js`
```javascript
import { Entity } from './Entity.js';

export class Projectile extends Entity {
    constructor(x, y, vx, vy, damage, color = '#ff00ff') {
        super(x, y, 6, 15);
        this.vx = vx;
        this.vy = vy;
        this.damage = damage;
        this.color = color;
    }

    update(deltaTime) {
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;

        // Deactivate if off screen
        if (this.y < -this.height || this.y > 700 ||
            this.x < -this.width || this.x > 900) {
            this.destroy();
        }
    }

    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Sparkle effect
        ctx.fillStyle = '#fff';
        ctx.fillRect(this.x + 2, this.y + this.height / 2, 2, 2);
    }
}
```

**Step 2: Create Shooter weapons (5 types)**

Create: `src/weapons/ShooterWeapons.js`
```javascript
import { Weapon, WeaponType } from './Weapon.js';
import { Projectile } from '../entities/Projectile.js';

export class LaserBlaster extends Weapon {
    constructor() {
        super('Laser Blaster', WeaponType.SHOOTER, 5);
        this.color = '#ff00ff';
    }

    fire(player, entities) {
        const damage = this.calculateDamage(player.powerups);
        const projectile = new Projectile(
            player.x + player.width / 2 - 3,
            player.y,
            0,
            -8,
            damage,
            this.color
        );
        return [projectile];
    }
}

export class PlasmaCannon extends Weapon {
    constructor() {
        super('Plasma Cannon', WeaponType.SHOOTER, 8);
        this.color = '#00ffff';
    }

    fire(player, entities) {
        const damage = this.calculateDamage(player.powerups);
        const projectile = new Projectile(
            player.x + player.width / 2 - 5,
            player.y,
            0,
            -6,
            damage,
            this.color
        );
        projectile.width = 10;
        projectile.height = 20;
        return [projectile];
    }
}

export class StarShooter extends Weapon {
    constructor() {
        super('Star Shooter', WeaponType.SHOOTER, 4);
        this.color = '#ffff00';
    }

    fire(player, entities) {
        const damage = this.calculateDamage(player.powerups);
        // Triple shot!
        return [
            new Projectile(player.x + player.width / 2 - 3, player.y, -2, -8, damage, this.color),
            new Projectile(player.x + player.width / 2 - 3, player.y, 0, -8, damage, this.color),
            new Projectile(player.x + player.width / 2 - 3, player.y, 2, -8, damage, this.color)
        ];
    }
}

export class RocketLauncher extends Weapon {
    constructor() {
        super('Rocket Launcher', WeaponType.SHOOTER, 15);
        this.color = '#ff0000';
    }

    fire(player, entities) {
        const damage = this.calculateDamage(player.powerups);
        const projectile = new Projectile(
            player.x + player.width / 2 - 4,
            player.y,
            0,
            -5,
            damage,
            this.color
        );
        projectile.width = 8;
        projectile.height = 16;
        return [projectile];
    }
}

export class IonBeam extends Weapon {
    constructor() {
        super('Ion Beam', WeaponType.SHOOTER, 6);
        this.color = '#8800ff';
    }

    fire(player, entities) {
        const damage = this.calculateDamage(player.powerups);
        const projectile = new Projectile(
            player.x + player.width / 2 - 2,
            player.y,
            0,
            -10,
            damage,
            this.color
        );
        projectile.width = 4;
        projectile.height = 30;
        return [projectile];
    }
}
```

**Step 3: Create Melee weapons (5 types)**

Create: `src/weapons/MeleeWeapons.js`
```javascript
import { Weapon, WeaponType } from './Weapon.js';

class MeleeAttack {
    constructor(x, y, width, height, damage, color, lifetime) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.damage = damage;
        this.color = color;
        this.lifetime = lifetime;
        this.age = 0;
        this.active = true;
    }

    update(deltaTime) {
        this.age += deltaTime;
        if (this.age >= this.lifetime) {
            this.active = false;
        }
    }

    render(ctx) {
        const alpha = 1 - (this.age / this.lifetime);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.globalAlpha = 1;
    }

    collidesWith(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }

    destroy() {
        this.active = false;
    }
}

export class EnergySword extends Weapon {
    constructor() {
        super('Energy Sword', WeaponType.MELEE, 12);
        this.color = '#00ffff';
    }

    fire(player, entities) {
        const damage = this.calculateDamage(player.powerups);
        const attack = new MeleeAttack(
            player.x - 20,
            player.y - 40,
            70,
            40,
            damage,
            this.color,
            10 // frames
        );
        return [attack];
    }
}

export class PowerFist extends Weapon {
    constructor() {
        super('Power Fist', WeaponType.MELEE, 15);
        this.color = '#ff6600';
    }

    fire(player, entities) {
        const damage = this.calculateDamage(player.powerups);
        const attack = new MeleeAttack(
            player.x,
            player.y - 50,
            player.width,
            50,
            damage,
            this.color,
            8
        );
        return [attack];
    }
}

export class LightningWhip extends Weapon {
    constructor() {
        super('Lightning Whip', WeaponType.MELEE, 10);
        this.color = '#ffff00';
    }

    fire(player, entities) {
        const damage = this.calculateDamage(player.powerups);
        const attack = new MeleeAttack(
            player.x - 30,
            player.y - 60,
            90,
            30,
            damage,
            this.color,
            12
        );
        return [attack];
    }
}

export class CrystalBlade extends Weapon {
    constructor() {
        super('Crystal Blade', WeaponType.MELEE, 14);
        this.color = '#ff00ff';
    }

    fire(player, entities) {
        const damage = this.calculateDamage(player.powerups);
        const attack = new MeleeAttack(
            player.x - 10,
            player.y - 50,
            50,
            50,
            damage,
            this.color,
            10
        );
        return [attack];
    }
}

export class ShockGauntlet extends Weapon {
    constructor() {
        super('Shock Gauntlet', WeaponType.MELEE, 11);
        this.color = '#0088ff';
    }

    fire(player, entities) {
        const damage = this.calculateDamage(player.powerups);
        // Creates shockwave around player
        const attack = new MeleeAttack(
            player.x - 40,
            player.y - 40,
            110,
            110,
            damage,
            this.color,
            6
        );
        return [attack];
    }
}
```

**Step 4: Create Summon weapons (5 types)**

Create: `src/weapons/SummonWeapons.js`
```javascript
import { Weapon, WeaponType } from './Weapon.js';
import { Entity } from '../entities/Entity.js';

class Summon extends Entity {
    constructor(x, y, damage, color, lifetime, behavior) {
        super(x, y, 20, 20);
        this.damage = damage;
        this.color = color;
        this.lifetime = lifetime;
        this.age = 0;
        this.behavior = behavior;
    }

    update(deltaTime) {
        this.age += deltaTime;
        if (this.age >= this.lifetime) {
            this.destroy();
            return;
        }

        // Execute behavior
        this.behavior(this, deltaTime);
    }

    render(ctx) {
        const alpha = Math.max(0.3, 1 - (this.age / this.lifetime));
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Glow effect
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
        ctx.globalAlpha = 1;
    }
}

export class FireSpirit extends Weapon {
    constructor() {
        super('Fire Spirit', WeaponType.SUMMON, 8);
        this.color = '#ff4400';
    }

    fire(player, entities) {
        const damage = this.calculateDamage(player.powerups);
        const summon = new Summon(
            player.x,
            player.y - 30,
            damage,
            this.color,
            120, // 2 seconds
            (summon, dt) => {
                summon.y -= 3 * dt;
            }
        );
        return [summon];
    }
}

export class IceMinion extends Weapon {
    constructor() {
        super('Ice Minion', WeaponType.SUMMON, 10);
        this.color = '#00ccff';
    }

    fire(player, entities) {
        const damage = this.calculateDamage(player.powerups);
        const summon = new Summon(
            player.x - 40,
            player.y,
            damage,
            this.color,
            180,
            (summon, dt) => {
                summon.x += Math.sin(summon.age * 0.1) * 2;
                summon.y -= 2 * dt;
            }
        );
        return [summon];
    }
}

export class ThunderOrb extends Weapon {
    constructor() {
        super('Thunder Orb', WeaponType.SUMMON, 12);
        this.color = '#ffff00';
    }

    fire(player, entities) {
        const damage = this.calculateDamage(player.powerups);
        const summon = new Summon(
            player.x + player.width / 2,
            player.y - 50,
            damage,
            this.color,
            150,
            (summon, dt) => {
                // Orbits around starting position
                summon.x += Math.cos(summon.age * 0.2) * 3;
                summon.y -= 1 * dt;
            }
        );
        summon.width = 30;
        summon.height = 30;
        return [summon];
    }
}

export class ShadowClone extends Weapon {
    constructor() {
        super('Shadow Clone', WeaponType.SUMMON, 7);
        this.color = '#6600cc';
    }

    fire(player, entities) {
        const damage = this.calculateDamage(player.powerups);
        // Creates two clones
        return [
            new Summon(player.x - 50, player.y, damage, this.color, 100,
                (s, dt) => s.y -= 2.5 * dt),
            new Summon(player.x + 50, player.y, damage, this.color, 100,
                (s, dt) => s.y -= 2.5 * dt)
        ];
    }
}

export class StarGuardian extends Weapon {
    constructor() {
        super('Star Guardian', WeaponType.SUMMON, 9);
        this.color = '#ffaa00';
    }

    fire(player, entities) {
        const damage = this.calculateDamage(player.powerups);
        const summon = new Summon(
            player.x,
            player.y,
            damage,
            this.color,
            200,
            (summon, dt) => {
                // Spirals upward
                summon.x += Math.cos(summon.age * 0.3) * 4;
                summon.y -= 2 * dt;
            }
        );
        summon.width = 25;
        summon.height = 25;
        return [summon];
    }
}
```

**Step 5: Commit all weapon types**

```bash
git add src/entities/Projectile.js src/weapons/ShooterWeapons.js src/weapons/MeleeWeapons.js src/weapons/SummonWeapons.js
git commit -m "feat: implement all 15 weapon types (5 shooter, 5 melee, 5 summon)"
```

---

## Task 9: Memory Puzzle (Dimension 1)

**Files:**
- Create: `src/dimensions/MemoryPuzzleDimension.js`
- Create: `tests/dimensions/MemoryPuzzle.test.html`

**Step 1: Write test for memory puzzle**

Create: `tests/dimensions/MemoryPuzzle.test.html`
```html
<!DOCTYPE html>
<html>
<head>
    <title>Memory Puzzle Tests</title>
    <style>
        body { font-family: monospace; padding: 20px; background: #1a1a1a; color: #0f0; }
        .pass { color: #0f0; }
        .fail { color: #f00; }
    </style>
</head>
<body>
    <h1>Memory Puzzle Tests</h1>
    <div id="results"></div>

    <script type="module">
        import { MemoryPuzzleDimension } from '../../src/dimensions/MemoryPuzzleDimension.js';

        const results = [];

        function test(name, fn) {
            try {
                fn();
                results.push({ name, status: 'pass' });
            } catch (error) {
                results.push({ name, status: 'fail', error: error.message });
            }
        }

        function assert(condition, message) {
            if (!condition) throw new Error(message || 'Assertion failed');
        }

        test('Memory puzzle generates sequence', () => {
            const puzzle = new MemoryPuzzleDimension();
            puzzle.startPuzzle();
            assert(puzzle.sequence.length === 4, 'Should generate sequence of 4');
        });

        test('Memory puzzle validates correct input', () => {
            const puzzle = new MemoryPuzzleDimension();
            puzzle.sequence = [1, 2, 3];
            puzzle.playerSequence = [];

            puzzle.handleInput(1);
            puzzle.handleInput(2);
            puzzle.handleInput(3);

            assert(puzzle.completed === true, 'Should complete on correct sequence');
        });

        test('Memory puzzle resets on wrong input', () => {
            const puzzle = new MemoryPuzzleDimension();
            puzzle.sequence = [1, 2, 3];
            puzzle.playerSequence = [];

            puzzle.handleInput(1);
            puzzle.handleInput(3); // Wrong!

            assert(puzzle.playerSequence.length === 0, 'Should reset sequence');
            assert(puzzle.completed === false, 'Should not complete');
        });

        // Render results
        const resultsDiv = document.getElementById('results');
        results.forEach(r => {
            const div = document.createElement('div');
            div.className = r.status;
            div.textContent = `${r.status.toUpperCase()}: ${r.name}`;
            if (r.error) div.textContent += ` - ${r.error}`;
            resultsDiv.appendChild(div);
        });
    </script>
</body>
</html>
```

**Step 2: Implement memory puzzle**

Create: `src/dimensions/MemoryPuzzleDimension.js`
```javascript
import { Dimension, DimensionType } from './Dimension.js';

export class MemoryPuzzleDimension extends Dimension {
    constructor() {
        super(1, DimensionType.PUZZLE, 'Memory Puzzle');
        this.sequence = [];
        this.playerSequence = [];
        this.displaying = false;
        this.displayIndex = 0;
        this.displayTimer = 0;
        this.tiles = [
            { id: 1, x: 200, y: 200, color: '#ff0000', lit: false },
            { id: 2, x: 400, y: 200, color: '#00ff00', lit: false },
            { id: 3, x: 200, y: 400, color: '#0000ff', lit: false },
            { id: 4, x: 400, y: 400, color: '#ffff00', lit: false }
        ];
    }

    startPuzzle() {
        this.sequence = [];
        this.playerSequence = [];

        // Generate random sequence of 4
        for (let i = 0; i < 4; i++) {
            this.sequence.push(Math.floor(Math.random() * 4) + 1);
        }

        this.displaying = true;
        this.displayIndex = 0;
    }

    onEnter(gameState) {
        this.startPuzzle();
    }

    handleInput(tileId) {
        if (this.displaying) return;

        this.playerSequence.push(tileId);

        // Check if matches so far
        for (let i = 0; i < this.playerSequence.length; i++) {
            if (this.playerSequence[i] !== this.sequence[i]) {
                // Wrong! Reset
                this.playerSequence = [];
                return;
            }
        }

        // Check if complete
        if (this.playerSequence.length === this.sequence.length) {
            this.complete();
        }
    }

    update(deltaTime, gameState) {
        if (this.displaying) {
            this.displayTimer += deltaTime;

            if (this.displayTimer >= 30) { // 0.5 seconds per tile
                this.tiles.forEach(t => t.lit = false);

                if (this.displayIndex < this.sequence.length) {
                    const tileId = this.sequence[this.displayIndex];
                    const tile = this.tiles.find(t => t.id === tileId);
                    if (tile) tile.lit = true;

                    this.displayIndex++;
                    this.displayTimer = 0;
                } else {
                    // Done displaying
                    this.displaying = false;
                }
            }
        }
    }

    render(ctx) {
        // Draw tiles
        this.tiles.forEach(tile => {
            ctx.fillStyle = tile.lit ? tile.color : '#333';
            ctx.fillRect(tile.x, tile.y, 150, 150);

            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.strokeRect(tile.x, tile.y, 150, 150);
        });

        // Draw instructions
        ctx.fillStyle = '#fff';
        ctx.font = '24px Courier New';
        ctx.textAlign = 'center';

        if (this.displaying) {
            ctx.fillText('Watch the sequence!', 400, 100);
        } else {
            ctx.fillText('Click the tiles in order!', 400, 100);
            ctx.font = '18px Courier New';
            ctx.fillText(`Progress: ${this.playerSequence.length}/${this.sequence.length}`, 400, 130);
        }
    }

    handleClick(x, y) {
        if (this.displaying || this.completed) return;

        for (const tile of this.tiles) {
            if (x >= tile.x && x <= tile.x + 150 &&
                y >= tile.y && y <= tile.y + 150) {
                this.handleInput(tile.id);

                // Visual feedback
                tile.lit = true;
                setTimeout(() => { tile.lit = false; }, 200);
                break;
            }
        }
    }
}
```

**Step 3: Test and commit**

Open: `tests/dimensions/MemoryPuzzle.test.html`
Expected: PASS

```bash
git add tests/dimensions/MemoryPuzzle.test.html src/dimensions/MemoryPuzzleDimension.js
git commit -m "feat: implement memory puzzle for dimension 1"
```

---

## Task 10: Boss Entities and Combat System

**Files:**
- Create: `src/entities/Boss.js`
- Create: `src/entities/AlienBoss.js`
- Create: `src/entities/DragonBoss.js`
- Create: `src/dimensions/BossDimension.js`

**Step 1: Create base Boss class**

Create: `src/entities/Boss.js`
```javascript
import { Entity } from './Entity.js';

export class Boss extends Entity {
    constructor(x, y, width, height, name, maxHealth) {
        super(x, y, width, height);
        this.name = name;
        this.health = maxHealth;
        this.maxHealth = maxHealth;
        this.speed = 2;
        this.direction = 1;
        this.shootTimer = 0;
        this.shootInterval = 90;
        this.defeated = false;
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            this.defeated = true;
            this.destroy();
        }
    }

    update(deltaTime) {
        if (this.defeated) return;

        // Move side to side
        this.x += this.speed * this.direction * deltaTime;

        // Bounce at edges
        if (this.x <= 0 || this.x >= 800 - this.width) {
            this.direction *= -1;
        }

        // Shooting
        this.shootTimer += deltaTime;
    }

    shoot() {
        // Override in subclasses
        return [];
    }

    renderHealthBar(ctx, canvasWidth) {
        const barWidth = 200;
        const barHeight = 20;
        const barX = (canvasWidth - barWidth) / 2;
        const barY = 10;

        // Background
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // Health
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? '#0f0' : healthPercent > 0.25 ? '#ff0' : '#f00';
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

        // Border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        // Name
        ctx.fillStyle = '#fff';
        ctx.font = '16px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText(this.name.toUpperCase(), canvasWidth / 2, barY + barHeight + 20);
    }
}
```

**Step 2: Create AlienBoss**

Create: `src/entities/AlienBoss.js`
```javascript
import { Boss } from './Boss.js';
import { Projectile } from './Projectile.js';

export class AlienBoss extends Boss {
    constructor(x, y) {
        super(x, y, 80, 60, 'Alien', 10);
        this.color = '#00ff00';
        this.shootInterval = 90;
        this.isEvil = true;
    }

    shoot() {
        if (this.shootTimer >= this.shootInterval) {
            this.shootTimer = 0;
            return [new Projectile(
                this.x + this.width / 2 - 4,
                this.y + this.height,
                0,
                4,
                1,
                this.color
            )];
        }
        return [];
    }

    turnGood() {
        this.isEvil = false;
        this.defeated = true;
        this.color = '#88ff88'; // Lighter green
    }

    render(ctx) {
        // Alien body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Eyes
        ctx.fillStyle = this.isEvil ? '#fff' : '#00ffff';
        ctx.fillRect(this.x + 15, this.y + 15, 15, 15);
        ctx.fillRect(this.x + 50, this.y + 15, 15, 15);

        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 20, this.y + 20, 5, 5);
        ctx.fillRect(this.x + 55, this.y + 20, 5, 5);

        // Antenna
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.x + 20, this.y);
        ctx.lineTo(this.x + 20, this.y - 15);
        ctx.moveTo(this.x + 60, this.y);
        ctx.lineTo(this.x + 60, this.y - 15);
        ctx.stroke();
    }
}
```

**Step 3: Create DragonBoss**

Create: `src/entities/DragonBoss.js`
```javascript
import { Boss } from './Boss.js';
import { Projectile } from './Projectile.js';

export class DragonBoss extends Boss {
    constructor(x, y) {
        super(x, y, 120, 100, 'Dragon', 25);
        this.color = '#ff0000';
        this.shootInterval = 60; // Faster than alien
        this.speed = 2;
    }

    shoot() {
        if (this.shootTimer >= this.shootInterval) {
            this.shootTimer = 0;

            // Dragon shoots two fireballs
            return [
                new Projectile(this.x + 30, this.y + this.height, -1, 4, 1, this.color),
                new Projectile(this.x + this.width - 30, this.y + this.height, 1, 4, 1, this.color)
            ];
        }
        return [];
    }

    render(ctx) {
        // Dragon body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x + 20, this.y + 20, this.width - 40, this.height - 20);

        // Dragon head
        ctx.fillRect(this.x + 40, this.y, 40, 40);

        // Eyes
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(this.x + 45, this.y + 10, 10, 10);
        ctx.fillRect(this.x + 65, this.y + 10, 10, 10);

        // Wings
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + 40);
        ctx.lineTo(this.x + 20, this.y + 20);
        ctx.lineTo(this.x + 20, this.y + 60);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(this.x + this.width, this.y + 40);
        ctx.lineTo(this.x + this.width - 20, this.y + 20);
        ctx.lineTo(this.x + this.width - 20, this.y + 60);
        ctx.fill();
    }
}
```

**Step 4: Create BossDimension base class**

Create: `src/dimensions/BossDimension.js`
```javascript
import { Dimension, DimensionType } from './Dimension.js';

export class BossDimension extends Dimension {
    constructor(number, name, boss) {
        super(number, DimensionType.BOSS, name);
        this.boss = boss;
        this.enemyProjectiles = [];
    }

    onEnter(gameState) {
        // Boss enters from top
        this.boss.y = -this.boss.height;
        this.boss.active = true;
        this.boss.defeated = false;
    }

    update(deltaTime, gameState) {
        // Move boss into view
        if (this.boss.y < 50) {
            this.boss.y += 2 * deltaTime;
        } else {
            // Boss is in position, start combat
            this.boss.update(deltaTime);

            // Boss shoots
            const newProjectiles = this.boss.shoot();
            this.enemyProjectiles.push(...newProjectiles);
        }

        // Update enemy projectiles
        this.enemyProjectiles = this.enemyProjectiles.filter(p => {
            p.update(deltaTime);
            return p.active;
        });

        // Check if boss defeated
        if (this.boss.defeated && !this.completed) {
            this.complete();
        }
    }

    render(ctx) {
        // Render boss
        this.boss.render(ctx);
        this.boss.renderHealthBar(ctx, 800);

        // Render enemy projectiles
        this.enemyProjectiles.forEach(p => p.render(ctx));
    }

    getEnemyProjectiles() {
        return this.enemyProjectiles;
    }
}
```

**Step 5: Commit**

```bash
git add src/entities/Boss.js src/entities/AlienBoss.js src/entities/DragonBoss.js src/dimensions/BossDimension.js
git commit -m "feat: implement boss system with alien and dragon bosses"
```

---

## Continuing Implementation Summary

The plan continues with:

- Task 11: Math Puzzle Dimension (adaptive difficulty)
- Task 12: Story Dimension (Psychic character)
- Task 13: Ally System (Alien turns good, Psychic heals)
- Task 14: Power-up sharing and revival mechanics
- Task 15: Weapon switching and inventory UI
- Task 16: Integrate all 6 dimensions into game flow
- Task 17: Add power-up drops and collection
- Task 18: Polish and balance (damage, health, difficulty)
- Task 19: Final testing playthrough
- Task 20: Prepare for pixel art assets

Each task follows the same TDD pattern with small, testable steps.

---

## Execution Strategy

This plan is designed for **incremental, test-driven implementation**. Each task:
- Takes 15-30 minutes to complete
- Has clear test cases
- Produces working, committable code
- Builds on previous tasks

The modular architecture allows parallel development of systems (weapons, dimensions, allies) that integrate cleanly through the GameEngine.

---

**END OF IMPLEMENTATION PLAN**

This plan covers approximately 50% of the full implementation. Remaining tasks follow the same pattern. Ready to execute?
