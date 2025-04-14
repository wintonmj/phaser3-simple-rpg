# Animation System Documentation

## Overview

The animation system in the Phaser3 Simple RPG game is built around a centralized asset management approach. All animation keys and sprite references are defined in `src/constants/assets.ts` and are managed through the `Preloader` scene.

## Asset Management

### Assets Structure

The `assets.ts` file contains two main sections:

- `IMAGES`: Contains keys for all sprite assets
- `ANIMATIONS`: Contains keys for all animation configurations

Example from `assets.ts`:

```typescript
export const ASSETS = {
  IMAGES: {
    PLAYER_IDLE_DOWN: 'player-idle-down',
    PLAYER_WALK_DOWN: 'player-walk-down',
    // ... more image keys
  },
  ANIMATIONS: {
    PLAYER_MOVE_LEFT: 'player-move-left',
    PLAYER_MOVE_RIGHT: 'player-move-right',
    // ... more animation keys
  }
} as const;
```

## Animation Creation Process

### 1. Asset Loading

The `Preloader` scene handles loading all game assets through several methods:

- `loadAssets()`: Main method that coordinates asset loading
  - `loadPlayerAssets()`: Loads player spritesheets
  - `loadEnemyAssets()`: Loads enemy spritesheets
  - `loadMiscAssets()`: Loads miscellaneous spritesheets

### 2. Animation Creation

Animations are created in the `createAnimations()` method, which includes:

- `createPlayerAnimations()`: Creates player animations
  - Movement animations
  - Idle animations
  - Attack animations
  - Weapon attack animations
- `createEnemyAnimations()`: Creates enemy animations
  - Movement animations
  - Idle animations
- `createMiscAnimations()`: Creates miscellaneous animations
  - Death effects
  - Other special effects

### 3. Animation Helper Method

The `createAnimation()` helper method standardizes animation creation:

```typescript
private createAnimation(
  key: string,           // Animation key from ASSETS.ANIMATIONS
  spriteKey: string,     // Sprite key from ASSETS.IMAGES
  startFrame: number,    // Starting frame number
  endFrame: number,      // Ending frame number
  frameRate: number,     // Animation speed
  hideOnComplete: boolean = false  // Whether to hide sprite when animation finishes
) {
  this.anims.create({
    key,
    frames: this.anims.generateFrameNumbers(spriteKey, { start: startFrame, end: endFrame }),
    frameRate,
    repeat: -1,
    hideOnComplete
  });
}
```

## Usage in Game Objects

### Player Animations

The `Player` class uses animations through static animation configurations:

```typescript
private static MOVE_ANIMATION = {
  down: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_MOVE_DOWN },
  up: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_MOVE_UP },
  left: { flip: true, anim: ASSETS.ANIMATIONS.PLAYER_MOVE_LEFT },
  right: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_MOVE_RIGHT },
};
```

### Monster Animations

Monster classes (like `Treant` and `Mole`) extend the base `Monster` class and define their animations:

```typescript
protected WALK_ANIMATION = {
  down: { flip: false, anim: ASSETS.ANIMATIONS.TREANT_WALK_DOWN },
  up: { flip: false, anim: ASSETS.ANIMATIONS.TREANT_WALK_UP },
  left: { flip: true, anim: ASSETS.ANIMATIONS.TREANT_WALK_SIDE },
  right: { flip: false, anim: ASSETS.ANIMATIONS.TREANT_WALK_SIDE },
};
```

## Animation Types

### Movement Animations

- Player movement in four directions
- Enemy movement in four directions
- Each direction has its own animation key and sprite

### Combat Animations

- Player attack animations
- Player weapon attack animations
- Monster attack animations
- Death animations

### Idle Animations

- Player idle animations for each direction
- Monster idle animations

## Best Practices

1. **Centralized Management**: Always define new animation keys in `assets.ts`
2. **Consistent Naming**: Follow the established naming convention:
   - `{entity}-{action}-{direction}`
   - Example: `player-move-down`, `treant-walk-side`
3. **Frame Configuration**: 
   - Movement animations typically use frames 0-2 or 0-3
   - Attack animations may use different frame ranges
   - Frame rates vary by animation type (typically 7-10 fps)
4. **Sprite Flipping**: Use the `flip` property for left/right animations to reuse sprites

## Adding New Animations

To add a new animation:

1. Add the sprite key to `ASSETS.IMAGES`
2. Add the animation key to `ASSETS.ANIMATIONS`
3. Load the sprite in the appropriate `load*Assets()` method
4. Create the animation in the appropriate `create*Animations()` method
5. Use the animation in the relevant game object class 