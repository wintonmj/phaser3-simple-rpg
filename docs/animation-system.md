# Animation System Documentation

## Overview

The animation system has been refactored to provide a clear, centralized approach to managing entity animations. This document describes the architecture, components, and how to use them.

## Key Components

### 1. Entity Animation Mapping (`entity-animations.ts`)

This file serves as the central hub connecting entity types to their animations and dimensions:

- `ENTITY_DIMENSIONS`: Maps entity types to their sprite dimensions (width and height)
- `ENTITY_ANIMATIONS`: Maps entity types to their animation configurations
- Utility functions:
  - `getAnimationsForEntity()`: Returns animation configurations for a specific entity type
  - `getDimensionsForEntity()`: Returns sprite dimensions for a specific entity type

### 2. Character States (`character-states.ts`)

Provides a single source of truth for character state enums:

- `CharacterState`: Enum defining all possible character states (IDLE, MOVE, ATTACK, etc.)
- Used as keys in animation configurations for consistency

### 3. Animation Configurations (`animation-configs.ts`)

Contains animation definitions for each entity:

- `PLAYER_ANIMATIONS`: Animation configurations for the player
- `MOLE_ANIMATIONS`: Animation configurations for mole enemies
- `TREANT_ANIMATIONS`: Animation configurations for treant enemies
- All configurations use `CharacterState` enum values as keys

### 4. Animation Behavior (`BaseEntityAnimation.ts`)

Implements the animation behavior for entities:

- `BaseEntityAnimation`: Class that plays animations based on entity state and orientation
- Simplified constructor that takes a complete animation set
- Static factory method `forEntityType()` that creates animation behavior for any entity type

## How Animations Work

1. The `Preloader` scene loads all sprite sheets with dimensions from `ENTITY_DIMENSIONS`
2. When creating an entity, the code uses `BaseEntityAnimation.forEntityType()` to get the right animations
3. When an entity changes state, it calls `playAnimation()` with the new state and orientation
4. The animation behavior looks up the right animation key in the entity's animation set
5. The animation is played with the correct orientation (and flipped horizontally if needed)

## Adding a New Entity with Animations

1. Add the entity type to `ENTITIES` in `entities.ts`:
   ```typescript
   export const ENTITIES = {
     // Existing entities
     NEW_ENTITY: 'new_entity',
   } as const;
   ```

2. Add sprite dimensions in `ENTITY_DIMENSIONS` in `entity-animations.ts`:
   ```typescript
   export const ENTITY_DIMENSIONS: Record<EntityType, { width: number, height: number }> = {
     // Existing dimensions
     [ENTITIES.NEW_ENTITY]: { width: 32, height: 32 },
   };
   ```

3. Define animation keys in `ASSETS.ANIMATIONS` in `assets.ts`:
   ```typescript
   ANIMATIONS: {
     // Existing animations
     NEW_ENTITY_IDLE: 'new-entity-idle',
     NEW_ENTITY_WALK: 'new-entity-walk',
   }
   ```

4. Create animation configurations in `animation-configs.ts`:
   ```typescript
   export const NEW_ENTITY_ANIMATIONS: Record<string, CharacterAnimation> = {
     [CharacterState.IDLE]: {
       down: { flip: false, anim: ASSETS.ANIMATIONS.NEW_ENTITY_IDLE },
       up: { flip: false, anim: ASSETS.ANIMATIONS.NEW_ENTITY_IDLE },
       left: { flip: true, anim: ASSETS.ANIMATIONS.NEW_ENTITY_IDLE },
       right: { flip: false, anim: ASSETS.ANIMATIONS.NEW_ENTITY_IDLE },
     },
     [CharacterState.MOVE]: {
       down: { flip: false, anim: ASSETS.ANIMATIONS.NEW_ENTITY_WALK },
       up: { flip: false, anim: ASSETS.ANIMATIONS.NEW_ENTITY_WALK },
       left: { flip: true, anim: ASSETS.ANIMATIONS.NEW_ENTITY_WALK },
       right: { flip: false, anim: ASSETS.ANIMATIONS.NEW_ENTITY_WALK },
     },
   };
   ```

5. Register in `ENTITY_ANIMATIONS` in `entity-animations.ts`:
   ```typescript
   export const ENTITY_ANIMATIONS: Record<EntityType, Record<string, CharacterAnimation>> = {
     // Existing mappings
     [ENTITIES.NEW_ENTITY]: NEW_ENTITY_ANIMATIONS,
   };
   ```

6. Use in entity class:
   ```typescript
   export class NewEntity extends NonPlayerEntity {
     constructor(scene, x, y) {
       // Create animation behavior
       const animationBehavior = BaseEntityAnimation.forEntityType(ENTITIES.NEW_ENTITY);
       
       // Use in constructor
       super(scene, x, y, /* other params */, {
         // Other behaviors
         animation: animationBehavior,
       });
     }
   }
   ```

## Benefits of the New System

1. **Single Source of Truth**: All entity-related configurations are centralized
2. **Standardized Approach**: All entities use the same pattern for animations
3. **Type Safety**: Improved TypeScript typing throughout the animation system
4. **Easier Maintenance**: Adding new entities or animation states is more straightforward
5. **Reduced Redundancy**: No duplicate dimensions or configurations throughout the codebase

## One-Time Animation Handling

The animation system properly handles both repeating animations (like walking) and one-time animations (like attacking or shooting).

### How One-Time Animations Work

When a character performs an action like shooting (triggered by spacebar), the animation system:

1. **Identifies One-Time Animations**: Special states like ATTACK, SHOOTING, PUNCHING, and HIT are recognized as one-time animations that should not loop.

2. **Configures Non-Repeating Playback**: The system uses Phaser's animation API correctly to ensure the animation only plays once:
   ```typescript
   // For repeating animations
   character.play(anim, true);
   
   // For one-time animations
   character.play(anim, false);
   ```

3. **Ensures Animation Completion**: A timer is set to ensure the character returns to IDLE after animation completion:
   ```typescript
   scene.time.delayedCall(800, () => {
     if (character.active && character.getState() === state) {
       character.setState(CharacterState.IDLE);
     }
   }, [], this);
   ```

4. **Prevents Premature Interruption**: The input system is configured to not interrupt special animations:
   ```typescript
   // Only set to IDLE if not in a special state
   if (noKeyPressed && 
       !player.isActionState(CharacterState.SHOOTING) && 
       !player.isActionState(CharacterState.ATTACK) /* etc */) {
     player.setToIdle();
   }
   ```

5. **Provides Emergency Reset**: If an animation gets stuck, pressing ESC will force reset to IDLE state.

### Phaser Animation System Details

Phaser's animation system has several important components used in this implementation:

- **play(key, ignoreIfPlaying, startFrame)**: Plays an animation. The second parameter controls whether the animation repeats.
  
- **on('animationcomplete', callback)**: Event fired when an animation completes. Our implementation uses this as a backup.
  
- **delayedCall**: Used to create timers that manage animation state.

### Implementation Considerations

- **Animation Duration**: The timer duration (800ms) is set to accommodate most attack animations.
  
- **State Management**: The system tracks both animation state and character state to ensure they stay in sync.
  
- **Error Recovery**: Multiple mechanisms ensure animations don't get stuck.

## Migration Notes

The system has been fully migrated to use CharacterState enum values:

1. All animation configurations (like MOLE_ANIMATIONS and TREANT_ANIMATIONS) exclusively use CharacterState enum values as keys
2. `BaseEntityAnimation` handles state normalization using the standardized CharacterState enum values

For all code, always use the `CharacterState` enum values and the `BaseEntityAnimation.forEntityType()` factory method. 