/**
 * @fileoverview BaseEntityAnimation behavior for non-player entities
 */

import { IAnimationBehavior } from '../interfaces';
import { NonPlayerEntity } from '../../game-objects/entities/NonPlayerEntity';
import { Orientation } from '../../geometry/orientation';
import { CharacterAnimation, CharacterState } from '../../game-objects/Character';

/**
 * BaseEntityAnimation behavior for non-player entities
 * Provides animations for any entity based on CharacterState
 */
export class BaseEntityAnimation implements IAnimationBehavior {
  private animationSets: Record<string, CharacterAnimation>;

  /**
   * Constructor supporting both legacy (separate animations) and new (animation sets) approaches
   * @param walkOrAnimationSets Either walk animation or complete animation sets
   * @param idleAnimation Idle animation (optional when using animation sets)
   */
  constructor(walkOrAnimationSets: CharacterAnimation | Record<string, CharacterAnimation>, idleAnimation?: CharacterAnimation) {
    if (idleAnimation) {
      // Legacy constructor with separate animations
      this.animationSets = {
        [CharacterState.MOVE]: walkOrAnimationSets as CharacterAnimation,
        [CharacterState.IDLE]: idleAnimation
      };
    } else {
      // New constructor with animation sets
      this.animationSets = walkOrAnimationSets as Record<string, CharacterAnimation>;
    }
  }

  /**
   * Update method called every frame
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(_entity: NonPlayerEntity): void {
    // No update needed for animation behavior
  }

  /**
   * Play the appropriate animation based on state and orientation
   */
  playAnimation(entity: NonPlayerEntity, state: string | CharacterState, orientation: Orientation): void {
    // For backward compatibility with 'walk' string
    const normalizedState = state === 'walk' ? CharacterState.MOVE : state;
    
    // Check if we have animations for this state
    if (!this.animationSets || !this.animationSets[normalizedState]) {
      // Fall back to idle if this state isn't supported
      if (normalizedState !== CharacterState.IDLE && this.animationSets[CharacterState.IDLE]) {
        this.playAnimation(entity, CharacterState.IDLE, orientation);
      }
      return;
    }
    
    // Get the correct animation data for the orientation
    const { flip, anim } = this.animationSets[normalizedState][orientation];
    
    // Play the animation
    entity.setFlipX(flip);
    entity.play(anim, true);
  }

  /**
   * Set up animations for this entity
   */
  setupAnimations(entity: NonPlayerEntity): void {
    // Animation setup is typically done in the scene's preloader
    // This method is primarily a hook for custom setup if needed
    
    // Store animation sets on the entity if needed
    entity.setData('animationSets', this.animationSets);
  }
  
  /**
   * Helper method to play idle animation
   */
  playIdle(entity: NonPlayerEntity, orientation: Orientation): void {
    this.playAnimation(entity, CharacterState.IDLE, orientation);
  }
  
  /**
   * Helper method to play movement animation
   */
  playMove(entity: NonPlayerEntity, orientation: Orientation): void {
    this.playAnimation(entity, CharacterState.MOVE, orientation);
  }
} 