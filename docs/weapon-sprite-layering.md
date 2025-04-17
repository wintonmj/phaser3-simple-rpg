# Weapon Sprite Layering System

## Overview

This document outlines the implementation approach for adding separate weapon sprites that layer on top of character sprites. This enhancement provides several benefits:

1. **Visual flexibility** - Weapons can have their own detailed animations independent of character animations
2. **Asset reusability** - The same weapon sprites can be used across different character types
3. **Dynamic equipment** - Characters can visually change weapons without requiring new character spritesheets

## Design Approach

The weapon sprite layering system extends the existing weapon component system while maintaining compatibility with the current architecture. The key principles are:

1. **Composition over inheritance** - Weapons contain sprites rather than extending the Sprite class
2. **Layered rendering** - Weapon sprites are positioned above the character with appropriate depth
3. **Orientation synchronization** - Weapon sprites automatically align with character orientation

## Implementation Steps

### Step 1: Update Asset Constants

First, add weapon sprite references to the assets constants file at `src/constants/assets.ts`:

```typescript
export const ASSETS = {
  // Existing assets...
  IMAGES: {
    // Existing image references...
    
    // Add weapon sprites
    BOW_IDLE: 'bow-idle',
    BOW_ATTACK: 'bow-attack',
    BOW_HURT: 'bow-hurt',
    
    // Other weapons as needed
  },
  ANIMATIONS: {
    // Existing animation references...
    
    // Add weapon animations
    BOW_IDLE_UP: 'bow-idle-up',
    BOW_IDLE_DOWN: 'bow-idle-down',
    BOW_IDLE_LEFT: 'bow-idle-left',
    BOW_IDLE_RIGHT: 'bow-idle-right',
    BOW_ATTACK_UP: 'bow-attack-up',
    BOW_ATTACK_DOWN: 'bow-attack-down',
    BOW_ATTACK_LEFT: 'bow-attack-left',
    BOW_ATTACK_RIGHT: 'bow-attack-right',
    BOW_HURT_UP: 'bow-hurt-up',
    BOW_HURT_DOWN: 'bow-hurt-down',
    BOW_HURT_LEFT: 'bow-hurt-left',
    BOW_HURT_RIGHT: 'bow-hurt-right',
    
    // Other weapon animations as needed
  },
} as const;
```

### Step 2: Asset Loading

Find the scene where assets are loaded (typically in a `preload()` method of your main game scene). Update it to load the weapon sprite sheets:

```typescript
// In src/scenes/PreloadScene.ts or equivalent
preload() {
  // Existing asset loading...
  
  // Load bow sprite sheets from the correct location
  this.load.spritesheet(
    ASSETS.IMAGES.BOW_IDLE, 
    'assets/humanoid-spritesheets/equipment/weapons/bow/standard/walk.png',
    { frameWidth: 32, frameHeight: 32 }
  );
  
  this.load.spritesheet(
    ASSETS.IMAGES.BOW_ATTACK,
    'assets/humanoid-spritesheets/equipment/weapons/bow/standard/shoot.png',
    { frameWidth: 32, frameHeight: 32 }
  );
  
  this.load.spritesheet(
    ASSETS.IMAGES.BOW_HURT,
    'assets/humanoid-spritesheets/equipment/weapons/bow/standard/hurt.png',
    { frameWidth: 32, frameHeight: 32 }
  );
  
  // Optionally load the character.json file if it contains frame data
  this.load.json(
    'bow-data',
    'assets/humanoid-spritesheets/equipment/weapons/bow/character.json'
  );
}
```

### Step 3: Animation Registration

Create animations for the weapon sprites in the `Preloader` scene, specifically by updating the `createAnimations()` method in `src/scenes/Preloader.ts`:

```typescript
// In src/scenes/Preloader.ts 
private createAnimations() {
  this.createPlayerAnimations();
  this.createEnemyAnimations();
  this.createGokuNpcAnimations();
  this.createMiscAnimations();
  this.createWeaponAnimations(); // Add this new method call
}

/**
 * Creates all weapon-related animations
 */
private createWeaponAnimations() {
  // Load bow animation frame data if needed
  const bowData = this.cache.json.get('bow-data');
  
  // Bow idle animations from walk.png
  this.createAnimation(ASSETS.ANIMATIONS.BOW_IDLE_UP, ASSETS.IMAGES.BOW_IDLE, 0, 3, 8, false);
  this.createAnimation(ASSETS.ANIMATIONS.BOW_IDLE_DOWN, ASSETS.IMAGES.BOW_IDLE, 4, 7, 8, false);
  this.createAnimation(ASSETS.ANIMATIONS.BOW_IDLE_LEFT, ASSETS.IMAGES.BOW_IDLE, 8, 11, 8, false);
  this.createAnimation(ASSETS.ANIMATIONS.BOW_IDLE_RIGHT, ASSETS.IMAGES.BOW_IDLE, 8, 11, 8, false);
  
  // Bow attack animations from shoot.png
  this.createAnimation(ASSETS.ANIMATIONS.BOW_ATTACK_UP, ASSETS.IMAGES.BOW_ATTACK, 0, 5, 12, false);
  this.createAnimation(ASSETS.ANIMATIONS.BOW_ATTACK_DOWN, ASSETS.IMAGES.BOW_ATTACK, 6, 11, 12, false);
  this.createAnimation(ASSETS.ANIMATIONS.BOW_ATTACK_LEFT, ASSETS.IMAGES.BOW_ATTACK, 12, 17, 12, false);
  this.createAnimation(ASSETS.ANIMATIONS.BOW_ATTACK_RIGHT, ASSETS.IMAGES.BOW_ATTACK, 12, 17, 12, false);
  
  // Bow hurt animations from hurt.png
  this.createAnimation(ASSETS.ANIMATIONS.BOW_HURT_UP, ASSETS.IMAGES.BOW_HURT, 0, 0, 1, false);
  this.createAnimation(ASSETS.ANIMATIONS.BOW_HURT_DOWN, ASSETS.IMAGES.BOW_HURT, 1, 1, 1, false);
  this.createAnimation(ASSETS.ANIMATIONS.BOW_HURT_LEFT, ASSETS.IMAGES.BOW_HURT, 2, 2, 1, false);
  this.createAnimation(ASSETS.ANIMATIONS.BOW_HURT_RIGHT, ASSETS.IMAGES.BOW_HURT, 2, 2, 1, false);
}
```

You'll also need to update the animation constants in `src/constants/assets.ts`:

```typescript
export const ASSETS = {
  // Existing assets...
  ANIMATIONS: {
    // Existing animation references...
    
    // Add weapon animations
    BOW_IDLE_UP: 'bow-idle-up',
    BOW_IDLE_DOWN: 'bow-idle-down',
    BOW_IDLE_LEFT: 'bow-idle-left',
    BOW_IDLE_RIGHT: 'bow-idle-right',
    BOW_ATTACK_UP: 'bow-attack-up',
    BOW_ATTACK_DOWN: 'bow-attack-down',
    BOW_ATTACK_LEFT: 'bow-attack-left',
    BOW_ATTACK_RIGHT: 'bow-attack-right',
    
    // Other weapon animations as needed
  },
} as const;
```

Following the project's animation architecture, you should also add weapon animation configurations in `src/constants/animation-configs.ts`:

```typescript
/**
 * Bow weapon animation configurations
 */
export const BOW_ANIMATIONS: Record<CharacterState, CharacterAnimation> = {
  [CharacterState.IDLE]: {
    up: { flip: false, anim: ASSETS.ANIMATIONS.BOW_IDLE_UP },
    down: { flip: false, anim: ASSETS.ANIMATIONS.BOW_IDLE_DOWN },
    left: { flip: false, anim: ASSETS.ANIMATIONS.BOW_IDLE_LEFT },
    right: { flip: true, anim: ASSETS.ANIMATIONS.BOW_IDLE_RIGHT },
  },
  [CharacterState.ATTACK]: {
    up: { flip: false, anim: ASSETS.ANIMATIONS.BOW_ATTACK_UP },
    down: { flip: false, anim: ASSETS.ANIMATIONS.BOW_ATTACK_DOWN },
    left: { flip: false, anim: ASSETS.ANIMATIONS.BOW_ATTACK_LEFT },
    right: { flip: true, anim: ASSETS.ANIMATIONS.BOW_ATTACK_RIGHT },
  },
  [CharacterState.HIT]: {
    up: { flip: false, anim: ASSETS.ANIMATIONS.BOW_HURT_UP },
    down: { flip: false, anim: ASSETS.ANIMATIONS.BOW_HURT_DOWN },
    left: { flip: false, anim: ASSETS.ANIMATIONS.BOW_HURT_LEFT },
    right: { flip: true, anim: ASSETS.ANIMATIONS.BOW_HURT_RIGHT },
  },
};
```

If you want to integrate with the entity animation system, you can define a weapon entity type in `src/constants/entities.ts` and add it to the `ENTITY_ANIMATIONS` mapping in `src/constants/entity-animations.ts`:

```typescript
// In src/constants/entities.ts
export const ENTITIES = {
  // Existing entities...
  BOW: 'bow',
  // Other weapons
} as const;

// In src/constants/entity-animations.ts
export const ENTITY_ANIMATIONS: Record<EntityType, Record<CharacterState, CharacterAnimation>> = {
  // Existing entities...
  [ENTITIES.BOW]: BOW_ANIMATIONS,
};

// Also update ENTITY_DIMENSIONS
export const ENTITY_DIMENSIONS: Record<EntityType, { width: number, height: number }> = {
  // Existing dimensions...
  [ENTITIES.BOW]: { width: 32, height: 32 },
};
```

## Implementation Details

### Weapon Base Class Enhancements

The abstract `Weapon` class needs modifications to support visual representation:

```typescript
export abstract class Weapon {
  // Existing properties
  protected combatBehavior: AbstractCombatBehavior;
  protected damage: number;
  protected range: number;
  protected attackCooldown: number;
  
  // New properties for sprite handling
  protected weaponSprite: Phaser.GameObjects.Sprite | null = null;
  
  constructor(combatBehavior: AbstractCombatBehavior) {
    this.combatBehavior = combatBehavior;
  }
  
  // Existing abstract methods
  abstract attack(context: AttackContext): void;
  abstract getAttackState(): CharacterState;
  abstract getWeaponType(): WeaponType;
  
  // New methods for sprite management
  protected createWeaponSprite(scene: Phaser.Scene, x: number, y: number, texture: string): void {
    this.weaponSprite = scene.add.sprite(x, y, texture);
    this.weaponSprite.setDepth(15); // Above character depth (assuming character is at depth 10)
  }
  
  public updateWeaponPosition(character: Character): void {
    if (this.weaponSprite) {
      this.weaponSprite.setPosition(character.x, character.y);
      
      // Update orientation based on character facing
      const orientation = character.getOrientation();
      this.updateWeaponOrientation(orientation);
      
      // Update visibility based on character visibility
      this.weaponSprite.setVisible(character.visible);
    }
  }
  
  // Cleanup method when weapon is unequipped
  public destroySprite(): void {
    if (this.weaponSprite) {
      this.weaponSprite.destroy();
      this.weaponSprite = null;
    }
  }
  
  // Abstract method for weapon-specific orientation adjustments
  protected abstract updateWeaponOrientation(orientation: Orientation): void;
  
  // Play weapon-specific attack animation
  public abstract playAttackAnimation(orientation: Orientation): void;
}
```

### Weapon Implementation Example: Bow

The Bow class implementation demonstrates how to create a weapon with its own sprite:

```typescript
// src/game-objects/weapons/Bow.ts
export class Bow extends Weapon {
  // Animation keys for different orientations
  private bowAnimations: {[key in Orientation]: string};
  private bowAttackAnimations: {[key in Orientation]: string};
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(new RangedCombat(
      (scene, x, y, orientation) => new Arrow(scene, x, y, orientation)
    ));
    
    // Set weapon stats
    this.damage = 1;
    this.range = 200;
    this.attackCooldown = 1000;
    
    // Define animation keys using constants from ASSETS
    this.bowAnimations = {
      [Orientation.Up]: ASSETS.ANIMATIONS.BOW_IDLE_UP,
      [Orientation.Down]: ASSETS.ANIMATIONS.BOW_IDLE_DOWN,
      [Orientation.Left]: ASSETS.ANIMATIONS.BOW_IDLE_LEFT,
      [Orientation.Right]: ASSETS.ANIMATIONS.BOW_IDLE_RIGHT
    };
    
    this.bowAttackAnimations = {
      [Orientation.Up]: ASSETS.ANIMATIONS.BOW_ATTACK_UP,
      [Orientation.Down]: ASSETS.ANIMATIONS.BOW_ATTACK_DOWN,
      [Orientation.Left]: ASSETS.ANIMATIONS.BOW_ATTACK_LEFT,
      [Orientation.Right]: ASSETS.ANIMATIONS.BOW_ATTACK_RIGHT
    };
    
    // Create the bow sprite using the idle texture
    this.createWeaponSprite(scene, x, y, ASSETS.IMAGES.BOW_IDLE);
  }
  
  attack(context: AttackContext): void {
    const { source, direction, scene } = context;
    
    // Play the appropriate attack animation
    this.playAttackAnimation(direction);
    
    // Create arrow projectile after a slight delay to match animation
    scene.time.delayedCall(200, () => {
      new Arrow(scene, source.x, source.y, direction);
    });
  }
  
  getAttackState(): CharacterState {
    return CharacterState.SHOOTING;
  }
  
  getWeaponType(): WeaponType {
    return WeaponType.RANGED;
  }
  
  protected updateWeaponOrientation(orientation: Orientation): void {
    if (this.weaponSprite) {
      // Play the appropriate idle animation
      this.weaponSprite.play(this.bowAnimations[orientation], true);
      
      // Apply position offsets based on orientation for precise alignment
      switch (orientation) {
        case Orientation.Up:
          this.weaponSprite.setPosition(this.weaponSprite.x, this.weaponSprite.y - 5);
          break;
        case Orientation.Down:
          this.weaponSprite.setPosition(this.weaponSprite.x, this.weaponSprite.y + 2);
          break;
        case Orientation.Left:
          this.weaponSprite.setPosition(this.weaponSprite.x - 3, this.weaponSprite.y);
          break;
        case Orientation.Right:
          this.weaponSprite.setPosition(this.weaponSprite.x + 3, this.weaponSprite.y);
          break;
      }
    }
  }
  
  public playAttackAnimation(orientation: Orientation): void {
    if (this.weaponSprite) {
      this.weaponSprite.play(this.bowAttackAnimations[orientation]);
      
      // Reset to idle animation when attack animation completes
      this.weaponSprite.once('animationcomplete', () => {
        this.weaponSprite.play(this.bowAnimations[orientation], true);
      });
    }
  }
}
```

### Character Class Integration

The Character class needs modifications to update weapon sprites during the game loop:

```typescript
// In src/game-objects/Character.ts
public update(): void {
  // Existing update logic...
  
  // Update weapon sprite position if equipped
  if (this.equippedWeapon) {
    this.equippedWeapon.updateWeaponPosition(this);
  }
}

// Update the equipWeapon method to handle existing weapons
public equipWeapon(weapon: Weapon): void {
  // Clean up previous weapon sprite if one exists
  if (this.equippedWeapon) {
    this.equippedWeapon.destroySprite();
  }
  
  this.equippedWeapon = weapon;
}
```

### WeaponFactory Enhancements

The WeaponFactory needs to be updated to create weapons with sprites:

```typescript
// In src/game-objects/weapons/WeaponFactory.ts
export class WeaponFactory {
  static createWeapon(scene: Phaser.Scene, type: WeaponType, x: number, y: number): Weapon {
    switch (type) {
      case WeaponType.RANGED:
        return new Bow(scene, x, y);
      case WeaponType.MELEE:
        return new Fists(scene, x, y);
      default:
        // Default to fists if unknown type
        return new Fists(scene, x, y);
    }
  }
  
  static equipCharacterWithWeapon(character: Character, type: WeaponType): void {
    const scene = character.getScene();
    const weapon = WeaponFactory.createWeapon(scene, type, character.x, character.y);
    character.equipWeapon(weapon);
  }
}
```

## File Structure Updates

To implement weapon sprites, add the following new files:

1. Update `src/constants/assets.ts` with new weapon asset references
2. Create `src/game-objects/weapons/Bow.ts` with the Bow implementation
3. Update `src/game-objects/weapons/Weapon.ts` with sprite handling capabilities
4. Add animation setup in your main scene (typically `src/scenes/GameScene.ts`)
5. Ensure weapon sprites are in the correct directory: `assets/humanoid-spritesheets/equipment/weapons/bow/`

## Required Asset Structure

The project already contains bow animation assets at the following location:

```
assets/
└── humanoid-spritesheets/
    └── equipment/
        └── weapons/
            └── bow/
                ├── standard/
                │   ├── walk.png    # Spritesheet for bow idle/walking states
                │   ├── shoot.png   # Spritesheet with bow attack animations
                │   └── hurt.png    # Spritesheet for hurt states with bow
                ├── custom/         # For custom bow variants
                ├── credits/        # Attribution information
                └── character.json  # Configuration metadata for bow animations
```

You should use these existing assets rather than creating new ones. The `standard` directory contains the default bow animations, while the `custom` directory can be used for specialized bow variants.

## Sprite Sheet Requirements

The bow sprite sheets follow these specifications:

1. **Frame Size**: The sprites are designed to match the character sprite dimensions.

2. **Bow Animation Types**:
   - `walk.png`: Contains frames for the bow in idle/walking states for all orientations
   - `shoot.png`: Contains the shooting animation sequence for all orientations
   - `hurt.png`: Contains frames for hurt states while holding the bow

3. **Animation Structure**:
   - Each spritesheet is organized by orientation (down, up, left, right)
   - The `walk.png` contains the basic idle/walk states
   - The `shoot.png` contains the full animation sequence for drawing and firing the bow
   - All right-facing frames can be created by flipping left-facing frames horizontally

4. **Configuration**:
   - The `character.json` file contains metadata about the bow animations
   - Use this to determine exact frame ranges for different animation states

## Coordination with Character Animation System

The weapon sprite system works alongside the existing character animation system:

1. When a weapon attack is initiated, both systems are activated:
   - Character's state changes to appropriate attack state (SHOOTING for bow)
   - Character animation system plays the character's attack animation
   - Weapon plays its own attack animation independently

2. This dual animation approach provides maximum flexibility:
   - Character can have simpler animations showing just the body movement
   - Weapon can have detailed animations specific to each weapon type
   - Visual effects can be added to either or both animation components

## Implementation Considerations

1. **Depth Management**: Ensure weapon sprites are consistently rendered above characters but below UI elements.

2. **Animation Synchronization**: Character and weapon attack animations should be timed to look natural together.

3. **Memory Management**: Always destroy weapon sprites when weapons are unequipped or characters are destroyed.

4. **Performance**: For games with many characters, consider object pooling for weapon sprites.

5. **Orientation Handling**: Carefully manage sprite flipping and position offsets for different orientations.

6. **Asset Loading**: Ensure all weapon sprites are properly loaded before being used.

7. **Animation Keys**: Use consistent naming conventions for animation keys in ASSETS constants.

## Benefits of This Approach

1. **Modularity**: Weapons and characters can be developed independently.

2. **Visual Variety**: Different weapons can have unique appearances and animations.

3. **Asset Efficiency**: No need for duplicate character sprites with different weapons.

4. **Future Expandability**: Easy to add new weapon types with distinctive visuals.

## Next Steps

1. Implement basic weapon sprites for bow and fists
2. Add visual effects during attacks (glow, particles, etc.)
3. Create a visual inventory system showing equipped weapons
4. Add weapon upgrade visuals that modify the weapon sprite 