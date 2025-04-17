# Weapon Component System

## Overview

This document outlines a plan for implementing a simple but extensible weapon system in our RPG game. The initial implementation will focus on just two weapon types: fists (melee) and bow (ranged).

## Core Architecture

The weapon system is built around three key principles:

1. **Composition over inheritance** - Weapons compose with behaviors rather than extending them
2. **Clear responsibility chain** - Each component has well-defined responsibilities
3. **Integration with existing systems** - Seamless connections with character, animation and combat systems

### Component Hierarchy

```
Character
  └── equips Weapon
       └── uses CombatBehavior
           └── executes attack logic
```

This creates a clean separation of concerns:
- **Character** handles state, movement, and health
- **Weapon** defines type, stats, and visual representation
- **CombatBehavior** implements actual attack mechanics

## Attack Context Definition

We use a flexible attack context object to support different weapon types:

```typescript
// Define a flexible attack context
export interface AttackContext {
  source: Character;           // Character performing the attack
  direction: Orientation;      // Direction of attack
  target?: Character;          // Optional specific target
  position?: { x: number, y: number }; // Optional position for targeted attacks
  scene: AbstractScene;        // Reference to scene for creating effects/projectiles
}
```

## Class Structure

### Weapon Base Class

```typescript
export abstract class Weapon {
  protected combatBehavior: AbstractCombatBehavior;
  protected damage: number;
  protected range: number;
  protected attackCooldown: number;
  
  constructor(combatBehavior: AbstractCombatBehavior) {
    this.combatBehavior = combatBehavior;
  }
  
  abstract attack(context: AttackContext): void;
  abstract getAttackState(): CharacterState;
  abstract getWeaponType(): WeaponType;
  
  public getDamage(): number { return this.damage; }
  public getAttackCooldown(): number { return this.attackCooldown; }
  
  // Bridge between new context system and existing AbstractCombatBehavior
  protected executeCombatBehavior(context: AttackContext): void {
    const { source, target } = context;
    
    // Only delegate to combat behavior if there's a valid target
    if (target && this.combatBehavior) {
      this.combatBehavior.attack(source, target);
    }
  }
}
```

### Weapon Type Enumeration

```typescript
export enum WeaponType {
  MELEE = 'melee',  // Close-range weapons (fists)
  RANGED = 'ranged' // Distance weapons (bow)
}
```

### Character Integration

The `Character` class will be modified to incorporate weapons:

```typescript
// Additions to Character class
protected equippedWeapon: Weapon;

public equipWeapon(weapon: Weapon): void {
  this.equippedWeapon = weapon;
}

public performAttack(target?: Character): void {
  if (!this.equippedWeapon || !this.isOffCooldown('attack', this.equippedWeapon.getAttackCooldown())) {
    return;
  }
  
  // Set state based on weapon type
  this.setState(this.equippedWeapon.getAttackState());
  
  // Create attack context with all necessary information
  const attackContext: AttackContext = {
    source: this,
    direction: this.orientation,
    scene: this.scene,
    target: target // optional
  };
  
  // Execute attack with context
  this.equippedWeapon.attack(attackContext);
  
  // Start cooldown
  this.startCooldown('attack');
}
```

## State Change & Animation Flow

### State Change Flow

The weapon system integrates with the existing state management by providing specific attack states for each weapon type. Here's the complete flow of a player attack from input to state change:

```
┌─────────────────┐    ┌──────────────┐    ┌──────────────┐    ┌───────────────┐    ┌───────────────────┐
│PlayerInputBehavior│   │    Player    │    │    Weapon    │    │   Character   │    │BaseEntityAnimation│
└────────┬────────┘    └──────┬───────┘    └──────┬───────┘    └───────┬───────┘    └───────────┬───────┘
         │                    │                    │                    │                        │
         │ attack(player)     │                    │                    │                        │
         │───────────────────>│                    │                    │                        │
         │                    │                    │                    │                        │
         │                    │ performAttack()    │                    │                        │
         │                    │────────────────────┼───────────────────>│                        │
         │                    │                    │                    │                        │
         │                    │                    │ getAttackState()   │                        │
         │                    │                    │<───────────────────│                        │
         │                    │                    │                    │                        │
         │                    │                    │ returns CharacterState.SHOOTING/PUNCHING    │
         │                    │                    │───────────────────>│                        │
         │                    │                    │                    │                        │
         │                    │                    │                    │ setState(state)        │
         │                    │                    │                    │────────────────────────┼───────────>
         │                    │                    │                    │                        │
         │                    │                    │ createAttackContext│                        │
         │                    │                    │<───────────────────│                        │
         │                    │                    │                    │                        │
         │                    │                    │ attack(context)    │                        │
         │                    │                    │<───────────────────│                        │
         │                    │                    │                    │                        │
         │                    │                    │ execute attack     │                        │
         │                    │                    │────────────────────┼───────────────────────>│
         │                    │                    │                    │                        │
```

The key steps are:
1. PlayerInputBehavior detects input and calls player.performAttack()
2. Player calls performAttack() which:
   - Gets the appropriate attack state from the weapon (SHOOTING for bow, PUNCHING for fists)
   - Sets the character state using setState()
   - Creates an AttackContext object with all relevant information
   - Calls the weapon's attack() method with the context

### Animation Flow

Once the state has been changed, the animation system takes over:

```
┌───────────────┐    ┌───────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Character   │    │BaseEntityAnimation│    │animation-configs.ts│    │ Phaser Animation│
└───────┬───────┘    └───────────┬───────┘    └──────────┬────────┘    └────────┬────────┘
        │                        │                       │                       │
        │ setState(SHOOTING)     │                       │                       │
        │───────────────────────>│                       │                       │
        │                        │                       │                       │
        │                        │ playAnimation(character, state, orientation)  │
        │                        │───────────────────────┼──────────────────────>│
        │                        │                       │                       │
        │                        │ Look up animation config for state and orientation                   
        │                        │<──────────────────────┼──────────────────────│
        │                        │                       │                       │
        │                        │ Gets { flip, anim } for state+orientation     │
        │                        │───────────────────────┼──────────────────────>│
        │                        │                       │                       │
        │                        │ character.play(anim, shouldRepeat)            │
        │                        │───────────────────────┼──────────────────────>│
        │                        │                       │                       │
        │                        │ Apply visual effects (tint, etc.)             │
        │                        │───────────────────────┼──────────────────────>│
        │                        │                       │                       │
```

The key steps are:
1. Character.setState() calls animationBehavior.playAnimation() with the new state
2. BaseEntityAnimation looks up animation configuration for the state and orientation
3. The correct animation key and flip setting are retrieved from configuration
4. The animation is played on the character with appropriate settings
5. Additional visual effects like tints may be applied based on state

## Weapon-Specific Animation Integration

Each weapon type maps to specific animation states to ensure consistent visuals:

```
┌─────────────┐          ┌─────────────────────┐
│  WeaponType │          │   CharacterState    │
└──────┬──────┘          └──────────┬──────────┘
       │                             │
       │                             │
       ▼                             ▼
┌─────────────┐  getAttackState()  ┌─────────────────────┐      ┌────────────────────┐
│  Bow        │ ─────────────────> │CharacterState.SHOOTING│─────▶│ Player bow animation│
└─────────────┘                    └─────────────────────┘      └────────────────────┘
                                                                      
┌─────────────┐  getAttackState()  ┌─────────────────────┐      ┌────────────────────┐
│  Fists      │ ─────────────────> │CharacterState.PUNCHING│─────▶│Player punch animation│
└─────────────┘                    └─────────────────────┘      └────────────────────┘
```

This design:
1. Keeps weapon logic separate from animation details
2. Leverages the existing animation system without modification
3. Allows different weapons to use different animations
4. Makes it easy to add new weapons with unique animations

## Weapon Implementations

### Fists (Melee)

```typescript
export class Fists extends Weapon {
  constructor() {
    super(new MeleeCombat());
    
    this.damage = 1;
    this.range = 10;
    this.attackCooldown = 500;
  }
  
  attack(context: AttackContext): void {
    const { source, direction, scene } = context;
    
    // Create hitbox in front of character based on direction
    const hitbox = this.createHitbox(source, direction);
    
    // Find all targets within hitbox
    const targets = scene.getEnemiesInArea(hitbox);
    
    // Apply damage to all targets in hitbox
    targets.forEach(target => target.loseHp(this.damage));
    
    // Alternatively, we could delegate to combat behavior if we have a target
    // this.executeCombatBehavior(context);
  }
  
  getAttackState(): CharacterState {
    return CharacterState.PUNCHING;
  }
  
  getWeaponType(): WeaponType {
    return WeaponType.MELEE;
  }
  
  private createHitbox(character: Character, direction: Orientation): Phaser.Geom.Rectangle {
    // Create hitbox based on character position and orientation
    const { x, y } = character;
    const hitboxSize = this.range;
    
    switch (direction) {
      case Orientation.Up:
        return new Phaser.Geom.Rectangle(x - hitboxSize/2, y - hitboxSize, hitboxSize, hitboxSize);
      case Orientation.Down:
        return new Phaser.Geom.Rectangle(x - hitboxSize/2, y, hitboxSize, hitboxSize);
      case Orientation.Left:
        return new Phaser.Geom.Rectangle(x - hitboxSize, y - hitboxSize/2, hitboxSize, hitboxSize);
      case Orientation.Right:
        return new Phaser.Geom.Rectangle(x, y - hitboxSize/2, hitboxSize, hitboxSize);
    }
  }
}
```

### Bow (Ranged)

```typescript
export class Bow extends Weapon {
  constructor() {
    super(new RangedCombat(
      (scene, x, y, orientation) => new Arrow(scene, x, y, orientation)
    ));
    
    this.damage = 1;
    this.range = 200;
    this.attackCooldown = 1000;
  }
  
  attack(context: AttackContext): void {
    const { source, direction, scene } = context;
    
    // Create arrow projectile in the specified direction
    new Arrow(scene, source.x, source.y, direction);
    
    // Note: We don't need to use the combatBehavior for projectile weapons
    // as they handle their own hit detection
  }
  
  getAttackState(): CharacterState {
    return CharacterState.SHOOTING;
  }
  
  getWeaponType(): WeaponType {
    return WeaponType.RANGED;
  }
}
```

## Hitbox Detection System

### AbstractScene Dependency

⚠️ **CRITICAL DEPENDENCY**: The weapon system implementation has a critical dependency on AbstractScene. 

The `getEnemiesInArea()` method **must be implemented** in AbstractScene before any melee weapons can function:

```typescript
// To be implemented in AbstractScene.ts BEFORE weapon system implementation
public getEnemiesInArea(area: Phaser.Geom.Rectangle): Character[] {
  // ... implementation as shown in Hitbox Detection section ...
}
```

### AbstractScene Dependency: Revised Approach

After examining the codebase architecture, the `getEnemiesInArea()` method should be implemented in **SpatialManager** rather than directly in AbstractScene. This aligns with the existing separation of concerns:

1. **SpatialManager Implementation**:
   ```typescript
   // To be added to SpatialManager.ts
   public getEntitiesInArea(area: Phaser.Geom.Rectangle): Phaser.GameObjects.GameObject[] {
     // Leverage the existing QuadTree for efficient spatial queries
     const entitiesInArea = this.quadTree.retrieveInBounds(area);
     
     // Filter to only return active entities
     return entitiesInArea.filter(entity => entity.active);
   }
   ```

2. **AbstractScene Delegation**:
   ```typescript
   // To be added to AbstractScene.ts
   public getEnemiesInArea(area: Phaser.Geom.Rectangle): Character[] {
     // Get all entities in the area using SpatialManager
     const entitiesInArea = this.spatialManager.getEntitiesInArea(area);
     
     // Filter to only include Character entities that are enemies
     return entitiesInArea
       .filter(entity => entity instanceof Character && !(entity instanceof Player))
       .map(entity => entity as Character);
   }
   ```

This approach:
- Leverages the existing spatial partitioning system (QuadTree) for efficient area queries
- Maintains proper separation of concerns (SpatialManager handles spatial queries)
- Provides a clear interface in AbstractScene for the weapon system to use
- Uses the existing entity filtering mechanisms

**Implementation Order**:
1. Add `getEntitiesInArea()` to SpatialManager
2. Add `getEnemiesInArea()` to AbstractScene that delegates to SpatialManager
3. Implement the weapon system components

Without this method, the melee weapon hitbox detection cannot function.

### Hitbox Creation and Visualization

The hitbox detection system will:

1. **Create hitboxes** using `Phaser.Geom.Rectangle` based on:
   - Character position
   - Attack direction
   - Weapon range

2. **Detect entities** within the hitbox area by:
   - Querying the scene's entity lists
   - Testing for geometric overlap between hitbox and entity bounds
   - Filtering by team/faction if needed

3. **Optional visualization** during development:
   ```typescript
   // Debug visualization for hitboxes (development only)
   if (this.scene.game.config.physics.arcade.debug) {
     const graphics = this.scene.add.graphics({ fillStyle: { color: 0xff0000, alpha: 0.5 } });
     graphics.fillRectShape(hitbox);
     this.scene.time.delayedCall(200, () => graphics.destroy());
   }
   ```

### Collision Group Integration

For more complex scenarios, the hitbox system can integrate with Phaser's collision groups:

```typescript
// Alternative implementation for getEnemiesInArea
public getEnemiesInArea(area: Phaser.Geom.Rectangle): Character[] {
  const tempSprite = this.physics.add.sprite(area.x + area.width/2, area.y + area.height/2, '');
  tempSprite.setVisible(false);
  tempSprite.body.setSize(area.width, area.height);
  
  const enemies: Character[] = [];
  this.physics.overlap(tempSprite, this.enemiesGroup, (_, enemy) => {
    enemies.push(enemy as Character);
  });
  
  tempSprite.destroy();
  return enemies;
}
```

This approach offers better performance for games with many entities by leveraging Phaser's spatial hashing.

## Combat Behaviors Integration

The existing `AbstractCombatBehavior` class is integrated through a bridge pattern:

```typescript
// In AbstractCombatBehavior - the existing implementation remains unchanged
export abstract class AbstractCombatBehavior implements ICombatBehavior {
  // ... existing methods ...
  
  attack(attacker: Character, target: Character): void {
    if (!this.canAttack(attacker, target)) return;
    
    // Set attacker to appropriate attack state
    const attackState = this.getAttackState();
    attacker.setState(attackState);
    
    // Perform the actual attack implementation
    this.doAttack(attacker, target);
    
    // Start the attack cooldown
    attacker.startCooldown('attack');
  }
  
  protected abstract doAttack(attacker: Character, target: Character): void;
}
```

### Streamlining Attack Method Overlap

There is significant overlap between `AbstractCombatBehavior.attack()` and `Weapon.attack()`:

```typescript
// In AbstractCombatBehavior:
attack(attacker: Character, target: Character): void {
  if (!this.canAttack(attacker, target)) return;
  
  // Set attacker to appropriate attack state
  const attackState = this.getAttackState();
  attacker.setState(attackState);
  
  // Perform the actual attack implementation
  this.doAttack(attacker, target);
  
  // Start the attack cooldown
  attacker.startCooldown('attack');
}

// In Character:
public performAttack(target?: Character): void {
  if (!this.equippedWeapon || !this.isOffCooldown('attack', this.equippedWeapon.getAttackCooldown())) {
    return;
  }
  
  // Set state based on weapon type
  this.setState(this.equippedWeapon.getAttackState());
  
  // Create attack context with all necessary information
  const attackContext: AttackContext = {
    source: this,
    direction: this.orientation,
    scene: this.scene,
    target: target // optional
  };
  
  // Execute attack with context
  this.equippedWeapon.attack(attackContext);
  
  // Start cooldown
  this.startCooldown('attack');
}
```

This duplication introduces potential maintenance issues. Future refactoring options include:

1. **Abstract Combat to Use Context**: Update `AbstractCombatBehavior` to accept `AttackContext` instead of separate attacker/target parameters
2. **Simplified Bridge Pattern**: Reduce the bridge code and have weapons fully take over attack logic
3. **Combat Behavior as Attack Strategy**: Refocus combat behaviors to be purely about damage calculation and effects

In the initial implementation, we'll use the bridging approach, but this area should be revisited for refactoring after the basic system is working.

### Recommended Approach: Clear Separation of Responsibilities

After evaluation, the most effective way to resolve the overlap between `AbstractCombatBehavior` and the new `Weapon` system is to clearly separate their responsibilities:

```typescript
// In Weapon.ts
attack(context: AttackContext): void {
  // Handle attack mechanics (projectiles, hitboxes)
  
  // If target hit, delegate to combat behavior for damage
  if (context.target && this.combatBehavior) {
    this.combatBehavior.calculateDamage(context.source, context.target);
  }
}

// In AbstractCombatBehavior.ts - add new method
calculateDamage(attacker: Character, target: Character): number {
  // Calculate and apply damage based on stats, equipment, etc.
  const damage = this.computeDamageFormula(attacker);
  target.loseHp(damage);
  return damage;
}

protected abstract computeDamageFormula(attacker: Character): number;
```

This refactoring creates a clean division where:
- `Weapon` handles attack mechanics: hitboxes, projectiles, and area effects
- `AbstractCombatBehavior` focuses on damage calculation: stats, formulas, and effects

The primary benefits of this approach are:
1. Minimal disruption to existing code
2. Clear separation of mechanical concerns from statistical concerns
3. Allows custom weapons with unique attack mechanics while reusing damage logic
4. Creates a reasonable migration path from the old system to the new one

This approach is recommended for implementation after the initial bridging pattern is in place and working.

## Input System Integration

The `PlayerInputBehavior` will be updated to use the new weapon system:

```typescript
// Modified in PlayerInputBehavior.ts
private attack(player: Player): void {
  // Delegate attack logic to the player's weapon system
  player.performAttack();
  
  // No need to set states or handle projectiles here
  // That's now the responsibility of the weapon system
}
```

## Critical Dependencies and Implementation Concerns

### Duplication in Attack Logic

There is significant duplication between the attack flow in the new weapon system and existing combat behaviors:

| AbstractCombatBehavior.attack() | Character.performAttack() with Weapon |
|--------------------------------|----------------------------------------|
| Cooldown check | Cooldown check |
| Set character state | Set character state |
| Perform attack | Execute weapon attack |
| Start cooldown | Start cooldown |

This duplication needs to be addressed through one of these approaches:

1. **Short-term (Implementation Phase)**: Use the bridge pattern as described in the Combat Behaviors Integration section.
2. **Medium-term (Refactoring Phase)**: Adopt the "Recommended Approach" with clear separation of responsibilities.

During implementation, the team should maintain awareness of this duplication and avoid adding more overlapping logic between the two systems.

## UML Diagrams

### Weapon System Class Diagram

The following class diagram illustrates the relationships between the weapon system components:

```uml
@startuml

' Classes
abstract class Character {
  # equippedWeapon: Weapon
  # orientation: Orientation
  + performAttack(target?: Character): void
  + equipWeapon(weapon: Weapon): void
}

abstract class Weapon {
  # combatBehavior: AbstractCombatBehavior
  # damage: number
  # range: number
  # attackCooldown: number
  + {abstract} attack(context: AttackContext): void
  + {abstract} getAttackState(): CharacterState
  + {abstract} getWeaponType(): WeaponType
  + getDamage(): number
  + getAttackCooldown(): number
  # executeCombatBehavior(context: AttackContext): void
}

class Fists extends Weapon {
  + attack(context: AttackContext): void
  + getAttackState(): CharacterState
  + getWeaponType(): WeaponType
  - createHitbox(character: Character, direction: Orientation): Rectangle
}

class Bow extends Weapon {
  + attack(context: AttackContext): void
  + getAttackState(): CharacterState
  + getWeaponType(): WeaponType
}

abstract class AbstractCombatBehavior {
  # hitDelay: number
  + attack(attacker: Character, target: Character): void
  + calculateDamage(attacker: Character, target: Character): number
  # {abstract} computeDamageFormula(attacker: Character): number
}

class MeleeCombat extends AbstractCombatBehavior {
  # computeDamageFormula(attacker: Character): number
}

class RangedCombat extends AbstractCombatBehavior {
  # computeDamageFormula(attacker: Character): number
}

enum WeaponType {
  MELEE
  RANGED
}

class AttackContext {
  + source: Character
  + direction: Orientation
  + target?: Character
  + position?: { x: number, y: number }
  + scene: AbstractScene
}

' Relationships
Character "1" o-- "0..1" Weapon : equips >
Weapon "1" *-- "1" AbstractCombatBehavior : uses >
Weapon ..> AttackContext : uses >
AbstractCombatBehavior <|-- MeleeCombat
AbstractCombatBehavior <|-- RangedCombat
Weapon <|-- Fists
Weapon <|-- Bow
Weapon ..> WeaponType : returns >

@enduml
```

### Attack Sequence Diagram

This sequence diagram shows the complete flow of a weapon attack:

```uml
@startuml

actor Player
participant PlayerInputBehavior
participant Character
participant Weapon
participant "SpatialManager" as SpatialManager
participant "AbstractScene" as AbstractScene
participant AbstractCombatBehavior

Player -> PlayerInputBehavior : press attack button
PlayerInputBehavior -> Character : performAttack()
activate Character

Character -> Character : isOffCooldown('attack', weapon.getAttackCooldown())
Character -> Weapon : getAttackState()
activate Weapon
Weapon --> Character : CharacterState (SHOOTING/PUNCHING)
Character -> Character : setState(attackState)

Character -> Character : create AttackContext
Character -> Weapon : attack(context)

alt Melee Weapon
  Weapon -> Weapon : createHitbox(character, direction)
  Weapon -> AbstractScene : getEnemiesInArea(hitbox)
  activate AbstractScene
  AbstractScene -> SpatialManager : getEntitiesInArea(hitbox)
  activate SpatialManager
  SpatialManager --> AbstractScene : entities in area
  deactivate SpatialManager
  AbstractScene -> AbstractScene : filter for enemies
  AbstractScene --> Weapon : enemy characters in area
  deactivate AbstractScene
  
  loop for each target
    Weapon -> AbstractCombatBehavior : calculateDamage(source, target)
    activate AbstractCombatBehavior
    AbstractCombatBehavior -> AbstractCombatBehavior : computeDamageFormula(source)
    AbstractCombatBehavior --> Weapon : damage amount
    deactivate AbstractCombatBehavior
  end
else Ranged Weapon
  Weapon -> Weapon : create projectile
end

Weapon --> Character : attack complete
deactivate Weapon

Character -> Character : startCooldown('attack')
deactivate Character

@enduml
```

### Spatial Query Component Diagram

This component diagram shows how the spatial query system fits into the overall architecture:

```uml
@startuml

package "Scene Management" {
  [AbstractScene] as Scene
}

package "Spatial Management" {
  [SpatialManager]
  [QuadTree]
}

package "Game Objects" {
  [Character]
  [Weapon System] as Weapon
}

package "Physics" {
  [PhysicsManager]
}

Weapon --> Scene : queries enemies
Scene --> SpatialManager : delegates spatial queries
SpatialManager --> QuadTree : uses for efficient spatial partitioning
Scene --> PhysicsManager : delegates collision detection

@enduml
```

## Implementation Strategy

1. Create base weapon system classes:
   - `AttackContext` interface
   - `WeaponType` enum
   - `Weapon` abstract class with bridge to combat behaviors
   - `Fists` and `Bow` implementations

2. Update character class to support weapons:
   - Add `equippedWeapon` property
   - Add `equipWeapon()` and `performAttack()` methods
   - Modify `performAttack()` to create and pass attack context

3. Implement hitbox detection for melee weapons

4. Update `PlayerInputBehavior` to delegate to the player's weapon system

## File Structure

```
src/
├── game-objects/
│   ├── weapons/
│   │   ├── Weapon.ts
│   │   ├── Bow.ts
│   │   └── Fists.ts
│   └── Character.ts (modified)
├── behaviors/
│   ├── combat/
│   │   ├── AbstractCombatBehavior.ts (existing)
│   │   ├── RangedCombat.ts (existing)
│   │   └── MeleeCombat.ts
│   └── input/
│       └── PlayerInputBehavior.ts (modified)
├── types/
│   └── AttackContext.ts (new)
└── constants/
    └── weapon-types.ts (new)
```

## Benefits

1. **Flexibility** - The AttackContext pattern supports any type of weapon attack (targeted, directional, AOE)
2. **Extensibility** - New weapons can be added by implementing the `Weapon` abstract class
3. **Separation of concerns** - Weapons, combat logic, and character state are cleanly separated
4. **Integration** - Works with existing combat and animation systems
5. **Future-proofing** - Can be extended without changing the core interfaces

## Implementation Status

The weapon component system has been successfully implemented according to the design specifications. The implementation includes:

### Core Components Implemented

1. **AttackContext Interface**
   - Created in `src/types/AttackContext.ts`
   - Provides standardized context for weapon attacks
   - Includes source, direction, target, and scene references

2. **WeaponType Enumeration**
   - Created in `src/constants/weapon-types.ts`
   - Defines MELEE and RANGED weapon types

3. **Weapon Abstract Class**
   - Created in `src/game-objects/weapons/Weapon.ts`
   - Abstract base class for all weapon implementations
   - Provides common functionality and enforces implementation of key methods

4. **Weapon Implementations**
   - **Fists (Melee)**: Implemented in `src/game-objects/weapons/Fists.ts`
   - **Bow (Ranged)**: Implemented in `src/game-objects/weapons/Bow.ts`

5. **Combat Behaviors**
   - Enhanced existing `AbstractCombatBehavior` with weapon-specific implementations
   - Added `MeleeCombat` class in `src/behaviors/combat/MeleeCombat.ts`
   - Uses existing `RangedCombat` class for ranged weapons

6. **Character Integration**
   - Updated `Character` class with weapon support
   - Added `equipWeapon()` and `performAttack()` methods
   - Integrated with existing cooldown system

7. **Input System Integration**
   - Modified `PlayerInputBehavior` to delegate to the weapon system
   - Simplified attack handling by leveraging the weapon component system

8. **Spatial Query System**
   - Added `getEntitiesInArea()` to `SpatialManager` for efficient spatial queries
   - Added `getEnemiesInArea()` to `AbstractScene` to retrieve enemy characters
   - Leverages existing QuadTree for optimized spatial partitioning

9. **Weapon Factory**
   - Created `WeaponFactory` in `src/game-objects/weapons/WeaponFactory.ts`
   - Provides utility methods for creating and equipping weapons
   - Player automatically equips a weapon (bow) upon creation

### System Flow

The implemented system follows the designed flow:
1. `PlayerInputBehavior` detects attack input and calls `player.performAttack()`
2. `Player` class utilizes the `Character.performAttack()` method
3. The appropriate weapon's `attack()` method is called with an `AttackContext`
4. Weapons create hitboxes (melee) or projectiles (ranged) to deal damage
5. Animations are handled automatically through the existing state system

### Benefits Achieved

The implementation successfully delivers on all the intended benefits:
- **Flexibility**: Different weapon types are supported through the common interface
- **Extensibility**: New weapons can be added by implementing the `Weapon` abstract class
- **Separation of concerns**: Weapons, combat logic, and character state are cleanly separated
- **Integration**: Seamlessly works with existing combat and animation systems
- **Future-proofing**: Core interfaces allow for future expansion without modifying existing code

### Next Steps

While the core system is complete, potential enhancements could include:
1. Weapon inventory system for equipping different weapons
2. Visual indicators for equipped weapons
3. Additional weapon types (spear, magic staff, etc.)
4. Weapon upgrade/enhancement system
5. Special weapon abilities or charged attacks
