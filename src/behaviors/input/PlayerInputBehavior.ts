/**
 * @fileoverview Player input behavior implementation
 * Handles keyboard input processing for the player character
 */

import { IInputBehavior } from '../interfaces';
import { KeyState } from '../../types/scene-types';
import { Player } from '../../game-objects/Player';
import { Orientation } from '../../geometry/orientation';
import { CharacterState } from '../../constants/character-states';

/**
 * Handles player input and movement controls
 */
export class PlayerInputBehavior implements IInputBehavior {
  /** Current keyboard state */
  private keyState: KeyState = {
    left: false,
    right: false,
    up: false,
    down: false,
    space: false,
    shift: false
  };

  /**
   * Set the current key state for processing
   * @param keyState The current keyboard input state
   */
  public setKeyState(keyState: KeyState): void {
    this.keyState = keyState;
  }

  /**
   * Update player state based on stored input
   * @param player The player entity to update
   */
  public update(player: Player): void {
    if (!player.active) {
      return;
    }

    // Reset velocity at the start of each update
    player.setVelocity(0);
    
    // Handle movement based on input
    this.handleMovement(player);
    
    // Handle combat actions
    if (this.keyState.shift) {
      player.performPunch();
    }
    
    // Handle ranged attacks
    this.handleShootKey(player);
    
    // Set to idle if no keys are pressed
    const noKeyPressed = Object.values(this.keyState).filter(x => x).length === 0;
    if (noKeyPressed && !player.isActionState(CharacterState.RELOADING)) {
      player.setToIdle();
    }
  }
  
  /**
   * Handle player movement based on key state
   * @param player The player to move
   */
  private handleMovement(player: Player): void {
    if (player.isActionState(CharacterState.SHOOTING)) {
      return;
    }
    
    this.handleHorizontalMovement(player);
    this.handleVerticalMovement(player);
  }
  
  /**
   * Handle horizontal movement
   * @param player The player to move
   */
  private handleHorizontalMovement(player: Player): void {
    const isUpDownPressed = this.keyState.up || this.keyState.down;
    
    if (this.keyState.left) {
      // Pass speed as normal, or 0 to disable animation
      player.moveInDirection(Orientation.Left, isUpDownPressed ? 0 : undefined);
      return;
    }
    
    if (this.keyState.right) {
      // Pass speed as normal, or 0 to disable animation
      player.moveInDirection(Orientation.Right, isUpDownPressed ? 0 : undefined);
      return;
    }
  }
  
  /**
   * Handle vertical movement
   * @param player The player to move
   */
  private handleVerticalMovement(player: Player): void {
    if (this.keyState.up) {
      player.moveInDirection(Orientation.Up);
    } else if (this.keyState.down) {
      player.moveInDirection(Orientation.Down);
    }
  }
  
  /**
   * Handle shooting actions
   * @param player The player to perform shooting
   */
  private handleShootKey(player: Player): void {
    if (this.keyState.space) {
      if (player.isActionState(CharacterState.RELOADING)) {
        return;
      }
      player.reloadWeapon();
      player.shootWeapon();
    }
  }
} 