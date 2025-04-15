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

The refactored architecture divides these responsibilities into logical groupings, with each group becoming a specialized manager class that extends a common `BaseManager` class:

### 0. BaseManager (Implemented)

**Responsibilities:**
- Provide a common interface for all managers
- Store reference to the scene
- Facilitate communication between managers
- Define common lifecycle methods (initialize, shutdown)

### 1. MapManager

**Responsibilities:**

- Map creation and initialization
- Tilemap and layer management
- Physics world boundaries
- Map layer culling and visibility

### 2. EntityManager (Implemented)

**Responsibilities:**

- Player initialization and management
- NPC creation and management
- Monster spawning and lifecycle
- Entity state management

### 3. SpatialManager (Implemented)

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

### 8. ObjectPoolManager (Implemented)

**Responsibilities:**
- Create and manage object pools for reusable game objects
- Provide access to specific object pools
- Handle cleanup of pooled objects

## Dependency Tree

```
                +---------------+
                | AbstractScene |
                +-------+-------+
                        |
                        v
                +---------------+
                |  BaseManager  |
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
     |      +----+------+        |
     |           |               |
     |           |         +-----v-------+
+----v-----------v-------->|ObjectPoolMan|
|   PhysicsManager    |    +-------------+
+---------------------+
```

## Key Dependencies

1. **AbstractScene**: Central coordinator that initializes and manages all specialized managers

2. **BaseManager**: 
   - Abstract base class that all managers extend
   - Provides references to other managers
   - Defines common lifecycle methods

3. **MapManager**:
   - Provides map data to EntityManager for spawns
   - Sends collision layers to PhysicsManager

4. **EntityManager**:
   - Gets spawn locations from MapManager
   - Accesses SpatialManager via BaseManager
   - Accesses ObjectPoolManager via BaseManager
   - Provides entity references to PhysicsManager
   - Gives player object to CameraManager

5. **SpatialManager**:
   - Gets entities from EntityManager
   - Provides culling info to EntityManager
   - Requests camera bounds from CameraManager

6. **PhysicsManager**:
   - Receives entities from EntityManager
   - Gets collision layers from MapManager
   - Handles collision callbacks

7. **InputManager**:
   - Provides input state to EntityManager (player)
   - Sends key events to SceneFlowManager

8. **CameraManager**:
   - Follows player from EntityManager
   - Gets bounds from MapManager
   - Provides view bounds to SpatialManager

9. **SceneFlowManager**:
   - Manages scene transitions
   - Gets player position from EntityManager
   - Uses InputManager for keyboard shortcuts

10. **ObjectPoolManager**:
    - Creates and manages reusable object pools
    - Provides access to pools for other managers

## Implementation Strategy

### Phase 1: Create a Common BaseManager (Completed)

1. Create a `BaseManager` abstract class with:
   - Scene reference
   - References to other managers
   - Abstract initialize() and shutdown() methods
   - Getter/setter methods for manager references

### Phase 2: Extract QuadTree (Completed)

The QuadTree implementation has been extracted to `src/utils/QuadTree.ts`

### Phase 3: Implement Core Manager Classes (Partially Completed)

Completed:
- EntityManager
- SpatialManager
- ObjectPoolManager

Each extends BaseManager and implements its specialized interface.

Remaining:
- MapManager
- PhysicsManager
- InputManager
- CameraManager
- SceneFlowManager

### Phase 4: Create Manager Interfaces (Partially Completed)

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

### Phase 5: Refactor AbstractScene

Update AbstractScene to:
1. Initialize all manager instances
2. Set up manager references using BaseManager methods
3. Delegate responsibilities to appropriate managers
4. Coordinate high-level game flow

## Benefits

1. **Improved Maintainability**: Each class has a single responsibility
2. **Better Testability**: Smaller classes are easier to unit test
3. **Reduced Complexity**: Class relationships are clearly defined
4. **Easier Onboarding**: New developers can understand isolated components
5. **More Flexible Architecture**: Components can be modified independently
6. **Decoupled Dependencies**: Managers access each other through BaseManager methods

## Best Practices

1. Use BaseManager for manager references rather than direct instantiation
2. Initialize all managers in AbstractScene
3. Set up manager references using setter methods
4. Keep manager API surfaces small and focused
5. Use TypeScript interfaces to define clear contracts
6. Document manager responsibilities and relationships
7. Consider using an event system for additional cross-manager communication 