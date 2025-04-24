/**
 * @fileoverview BaseEntityAnimation behavior for characters
 */

import { IAnimationBehavior, IAnimatableEntity } from '../interfaces';
import { Orientation } from '../../geometry/orientation';
import { CharacterAnimation, Character } from '../../game-objects/Character';
import { CharacterState } from '../../constants/character-states';
import { getAnimationsForEntity } from '../../constants/entity-animations';
import { EntityType } from '../../constants/entities';
import { getWeaponAnimationKey } from '../../constants/weapon-animations';

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
   * Play the appropriate animation for any animatable entity based on state and orientation
   * This generic method can be used for both characters and weapon sprites
   */
  playAnimationForEntity(
    entity: IAnimatableEntity,
    animationData: { flip: boolean, anim: string },
    shouldRepeat: boolean = true
  ): void {
    // Set flipping
    entity.setFlipX(animationData.flip);
    
    // Play the animation
    if (shouldRepeat) {
      entity.play(animationData.anim, true);
    } else {
      entity.play(animationData.anim, false);
    }
  }

  /**
   * Determines if an animation should repeat based on character state
   */
  private shouldAnimationRepeat(state: CharacterState): boolean {
    return !(
      state === CharacterState.ATTACK || 
      state === CharacterState.SHOOTING || 
      state === CharacterState.PUNCHING || 
      state === CharacterState.HIT
    );
  }

  /**
   * Handles one-time animation completion logic
   */
  private handleOneTimeAnimation(entity: IAnimatableEntity, state: CharacterState, anim: string): void {
    // Make sure the animation completes by setting a flag
    if (entity instanceof Character) {
      entity.setData('animationPlaying', true);
      
      // Set a timer as a backup to return to IDLE after animation should be done
      const scene = entity.getScene();
      if (scene) {
        // Typical one-time animations take ~800ms
        scene.time.delayedCall(800, () => {
          if (entity.active && entity.getState() === state) {
            console.log(`[Animation] Timer completed for ${anim}, transitioning to IDLE`);
            entity.setState(CharacterState.IDLE);
          }
        }, [], this);
      }
    }
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
    
    // Determine if this animation should repeat or play once
    const shouldRepeat = this.shouldAnimationRepeat(state);

    // For one-time animations, ensure we track completion
    if (!shouldRepeat) {
      this.handleOneTimeAnimation(character, state, anim);
    }
    
    // Use the generic method to play the animation
    this.playAnimationForEntity(character, { flip, anim }, shouldRepeat);
    
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
   * This centralized method handles all weapon animations
   * @private
   */
  private updateWeaponAnimation(character: Character, state: CharacterState, orientation: Orientation): void {
    const weapon = character.getEquippedWeapon();
    
    if (!weapon) return;
    
    const weaponSprite = weapon.getSprite();
    if (!weaponSprite) return;
    
    const weaponType = weapon.getWeaponType();
    
    // Position the weapon sprite relative to the character
    weaponSprite.setPosition(character.x, character.y);
    
    // Get animation data from centralized configuration
    const animData = getWeaponAnimationKey(weaponType, state, orientation);
    if (!animData) return;
    
    // Determine if we should repeat based on state
    const shouldRepeat = this.shouldAnimationRepeat(state);
    
    // Play the animation using our generic method
    this.playAnimationForEntity(
      weaponSprite, 
      { flip: animData.shouldFlip, anim: animData.key },
      shouldRepeat
    );
    
    // For attack states, set up the transition back to idle
    if (!shouldRepeat) {
      weaponSprite.once('animationcomplete', () => {
        const idleAnimData = getWeaponAnimationKey(
          weaponType, 
          CharacterState.IDLE, 
          orientation
        );
        
        if (idleAnimData) {
          this.playAnimationForEntity(
            weaponSprite,
            { flip: idleAnimData.shouldFlip, anim: idleAnimData.key },
            true
          );
        }
      });
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