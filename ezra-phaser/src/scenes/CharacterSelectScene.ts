// src/scenes/CharacterSelectScene.ts
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants';
import { CHARACTERS } from '../config/characters';
import { CharacterDef } from '../config/types';

export class CharacterSelectScene extends Phaser.Scene {
  private playerCount!: number;
  private character1?: CharacterDef;
  private selectingPlayer!: 1 | 2;

  constructor() {
    super({ key: 'CharacterSelectScene' });
  }

  init(data: { playerCount: number; character1?: CharacterDef }): void {
    this.playerCount = data.playerCount;
    this.character1 = data.character1;
    this.selectingPlayer = data.character1 ? 2 : 1;
  }

  create(): void {
    // Background
    this.cameras.main.setBackgroundColor('#000000');

    // Stars
    for (let i = 0; i < 80; i++) {
      this.add.rectangle(
        Phaser.Math.Between(0, GAME_WIDTH),
        Phaser.Math.Between(0, GAME_HEIGHT),
        Phaser.Math.Between(1, 2), Phaser.Math.Between(1, 2), 0xffffff
      );
    }

    // Title
    const playerName = this.selectingPlayer === 1 ? 'EZRA' : 'RONEN';
    this.add.text(GAME_WIDTH / 2, 120, `${playerName} - CHOOSE YOUR CHARACTER`, {
      fontFamily: 'Courier New', fontSize: '40px', color: '#00ff00', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 180, 'Click to select!', {
      fontFamily: 'Courier New', fontSize: '24px', color: '#ffff00',
    }).setOrigin(0.5);

    // Character boxes
    const boxWidth = 220;
    const spacing = 40;
    const totalWidth = CHARACTERS.length * boxWidth + (CHARACTERS.length - 1) * spacing;
    const startX = (GAME_WIDTH - totalWidth) / 2 + boxWidth / 2;
    const y = 370;

    CHARACTERS.forEach((char, index) => {
      const x = startX + index * (boxWidth + spacing);

      const box = this.add.rectangle(x, y, boxWidth, 180, 0x222222)
        .setInteractive({ useHandCursor: true })
        .setStrokeStyle(2, char.color)
        .on('pointerover', () => { box.setStrokeStyle(4, 0xffff00); box.setFillStyle(0x333333); })
        .on('pointerout', () => { box.setStrokeStyle(2, char.color); box.setFillStyle(0x222222); })
        .on('pointerdown', () => this.selectCharacter(char));

      // Character preview sprite
      this.add.image(x, y - 20, `char_${char.id}`).setScale(1.5);

      // Character name
      this.add.text(x, y + 70, char.name, {
        fontFamily: 'Courier New', fontSize: '18px', color: '#ffffff', fontStyle: 'bold',
      }).setOrigin(0.5);
    });
  }

  private selectCharacter(char: CharacterDef): void {
    if (this.selectingPlayer === 1) {
      if (this.playerCount === 2) {
        // Need P2 selection next
        this.scene.restart({ playerCount: this.playerCount, character1: char });
      } else {
        // 1 player - go to mode select
        this.scene.start('ModeSelectScene', {
          playerCount: 1,
          character1: char,
        });
      }
    } else {
      // P2 selected - go to mode select
      this.scene.start('ModeSelectScene', {
        playerCount: this.playerCount,
        character1: this.character1,
        character2: char,
      });
    }
  }
}
