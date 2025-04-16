/**
 * @fileoverview RangedCombat behavior for entities that can attack from a distance
 */

import { ICombatBehavior } from '../interfaces';
import { NonPlayerEntity } from '../../game-objects/entities/NonPlayerEntity';
import { Character } from '../../game-objects/Character';
import { ASSETS } from '../../constants/assets';
import { AbstractScene } from '../../scenes/AbstractScene';

/**
 * RangedCombat behavior for hostile entities
 * This is a temporary placeholder implementation that mimics the previous built-in behavior
 */
export class RangedCombat implements ICombatBehavior {
  private hitDelay = 100;
  private projectileGenerator: (scene: AbstractScene, x: number, y: number) => void;

  constructor(projectileGenerator?: (scene: AbstractScene, x: number, y: number) => void, hitDelay = 100) {
    this.hitDelay = hitDelay;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.projectileGenerator = projectileGenerator || ((_scene, _x, _y) => {
      console.warn('No projectile generator provided for RangedCombat');
    });
  }

  /**
   * Update method called every frame
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(_entity: NonPlayerEntity): void {
    // No update needed for basic ranged combat
  }

  /**
   * Entity performs an attack against a target
   */
  attack(entity: NonPlayerEntity, target: Character): void {
    if (!target) return;
    
    this.animateAttack(entity, target);
  }

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
   * Play attack animation and generate projectile
   */
  private animateAttack(entity: NonPlayerEntity, target: Character): void {
    // Simple animation for attack
    entity.setTint(0xffaa00);
    
    try {
      const scene = entity.getScene();
      scene.time.addEvent({
        delay: 200,
        callback: () => entity.clearTint(),
        callbackScope: this,
      });
      
      // Generate projectile using the provided generator
      if (this.projectileGenerator) {
        this.projectileGenerator(scene, target.x, target.y);
      }
    } catch (e) {
      console.error('Error during ranged attack', e);
      setTimeout(() => entity.clearTint(), 200);
    }
  }
} 