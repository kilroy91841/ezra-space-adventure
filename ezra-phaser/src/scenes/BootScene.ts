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

    // Alien boss
    this.generateTexture('boss_alien', 80, 80, (ctx) => {
      ctx.fillStyle = '#00ff00';
      ctx.beginPath();
      ctx.arc(40, 50, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(28, 42, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(52, 42, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(30, 42, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(54, 42, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(25, 25); ctx.lineTo(15, 5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(55, 25); ctx.lineTo(65, 5);
      ctx.stroke();
    });

    // Dragon boss
    this.generateTexture('boss_dragon', 140, 100, (ctx) => {
      ctx.fillStyle = '#ff4400';
      ctx.beginPath();
      ctx.ellipse(70, 60, 50, 35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff6600';
      ctx.beginPath();
      ctx.arc(120, 40, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffff00';
      ctx.beginPath();
      ctx.arc(125, 35, 5, 0, Math.PI * 2);
      ctx.fill();
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
