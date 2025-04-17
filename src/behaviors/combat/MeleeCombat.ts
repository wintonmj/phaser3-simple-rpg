/**
 * @fileoverview MeleeCombat behavior for entities that attack at close range
 */

import { AbstractCombatBehavior } from './AbstractCombatBehavior';
import { Character } from '../../game-objects/Character';
import { CharacterState } from '../../constants/character-states';

/**
 * MeleeCombat behavior for close-range attacks
 */
export class MeleeCombat extends AbstractCombatBehavior {
  private baseDamage: number;

  constructor(baseDamage = 1, hitDelay = 500) {
    super(hitDelay);
    this.baseDamage = baseDamage;
  }

  /**
   * Implementation of the melee attack behavior
   * @override
   */
  protected doAttack(_attacker: Character, target: Character): void {
    // Direct damage application for melee attacks
    target.loseHp(this.baseDamage);
  }

  /**
   * Override to return the punch animation state for melee attacks
   * @override
   */
  protected getAttackState(): CharacterState {
    return CharacterState.PUNCHING;
  }
} 