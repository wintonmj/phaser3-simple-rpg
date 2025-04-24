/**
 * @fileoverview IdleMovement behavior that doesn't move the character
 */

import { IMovementBehavior } from '../interfaces';
import { Character } from '../../game-objects/Character';

/**
 * Movement behavior that keeps the character stationary
 */
export class IdleMovement implements IMovementBehavior {
  /**
   * Update method called every frame
   * @param character The character to update
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(_character: Character): void {
    // Do nothing, character stays in place
  }

  /**
   * Move method (does nothing for idle behavior)
   * @param character The character to move
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  move(_character: Character): void {
    // Do nothing, character stays in place
  }

  /**
   * Stop the character's movement
   * @param character The character to stop
   */
  stop(character: Character): void {
    character.setVelocity(0, 0);
  }
} 