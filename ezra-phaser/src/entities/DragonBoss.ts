// src/entities/DragonBoss.ts
import Phaser from 'phaser';
import { Boss } from './Boss';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants';

export class DragonBoss extends Boss {
  private circleAngle: number = 0;
  private circleRadius: number = 200;
  private circleCenterX: number;
  private circleCenterY: number;

  private isBurrowed: boolean = false;
  private burrowCooldown: number = 8000;
  private burrowTimer: number = 0;
  private burrowWarning?: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'boss_dragon', 'Fire Dragon', 200, 180);
    this.shootInterval = 600;
    this.circleCenterX = GAME_WIDTH / 2;
    this.circleCenterY = 200;
  }

  /** Whether the dragon is in its enraged second phase (health <= 50%) */
  get isPhase2(): boolean {
    return this.bossHealth <= this.maxHealth * 0.5;
  }

  updateMovement(time: number, delta: number, player: Phaser.Physics.Arcade.Sprite): void {
    if (this.isBurrowed) return;

    // Phase 2: faster speed and more frequent burrows
    if (this.isPhase2) {
      this.bossSpeed = 240;
      this.shootInterval = 420;
      this.burrowCooldown = 5000;
    }

    // Circle center slowly follows player
    const lerpSpeed = 0.001 * delta;
    this.circleCenterX += (player.x - this.circleCenterX) * lerpSpeed;
    this.circleCenterY += (Math.min(player.y, GAME_HEIGHT * 0.4) - this.circleCenterY) * lerpSpeed;

    // Circular movement
    const angleSpeed = this.isPhase2 ? 0.0015 : 0.001;
    this.circleAngle += angleSpeed * delta;

    const targetX = this.circleCenterX + Math.cos(this.circleAngle) * this.circleRadius;
    const targetY = this.circleCenterY + Math.sin(this.circleAngle) * this.circleRadius;

    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 2) {
      this.setVelocity(
        (dx / dist) * this.bossSpeed,
        (dy / dist) * this.bossSpeed,
      );
    }

    // Burrow attack
    this.burrowTimer += delta;
    const burrowChance = this.isPhase2 ? 0.008 : 0.003;
    if (this.burrowTimer >= this.burrowCooldown && Math.random() < burrowChance) {
      this.startBurrow(player);
    }
  }

  private startBurrow(player: Phaser.Physics.Arcade.Sprite): void {
    this.isBurrowed = true;
    this.burrowTimer = 0;
    this.setVisible(false);
    this.setVelocity(0, 0);
    (this.body as Phaser.Physics.Arcade.Body).enable = false;

    // Remember where the player is now
    const targetX = player.x;
    const targetY = player.y;

    // Show warning indicator at target
    this.burrowWarning = this.scene.add.graphics();
    const warningRadius = 30;
    let warningAlpha = 0;
    let warningDir = 1;

    const warningEvent = this.scene.time.addEvent({
      delay: 50,
      repeat: 39, // ~2 seconds total
      callback: () => {
        if (!this.burrowWarning) return;
        this.burrowWarning.clear();
        warningAlpha += 0.05 * warningDir;
        if (warningAlpha >= 1) warningDir = -1;
        if (warningAlpha <= 0.2) warningDir = 1;

        this.burrowWarning.lineStyle(3, 0xff0000, warningAlpha);
        this.burrowWarning.strokeCircle(targetX, targetY, warningRadius);
        this.burrowWarning.lineStyle(2, 0xff0000, warningAlpha);
        this.burrowWarning.strokeCircle(targetX, targetY, warningRadius * 0.6);

        // Draw "!" in center
        this.burrowWarning.fillStyle(0xff0000, warningAlpha);
        this.burrowWarning.fillRect(targetX - 2, targetY - 10, 4, 12);
        this.burrowWarning.fillRect(targetX - 2, targetY + 5, 4, 4);
      },
    });

    // Pop up after 2 seconds
    this.scene.time.delayedCall(2000, () => {
      warningEvent.destroy();
      if (this.burrowWarning) {
        this.burrowWarning.destroy();
        this.burrowWarning = undefined;
      }

      if (!this.active) return;

      // Emerge at target position (clamped to bounds)
      const emergeX = Phaser.Math.Clamp(targetX, 70, GAME_WIDTH - 70);
      const emergeY = Phaser.Math.Clamp(targetY, 50, GAME_HEIGHT - 50);
      this.setPosition(emergeX, emergeY);
      this.setVisible(true);
      (this.body as Phaser.Physics.Arcade.Body).enable = true;
      this.isBurrowed = false;

      // Screen shake on emerge
      this.scene.cameras.main.shake(200, 0.01);
    });
  }

  shoot(): Phaser.Physics.Arcade.Sprite[] {
    if (!this.canShoot() || this.isBurrowed) return [];

    const projectiles: Phaser.Physics.Arcade.Sprite[] = [];
    const count = this.isPhase2 ? 3 : 2;

    // Fan of fireballs downward
    const baseAngle = Math.PI / 2; // straight down
    const spread = this.isPhase2 ? 0.6 : 0.4;

    for (let i = 0; i < count; i++) {
      const angle = baseAngle + (i - (count - 1) / 2) * spread;
      const speed = 280;

      const proj = this.scene.physics.add.sprite(this.x, this.y + 30, 'proj_fireball');
      proj.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
      proj.setData('damage', 20);
      this.scene.time.delayedCall(4000, () => {
        if (proj.active) proj.destroy();
      });
      projectiles.push(proj);
    }

    return projectiles;
  }
}
