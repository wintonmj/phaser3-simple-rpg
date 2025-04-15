# AbstractScene Refactoring Plan

## Overview

The `AbstractScene` class in `src/scenes/AbstractScene.ts` currently handles numerous responsibilities, creating a monolithic class that is difficult to maintain and test. This document outlines a plan to refactor the class into smaller, more focused components following the Single Responsibility Principle.

## Current Responsibilities

The `AbstractScene` class currently handles:

1. Map creation and management
2. Player initialization and position management 
3. NPC initialization and interaction handling
4. Monster/enemy management and AI
5. Camera setup and following behavior
6. Physics world configuration and collision handling
7. Input processing and keyboard state tracking
8. Scene transitions and zone management
9. Spatial partitioning via custom QuadTree implementation
10. Performance optimization through entity culling
11. Object pooling for particles and projectiles
12. Memory management during scene lifecycle
13. Batched physics operations
14. Frame-based update scheduling
15. Map layer culling and visibility

## Proposed Architecture

The refactored architecture divides these responsibilities into logical groupings, with each group becoming a specialized manager class:

### 1. MapManager

**Responsibilities:**

- Map creation and initialization
- Tilemap and layer management
- Physics world boundaries
- Map layer culling and visibility

### 2. EntityManager

**Responsibilities:**

- Player initialization and management
- NPC creation and management
- Monster spawning and lifecycle
- Object pooling for particles and projectiles

### 3. SpatialManager

**Responsibilities:**

- QuadTree implementation and management
- Entity culling based on distance
- Spatial partitioning optimization
- Active entity tracking

### 4. PhysicsManager

**Responsibilities:**

- Collision detection and handling
- Batched physics operations
- Physics group management
- Collision callbacks

### 5. InputManager

**Responsibilities:**

- Keyboard state tracking
- Input processing
- Key mapping and shortcuts

### 6. CameraManager

**Responsibilities:**

- Camera setup and configuration
- Player following behavior
- Camera bounds and culling

### 7. SceneFlowManager

**Responsibilities:**

- Scene transitions
- Zone management
- Scene lifecycle (init, shutdown)
- Memory cleanup

## Dependency Tree

```
                +---------------+
                | AbstractScene |
                +-------+-------+
                        |
        +---------------+---------------+
        |       |       |       |       |
+-------v--+ +--v-----+ | +-----v----+  |
|MapManager| |EntityMan| | |SceneFlow |  |
+----+-----+ +----+----+ | |Manager   |  |
     |           |       | +-+--------+  |
     |      +----v------+|   |           |
     |      |SpatialMan |+---+           |
     |      +----+------+                |
     |           |          +------------v--+
     |      +----v------+   |InputManager   |
     |      |CameraMan  |   +---------------+
     |      +----+------+
     |           |
+----v-----------v----+
|   PhysicsManager    |
+---------------------+
```

## Key Dependencies

1. **AbstractScene**: Central coordinator that initializes and manages all specialized managers

2. **MapManager**:
   - Provides map data to EntityManager for spawns
   - Sends collision layers to PhysicsManager

3. **EntityManager**:
   - Gets spawn locations from MapManager
   - Registers entities with SpatialManager
   - Provides entity references to PhysicsManager
   - Gives player object to CameraManager

4. **SpatialManager**:
   - Gets entities from EntityManager
   - Provides culling info to EntityManager
   - Requests camera bounds from CameraManager

5. **PhysicsManager**:
   - Receives entities from EntityManager
   - Gets collision layers from MapManager
   - Handles collision callbacks

6. **InputManager**:
   - Provides input state to EntityManager (player)
   - Sends key events to SceneFlowManager

7. **CameraManager**:
   - Follows player from EntityManager
   - Gets bounds from MapManager
   - Provides view bounds to SpatialManager

8. **SceneFlowManager**:
   - Manages scene transitions
   - Gets player position from EntityManager
   - Uses InputManager for keyboard shortcuts

## Implementation Strategy

### Phase 1: Extract QuadTree

The QuadTree implementation is a natural first candidate for extraction as it's already a well-encapsulated piece of functionality.

1. Create a new file `src/utils/QuadTree.ts`
2. Move the QuadTree class implementation
3. Update imports in AbstractScene

### Phase 2: Create Manager Interfaces

Define interfaces for each manager to establish clear contracts:

```typescript
// Example interface
interface IEntityManager {
  initialize(map: Phaser.Tilemaps.Tilemap, data: InterSceneData): void;
  createPlayer(position: Phaser.Types.Math.Vector2Like): Player;
  createNPCs(): void;
  createMonsters(): void;
  getPlayer(): Player;
  getNPCs(): Npc[];
  getMonsters(): Monster[];
  update(): void;
  shutdown(): void;
}
```

### Phase 3: Implement Manager Classes

Implement each manager class according to its interface, moving code from AbstractScene.

### Phase 4: Refactor AbstractScene

Update AbstractScene to use the new manager classes, gradually replacing direct implementations with manager method calls.

## Benefits

1. **Improved Maintainability**: Each class has a single responsibility
2. **Better Testability**: Smaller classes are easier to unit test
3. **Reduced Complexity**: Class relationships are clearly defined
4. **Easier Onboarding**: New developers can understand isolated components
5. **More Flexible Architecture**: Components can be modified independently

## Best Practices

1. Use dependency injection to provide manager dependencies
2. Keep manager API surfaces small and focused
3. Use TypeScript interfaces to define clear contracts
4. Document manager responsibilities and relationships
5. Consider using an event system for cross-manager communication 