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
import { BOW_ANIMATIONS } from '../../constants/animation-configs';

export class Bow extends Weapon {
  // Animation keys for different orientations
  private bowIdleAnimations: {[key in Orientation]: string};
  private bowMoveAnimations: {[key in Orientation]: string};
  private bowAttackAnimations: {[key in Orientation]: string};

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(new RangedCombat(
      // ProjectileFactory implementation - it expects (scene, x, y) signature
      (scene, x, y) => new Arrow(scene as AbstractScene, x, y, Orientation.Down) // Default orientation, will be set correctly in attack method
    ));
    
    this.damage = 1;
    this.range = 200;
    this.attackCooldown = 1000;
    
    // Define animation keys using constants from ASSETS
    this.bowIdleAnimations = {
      [Orientation.Up]: ASSETS.ANIMATIONS.BOW_IDLE_UP,
      [Orientation.Down]: ASSETS.ANIMATIONS.BOW_IDLE_DOWN,
      [Orientation.Left]: ASSETS.ANIMATIONS.BOW_IDLE_LEFT,
      [Orientation.Right]: ASSETS.ANIMATIONS.BOW_IDLE_RIGHT
    };
    
    this.bowMoveAnimations = {
      [Orientation.Up]: ASSETS.ANIMATIONS.BOW_WALK_UP,
      [Orientation.Down]: ASSETS.ANIMATIONS.BOW_WALK_DOWN,
      [Orientation.Left]: ASSETS.ANIMATIONS.BOW_WALK_LEFT,
      [Orientation.Right]: ASSETS.ANIMATIONS.BOW_WALK_RIGHT
    };
    
    this.bowAttackAnimations = {
      [Orientation.Up]: ASSETS.ANIMATIONS.BOW_SHOOT_UP,
      [Orientation.Down]: ASSETS.ANIMATIONS.BOW_SHOOT_DOWN,
      [Orientation.Left]: ASSETS.ANIMATIONS.BOW_SHOOT_LEFT,
      [Orientation.Right]: ASSETS.ANIMATIONS.BOW_SHOOT_RIGHT
    };
    
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
  
  protected updateWeaponOrientation(orientation: Orientation): void {
    if (this.weaponSprite) {
      // Only update position offsets, don't set flip here
      switch (orientation) {
        case Orientation.Up:
          this.weaponSprite.setPosition(this.weaponSprite.x, this.weaponSprite.y);
          break;
        case Orientation.Down:
          this.weaponSprite.setPosition(this.weaponSprite.x, this.weaponSprite.y);
          break;
        case Orientation.Left:
          this.weaponSprite.setPosition(this.weaponSprite.x, this.weaponSprite.y);
          break;
        case Orientation.Right:
          this.weaponSprite.setPosition(this.weaponSprite.x, this.weaponSprite.y);
          break;
      }
    }
  }
  
  protected override updateWeaponState(state: CharacterState, orientation: Orientation): void {
    if (!this.weaponSprite) return;
    
    // Get the appropriate animation based on character state and orientation
    let animationKey: string;
    let shouldFlip = false;
    
    // Select the appropriate animation based on character state
    switch (state) {
      case CharacterState.MOVE:
        animationKey = this.bowMoveAnimations[orientation];
        // Get flip property from BOW_ANIMATIONS
        shouldFlip = BOW_ANIMATIONS[CharacterState.MOVE]?.[orientation === Orientation.Up ? 'up' : 
                                                        orientation === Orientation.Down ? 'down' : 
                                                        orientation === Orientation.Left ? 'left' : 'right']?.flip || false;
        break;
      case CharacterState.ATTACK:
      case CharacterState.SHOOTING:
        animationKey = this.bowAttackAnimations[orientation];
        // Get flip property from BOW_ANIMATIONS
        shouldFlip = BOW_ANIMATIONS[CharacterState.SHOOTING]?.[orientation === Orientation.Up ? 'up' : 
                                                           orientation === Orientation.Down ? 'down' : 
                                                           orientation === Orientation.Left ? 'left' : 'right']?.flip || false;
        break;
      case CharacterState.HIT:
        // Get flip property from BOW_ANIMATIONS
        shouldFlip = BOW_ANIMATIONS[CharacterState.HIT]?.[orientation === Orientation.Up ? 'up' : 
                                                      orientation === Orientation.Down ? 'down' : 
                                                      orientation === Orientation.Left ? 'left' : 'right']?.flip || false;
        animationKey = this.bowIdleAnimations[orientation];
        break;
      case CharacterState.IDLE:
      default:
        animationKey = this.bowIdleAnimations[orientation];
        // Get flip property from BOW_ANIMATIONS (if we had IDLE animations)
        break;
    }
    
    // Apply flip setting
    this.weaponSprite.setFlipX(shouldFlip);
    
    // Only play the animation if it's different from the current one
    if (this.weaponSprite.anims.currentAnim?.key !== animationKey) {
      this.weaponSprite.play(animationKey, true);
    }
  }
  
  public playAttackAnimation(orientation: Orientation): void {
    if (this.weaponSprite) {
      const animKey = this.bowAttackAnimations[orientation];
      
      // Get the flip value from BOW_ANIMATIONS
      const shouldFlip = BOW_ANIMATIONS[CharacterState.SHOOTING]?.[orientation === Orientation.Up ? 'up' : 
                                                                orientation === Orientation.Down ? 'down' : 
                                                                orientation === Orientation.Left ? 'left' : 'right']?.flip || false;
      
      // Apply flip setting
      this.weaponSprite.setFlipX(shouldFlip);
      this.weaponSprite.play(animKey);
      
      // Reset to idle animation when attack animation completes
      this.weaponSprite.once('animationcomplete', () => {
        if (this.weaponSprite) {
          this.weaponSprite.play(this.bowIdleAnimations[orientation], true);
        }
      });
    }
  }
} 