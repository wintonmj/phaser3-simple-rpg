/**
 * @fileoverview BaseEntityAnimation behavior for non-player entities
 */

import { IAnimationBehavior } from '../interfaces';
import { NonPlayerEntity } from '../../game-objects/entities/NonPlayerEntity';
import { Orientation } from '../../geometry/orientation';
import { CharacterAnimation } from '../../game-objects/Character';

/**
 * BaseEntityAnimation behavior for non-player entities
 * Provides standard walk and idle animations for any entity
 */
export class BaseEntityAnimation implements IAnimationBehavior {
  private walkAnimation: CharacterAnimation;
  private idleAnimation: CharacterAnimation;

  constructor(walkAnimation: CharacterAnimation, idleAnimation: CharacterAnimation) {
    this.walkAnimation = walkAnimation;
    this.idleAnimation = idleAnimation;
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
  playAnimation(entity: NonPlayerEntity, state: string, orientation: Orientation): void {
    // Choose the animation based on the state
    const animationKey = state === 'walk' ? this.walkAnimation : this.idleAnimation;
    
    // Get the correct animation data for the orientation
    const { flip, anim } = animationKey[orientation];
    
    // Play the animation
    entity.setFlipX(flip);
    entity.play(anim, true);
  }

  /**
   * Set up animations for this entity
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setupAnimations(_entity: NonPlayerEntity): void {
    // Animation setup is typically done in the scene's preloader
    // This method is primarily a hook for custom setup if needed
  }
} 