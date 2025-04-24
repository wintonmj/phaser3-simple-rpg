/**
 * @fileoverview Centralized entity animation mapping and dimensions
 * Provides a single source of truth for animation configurations and sprite dimensions
 */

import { EntityType, ENTITIES } from './entities';
import { CharacterState } from './character-states';
import { PLAYER_ANIMATIONS, MOLE_ANIMATIONS, TREANT_ANIMATIONS, GOKU_ANIMATIONS } from './animation-configs';
import { CharacterAnimation } from '../game-objects/Character';

/**
 * Centralized definition of entity sprite dimensions and scaling
 * This provides consistent dimensions for loading sprites
 */
export const ENTITY_DIMENSIONS: Record<EntityType, { width: number, height: number, scale?: number }> = {
  [ENTITIES.PLAYER]: { width: 32, height: 32, scale: 0.5 },
  [ENTITIES.MOLE]: { width: 24, height: 24 },
  [ENTITIES.TREANT]: { width: 31, height: 35 },
  [ENTITIES.GOKU]: { width: 64, height: 64, scale: 0.5 },
  [ENTITIES.WIZARD]: { width: 32, height: 32 },
  [ENTITIES.FEMALE_VILLAGER]: { width: 32, height: 32 },
};

/**
 * Standardized animation configurations to use CharacterState enum
 * This ensures consistency between all entity animation configurations
 */
const standardizedMoleAnimations: Record<string, CharacterAnimation> = {
  ...MOLE_ANIMATIONS,
  // Add missing states with fallback to IDLE
  [CharacterState.HIT]: MOLE_ANIMATIONS[CharacterState.IDLE],
  [CharacterState.DEATH]: MOLE_ANIMATIONS[CharacterState.IDLE],
};

/**
 * Standardized treant animations using CharacterState enum
 */
const standardizedTreantAnimations: Record<string, CharacterAnimation> = {
  ...TREANT_ANIMATIONS,
  // Add missing states with fallback to IDLE
  [CharacterState.HIT]: TREANT_ANIMATIONS[CharacterState.IDLE],
  [CharacterState.DEATH]: TREANT_ANIMATIONS[CharacterState.IDLE],
};

/**
 * Central mapping between entity types and animation configurations
 * Provides a single source of truth for which animations apply to which entities
 */
export const ENTITY_ANIMATIONS: Record<EntityType, Record<string, CharacterAnimation>> = {
  [ENTITIES.PLAYER]: PLAYER_ANIMATIONS,
  [ENTITIES.MOLE]: standardizedMoleAnimations,
  [ENTITIES.TREANT]: standardizedTreantAnimations,
  // Add defaults for other entities
  [ENTITIES.GOKU]: GOKU_ANIMATIONS,
  [ENTITIES.WIZARD]: {}, // To be filled with Wizard-specific animations
  [ENTITIES.FEMALE_VILLAGER]: {}, // To be filled with Villager-specific animations
};

/**
 * Utility function to get animations for an entity
 * @param entityType The type of entity to get animations for
 * @returns Animation configuration for the entity type
 */
export function getAnimationsForEntity(entityType: EntityType): Record<string, CharacterAnimation> {
  return ENTITY_ANIMATIONS[entityType] || {};
}

/**
 * Utility function to get dimensions for an entity
 * @param entityType The type of entity to get dimensions for
 * @returns Dimensions for the entity type or default dimensions
 */
export function getDimensionsForEntity(entityType: EntityType): { width: number, height: number, scale?: number } {
  return ENTITY_DIMENSIONS[entityType] || { width: 32, height: 32 }; // Default fallback
} 