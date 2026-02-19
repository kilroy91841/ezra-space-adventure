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

    this.scene.time.delayedCall(3000, () => {
      if (bullet.active) { bullet.destroy(); }
    });
  }
}
