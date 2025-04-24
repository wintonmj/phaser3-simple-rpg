/**
 * @fileoverview Player character class that extends the base Character class.
 * Handles player movement, combat, and animations.
 */

import { Character } from './Character';
import { AbstractScene } from '../scenes/AbstractScene';
import { ASSETS } from '../constants/assets';
import { IInputBehavior } from '../behaviors/interfaces';
import { GOKU_ANIMATIONS } from '../constants/animation-configs';
import { BaseEntityAnimation } from '../behaviors/animation/BaseEntityAnimation';
import { WeaponFactory } from './weapons/WeaponFactory';
import { WeaponType } from '../constants/weapon-types';
import { ENTITIES } from '../constants/entities';
import { getDimensionsForEntity } from '../constants/entity-animations';

/**
 * Player character class that extends the base Character class.
 * Handles player movement, combat, and animations.
 * 
 * @class Player
 * @extends {Character}
 */
export class Player extends Character {
  /** Maximum health points for the player */
  public static readonly MAX_HP = 10;

  /** Tomb sprite shown when player dies */
  private tomb: Phaser.GameObjects.Sprite = null;
  /** Input behavior to handle player controls */
  private inputBehavior: IInputBehavior;

  /**
   * Creates an instance of Player.
   * 
   * @param {AbstractScene} scene - The scene the player belongs to
   * @param {number} x - Initial x position
   * @param {number} y - Initial y position
   */
  constructor(scene: AbstractScene, x: number, y: number) {
    super(scene, x, y, ASSETS.IMAGES.PLAYER_IDLE_DOWN);

    // Set up player-specific properties
    this._maxHp = Player.MAX_HP;
    this.hp = this._maxHp;
    this.setSize(10, 10);
    this.setDepth(10);
    this.moveSpeed = 120;

    // Apply scaling from entity dimensions if defined
    const dimensions = getDimensionsForEntity(ENTITIES.PLAYER);
    if (dimensions.scale !== undefined) {
      this.setScale(dimensions.scale);
    }

    // Set flag to indicate we're using Goku animations for texture filtering optimization
    this.setData('usingGokuAnimations', true);

    // Set up animation behavior using Goku animations
    const animationBehavior = new BaseEntityAnimation(GOKU_ANIMATIONS);
    this.setAnimationBehavior(animationBehavior);
    
    // Equip a default weapon (bow)
    WeaponFactory.equipCharacterWithWeapon(this, WeaponType.RANGED);
  }

  /**
   * Sets the input behavior component for the player
   * @param inputBehavior The input behavior to use
   */
  public setInputBehavior(inputBehavior: IInputBehavior): void {
    this.inputBehavior = inputBehavior;
  }

  /**
   * Main update method called by the game loop.
   * @override
   */
  public override update(): void {
    super.update();
    
    // Process input via the input behavior if available
    if (this.inputBehavior) {
      this.inputBehavior.update(this);
    }
  }

  /**
   * Called when HP changes to update UI
   * @override
   */
  protected override onHpChanged(): void {
    if (this.uiScene) {
      this.uiScene.playerHp = this.hp;
    }
  }

  /**
   * Handle player death
   * @override
   */
  protected override onDeath(): void {
    // Player dies
    if (!this.tomb) {
      this.tomb = this.scene.add.sprite(this.x, this.y, ASSETS.IMAGES.TOMB).setScale(0.1);
    }
    this.destroy();
  }
}
