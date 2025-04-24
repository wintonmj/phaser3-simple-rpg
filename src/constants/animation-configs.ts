/**
 * @fileoverview Shared animation configurations for characters and entities
 * This file reduces redundancy by centralizing animation configurations
 */

import { CharacterAnimation } from '../game-objects/Character';
import { CharacterState } from './character-states';
import { ASSETS } from './assets';

/**
 * Creates animation sets for IDLE, DEATH, and RELOADING states
 * All of these states share the same idle animations
 */
function createIdleBasedAnimations(): Record<CharacterState, CharacterAnimation> {
  // Start with partial record
  const animations: Partial<Record<CharacterState, CharacterAnimation>> = {};
  
  // Common idle animation config that several states will use
  const idleAnimConfig = {
    down: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_IDLE_DOWN },
    up: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_IDLE_UP },
    left: { flip: true, anim: ASSETS.ANIMATIONS.PLAYER_IDLE_SIDE },
    right: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_IDLE_SIDE },
  };
  
  // Apply to multiple states
  animations[CharacterState.IDLE] = idleAnimConfig;
  animations[CharacterState.DEATH] = idleAnimConfig;
  animations[CharacterState.RELOADING] = idleAnimConfig;
  
  // Return with type assertion since we know it will be completed later
  return animations as Record<CharacterState, CharacterAnimation>;
}

/**
 * Player animation configurations
 */
export const PLAYER_ANIMATIONS: Record<CharacterState, CharacterAnimation> = {
  ...createIdleBasedAnimations(),
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
  [CharacterState.IDLE]: {
    down: { flip: false, anim: ASSETS.ANIMATIONS.MOLE_IDLE_DOWN },
    up: { flip: false, anim: ASSETS.ANIMATIONS.MOLE_IDLE_DOWN },
    left: { flip: true, anim: ASSETS.ANIMATIONS.MOLE_IDLE_DOWN },
    right: { flip: false, anim: ASSETS.ANIMATIONS.MOLE_IDLE_DOWN },
  },
  [CharacterState.ATTACK]: {
    down: { flip: false, anim: ASSETS.ANIMATIONS.MOLE_WALK_DOWN },
    up: { flip: false, anim: ASSETS.ANIMATIONS.MOLE_WALK_UP },
    left: { flip: true, anim: ASSETS.ANIMATIONS.MOLE_WALK_SIDE },
    right: { flip: false, anim: ASSETS.ANIMATIONS.MOLE_WALK_SIDE },
  },
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
  [CharacterState.IDLE]: {
    down: { flip: false, anim: ASSETS.ANIMATIONS.TREANT_IDLE_DOWN },
    up: { flip: false, anim: ASSETS.ANIMATIONS.TREANT_IDLE_DOWN },
    left: { flip: true, anim: ASSETS.ANIMATIONS.TREANT_IDLE_DOWN },
    right: { flip: false, anim: ASSETS.ANIMATIONS.TREANT_IDLE_DOWN },
  },
  [CharacterState.ATTACK]: {
    down: { flip: false, anim: ASSETS.ANIMATIONS.TREANT_WALK_DOWN },
    up: { flip: false, anim: ASSETS.ANIMATIONS.TREANT_WALK_UP },
    left: { flip: true, anim: ASSETS.ANIMATIONS.TREANT_WALK_SIDE },
    right: { flip: false, anim: ASSETS.ANIMATIONS.TREANT_WALK_SIDE },
  },
  [CharacterState.MOVE]: {
    down: { flip: false, anim: ASSETS.ANIMATIONS.TREANT_WALK_DOWN },
    up: { flip: false, anim: ASSETS.ANIMATIONS.TREANT_WALK_UP },
    left: { flip: true, anim: ASSETS.ANIMATIONS.TREANT_WALK_SIDE },
    right: { flip: false, anim: ASSETS.ANIMATIONS.TREANT_WALK_SIDE },
  }
};

/**
 * Goku NPC animation configurations
 */
export const GOKU_ANIMATIONS: Partial<Record<CharacterState, CharacterAnimation>> = {
  [CharacterState.IDLE]: {
    down: { flip: false, anim: ASSETS.ANIMATIONS.GOKU_IDLE_DOWN },
    up: { flip: false, anim: ASSETS.ANIMATIONS.GOKU_IDLE_UP },
    left: { flip: false, anim: ASSETS.ANIMATIONS.GOKU_IDLE_LEFT },
    right: { flip: false, anim: ASSETS.ANIMATIONS.GOKU_IDLE_RIGHT },
  },
  [CharacterState.MOVE]: {
    down: { flip: false, anim: ASSETS.ANIMATIONS.GOKU_WALK_DOWN },
    up: { flip: false, anim: ASSETS.ANIMATIONS.GOKU_WALK_UP },
    left: { flip: false, anim: ASSETS.ANIMATIONS.GOKU_WALK_LEFT },
    right: { flip: false, anim: ASSETS.ANIMATIONS.GOKU_WALK_RIGHT },
  },
  [CharacterState.ATTACK]: {
    down: { flip: false, anim: ASSETS.ANIMATIONS.GOKU_SLASH },
    up: { flip: false, anim: ASSETS.ANIMATIONS.GOKU_SLASH },
    left: { flip: false, anim: ASSETS.ANIMATIONS.GOKU_SLASH },
    right: { flip: false, anim: ASSETS.ANIMATIONS.GOKU_SLASH },
  },
  [CharacterState.SHOOTING]: {
    down: { flip: false, anim: ASSETS.ANIMATIONS.GOKU_SHOOT_DOWN },
    up: { flip: false, anim: ASSETS.ANIMATIONS.GOKU_SHOOT_UP },
    left: { flip: false, anim: ASSETS.ANIMATIONS.GOKU_SHOOT_LEFT },
    right: { flip: false, anim: ASSETS.ANIMATIONS.GOKU_SHOOT_RIGHT },
  },
}; 