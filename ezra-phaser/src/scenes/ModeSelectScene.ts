// src/scenes/ModeSelectScene.ts
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, MAX_HEALTH, STARTING_LIVES } from '../config/constants';
import { CharacterDef, GameData } from '../config/types';

export class ModeSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ModeSelectScene' });
  }

  init(data: { playerCount: number; character1: CharacterDef; character2?: CharacterDef }): void {
    const gameData: GameData = {
      playerCount: data.playerCount as 1 | 2,
      character1: data.character1,
      character2: data.character2,
      isPracticeMode: false,
      score: 0,
      lives: STARTING_LIVES,
      health: MAX_HEALTH,
      currentDimension: 0,
    };
    this.registry.set('gameData', gameData);
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#000000');

    // Stars
    for (let i = 0; i < 80; i++) {
      this.add.rectangle(
        Phaser.Math.Between(0, GAME_WIDTH), Phaser.Math.Between(0, GAME_HEIGHT),
        Phaser.Math.Between(1, 2), Phaser.Math.Between(1, 2), 0xffffff
      );
    }

    this.add.text(GAME_WIDTH / 2, 150, 'CHOOSE YOUR MODE', {
      fontFamily: 'Courier New', fontSize: '48px', color: '#00ff00', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Character previews
    const gameData = this.registry.get('gameData') as GameData;
    this.add.image(GAME_WIDTH / 2, 250, `char_${gameData.character1.id}`).setScale(2);
    if (gameData.character2) {
      this.add.image(GAME_WIDTH / 2 + 80, 250, `char_${gameData.character2.id}`).setScale(2);
    }

    // Adventure button
    this.createModeButton(GAME_WIDTH / 2 - 200, 400, 'START\nADVENTURE', 0x00ff00, () => {
      const gd = this.registry.get('gameData') as GameData;
      gd.isPracticeMode = false;
      this.registry.set('gameData', gd);
      this.scene.start('TitleScene');
    });

    // Practice button
    this.createModeButton(GAME_WIDTH / 2 + 200, 400, 'PRACTICE\nMUSEUM', 0xcc00ff, () => {
      const gd = this.registry.get('gameData') as GameData;
      gd.isPracticeMode = true;
      gd.lives = 999;
      this.registry.set('gameData', gd);
      this.scene.start('PracticeScene');
      this.scene.launch('HUDScene');
    });

    // Instructions
    this.add.text(GAME_WIDTH / 2, 520, 'Adventure: Full game with bosses and puzzles', {
      fontFamily: 'Courier New', fontSize: '18px', color: '#ffffff',
    }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 550, 'Practice: Spawn enemies and test all weapons', {
      fontFamily: 'Courier New', fontSize: '18px', color: '#ffffff',
    }).setOrigin(0.5);
  }

  private createModeButton(x: number, y: number, label: string, color: number, onClick: () => void): void {
    const btn = this.add.rectangle(x, y, 300, 100, color)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0xffffff)
      .on('pointerover', () => btn.setStrokeStyle(4, 0xffff00))
      .on('pointerout', () => btn.setStrokeStyle(2, 0xffffff))
      .on('pointerdown', onClick);

    this.add.text(x, y, label, {
      fontFamily: 'Courier New', fontSize: '24px', color: '#000000', fontStyle: 'bold', align: 'center',
    }).setOrigin(0.5);
  }
}
