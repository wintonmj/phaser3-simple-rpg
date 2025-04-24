import { Weapon } from './Weapon';
import { AttackContext } from '../../types/AttackContext';
import { RangedCombat } from '../../behaviors/combat/RangedCombat';
import { WeaponType } from '../../constants/weapon-types';
import { CharacterState } from '../../constants/character-states';
import { Arrow } from '../projectiles/Arrow';

export class Bow extends Weapon {
  constructor() {
    super(new RangedCombat(
      // ProjectileFactory implementation
      (scene, x, y) => new Arrow(scene, x, y, scene.player.getOrientation())
    ));
    
    this.damage = 1;
    this.range = 200;
    this.attackCooldown = 1000;
  }
  
  attack(context: AttackContext): void {
    const { source, direction, scene } = context;
    // Create arrow projectile in the specified direction
    new Arrow(scene, source.x, source.y, direction);
    
    // Note: We don't need to use the combatBehavior for projectile weapons
    // as they handle their own hit detection through physics
  }
  
  getAttackState(): CharacterState {
     return CharacterState.SHOOTING;
  }
  
  getWeaponType(): WeaponType {
    return WeaponType.RANGED;
  }
} 