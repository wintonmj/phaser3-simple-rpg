# Entity System Refactoring Plan

## Overview

This document outlines a plan to refactor the entity system in the Phaser3 Simple RPG game to create a more generic approach for handling non-player entities (NPCs and monsters). The current implementation has separate handling for monsters and NPCs, with significant code duplication. This refactoring will introduce a common base class for all non-player entities while maintaining specialized behavior for hostile entities.

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

## Proposed Changes

### 1. Entity Hierarchy Refactoring

```
Character (Base class)
├── Player
└── NonPlayerEntity (NEW abstract class)
    ├── FriendlyEntity (NEW abstract class for NPCs)
    │   ├── StaticNPC
    │   └── MovingNPC
    └── HostileEntity (Renamed from Monster)
        ├── Treant
        ├── Mole
        └── Future monster types...
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

### 3. NonPlayerEntity Base Class

Create a new abstract base class that handles common functionality for all non-player entities:

```typescript
// /src/game-objects/entities/NonPlayerEntity.ts
/**
 * Abstract base class for all non-player entities
 * Provides common functionality for appearance, animation, and basic movement
 */
export abstract class NonPlayerEntity extends Character {
  // Common properties
  protected abstract IDLE_ANIMATION: CharacterAnimation;
  protected abstract WALK_ANIMATION: CharacterAnimation;
  
  // Basic behavior methods
  public abstract updateEntity(): void;
  protected abstract beIdle(): void;
  
  // Common movement methods
  protected move(x: number, y: number, speed: number): void {
    // Implementation...
  }
  
  // Common animation methods
  protected animate(animation: CharacterAnimation, orientation: Orientation): void {
    // Implementation...
  }
}
```

### 4. FriendlyEntity Class

```typescript
// /src/game-objects/entities/FriendlyEntity.ts
/**
 * Abstract base class for all friendly NPCs
 */
export abstract class FriendlyEntity extends NonPlayerEntity {
  // NPC-specific properties
  protected dialogKey?: string;
  protected interactionZone: Phaser.GameObjects.Zone;
  
  // NPC behavior methods
  public interact(): void {
    // Implementation...
  }
  
  public updateEntity(): void {
    // Basic NPC behavior - can be overridden by specific NPCs
    this.wander();
  }
}
```

### 5. HostileEntity Class (renamed from Monster)

```typescript
// /src/game-objects/entities/HostileEntity.ts
/**
 * Abstract base class for all hostile entities
 */
export abstract class HostileEntity extends NonPlayerEntity {
  // Hostile-specific properties
  protected hp: number;
  protected attackDamage: number;
  protected isStartled: boolean = false;
  
  // Hostile behavior methods
  public attack(): void {
    // Implementation...
  }
  
  public loseHp(damage: number): void {
    // Implementation...
  }
  
  public updateEntity(): void {
    if (!this.active) return;
    this.handleChase();
  }
  
  protected abstract animateAttack(): void;
  private handleChase(): void {
    // Implementation...
  }
}
```

## Implementation Considerations

### 1. EntityManager Updates

The `EntityManager` needs to be updated to handle the new entity hierarchy:

- Create separate methods for friendly and hostile entities
- Use factory methods to create entities based on type
- Update type casting and TypeScript interfaces

```typescript
// /src/managers/EntityManager.ts
public createNonPlayerEntities(): void {
  // Create all non-player entities
  this.createFriendlyEntities();
  this.createHostileEntities();
}

private createFriendlyEntities(): void {
  // Create NPCs from map data
}

private createHostileEntities(): void {
  // Create hostile entities from map data
}
```

### 2. Physics System Considerations

The `PhysicsManager` must be updated to handle different collision behaviors:

- Player-friendly collisions (blocking or triggering dialog)
- Player-hostile collisions (damage)
- Friendly-hostile collisions (NPCs might be attacked)
- Entity-world collisions (all entities should collide with the world)

```typescript
// /src/managers/PhysicsManager.ts
public setupColliders(
  player: Player,
  layers: MapLayers,
  friendlyEntities: FriendlyEntity[],
  hostileEntities: HostileEntity[]
): void {
  // Create entity groups
  const friendlyGroup = this.createGroup(friendlyEntities);
  const hostileGroup = this.createGroup(hostileEntities);
  
  // Set up world collisions for all entities
  
  // Set up player-friendly interactions
  
  // Set up player-hostile interactions
  
  // Optionally set up friendly-hostile interactions
}
```

### 3. Spatial Management Updates

The `SpatialManager` currently only handles monsters but should be updated to:

- Track all non-player entities in the quadtree
- Implement different culling distances for friendly vs. hostile entities
- Use entity type to determine update behavior

```typescript
// /src/managers/SpatialManager.ts
public update(cameraBounds: Phaser.Geom.Rectangle, playerPosition: Phaser.Math.Vector2): void {
  // Clear existing quadtree
  this.quadTree.clear();
  
  // Get expanded bounds
  const expandedBounds = /* calculation */;
  
  // Insert all entities that are active and within expanded bounds
  this.entities.forEach(entity => {
    if (!entity.active) return;
    
    if (entity instanceof NonPlayerEntity) {
      // Insert into quadtree with appropriate type information
      this.quadTree.insert(entity);
    }
  });
  
  // Update active entities based on distance and type
  this.updateActiveEntities(playerPosition);
}
```

### 4. Asset and Animation Updates

The `Preloader` scene must be updated to:

- Organize asset loading by entity type
- Create consistent animation patterns for all entity types
- Ensure all entities follow the same animation conventions

```typescript
// /src/scenes/Preloader.ts
private loadAssets() {
  // Load maps
  this.loadMaps();
  
  // Load images
  this.loadImages();
  
  // Load player assets
  this.loadPlayerAssets();
  
  // Load non-player entity assets (grouped by type)
  this.loadNonPlayerAssets();
}

private loadNonPlayerAssets() {
  this.loadHostileEntityAssets();
  this.loadFriendlyEntityAssets();
}
```

## Migration Strategy

### Phase 1: Constants and Interfaces

✅ 1. Update `/src/constants/monsters.ts` to `/src/constants/entities.ts` and create re-export for compatibility

- Created `/src/constants/entities.ts` with organized entity type constants
- Added TypeScript type definitions (HostileEntityType, FriendlyEntityType, EntityType)
- Created backward compatibility re-export in `/src/constants/monsters.ts`

✅ 2. Create interfaces for the new class hierarchy

- Created `/src/types/entities/entity-interfaces.ts` with INonPlayerEntity, IFriendlyEntity, IHostileEntity interfaces

✅ 3. Create extended manager interfaces to support the new entity hierarchy

- Created `/src/types/entity-manager-interfaces.ts` with IExtendedEntityManager interface
- Created `/src/types/physics-manager-interfaces.ts` with IExtendedPhysicsManager interface
- Created `/src/types/spatial-manager-interfaces.ts` with IExtendedSpatialManager interface

### Phase 2: Refactor Monster to NonPlayerEntity

✅ 1. Rename the `Monster` class to `NonPlayerEntity`
   - Created a new `NonPlayerEntity` class in `/src/game-objects/entities/NonPlayerEntity.ts`
   - Copied all functionality from `Monster` class
   - Renamed methods and variables from monster-specific to more generic entity terms

✅ 2. Update all references to `Monster` to use `NonPlayerEntity`
   - Updated `Treant` and `Mole` classes to extend `NonPlayerEntity`
   - Created backward compatibility re-export in original `Monster.ts` file

✅ 3. Keep all existing hostile behaviors in `NonPlayerEntity` temporarily
   - Maintained chase, attack, and HP functionality in `NonPlayerEntity`

✅ 4. Make sure all current monster implementations extend the new `NonPlayerEntity` class
   - Both `Treant` and `Mole` classes now extend `NonPlayerEntity`

✅ 5. Test to ensure existing monster functionality is preserved
   - Updated `SpatialManager` to call `updateEntity()` instead of `updateMonster()`
   - Verified that monster behavior remains the same

### Phase 3: Extract Hostile Behavior

1. Create a new `HostileEntity` class that extends `NonPlayerEntity`
2. Move all hostile-specific behaviors from `NonPlayerEntity` to `HostileEntity`
   - Combat mechanics (attack, loseHp)
   - Chase behavior
   - Hostile animations
3. Update existing monster implementations to extend `HostileEntity`
4. Test to ensure all hostile entity functionality works as expected

### Phase 4: Implement Friendly Entities

1. Create the `FriendlyEntity` class extending `NonPlayerEntity`
2. Implement common NPC behaviors in `FriendlyEntity`
   - Dialog triggers
   - Interaction zones
   - Idle and wandering behaviors
3. Create specific friendly entity implementations (e.g., `GokuNPC`, `VillagerNPC`)
4. Test friendly entity behavior

### Phase 5: Manager Updates

1. Update `EntityManager` to use the new class hierarchy
   - Add factory methods for different entity types
   - Update entity creation logic
2. Refactor `PhysicsManager` for the new collision types
3. Update `SpatialManager` to handle all entity types

### Phase 6: Polish and Cleanup

1. Review for any remaining code duplication
2. Ensure consistent naming and patterns across entity classes
3. Update documentation and comments
4. Final thorough testing of all entity interactions

## Benefits

1. **Reduced Code Duplication**: Common behavior shared between NPCs and monsters
2. **Improved Type Safety**: Properly typed entity hierarchy
3. **Better Organization**: Clear separation between entity types
4. **Easier Extensibility**: Simplified process for adding new entity types
5. **Consistent Behavior**: Standardized approach to entity movement, animation, and interactions

## Backward Compatibility Cleanup

After the refactoring is complete, the following items should be addressed to clean up temporary backward compatibility elements:

### Removal of Deprecated Files

- [ ] TODO: Remove `/src/constants/monsters.ts` re-export file after updating all imports to use `/src/constants/entities.ts`
- [ ] TODO: Remove the original `/src/game-objects/enemies/Monster.ts` re-export file after all code is migrated to use `NonPlayerEntity` or `HostileEntity`

### Interface and Type Cleanup

- [ ] TODO: Update type definitions in `QuadTree.ts` to use `NonPlayerEntity` instead of `Monster`
- [ ] TODO: Migrate from `IExtendedEntityManager` to replace the original `IEntityManager` interface
- [ ] TODO: Migrate from `IExtendedPhysicsManager` to replace the original `IPhysicsManager` interface 
- [ ] TODO: Migrate from `IExtendedSpatialManager` to replace the original `ISpatialManager` interface
- [ ] TODO: Remove legacy type references to `Monster` in all manager interfaces
- [ ] TODO: Update all imports throughout the codebase to use the new entity types

### Code Reference Updates

- [ ] TODO: Update `EntityManager.createMonsters()` to `EntityManager.createHostileEntities()`
- [ ] TODO: Update `EntityManager.getMonsters()` to return appropriate entity types
- [ ] TODO: Rename monster-related constants in `SpatialManager` (e.g., `MONSTER_UPDATE_DISTANCE` to `ENTITY_UPDATE_DISTANCE`)
- [ ] TODO: Update any remaining hardcoded string references to 'monsters' in map parsing
- [ ] TODO: Update all `instanceof Monster` checks to use appropriate entity type checks:
  ```typescript
  // Change from:
  if (entity instanceof Monster) {
    // ...
  }
  
  // To:
  if (entity instanceof NonPlayerEntity) { // or HostileEntity where appropriate
    // ...
  }
  ```

### Testing for Complete Migration

- [ ] TODO: Create a comprehensive test suite that validates all entity behaviors
- [ ] TODO: Run static code analysis to verify no references to old class structure remain
- [ ] TODO: Test each entity type to ensure special behaviors are preserved
- [ ] TODO: Performance test to ensure the new structure doesn't negatively impact game performance
- [ ] TODO: Create a full test run through the game to verify all NPC and monster interactions work correctly

## Conclusion

This refactoring will provide a more maintainable and extensible entity system that can accommodate a wider variety of non-player entities while reducing code duplication and improving type safety. The changes focus on creating a clear hierarchy of entity types with shared behavior while maintaining the specialized behavior needed for different entity categories.
