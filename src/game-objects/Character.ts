/**
 * @fileoverview Base Character class that provides common functionality for all characters in the game.
 * This class handles physics, animations, and scene integration.
 */

import { Orientation } from '../geometry/orientation';
import { AbstractScene } from '../scenes/AbstractScene';
import { SCENES } from '../constants/scenes';
import { GameManager } from '../scenes/GameManager';
import { CharacterState } from '../constants/character-states';
import { BaseEntityAnimation } from '../behaviors/animation/BaseEntityAnimation';

/**
 * Character animation configuration for each orientation
 */
export type CharacterAnimation = {
  [K in Orientation]: {
    flip: boolean;
    anim: string;
  };
};

/**
 * Abstract base class for all characters in the game.
 * Provides common functionality for physics, animations, and scene integration.
 * 
 * @abstract
 * @class Character
 * @extends {Phaser.Physics.Arcade.Sprite}
 */
export abstract class Character extends Phaser.Physics.Arcade.Sprite {
  /** Delay between hits in milliseconds */
  protected static readonly HIT_DELAY: number = 500;
  
  /** Reference to the scene the character belongs to */
  protected scene: AbstractScene;
  /** Reference to the UI scene for game management */
  protected uiScene: GameManager;
  /** Character's health points */
  protected _hp: number = 1;
  /** Maximum health points */
  protected _maxHp: number = 1;
  /** Timestamp of the last hit taken */
  protected lastTimeHit: number = 0;
  /** Current orientation of the character */
  protected orientation: Orientation = Orientation.Down;
  /** Movement speed of the character */
  protected moveSpeed: number = 80;
  /** Whether the character is performing an action */
  protected isPerformingAction: boolean = false;
  /** Current action state of the character */
  protected actionState: CharacterState = CharacterState.IDLE;
  /** Animation behavior component */
  protected animationBehavior: BaseEntityAnimation;

  /**
   * Creates an instance of Character.
   * 
   * @param {AbstractScene} scene - The scene the character belongs to
   * @param {number} x - Initial x position
   * @param {number} y - Initial y position
   * @param {string} sprite - The sprite key to use for the character
   */
  constructor(scene: AbstractScene, x: number, y: number, sprite: string) {
    super(scene, x, y, sprite, 0);
    this.scene = scene;
    this.scene.physics.add.existing(this);
    this.scene.add.existing(this);

    const uiScene = this.scene.scene.get(SCENES.GAME_MANAGER) as GameManager;
    this.uiScene = uiScene;
    
    this.lastTimeHit = new Date().getTime();
    
    this.setCollideWorldBounds(true);
    this.setOrigin(0.5, 0.7);
  }

  /**
   * Sets the animation behavior component for this character
   * @param animationBehavior The animation behavior to use
   */
  public setAnimationBehavior(animationBehavior: BaseEntityAnimation): void {
    this.animationBehavior = animationBehavior;
    // Set up animations through the behavior
    this.animationBehavior.setupAnimations(this);
  }

  /**
   * Get character's health points using property accessor
   */
  public get hp(): number {
    return this._hp;
  }
  
  /**
   * Set character's health points using property accessor
   */
  public set hp(value: number) {
    this._hp = Math.min(value, this._maxHp);
    this.onHpChanged();
  }
  
  /**
   * Get character's maximum health points
   */
  public get maxHp(): number {
    return this._maxHp;
  }
  
  /**
   * Set character's maximum health points
   */
  public set maxHp(value: number) {
    this._maxHp = value;
  }
  
  /**
   * Called when HP changes
   * Override in subclasses for specific behavior (like UI updates)
   */
  protected onHpChanged(): void {
    // Base implementation - can be overridden
  }
  
  /**
   * Check if character can be hit (based on hit delay)
   * @param {number} hitDelay - Optional custom hit delay
   */
  public canGetHit(hitDelay: number = Character.HIT_DELAY): boolean {
    return new Date().getTime() - this.lastTimeHit > hitDelay;
  }
  
  /**
   * Apply damage to the character - Centralized damage handling
   * @param {number} damage - Amount of damage to apply
   */
  public loseHp(damage: number = 1): void {
    if (!this.canGetHit()) {
      return;
    }
    
    this._hp -= damage;
    this.lastTimeHit = new Date().getTime();
    
    this.onHpChanged();
    
    // Play hit animation if animation behavior is set
    if (this.animationBehavior) {
      this.animationBehavior.playHit(this, this.orientation, Character.HIT_DELAY);
    }
    
    if (this._hp <= 0) {
      this.onDeath();
    }
  }
  
  /**
   * Handle character death - Centralized death handling
   * Override in subclasses for specific death behavior
   */
  protected onDeath(): void {
    // Set character to inactive first
    this.setActive(false);
    
    // Play death animation through animation behavior if available
    // The animation behavior handles all visual effects for death
    if (this.animationBehavior) {
      this.animationBehavior.playDeath(this);
    }
    
    // Add a delay before final destruction to allow animations to complete
    const scene = this.getScene();
    if (scene && scene.time) {
      scene.time.delayedCall(1000, () => {
        this.destroy();
      }, [], this);
    } else {
      // Fallback if we can't use the scene timer
      setTimeout(() => this.destroy(), 1000);
    }
  }
  
  /**
   * Move the character in a specific direction
   * @param {Orientation} direction - The direction to move
   * @param {number} speed - Optional custom speed
   * @param {boolean} shouldAnimate - Whether to play the move animation
   */
  public moveInDirection(direction: Orientation, speed?: number, shouldAnimate: boolean = true): void {
    const moveSpeed = speed || this.moveSpeed;
    this.orientation = direction;
    
    // Reset velocity
    this.setVelocity(0, 0);
    
    switch (direction) {
      case Orientation.Left:
        this.setVelocityX(-moveSpeed);
        break;
      case Orientation.Right:
        this.setVelocityX(moveSpeed);
        break;
      case Orientation.Up:
        this.setVelocityY(-moveSpeed);
        break;
      case Orientation.Down:
        this.setVelocityY(moveSpeed);
        break;
    }
    
    if (shouldAnimate && !this.isPerformingAction && this.animationBehavior) {
      this.animationBehavior.playMove(this, this.orientation);
    }
  }
  
  /**
   * Stop character movement and set to idle animation
   */
  public stop(): void {
    this.setVelocity(0, 0);
    
    if (!this.isPerformingAction && this.animationBehavior) {
      this.animationBehavior.playIdle(this, this.orientation);
    }
  }
  
  /**
   * Get the current orientation
   */
  public getOrientation(): Orientation {
    return this.orientation;
  }
  
  /**
   * Set the character's orientation
   */
  public setOrientation(orientation: Orientation): void {
    this.orientation = orientation;
  }

  /**
   * Set character to idle state with appropriate animation
   */
  public setToIdle(): void {
    if (!this.isPerformingAction && this.animationBehavior) {
      this.animationBehavior.playIdle(this, this.orientation);
    }
  }
  
  /**
   * Checks if character is in a specific action state
   * @param state The state to check against
   */
  public isActionState(state: CharacterState): boolean {
    return this.actionState === state;
  }
  
  /**
   * Update method to be called in the game loop
   * Subclasses should override this
   */
  public update(): void {
    // Base implementation - to be overridden
  }

  /**
   * Get the character's scene
   * This provides access to the protected scene property for behavior components
   */
  public getScene(): Phaser.Scene {
    return this.scene;
  }

  /**
   * Get the character's animation behavior
   * This provides access to the protected animationBehavior property for behavior components
   */
  public getAnimationBehavior(): BaseEntityAnimation {
    return this.animationBehavior;
  }
}
