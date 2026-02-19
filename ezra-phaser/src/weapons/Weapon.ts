import Phaser from 'phaser';
import { Player } from '../entities/Player';

export abstract class Weapon {
  public name: string;
  public damage: number;
  public cooldown: number;
  public color: number;
  public emoji: string;
  protected scene: Phaser.Scene;
  protected bulletGroup: Phaser.Physics.Arcade.Group;

  constructor(scene: Phaser.Scene, name: string, damage: number, cooldown: number, color: number, emoji: string) {
    this.scene = scene;
    this.name = name;
    this.damage = damage;
    this.cooldown = cooldown;
    this.color = color;
    this.emoji = emoji;
    this.bulletGroup = scene.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
      runChildUpdate: true,
      maxSize: 50,
    });
  }

  abstract fire(shooter: Player, dirX: number, dirY: number): void;

  getEffectiveDamage(shooter: Player): number {
    return this.damage + shooter.powerups;
  }

  getBulletGroup(): Phaser.Physics.Arcade.Group {
    return this.bulletGroup;
  }
}
