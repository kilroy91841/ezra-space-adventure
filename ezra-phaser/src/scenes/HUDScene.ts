// src/scenes/HUDScene.ts
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, MAX_HEALTH } from '../config/constants';
import { GameData } from '../config/types';
import { DIMENSION_ORDER } from '../config/dimensions';

export class HUDScene extends Phaser.Scene {
  private healthBar!: Phaser.GameObjects.Rectangle;
  private healthBarBg!: Phaser.GameObjects.Rectangle;
  private livesText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private dimensionText!: Phaser.GameObjects.Text;
  private p1WeaponTexts: Phaser.GameObjects.Text[] = [];
  private p2WeaponTexts: Phaser.GameObjects.Text[] = [];
  private p1Label?: Phaser.GameObjects.Text;
  private p2Label?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'HUDScene' });
  }

  create(): void {
    // Health bar background
    this.healthBarBg = this.add.rectangle(20, 20, 200, 20, 0x333333).setOrigin(0, 0);
    this.healthBarBg.setStrokeStyle(1, 0xffffff);

    // Health bar fill
    this.healthBar = this.add.rectangle(20, 20, 200, 20, 0xff0000).setOrigin(0, 0);

    // Health label
    this.add.text(20, 5, 'HEALTH', {
      fontFamily: 'Courier New', fontSize: '12px', color: '#ffffff',
    });

    // Lives text
    this.livesText = this.add.text(240, 20, '', {
      fontFamily: 'Courier New', fontSize: '18px', color: '#ffff00',
    });

    // Score (top right)
    this.scoreText = this.add.text(GAME_WIDTH - 20, 20, '', {
      fontFamily: 'Courier New', fontSize: '18px', color: '#ffffff',
    }).setOrigin(1, 0);

    // Dimension name
    this.dimensionText = this.add.text(GAME_WIDTH / 2, 20, '', {
      fontFamily: 'Courier New', fontSize: '16px', color: '#00ff00',
    }).setOrigin(0.5, 0);

    // P1 Weapon selector (bottom left)
    const weaponNames = ['Ice', 'Fire', 'Sword', 'Bomb'];
    const weaponKeys = ['1', '2', '3', '4'];
    for (let i = 0; i < 4; i++) {
      const text = this.add.text(20 + i * 120, GAME_HEIGHT - 40, `[${weaponKeys[i]}] ${weaponNames[i]}`, {
        fontFamily: 'Courier New', fontSize: '14px', color: '#888888',
      });
      this.p1WeaponTexts.push(text);
    }

    // P1 label text
    this.add.text(20, GAME_HEIGHT - 58, 'EZRA', {
      fontFamily: 'Courier New', fontSize: '14px', color: '#00ff00', fontStyle: 'bold',
    });

    // Check if 2-player mode
    const gameData = this.registry.get('gameData') as GameData;
    if (gameData.playerCount === 2) {
      const p2Keys = ['Q', 'E', 'R', 'T'];
      for (let i = 0; i < 4; i++) {
        const text = this.add.text(GAME_WIDTH - 480 + i * 120, GAME_HEIGHT - 40, `[${p2Keys[i]}] ${weaponNames[i]}`, {
          fontFamily: 'Courier New', fontSize: '14px', color: '#888888',
        });
        this.p2WeaponTexts.push(text);
      }

      this.add.text(GAME_WIDTH - 480, GAME_HEIGHT - 58, 'RONEN', {
        fontFamily: 'Courier New', fontSize: '14px', color: '#ffff00', fontStyle: 'bold',
      });
    }

    // Player name labels that follow sprites
    this.p1Label = this.add.text(0, 0, 'EZRA', {
      fontFamily: 'Courier New', fontSize: '12px', color: '#00ff00', fontStyle: 'bold',
    }).setOrigin(0.5).setVisible(false);

    if (gameData.playerCount === 2) {
      this.p2Label = this.add.text(0, 0, 'RONEN', {
        fontFamily: 'Courier New', fontSize: '12px', color: '#ffff00', fontStyle: 'bold',
      }).setOrigin(0.5).setVisible(false);
    }
  }

  update(): void {
    const gameData = this.registry.get('gameData') as GameData | undefined;
    if (!gameData) return;

    // Update health bar
    const healthPercent = gameData.health / MAX_HEALTH;
    this.healthBar.width = 200 * healthPercent;
    this.healthBar.setFillStyle(healthPercent > 0.5 ? 0x00ff00 : healthPercent > 0.25 ? 0xffff00 : 0xff0000);

    // Update lives
    this.livesText.setText(`Lives: ${gameData.lives}`);

    // Update score
    this.scoreText.setText(`Score: ${gameData.score}`);

    // Update dimension
    const dim = DIMENSION_ORDER[gameData.currentDimension];
    if (dim) {
      this.dimensionText.setText(`Dimension ${dim.number}: ${dim.name}`);
    }

    // Update weapon highlights
    this.updateWeaponHighlights();

    // Update player name label positions
    this.updatePlayerLabels();
  }

  private updateWeaponHighlights(): void {
    // Find active gameplay scene to get weapon indices
    const activeScenes = this.scene.manager.getScenes(true);
    for (const scene of activeScenes) {
      if (scene === this) continue;
      const sceneAny = scene as any;

      if (sceneAny.p1WeaponIndex !== undefined) {
        this.p1WeaponTexts.forEach((text, i) => {
          text.setColor(i === sceneAny.p1WeaponIndex ? '#ffffff' : '#888888');
          text.setFontStyle(i === sceneAny.p1WeaponIndex ? 'bold' : '');
        });
      }
      if (sceneAny.p2WeaponIndex !== undefined && this.p2WeaponTexts.length > 0) {
        this.p2WeaponTexts.forEach((text, i) => {
          text.setColor(i === sceneAny.p2WeaponIndex ? '#ffffff' : '#888888');
          text.setFontStyle(i === sceneAny.p2WeaponIndex ? 'bold' : '');
        });
      }
      break;
    }
  }

  private updatePlayerLabels(): void {
    const activeScenes = this.scene.manager.getScenes(true);
    for (const scene of activeScenes) {
      if (scene === this) continue;
      const sceneAny = scene as any;

      if (sceneAny.player1) {
        this.p1Label?.setPosition(sceneAny.player1.x, sceneAny.player1.y - 40);
        this.p1Label?.setVisible(true);
      }
      if (sceneAny.player2 && this.p2Label) {
        this.p2Label.setPosition(sceneAny.player2.x, sceneAny.player2.y - 40);
        this.p2Label.setVisible(true);
      }
      break;
    }
  }
}
