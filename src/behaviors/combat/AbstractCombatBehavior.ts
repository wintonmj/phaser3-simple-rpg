/**
 * @fileoverview Abstract base class for combat behaviors
 */

import { ICombatBehavior } from '../interfaces';
import { Character } from '../../game-objects/Character';
import { ASSETS } from '../../constants/assets';

/**
 * Abstract base class for combat behaviors
 */
export abstract class AbstractCombatBehavior implements ICombatBehavior {
  protected hitDelay: number;
  protected lastAttackTime: number = 0;

  constructor(hitDelay = 1000) {
    this.hitDelay = hitDelay;
  }

  /**
   * Update method called every frame
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(_character: Character): void {
    // Default implementation does nothing
  }

  /**
   * Check if character can attack (based on cooldown and target validity)
   */
  protected canAttack(target: Character): boolean {
    if (!target) return false;
    
    // Check if enough time has passed since the last attack
    const currentTime = new Date().getTime();
    return currentTime - this.lastAttackTime >= this.hitDelay;
  }

  /**
   * Character performs an attack against a target
   * Template method that calls doAttack if conditions are met
   */
  attack(attacker: Character, target: Character): void {
    if (!this.canAttack(target)) return;
    
    // Show attack animation effect
    if (attacker.getAnimationBehavior()) {
      attacker.getAnimationBehavior().playAttackEffect(attacker, 200);
    }
    
    // Perform the actual attack implementation
    this.doAttack(attacker, target);
    
    // Update last attack time
    this.lastAttackTime = new Date().getTime();
  }

  /**
   * Specific attack implementation to be provided by child classes
   */
  protected abstract doAttack(attacker: Character, target: Character): void;

  /**
   * Character takes damage - delegates to Character.loseHp
   */
  takeDamage(character: Character, amount: number): void {
    // Simply delegate to the centralized damage handling in Character
    character.loseHp(amount);
  }

  /**
   * Handle character death
   */
  protected die(character: Character): void {
    try {
      // Get scene using the character's getScene method
      const scene = character.getScene();
      const deathAnim = scene.add.sprite(character.x, character.y, ASSETS.IMAGES.MONSTER_DEATH);
      character.destroy();
      deathAnim.play(ASSETS.ANIMATIONS.MONSTER_DEATH, false);
    } catch (e) {
      console.error('Error playing death animation', e);
      character.destroy();
    }
  }

  /**
   * Play attack animation
   */
  protected animateAttack(character: Character): void {
    // Simple animation for attack, can be enhanced later
    character.setTint(0xffaa00);
    
    try {
      // Get scene using the character's getScene method
      const scene = character.getScene();
      scene.time.addEvent({
        delay: 200,
        callback: () => character.clearTint(),
        callbackScope: this,
      });
    } catch (e) {
      console.error('Error accessing scene for attack animation', e);
      setTimeout(() => character.clearTint(), 200);
    }
  }
} 