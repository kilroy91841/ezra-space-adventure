import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './config/constants';
import { BootScene } from './scenes/BootScene';
import { PlayerCountScene } from './scenes/PlayerCountScene';
import { CharacterSelectScene } from './scenes/CharacterSelectScene';
import { ModeSelectScene } from './scenes/ModeSelectScene';
import { TitleScene } from './scenes/TitleScene';
import { CollectionScene } from './scenes/CollectionScene';
import { BossScene } from './scenes/BossScene';
import { HUDScene } from './scenes/HUDScene';
import { MathPuzzleScene } from './scenes/MathPuzzleScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  scene: [BootScene, PlayerCountScene, CharacterSelectScene, ModeSelectScene, TitleScene, CollectionScene, BossScene, MathPuzzleScene, HUDScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

new Phaser.Game(config);
