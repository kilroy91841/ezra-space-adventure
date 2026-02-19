// src/scenes/VictoryScene.ts
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants';
import { GameData } from '../config/types';

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'VictoryScene' });
  }

  create(): void {
    this.scene.stop('HUDScene');
    this.cameras.main.setBackgroundColor('#000000');
    const gameData = this.registry.get('gameData') as GameData;

    // Animated star field
    for (let i = 0; i < 150; i++) {
      const star = this.add.rectangle(
        Phaser.Math.Between(0, GAME_WIDTH),
        Phaser.Math.Between(0, GAME_HEIGHT),
        Phaser.Math.Between(1, 4),
        Phaser.Math.Between(1, 4),
        Phaser.Math.RND.pick([0xffffff, 0xffff00, 0x00ff00, 0xff00ff, 0x00ffff])
      );
      this.tweens.add({
        targets: star,
        alpha: 0,
        duration: Phaser.Math.Between(300, 1000),
        yoyo: true,
        repeat: -1,
      });
    }

    // Camera flash
    this.cameras.main.flash(1000, 255, 255, 255);

    // Victory text with scale-in animation
    const victoryText = this.add
      .text(GAME_WIDTH / 2, 180, 'VICTORY!', {
        fontFamily: 'Courier New',
        fontSize: '72px',
        color: '#00ff00',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setScale(0);

    this.tweens.add({
      targets: victoryText,
      scaleX: 1,
      scaleY: 1,
      duration: 800,
      ease: 'Back.easeOut',
    });

    // Subtitle
    const subtitle = this.add
      .text(GAME_WIDTH / 2, 260, 'You saved the galaxy!', {
        fontFamily: 'Courier New',
        fontSize: '28px',
        color: '#ffff00',
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.tweens.add({
      targets: subtitle,
      alpha: 1,
      duration: 500,
      delay: 800,
    });

    // Character display
    this.time.delayedCall(1000, () => {
      const charX = gameData.character2
        ? GAME_WIDTH / 2 - 50
        : GAME_WIDTH / 2;
      this.add.image(charX, 360, `char_${gameData.character1.id}`).setScale(3);
      if (gameData.character2) {
        this.add
          .image(GAME_WIDTH / 2 + 50, 360, `char_${gameData.character2.id}`)
          .setScale(3);
      }
    });

    // Score
    this.time.delayedCall(1200, () => {
      this.add
        .text(GAME_WIDTH / 2, 440, `Final Score: ${gameData.score}`, {
          fontFamily: 'Courier New',
          fontSize: '32px',
          color: '#ffffff',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);
    });

    // Firework particle bursts
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
    this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        const fx = Phaser.Math.Between(100, GAME_WIDTH - 100);
        const fy = Phaser.Math.Between(50, 300);
        const color = Phaser.Math.RND.pick(colors);
        // Create particle burst using simple rectangles
        for (let i = 0; i < 20; i++) {
          const particle = this.add.rectangle(fx, fy, 4, 4, color);
          const angle = (i / 20) * Math.PI * 2;
          const speed = Phaser.Math.Between(100, 300);
          this.tweens.add({
            targets: particle,
            x: fx + Math.cos(angle) * speed,
            y: fy + Math.sin(angle) * speed,
            alpha: 0,
            duration: 1000,
            ease: 'Cubic.easeOut',
            onComplete: () => particle.destroy(),
          });
        }
        this.cameras.main.shake(100, 0.003);
      },
    });

    // Play again
    this.time.delayedCall(2000, () => {
      const playAgain = this.add
        .text(GAME_WIDTH / 2, 550, 'Press SPACE to Play Again', {
          fontFamily: 'Courier New',
          fontSize: '24px',
          color: '#ffffff',
        })
        .setOrigin(0.5);
      this.tweens.add({
        targets: playAgain,
        alpha: 0,
        duration: 500,
        yoyo: true,
        repeat: -1,
      });

      this.input.keyboard!.on('keydown-SPACE', () => {
        this.scene.start('PlayerCountScene');
      });
    });
  }
}
