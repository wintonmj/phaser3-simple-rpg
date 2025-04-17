/**
 * @fileoverview BaseEntityAnimation behavior for characters
 */

import { IAnimationBehavior } from '../interfaces';
import { Orientation } from '../../geometry/orientation';
import { CharacterAnimation, Character } from '../../game-objects/Character';
import { CharacterState } from '../../constants/character-states';
import { getAnimationsForEntity } from '../../constants/entity-animations';
import { EntityType } from '../../constants/entities';
import { ASSETS } from '../../constants/assets';

/**
 * BaseEntityAnimation behavior for all characters
 * Provides animations for any entity based on CharacterState
 * 
 * This is the central class responsible for ALL visual effects and animations
 * related to characters in the game. No other class should handle animation logic.
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
   * This is the single entry point for all animation logic
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
    
    // Set flipping
    character.setFlipX(flip);
    
    // Determine if this animation should repeat or play once
    const shouldRepeat = !(
      state === CharacterState.ATTACK || 
      state === CharacterState.SHOOTING || 
      state === CharacterState.PUNCHING || 
      state === CharacterState.HIT
    );
    
    // Play the animation with appropriate repeat setting
    character.play(anim, shouldRepeat);
    
    // Apply additional visual effects based on state
    switch (state) {
      case CharacterState.HIT:
        this.applyTint(character, 0xff0000, 500);
        break;
      case CharacterState.ATTACK:
      case CharacterState.SHOOTING:
      case CharacterState.PUNCHING:
        this.applyTint(character, 0xffaa00, 200);
        break;
      case CharacterState.DEATH:
        this.playDeathEffect(character);
        break;
    }
  }

  /**
   * Set up animations for this character
   */
  setupAnimations(character: Character): void {
    // Store animation sets on the character for reference
    character.setData('animationSets', this.animationSets);
  }
  
  /**
   * Add death effect
   * This is the ONLY place death animation should be handled
   */
  private playDeathEffect(character: Character): void {
    // Make character invisible once death animation starts
    character.setVisible(false);
    
    try {
      // Add the death effect sprite for enhanced visuals
      const scene = character.getScene();
      const deathAnim = scene.add.sprite(character.x, character.y, ASSETS.IMAGES.MONSTER_DEATH);
      deathAnim.play(ASSETS.ANIMATIONS.MONSTER_DEATH, false);
      
      // The sprite should clean itself up after playing
      deathAnim.on('animationcomplete', () => {
        deathAnim.destroy();
      });
    } catch (e) {
      console.error('Error playing death effect animation', e);
    }
  }
  
  /**
   * Apply tint to character with automatic removal after delay
   * Centralizes tinting logic that was duplicated
   */
  private applyTint(character: Character, tintColor: number, duration: number): void {
    character.setTint(tintColor);
    
    try {
      const scene = character.getScene();
      scene.time.addEvent({
        delay: duration,
        callback: () => character.clearTint(),
        callbackScope: this,
      });
    } catch (e) {
      console.error('Error accessing scene for tint animation', e);
      setTimeout(() => character.clearTint(), duration);
    }
  }
} 