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
 * 
 * This is the central class responsible for ALL visual effects and animations
 * related to characters in the game. No other class should handle animation logic.
 */
export class BaseEntityAnimation implements IAnimationBehavior {
  private animationSets: Partial<Record<CharacterState, CharacterAnimation>>;

  /**
   * Constructor with a simplified approach using the centralized animation mapping
   * @param animationSets The animation sets to use, typically from getAnimationsForEntity
   * @param entityType Optional entity type to apply special rendering settings
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
      if (state !== CharacterState.IDLE && this.animationSets[CharacterState.IDLE]) {
        this.playAnimation(character, CharacterState.IDLE, orientation);
      }
      return;
    }
    
    // Get the correct animation data for the orientation
    const { flip, anim } = this.animationSets[state][orientation];
    
    if(state === CharacterState.ATTACK || 
      state === CharacterState.SHOOTING || 
      state === CharacterState.PUNCHING || 
      state === CharacterState.HIT) {
        console.log(`[Animation] Playing ${anim} for state ${state}`);
      }
    
    // Set flipping
    character.setFlipX(flip);
    
    // Determine if this animation should repeat or play once
    const shouldRepeat = !(
      state === CharacterState.ATTACK || 
      state === CharacterState.SHOOTING || 
      state === CharacterState.PUNCHING || 
      state === CharacterState.HIT
    );

    // For one-time animations, ensure we track completion
    if (!shouldRepeat) {
      // Make sure the animation completes by setting a flag
      character.setData('animationPlaying', true);
      
      // Set a timer as a backup to return to IDLE after animation should be done
      const scene = character.getScene();
      if (scene) {
        // Typical one-time animations take ~800ms
        scene.time.delayedCall(800, () => {
          if (character.active && character.getState() === state) {
            console.log(`[Animation] Timer completed for ${anim}, transitioning to IDLE`);
            character.setState(CharacterState.IDLE);
          }
        }, [], this);
      }
    }
    
    // Play the animation
    if (shouldRepeat) {
      character.play(anim, true);
    } else {
      character.play(anim, false);  
    }
    
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
    
    // Update weapon animations if the character has an equipped weapon
    this.updateWeaponAnimation(character, state, orientation);
  }

  /**
   * Update weapon animation to match character state and orientation
   * @private
   */
  private updateWeaponAnimation(character: Character, state: CharacterState, orientation: Orientation): void {
    const weapon = character.getEquippedWeapon();
    
    if (weapon) {
      // For non-attack states, update through the normal system
      if (state !== CharacterState.ATTACK && 
          state !== CharacterState.SHOOTING && 
          state !== CharacterState.PUNCHING) {
        // Let the weapon handle animation details based on centralized configuration
        weapon.updateWeaponPosition(character);
      } 
      // For attack states, play the weapon-specific attack animation
      else {
        weapon.playAttackAnimation(orientation);
      }
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