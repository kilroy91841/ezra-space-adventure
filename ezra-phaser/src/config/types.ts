// src/config/types.ts
export interface CharacterDef {
  id: string;
  name: string;
  color: number;     // Phaser uses hex numbers, not CSS strings
  secondaryColor: number;
}

export type WeaponType = 'shooter' | 'melee' | 'summon';

export interface WeaponDef {
  name: string;
  type: WeaponType;
  damage: number;
  cooldown: number;
  color: number;
  emoji: string;  // For UI display
}

export interface DimensionDef {
  number: number;
  type: 'collection' | 'boss' | 'puzzle';
  name: string;
  sceneKey: string;
  bossType?: 'alien' | 'minidragon' | 'dragon';
}

export interface GameData {
  playerCount: 1 | 2;
  character1: CharacterDef;
  character2?: CharacterDef;
  isPracticeMode: boolean;
  score: number;
  lives: number;
  health: number;
  currentDimension: number;
}
