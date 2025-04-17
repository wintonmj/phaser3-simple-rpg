/**
 * @fileoverview Behavior interfaces for entity composition system
 */

import { Orientation } from '../geometry/orientation';
import { Player } from '../game-objects/Player';
import { Character } from '../game-objects/Character';
import { KeyState } from '../types/scene-types';
import { CharacterState } from '../constants/character-states';

// Forward reference to avoid circular dependency
// The actual class will be imported by implementations
class NonPlayerEntity extends Character {}

/**
 * Base behavior interface for all entity behaviors
 */
export interface IBehavior {
  /**
   * Update method called each frame for this behavior
   * @param entity The entity this behavior is attached to
   */
  update(entity: NonPlayerEntity): void;
}

/**
 * Movement behavior interface
 */
export interface IMovementBehavior extends IBehavior {
  /**
   * Move the entity in a specific direction or toward a target
   * @param entity The entity to move
   * @param target Optional target position to move toward
   */
  move(entity: NonPlayerEntity, target?: Phaser.Math.Vector2): void;
  
  /**
   * Stop the entity's movement
   * @param entity The entity to stop
   */
  stop(entity: NonPlayerEntity): void;
}

/**
 * Combat behavior interface
 */
export interface ICombatBehavior extends IBehavior {
  /**
   * Entity performs an attack against a target
   * @param entity The entity performing the attack
   * @param target The character being attacked
   */
  attack(entity: NonPlayerEntity, target: Character): void;
  
  /**
   * Entity takes damage
   * @param entity The entity taking damage
   * @param amount The amount of damage taken
   */
  takeDamage(entity: NonPlayerEntity, amount: number): void;
}

/**
 * Interaction behavior interface
 */
export interface IInteractionBehavior extends IBehavior {
  /**
   * Entity interacts with the player
   * @param entity The entity being interacted with
   * @param player The player initiating the interaction
   */
  interact(entity: NonPlayerEntity, player: Player): void;
  
  /**
   * Check if the entity can be interacted with
   * @param entity The entity to check interaction with
   * @param player The player attempting to interact
   * @returns Whether interaction is possible
   */
  canInteract(entity: NonPlayerEntity, player: Player): boolean;
}

/**
 * Animation behavior interface
 */
export interface IAnimationBehavior extends IBehavior {
  /**
   * Play an animation for a given state and orientation
   * @param entity The entity to animate
   * @param state The animation state (idle, walk, attack, etc.)
   * @param orientation The direction the entity is facing
   */
  playAnimation(entity: NonPlayerEntity, state: CharacterState, orientation: Orientation): void;
  
  /**
   * Set up all animations for this entity
   * @param entity The entity to set up animations for
   */
  setupAnimations(entity: NonPlayerEntity): void;
}

/**
 * Input behavior interface for the player
 */
export interface IInputBehavior {
  /**
   * Update method called each frame for this behavior
   * @param entity The player this behavior is attached to
   */
  update(entity: Player): void;
  
  /**
   * Set the current key state for processing in the next update
   * @param keyState The current keyboard input state
   */
  setKeyState(keyState: KeyState): void;
} 