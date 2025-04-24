/**
 * @fileoverview BaseEntityAnimation behavior for characters
 */

import { IAnimationBehavior } from '../interfaces';
import { Orientation } from '../../geometry/orientation';
import { CharacterAnimation, Character } from '../../game-objects/Character';
import { CharacterState } from '../../constants/character-states';
import { getAnimationsForEntity } from '../../constants/entity-animations';
import { EntityType, ENTITIES } from '../../constants/entities';
import { GOKU_ANIMATIONS } from '../../constants/animation-configs';

/**
 * BaseEntityAnimation behavior for all characters
 * Provides animations for any entity based on CharacterState
 * 
 * This is the central class responsible for ALL visual effects and animations
 * related to characters in the game. No other class should handle animation logic.
 */
export class BaseEntityAnimation implements IAnimationBehavior {
  private animationSets: Partial<Record<CharacterState, CharacterAnimation>>;
  private entityType?: EntityType;

  /**
   * Constructor with a simplified approach using the centralized animation mapping
   * @param animationSets The animation sets to use, typically from getAnimationsForEntity
   * @param entityType Optional entity type to apply special rendering settings
   */
  constructor(animationSets: Partial<Record<CharacterState, CharacterAnimation>>, entityType?: EntityType) {
    this.animationSets = animationSets;
    this.entityType = entityType;
  }

  /**
   * Static factory method to create an animation behavior for an entity type
   * @param entityType The type of entity to create animations for
   * @returns A new BaseEntityAnimation instance configured for the entity type
   */
  static forEntityType(entityType: EntityType): BaseEntityAnimation {
    const animations = getAnimationsForEntity(entityType);
    return new BaseEntityAnimation(animations, entityType);
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
    
    // Apply specific texture filtering to improve scaling quality for certain entities
    if (this.entityType === ENTITIES.GOKU || 
        character.getData('usingGokuAnimations') || 
        this.animationSets === GOKU_ANIMATIONS) {
      
      // Special sprite rendering improvement for Goku animations
      try {
        // Set linear texture filtering for smoother scaling
        if (character.texture && character.texture.setFilter) {
          character.texture.setFilter(Phaser.Textures.LINEAR);
        }
        
        // Store flag that we've applied Goku-specific optimizations
        character.setData('optimizedForScaling', true);
        
        console.log('Applied Goku-specific texture optimizations');
      } catch (err) {
        console.warn('Could not apply texture filtering optimizations', err);
      }
    }
  }

  /**
   * Apply a tint to the character for a duration
   * @private
   */
  private applyTint(character: Character, color: number, duration: number): void {
    character.setTint(color);
    
    // Reset tint after duration
    const scene = character.getScene();
    if (scene && scene.time) {
      scene.time.delayedCall(duration, () => {
        if (character.active) {
          character.clearTint();
        }
      }, [], this);
    }
  }
  
  /**
   * Play death effect for the character
   * @private
   */
  private playDeathEffect(character: Character): void {
    // Could be enhanced with particle effects or special animations
    character.setAlpha(0.7);
    character.setTint(0x555555);
  }
} 