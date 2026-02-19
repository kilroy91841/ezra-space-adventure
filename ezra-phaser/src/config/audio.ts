// src/config/audio.ts
// Sound manager that plays sounds if they exist and fails silently.
// Actual sound effects can be added later with audio files or Web Audio API generation.

import Phaser from 'phaser';

export class SoundManager {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  play(key: string, volume: number = 0.5): void {
    try {
      if (this.scene.sound && this.scene.cache.audio.has(key)) {
        this.scene.sound.play(key, { volume });
      }
    } catch {
      // Silent fail - game works without audio
    }
  }
}
