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
  IDLE = 'idle',
  MOVE = 'move',
  ATTACK = 'attack',
  HIT = 'hit',
  DEATH = 'death'
}

/** Delay between hits in milliseconds */
export const DEFAULT_HIT_DELAY = 500;

/**
 * Abstract base class for all characters in the game.
 * Provides common functionality for physics, animations, and scene integration.
 * 
 * @abstract
 * @class Character
 * @extends {Phaser.Physics.Arcade.Sprite}
 */
export abstract class Character extends Phaser.Physics.Arcade.Sprite {
  /** Reference to the scene the character belongs to */
  protected scene: AbstractScene;
  /** Reference to the UI scene for game management */
  protected uiScene: GameManager;
  /** Character's health points */
  protected _hp: number = 1;
  /** Timestamp of the last hit taken */
  protected lastTimeHit: number = 0;
  /** Current orientation of the character */
  protected orientation: Orientation = Orientation.Down;
  /** Movement speed of the character */
  protected moveSpeed: number = 80;

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
    this._hp = value;
  }
  
  /**
   * Check if character can be hit (based on hit delay)
   * @param {number} hitDelay - Optional custom hit delay
   */
  public canGetHit(hitDelay: number = DEFAULT_HIT_DELAY): boolean {
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
   */
  public moveInDirection(direction: Orientation, speed?: number): void {
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
  }
  
  /**
   * Stop character movement
   */
  public stop(): void {
    this.setVelocity(0, 0);
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
   * Update method to be called in the game loop
   * Subclasses should override this
   */
  public update(): void {
    // Base implementation - to be overridden
  }
}
