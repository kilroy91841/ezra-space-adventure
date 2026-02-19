import Phaser from 'phaser';

export type HazardType = 'lava' | 'trampoline' | 'ice';

export class StageHazard extends Phaser.Physics.Arcade.Sprite {
  public hazardType: HazardType;
  public damageAmount: number;
  public bounceForce: number;
  public slipperiness: number;

  constructor(scene: Phaser.Scene, x: number, y: number, type: HazardType) {
    const textureKey = `hazard_${type}`;
    super(scene, x, y, textureKey);
    this.hazardType = type;
    this.damageAmount = type === 'lava' ? 5 : 0;
    this.bounceForce = type === 'trampoline' ? 600 : 0;
    this.slipperiness = type === 'ice' ? 1.05 : 1;

    scene.add.existing(this);
    scene.physics.add.existing(this, true); // Static body
  }
}
