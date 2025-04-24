import { Weapon } from './Weapon';
import { AttackContext } from '../../types/AttackContext';
import { RangedCombat } from '../../behaviors/combat/RangedCombat';
import { WeaponType } from '../../constants/weapon-types';
import { CharacterState } from '../../constants/character-states';
import { Arrow } from '../projectiles/Arrow';
import { Orientation } from '../../geometry/orientation';
import { ASSETS } from '../../constants/assets';
import { AbstractScene } from '../../scenes/AbstractScene';
import { ENTITIES } from '../../constants/entities';

export class Bow extends Weapon {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(new RangedCombat(
      // ProjectileFactory implementation - it expects (scene, x, y) signature
      (scene, x, y) => new Arrow(scene as AbstractScene, x, y, Orientation.Down) // Default orientation, will be set correctly in attack method
    ));
    
    this.damage = 1;
    this.range = 200;
    this.attackCooldown = 1000;
    
    // Create the bow sprite using the idle texture and BOW entity type for proper scaling
    this.createWeaponSprite(scene, x, y, ASSETS.IMAGES.BOW_IDLE, ENTITIES.BOW);
  }
  
  attack(context: AttackContext): void {
    const { source, direction, scene } = context;
    
    // Play the appropriate attack animation
    this.playAttackAnimation(direction);
    
    // Create arrow projectile after a slight delay to match animation
    scene.time.delayedCall(200, () => {
      new Arrow(scene as AbstractScene, source.x, source.y, direction);
    }, [], this);
  }
  
  getAttackState(): CharacterState {
    return CharacterState.SHOOTING;
  }
  
  getWeaponType(): WeaponType {
    return WeaponType.RANGED;
  }
} 