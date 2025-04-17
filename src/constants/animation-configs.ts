/**
 * @fileoverview Shared animation configurations for characters and entities
 * This file reduces redundancy by centralizing animation configurations
 */

import { CharacterAnimation } from '../game-objects/Character';
import { CharacterState } from './character-states';
import { ASSETS } from './assets';

/**
 * Creates animation configuration for multiple states that use the same animations
 * Reduces duplication in animation configuration
 */
function createSharedAnimationConfig(
  baseAnim: {
    down: string,
    up: string,
    side: string
  },
  states: CharacterState[]
): Partial<Record<CharacterState, CharacterAnimation>> {
  const config: Partial<Record<CharacterState, CharacterAnimation>> = {};
  
  states.forEach(state => {
    config[state] = {
      down: { flip: false, anim: baseAnim.down },
      up: { flip: false, anim: baseAnim.up },
      left: { flip: true, anim: baseAnim.side },
      right: { flip: false, anim: baseAnim.side },
    };
  });
  
  return config;
}

/**
 * Player animation configurations
 */
export const PLAYER_ANIMATIONS: Record<CharacterState, CharacterAnimation> = {
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
  },
  // New weapon states - using appropriate existing animations
  [CharacterState.RELOADING]: {
    down: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_IDLE_DOWN },
    up: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_IDLE_UP },
    left: { flip: true, anim: ASSETS.ANIMATIONS.PLAYER_IDLE_SIDE },
    right: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_IDLE_SIDE },
  },
  [CharacterState.SHOOTING]: {
    down: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_ATTACK_WEAPON_DOWN },
    up: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_ATTACK_WEAPON_UP },
    left: { flip: true, anim: ASSETS.ANIMATIONS.PLAYER_ATTACK_WEAPON_SIDE },
    right: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_ATTACK_WEAPON_SIDE },
  },
  [CharacterState.PUNCHING]: {
    down: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_ATTACK_DOWN },
    up: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_ATTACK_UP },
    left: { flip: true, anim: ASSETS.ANIMATIONS.PLAYER_ATTACK_SIDE },
    right: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_ATTACK_SIDE },
  }
};

/**
 * Mole animation configurations
 * Standardized to use CharacterState enum for consistency
 */
export const MOLE_ANIMATIONS: Partial<Record<CharacterState, CharacterAnimation>> = {
  ...createSharedAnimationConfig(
    {
      down: ASSETS.ANIMATIONS.MOLE_IDLE_DOWN,
      up: ASSETS.ANIMATIONS.MOLE_IDLE_DOWN, // Reusing down animation for up
      side: ASSETS.ANIMATIONS.MOLE_IDLE_DOWN // Reusing down animation for side
    },
    [CharacterState.IDLE, CharacterState.ATTACK] // States that share the same idle animation
  ),
  [CharacterState.MOVE]: {
    down: { flip: false, anim: ASSETS.ANIMATIONS.MOLE_WALK_DOWN },
    up: { flip: false, anim: ASSETS.ANIMATIONS.MOLE_WALK_UP },
    left: { flip: true, anim: ASSETS.ANIMATIONS.MOLE_WALK_SIDE },
    right: { flip: false, anim: ASSETS.ANIMATIONS.MOLE_WALK_SIDE },
  }
};

/**
 * Treant animation configurations
 * Standardized to use CharacterState enum for consistency
 */
export const TREANT_ANIMATIONS: Partial<Record<CharacterState, CharacterAnimation>> = {
  ...createSharedAnimationConfig(
    {
      down: ASSETS.ANIMATIONS.TREANT_IDLE_DOWN,
      up: ASSETS.ANIMATIONS.TREANT_IDLE_DOWN, // Reusing down animation for up
      side: ASSETS.ANIMATIONS.TREANT_IDLE_DOWN // Reusing down animation for side 
    },
    [CharacterState.IDLE, CharacterState.ATTACK] // States that share the same idle animation
  ),
  [CharacterState.MOVE]: {
    down: { flip: false, anim: ASSETS.ANIMATIONS.TREANT_WALK_DOWN },
    up: { flip: false, anim: ASSETS.ANIMATIONS.TREANT_WALK_UP },
    left: { flip: true, anim: ASSETS.ANIMATIONS.TREANT_WALK_SIDE },
    right: { flip: false, anim: ASSETS.ANIMATIONS.TREANT_WALK_SIDE },
  }
}; 