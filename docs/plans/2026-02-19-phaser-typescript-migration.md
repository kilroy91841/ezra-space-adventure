# Phaser + TypeScript Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rewrite Ezra's Space Adventure from vanilla Canvas JS to TypeScript + Phaser 3, porting all features while adding physics, audio, and visual improvements.

**Architecture:** Clean-room rewrite using Phaser Scenes (one per screen/level), Arcade Physics for collisions, Phaser input system, and Phaser particle emitters. All game entities extend Phaser.Physics.Arcade.Sprite. HUD is a parallel overlay scene.

**Tech Stack:** TypeScript (strict), Phaser 3, Vite, Vitest (for logic tests)

**Reference:** Original source code is in `src/` directory of this repo. Each task references the original files to port from.

---

## Phase 1: Project Scaffolding

### Task 1: Initialize Vite + Phaser + TypeScript Project

**Files:**
- Create: `ezra-phaser/package.json`
- Create: `ezra-phaser/tsconfig.json`
- Create: `ezra-phaser/vite.config.ts`
- Create: `ezra-phaser/index.html`
- Create: `ezra-phaser/src/main.ts`

**Step 1: Create project directory**

```bash
mkdir -p ezra-phaser/src
cd ezra-phaser
```

**Step 2: Initialize package.json**

```json
{
  "name": "ezra-space-adventure",
  "version": "2.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest"
  },
  "dependencies": {
    "phaser": "^3.87.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "vite": "^6.1.0",
    "vitest": "^3.0.0"
  }
}
```

**Step 3: Install dependencies**

Run: `npm install`
Expected: node_modules created, no errors

**Step 4: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "types": ["vitest/globals"]
  },
  "include": ["src/**/*"]
}
```

**Step 5: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    port: 3000,
    open: true,
  },
});
```

**Step 6: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ezra's Space Adventure</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: #000;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            overflow: hidden;
        }
    </style>
</head>
<body>
    <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

**Step 7: Create src/main.ts with Phaser game config**

```typescript
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './config/constants';
import { BootScene } from './scenes/BootScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  scene: [BootScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

new Phaser.Game(config);
```

**Step 8: Create config/constants.ts**

Reference: `src/constants.js`

```typescript
export const GAME_WIDTH = 1200;
export const GAME_HEIGHT = 900;

export const PLAYER_START_X = (GAME_WIDTH - 40) / 2;
export const PLAYER_START_Y = (GAME_HEIGHT - 50) / 2;

export const PLAYER_WIDTH = 40;
export const PLAYER_HEIGHT = 50;

export const NORMAL_SPEED = 300; // Phaser uses pixels/sec, not pixels/frame
export const BOOSTED_SPEED = 480;

export const MAX_HEALTH = 100;
export const STARTING_LIVES = 4;

export const SHOOT_RATE = 80; // ms between shots (was 5 frames at 60fps ≈ 83ms)

export const INVULNERABLE_DURATION = 1000; // ms (was 60 frames)
export const RESPAWN_INVULNERABLE = 2000; // ms (was 120 frames)
```

**Step 9: Create minimal BootScene**

```typescript
// src/scenes/BootScene.ts
import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Will load assets here later
  }

  create(): void {
    const text = this.add.text(600, 450, 'Ezra\'s Space Adventure\nLoading...', {
      fontFamily: 'Courier New',
      fontSize: '32px',
      color: '#00ff00',
      align: 'center',
    });
    text.setOrigin(0.5);
  }
}
```

**Step 10: Create directory structure**

```bash
mkdir -p src/scenes src/entities src/weapons src/effects src/ui src/config
```

**Step 11: Test dev server**

Run: `npm run dev`
Expected: Browser opens, black screen with green "Ezra's Space Adventure / Loading..." text

**Step 12: Commit**

```bash
git add .
git commit -m "feat: scaffold Phaser + TypeScript project with Vite"
```

---

### Task 2: Create Config Types and Character Definitions

**Files:**
- Create: `ezra-phaser/src/config/characters.ts`
- Create: `ezra-phaser/src/config/types.ts`
- Create: `ezra-phaser/src/config/dimensions.ts`

Reference: `src/entities/CharacterTypes.js`, `src/dimensions/Dimension.js`

**Step 1: Create shared types**

```typescript
// src/config/types.ts
export interface CharacterDef {
  id: string;
  name: string;
  color: number;     // Phaser uses hex numbers, not CSS strings
  secondaryColor: number;
}

export type WeaponType = 'shooter' | 'melee' | 'summon';

export interface WeaponDef {
  name: string;
  type: WeaponType;
  damage: number;
  cooldown: number;
  color: number;
  emoji: string;  // For UI display
}

export interface DimensionDef {
  number: number;
  type: 'collection' | 'boss' | 'puzzle';
  name: string;
  sceneKey: string;
  bossType?: 'alien' | 'minidragon' | 'dragon';
}

export interface GameData {
  playerCount: 1 | 2;
  character1: CharacterDef;
  character2?: CharacterDef;
  isPracticeMode: boolean;
  score: number;
  lives: number;
  health: number;
  currentDimension: number;
}
```

**Step 2: Create character definitions**

```typescript
// src/config/characters.ts
import { CharacterDef } from './types';

export const CHARACTERS: CharacterDef[] = [
  {
    id: 'spaceship',
    name: 'Classic Spaceship',
    color: 0x00ff00,
    secondaryColor: 0x00aa00,
  },
  {
    id: 'rocket',
    name: 'Red Rocket',
    color: 0xff3333,
    secondaryColor: 0xffaa00,
  },
  {
    id: 'ufo',
    name: 'Flying Saucer',
    color: 0xcc00ff,
    secondaryColor: 0xff00ff,
  },
  {
    id: 'robot',
    name: 'Battle Bot',
    color: 0x888888,
    secondaryColor: 0x444444,
  },
];
```

**Step 3: Create dimension progression config**

```typescript
// src/config/dimensions.ts
import { DimensionDef } from './types';

export const DIMENSION_ORDER: DimensionDef[] = [
  { number: 1, type: 'collection', name: 'Power-Up Hunt', sceneKey: 'CollectionScene' },
  { number: 2, type: 'boss', name: 'Alien Battle', sceneKey: 'BossScene', bossType: 'alien' },
  { number: 3, type: 'puzzle', name: 'Math Puzzle Challenge', sceneKey: 'MathPuzzleScene' },
  { number: 4, type: 'boss', name: 'Mini Dragon', sceneKey: 'BossScene', bossType: 'minidragon' },
  { number: 5, type: 'boss', name: 'FINAL: Dragon Boss', sceneKey: 'BossScene', bossType: 'dragon' },
];
```

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add game config types, character definitions, and dimension order"
```

---

### Task 3: Generate Textures at Boot Time

**Files:**
- Modify: `ezra-phaser/src/scenes/BootScene.ts`

Since we're using Canvas-drawn characters (not sprite sheets), we generate textures at boot. Each character type gets a texture created from the same drawing logic as the original `CharacterTypes.js`.

Reference: `src/entities/CharacterTypes.js` for exact drawing code

**Step 1: Add texture generation to BootScene**

```typescript
// src/scenes/BootScene.ts
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER_WIDTH, PLAYER_HEIGHT } from '../config/constants';
import { CHARACTERS } from '../config/characters';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // No external assets yet - we generate textures
  }

  create(): void {
    this.generateCharacterTextures();
    this.generateProjectileTextures();
    this.generateUITextures();

    // Proceed to first menu scene
    this.scene.start('PlayerCountScene');
  }

  private generateCharacterTextures(): void {
    const w = PLAYER_WIDTH;
    const h = PLAYER_HEIGHT;

    // Spaceship - green triangle
    this.generateTexture('char_spaceship', w, h, (ctx) => {
      ctx.fillStyle = '#00ff00';
      ctx.beginPath();
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(0, h);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#00ffff';
      ctx.fillRect(w / 2 - 8, 15, 16, 16);
    });

    // Rocket - red with fins and flames
    this.generateTexture('char_rocket', w, h + 18, (ctx) => {
      ctx.fillStyle = '#ff3333';
      ctx.fillRect(w / 4, 10, w / 2, h - 10);
      ctx.beginPath();
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w / 4, 10);
      ctx.lineTo(w * 3 / 4, 10);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ff6666';
      ctx.beginPath();
      ctx.moveTo(w / 4, h - 20); ctx.lineTo(0, h); ctx.lineTo(w / 4, h);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(w * 3 / 4, h - 20); ctx.lineTo(w, h); ctx.lineTo(w * 3 / 4, h);
      ctx.fill();
      ctx.fillStyle = '#ffaa00';
      ctx.fillRect(w / 3, h, w / 3, 10);
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(w / 2 - 6, h + 5, 12, 8);
    });

    // UFO - purple saucer with dome
    this.generateTexture('char_ufo', w, h, (ctx) => {
      ctx.fillStyle = '#00ffff';
      ctx.beginPath();
      ctx.ellipse(w / 2, h / 3, w / 3, h / 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#cc00ff';
      ctx.beginPath();
      ctx.ellipse(w / 2, h / 2, w / 2, h / 4, 0, 0, Math.PI * 2);
      ctx.fill();
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        ctx.fillStyle = i % 2 === 0 ? '#ffff00' : '#00ff00';
        ctx.beginPath();
        ctx.arc(w / 2 + Math.cos(angle) * w / 3, h / 2, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Robot - gray with red eyes
    this.generateTexture('char_robot', w, h, (ctx) => {
      ctx.fillStyle = '#888888';
      ctx.fillRect(w / 4, h / 3, w / 2, h * 2 / 3);
      ctx.fillStyle = '#aaaaaa';
      ctx.fillRect(w / 3, 0, w / 3, h / 3);
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(w / 3 + 5, 8, 8, 8);
      ctx.fillRect(w * 2 / 3 - 13, 8, 8, 8);
      ctx.fillStyle = '#666666';
      ctx.fillRect(0, h / 2, w / 4, 8);
      ctx.fillRect(w * 3 / 4, h / 2, w / 4, 8);
      ctx.fillStyle = '#ffaa00';
      ctx.beginPath();
      ctx.arc(w / 2, -6, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  private generateProjectileTextures(): void {
    // Ice projectile - cyan
    this.generateTexture('proj_ice', 8, 12, (ctx) => {
      ctx.fillStyle = '#00ffff';
      ctx.fillRect(1, 0, 6, 12);
      ctx.fillStyle = '#88ffff';
      ctx.fillRect(2, 2, 4, 4);
    });

    // Fire projectile - orange/red
    this.generateTexture('proj_fire', 8, 12, (ctx) => {
      ctx.fillStyle = '#ff6600';
      ctx.fillRect(1, 0, 6, 12);
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(2, 2, 4, 4);
    });

    // Sword swing - wide arc
    this.generateTexture('proj_sword', 60, 30, (ctx) => {
      ctx.fillStyle = '#aaaaff';
      ctx.beginPath();
      ctx.arc(30, 30, 30, Math.PI, 0);
      ctx.fill();
    });

    // Bomb - dark circle
    this.generateTexture('proj_bomb', 20, 20, (ctx) => {
      ctx.fillStyle = '#333333';
      ctx.beginPath();
      ctx.arc(10, 10, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff4400';
      ctx.fillRect(8, 0, 4, 4);
    });

    // Generic enemy projectile
    this.generateTexture('proj_enemy', 8, 8, (ctx) => {
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(4, 4, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Alien blob projectile
    this.generateTexture('proj_alien', 10, 10, (ctx) => {
      ctx.fillStyle = '#00ff00';
      ctx.beginPath();
      ctx.arc(5, 5, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Dragon fireball
    this.generateTexture('proj_fireball', 14, 14, (ctx) => {
      ctx.fillStyle = '#ff4400';
      ctx.beginPath();
      ctx.arc(7, 7, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffff00';
      ctx.beginPath();
      ctx.arc(7, 7, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  private generateUITextures(): void {
    // Power-up star
    this.generateTexture('powerup_star', 24, 24, (ctx) => {
      ctx.fillStyle = '#ffff00';
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const x = 12 + Math.cos(angle) * 10;
        const y = 12 + Math.sin(angle) * 10;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    });

    // Enemy chaser - green alien
    this.generateTexture('enemy_chaser', 30, 30, (ctx) => {
      ctx.fillStyle = '#00ff00';
      ctx.beginPath();
      ctx.arc(15, 15, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.fillRect(8, 10, 5, 5);
      ctx.fillRect(17, 10, 5, 5);
    });

    // Boss textures will be larger
    // Alien boss
    this.generateTexture('boss_alien', 80, 80, (ctx) => {
      ctx.fillStyle = '#00ff00';
      ctx.beginPath();
      ctx.arc(40, 50, 30, 0, Math.PI * 2);
      ctx.fill();
      // Eyes
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(28, 42, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(52, 42, 8, 0, Math.PI * 2);
      ctx.fill();
      // Pupils
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(30, 42, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(54, 42, 3, 0, Math.PI * 2);
      ctx.fill();
      // Antennae
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(25, 25); ctx.lineTo(15, 5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(55, 25); ctx.lineTo(65, 5);
      ctx.stroke();
    });

    // Dragon boss (basic)
    this.generateTexture('boss_dragon', 140, 100, (ctx) => {
      ctx.fillStyle = '#ff4400';
      ctx.beginPath();
      ctx.ellipse(70, 60, 50, 35, 0, 0, Math.PI * 2);
      ctx.fill();
      // Head
      ctx.fillStyle = '#ff6600';
      ctx.beginPath();
      ctx.arc(120, 40, 20, 0, Math.PI * 2);
      ctx.fill();
      // Eyes
      ctx.fillStyle = '#ffff00';
      ctx.beginPath();
      ctx.arc(125, 35, 5, 0, Math.PI * 2);
      ctx.fill();
      // Wings
      ctx.fillStyle = '#cc3300';
      ctx.beginPath();
      ctx.moveTo(40, 30); ctx.lineTo(10, 0); ctx.lineTo(70, 40);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(40, 30); ctx.lineTo(10, 60); ctx.lineTo(70, 40);
      ctx.fill();
    });

    // Mini dragon
    this.generateTexture('boss_minidragon', 100, 70, (ctx) => {
      ctx.fillStyle = '#ff6600';
      ctx.beginPath();
      ctx.ellipse(50, 40, 35, 25, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff8800';
      ctx.beginPath();
      ctx.arc(80, 30, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffff00';
      ctx.beginPath();
      ctx.arc(85, 25, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Hazard textures
    this.generateTexture('hazard_lava', 60, 20, (ctx) => {
      ctx.fillStyle = '#ff4400';
      ctx.fillRect(0, 0, 60, 20);
      ctx.fillStyle = '#ffaa00';
      ctx.fillRect(5, 2, 10, 8);
      ctx.fillRect(25, 5, 8, 6);
      ctx.fillRect(45, 2, 10, 10);
    });

    this.generateTexture('hazard_trampoline', 60, 15, (ctx) => {
      ctx.fillStyle = '#ff00ff';
      ctx.fillRect(0, 5, 60, 10);
      ctx.fillStyle = '#ff88ff';
      ctx.fillRect(0, 0, 60, 5);
    });

    this.generateTexture('hazard_ice', 60, 20, (ctx) => {
      ctx.fillStyle = '#88ccff';
      ctx.fillRect(0, 0, 60, 20);
      ctx.fillStyle = '#aaddff';
      ctx.fillRect(10, 5, 15, 10);
      ctx.fillRect(35, 3, 15, 10);
    });

    // Damage trap (looks like powerup)
    this.generateTexture('damage_trap', 24, 24, (ctx) => {
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const x = 12 + Math.cos(angle) * 10;
        const y = 12 + Math.sin(angle) * 10;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    });

    // Special power-up textures
    this.generateTexture('powerup_speed', 24, 24, (ctx) => {
      ctx.fillStyle = '#00ffff';
      ctx.beginPath();
      ctx.moveTo(4, 12); ctx.lineTo(20, 4); ctx.lineTo(16, 12);
      ctx.lineTo(20, 20); ctx.closePath();
      ctx.fill();
    });

    this.generateTexture('powerup_shield', 24, 24, (ctx) => {
      ctx.fillStyle = '#0088ff';
      ctx.beginPath();
      ctx.moveTo(12, 2); ctx.lineTo(22, 8); ctx.lineTo(22, 16);
      ctx.lineTo(12, 22); ctx.lineTo(2, 16); ctx.lineTo(2, 8);
      ctx.closePath();
      ctx.fill();
    });

    this.generateTexture('powerup_health', 24, 24, (ctx) => {
      ctx.fillStyle = '#ff4444';
      ctx.fillRect(8, 2, 8, 20);
      ctx.fillRect(2, 8, 20, 8);
    });

    this.generateTexture('powerup_life', 24, 24, (ctx) => {
      ctx.fillStyle = '#ff69b4';
      ctx.beginPath();
      ctx.arc(8, 8, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(16, 8, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(2, 10); ctx.lineTo(12, 22); ctx.lineTo(22, 10);
      ctx.fill();
    });
  }

  private generateTexture(key: string, width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void): void {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    draw(ctx);
    this.textures.addCanvas(key, canvas);
  }
}
```

**Step 2: Test boot**

Run: `npm run dev`
Expected: Brief loading then transitions to PlayerCountScene (which doesn't exist yet, so Phaser will warn in console - that's fine for now)

**Step 3: Commit**

```bash
git add .
git commit -m "feat: generate all game textures at boot time"
```

---

## Phase 2: Menu Scenes

### Task 4: Player Count Selection Scene

**Files:**
- Create: `ezra-phaser/src/scenes/PlayerCountScene.ts`
- Modify: `ezra-phaser/src/main.ts` (register scene)

Reference: Player count screen logic in `game.html` lines ~450-515

**Step 1: Create PlayerCountScene**

```typescript
// src/scenes/PlayerCountScene.ts
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants';

export class PlayerCountScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PlayerCountScene' });
  }

  create(): void {
    // Starfield background
    for (let i = 0; i < 100; i++) {
      const star = this.add.rectangle(
        Phaser.Math.Between(0, GAME_WIDTH),
        Phaser.Math.Between(0, GAME_HEIGHT),
        Phaser.Math.Between(1, 3),
        Phaser.Math.Between(1, 3),
        0xffffff
      );
      this.tweens.add({
        targets: star,
        y: GAME_HEIGHT + 10,
        duration: Phaser.Math.Between(2000, 5000),
        repeat: -1,
        onRepeat: () => { star.y = -10; star.x = Phaser.Math.Between(0, GAME_WIDTH); },
      });
    }

    // Title
    this.add.text(GAME_WIDTH / 2, 150, 'HOW MANY PLAYERS?', {
      fontFamily: 'Courier New',
      fontSize: '48px',
      color: '#00ff00',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // 1 Player button
    this.createButton(GAME_WIDTH / 2 - 200, 350, '1 PLAYER', 0x0066cc, () => {
      this.scene.start('CharacterSelectScene', { playerCount: 1 });
    });

    // 2 Players button
    this.createButton(GAME_WIDTH / 2 + 200, 350, '2 PLAYERS', 0x008800, () => {
      this.scene.start('CharacterSelectScene', { playerCount: 2 });
    });

    // Instructions
    this.add.text(GAME_WIDTH / 2, 500, 'Press 1 or 2, or click to choose', {
      fontFamily: 'Courier New',
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Keyboard shortcuts
    this.input.keyboard!.on('keydown-ONE', () => {
      this.scene.start('CharacterSelectScene', { playerCount: 1 });
    });
    this.input.keyboard!.on('keydown-TWO', () => {
      this.scene.start('CharacterSelectScene', { playerCount: 2 });
    });
  }

  private createButton(x: number, y: number, label: string, color: number, onClick: () => void): void {
    const btn = this.add.rectangle(x, y, 300, 150, color)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => { btn.setStrokeStyle(4, 0xffff00); })
      .on('pointerout', () => { btn.setStrokeStyle(2, 0xffffff); })
      .on('pointerdown', onClick);
    btn.setStrokeStyle(2, 0xffffff);

    this.add.text(x, y, label, {
      fontFamily: 'Courier New',
      fontSize: '28px',
      color: '#000000',
      fontStyle: 'bold',
    }).setOrigin(0.5);
  }
}
```

**Step 2: Register scene in main.ts**

Add `PlayerCountScene` to the scene array in game config.

**Step 3: Test**

Run: `npm run dev`
Expected: "HOW MANY PLAYERS?" screen with clickable buttons and keyboard shortcuts

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add player count selection scene"
```

---

### Task 5: Character Select Scene

**Files:**
- Create: `ezra-phaser/src/scenes/CharacterSelectScene.ts`

Reference: Character selection in `game.html` lines ~519-590, `src/entities/CharacterTypes.js`

**Step 1: Create CharacterSelectScene**

This scene handles both P1 and P2 character selection. In 2-player mode, it runs twice - first for Ezra (P1), then for Ronen (P2).

```typescript
// src/scenes/CharacterSelectScene.ts
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants';
import { CHARACTERS } from '../config/characters';
import { CharacterDef, GameData } from '../config/types';

export class CharacterSelectScene extends Phaser.Scene {
  private playerCount!: number;
  private character1?: CharacterDef;
  private selectingPlayer!: 1 | 2;

  constructor() {
    super({ key: 'CharacterSelectScene' });
  }

  init(data: { playerCount: number; character1?: CharacterDef }): void {
    this.playerCount = data.playerCount;
    this.character1 = data.character1;
    this.selectingPlayer = data.character1 ? 2 : 1;
  }

  create(): void {
    // Background
    this.cameras.main.setBackgroundColor('#000000');

    // Stars
    for (let i = 0; i < 80; i++) {
      this.add.rectangle(
        Phaser.Math.Between(0, GAME_WIDTH),
        Phaser.Math.Between(0, GAME_HEIGHT),
        Phaser.Math.Between(1, 2), Phaser.Math.Between(1, 2), 0xffffff
      );
    }

    // Title
    const playerName = this.selectingPlayer === 1 ? 'EZRA' : 'RONEN';
    this.add.text(GAME_WIDTH / 2, 120, `${playerName} - CHOOSE YOUR CHARACTER`, {
      fontFamily: 'Courier New', fontSize: '40px', color: '#00ff00', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 180, 'Click to select!', {
      fontFamily: 'Courier New', fontSize: '24px', color: '#ffff00',
    }).setOrigin(0.5);

    // Character boxes
    const boxWidth = 220;
    const spacing = 40;
    const totalWidth = CHARACTERS.length * boxWidth + (CHARACTERS.length - 1) * spacing;
    const startX = (GAME_WIDTH - totalWidth) / 2 + boxWidth / 2;
    const y = 370;

    CHARACTERS.forEach((char, index) => {
      const x = startX + index * (boxWidth + spacing);

      const box = this.add.rectangle(x, y, boxWidth, 180, 0x222222)
        .setInteractive({ useHandCursor: true })
        .setStrokeStyle(2, char.color)
        .on('pointerover', () => { box.setStrokeStyle(4, 0xffff00); box.setFillStyle(0x333333); })
        .on('pointerout', () => { box.setStrokeStyle(2, char.color); box.setFillStyle(0x222222); })
        .on('pointerdown', () => this.selectCharacter(char));

      // Character preview sprite
      this.add.image(x, y - 20, `char_${char.id}`).setScale(1.5);

      // Character name
      this.add.text(x, y + 70, char.name, {
        fontFamily: 'Courier New', fontSize: '18px', color: '#ffffff', fontStyle: 'bold',
      }).setOrigin(0.5);
    });
  }

  private selectCharacter(char: CharacterDef): void {
    if (this.selectingPlayer === 1) {
      if (this.playerCount === 2) {
        // Need P2 selection next
        this.scene.restart({ playerCount: this.playerCount, character1: char });
      } else {
        // 1 player - go to mode select
        this.scene.start('ModeSelectScene', {
          playerCount: 1,
          character1: char,
        });
      }
    } else {
      // P2 selected - go to mode select
      this.scene.start('ModeSelectScene', {
        playerCount: this.playerCount,
        character1: this.character1,
        character2: char,
      });
    }
  }
}
```

**Step 2: Test**

Run: `npm run dev`
Expected: After player count, shows character selection. In 2-player mode, shows "EZRA" then "RONEN" screens.

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add character selection scene with 2-player support"
```

---

### Task 6: Mode Select and Title Scenes

**Files:**
- Create: `ezra-phaser/src/scenes/ModeSelectScene.ts`
- Create: `ezra-phaser/src/scenes/TitleScene.ts`

Reference: Mode selection in `game.html` lines ~592-698, title screen lines ~700-735

**Step 1: Create ModeSelectScene**

Handles Adventure vs Practice mode selection. Stores all game data in registry for other scenes.

```typescript
// src/scenes/ModeSelectScene.ts
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, MAX_HEALTH, STARTING_LIVES } from '../config/constants';
import { CharacterDef, GameData } from '../config/types';

export class ModeSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ModeSelectScene' });
  }

  init(data: { playerCount: number; character1: CharacterDef; character2?: CharacterDef }): void {
    // Initialize shared game data in registry
    const gameData: GameData = {
      playerCount: data.playerCount as 1 | 2,
      character1: data.character1,
      character2: data.character2,
      isPracticeMode: false,
      score: 0,
      lives: STARTING_LIVES,
      health: MAX_HEALTH,
      currentDimension: 0,
    };
    this.registry.set('gameData', gameData);
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#000000');

    // Stars
    for (let i = 0; i < 80; i++) {
      this.add.rectangle(
        Phaser.Math.Between(0, GAME_WIDTH), Phaser.Math.Between(0, GAME_HEIGHT),
        Phaser.Math.Between(1, 2), Phaser.Math.Between(1, 2), 0xffffff
      );
    }

    this.add.text(GAME_WIDTH / 2, 150, 'CHOOSE YOUR MODE', {
      fontFamily: 'Courier New', fontSize: '48px', color: '#00ff00', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Character previews
    const gameData = this.registry.get('gameData') as GameData;
    this.add.image(GAME_WIDTH / 2, 250, `char_${gameData.character1.id}`).setScale(2);
    if (gameData.character2) {
      this.add.image(GAME_WIDTH / 2 + 80, 250, `char_${gameData.character2.id}`).setScale(2);
    }

    // Adventure button
    this.createModeButton(GAME_WIDTH / 2 - 200, 400, 'START\nADVENTURE', 0x00ff00, () => {
      const gd = this.registry.get('gameData') as GameData;
      gd.isPracticeMode = false;
      this.registry.set('gameData', gd);
      this.scene.start('TitleScene');
    });

    // Practice button
    this.createModeButton(GAME_WIDTH / 2 + 200, 400, 'PRACTICE\nMUSEUM', 0xcc00ff, () => {
      const gd = this.registry.get('gameData') as GameData;
      gd.isPracticeMode = true;
      gd.lives = 999;
      this.registry.set('gameData', gd);
      this.scene.start('PracticeScene');
      this.scene.launch('HUDScene');
    });

    // Instructions
    this.add.text(GAME_WIDTH / 2, 520, 'Adventure: Full game with bosses and puzzles', {
      fontFamily: 'Courier New', fontSize: '18px', color: '#ffffff',
    }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 550, 'Practice: Spawn enemies and test all weapons', {
      fontFamily: 'Courier New', fontSize: '18px', color: '#ffffff',
    }).setOrigin(0.5);
  }

  private createModeButton(x: number, y: number, label: string, color: number, onClick: () => void): void {
    const btn = this.add.rectangle(x, y, 300, 100, color)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0xffffff)
      .on('pointerover', () => btn.setStrokeStyle(4, 0xffff00))
      .on('pointerout', () => btn.setStrokeStyle(2, 0xffffff))
      .on('pointerdown', onClick);

    this.add.text(x, y, label, {
      fontFamily: 'Courier New', fontSize: '24px', color: '#000000', fontStyle: 'bold', align: 'center',
    }).setOrigin(0.5);
  }
}
```

**Step 2: Create TitleScene**

```typescript
// src/scenes/TitleScene.ts
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants';
import { DIMENSION_ORDER } from '../config/dimensions';
import { GameData } from '../config/types';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#000000');

    // Stars
    for (let i = 0; i < 100; i++) {
      this.add.rectangle(
        Phaser.Math.Between(0, GAME_WIDTH), Phaser.Math.Between(0, GAME_HEIGHT),
        Phaser.Math.Between(1, 3), Phaser.Math.Between(1, 3), 0xffffff
      );
    }

    this.add.text(GAME_WIDTH / 2, 180, "EZRA'S", {
      fontFamily: 'Courier New', fontSize: '56px', color: '#00ff00', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 250, 'SPACE ADVENTURE', {
      fontFamily: 'Courier New', fontSize: '56px', color: '#00ff00', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Character preview
    const gameData = this.registry.get('gameData') as GameData;
    this.add.image(GAME_WIDTH / 2, 370, `char_${gameData.character1.id}`).setScale(2);
    if (gameData.character2) {
      this.add.image(GAME_WIDTH / 2 + 80, 370, `char_${gameData.character2.id}`).setScale(2);
    }

    // Blinking "Press SPACEBAR" text
    const startText = this.add.text(GAME_WIDTH / 2, 500, 'Press SPACEBAR to Start!', {
      fontFamily: 'Courier New', fontSize: '28px', color: '#ffff00',
    }).setOrigin(0.5);
    this.tweens.add({
      targets: startText, alpha: 0, duration: 500, yoyo: true, repeat: -1,
    });

    // Controls hint
    this.add.text(GAME_WIDTH / 2, 570, 'Arrow Keys = Move | Space = Shoot | 1-4 = Switch Weapons', {
      fontFamily: 'Courier New', fontSize: '18px', color: '#ffffff',
    }).setOrigin(0.5);

    // Start on spacebar
    this.input.keyboard!.on('keydown-SPACE', () => {
      const firstDim = DIMENSION_ORDER[0]!;
      this.scene.start(firstDim.sceneKey, { dimensionIndex: 0 });
      this.scene.launch('HUDScene');
    });
  }
}
```

**Step 3: Register all scenes in main.ts**

Update the scene array: `[BootScene, PlayerCountScene, CharacterSelectScene, ModeSelectScene, TitleScene]`

**Step 4: Test full menu flow**

Run: `npm run dev`
Expected: PlayerCount → CharacterSelect (P1, then P2 if 2-player) → ModeSelect → TitleScene → Space starts game (will error since game scenes don't exist yet)

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add mode select and title scenes, complete menu flow"
```

---

## Phase 3: Core Gameplay

### Task 7: Player Entity with Physics

**Files:**
- Create: `ezra-phaser/src/entities/Player.ts`

Reference: `src/entities/Player.js`, `src/entities/Entity.js`

**Step 1: Create Player class**

```typescript
// src/entities/Player.ts
import Phaser from 'phaser';
import { CharacterDef } from '../config/types';
import { NORMAL_SPEED, PLAYER_WIDTH, PLAYER_HEIGHT, GAME_WIDTH, GAME_HEIGHT } from '../config/constants';

export class Player extends Phaser.Physics.Arcade.Sprite {
  public powerups: number = 0;
  public playerSpeed: number = NORMAL_SPEED;
  public characterDef: CharacterDef;
  public weapon: any = null; // Will be typed properly when weapons are added
  public inventory: any[] = [];
  public isPlayer2: boolean;

  constructor(scene: Phaser.Scene, x: number, y: number, characterDef: CharacterDef, isPlayer2 = false) {
    super(scene, x, y, `char_${characterDef.id}`);
    this.characterDef = characterDef;
    this.isPlayer2 = isPlayer2;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Physics body setup
    this.setCollideWorldBounds(true);
    this.body!.setSize(PLAYER_WIDTH, PLAYER_HEIGHT);
  }

  addPowerup(): void {
    this.powerups++;
  }

  removePowerup(): void {
    if (this.powerups > 0) this.powerups--;
  }
}
```

**Step 2: Commit**

```bash
git add .
git commit -m "feat: add Player entity with Phaser physics"
```

---

### Task 8: Weapon Base Class and Ezra's Weapons

**Files:**
- Create: `ezra-phaser/src/weapons/Weapon.ts`
- Create: `ezra-phaser/src/weapons/IceShooter.ts`
- Create: `ezra-phaser/src/weapons/FireShooter.ts`
- Create: `ezra-phaser/src/weapons/GiantSword.ts`
- Create: `ezra-phaser/src/weapons/BigBomb.ts`

Reference: `src/weapons/Weapon.js`, `src/weapons/EzraWeapons.js`

**Step 1: Create Weapon base class**

```typescript
// src/weapons/Weapon.ts
import Phaser from 'phaser';
import { Player } from '../entities/Player';

export abstract class Weapon {
  public name: string;
  public damage: number;
  public cooldown: number; // ms
  public color: number;
  public emoji: string;
  protected scene: Phaser.Scene;
  protected bulletGroup: Phaser.Physics.Arcade.Group;

  constructor(scene: Phaser.Scene, name: string, damage: number, cooldown: number, color: number, emoji: string) {
    this.scene = scene;
    this.name = name;
    this.damage = damage;
    this.cooldown = cooldown;
    this.color = color;
    this.emoji = emoji;
    this.bulletGroup = scene.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
      runChildUpdate: true,
      maxSize: 50,
    });
  }

  abstract fire(shooter: Player, dirX: number, dirY: number): void;

  getEffectiveDamage(shooter: Player): number {
    return this.damage + shooter.powerups;
  }

  getBulletGroup(): Phaser.Physics.Arcade.Group {
    return this.bulletGroup;
  }
}
```

**Step 2: Create IceShooter**

```typescript
// src/weapons/IceShooter.ts
import { Weapon } from './Weapon';
import { Player } from '../entities/Player';

export class IceShooter extends Weapon {
  constructor(scene: Phaser.Scene) {
    super(scene, 'Ice Shooter', 8, 80, 0x00ffff, '❄️');
  }

  fire(shooter: Player, dirX: number, dirY: number): void {
    const speed = 600;
    const len = Math.sqrt(dirX * dirX + dirY * dirY);
    if (len === 0) return;

    const bullet = this.bulletGroup.create(
      shooter.x, shooter.y - shooter.height / 2, 'proj_ice'
    ) as Phaser.Physics.Arcade.Sprite;

    if (!bullet) return;
    bullet.setActive(true).setVisible(true);
    bullet.setVelocity((dirX / len) * speed, (dirY / len) * speed);
    bullet.setData('damage', this.getEffectiveDamage(shooter));

    // Auto-destroy when off screen
    this.scene.time.delayedCall(3000, () => {
      if (bullet.active) { bullet.destroy(); }
    });
  }
}
```

**Step 3: Create FireShooter (triple shot)**

```typescript
// src/weapons/FireShooter.ts
import { Weapon } from './Weapon';
import { Player } from '../entities/Player';

export class FireShooter extends Weapon {
  constructor(scene: Phaser.Scene) {
    super(scene, 'Fire Shooter', 6, 120, 0xff6600, '🔥');
  }

  fire(shooter: Player, dirX: number, dirY: number): void {
    const speed = 500;
    const len = Math.sqrt(dirX * dirX + dirY * dirY);
    if (len === 0) return;
    const ndx = dirX / len;
    const ndy = dirY / len;

    // Triple shot: center + two angled
    const spread = 0.3;
    const angles = [0, -spread, spread];

    angles.forEach(offset => {
      const cos = Math.cos(offset);
      const sin = Math.sin(offset);
      const vx = (ndx * cos - ndy * sin) * speed;
      const vy = (ndx * sin + ndy * cos) * speed;

      const bullet = this.bulletGroup.create(
        shooter.x, shooter.y - shooter.height / 2, 'proj_fire'
      ) as Phaser.Physics.Arcade.Sprite;
      if (!bullet) return;
      bullet.setActive(true).setVisible(true);
      bullet.setVelocity(vx, vy);
      bullet.setData('damage', this.getEffectiveDamage(shooter));

      this.scene.time.delayedCall(2000, () => {
        if (bullet.active) bullet.destroy();
      });
    });
  }
}
```

**Step 4: Create GiantSword (melee arc)**

```typescript
// src/weapons/GiantSword.ts
import { Weapon } from './Weapon';
import { Player } from '../entities/Player';

export class GiantSword extends Weapon {
  constructor(scene: Phaser.Scene) {
    super(scene, 'Giant Sword', 25, 300, 0xaaaaff, '⚔️');
  }

  fire(shooter: Player, dirX: number, dirY: number): void {
    const len = Math.sqrt(dirX * dirX + dirY * dirY);
    const ndx = len === 0 ? 0 : dirX / len;
    const ndy = len === 0 ? -1 : dirY / len;

    // Create a melee hitbox in front of player
    const hitbox = this.bulletGroup.create(
      shooter.x + ndx * 40, shooter.y + ndy * 40, 'proj_sword'
    ) as Phaser.Physics.Arcade.Sprite;
    if (!hitbox) return;

    hitbox.setActive(true).setVisible(true);
    hitbox.setVelocity(0, 0); // Stays in place
    hitbox.setData('damage', this.getEffectiveDamage(shooter));
    hitbox.setAlpha(0.7);

    // Brief lifetime
    this.scene.time.delayedCall(200, () => {
      if (hitbox.active) hitbox.destroy();
    });
  }
}
```

**Step 5: Create BigBomb**

```typescript
// src/weapons/BigBomb.ts
import { Weapon } from './Weapon';
import { Player } from '../entities/Player';

export class BigBomb extends Weapon {
  constructor(scene: Phaser.Scene) {
    super(scene, 'Big Bomb', 40, 500, 0xff4400, '💣');
  }

  fire(shooter: Player, dirX: number, dirY: number): void {
    const speed = 300;
    const len = Math.sqrt(dirX * dirX + dirY * dirY);
    const ndx = len === 0 ? 0 : dirX / len;
    const ndy = len === 0 ? -1 : dirY / len;

    const bomb = this.bulletGroup.create(
      shooter.x, shooter.y - shooter.height / 2, 'proj_bomb'
    ) as Phaser.Physics.Arcade.Sprite;
    if (!bomb) return;
    bomb.setActive(true).setVisible(true);
    bomb.setVelocity(ndx * speed, ndy * speed);
    bomb.setData('damage', this.getEffectiveDamage(shooter));

    // Explode after delay - create expanding explosion hitbox
    this.scene.time.delayedCall(800, () => {
      if (!bomb.active) return;
      const ex = bomb.x;
      const ey = bomb.y;
      bomb.destroy();

      // Create explosion area
      const explosion = this.bulletGroup.create(ex, ey, 'proj_bomb') as Phaser.Physics.Arcade.Sprite;
      if (!explosion) return;
      explosion.setActive(true).setVisible(true);
      explosion.setVelocity(0, 0);
      explosion.setScale(4);
      explosion.setAlpha(0.6);
      explosion.setTint(0xff4400);
      explosion.setData('damage', this.getEffectiveDamage(shooter) * 2);

      // Camera shake
      this.scene.cameras.main.shake(200, 0.01);

      this.scene.time.delayedCall(300, () => {
        if (explosion.active) explosion.destroy();
      });
    });
  }
}
```

**Step 6: Commit**

```bash
git add .
git commit -m "feat: add weapon base class and Ezra's 4 weapons"
```

---

### Task 9: Collection Scene (First Playable Level)

**Files:**
- Create: `ezra-phaser/src/scenes/CollectionScene.ts`
- Create: `ezra-phaser/src/entities/ChasingEnemy.ts`
- Create: `ezra-phaser/src/entities/PowerUp.ts`
- Create: `ezra-phaser/src/entities/StageHazard.ts`
- Create: `ezra-phaser/src/entities/DamageTrap.ts`

Reference: `src/dimensions/CollectionDimension.js`, `src/entities/ChasingEnemy.js`, `src/entities/PowerUp.js`, `src/entities/SpecialPowerUps.js`, `src/entities/StageHazards.js`, `src/entities/DamageTrap.js`

This is the first fully playable scene. It includes:
- Player movement and shooting
- Power-up spawning and collection
- Chasing enemies that spawn as you collect
- Stage hazards (lava, trampoline, ice)
- Damage traps
- Dimension completion when enough power-ups collected

**Step 1: Create ChasingEnemy**

```typescript
// src/entities/ChasingEnemy.ts
import Phaser from 'phaser';

export class ChasingEnemy extends Phaser.Physics.Arcade.Sprite {
  private chaseSpeed: number = 150;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'enemy_chaser');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
  }

  chaseTarget(target: Phaser.Physics.Arcade.Sprite): void {
    this.scene.physics.moveToObject(this, target, this.chaseSpeed);
  }
}
```

**Step 2: Create PowerUp**

```typescript
// src/entities/PowerUp.ts
import Phaser from 'phaser';

export type PowerUpType = 'regular' | 'speed' | 'life' | 'shield' | 'health';

export class PowerUp extends Phaser.Physics.Arcade.Sprite {
  public powerUpType: PowerUpType;
  public healAmount: number;
  public duration: number;

  constructor(scene: Phaser.Scene, x: number, y: number, type: PowerUpType = 'regular') {
    const textureKey = type === 'regular' ? 'powerup_star' :
      type === 'speed' ? 'powerup_speed' :
      type === 'life' ? 'powerup_life' :
      type === 'shield' ? 'powerup_shield' : 'powerup_health';

    super(scene, x, y, textureKey);
    this.powerUpType = type;
    this.healAmount = 30;
    this.duration = 600; // frames equivalent → will convert to ms in scene

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Floating animation
    scene.tweens.add({
      targets: this, y: y - 8, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // Pulsing
    scene.tweens.add({
      targets: this, scaleX: 1.2, scaleY: 1.2, duration: 500, yoyo: true, repeat: -1,
    });
  }
}
```

**Step 3: Create StageHazard**

```typescript
// src/entities/StageHazard.ts
import Phaser from 'phaser';

export type HazardType = 'lava' | 'trampoline' | 'ice';

export class StageHazard extends Phaser.Physics.Arcade.Sprite {
  public hazardType: HazardType;
  public damageAmount: number;
  public bounceForce: number;
  public slipperiness: number;

  constructor(scene: Phaser.Scene, x: number, y: number, type: HazardType) {
    const textureKey = `hazard_${type}`;
    super(scene, x, y, textureKey);
    this.hazardType = type;
    this.damageAmount = type === 'lava' ? 5 : 0;
    this.bounceForce = type === 'trampoline' ? 600 : 0;
    this.slipperiness = type === 'ice' ? 1.05 : 1;

    scene.add.existing(this);
    scene.physics.add.existing(this, true); // Static body
  }
}
```

**Step 4: Create DamageTrap**

```typescript
// src/entities/DamageTrap.ts
import Phaser from 'phaser';

export class DamageTrap extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'damage_trap');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Same floating animation as powerups to be deceptive
    scene.tweens.add({
      targets: this, y: y - 8, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
  }
}
```

**Step 5: Create CollectionScene**

This is the biggest scene - it wires together player input, shooting, collision detection, power-up spawning, enemies, and hazards. Port from `CollectionDimension.js` and the game loop in `game.html`.

```typescript
// src/scenes/CollectionScene.ts
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, NORMAL_SPEED, SHOOT_RATE, MAX_HEALTH, INVULNERABLE_DURATION, RESPAWN_INVULNERABLE } from '../config/constants';
import { DIMENSION_ORDER } from '../config/dimensions';
import { GameData } from '../config/types';
import { Player } from '../entities/Player';
import { ChasingEnemy } from '../entities/ChasingEnemy';
import { PowerUp } from '../entities/PowerUp';
import { StageHazard } from '../entities/StageHazard';
import { DamageTrap } from '../entities/DamageTrap';
import { IceShooter } from '../weapons/IceShooter';
import { FireShooter } from '../weapons/FireShooter';
import { GiantSword } from '../weapons/GiantSword';
import { BigBomb } from '../weapons/BigBomb';
import { Weapon } from '../weapons/Weapon';

export class CollectionScene extends Phaser.Scene {
  private player1!: Player;
  private player2?: Player;
  private gameData!: GameData;

  // Input
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private shootKey!: Phaser.Input.Keyboard.Key;
  private tabKey!: Phaser.Input.Keyboard.Key;

  // Groups
  private enemyGroup!: Phaser.Physics.Arcade.Group;
  private powerUpGroup!: Phaser.Physics.Arcade.Group;
  private hazardGroup!: Phaser.Physics.Arcade.Group;
  private trapGroup!: Phaser.Physics.Arcade.Group;

  // State
  private invulnerableUntil: number = 0;
  private shieldUntil: number = 0;
  private speedBoostUntil: number = 0;
  private lastShotTime: number = 0;
  private collected: number = 0;
  private requiredCollect: number = 10;
  private p1WeaponIndex: number = 0;
  private p2WeaponIndex: number = 0;
  private p1Weapons: Weapon[] = [];
  private p2Weapons: Weapon[] = [];

  constructor() {
    super({ key: 'CollectionScene' });
  }

  create(): void {
    this.gameData = this.registry.get('gameData') as GameData;
    this.cameras.main.setBackgroundColor('#000000');

    // Create players
    this.player1 = new Player(this, GAME_WIDTH / 2, GAME_HEIGHT / 2, this.gameData.character1);
    this.p1Weapons = [
      new IceShooter(this), new FireShooter(this), new GiantSword(this), new BigBomb(this),
    ];
    this.player1.weapon = this.p1Weapons[0];
    this.player1.inventory = this.p1Weapons;

    if (this.gameData.playerCount === 2 && this.gameData.character2) {
      this.player2 = new Player(this, GAME_WIDTH / 2 + 60, GAME_HEIGHT / 2 + 30, this.gameData.character2, true);
      this.p2Weapons = [
        new IceShooter(this), new FireShooter(this), new GiantSword(this), new BigBomb(this),
      ];
      this.player2.weapon = this.p2Weapons[0];
      this.player2.inventory = this.p2Weapons;
    }

    // Groups
    this.enemyGroup = this.physics.add.group();
    this.powerUpGroup = this.physics.add.group();
    this.hazardGroup = this.physics.add.staticGroup();
    this.trapGroup = this.physics.add.group();

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as Record<string, Phaser.Input.Keyboard.Key>;
    this.shootKey = this.input.keyboard!.addKey('SPACE');
    this.tabKey = this.input.keyboard!.addKey('TAB');

    // Weapon switching
    this.input.keyboard!.on('keydown-ONE', () => this.switchWeapon(1, 0));
    this.input.keyboard!.on('keydown-TWO', () => this.switchWeapon(1, 1));
    this.input.keyboard!.on('keydown-THREE', () => this.switchWeapon(1, 2));
    this.input.keyboard!.on('keydown-FOUR', () => this.switchWeapon(1, 3));
    this.input.keyboard!.on('keydown-Q', () => this.switchWeapon(2, 0));
    this.input.keyboard!.on('keydown-E', () => this.switchWeapon(2, 1));
    this.input.keyboard!.on('keydown-R', () => this.switchWeapon(2, 2));
    this.input.keyboard!.on('keydown-T', () => this.switchWeapon(2, 3));

    // Spawn initial power-ups and hazards
    this.spawnPowerUps(10);
    this.spawnHazards();
    this.spawnTraps(3);

    // Set up collisions
    this.setupCollisions();

    // Emit scene-ready event for HUD
    this.events.emit('sceneReady', { sceneName: 'CollectionScene' });
  }

  private setupCollisions(): void {
    const players = [this.player1, this.player2].filter(Boolean) as Player[];

    players.forEach(p => {
      // Player vs power-ups
      this.physics.add.overlap(p, this.powerUpGroup, (_, powerup) => {
        this.collectPowerUp(p, powerup as PowerUp);
      });

      // Player vs traps
      this.physics.add.overlap(p, this.trapGroup, (_, trap) => {
        this.hitTrap(p, trap as DamageTrap);
      });

      // Player vs enemies
      this.physics.add.overlap(p, this.enemyGroup, (_, enemy) => {
        this.hitByEnemy(p);
      });

      // Player vs hazards
      this.physics.add.overlap(p, this.hazardGroup, (_, hazard) => {
        this.hitHazard(p, hazard as StageHazard);
      });
    });

    // Player bullets vs enemies
    this.p1Weapons.forEach(w => {
      this.physics.add.overlap(w.getBulletGroup(), this.enemyGroup, (bullet, enemy) => {
        const b = bullet as Phaser.Physics.Arcade.Sprite;
        const e = enemy as ChasingEnemy;
        e.destroy();
        b.destroy();
        this.gameData.score += 50;
        this.cameras.main.shake(100, 0.005);
      });
    });

    if (this.p2Weapons.length > 0) {
      this.p2Weapons.forEach(w => {
        this.physics.add.overlap(w.getBulletGroup(), this.enemyGroup, (bullet, enemy) => {
          (enemy as ChasingEnemy).destroy();
          (bullet as Phaser.Physics.Arcade.Sprite).destroy();
          this.gameData.score += 50;
        });
      });
    }
  }

  update(time: number, delta: number): void {
    // Player 1 movement
    let vx = 0, vy = 0;
    if (this.cursors.left.isDown) vx = -this.player1.playerSpeed;
    if (this.cursors.right.isDown) vx = this.player1.playerSpeed;
    if (this.cursors.up.isDown) vy = -this.player1.playerSpeed;
    if (this.cursors.down.isDown) vy = this.player1.playerSpeed;
    this.player1.setVelocity(vx, vy);

    // Player 1 shooting
    let shootDirX = 0, shootDirY = 0;
    let shouldShoot = false;
    if (this.shootKey.isDown) { shouldShoot = true; shootDirY = -1; }
    if (this.wasd['W'].isDown) { shouldShoot = true; shootDirY = -1; }
    if (this.wasd['S'].isDown) { shouldShoot = true; shootDirY = 1; }
    if (this.wasd['A'].isDown) { shouldShoot = true; shootDirX = -1; }
    if (this.wasd['D'].isDown) { shouldShoot = true; shootDirX = 1; }

    if (shouldShoot && time > this.lastShotTime + SHOOT_RATE && this.player1.weapon) {
      this.player1.weapon.fire(this.player1, shootDirX, shootDirY);
      this.lastShotTime = time;
    }

    // Player 2 AI follow + shooting
    if (this.player2) {
      const dx = this.player1.x - this.player2.x;
      const dy = this.player1.y - this.player2.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 70) {
        this.physics.moveToObject(this.player2, this.player1, this.player2.playerSpeed);
      } else {
        this.player2.setVelocity(this.player1.body!.velocity.x, this.player1.body!.velocity.y);
      }

      if (this.tabKey.isDown && time > this.lastShotTime + SHOOT_RATE && this.player2.weapon) {
        // Smart auto-aim
        const nearest = this.findNearestEnemy(this.player2);
        let p2dx = 0, p2dy = -1;
        if (nearest) {
          const edx = nearest.x - this.player2.x;
          const edy = nearest.y - this.player2.y;
          const elen = Math.sqrt(edx * edx + edy * edy);
          p2dx = edx / elen; p2dy = edy / elen;
        }
        this.player2.weapon.fire(this.player2, p2dx, p2dy);
        this.lastShotTime = time;
      }
    }

    // Enemies chase player 1
    this.enemyGroup.getChildren().forEach(child => {
      (child as ChasingEnemy).chaseTarget(this.player1);
    });

    // Invulnerability flash
    const isInvulnerable = time < this.invulnerableUntil;
    if (isInvulnerable) {
      this.player1.setAlpha(Math.floor(time / 80) % 2 === 0 ? 1 : 0.3);
      if (this.player2) this.player2.setAlpha(this.player1.alpha);
    } else {
      this.player1.setAlpha(1);
      if (this.player2) this.player2.setAlpha(1);
    }

    // Speed boost timer
    if (time > this.speedBoostUntil && this.player1.playerSpeed !== NORMAL_SPEED) {
      this.player1.playerSpeed = NORMAL_SPEED;
      if (this.player2) this.player2.playerSpeed = NORMAL_SPEED;
    }

    // Check completion
    if (this.collected >= this.requiredCollect) {
      this.completeLevel();
    }

    // Update registry for HUD
    this.registry.set('gameData', this.gameData);
  }

  private findNearestEnemy(fromPlayer: Player): Phaser.Physics.Arcade.Sprite | null {
    let nearest: Phaser.Physics.Arcade.Sprite | null = null;
    let minDist = 400;
    this.enemyGroup.getChildren().forEach(child => {
      const enemy = child as Phaser.Physics.Arcade.Sprite;
      const dist = Phaser.Math.Distance.Between(fromPlayer.x, fromPlayer.y, enemy.x, enemy.y);
      if (dist < minDist) { minDist = dist; nearest = enemy; }
    });
    return nearest;
  }

  private collectPowerUp(player: Player, powerup: PowerUp): void {
    const type = powerup.powerUpType;
    if (type === 'speed') {
      this.speedBoostUntil = this.time.now + 10000;
      this.player1.playerSpeed = 480;
      if (this.player2) this.player2.playerSpeed = 480;
    } else if (type === 'life') {
      this.gameData.lives++;
    } else if (type === 'shield') {
      this.shieldUntil = this.time.now + 10000;
    } else if (type === 'health') {
      this.gameData.health = Math.min(MAX_HEALTH, this.gameData.health + 30);
    } else {
      player.addPowerup();
    }

    this.collected++;
    this.gameData.score += 50;
    powerup.destroy();

    // Spawn a chasing enemy every 3 collections
    if (this.collected % 3 === 0) {
      this.spawnEnemy();
    }
  }

  private hitTrap(_player: Player, trap: DamageTrap): void {
    trap.destroy();
    // Lose 3 powerups
    this.player1.removePowerup(); this.player1.removePowerup(); this.player1.removePowerup();
    this.cameras.main.flash(200, 255, 0, 0);
  }

  private hitByEnemy(player: Player): void {
    if (this.time.now < this.invulnerableUntil) return;
    if (this.time.now < this.shieldUntil) return;

    this.gameData.health -= 15;
    this.invulnerableUntil = this.time.now + INVULNERABLE_DURATION;
    this.cameras.main.shake(100, 0.01);

    if (this.gameData.health <= 0) this.handleDeath();
  }

  private hitHazard(player: Player, hazard: StageHazard): void {
    if (hazard.hazardType === 'lava' && this.time.now >= this.invulnerableUntil) {
      this.gameData.health -= hazard.damageAmount;
      this.invulnerableUntil = this.time.now + 500;
      if (this.gameData.health <= 0) this.handleDeath();
    } else if (hazard.hazardType === 'trampoline') {
      player.setVelocityY(-hazard.bounceForce);
    } else if (hazard.hazardType === 'ice') {
      // Ice effect handled by velocity multiplication is tricky with Arcade.
      // Instead: increase speed temporarily in that direction
      player.setVelocity(player.body!.velocity.x * 1.05, player.body!.velocity.y * 1.05);
    }
  }

  private handleDeath(): void {
    this.gameData.lives--;
    if (this.gameData.lives <= 0) {
      this.scene.stop('HUDScene');
      this.scene.start('PlayerCountScene'); // Restart game
    } else {
      this.gameData.health = MAX_HEALTH;
      this.player1.setPosition(GAME_WIDTH / 2, GAME_HEIGHT / 2);
      if (this.player2) this.player2.setPosition(GAME_WIDTH / 2 + 60, GAME_HEIGHT / 2 + 30);
      this.invulnerableUntil = this.time.now + RESPAWN_INVULNERABLE;
    }
  }

  private completeLevel(): void {
    this.gameData.currentDimension++;
    this.registry.set('gameData', this.gameData);

    const nextDim = DIMENSION_ORDER[this.gameData.currentDimension];
    if (nextDim) {
      this.cameras.main.fade(500, 0, 0, 0, false, (_cam: any, progress: number) => {
        if (progress === 1) {
          this.scene.start(nextDim.sceneKey, { dimensionIndex: this.gameData.currentDimension });
        }
      });
    } else {
      this.scene.start('VictoryScene');
    }
  }

  private switchWeapon(playerNum: 1 | 2, index: number): void {
    if (playerNum === 1 && index < this.p1Weapons.length) {
      this.p1WeaponIndex = index;
      this.player1.weapon = this.p1Weapons[index];
    } else if (playerNum === 2 && this.player2 && index < this.p2Weapons.length) {
      this.p2WeaponIndex = index;
      this.player2.weapon = this.p2Weapons[index];
    }
  }

  private spawnPowerUps(count: number): void {
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(50, GAME_WIDTH - 50);
      const y = Phaser.Math.Between(100, GAME_HEIGHT - 50);
      // 80% regular, 5% each special
      const rand = Math.random();
      const type = rand < 0.8 ? 'regular' : rand < 0.85 ? 'speed' : rand < 0.9 ? 'shield' : rand < 0.95 ? 'health' : 'life';
      this.powerUpGroup.add(new PowerUp(this, x, y, type as any));
    }
  }

  private spawnHazards(): void {
    // A few of each type
    for (let i = 0; i < 2; i++) {
      this.hazardGroup.add(new StageHazard(this, Phaser.Math.Between(100, GAME_WIDTH - 100), Phaser.Math.Between(200, GAME_HEIGHT - 100), 'lava'));
      this.hazardGroup.add(new StageHazard(this, Phaser.Math.Between(100, GAME_WIDTH - 100), Phaser.Math.Between(200, GAME_HEIGHT - 100), 'trampoline'));
      this.hazardGroup.add(new StageHazard(this, Phaser.Math.Between(100, GAME_WIDTH - 100), Phaser.Math.Between(200, GAME_HEIGHT - 100), 'ice'));
    }
  }

  private spawnTraps(count: number): void {
    for (let i = 0; i < count; i++) {
      this.trapGroup.add(new DamageTrap(this, Phaser.Math.Between(50, GAME_WIDTH - 50), Phaser.Math.Between(100, GAME_HEIGHT - 50)));
    }
  }

  private spawnEnemy(): void {
    const edges = [
      { x: Phaser.Math.Between(0, GAME_WIDTH), y: 0 },
      { x: GAME_WIDTH, y: Phaser.Math.Between(0, GAME_HEIGHT) },
      { x: Phaser.Math.Between(0, GAME_WIDTH), y: GAME_HEIGHT },
      { x: 0, y: Phaser.Math.Between(0, GAME_HEIGHT) },
    ];
    const edge = Phaser.Math.RND.pick(edges);
    this.enemyGroup.add(new ChasingEnemy(this, edge.x, edge.y));
  }
}
```

**Step 6: Register CollectionScene in main.ts**

Add to scene array.

**Step 7: Test first playable level**

Run: `npm run dev`
Expected: Full menu flow → Adventure → first level with power-ups, hazards, enemies. Player moves, shoots, collects power-ups. Enemies chase. Level completes after 10 collections.

**Step 8: Commit**

```bash
git add .
git commit -m "feat: add CollectionScene - first fully playable level"
```

---

### Task 10: HUD Overlay Scene

**Files:**
- Create: `ezra-phaser/src/scenes/HUDScene.ts`

Reference: HUD rendering in `game.html` lines ~1150-1490

**Step 1: Create HUDScene**

The HUD runs as a parallel scene overlaying gameplay. It reads from the registry for game state.

Create `HUDScene.ts` that renders:
- Health bar (top left)
- Lives display
- Weapon selector for P1 (and P2 if 2-player)
- Player name labels (EZRA/RONEN) rendered above players
- Score display
- Active power-up timers
- Debug mode overlay

Use `this.scene.get('CollectionScene')` (or whichever gameplay scene is active) to access player positions for name labels.

**Step 2: Register in main.ts and test**

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add HUD overlay scene with health, weapons, and labels"
```

---

## Phase 4: Boss System

### Task 11: Boss Base Class and Alien Boss

**Files:**
- Create: `ezra-phaser/src/entities/Boss.ts`
- Create: `ezra-phaser/src/entities/AlienBoss.ts`

Reference: `src/entities/Boss.js`, `src/entities/AlienBoss.js`

Port the Boss base class with:
- Health + shield system
- Movement patterns
- Health bar rendering
- Projectile shooting

Port AlienBoss with:
- Chase behavior toward player
- Teleport ability
- Green blob projectiles
- Becomes ally when defeated

**Step 1: Create Boss base class**

**Step 2: Create AlienBoss extending Boss**

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add Boss base class and AlienBoss entity"
```

---

### Task 12: Boss Scene

**Files:**
- Create: `ezra-phaser/src/scenes/BossScene.ts`

Reference: `src/dimensions/BossDimension.js`

The BossScene is parameterized by boss type (alien, minidragon, dragon). It:
- Creates the boss based on type
- Handles boss projectiles
- Drops power-ups on boss defeat
- Shows victory message
- Advances to next dimension after delay

Wire up the same collision/input patterns from CollectionScene (extract shared logic into a mixin or base class if the repetition is significant).

**Step 1: Create BossScene**

**Step 2: Test boss fight**

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add BossScene with parameterized boss fights"
```

---

### Task 13: Dragon Boss Entities

**Files:**
- Create: `ezra-phaser/src/entities/DragonBoss.ts`
- Create: `ezra-phaser/src/entities/MiniDragonBoss.ts`

Reference: `src/entities/DragonBoss.js`

Port DragonBoss with:
- Phase 1: Circular movement, fireballs
- Phase 2 (health < 50%): Faster, burrow attack, more fireballs
- Large collision body

Port MiniDragonBoss with:
- Zigzag movement
- Simpler fireball pattern

**Step 1: Create DragonBoss**

**Step 2: Create MiniDragonBoss**

**Step 3: Test all 3 boss fights (use debug mode to jump to levels)**

**Step 4: Commit**

```bash
git add .
git commit -m "feat: add Dragon and MiniDragon boss entities"
```

---

## Phase 5: Math Puzzle & Practice

### Task 14: Math Puzzle Scene

**Files:**
- Create: `ezra-phaser/src/scenes/MathPuzzleScene.ts`

Reference: `src/dimensions/MathPuzzleDimension.js`

Port the math puzzle dimension. This is mostly UI - no physics needed. Uses Phaser text objects and keyboard input for number entry.

Features:
- 5 story-based math problems (add, multiply, subtract)
- Number input via keyboard
- Correct/incorrect feedback
- Advances to next dimension after solving all 5

**Step 1: Create MathPuzzleScene**

**Step 2: Test math puzzles**

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add math puzzle scene with story-based problems"
```

---

### Task 15: Practice Museum Scene

**Files:**
- Create: `ezra-phaser/src/scenes/PracticeScene.ts`

Reference: `src/dimensions/PracticeMuseumDimension.js`

Port the practice museum:
- Spawn buttons for different enemies (Alien, Alien Boss, Mini Dragon, Dragon, Clear All)
- Clickable button UI
- Museum tile background with pedestals
- All weapons available
- Unlimited lives

**Step 1: Create PracticeScene**

**Step 2: Test practice mode**

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add practice museum scene with enemy spawn buttons"
```

---

## Phase 6: Victory & Polish

### Task 16: Victory Scene

**Files:**
- Create: `ezra-phaser/src/scenes/VictoryScene.ts`

Reference: Victory screen in `game.html` lines ~1493-1554

Port the victory screen with animated stars, victory text, character display, and final score. Add Phaser improvements: particle emitter for fireworks, camera effects.

**Step 1: Create VictoryScene**

**Step 2: Commit**

```bash
git add .
git commit -m "feat: add victory scene with animated celebration"
```

---

### Task 17: Audio System

**Files:**
- Modify: `ezra-phaser/src/scenes/BootScene.ts` (preload audio)
- Create: `ezra-phaser/src/config/audio.ts`
- Create: `ezra-phaser/assets/audio/` (sound files)

Generate or source simple sound effects for:
- `shoot_ice` - short ice/ping sound
- `shoot_fire` - whoosh
- `shoot_bomb` - thud
- `sword_swing` - swoosh
- `hit_enemy` - impact
- `hit_player` - ouch
- `explosion` - boom
- `powerup_collect` - chime
- `boss_defeat` - fanfare
- `bgm_adventure` - looping background music
- `bgm_boss` - intense boss music

Use the Web Audio API to generate simple synth sounds programmatically if preferred over loading files. Phaser supports both approaches.

**Step 1: Create audio configuration**

**Step 2: Add sound triggers throughout scenes**

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add sound effects and background music"
```

---

### Task 18: Debug Mode

**Files:**
- Modify relevant scenes

Add debug mode (backtick toggle):
- Level jumping (1-5 keys)
- Full heal (0 key)
- Debug overlay showing current level, FPS
- Works across all gameplay scenes

**Step 1: Add debug key listener**

**Step 2: Commit**

```bash
git add .
git commit -m "feat: add debug mode with level jumping and healing"
```

---

### Task 19: Final Integration and Testing

**Files:**
- Modify: `ezra-phaser/src/main.ts` (ensure all scenes registered)
- Test: All game modes

**Step 1: Register all scenes in correct order**

Ensure main.ts has:
```typescript
scene: [BootScene, PlayerCountScene, CharacterSelectScene, ModeSelectScene, TitleScene,
        CollectionScene, BossScene, MathPuzzleScene, PracticeScene, VictoryScene, HUDScene]
```

**Step 2: Test 1-player Adventure mode end-to-end**

Walk through all 5 dimensions. Verify:
- [ ] Player count selection works
- [ ] Character selection works
- [ ] Mode selection works
- [ ] Title screen works
- [ ] Collection scene: movement, shooting, power-ups, enemies, hazards, traps
- [ ] Alien boss: fight, projectiles, becomes ally, victory
- [ ] Math puzzles: input, feedback, completion
- [ ] Mini Dragon: fight works
- [ ] Dragon Boss: 2 phases, victory
- [ ] Victory screen shows

**Step 3: Test 2-player mode**

- [ ] P2 follows P1
- [ ] Tab shoots with auto-aim
- [ ] Q/E/R/T weapon switching
- [ ] Shared health/lives
- [ ] Both players visible with labels

**Step 4: Test Practice mode**

- [ ] Spawn buttons work
- [ ] All enemy types spawn
- [ ] Clear all works

**Step 5: Fix any issues found**

**Step 6: Commit**

```bash
git add .
git commit -m "test: verify all game modes and fix integration issues"
```

---

### Task 20: Build and Deploy

**Files:**
- Modify: `ezra-phaser/vite.config.ts` (if needed for deployment)

**Step 1: Build production bundle**

Run: `npm run build`
Expected: `dist/` directory with optimized static files

**Step 2: Test production build**

Run: `npm run preview`
Expected: Game works identically to dev mode

**Step 3: Final commit**

```bash
git add .
git commit -m "feat: complete Phaser + TypeScript migration

- All 5 dimensions ported with Phaser Arcade Physics
- 2-player co-op mode with AI follow and smart shooting
- 4 weapon types with Phaser bullet groups
- HUD overlay scene
- Sound effects and camera effects
- Math puzzle and practice museum modes
- Debug mode with level jumping
- TypeScript strict mode, no any types

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Implementation Notes

**Shared Gameplay Logic:** Tasks 9, 12, and 15 (Collection, Boss, Practice scenes) share similar patterns for player input, shooting, collision detection, and 2-player behavior. Extract shared functionality into a base class or utility module as the repetition becomes apparent during implementation.

**Phaser Gotchas:**
- Phaser uses pixels/second for velocity (not pixels/frame) - all speeds multiplied by ~60
- `this.input.keyboard!` needs the `!` assertion because Phaser's types allow null
- Physics groups need `runChildUpdate: true` if children have custom update methods
- Texture keys must match between `generateTexture()` and `new Sprite(scene, x, y, key)`
- Scene data passes via `this.scene.start('SceneName', data)` and `init(data)`

**Testing Strategy:**
- Vitest for pure logic (math problem generation, damage calculations)
- Manual browser testing for visual/input (standard for games)
- Debug mode for quickly jumping to any level

**Migration vs Original:**
- Original `game.html` stays untouched - this is a separate `ezra-phaser/` directory
- Both versions can coexist in the repo
- Old version at root, new version in `ezra-phaser/`
