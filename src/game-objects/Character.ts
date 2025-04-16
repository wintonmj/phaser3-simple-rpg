/**
 * @fileoverview Base Character class that provides common functionality for all characters in the game.
 * This class handles physics, animations, and scene integration.
 */

import { Orientation } from '../geometry/orientation';
import { AbstractScene } from '../scenes/AbstractScene';
import { SCENES } from '../constants/scenes';
import { GameManager } from '../scenes/GameManager';

/**
 * Type definition for character animations in different orientations
 * @typedef {Object} CharacterAnimation
 */
export type CharacterAnimation = {
  [K in Orientation]: {
    flip: boolean;
    anim: string;
  };
};

/**
 * Character states for animation and behavior
 */
export enum CharacterState {
  // Base states
  IDLE = 'idle',
  MOVE = 'move',
  DEATH = 'death',
  
  // Combat states
  ATTACK = 'attack',
  HIT = 'hit',
  
  // Weapon states
  RELOADING = 'reloading',
  SHOOTING = 'shooting',
  PUNCHING = 'punching'
}

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
  /** Animation sets for different character states */
  protected animationSets: Record<string, CharacterAnimation> = null;
  /** Current action state of the character */
  protected actionState: CharacterState = CharacterState.IDLE;

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
   * Sets up animation sets for different character states
   * @param animSets Record of animation sets for different states
   */
  protected setupAnimations(animSets: Record<string, CharacterAnimation>): void {
    this.animationSets = animSets;
  }

  /**
   * Plays the appropriate animation based on character state and orientation
   * Maintains backward compatibility with subclasses
   * 
   * @param {string | CharacterState} state - The character state
   * @param {Orientation} [orientation] - Optional orientation override
   */
  protected playAnimation(state: string | CharacterState, orientation?: Orientation): void {
    if (!this.animationSets || !this.animationSets[state]) {
      return;
    }
    
    const useOrientation = orientation || this.orientation;
    this.animate(this.animationSets[state], useOrientation);
  }

  /**
   * Plays the appropriate animation based on the character's orientation
   * 
   * @param {CharacterAnimation} animationKeys - Animation configuration for different orientations
   * @param {Orientation} orientation - Current orientation of the character
   */
  protected animate(animationKeys: CharacterAnimation, orientation: Orientation) {
    const { flip, anim } = animationKeys[orientation];
    this.setFlipX(flip);
    this.play(anim, true);
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
   * Apply damage to the character
   * @param {number} damage - Amount of damage to apply
   */
  public loseHp(damage: number = 1): void {
    if (!this.canGetHit()) {
      return;
    }
    
    this._hp -= damage;
    this.lastTimeHit = new Date().getTime();
    
    this.onHpChanged();
    
    if (this._hp <= 0) {
      this.onDeath();
    }
  }
  
  /**
   * Handle character death
   * Override in subclasses for specific death behavior
   */
  protected onDeath(): void {
    // Base implementation - can be overridden
    this.destroy();
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
    
    if (shouldAnimate && !this.isPerformingAction && this.animationSets) {
      this.playAnimation(CharacterState.MOVE);
    }
  }
  
  /**
   * Stop character movement and set to idle animation
   */
  public stop(): void {
    this.setVelocity(0, 0);
    
    if (!this.isPerformingAction && this.animationSets) {
      this.playAnimation(CharacterState.IDLE);
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
    if (!this.isPerformingAction && this.animationSets) {
      this.playAnimation(CharacterState.IDLE);
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
}
