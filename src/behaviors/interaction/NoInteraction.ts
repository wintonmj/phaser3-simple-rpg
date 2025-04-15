/**
 * @fileoverview NoInteraction behavior for entities that don't interact with the player
 */

import { IInteractionBehavior } from '../interfaces';
import { NonPlayerEntity } from '../../game-objects/entities/NonPlayerEntity';
import { Player } from '../../game-objects/Player';

/**
 * NoInteraction behavior for hostile entities
 * This is a placeholder implementation for entities that don't interact with the player
 */
export class NoInteraction implements IInteractionBehavior {
  /**
   * Update method called every frame
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(_entity: NonPlayerEntity): void {
    // No update needed for no interaction behavior
  }

  /**
   * Entity interacts with the player (does nothing)
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interact(_entity: NonPlayerEntity, _player: Player): void {
    // No interaction functionality
  }

  /**
   * Check if entity can be interacted with (always false)
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canInteract(_entity: NonPlayerEntity, _player: Player): boolean {
    return false;
  }
} 