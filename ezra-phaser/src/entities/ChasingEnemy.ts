import Phaser from 'phaser';

export class ChasingEnemy extends Phaser.Physics.Arcade.Sprite {
  private chaseSpeed: number = 150;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'enemy_chaser');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
  }

  chaseTarget(target: Phaser.Physics.Arcade.Sprite): void {
    this.scene.physics.moveToObject(this, target, this.chaseSpeed);
  }
}
