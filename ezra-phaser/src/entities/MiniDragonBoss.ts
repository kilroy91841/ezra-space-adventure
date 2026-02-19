// src/entities/MiniDragonBoss.ts
import { Boss } from './Boss';

export class MiniDragonBoss extends Boss {
  private zigzagTimer: number = 0;
  private zigzagInterval: number = 1000;
  private zigzagDirection: number = 1;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'boss_minidragon', 'Mini Dragon', 100, 150);
    this.shootInterval = 750;
  }

  updateMovement(_time: number, delta: number, player: Phaser.Physics.Arcade.Sprite): void {
    // Chase player
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 1) return;

    // Normalize chase direction
    const chaseX = dx / dist;
    const chaseY = dy / dist;

    // Perpendicular direction for zigzag
    const perpX = -chaseY;
    const perpY = chaseX;

    // Zigzag timer
    this.zigzagTimer += delta;
    if (this.zigzagTimer >= this.zigzagInterval) {
      this.zigzagTimer = 0;
      this.zigzagDirection *= -1;
    }

    // Combine chase and zigzag
    const zigzagStrength = 0.5;
    const finalX = chaseX + perpX * zigzagStrength * this.zigzagDirection;
    const finalY = chaseY + perpY * zigzagStrength * this.zigzagDirection;

    // Normalize and apply speed
    const finalDist = Math.sqrt(finalX * finalX + finalY * finalY);
    if (finalDist > 0) {
      this.setVelocity(
        (finalX / finalDist) * this.bossSpeed,
        (finalY / finalDist) * this.bossSpeed,
      );
    }
  }

  shoot(): Phaser.Physics.Arcade.Sprite[] {
    if (!this.canShoot()) return [];

    const projectiles: Phaser.Physics.Arcade.Sprite[] = [];

    // 2 fireballs in a slight spread downward
    const baseAngle = Math.PI / 2;
    const spread = 0.3;

    for (let i = 0; i < 2; i++) {
      const angle = baseAngle + (i - 0.5) * spread;
      const speed = 260;

      const proj = this.scene.physics.add.sprite(this.x, this.y + 20, 'proj_fireball');
      proj.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
      proj.setData('damage', 15);
      this.scene.time.delayedCall(4000, () => {
        if (proj.active) proj.destroy();
      });
      projectiles.push(proj);
    }

    return projectiles;
  }
}
