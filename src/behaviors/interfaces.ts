/**
 * @fileoverview Behavior interfaces for entity composition system
 */

import { Orientation } from '../geometry/orientation';
import { Player } from '../game-objects/Player';
import { Character } from '../game-objects/Character';
import { KeyState } from '../types/scene-types';
import { CharacterState } from '../constants/character-states';

/**
 * Base behavior interface for all entity behaviors
 */
export interface IBehavior {
  /**
   * Update method called each frame for this behavior
   * @param character The character this behavior is attached to
   */
  update(character: Character): void;
}

/**
 * Movement behavior interface
 */
export interface IMovementBehavior extends IBehavior {
  /**
   * Move the character in a specific direction or toward a target
   * @param character The character to move
   * @param target Optional target position to move toward
   */
  move(character: Character, target?: Phaser.Math.Vector2): void;
  
  /**
   * Stop the character's movement
   * @param character The character to stop
   */
  stop(character: Character): void;
}

/**
 * Combat behavior interface
 */
export interface ICombatBehavior extends IBehavior {
  /**
   * Character performs an attack against a target
   * @param character The character performing the attack
   * @param target The character being attacked
   */
  attack(character: Character, target: Character): void;
}

/**
 * Interaction behavior interface
 */
export interface IInteractionBehavior extends IBehavior {
  /**
   * Character interacts with the player
   * @param character The character being interacted with
   * @param player The player initiating the interaction
   */
  interact(character: Character, player: Player): void;
  
  /**
   * Check if the character can be interacted with
   * @param character The character to check interaction with
   * @param player The player attempting to interact
   * @returns Whether interaction is possible
   */
  canInteract(character: Character, player: Player): boolean;
}

/**
 * Animation behavior interface
 */
export interface IAnimationBehavior extends IBehavior {
  /**
   * Play an animation for a given state and orientation
   * @param character The character to animate
   * @param state The animation state (idle, walk, attack, etc.)
   * @param orientation The direction the character is facing
   */
  playAnimation(character: Character, state: CharacterState, orientation: Orientation): void;
  
  /**
   * Set up all animations for this character
   * @param character The character to set up animations for
   */
  setupAnimations(character: Character): void;
}

/**
 * Input behavior interface for the player
 */
export interface IInputBehavior {
  /**
   * Update method called each frame for this behavior
   * @param player The player this behavior is attached to
   */
  update(player: Player): void;
  
  /**
   * Set the current key state for processing in the next update
   * @param keyState The current keyboard input state
   */
  setKeyState(keyState: KeyState): void;
} 