# Animation System Architecture Analysis

## Current Component Relationships

### Assets and Animations

- `assets.ts` defines constants for all game assets and animation keys
- `Preloader.ts` uses these constants to load assets and create animations
- `animation-configs.ts` uses the same constants to define animation configurations for entities

### Character States

- `CharacterState` enum is defined in `character-states.ts` but imported from `Character.ts` in animation-configs
- Used by both `animation-configs.ts` and `BaseEntityAnimation.ts`
- Defines states like IDLE, MOVE, ATTACK, etc. that drive animation selection

### Entity Types

- `entities.ts` defines entity type constants (PLAYER, TREANT, MOLE, GOKU, etc.)
- No direct mapping exists between entity types and their corresponding animation configurations
- Entity types are used elsewhere but not directly connected to animations

### Animation Implementation

- `BaseEntityAnimation.ts` implements the animation behavior interface for non-player entities
- Supports both legacy (separate animations) and new (animation sets) approaches through its constructor
- Plays animations based on entity state and orientation

## Issues and Redundancies

1. **Decoupled Components**:
   - Entity types, animations, and states are defined separately without clear connections
   - No single source of truth for which animations apply to which entities

2. **Potential Duplication**:
   - Animation keys defined in `assets.ts` and referenced again in `animation-configs.ts`
   - `CharacterState` might be imported from different locations

3. **Mixed Implementation Approaches**:
   - `BaseEntityAnimation` supports both legacy and new approaches, increasing complexity
   - Different animation configuration patterns for different entity types

4. **Preloader Disconnection**:
   - `Preloader.ts` creates animations directly but doesn't use configurations from `animation-configs.ts`
   - Results in possible inconsistencies in how animations are configured vs. how they're loaded

## Proposed Improvements

2. **Create Entity-Animation Mapping**:
   - Develop a clear mapping between entity types and their animation configurations
   - Example: `const ENTITY_ANIMATIONS: Record<EntityType, Record<string, CharacterAnimation>>`
   - This would make it obvious which animations apply to which entities

   **Implementation Details:**
   - Create a new file `entity-animations.ts` in the constants directory
   - Import all animation configurations from `animation-configs.ts`
   - Import `EntityType` from `entities.ts` and `CharacterState` from `character-states.ts`
   - Define a central mapping connecting entity types to their animation sets
   - Standardize all animation configurations to use `CharacterState` enum values as keys
   - Update `MOLE_ANIMATIONS` and `TREANT_ANIMATIONS` to use `CharacterState` values instead of string literals
   - Expose a utility function `getAnimationsForEntity(entityType: EntityType)` to retrieve animations for any entity

   **Sprite Dimensions:**
   - Include frame dimensions in the entity-animation mapping structure to consolidate all entity-related configuration
   - This provides a single source of truth for both animation mappings and spritesheet dimensions
   - Reduces the hardcoded frame dimensions currently spread throughout the Preloader.ts file
   - Makes it easier to add new entities with consistent dimensions

   **Example Structure:**
   ```typescript
   // entity-animations.ts
   import { EntityType, ENTITIES } from './entities';
   import { CharacterState } from './character-states';
   import { PLAYER_ANIMATIONS, MOLE_ANIMATIONS, TREANT_ANIMATIONS } from './animation-configs';
   import { CharacterAnimation } from '../game-objects/Character';

   // Define entity sprite dimensions
   export const ENTITY_DIMENSIONS: Record<EntityType, { width: number, height: number }> = {
     [ENTITIES.PLAYER]: { width: 32, height: 32 },
     [ENTITIES.MOLE]: { width: 24, height: 24 },
     [ENTITIES.TREANT]: { width: 31, height: 35 },
     [ENTITIES.GOKU]: { width: 64, height: 64 },
     [ENTITIES.WIZARD]: { width: 32, height: 32 },
     [ENTITIES.FEMALE_VILLAGER]: { width: 32, height: 32 },
   };

   // Standardize animation configurations to use CharacterState
   const standardizedMoleAnimations: Record<string, CharacterAnimation> = {
     [CharacterState.IDLE]: MOLE_ANIMATIONS.IDLE,
     [CharacterState.MOVE]: MOLE_ANIMATIONS.WALK,
     // Add additional states as needed with fallbacks
   };

   // Central mapping between entity types and animation configurations
   export const ENTITY_ANIMATIONS: Record<EntityType, Record<string, CharacterAnimation>> = {
     [ENTITIES.PLAYER]: PLAYER_ANIMATIONS,
     [ENTITIES.MOLE]: standardizedMoleAnimations,
     [ENTITIES.TREANT]: {
       [CharacterState.IDLE]: TREANT_ANIMATIONS.IDLE,
       [CharacterState.MOVE]: TREANT_ANIMATIONS.WALK,
     },
     // Add mappings for other entities
   };

   // Utility function to get animations for an entity
   export function getAnimationsForEntity(entityType: EntityType): Record<string, CharacterAnimation> {
     return ENTITY_ANIMATIONS[entityType] || {};
   }

   // Utility function to get dimensions for an entity
   export function getDimensionsForEntity(entityType: EntityType): { width: number, height: number } {
     return ENTITY_DIMENSIONS[entityType] || { width: 32, height: 32 }; // Default fallback
   }
   ```

3. **Simplify Animation Configuration**:
   - Have `Preloader.ts` use configurations from `animation-configs.ts` when creating animations
   - Remove redundancy between asset definitions and animation configurations
   - Consider a more declarative approach to defining animations

4. **Standardize Animation Behavior**:
   - Phase out the legacy animation approach in `BaseEntityAnimation`
   - Create entity-specific animation behaviors only when needed
   - Simplify the animation behavior interface

5. **Unify Animation Constants**:
   - Consider merging or better organizing constants between `assets.ts` and animation-related files
   - Create a clear hierarchy of animation-related constants

6. **Improve Type Safety**:
   - Add stronger typing throughout the animation system
   - Ensure animation keys are type-safe and connected to their entity types

## Next Steps

1. Create a unified source for character states
2. Build an entity-to-animation mapping system as outlined above
3. Update Preloader.ts to use the frame dimensions from ENTITY_DIMENSIONS
4. Refactor the Preloader to use animation configurations
5. Standardize on a single animation approach
6. Improve type safety throughout the system
