# Entity System Refactoring Plan

## Overview

This document outlines a plan to refactor the entity system in the Phaser3 Simple RPG game to create a more generic approach for handling non-player entities (NPCs and monsters). The current implementation has separate handling for monsters and NPCs, with significant code duplication. This refactoring will introduce a common base class for all non-player entities while maintaining specialized behavior for hostile entities.

## Current Implementation

### Entity Structure

- `Character` - Base class for all character entities
  - `Player` - Player character implementation
  - `Monster` - Abstract class for hostile entities
    - `Treant` - Specific monster implementation
    - `Mole` - Specific monster implementation
  - NPC entities are handled inconsistently

### Constants & Asset Management

- `src/constants/monsters.ts` - Only contains monster types
- `src/constants/assets.ts` - Contains all entity assets including monsters and NPCs (Goku)

### Managers

- `EntityManager` - Creates and manages player, NPCs, and monsters
- `PhysicsManager` - Handles collision between entities
- `SpatialManager` - Uses QuadTree for entity culling, specifically for monsters

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

Extend `src/constants/monsters.ts` to include all entity types:

```typescript
export const ENTITIES = {
  HOSTILE: {
    TREANT: 'treant',
    MOLE: 'mole',
    // Future hostile entities...
  },
  FRIENDLY: {
    GOKU: 'goku',
    
    // Future friendly entities...
  }
} as const;
```

### 3. NonPlayerEntity Base Class

Create a new abstract base class that handles common functionality for all non-player entities:

```typescript
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

1. Update `src/constants/monsters.ts` to `src/constants/entities.ts`
2. Create interfaces for the new class hierarchy
3. Update TypeScript types throughout the codebase

### Phase 2: Refactor Monster to NonPlayerEntity

1. Rename the `Monster` class to `NonPlayerEntity`
2. Update all references to `Monster` to use `NonPlayerEntity`
3. Keep all existing hostile behaviors in `NonPlayerEntity` temporarily
4. Make sure all current monster implementations extend the new `NonPlayerEntity` class
5. Test to ensure existing monster functionality is preserved

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

## Conclusion

This refactoring will provide a more maintainable and extensible entity system that can accommodate a wider variety of non-player entities while reducing code duplication and improving type safety. The changes focus on creating a clear hierarchy of entity types with shared behavior while maintaining the specialized behavior needed for different entity categories. 