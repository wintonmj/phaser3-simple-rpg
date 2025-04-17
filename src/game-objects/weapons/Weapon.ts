import { AbstractCombatBehavior } from '../../behaviors/combat/AbstractCombatBehavior';
import { WeaponType } from '../../constants/weapon-types';
import { CharacterState } from '../../constants/character-states';
import { AttackContext } from '../../types/AttackContext';

export abstract class Weapon {
  protected combatBehavior: AbstractCombatBehavior;
  protected damage: number;
  protected range: number;
  protected attackCooldown: number;
  
  constructor(combatBehavior: AbstractCombatBehavior) {
    this.combatBehavior = combatBehavior;
  }
  
  abstract attack(context: AttackContext): void;
  abstract getAttackState(): CharacterState;
  abstract getWeaponType(): WeaponType;
  
  public getDamage(): number { return this.damage; }
  public getAttackCooldown(): number { return this.attackCooldown; }
  
  // Bridge between new context system and existing AbstractCombatBehavior
  protected executeCombatBehavior(context: AttackContext): void {
    const { source, target } = context;
    
    // Only delegate to combat behavior if there's a valid target
    if (target && this.combatBehavior) {
      this.combatBehavior.attack(source, target);
    }
  }
} 