/**
 * @fileoverview RangedCombat behavior for entities that can attack from a distance
 */

import { AbstractCombatBehavior } from './AbstractCombatBehavior';
import { NonPlayerEntity } from '../../game-objects/entities/NonPlayerEntity';
import { Character } from '../../game-objects/Character';
import { AbstractScene } from '../../scenes/AbstractScene';

/**
 * RangedCombat behavior for hostile entities
 * This is a temporary placeholder implementation that mimics the previous built-in behavior
 */
export class RangedCombat extends AbstractCombatBehavior {
  private projectileGenerator: (scene: AbstractScene, x: number, y: number) => void;

  constructor(
    projectileGenerator?: (scene: AbstractScene, x: number, y: number) => void, 
    hitDelay = 1000
  ) {
    super(hitDelay);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.projectileGenerator = projectileGenerator || ((_scene, _x, _y) => {
      console.warn('No projectile generator provided for RangedCombat');
    });
  }

  /**
   * Entity performs an attack against a target
   */
  attack(entity: NonPlayerEntity, target: Character): void {
    if (!target) return;
    
    // Create animation and projectile
    this.animateAttack(entity);
    this.generateProjectile(entity, target);
  }

  /**
   * Generate projectile for the attack
   */
  private generateProjectile(entity: NonPlayerEntity, target: Character): void {
    try {
      const scene = entity.getScene();
      // Generate projectile using the provided generator
      if (this.projectileGenerator) {
        this.projectileGenerator(scene, target.x, target.y);
      }
    } catch (e) {
      console.error('Error generating projectile', e);
    }
  }
} 