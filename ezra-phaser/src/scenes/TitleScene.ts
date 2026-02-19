// src/scenes/TitleScene.ts
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants';
import { DIMENSION_ORDER } from '../config/dimensions';
import { GameData } from '../config/types';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#000000');

    // Stars
    for (let i = 0; i < 100; i++) {
      this.add.rectangle(
        Phaser.Math.Between(0, GAME_WIDTH), Phaser.Math.Between(0, GAME_HEIGHT),
        Phaser.Math.Between(1, 3), Phaser.Math.Between(1, 3), 0xffffff
      );
    }

    this.add.text(GAME_WIDTH / 2, 180, "EZRA'S", {
      fontFamily: 'Courier New', fontSize: '56px', color: '#00ff00', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 250, 'SPACE ADVENTURE', {
      fontFamily: 'Courier New', fontSize: '56px', color: '#00ff00', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Character preview
    const gameData = this.registry.get('gameData') as GameData;
    this.add.image(GAME_WIDTH / 2, 370, `char_${gameData.character1.id}`).setScale(2);
    if (gameData.character2) {
      this.add.image(GAME_WIDTH / 2 + 80, 370, `char_${gameData.character2.id}`).setScale(2);
    }

    // Blinking "Press SPACEBAR" text
    const startText = this.add.text(GAME_WIDTH / 2, 500, 'Press SPACEBAR to Start!', {
      fontFamily: 'Courier New', fontSize: '28px', color: '#ffff00',
    }).setOrigin(0.5);
    this.tweens.add({
      targets: startText, alpha: 0, duration: 500, yoyo: true, repeat: -1,
    });

    // Controls hint
    this.add.text(GAME_WIDTH / 2, 570, 'Arrow Keys = Move | Space = Shoot | 1-4 = Switch Weapons', {
      fontFamily: 'Courier New', fontSize: '18px', color: '#ffffff',
    }).setOrigin(0.5);

    // Start on spacebar
    this.input.keyboard!.on('keydown-SPACE', () => {
      const firstDim = DIMENSION_ORDER[0]!;
      this.scene.start(firstDim.sceneKey, { dimensionIndex: 0 });
      this.scene.launch('HUDScene');
    });
  }
}
