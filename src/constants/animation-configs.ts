/**
 * @fileoverview Shared animation configurations for characters and entities
 * This file reduces redundancy by centralizing animation configurations
 */

import { CharacterAnimation } from '../game-objects/Character';
import { CharacterState } from '../game-objects/Character';
import { ASSETS } from './assets';

/**
 * Player animation configurations
 */
export const PLAYER_ANIMATIONS: Record<string, CharacterAnimation> = {
  [CharacterState.IDLE]: {
    down: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_IDLE_DOWN },
    up: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_IDLE_UP },
    left: { flip: true, anim: ASSETS.ANIMATIONS.PLAYER_IDLE_SIDE },
    right: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_IDLE_SIDE },
  },
  [CharacterState.MOVE]: {
    down: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_MOVE_DOWN },
    up: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_MOVE_UP },
    left: { flip: true, anim: ASSETS.ANIMATIONS.PLAYER_MOVE_LEFT },
    right: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_MOVE_RIGHT },
  },
  [CharacterState.ATTACK]: {
    down: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_ATTACK_DOWN },
    up: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_ATTACK_UP },
    left: { flip: true, anim: ASSETS.ANIMATIONS.PLAYER_ATTACK_SIDE },
    right: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_ATTACK_SIDE },
  },
  [CharacterState.HIT]: {
    down: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_ATTACK_WEAPON_DOWN },
    up: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_ATTACK_WEAPON_UP },
    left: { flip: true, anim: ASSETS.ANIMATIONS.PLAYER_ATTACK_WEAPON_SIDE },
    right: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_ATTACK_WEAPON_SIDE },
  },
  [CharacterState.DEATH]: {
    down: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_IDLE_DOWN },
    up: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_IDLE_UP },
    left: { flip: true, anim: ASSETS.ANIMATIONS.PLAYER_IDLE_SIDE },
    right: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_IDLE_SIDE },
  }
};

/**
 * Mole animation configurations
 */
export const MOLE_ANIMATIONS = {
  WALK: {
    down: { flip: false, anim: ASSETS.ANIMATIONS.MOLE_WALK_DOWN },
    up: { flip: false, anim: ASSETS.ANIMATIONS.MOLE_WALK_UP },
    left: { flip: true, anim: ASSETS.ANIMATIONS.MOLE_WALK_SIDE },
    right: { flip: false, anim: ASSETS.ANIMATIONS.MOLE_WALK_SIDE },
  },
  
  IDLE: {
    down: { flip: false, anim: ASSETS.ANIMATIONS.MOLE_IDLE_DOWN },
    up: { flip: false, anim: ASSETS.ANIMATIONS.MOLE_IDLE_DOWN },
    left: { flip: true, anim: ASSETS.ANIMATIONS.MOLE_IDLE_DOWN },
    right: { flip: false, anim: ASSETS.ANIMATIONS.MOLE_IDLE_DOWN },
  }
};

/**
 * Treant animation configurations
 */
export const TREANT_ANIMATIONS = {
  WALK: {
    down: { flip: false, anim: ASSETS.ANIMATIONS.TREANT_WALK_DOWN },
    up: { flip: false, anim: ASSETS.ANIMATIONS.TREANT_WALK_UP },
    left: { flip: true, anim: ASSETS.ANIMATIONS.TREANT_WALK_SIDE },
    right: { flip: false, anim: ASSETS.ANIMATIONS.TREANT_WALK_SIDE },
  },
  
  IDLE: {
    down: { flip: false, anim: ASSETS.ANIMATIONS.TREANT_IDLE_DOWN },
    up: { flip: false, anim: ASSETS.ANIMATIONS.TREANT_IDLE_DOWN },
    left: { flip: true, anim: ASSETS.ANIMATIONS.TREANT_IDLE_DOWN },
    right: { flip: false, anim: ASSETS.ANIMATIONS.TREANT_IDLE_DOWN },
  }
}; 