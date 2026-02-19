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
    this.duration = 600;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    scene.tweens.add({
      targets: this, y: y - 8, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    scene.tweens.add({
      targets: this, scaleX: 1.2, scaleY: 1.2, duration: 500, yoyo: true, repeat: -1,
    });
  }
}
