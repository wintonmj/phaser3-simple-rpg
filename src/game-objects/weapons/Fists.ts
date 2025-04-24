import { Weapon } from './Weapon';
import { AttackContext } from '../../types/AttackContext';
import { MeleeCombat } from '../../behaviors/combat/MeleeCombat';
import { WeaponType } from '../../constants/weapon-types';
import { CharacterState } from '../../constants/character-states';
import { Orientation } from '../../geometry/orientation';

export class Fists extends Weapon {
  constructor(_scene?: Phaser.Scene, _x?: number, _y?: number) {
    super(new MeleeCombat());
    
    this.damage = 1;
    this.range = 10;
    this.attackCooldown = 500;
    
    // Fists don't have a visual representation, so we don't create a sprite
  }
  
  attack(context: AttackContext): void {
    const { source, direction, scene } = context;
    
    // Create hitbox in front of character based on direction
    const hitbox = this.createHitbox(source, direction);
    
    // Find all targets within hitbox
    const targets = scene.getEnemiesInArea(hitbox);
    
    // Apply damage to all targets in hitbox
    targets.forEach(target => target.loseHp(this.damage));
    
    // Optional debug visualization (uncomment for development)
    /*
    if (scene.game.config.physics.arcade.debug) {
      const graphics = scene.add.graphics({ fillStyle: { color: 0xff0000, alpha: 0.5 } });
      graphics.fillRectShape(hitbox);
      scene.time.delayedCall(200, () => graphics.destroy());
    }
    */
  }
  
  getAttackState(): CharacterState {
    return CharacterState.PUNCHING;
  }
  
  getWeaponType(): WeaponType {
    return WeaponType.MELEE;
  }
  
  // Implement abstract methods from Weapon class
  protected updateWeaponOrientation(_orientation: Orientation): void {
    // Fists don't have a sprite, so no orientation updates needed
  }
  
  public playAttackAnimation(_orientation: Orientation): void {
    // Fists don't have a sprite, so no animation to play
  }
  
  private createHitbox(character: { x: number, y: number }, direction: Orientation): Phaser.Geom.Rectangle {
    // Create hitbox based on character position and orientation
    const { x, y } = character;
    const hitboxSize = this.range;
    
    switch (direction) {
      case Orientation.Up:
        return new Phaser.Geom.Rectangle(x - hitboxSize/2, y - hitboxSize, hitboxSize, hitboxSize);
      case Orientation.Down:
        return new Phaser.Geom.Rectangle(x - hitboxSize/2, y, hitboxSize, hitboxSize);
      case Orientation.Left:
        return new Phaser.Geom.Rectangle(x - hitboxSize, y - hitboxSize/2, hitboxSize, hitboxSize);
      case Orientation.Right:
        return new Phaser.Geom.Rectangle(x, y - hitboxSize/2, hitboxSize, hitboxSize);
    }
  }
} 