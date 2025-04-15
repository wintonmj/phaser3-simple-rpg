# Entity System Refactoring Plan

## Progress Report

| Phase | Description | Status |
|------|-------------|--------|
| Phase 1 | Setup Interfaces and Base Structure | ✅ Complete |
| Phase 2 | Implement Core Behaviors | 🔄 Pending |
| Phase 3 | Refactor Existing Entities | 🔄 Pending |
| Phase 4 | Update Managers | 🔄 Pending |
| Phase 5 | Testing and Documentation | 🔄 Pending |

## Overview

This document outlines a plan to refactor the entity system in the Phaser3 Simple RPG game to create a more generic approach for handling non-player entities (NPCs and monsters). The current implementation has separate handling for monsters and NPCs, with significant code duplication. This refactoring will introduce a composition-based approach for all non-player entities while maintaining specialized behavior for different entity types.

## Current Implementation

### Entity Structure

- `/src/game-objects/Character.ts` - Base class for all character entities
  - `/src/game-objects/Player.ts` - Player character implementation
  - `/src/game-objects/enemies/Monster.ts` - Abstract class for hostile entities
    - `/src/game-objects/enemies/Treant.ts` - Specific monster implementation
    - `/src/game-objects/enemies/Mole.ts` - Specific monster implementation
  - NPC entities are handled inconsistently

### Constants & Asset Management

- `/src/constants/monsters.ts` - Only contains monster types
- `/src/constants/assets.ts` - Contains all entity assets including monsters and NPCs (Goku)

### Managers

- `/src/managers/EntityManager.ts` - Creates and manages player, NPCs, and monsters
- `/src/managers/PhysicsManager.ts` - Handles collision between entities
- `/src/managers/SpatialManager.ts` - Uses QuadTree for entity culling, specifically for monsters

## Proposed Changes: Composition-Based Approach

After evaluating different refactoring strategies, we've decided to implement a composition-based approach for entity management. This will provide maximum flexibility for creating diverse entity types with different combinations of behaviors.

### 1. Entity Composition Structure

```
Character (Base class)
├── Player
└── NonPlayerEntity (Container for behavior components)
    │
    ├── Behavior Components
    │   ├── MovementBehavior
    │   │   ├── WanderMovement
    │   │   ├── PatrolMovement
    │   │   ├── ChaseMovement
    │   │   └── StationaryMovement
    │   │
    │   ├── CombatBehavior
    │   │   ├── MeleeCombat
    │   │   ├── RangedCombat
    │   │   └── PassiveBehavior
    │   │
    │   ├── InteractionBehavior
    │   │   ├── DialogInteraction
    │   │   ├── ShopInteraction
    │   │   ├── QuestInteraction
    │   │   └── NoInteraction
    │   │
    │   └── AnimationBehavior
    │       ├── HumanoidAnimation
    │       ├── MonsterAnimation
    │       └── SimpleAnimation
    │
    └── Entity Instances (Created with specific behaviors)
        ├── Treant (ChaseMovement + RangedCombat + NoInteraction + MonsterAnimation)
        ├── Mole (ChaseMovement + MeleeCombat + NoInteraction + MonsterAnimation)
        ├── Villager (WanderMovement + PassiveBehavior + DialogInteraction + HumanoidAnimation)
        └── Shopkeeper (StationaryMovement + PassiveBehavior + ShopInteraction + HumanoidAnimation)
```

### 2. Constants Reorganization

Reorganize entity type constants in a new file structure:

```typescript
// /src/constants/entities.ts
export const ENTITIES = {
  HOSTILE: {
    TREANT: 'treant',
    MOLE: 'mole',
    // Future hostile entities...
  },
  FRIENDLY: {
    GOKU: 'goku',
    WIZARD: 'wizard',
    FEMALE_VILLAGER: 'female_villager',
    // Future friendly entities...
  }
} as const;
```

### 3. Behavior Interfaces

Create interfaces for each behavior type:

```typescript
// /src/behaviors/interfaces.ts

// Base behavior interface
export interface IBehavior {
  update(entity: NonPlayerEntity): void;
}

// Movement behavior
export interface IMovementBehavior extends IBehavior {
  move(entity: NonPlayerEntity, target?: Phaser.Math.Vector2): void;
  stop(entity: NonPlayerEntity): void;
}

// Combat behavior
export interface ICombatBehavior extends IBehavior {
  attack(entity: NonPlayerEntity, target: Character): void;
  takeDamage(entity: NonPlayerEntity, amount: number): void;
}

// Interaction behavior
export interface IInteractionBehavior extends IBehavior {
  interact(entity: NonPlayerEntity, player: Player): void;
  canInteract(entity: NonPlayerEntity, player: Player): boolean;
}

// Animation behavior
export interface IAnimationBehavior extends IBehavior {
  playAnimation(entity: NonPlayerEntity, state: string, orientation: Orientation): void;
  setupAnimations(entity: NonPlayerEntity): void;
}
```

### 4. NonPlayerEntity Base Class

Refactor the NonPlayerEntity class to act as a container for behavior components:

```typescript
// /src/game-objects/entities/NonPlayerEntity.ts
export class NonPlayerEntity extends Character implements INonPlayerEntity {
  // Entity type and properties
  public readonly entityType: EntityType;
  public readonly dialogKey?: string;
  public hp: number = 0;
  public readonly attackDamage: number = 1;
  
  // Behavior components
  private movementBehavior: IMovementBehavior;
  private combatBehavior: ICombatBehavior;
  private interactionBehavior: IInteractionBehavior;
  private animationBehavior: IAnimationBehavior;
  
  constructor(
    scene: AbstractScene, 
    x: number, 
    y: number, 
    texture: string,
    entityType: EntityType,
    options: {
      movement: IMovementBehavior,
      combat: ICombatBehavior,
      interaction: IInteractionBehavior,
      animation: IAnimationBehavior,
      hp?: number,
      dialogKey?: string,
      attackDamage?: number
    }
  ) {
    super(scene, x, y, texture);
    
    this.entityType = entityType;
    
    // Set up behaviors
    this.movementBehavior = options.movement;
    this.combatBehavior = options.combat;
    this.interactionBehavior = options.interaction;
    this.animationBehavior = options.animation;
    
    // Set up entity state
    this.hp = options.hp ?? 1;
    this.dialogKey = options.dialogKey;
    
    if (options.attackDamage !== undefined) {
      this.attackDamage = options.attackDamage;
    }
    
    // Initialize animations
    this.animationBehavior.setupAnimations(this);
  }
  
  // Main update method called by scene
  public updateEntity(): void {
    if (!this.active) return;
    
    this.movementBehavior.update(this);
    this.combatBehavior.update(this);
    this.interactionBehavior.update(this);
    // Animation behavior doesn't need updating every frame
  }
  
  // Delegate methods to appropriate behaviors
  public move(target?: Phaser.Math.Vector2): void {
    this.movementBehavior.move(this, target);
  }
  
  public attack(): void {
    if (this.scene.player) {
      this.combatBehavior.attack(this, this.scene.player);
    }
  }
  
  public loseHp(damage: number | Phaser.Physics.Arcade.Sprite): void {
    // Handle legacy behavior when receiving a sprite projectile
    if (typeof damage !== 'number') {
      damage.destroy();
      damage = 1; // Default damage amount for backward compatibility
    }
    
    this.combatBehavior.takeDamage(this, damage);
  }
  
  public interact(): void {
    if (this.scene.player) {
      this.interactionBehavior.interact(this, this.scene.player);
    }
  }
  
  public canInteract(player: Player): boolean {
    return this.interactionBehavior.canInteract(this, player);
  }
  
  public playAnimation(state: string, orientation: Orientation): void {
    this.animationBehavior.playAnimation(this, state, orientation);
  }
  
  // Behavior getters/setters (for runtime behavior changes)
  public getMovementBehavior(): IMovementBehavior {
    return this.movementBehavior;
  }
  
  public setMovementBehavior(behavior: IMovementBehavior): void {
    this.movementBehavior = behavior;
  }
  
  // Similar getters/setters for other behaviors...
}
```

## Implementation Plan

### Phase 1: Setup Interfaces and Base Structure ✅

1. ✅ Created behavior interfaces in `/src/behaviors/interfaces.ts`
   - Defined `IBehavior` as the base interface with an `update` method
   - Implemented `IMovementBehavior` with `move` and `stop` methods
   - Implemented `ICombatBehavior` with `attack` and `takeDamage` methods
   - Implemented `IInteractionBehavior` with `interact` and `canInteract` methods
   - Implemented `IAnimationBehavior` with `playAnimation` and `setupAnimations` methods
   - Added detailed JSDoc comments for all interfaces
   - Used forward reference for `NonPlayerEntity` to avoid circular dependency

2. ✅ Verified entity constants in `/src/constants/entities.ts`
   - Confirmed the file already had proper organization with `ENTITIES.HOSTILE` and `ENTITIES.FRIENDLY` categories
   - Verified that backward compatibility with `MONSTERS` constant was maintained
   - Confirmed type definitions for entity types were properly defined

3. ✅ Refactored `NonPlayerEntity` class to use behavior composition
   - Converted from abstract class to concrete implementation
   - Added behavior component properties (`movementBehavior`, `combatBehavior`, etc.)
   - Implemented constructor that accepts behavior components as options
   - Created delegate methods that forward to appropriate behaviors
   - Added behavior getters/setters to allow runtime behavior changes
   - Maintained backward compatibility with existing entity API

### Phase 2: Implement Core Behaviors

1. Movement Behaviors (`/src/behaviors/movement/`)
   - Create StationaryMovement (default, does nothing)
   - Create WanderMovement (random movement)
   - Create ChaseMovement (follows target when in range)
   - Create PatrolMovement (moves between set points)
   - Dependencies: `/src/behaviors/interfaces.ts`, `/src/game-objects/entities/NonPlayerEntity.ts`, `/src/game-objects/Character.ts`

2. Combat Behaviors (`/src/behaviors/combat/`)
   - Create PassiveBehavior (default, no combat)
   - Create MeleeCombat (short-range attacks)
   - Create RangedCombat (projectile attacks)
   - Dependencies: `/src/behaviors/interfaces.ts`, `/src/game-objects/entities/NonPlayerEntity.ts`, `/src/managers/PhysicsManager.ts`

3. Animation Behaviors (`/src/behaviors/animation/`)
   - Create SimpleAnimation (basic animations)
   - Create HumanoidAnimation (NPC animations)
   - Create MonsterAnimation (enemy animations)
   - Dependencies: `/src/behaviors/interfaces.ts`, `/src/game-objects/entities/NonPlayerEntity.ts`, `/src/game-objects/Character.ts`

### Phase 3: Refactor Existing Entities

1. Create EntityFactory class
   - Create factory methods for different entity types
   - Implement configurable creation with behavior options
   - Dependencies: `/src/constants/entities.ts`, `/src/behaviors/interfaces.ts`, `/src/game-objects/entities/NonPlayerEntity.ts`

2. Refactor Treant implementation
   - Convert to use composition with ChaseMovement, RangedCombat, etc.
   - Ensure backward compatibility with existing functionality
   - Dependencies: `/src/game-objects/enemies/Treant.ts`, `/src/behaviors/movement/ChaseMovement.ts`, `/src/behaviors/combat/RangedCombat.ts`, `/src/game-objects/entities/NonPlayerEntity.ts`

3. Refactor Mole implementation
   - Convert to use composition with ChaseMovement, MeleeCombat, etc.
   - Ensure backward compatibility with existing functionality
   - Dependencies: `/src/game-objects/enemies/Mole.ts`, `/src/behaviors/movement/ChaseMovement.ts`, `/src/behaviors/combat/MeleeCombat.ts`, `/src/game-objects/entities/NonPlayerEntity.ts`

4. Implement NPCs with behavior components
   - Create Villager, Shopkeeper, and other NPC types
   - Dependencies: `/src/constants/entities.ts`, `/src/behaviors/movement/WanderMovement.ts`, `/src/behaviors/movement/StationaryMovement.ts`, `/src/behaviors/interaction/DialogInteraction.ts`, `/src/behaviors/interaction/ShopInteraction.ts`

### Phase 4: Update Managers

1. Update EntityManager
   - Use EntityFactory to create entities
   - Support different entity types with appropriate behaviors
   - Dependencies: `/src/managers/EntityManager.ts`, `/src/constants/entities.ts`, `/src/behaviors/interfaces.ts`

2. Update PhysicsManager
   - Handle collisions based on entity behavior types
   - Implement interaction zones for interactable entities
   - Dependencies: `/src/managers/PhysicsManager.ts`, `/src/types/entities/entity-interfaces.ts`, `/src/behaviors/interfaces.ts`

3. Update SpatialManager
   - Handle all entity types in the quadtree
   - Use behavior type to determine update behavior
   - Dependencies: `/src/managers/SpatialManager.ts`, `/src/game-objects/entities/NonPlayerEntity.ts`, `/src/types/entities/entity-interfaces.ts`

### Phase 5: Testing and Documentation

1. Create comprehensive tests for behavior components
   - Test each behavior component individually
   - Test combinations of behaviors
   - Dependencies: `/src/behaviors/interfaces.ts`, `/src/behaviors/movement/`, `/src/behaviors/combat/`, `/src/behaviors/interaction/`, `/src/behaviors/animation/`

2. Document behavior interfaces and implementations
   - Create usage examples for new entity creation
   - Document behavior composition patterns
   - Dependencies: `/src/behaviors/interfaces.ts`, `docs/entity-system-refactoring.md`

3. Create end-to-end tests for entity interactions
   - Test player-entity interactions
   - Test entity-entity interactions
   - Dependencies: `/src/game-objects/Player.ts`, `/src/game-objects/entities/NonPlayerEntity.ts`, `/src/managers/EntityManager.ts`, `/src/managers/PhysicsManager.ts`

## Benefits of Composition Approach

1. **Maximum Flexibility**: Mix and match behaviors to create unique entities without deep inheritance hierarchies
2. **Easy Extension**: Add new behaviors without modifying existing code
3. **Better Reusability**: Share behaviors across different entity types
4. **Simpler Testing**: Test behaviors in isolation
5. **Runtime Behavior Changes**: Change entity behaviors dynamically during gameplay

## Migration Strategy

1. Implement the new system alongside the existing one
2. Convert entities one by one to the new system
3. Update manager classes to support both systems during transition
4. Once all entities are converted, remove legacy code

## Backward Compatibility

During the transition period, we'll maintain backward compatibility by:

1. Keeping the existing Monster class as a redirect to NonPlayerEntity with appropriate behaviors
2. Using factory methods that create entities with expected behaviors
3. Maintaining the same APIs for entity interaction in the manager classes

## Conclusion

This composition-based approach will provide much greater flexibility for creating diverse entity types while reducing code duplication. It aligns with modern game development practices and will make it easier to extend the game with new entity types and behaviors in the future.

## Next Steps

We've successfully completed Phase 1 of the refactoring plan:

- Created behavior interfaces in `src/behaviors/interfaces.ts`
- Confirmed entity constants in `src/constants/entities.ts` meet our requirements
- Refactored `NonPlayerEntity` class to use the behavior composition pattern

The next phase will be to implement the core behavior components:

- Develop movement behaviors (StationaryMovement, WanderMovement, ChaseMovement, PatrolMovement)
- Implement combat behaviors (PassiveBehavior, MeleeCombat, RangedCombat)
- Create interaction behaviors (NoInteraction, DialogInteraction, ShopInteraction)
- Design animation behaviors (SimpleAnimation, HumanoidAnimation, MonsterAnimation)

Once these behavior implementations are complete, we can begin refactoring the existing entity types to use the new composition system, ensuring backward compatibility throughout the process.
