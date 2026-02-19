import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Will load assets here later
  }

  create(): void {
    const text = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, "Ezra's Space Adventure\nLoading...", {
      fontFamily: 'Courier New',
      fontSize: '32px',
      color: '#00ff00',
      align: 'center',
    });
    text.setOrigin(0.5);
  }
}
