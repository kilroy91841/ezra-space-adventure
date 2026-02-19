// src/scenes/PlayerCountScene.ts
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants';

export class PlayerCountScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PlayerCountScene' });
  }

  create(): void {
    // Starfield background
    for (let i = 0; i < 100; i++) {
      const star = this.add.rectangle(
        Phaser.Math.Between(0, GAME_WIDTH),
        Phaser.Math.Between(0, GAME_HEIGHT),
        Phaser.Math.Between(1, 3),
        Phaser.Math.Between(1, 3),
        0xffffff
      );
      this.tweens.add({
        targets: star,
        y: GAME_HEIGHT + 10,
        duration: Phaser.Math.Between(2000, 5000),
        repeat: -1,
        onRepeat: () => { star.y = -10; star.x = Phaser.Math.Between(0, GAME_WIDTH); },
      });
    }

    // Title
    this.add.text(GAME_WIDTH / 2, 150, 'HOW MANY PLAYERS?', {
      fontFamily: 'Courier New',
      fontSize: '48px',
      color: '#00ff00',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // 1 Player button
    this.createButton(GAME_WIDTH / 2 - 200, 350, '1 PLAYER', 0x0066cc, () => {
      this.scene.start('CharacterSelectScene', { playerCount: 1 });
    });

    // 2 Players button
    this.createButton(GAME_WIDTH / 2 + 200, 350, '2 PLAYERS', 0x008800, () => {
      this.scene.start('CharacterSelectScene', { playerCount: 2 });
    });

    // Instructions
    this.add.text(GAME_WIDTH / 2, 500, 'Press 1 or 2, or click to choose', {
      fontFamily: 'Courier New',
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Keyboard shortcuts
    this.input.keyboard!.on('keydown-ONE', () => {
      this.scene.start('CharacterSelectScene', { playerCount: 1 });
    });
    this.input.keyboard!.on('keydown-TWO', () => {
      this.scene.start('CharacterSelectScene', { playerCount: 2 });
    });
  }

  private createButton(x: number, y: number, label: string, color: number, onClick: () => void): void {
    const btn = this.add.rectangle(x, y, 300, 150, color)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => { btn.setStrokeStyle(4, 0xffff00); })
      .on('pointerout', () => { btn.setStrokeStyle(2, 0xffffff); })
      .on('pointerdown', onClick);
    btn.setStrokeStyle(2, 0xffffff);

    this.add.text(x, y, label, {
      fontFamily: 'Courier New',
      fontSize: '28px',
      color: '#000000',
      fontStyle: 'bold',
    }).setOrigin(0.5);
  }
}
