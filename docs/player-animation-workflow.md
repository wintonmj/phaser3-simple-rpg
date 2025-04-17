# Player Animation Workflow

## Overview

This document describes the complete workflow for how Player animations are loaded, configured, and played in the game. The system follows a component-based architecture where animations are defined in configuration files and attached to the Player through behavior classes.

## Key Components and Files

### 1. Constants and Configuration

#### Character States (`src/constants/character-states.ts`)
Defines all possible animation states for characters:
```typescript
export enum CharacterState {
  IDLE = 'idle',
  MOVE = 'move',
  DEATH = 'death',
  ATTACK = 'attack',
  HIT = 'hit',
  RELOADING = 'reloading',
  SHOOTING = 'shooting',
  PUNCHING = 'punching',
  // Can be expanded with more states
}
```

#### Asset Definitions (`src/constants/assets.ts`)
Contains all animation and image keys used throughout the game:
```typescript
export const ASSETS = {
  IMAGES: {
    PLAYER_IDLE_DOWN: 'player-idle-down',
    PLAYER_IDLE_UP: 'player-idle-up',
    PLAYER_IDLE_SIDE: 'player-idle-side',
    PLAYER_WALK_DOWN: 'player-walk-down',
    // Other image keys...
  },
  ANIMATIONS: {
    PLAYER_MOVE_LEFT: 'player-move-left',
    PLAYER_MOVE_RIGHT: 'player-move-right',
    PLAYER_MOVE_UP: 'player-move-up',
    PLAYER_MOVE_DOWN: 'player-move-down',
    // Other animation keys...
  }
}
```

#### Animation Configurations (`src/constants/animation-configs.ts`)
Maps character states to specific animations for each orientation:
```typescript
export const PLAYER_ANIMATIONS: Record<CharacterState, CharacterAnimation> = {
  ...createIdleBasedAnimations(),
  [CharacterState.MOVE]: {
    down: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_MOVE_DOWN },
    up: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_MOVE_UP },
    left: { flip: true, anim: ASSETS.ANIMATIONS.PLAYER_MOVE_LEFT },
    right: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_MOVE_RIGHT },
  },
  [CharacterState.ATTACK]: {
    down: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_ATTACK_DOWN },
    up: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_ATTACK_UP },
    left: { flip: true, anim: ASSETS.ANIMATIONS.PLAYER_ATTACK_SIDE },
    right: { flip: false, anim: ASSETS.ANIMATIONS.PLAYER_ATTACK_SIDE },
  },
  // Other state animations...
}
```

### 2. Interfaces and Behaviors

#### Animation Behavior Interface (`src/behaviors/interfaces.ts`)
Defines the contract for animation behaviors:
```typescript
export interface IAnimationBehavior extends IBehavior {
  playAnimation(character: Character, state: CharacterState, orientation: Orientation): void;
  setupAnimations(character: Character): void;
}
```

#### Animation Behavior Implementation (`src/behaviors/animation/BaseEntityAnimation.ts`)
The central class responsible for playing animations based on state and orientation:
```typescript
export class BaseEntityAnimation implements IAnimationBehavior {
  private animationSets: Partial<Record<CharacterState, CharacterAnimation>>;

  constructor(animationSets: Partial<Record<CharacterState, CharacterAnimation>>) {
    this.animationSets = animationSets;
  }

  playAnimation(character: Character, state: CharacterState, orientation: Orientation): void {
    // Get animation data for the state and orientation
    const { flip, anim } = this.animationSets[state][orientation];
    
    // Set flipping and play the animation
    character.setFlipX(flip);
    character.play(anim, shouldRepeat);
    
    // Apply additional visual effects based on state
    // (tinting for hit states, etc.)
  }
  
  // Other methods...
}
```

### 3. Asset Loading and Animation Creation

#### Preloader Scene (`src/scenes/Preloader.ts`)
Responsible for loading all assets and creating the animations:

```typescript
// Loading spritesheets
private loadPlayerAssets() {
  this.loadPlayerSpritesheet(ASSETS.IMAGES.PLAYER_IDLE_DOWN, 'assets/spritesheets/hero/idle/hero-idle-front.png');
  this.loadPlayerSpritesheet(ASSETS.IMAGES.PLAYER_IDLE_UP, 'assets/spritesheets/hero/idle/hero-idle-back.png');
  this.loadPlayerSpritesheet(ASSETS.IMAGES.PLAYER_IDLE_SIDE, 'assets/spritesheets/hero/idle/hero-idle-side.png');
  // Other spritesheets...
}

// Creating animations
private createPlayerAnimations() {
  this.createAnimation(ASSETS.ANIMATIONS.PLAYER_MOVE_LEFT, ASSETS.IMAGES.PLAYER_WALK_SIDE, 0, 2, 10);
  this.createAnimation(ASSETS.ANIMATIONS.PLAYER_MOVE_RIGHT, ASSETS.IMAGES.PLAYER_WALK_SIDE, 0, 2, 10);
  this.createAnimation(ASSETS.ANIMATIONS.PLAYER_MOVE_UP, ASSETS.IMAGES.PLAYER_WALK_UP, 0, 2, 10);
  this.createAnimation(ASSETS.ANIMATIONS.PLAYER_MOVE_DOWN, ASSETS.IMAGES.PLAYER_WALK_DOWN, 0, 2, 10);
  // Other animations...
}

// Helper method for creating animations
private createAnimation(key, spriteKey, startFrame, endFrame, frameRate, hideOnComplete = false) {
  this.anims.create({
    key,
    frames: this.anims.generateFrameNumbers(spriteKey, { start: startFrame, end: endFrame }),
    frameRate,
    repeat: -1,
    hideOnComplete
  });
}
```

### 4. Player Class Implementation

#### Character Base Class (`src/game-objects/Character.ts`)
Manages character state and animations:

```typescript
export abstract class Character extends Phaser.Physics.Arcade.Sprite {
  protected orientation: Orientation = Orientation.Down;
  protected actionState: CharacterState = CharacterState.IDLE;
  protected animationBehavior: BaseEntityAnimation;
  
  // Other properties...
  
  public setState(state: CharacterState): void {
    // Only change state if allowed to
    if (!this.canChangeToState(state)) {
      return;
    }
    
    // Update the state
    this.actionState = state;
    
    // Play the appropriate animation
    if (this.animationBehavior) {
      this.animationBehavior.playAnimation(this, state, this.orientation);
    }
  }
  
  // Other methods...
}
```

#### Player Class (`src/game-objects/Player.ts`)
Extends Character and sets up the animation behavior:

```typescript
export class Player extends Character {
  constructor(scene: AbstractScene, x: number, y: number) {
    super(scene, x, y, ASSETS.IMAGES.PLAYER_IDLE_DOWN);

    // Set up player-specific properties
    this._maxHp = Player.MAX_HP;
    this.hp = this._maxHp;
    this.setSize(10, 10);
    this.setDepth(10);
    this.moveSpeed = 120;

    // Set up animation behavior using the player animations
    const animationBehavior = new BaseEntityAnimation(PLAYER_ANIMATIONS);
    this.setAnimationBehavior(animationBehavior);
    
    // Equip a default weapon (bow)
    WeaponFactory.equipCharacterWithWeapon(this, WeaponType.RANGED);
  }
  
  // Other methods...
}
```

## Animation Workflow Sequence

1. **Configuration**: Animation states, asset keys, and animation mappings are defined in constants
2. **Asset Loading**: The Preloader scene loads all player spritesheets with appropriate dimensions
3. **Animation Creation**: Phaser animations are created from the loaded spritesheets
4. **Behavior Setup**: The Player constructor creates a BaseEntityAnimation with PLAYER_ANIMATIONS
5. **State Changes**: When the player changes state (moving, attacking, etc.), setState() is called
6. **Animation Playback**: The animation behavior plays the correct animation based on state and orientation
7. **Visual Effects**: Additional effects (flipping, tinting) are applied based on the animation state

## Benefits of This System

1. **Separation of Concerns**: Animation logic is isolated in the BaseEntityAnimation class
2. **Configurability**: All animations are defined in configuration files, not hardcoded
3. **Reusability**: The same animation system works for all character types
4. **Extensibility**: Adding new animations or states just requires updating the configuration
5. **Maintainability**: Changes to animation behavior only need to be made in one place

## Adding New Player Animations

To add a new player animation type:

1. Add the new state to `CharacterState` enum in `character-states.ts`
2. Add image and animation keys to `ASSETS` in `assets.ts`
3. Add the spritesheet loading to `loadPlayerAssets()` in `Preloader.ts`
4. Create the animation in `createPlayerAnimations()` in `Preloader.ts`
5. Add the animation configuration to `PLAYER_ANIMATIONS` in `animation-configs.ts`
6. The Player will automatically use the new animation when the state is set 