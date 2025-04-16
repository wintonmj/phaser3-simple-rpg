/**
 * @fileoverview Abstract base class for combat behaviors
 */

import { ICombatBehavior } from '../interfaces';
import { NonPlayerEntity } from '../../game-objects/entities/NonPlayerEntity';
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
  update(_entity: NonPlayerEntity): void {
    // Default implementation does nothing
  }

  /**
   * Check if entity can attack (based on cooldown and target validity)
   */
  protected canAttack(target: Character): boolean {
    if (!target) return false;
    
    // Check if enough time has passed since the last attack
    const currentTime = new Date().getTime();
    return currentTime - this.lastAttackTime >= this.hitDelay;
  }

  /**
   * Entity performs an attack against a target
   * Template method that calls doAttack if conditions are met
   */
  attack(entity: NonPlayerEntity, target: Character): void {
    if (!this.canAttack(target)) return;
    
    // Perform the actual attack implementation
    this.doAttack(entity, target);
    
    // Update last attack time
    this.lastAttackTime = new Date().getTime();
  }

  /**
   * Specific attack implementation to be provided by child classes
   */
  protected abstract doAttack(entity: NonPlayerEntity, target: Character): void;

  /**
   * Entity takes damage
   */
  takeDamage(entity: NonPlayerEntity, amount: number): void {
    entity.setHp(entity.getHp() - amount);
    entity.setTint(0xff0000);
    
    try {
      // Get scene from entity
      const scene = entity.getScene();
      scene.time.addEvent({
        delay: this.hitDelay,
        callback: () => entity.clearTint(),
        callbackScope: this,
      });
    } catch (e) {
      console.error('Error accessing scene for tint animation', e);
      // Fallback to setTimeout if scene isn't available
      setTimeout(() => entity.clearTint(), this.hitDelay);
    }
    
    if (entity.getHp() <= 0) {
      this.die(entity);
    }
  }

  /**
   * Handle entity death
   */
  protected die(entity: NonPlayerEntity): void {
    try {
      const scene = entity.getScene();
      const deathAnim = scene.add.sprite(entity.x, entity.y, ASSETS.IMAGES.MONSTER_DEATH);
      entity.destroy();
      deathAnim.play(ASSETS.ANIMATIONS.MONSTER_DEATH, false);
    } catch (e) {
      console.error('Error playing death animation', e);
      entity.destroy();
    }
  }

  /**
   * Play attack animation
   */
  protected animateAttack(entity: NonPlayerEntity): void {
    // Simple animation for attack, can be enhanced later
    entity.setTint(0xffaa00);
    
    try {
      const scene = entity.getScene();
      scene.time.addEvent({
        delay: 200,
        callback: () => entity.clearTint(),
        callbackScope: this,
      });
    } catch (e) {
      console.error('Error accessing scene for attack animation', e);
      setTimeout(() => entity.clearTint(), 200);
    }
  }
} 