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

    const uiScene: any = this.scene.scene.get(SCENES.GAME_MANAGER);
    this.uiScene = uiScene;
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
}
