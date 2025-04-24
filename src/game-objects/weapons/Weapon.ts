import { AbstractCombatBehavior } from '../../behaviors/combat/AbstractCombatBehavior';
import { WeaponType } from '../../constants/weapon-types';
import { CharacterState } from '../../constants/character-states';
import { AttackContext } from '../../types/AttackContext';
import { Character } from '../Character';
import { Orientation } from '../../geometry/orientation';
import { getDimensionsForEntity } from '../../constants/entity-animations';
import { EntityType } from '../../constants/entities';

export abstract class Weapon {
  protected combatBehavior: AbstractCombatBehavior;
  protected damage: number;
  protected range: number;
  protected attackCooldown: number;
  
  // New properties for sprite handling
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
  
  // New methods for sprite management
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
  
  public updateWeaponPosition(character: Character): void {
    if (this.weaponSprite) {
      this.weaponSprite.setPosition(character.x, character.y);
      
      // Update orientation based on character facing
      const orientation = character.getOrientation();
      this.updateWeaponOrientation(orientation);
      
      // Update animation based on character state
      const state = character.getState();
      this.updateWeaponState(state, orientation);
      
      // Update visibility based on character visibility
      this.weaponSprite.setVisible(character.visible);
    }
  }
  
  // Cleanup method when weapon is unequipped
  public destroySprite(): void {
    if (this.weaponSprite) {
      this.weaponSprite.destroy();
      this.weaponSprite = null;
    }
  }
  
  // Abstract method for weapon-specific orientation adjustments
  protected abstract updateWeaponOrientation(orientation: Orientation): void;
  
  // Update weapon animation based on character state
  /* eslint-disable @typescript-eslint/no-unused-vars */
  protected updateWeaponState(_state: CharacterState, _orientation: Orientation): void {
    // Base implementation does nothing - to be overridden by subclasses if needed
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */
  
  // Play weapon-specific attack animation
  public abstract playAttackAnimation(orientation: Orientation): void;
} 