// src/config/dimensions.ts
import { DimensionDef } from './types';

export const DIMENSION_ORDER: DimensionDef[] = [
  { number: 1, type: 'collection', name: 'Power-Up Hunt', sceneKey: 'CollectionScene' },
  { number: 2, type: 'boss', name: 'Alien Battle', sceneKey: 'BossScene', bossType: 'alien' },
  { number: 3, type: 'puzzle', name: 'Math Puzzle Challenge', sceneKey: 'MathPuzzleScene' },
  { number: 4, type: 'boss', name: 'Mini Dragon', sceneKey: 'BossScene', bossType: 'minidragon' },
  { number: 5, type: 'boss', name: 'FINAL: Dragon Boss', sceneKey: 'BossScene', bossType: 'dragon' },
];
