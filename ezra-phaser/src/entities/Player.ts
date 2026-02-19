// src/entities/Player.ts
import Phaser from 'phaser';
import { CharacterDef } from '../config/types';
import { NORMAL_SPEED, PLAYER_WIDTH, PLAYER_HEIGHT, GAME_WIDTH, GAME_HEIGHT } from '../config/constants';

export class Player extends Phaser.Physics.Arcade.Sprite {
  public powerups: number = 0;
  public playerSpeed: number = NORMAL_SPEED;
  public characterDef: CharacterDef;
  public weapon: any = null; // Will be typed properly when weapons are added
  public inventory: any[] = [];
  public isPlayer2: boolean;

  constructor(scene: Phaser.Scene, x: number, y: number, characterDef: CharacterDef, isPlayer2 = false) {
    super(scene, x, y, `char_${characterDef.id}`);
    this.characterDef = characterDef;
    this.isPlayer2 = isPlayer2;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Physics body setup
    this.setCollideWorldBounds(true);
    this.body!.setSize(PLAYER_WIDTH, PLAYER_HEIGHT);
  }

  addPowerup(): void {
    this.powerups++;
  }

  removePowerup(): void {
    if (this.powerups > 0) this.powerups--;
  }
}
