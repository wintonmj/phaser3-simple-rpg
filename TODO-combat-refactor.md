# Combat System Refactoring TODO

## Overview
Move combat-related functionality from Player.ts into appropriate combat behavior classes to improve code organization, reusability, and maintainability.

## Current CharacterState Usage

Based on codebase analysis, the following CharacterState values are actively used:

### Base states:
- **IDLE** - Used extensively for default state in Character.ts and Player.ts
- **MOVE** - Used in Character.ts for movement animations
- **DEATH** - Defined but no direct usage found in code

### Combat states:
- **ATTACK** - Used for melee attack animations in Player.ts
- **HIT** - Used for hit/damage animations in Player.ts

### Weapon states:
- **RELOADING** - Used in both Player.ts and PlayerInputBehavior.ts
- **SHOOTING** - Used in both Player.ts and PlayerInputBehavior.ts
- **PUNCHING** - Used in Player.ts for melee attacks

All states are defined in animation configurations but the actual state usage in game logic is primarily focused on combat-related states. This confirms the need to move these states to dedicated combat behavior classes.

## Implementation Plan

### Step 1: Prepare AbstractCombatBehavior

- [ ] Add common combat state constants (RELOADING, SHOOTING, PUNCHING)
- [ ] Create generic weapon state management methods:
  - [ ] `startReloading(entity, reloadTime)`
  - [ ] `setWeaponReady(entity)`
- [ ] Add animation handling interface for combat actions

### Step 2: Extend RangedCombat

- [ ] Implement `shootWeapon(entity, target)` method
- [ ] Add projectile generation with animation support
- [ ] Move `concludeShoot` logic from Player to RangedCombat
- [ ] Create arrow/projectile factory to be injected into RangedCombat

### Step 3: Extend MeleeCombat

- [ ] Implement `performPunch(entity, target)` method
- [ ] Add melee animation support and hit detection
- [ ] Handle attack animation completion events

### Step 4: Refactor Player Class

- [ ] Update Player to use a PlayerCombatComponent that combines ranged/melee behaviors
- [ ] Create adapter methods in Player that delegate to combat component
- [ ] Move animation handling for combat from Player to component
- [ ] Update animation event handlers to work with new structure

### Step 5: Update Game Integration

- [ ] Update input handling to work with refactored Player
- [ ] Test with both Player and NPC entities
- [ ] Fix any broken references

### Step 6: Create ICombatCapable Interface

- [ ] Define interface for entities capable of combat actions
- [ ] Implement on both Player and NPCs
- [ ] Create unified collision handling

## Implementation Notes

- Maintain backward compatibility for existing game logic
- Keep entity-specific animations separate from combat logic
- Use composition over inheritance when possible
- Consider making combat behavior configurable via game data 