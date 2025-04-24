import { AbstractCombatBehavior } from '../../behaviors/combat/AbstractCombatBehavior';
import { WeaponType } from '../../constants/weapon-types';
import { CharacterState } from '../../constants/character-states';
import { AttackContext } from '../../types/AttackContext';
import { getDimensionsForEntity } from '../../constants/entity-animations';
import { EntityType } from '../../constants/entities';

export abstract class Weapon {
  protected combatBehavior: AbstractCombatBehavior;
  protected damage: number;
  protected range: number;
  protected attackCooldown: number;
  
  // Sprite property for the weapon
  protected weaponSprite: Phaser.GameObjects.Sprite | null = null;
  
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
  
  // Create the weapon sprite - now just initializes the sprite without animation
  protected createWeaponSprite(scene: Phaser.Scene, x: number, y: number, texture: string, entityType?: EntityType): void {
    this.weaponSprite = scene.add.sprite(x, y, texture);
    this.weaponSprite.setDepth(15); // Above character depth (assuming character is at depth 10)
    
    // Apply scaling from entity dimensions if an entity type was provided
    if (entityType) {
      const dimensions = getDimensionsForEntity(entityType);
      if (dimensions.scale !== undefined) {
        this.weaponSprite.setScale(dimensions.scale);
      }
    }
  }
  
  // Get the weapon sprite - needed by the animation system
  public getSprite(): Phaser.GameObjects.Sprite | null {
    return this.weaponSprite;
  }

  // Cleanup method when weapon is unequipped
  public destroySprite(): void {
    if (this.weaponSprite) {
      this.weaponSprite.destroy();
      this.weaponSprite = null;
    }
  }
} 