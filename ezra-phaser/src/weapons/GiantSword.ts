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

    const hitbox = this.bulletGroup.create(
      shooter.x + ndx * 40, shooter.y + ndy * 40, 'proj_sword'
    ) as Phaser.Physics.Arcade.Sprite;
    if (!hitbox) return;

    hitbox.setActive(true).setVisible(true);
    hitbox.setVelocity(0, 0);
    hitbox.setData('damage', this.getEffectiveDamage(shooter));
    hitbox.setAlpha(0.7);

    this.scene.time.delayedCall(200, () => {
      if (hitbox.active) hitbox.destroy();
    });
  }
}
