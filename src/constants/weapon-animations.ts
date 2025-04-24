/**
 * @fileoverview Centralized weapon animation configuration
 * This file manages all weapon-related animations in a consistent way
 */

import { WeaponType } from './weapon-types';
import { Orientation } from '../geometry/orientation';
import { CharacterState } from './character-states';
import { ASSETS } from './assets';
import { BOW_ANIMATIONS } from './animation-configs';
import { CharacterAnimation } from '../game-objects/Character';
import { AnimationKey } from '../behaviors/interfaces';

/**
 * Weapon animation configuration type
 * Maps character states to animation keys for each orientation
 */
export type WeaponAnimationConfig = {
  [key in CharacterState]?: {
    [orient in Orientation]: {
      key: AnimationKey;
      shouldFlip: boolean;
    }
  }
};

/**
 * Function to convert from the CharacterAnimation format to WeaponAnimationConfig format
 * This allows reuse of existing animation configs
 */
function convertCharacterAnimToWeaponConfig(
  charAnim: Partial<Record<CharacterState, CharacterAnimation>>
): WeaponAnimationConfig {
  const result: WeaponAnimationConfig = {};
  
  // Map each state from the character animation
  for (const state in charAnim) {
    if (Object.prototype.hasOwnProperty.call(charAnim, state)) {
      const stateConfig = charAnim[state as unknown as CharacterState];
      if (stateConfig) {
        result[state as unknown as CharacterState] = {
          [Orientation.Up]: { key: stateConfig.up.anim as AnimationKey, shouldFlip: stateConfig.up.flip },
          [Orientation.Down]: { key: stateConfig.down.anim as AnimationKey, shouldFlip: stateConfig.down.flip },
          [Orientation.Left]: { key: stateConfig.left.anim as AnimationKey, shouldFlip: stateConfig.left.flip },
          [Orientation.Right]: { key: stateConfig.right.anim as AnimationKey, shouldFlip: stateConfig.right.flip }
        };
      }
    }
  }
  
  return result;
}

/**
 * Animation configuration for the bow weapon - reusing BOW_ANIMATIONS from animation-configs.ts
 */
export const BOW_ANIMATION_CONFIG = convertCharacterAnimToWeaponConfig(BOW_ANIMATIONS);

// Add IDLE state if missing - ensuring completeness for our needs
if (!BOW_ANIMATION_CONFIG[CharacterState.IDLE]) {
  BOW_ANIMATION_CONFIG[CharacterState.IDLE] = {
    [Orientation.Up]: { key: ASSETS.ANIMATIONS.BOW_IDLE_UP as AnimationKey, shouldFlip: false },
    [Orientation.Down]: { key: ASSETS.ANIMATIONS.BOW_IDLE_DOWN as AnimationKey, shouldFlip: false },
    [Orientation.Left]: { key: ASSETS.ANIMATIONS.BOW_IDLE_LEFT as AnimationKey, shouldFlip: false },
    [Orientation.Right]: { key: ASSETS.ANIMATIONS.BOW_IDLE_RIGHT as AnimationKey, shouldFlip: false }
  };
}

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
): { key: AnimationKey, shouldFlip: boolean } | undefined {
  const config = getAnimationsForWeaponType(weaponType);
  
  // If no animation for the given state, try to fall back to IDLE
  if (!config[state] && state !== CharacterState.IDLE && config[CharacterState.IDLE]) {
    return config[CharacterState.IDLE]?.[orientation];
  }
  
  return config[state]?.[orientation];
} 