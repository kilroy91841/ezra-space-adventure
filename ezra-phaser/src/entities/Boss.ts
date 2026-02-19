// src/entities/Boss.ts
import Phaser from 'phaser';
import { GAME_WIDTH } from '../config/constants';

export abstract class Boss extends Phaser.Physics.Arcade.Sprite {
  public bossHealth: number;
  public maxHealth: number;
  public bossSpeed: number;
  public defeated: boolean = false;
  public hasShield: boolean = false;
  public bossName: string;

  private shieldTimer: number = 0;
  private shieldDuration: number = 2000;
  private shieldCooldownTimer: number = 0;
  private shieldCooldown: number = 4000;

  private shieldGraphics?: Phaser.GameObjects.Graphics;
  private healthBarBg?: Phaser.GameObjects.Graphics;
  private healthBarFill?: Phaser.GameObjects.Graphics;

  protected shootTimer: number = 0;
  protected shootInterval: number = 1500;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    name: string,
    maxHealth: number,
    speed: number,
  ) {
    super(scene, x, y, texture);
    this.bossName = name;
    this.bossHealth = maxHealth;
    this.maxHealth = maxHealth;
    this.bossSpeed = speed;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);

    // Create health bar graphics
    this.healthBarBg = scene.add.graphics();
    this.healthBarFill = scene.add.graphics();
    this.shieldGraphics = scene.add.graphics();
  }

  takeDamage(amount: number): boolean {
    if (this.hasShield) return false;
    this.bossHealth -= amount;
    if (this.bossHealth <= 0) {
      this.bossHealth = 0;
      this.defeated = true;
    }
    // Flash red on hit
    this.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      if (this.active) this.clearTint();
    });
    return true;
  }

  updateBoss(time: number, delta: number, player: Phaser.Physics.Arcade.Sprite): void {
    if (this.defeated) return;

    // Shield logic
    if (this.hasShield) {
      this.shieldTimer += delta;
      if (this.shieldTimer >= this.shieldDuration) {
        this.hasShield = false;
        this.shieldCooldownTimer = 0;
      }
    } else {
      this.shieldCooldownTimer += delta;
      if (this.shieldCooldownTimer >= this.shieldCooldown && Math.random() < 0.001) {
        this.hasShield = true;
        this.shieldTimer = 0;
      }
    }

    // Shooting timer
    this.shootTimer += delta;

    // Movement
    this.updateMovement(time, delta, player);

    // Draw health bar and shield
    this.drawHealthBar();
    this.drawShield(time);
  }

  private drawHealthBar(): void {
    if (!this.healthBarBg || !this.healthBarFill) return;

    this.healthBarBg.clear();
    this.healthBarFill.clear();

    const barWidth = 80;
    const barHeight = 8;
    const barX = this.x - barWidth / 2;
    const barY = this.y - this.height / 2 - 16;

    // Background
    this.healthBarBg.fillStyle(0x333333, 1);
    this.healthBarBg.fillRect(barX, barY, barWidth, barHeight);

    // Fill color based on health percentage
    const pct = this.bossHealth / this.maxHealth;
    let color: number;
    if (pct > 0.5) {
      color = 0x00ff00;
    } else if (pct > 0.25) {
      color = 0xffff00;
    } else {
      color = 0xff0000;
    }

    this.healthBarFill.fillStyle(color, 1);
    this.healthBarFill.fillRect(barX, barY, barWidth * pct, barHeight);
  }

  private drawShield(time: number): void {
    if (!this.shieldGraphics) return;
    this.shieldGraphics.clear();

    if (this.hasShield) {
      const pulse = 0.5 + 0.3 * Math.sin(time * 0.006);
      const radius = Math.max(this.width, this.height) * 0.7;
      this.shieldGraphics.lineStyle(3, 0x00ffff, pulse);
      this.shieldGraphics.strokeCircle(this.x, this.y, radius);
    }
  }

  protected defaultSideToSideMovement(_time: number, _delta: number): void {
    // Default side-to-side movement if not overridden
    if (!this.body) return;
    if (this.x <= 50) {
      this.setVelocityX(this.bossSpeed);
    } else if (this.x >= GAME_WIDTH - 50) {
      this.setVelocityX(-this.bossSpeed);
    }
    if (this.body.velocity.x === 0) {
      this.setVelocityX(this.bossSpeed);
    }
  }

  canShoot(): boolean {
    if (this.shootTimer >= this.shootInterval) {
      this.shootTimer = 0;
      return true;
    }
    return false;
  }

  destroyBoss(): void {
    this.healthBarBg?.destroy();
    this.healthBarFill?.destroy();
    this.shieldGraphics?.destroy();
    this.destroy();
  }

  abstract updateMovement(time: number, delta: number, player: Phaser.Physics.Arcade.Sprite): void;
  abstract shoot(): Phaser.Physics.Arcade.Sprite[];
}
