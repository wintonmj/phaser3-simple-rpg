# Entity Factory Pattern

## Overview

The Entity Factory pattern centralizes entity creation logic in the game, making it easier to extend the system with new entity types while maintaining a clean separation of concerns.

## Key Components

### EntityFactory

The `EntityFactory` class is responsible for:

- Creating player and non-player entities
- Encapsulating entity-specific creation details
- Supporting behavior composition patterns

### Key Benefits

1. **Encapsulation**: Entity creation details are isolated in one place
2. **Extensibility**: New entity types can be added without modifying managers
3. **Reduced Dependencies**: Managers no longer need to import concrete entity classes
4. **Consistent Behavior Composition**: Factory ensures entities follow the behavior composition pattern

## Usage Example

```typescript
// Create the factory
const entityFactory = new EntityFactory(scene);

// Create a player
const player = entityFactory.createPlayer(x, y);

// Create an entity by type
const treant = entityFactory.createEntity(ENTITIES.TREANT, x, y);
```

## Architecture

This factory pattern uses a flat entity type structure in ENTITIES, making it simple to add new entity types without nested categories.

## Future Extensions

To add a new entity type:

1. Add the type to the `ENTITIES` constant
2. Create a concrete entity class implementing the appropriate behaviors
3. Add a case in the EntityFactory to handle the new type
4. Update the hostileEntities array in EntityManager if it's a hostile entity
5. No changes needed to other manager code 