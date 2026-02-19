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

    this.scene.time.delayedCall(800, () => {
      if (!bomb.active) return;
      const ex = bomb.x;
      const ey = bomb.y;
      bomb.destroy();

      const explosion = this.bulletGroup.create(ex, ey, 'proj_bomb') as Phaser.Physics.Arcade.Sprite;
      if (!explosion) return;
      explosion.setActive(true).setVisible(true);
      explosion.setVelocity(0, 0);
      explosion.setScale(4);
      explosion.setAlpha(0.6);
      explosion.setTint(0xff4400);
      explosion.setData('damage', this.getEffectiveDamage(shooter) * 2);

      this.scene.cameras.main.shake(200, 0.01);

      this.scene.time.delayedCall(300, () => {
        if (explosion.active) explosion.destroy();
      });
    });
  }
}
