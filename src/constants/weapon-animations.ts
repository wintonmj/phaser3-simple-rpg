/**
 * @fileoverview Centralized weapon animation configuration
 * This file manages all weapon-related animations in a consistent way
 */

import { WeaponType } from './weapon-types';
import { Orientation } from '../geometry/orientation';
import { CharacterState } from './character-states';
import { ASSETS } from './assets';

/**
 * Weapon animation configuration type
 * Maps character states to animation keys for each orientation
 */
export type WeaponAnimationConfig = {
  [key in CharacterState]?: {
    [orient in Orientation]: {
      key: string;
      shouldFlip: boolean;
    }
  }
};

/**
 * Animation configuration for the bow weapon
 */
export const BOW_ANIMATION_CONFIG: WeaponAnimationConfig = {
  [CharacterState.IDLE]: {
    [Orientation.Up]: { key: ASSETS.ANIMATIONS.BOW_IDLE_UP, shouldFlip: false },
    [Orientation.Down]: { key: ASSETS.ANIMATIONS.BOW_IDLE_DOWN, shouldFlip: false },
    [Orientation.Left]: { key: ASSETS.ANIMATIONS.BOW_IDLE_LEFT, shouldFlip: false },
    [Orientation.Right]: { key: ASSETS.ANIMATIONS.BOW_IDLE_RIGHT, shouldFlip: false }
  },
  [CharacterState.MOVE]: {
    [Orientation.Up]: { key: ASSETS.ANIMATIONS.BOW_WALK_UP, shouldFlip: false },
    [Orientation.Down]: { key: ASSETS.ANIMATIONS.BOW_WALK_DOWN, shouldFlip: false },
    [Orientation.Left]: { key: ASSETS.ANIMATIONS.BOW_WALK_LEFT, shouldFlip: false },
    [Orientation.Right]: { key: ASSETS.ANIMATIONS.BOW_WALK_RIGHT, shouldFlip: false }
  },
  [CharacterState.ATTACK]: {
    [Orientation.Up]: { key: ASSETS.ANIMATIONS.BOW_ATTACK_UP, shouldFlip: false },
    [Orientation.Down]: { key: ASSETS.ANIMATIONS.BOW_ATTACK_DOWN, shouldFlip: false },
    [Orientation.Left]: { key: ASSETS.ANIMATIONS.BOW_ATTACK_LEFT, shouldFlip: false },
    [Orientation.Right]: { key: ASSETS.ANIMATIONS.BOW_ATTACK_RIGHT, shouldFlip: false }
  },
  [CharacterState.SHOOTING]: {
    [Orientation.Up]: { key: ASSETS.ANIMATIONS.BOW_SHOOT_UP, shouldFlip: false },
    [Orientation.Down]: { key: ASSETS.ANIMATIONS.BOW_SHOOT_DOWN, shouldFlip: false },
    [Orientation.Left]: { key: ASSETS.ANIMATIONS.BOW_SHOOT_LEFT, shouldFlip: false },
    [Orientation.Right]: { key: ASSETS.ANIMATIONS.BOW_SHOOT_RIGHT, shouldFlip: false }
  },
  [CharacterState.HIT]: {
    [Orientation.Up]: { key: ASSETS.ANIMATIONS.BOW_HURT_UP, shouldFlip: false },
    [Orientation.Down]: { key: ASSETS.ANIMATIONS.BOW_HURT_DOWN, shouldFlip: false },
    [Orientation.Left]: { key: ASSETS.ANIMATIONS.BOW_HURT_LEFT, shouldFlip: false },
    [Orientation.Right]: { key: ASSETS.ANIMATIONS.BOW_HURT_RIGHT, shouldFlip: false }
  }
};

/**
 * Map of weapon types to their animation configurations
 */
const WEAPON_ANIMATIONS: Record<WeaponType, WeaponAnimationConfig> = {
  [WeaponType.RANGED]: BOW_ANIMATION_CONFIG,
  [WeaponType.MELEE]: {}, // To be filled with melee weapon animations
  [WeaponType.MAGIC]: {}  // To be filled with magic weapon animations
};

/**
 * Get animation configuration for a specific weapon type
 * @param weaponType The type of weapon to get animations for
 * @returns Animation configuration for the weapon type
 */
export function getAnimationsForWeaponType(weaponType: WeaponType): WeaponAnimationConfig {
  return WEAPON_ANIMATIONS[weaponType] || {};
}

/**
 * Get the animation key for a specific weapon, state and orientation
 * @param weaponType The type of weapon
 * @param state The character state
 * @param orientation The orientation
 * @returns The animation key and flip state, or undefined if not found
 */
export function getWeaponAnimationKey(
  weaponType: WeaponType, 
  state: CharacterState, 
  orientation: Orientation
): { key: string, shouldFlip: boolean } | undefined {
  const config = getAnimationsForWeaponType(weaponType);
  
  // If no animation for the given state, try to fall back to IDLE
  if (!config[state] && state !== CharacterState.IDLE && config[CharacterState.IDLE]) {
    return config[CharacterState.IDLE]?.[orientation];
  }
  
  return config[state]?.[orientation];
} 