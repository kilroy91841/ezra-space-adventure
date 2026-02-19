// src/entities/AlienBoss.ts
import Phaser from 'phaser';
import { Boss } from './Boss';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants';

export class AlienBoss extends Boss {
  public isAlly: boolean = false;

  private teleportCooldownTimer: number = 0;
  private teleportCooldown: number = 5000;
  private isTeleporting: boolean = false;
  private playerRef?: Phaser.Physics.Arcade.Sprite;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'boss_alien', 'Alien Overlord', 80, 150);
    this.shootInterval = 1200;
  }

  updateMovement(time: number, delta: number, player: Phaser.Physics.Arcade.Sprite): void {
    this.playerRef = player;

    if (this.isAlly) {
      this.updateAllyMovement(player);
      return;
    }

    // Chase player
    this.scene.physics.moveToObject(this, player, this.bossSpeed);

    // Teleport logic
    if (!this.isTeleporting) {
      this.teleportCooldownTimer += delta;
      if (this.teleportCooldownTimer >= this.teleportCooldown && Math.random() < 0.02) {
        this.teleport(player);
      }
    }
  }

  private teleport(player: Phaser.Physics.Arcade.Sprite): void {
    this.isTeleporting = true;
    this.teleportCooldownTimer = 0;
    this.setAlpha(0.3);
    this.setVelocity(0, 0);

    // Teleport near player (100-200px away at random angle)
    const angle = Math.random() * Math.PI * 2;
    const distance = 100 + Math.random() * 100;
    const newX = Phaser.Math.Clamp(
      player.x + Math.cos(angle) * distance,
      50, GAME_WIDTH - 50,
    );
    const newY = Phaser.Math.Clamp(
      player.y + Math.sin(angle) * distance,
      50, GAME_HEIGHT - 50,
    );

    this.scene.time.delayedCall(500, () => {
      if (!this.active) return;
      this.setPosition(newX, newY);
      this.setAlpha(1);
      this.isTeleporting = false;
    });
  }

  private updateAllyMovement(player: Phaser.Physics.Arcade.Sprite): void {
    // Follow player at a distance, stay behind/above
    const targetX = player.x - 60;
    const targetY = player.y - 80;
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 30) {
      this.setVelocity(
        (dx / dist) * this.bossSpeed * 0.8,
        (dy / dist) * this.bossSpeed * 0.8,
      );
    } else {
      this.setVelocity(0, 0);
    }
  }

  shoot(): Phaser.Physics.Arcade.Sprite[] {
    if (!this.canShoot()) return [];

    const projectiles: Phaser.Physics.Arcade.Sprite[] = [];

    if (this.isAlly) {
      // Ally shoots downward to help player
      const proj = this.scene.physics.add.sprite(this.x, this.y + 20, 'proj_alien');
      proj.setVelocity(0, 400);
      proj.setData('damage', 10);
      proj.setData('isAllyProjectile', true);
      this.scene.time.delayedCall(3000, () => {
        if (proj.active) proj.destroy();
      });
      projectiles.push(proj);
    } else {
      // Enemy shoots green blob downward toward player
      const proj = this.scene.physics.add.sprite(this.x, this.y + 30, 'proj_alien');
      if (this.playerRef) {
        const angle = Phaser.Math.Angle.Between(this.x, this.y, this.playerRef.x, this.playerRef.y);
        proj.setVelocity(Math.cos(angle) * 300, Math.sin(angle) * 300);
      } else {
        proj.setVelocity(0, 300);
      }
      proj.setData('damage', 15);
      this.scene.time.delayedCall(4000, () => {
        if (proj.active) proj.destroy();
      });
      projectiles.push(proj);
    }

    return projectiles;
  }

  becomeAlly(): void {
    this.isAlly = true;
    this.defeated = false;
    this.bossHealth = this.maxHealth;
    // Change tint to lighter green to indicate friendly
    this.setTint(0x88ff88);
  }
}
