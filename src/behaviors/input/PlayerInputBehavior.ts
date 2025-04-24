/**
 * @fileoverview Player input behavior implementation
 * Handles keyboard input processing for the player character
 */

import { IInputBehavior } from '../interfaces';
import { KeyState } from '../../types/scene-types';
import { Player } from '../../game-objects/Player';
import { Orientation } from '../../geometry/orientation';
import { CharacterState } from '../../constants/character-states';

/** Reload time in milliseconds */
const PLAYER_RELOAD = 1000; // Adjust this value as needed

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
    shift: false,
    esc: false
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
    
    // Emergency animation reset with ESC key
    if (this.keyState.esc) {
      console.log('[Input] ESC pressed, emergency reset to IDLE state');
      player.forceResetToIdle();
      return;
    }
    
    // Handle movement based on input
    this.handleMovement(player);
    
    // Handle ranged attacks
    this.handleActionKey(player);
    
    // Set to idle if no keys are pressed
    const noKeyPressed = Object.values(this.keyState).filter(x => x).length === 0;
    
    // Only set to IDLE if no keys are pressed and not in a special state that should complete its animation
    if (noKeyPressed && 
        !player.isActionState(CharacterState.RELOADING) && 
        !player.isActionState(CharacterState.SHOOTING) &&
        !player.isActionState(CharacterState.ATTACK) &&
        !player.isActionState(CharacterState.PUNCHING) &&
        !player.isActionState(CharacterState.HIT)) {
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
  private handleActionKey(player: Player): void {
    if (this.keyState.space) {
      
      if (player.isActionState(CharacterState.RELOADING) || 
          player.isActionState(CharacterState.SHOOTING)) {
        console.log('[Input] Ignoring spacebar, player is already in SHOOTING or RELOADING state');
        return;
      }
      
      // Call attack first to set the proper shooting state/animation
      this.attack(player);
    }
  }

  /**
   * Execute player attack
   * @param player The player performing the attack
   */
  private attack(player: Player): void {
    // Delegate attack logic to the player's weapon system
    console.log('[Input] Executing performAttack()');
    player.performAttack();
  } 

  /**
   * Reloads the player's weapon (legacy method, now split into parts)
   */
  public reloadAttack(player: Player): void {
    // Set state to reloading
    player.setState(CharacterState.RELOADING);
    
    // Start a cooldown to track reload time
    player.startCooldown('reload');
    
    // Schedule transition back to IDLE - Using player's scene
    const scene = player.getScene();
    scene.time.addEvent({
      delay: PLAYER_RELOAD,
      callback: () => this.readyToFire(player),
      callbackScope: this,
    });
  }

  /**
   * Mark player as ready to fire
   */
  private readyToFire(player: Player): void {
    player.setState(CharacterState.IDLE);
  }
} 