/**
 * @fileoverview RangedCombat behavior for entities that can attack from a distance
 */

import { AbstractCombatBehavior } from './AbstractCombatBehavior';
import { Character } from '../../game-objects/Character';
import { AbstractScene } from '../../scenes/AbstractScene';

/**
 * Type for a projectile factory function
 */
export type ProjectileFactory = (scene: AbstractScene, x: number, y: number) => Phaser.Physics.Arcade.Sprite;

/**
 * RangedCombat behavior for hostile entities
 * This is a temporary placeholder implementation that mimics the previous built-in behavior
 */
export class RangedCombat extends AbstractCombatBehavior {
  private projectileFactory: ProjectileFactory;
  private sourceEntity: Character | null = null;

  constructor(
    projectileFactory: ProjectileFactory,
    hitDelay = 1000
  ) {
    super(hitDelay);
    this.projectileFactory = projectileFactory;
  }

  /**
   * Sets the source entity for this combat behavior
   * This allows the behavior to use the entity's position without keeping a closure
   */
  public setSourceEntity(entity: Character): void {
    this.sourceEntity = entity;
  }

  /**
   * Implementation of the attack behavior for ranged attacks
   * @override
   */
  protected doAttack(attacker: Character, target: Character): void {
    this.sourceEntity = attacker; // Ensure we have the latest reference to attacker
    this.generateProjectile(target);
  }

  /**
   * Generate projectile for the attack
   */
  private generateProjectile(target: Character): void {
    if (!this.sourceEntity) return;
    
    try {
      const scene = this.sourceEntity.getScene() as AbstractScene;
      
      // Generate projectile using the entity's current position
      const projectile = this.projectileFactory(
        scene, 
        this.sourceEntity.x, 
        this.sourceEntity.y
      );
      
      // Calculate direction from source to target
      const dx = target.x - this.sourceEntity.x;
      const dy = target.y - this.sourceEntity.y;
      const angle = Math.atan2(dy, dx);
      
      // Set projectile velocity toward target
      const speed = 200;
      scene.physics.velocityFromRotation(angle, speed, projectile.body.velocity);
    } catch (e) {
      console.error('Error generating projectile', e);
    }
  }
} 