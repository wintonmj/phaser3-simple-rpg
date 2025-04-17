# phaser3-simple-rpg

[![Build Status](https://travis-ci.org/pierpo/phaser3-simple-rpg.svg?branch=master)](https://travis-ci.org/pierpo/phaser3-simple-rpg)

## Presentation

This is just an ambition free project that I developed as an exercice with Typescript and Phaser.

Some things are out-to-date and some patterns I hadn't the knowledge of would greatly improve the readability now!

## Prerequisites

- Node.js (Latest LTS version recommended)
- npm or yarn
- A modern browser (Chrome, Firefox, Safari, or Edge)
- [Tiled](https://www.mapeditor.org/) for map edition

## Animation System

The game uses a centralized animation system with the following components:

### Entity-Animation Mapping

The animation system provides a clear mapping between entity types and their animation configurations through:

- `entity-animations.ts`: Defines a central mapping between entity types and their animation configurations
- `ENTITY_DIMENSIONS`: Provides a single source of truth for sprite dimensions
- `ENTITY_ANIMATIONS`: Maps entity types to their corresponding animation sets
- Utility functions like `getAnimationsForEntity()` and `getDimensionsForEntity()`

### Character States

Character states (like IDLE, MOVE, ATTACK) are centralized in a single enum in `character-states.ts`. All animation configurations use these states as keys for consistency.

### BaseEntityAnimation

The `BaseEntityAnimation` class was refactored to use the centralized mapping system:

- Added a static factory method `forEntityType()` that creates animation behavior for any entity type
- Simplified the constructor to take a complete animation set
- Maintains backward compatibility for legacy code

### Usage

To add animations for a new entity:

1. Add the entity type to `ENTITIES` in `entities.ts`
2. Add the entity dimensions to `ENTITY_DIMENSIONS` in `entity-animations.ts`
3. Add animation configurations in `animation-configs.ts` using `CharacterState` enum values as keys
4. Register the animations in `ENTITY_ANIMATIONS` in `entity-animations.ts`

To use animations in an entity class:

```typescript
// Create animation behavior for an entity type
const animationBehavior = BaseEntityAnimation.forEntityType(ENTITIES.MY_ENTITY);
```

## Installation

```bash
npm install   # or yarn install
npm start     # or yarn start
```

That's it 😊

## Dependencies

The project uses the following key dependencies:
- Phaser 3.70.0
- TypeScript 5.3.3
- Webpack 5.90.3
- Jest 29.7.0 for testing

## Credits

Assets by [ansimuz](https://opengameart.org/content/tiny-rpg-forest)
