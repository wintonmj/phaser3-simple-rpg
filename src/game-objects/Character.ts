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
import { Weapon } from './weapons/Weapon';
import { AttackContext } from '../types/AttackContext';

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
 * Type for tracking cooldowns of different actions
 */
export type CooldownTracker = {
  [key: string]: number;
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
  /** Default delay between hits in milliseconds */
  protected static readonly DEFAULT_HIT_DELAY: number = 500;
  
  /** Reference to the scene the character belongs to */
  protected scene: AbstractScene;
  /** Reference to the UI scene for game management */
  protected uiScene: GameManager;
  /** Character's health points */
  protected _hp: number = 1;
  /** Maximum health points */
  protected _maxHp: number = 1;
  /** Cooldown tracking for various actions */
  protected cooldowns: CooldownTracker = {};
  /** Current orientation of the character */
  protected orientation: Orientation = Orientation.Down;
  /** Movement speed of the character */
  protected moveSpeed: number = 80;
  /** Current action state of the character */
  protected actionState: CharacterState = CharacterState.IDLE;
  /** Animation behavior component */
  protected animationBehavior: BaseEntityAnimation;
  /** Currently equipped weapon */
  protected equippedWeapon: Weapon | null = null;

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
    
    // Initialize cooldown trackers with current time
    this.resetAllCooldowns();
    
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
   * Reset all cooldowns to current time
   */
  protected resetAllCooldowns(): void {
    const now = Date.now();
    this.cooldowns = {
      hit: now,
      attack: now,
      ability: now,
      // Can be expanded with other action types
    };
  }
  
  /**
   * Start cooldown for a specific action
   * @param actionType The type of action to set cooldown for
   */
  public startCooldown(actionType: string): void {
    this.cooldowns[actionType] = Date.now();
  }
  
  /**
   * Check if an action is off cooldown
   * @param actionType The type of action to check
   * @param cooldownTime The cooldown duration in milliseconds
   * @returns Whether the action is off cooldown and can be performed
   */
  public isOffCooldown(actionType: string, cooldownTime: number): boolean {
    if (!this.cooldowns[actionType]) {
      this.cooldowns[actionType] = 0;
    }
    return Date.now() - this.cooldowns[actionType] >= cooldownTime;
  }
  
  /**
   * Check if character can be hit (based on hit delay)
   * @param {number} hitDelay - Optional custom hit delay
   */
  public canGetHit(hitDelay: number = Character.DEFAULT_HIT_DELAY): boolean {
    return this.isOffCooldown('hit', hitDelay);
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
    this.startCooldown('hit');
    
    this.onHpChanged();
    
    // Change state to HIT and play appropriate animation
    this.setState(CharacterState.HIT);
    
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
    
    // Change state to DEATH
    this.setState(CharacterState.DEATH);
    
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
    
    // Set state to MOVE if not in a higher priority state
    if (shouldAnimate && this.canChangeToState(CharacterState.MOVE)) {
      this.setState(CharacterState.MOVE);
    }
  }
  
  /**
   * Stop character movement and set to idle animation
   */
  public stop(): void {
    this.setVelocity(0, 0);
    
    // Only change to IDLE if in MOVE state
    if (this.actionState === CharacterState.MOVE) {
      this.setState(CharacterState.IDLE);
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
    if (this.canChangeToState(CharacterState.IDLE)) {
      this.setState(CharacterState.IDLE);
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
    // Weapon position is now handled by BaseEntityAnimation
    // No need to update it here
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
  
  /**
   * Get the current action state
   */
  public getState(): CharacterState {
    return this.actionState;
  }
  
  /**
   * Set the character's state and play appropriate animation
   * @param state The state to transition to
   */
  public setState(state: CharacterState): void {
    // Only change state if allowed to
    if (!this.canChangeToState(state)) {
      return;
    }

    // Play the appropriate animation if behavior exists
    if (this.animationBehavior) {
      this.animationBehavior.playAnimation(this, state, this.orientation);
    }

    if(this.actionState !== state) {
      console.log(`[Character] State change: ${this.actionState} → ${state}`);
    }
    
    // Update the state
    this.actionState = state;
  }
  
  /**
   * Check if character can change to a specific state
   * @param state The state to check transition to
   * @returns Whether the state transition is allowed
   */
  protected canChangeToState(state: CharacterState): boolean {
    // Default state transition rules:
    // - DEATH state can't transition to any other state
    if (this.actionState === CharacterState.DEATH) {
      return false;
    }
    
    // - HIT state can only transition to DEATH or back to IDLE after delay
    if (this.actionState === CharacterState.HIT && 
        state !== CharacterState.DEATH && 
        !this.isOffCooldown('hit', Character.DEFAULT_HIT_DELAY)) {
      return false;
    }
    
    // - Combat states (ATTACK, SHOOTING, PUNCHING) have priority over movement states
    // BUT movement can interrupt SHOOTING and PUNCHING (but not ATTACK) 
    if (this.actionState === CharacterState.ATTACK && 
        (state === CharacterState.MOVE || state === CharacterState.IDLE)) {
      return false;
    }
    
    return true;
  }

  /**
   * Equip a weapon for this character
   * @param weapon The weapon to equip
   */
  public equipWeapon(weapon: Weapon): void {
    // Clean up previous weapon sprite if one exists
    if (this.equippedWeapon) {
      this.equippedWeapon.destroySprite();
    }
    
    this.equippedWeapon = weapon;
  }
  
  /**
   * Get the currently equipped weapon
   * @returns The currently equipped weapon or null if none
   */
  public getEquippedWeapon(): Weapon | null {
    return this.equippedWeapon;
  }

  /**
   * Character performs an attack using equipped weapon
   * @param target Optional specific target for the attack
   */
  public performAttack(target?: Character): void {
    // If no weapon is equipped or attack is on cooldown, do nothing
    if (!this.equippedWeapon || !this.isOffCooldown('attack', this.equippedWeapon.getAttackCooldown())) {
      return;
    }
    
    // Set state based on weapon type
    this.setState(this.equippedWeapon.getAttackState());
    console.log(`[Character] Performing attack with state: ${this.actionState}`);
    
    // Create attack context with all necessary information
    const attackContext: AttackContext = {
      source: this,
      direction: this.orientation,
      scene: this.scene,
      target: target
    };
    
    // Execute attack with context
    this.equippedWeapon.attack(attackContext);
    
    // Start cooldown
    this.startCooldown('attack');
  }

  /**
   * Force reset animation state to IDLE
   * Only use in emergency situations where animations are stuck
   */
  public forceResetToIdle(): void {
    console.log(`[Character] EMERGENCY: Force resetting from ${this.actionState} to IDLE`);
    this.actionState = CharacterState.IDLE;
    
    // Clear any animation flags
    this.setData('animationPlaying', false);
    
    // Play idle animation directly
    if (this.animationBehavior) {
      this.animationBehavior.playAnimation(this, CharacterState.IDLE, this.orientation);
    }
  }
}
