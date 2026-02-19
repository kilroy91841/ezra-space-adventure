import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Will load assets here later
  }

  create(): void {
    const text = this.add.text(600, 450, 'Ezra\'s Space Adventure\nLoading...', {
      fontFamily: 'Courier New',
      fontSize: '32px',
      color: '#00ff00',
      align: 'center',
    });
    text.setOrigin(0.5);
  }
}
