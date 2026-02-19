import Phaser from 'phaser';

export class DamageTrap extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'damage_trap');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    scene.tweens.add({
      targets: this, y: y - 8, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
  }
}
