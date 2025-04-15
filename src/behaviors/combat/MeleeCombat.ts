/**
 * @fileoverview MeleeCombat behavior for entities that can attack in melee range
 */

import { ICombatBehavior } from '../interfaces';
import { NonPlayerEntity } from '../../game-objects/entities/NonPlayerEntity';
import { Character } from '../../game-objects/Character';
import { ASSETS } from '../../constants/assets';

/**
 * MeleeCombat behavior for hostile entities
 * This is a temporary placeholder implementation that mimics the previous built-in behavior
 */
export class MeleeCombat implements ICombatBehavior {
  private hitDelay = 100;

  constructor(hitDelay = 100) {
    this.hitDelay = hitDelay;
  }

  /**
   * Update method called every frame
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(_entity: NonPlayerEntity): void {
    // No update needed for basic melee combat
  }

  /**
   * Entity performs an attack against a target
   */
  attack(entity: NonPlayerEntity, target: Character): void {
    if (!target) return;
    
    // Attempt to access player from target if it has a canGetHit method
    if ('canGetHit' in target && typeof target.canGetHit === 'function') {
      if (!target.canGetHit()) return;
      if ('loseHp' in target && typeof target.loseHp === 'function') {
        target.loseHp();
      }
    }

    this.animateAttack(entity);
  }

  /**
   * Entity takes damage
   */
  takeDamage(entity: NonPlayerEntity, amount: number): void {
    entity.hp -= amount;
    
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
    
    if (entity.hp <= 0) {
      this.die(entity);
    }
  }

  /**
   * Handle entity death
   */
  private die(entity: NonPlayerEntity): void {
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
  private animateAttack(entity: NonPlayerEntity): void {
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