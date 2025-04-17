/**
 * @fileoverview BaseEntityAnimation behavior for characters
 */

import { IAnimationBehavior } from '../interfaces';
import { Orientation } from '../../geometry/orientation';
import { CharacterAnimation, Character } from '../../game-objects/Character';
import { CharacterState } from '../../constants/character-states';
import { getAnimationsForEntity } from '../../constants/entity-animations';
import { EntityType } from '../../constants/entities';

/**
 * BaseEntityAnimation behavior for all characters
 * Provides animations for any entity based on CharacterState
 */
export class BaseEntityAnimation implements IAnimationBehavior {
  private animationSets: Partial<Record<CharacterState, CharacterAnimation>>;

  /**
   * Constructor with a simplified approach using the centralized animation mapping
   * @param animationSets The animation sets to use, typically from getAnimationsForEntity
   */
  constructor(animationSets: Partial<Record<CharacterState, CharacterAnimation>>) {
    this.animationSets = animationSets;
  }

  /**
   * Static factory method to create an animation behavior for an entity type
   * @param entityType The type of entity to create animations for
   * @returns A new BaseEntityAnimation instance configured for the entity type
   */
  static forEntityType(entityType: EntityType): BaseEntityAnimation {
    const animations = getAnimationsForEntity(entityType);
    return new BaseEntityAnimation(animations);
  }

  /**
   * Get the animation sets
   */
  getAnimationSets(): Partial<Record<CharacterState, CharacterAnimation>> {
    return this.animationSets;
  }

  /**
   * Update method called every frame
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(_character: Character): void {
    // No update needed for animation behavior
  }

  /**
   * Play the appropriate animation based on state and orientation
   */
  playAnimation(character: Character, state: CharacterState, orientation: Orientation): void {
    // Check if we have animations for this state
    if (!this.animationSets || !this.animationSets[state]) {
      // Fall back to idle if this state isn't supported
      if (state !== CharacterState.IDLE && this.animationSets[CharacterState.IDLE]) {
        this.playAnimation(character, CharacterState.IDLE, orientation);
      }
      return;
    }
    
    // Get the correct animation data for the orientation
    const { flip, anim } = this.animationSets[state][orientation];
    
    // Play the animation
    character.setFlipX(flip);
    character.play(anim, true);
  }

  /**
   * Set up animations for this character
   */
  setupAnimations(character: Character): void {
    // Store animation sets on the character for reference
    character.setData('animationSets', this.animationSets);
  }
  
  /**
   * Helper method to play idle animation
   */
  playIdle(character: Character, orientation: Orientation): void {
    this.playAnimation(character, CharacterState.IDLE, orientation);
  }
  
  /**
   * Helper method to play movement animation
   */
  playMove(character: Character, orientation: Orientation): void {
    this.playAnimation(character, CharacterState.MOVE, orientation);
  }

  /**
   * Helper method to play attack animation
   */
  playAttack(character: Character, orientation: Orientation): void {
    this.playAnimation(character, CharacterState.ATTACK, orientation);
  }

  /**
   * Helper method to play hit animation
   */
  playHit(character: Character, orientation: Orientation): void {
    this.playAnimation(character, CharacterState.HIT, orientation);
  }

  /**
   * Helper method to play death animation
   */
  playDeath(character: Character, orientation: Orientation): void {
    this.playAnimation(character, CharacterState.DEATH, orientation);
  }
} 