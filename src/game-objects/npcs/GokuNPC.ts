/**
 * @fileoverview GokuNPC implementation 
 */

import { NonPlayerEntity } from '../entities/NonPlayerEntity';
import { AbstractScene } from '../../scenes/AbstractScene';
import { ASSETS } from '../../constants/assets';
import { ENTITIES } from '../../constants/entities';
import { BaseEntityAnimation } from '../../behaviors/animation/BaseEntityAnimation';
import { NoInteraction } from '../../behaviors/interaction/NoInteraction';
import { IdleMovement } from '../../behaviors/movement/IdleMovement';
import { MeleeCombat } from '../../behaviors/combat/MeleeCombat';

/**
 * Basic Goku NPC implementation
 */
export class GokuNPC extends NonPlayerEntity {
  /**
   * Creates a new Goku NPC
   * 
   * @param scene The scene to add the NPC to
   * @param x X position
   * @param y Y position
   */
  constructor(scene: AbstractScene, x: number, y: number) {
    // Create behavior components using existing behaviors
    const movementBehavior = new IdleMovement();
    const interactionBehavior = new NoInteraction();
    const combatBehavior = new MeleeCombat(); // Using MeleeCombat but will be inactive
    // Use factory method to get animations for this entity type
    const animationBehavior = BaseEntityAnimation.forEntityType(ENTITIES.GOKU);
    
    // Call parent constructor with behaviors
    super(
      scene, 
      x, 
      y, 
      ASSETS.IMAGES.GOKU_IDLE, 
      ENTITIES.GOKU,
      {
        movement: movementBehavior,
        combat: combatBehavior,
        interaction: interactionBehavior,
        animation: animationBehavior,
        hp: 10,
        dialogKey: 'goku_dialog'
      }
    );
    
    this.setDepth(5);
    this.setCollideWorldBounds(true);
    this.setImmovable(true);
  }
} 