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
