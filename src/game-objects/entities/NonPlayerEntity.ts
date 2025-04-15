/**
 * @fileoverview NonPlayerEntity class that implements behavior composition for game entities.
 * Provides a container for behavior components that determine entity functionality.
 */

import { Character } from '../Character';
import { EntityType } from '../../constants/entities';
import { INonPlayerEntity } from '../../types/entities/entity-interfaces';
import { Orientation } from '../../geometry/orientation';
import { Player } from '../Player';
import { 
  IMovementBehavior, 
  ICombatBehavior, 
  IInteractionBehavior, 
  IAnimationBehavior 
} from '../../behaviors/interfaces';
import { AbstractScene } from '../../scenes/AbstractScene';

/**
 * NonPlayerEntity class that acts as a container for behavior components.
 * Uses composition instead of inheritance for behavior implementation.
 * 
 * @class NonPlayerEntity
 * @extends {Character}
 * @implements {INonPlayerEntity}
 */
export class NonPlayerEntity extends Character implements INonPlayerEntity {
  // Entity type and properties
  public readonly entityType: EntityType;
  public readonly dialogKey?: string;
  public hp: number = 0;
  public readonly attackDamage: number = 1;
  
  // Behavior components
  private movementBehavior: IMovementBehavior;
  private combatBehavior: ICombatBehavior;
  private interactionBehavior: IInteractionBehavior;
  private animationBehavior: IAnimationBehavior;

  /**
   * Creates an instance of NonPlayerEntity with composed behaviors
   * 
   * @param {AbstractScene} scene - The scene this entity belongs to
   * @param {number} x - Initial x position
   * @param {number} y - Initial y position
   * @param {string} texture - The sprite key to use for this entity
   * @param {EntityType} entityType - The type of entity
   * @param {Object} options - Configuration options for entity behavior and properties
   */
  constructor(
    scene: AbstractScene, 
    x: number, 
    y: number, 
    texture: string,
    entityType: EntityType,
    options: {
      movement: IMovementBehavior,
      combat: ICombatBehavior,
      interaction: IInteractionBehavior,
      animation: IAnimationBehavior,
      hp?: number,
      dialogKey?: string,
      attackDamage?: number
    }
  ) {
    super(scene, x, y, texture);
    
    this.entityType = entityType;
    
    // Set up behaviors
    this.movementBehavior = options.movement;
    this.combatBehavior = options.combat;
    this.interactionBehavior = options.interaction;
    this.animationBehavior = options.animation;
    
    // Set up entity state
    this.hp = options.hp ?? 1;
    this.dialogKey = options.dialogKey;
    
    if (options.attackDamage !== undefined) {
      this.attackDamage = options.attackDamage;
    }
    
    // Initialize animations
    this.animationBehavior.setupAnimations(this);
  }
  
  /**
   * Main update method called by scene
   */
  public updateEntity(): void {
    if (!this.active) return;
    
    this.movementBehavior.update(this);
    this.combatBehavior.update(this);
    this.interactionBehavior.update(this);
    // Animation behavior doesn't need updating every frame
  }
  
  /**
   * Returns the entity's scene safely
   */
  public getScene(): AbstractScene {
    return this.scene;
  }
  
  /**
   * Delegate methods to appropriate behaviors
   */
  
  /**
   * Returns if the entity is active
   */
  public isActive(): boolean {
    return this.active;
  }

  /**
   * Move the entity toward a target
   */
  public move(target?: Phaser.Math.Vector2): void {
    this.movementBehavior.move(this, target);
  }
  
  /**
   * Stop the entity's movement
   */
  public stop(): void {
    this.movementBehavior.stop(this);
  }
  
  /**
   * Entity performs an attack
   */
  public attack(): void {
    if (this.scene.player) {
      this.combatBehavior.attack(this, this.scene.player);
    }
  }
  
  /**
   * Entity takes damage
   */
  public loseHp(damage: number | Phaser.Physics.Arcade.Sprite): void {
    // Handle legacy behavior when receiving a sprite projectile
    if (typeof damage !== 'number') {
      damage.destroy();
      damage = 1; // Default damage amount for backward compatibility
    }
    
    this.combatBehavior.takeDamage(this, damage);
  }
  
  /**
   * Player interacts with this entity
   */
  public interact(): void {
    if (this.scene.player) {
      this.interactionBehavior.interact(this, this.scene.player);
    }
  }
  
  /**
   * Check if player can interact with this entity
   */
  public canInteract(player: Player): boolean {
    return this.interactionBehavior.canInteract(this, player);
  }
  
  /**
   * Play an animation for a given state and orientation
   */
  public playAnimation(state: string, orientation: Orientation): void {
    this.animationBehavior.playAnimation(this, state, orientation);
  }
  
  /**
   * Behavior getters/setters
   */
  public getMovementBehavior(): IMovementBehavior {
    return this.movementBehavior;
  }
  
  public setMovementBehavior(behavior: IMovementBehavior): void {
    this.movementBehavior = behavior;
  }
  
  public getCombatBehavior(): ICombatBehavior {
    return this.combatBehavior;
  }
  
  public setCombatBehavior(behavior: ICombatBehavior): void {
    this.combatBehavior = behavior;
  }
  
  public getInteractionBehavior(): IInteractionBehavior {
    return this.interactionBehavior;
  }
  
  public setInteractionBehavior(behavior: IInteractionBehavior): void {
    this.interactionBehavior = behavior;
  }
  
  public getAnimationBehavior(): IAnimationBehavior {
    return this.animationBehavior;
  }
  
  public setAnimationBehavior(behavior: IAnimationBehavior): void {
    this.animationBehavior = behavior;
  }
} 