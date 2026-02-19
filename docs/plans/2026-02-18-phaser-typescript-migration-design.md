# Phaser + TypeScript Migration Design

**Goal:** Rewrite Ezra's Space Adventure as a TypeScript + Phaser 3 game. Port all existing features while improving visuals, adding audio, and leveraging Phaser's built-in physics, input, and particle systems.

**Approach:** Clean-room rewrite using existing game as spec. No incremental migration — fresh Phaser project built from scratch.

---

## Project Setup & Tooling

- **Framework:** Phaser 3 (latest stable)
- **Language:** TypeScript (strict mode)
- **Build:** Vite (fast dev server, simple config, static output)
- **No additional frameworks** — Phaser handles rendering, physics, input, audio, scenes

### Directory Structure

```
ezra-phaser/
├── src/
│   ├── main.ts              # Phaser game config + entry point
│   ├── scenes/              # Phaser Scenes
│   ├── entities/            # Game objects (Player, Boss, Enemy, etc.)
│   ├── weapons/             # Weapon classes
│   ├── effects/             # Particles, screen shake
│   ├── ui/                  # HUD components
│   └── config/              # Constants, character definitions
├── assets/
│   ├── sprites/
│   ├── audio/
│   └── fonts/
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Scene Architecture

Each screen and game level is a Phaser Scene, replacing the current if/else state machine in a single game loop.

| Scene | Replaces | Purpose |
|-------|----------|---------|
| `BootScene` | (new) | Preload all assets |
| `PlayerCountScene` | playerCountSelected logic | "HOW MANY PLAYERS?" |
| `CharacterSelectScene` | characterSelected logic | Pick characters for P1/P2 |
| `ModeSelectScene` | gameModeSelected logic | Adventure vs Practice |
| `TitleScene` | gameStarted logic | "Press SPACEBAR to Start" |
| `CollectionScene` | CollectionDimension | Dimension 1: Power-up hunt |
| `BossScene` | BossDimension | Dimensions 2, 4, 5: Boss fights (parameterized) |
| `MathPuzzleScene` | MathPuzzleDimension | Dimension 3: Math puzzles |
| `PracticeScene` | PracticeMuseumDimension | Practice museum |
| `VictoryScene` | gameWon logic | Victory screen |
| `HUDScene` | inline rendering | Overlay for health, weapons, labels |

**Flow:** Boot → PlayerCount → CharacterSelect → ModeSelect → Title → Collection → Boss(Alien) → MathPuzzle → Boss(MiniDragon) → Boss(Dragon) → Victory

HUD runs as a parallel overlay scene on top of gameplay scenes.

---

## Entity & Physics System

**Physics engine:** Phaser Arcade Physics — automatic velocity, collision detection, world bounds.

### Entity Hierarchy

All game entities extend `Phaser.Physics.Arcade.Sprite`:

- **Player** — characterType, weapon, inventory, powerups. P1 is keyboard/mouse, P2 is AI follow + Tab shoot.
- **Boss** — AlienBoss (teleport, chase, become ally), MiniDragonBoss, DragonBoss (2 phases, burrow, fireballs)
- **ChasingEnemy** — pursues nearest player
- **PowerUp / SpecialPowerUp** — collectible items with visual effects
- **DamageTrap** — deceptive trap that looks like power-up
- **StageHazard** — Lava, Trampoline, IcePatch

### Collision Groups

| Group | Collides With | Effect |
|-------|--------------|--------|
| `playerGroup` | `enemyBullets`, `chasingEnemies`, `hazards`, `traps` | Take damage |
| `playerGroup` | `powerups` | Collect |
| `playerBullets` | `bossGroup`, `chasingEnemies` | Deal damage |

Collisions handled declaratively: `this.physics.add.overlap(playerGroup, enemyBullets, onHit)`

### Rendering

Entities start as generated textures (matching current Canvas-drawn look). Swapping to sprite sheet art later is just replacing asset files.

---

## Weapons

Each weapon creates projectiles through Phaser's object pooling (bullet groups). No manual array management.

```typescript
abstract class Weapon {
  abstract fire(shooter: Player, direction: Vec2): void
  cooldown: number
  baseDamage: number
  bulletGroup: Phaser.Physics.Arcade.Group
}
```

- **Shooter weapons** (Ice, Fire, Laser, etc.) → projectiles into bullet group
- **Melee weapons** (Sword, Fist) → temporary hitbox sprites
- **Summon weapons** (FireSpirit, etc.) → ally sprites with AI
- P1 switches with 1-4, P2 with Q/E/R/T

---

## Input

Phaser's input system replaces manual `keys[]` tracking:

- **Player 1:** Cursor keys (move), WASD (shoot direction), Space (shoot up), 1-4 (weapons)
- **Player 2:** AI follow, Tab (smart shoot), Q/E/R/T (weapons)
- **Gamepad:** Nearly free with Phaser's built-in gamepad API. P2 could use a controller.

---

## Audio

Sound effects and music via Phaser's audio system:

- **Weapons:** shoot_ice, shoot_fire, shoot_bomb, sword_swing
- **Combat:** hit_enemy, hit_player, explosion
- **Collection:** powerup_collect, powerup_speed, powerup_shield
- **Boss:** boss_appear, boss_defeat
- **Music:** bgm_adventure, bgm_boss (looping, crossfade between scenes)

Start with free/generated sounds, upgrade later.

---

## HUD (Parallel Overlay Scene)

Renders on top of gameplay with its own non-scrolling camera:

- Health bar
- Lives display
- P1 weapon selector (1-4)
- P2 weapon selector (Q/E/R/T, 2-player only)
- Player name labels (EZRA/RONEN)
- Active power-up timers
- Debug overlay
- Score/dimension info

---

## Visual Improvements

| Feature | Current | Phaser |
|---------|---------|--------|
| Characters | Canvas draw calls | Generated textures (upgradeable to pixel art) |
| Particles | Manual array + filter | Phaser Particle Emitter (GPU-friendly) |
| Screen shake | None | `cameras.main.shake()` |
| Hit feedback | Blink on/off | Tint red + shake |
| Explosions | 20-40 particles | 100+ particles via emitter |
| Shield | Manual arc | Sprite with pulsing tween |
| Boss defeat | Particle burst | Emitter + shake + slow-mo |
| Transitions | Instant | Fade/slide camera effects |
| Stars | Manual array | TileSprite with auto-scroll |
| Camera | Static | Follow player, zoom, flash, lerp |

---

## Existing Features to Port

All features from the current vanilla game:

- [x] 4 character types (Spaceship, Rocket, UFO, Robot)
- [x] 2-player co-op (P2 AI follow, Tab shoot, Q/E/R/T weapons)
- [x] 5 dimensions (Collection, Alien Boss, Math Puzzle, Mini Dragon, Dragon Boss)
- [x] 4 Ezra weapons (Ice, Fire, Sword, Bomb)
- [x] Additional weapons (Laser, Plasma, Star, Rocket, melee, summons)
- [x] Power-ups (Speed, Shield, Health, Extra Life, regular)
- [x] Stage hazards (Lava, Trampoline, Ice)
- [x] Damage traps
- [x] Alien boss becomes ally
- [x] Dragon boss 2-phase fight
- [x] Math puzzle dimension
- [x] Practice museum with spawn buttons
- [x] Shared health/lives in 2-player
- [x] Debug mode (level jump, heal)

## Success Criteria

- All existing gameplay preserved
- TypeScript strict mode, no `any` types
- Phaser physics for all collisions (no manual detection)
- Sound effects for all major actions
- Smooth scene transitions
- Gamepad-ready input system
- Clean scene-based architecture (no monolithic game loop)
