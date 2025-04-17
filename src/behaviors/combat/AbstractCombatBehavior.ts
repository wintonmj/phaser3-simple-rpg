/**
 * @fileoverview Abstract base class for combat behaviors
 */

import { ICombatBehavior } from '../interfaces';
import { Character } from '../../game-objects/Character';
import { CharacterState } from '../../constants/character-states';

/**
 * Abstract base class for combat behaviors
 */
export abstract class AbstractCombatBehavior implements ICombatBehavior {
  protected hitDelay: number;

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
  protected canAttack(attacker: Character, target: Character): boolean {
    if (!target) return false;
    
    // Use character's unified cooldown system instead of tracking our own
    return attacker.isOffCooldown('attack', this.hitDelay);
  }

  /**
   * Character performs an attack against a target
   * Template method that calls doAttack if conditions are met
   */
  attack(attacker: Character, target: Character): void {
    if (!this.canAttack(attacker, target)) return;
    
    // Set attacker to appropriate attack state - animation will be handled by state system
    const attackState = this.getAttackState();
    attacker.setState(attackState);
    
    // Perform the actual attack implementation
    this.doAttack(attacker, target);
    
    // Start the attack cooldown using character's system
    attacker.startCooldown('attack');
  }

  /**
   * Determine the appropriate attack state based on character's weapon/attack type
   * Subclasses can override this to provide specific attack states
   */
  protected getAttackState(): CharacterState {
    // Default implementation returns basic ATTACK state
    return CharacterState.ATTACK;
  }

  /**
   * Specific attack implementation to be provided by child classes
   * Should directly call target.loseHp() with appropriate damage
   */
  protected abstract doAttack(attacker: Character, target: Character): void;
} 