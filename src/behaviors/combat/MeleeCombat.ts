/**
 * @fileoverview MeleeCombat behavior for entities that can attack in melee range
 */

import { AbstractCombatBehavior } from './AbstractCombatBehavior';
import { NonPlayerEntity } from '../../game-objects/entities/NonPlayerEntity';
import { Character } from '../../game-objects/Character';

/**
 * MeleeCombat behavior for hostile entities
 * This is a temporary placeholder implementation that mimics the previous built-in behavior
 */
export class MeleeCombat extends AbstractCombatBehavior {
  constructor(hitDelay = 1000) {
    super(hitDelay);
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
} 