/**
 * @fileoverview Heads-Up Display (HUD) scene that shows player health and other UI elements.
 * Manages the display of hearts representing player health.
 */

import { Player } from '../game-objects/Player';
import { ASSETS } from '../constants/assets';
import { SCENES } from '../constants/scenes';
import { EVENTS } from '../constants/events';
import { GameManager } from './GameManager';

/** Distance between heart sprites in the HUD */
const DISTANCE_BETWEEN_HEARTS = 15;

/**
 * Heads-Up Display (HUD) scene that shows player health and other UI elements.
 * Manages the display of hearts representing player health.
 * 
 * @class HUD
 * @extends {Phaser.Scene}
 */
export class HUD extends Phaser.Scene {
  /** Array of heart sprites representing player health */
  private hearts: Phaser.GameObjects.Sprite[];
  /** Reference to the game manager scene */
  private gameManager: GameManager;

  /**
   * Creates an instance of HUD.
   * Initializes the scene with the appropriate scene key.
   */
  constructor() {
    super(SCENES.HUD);

    this.hearts = [];
  }

  /**
   * Creates the HUD scene and initializes hearts.
   * Sets up event listeners for health updates.
   */
  protected create() {
    const gameManager: any = this.scene.get(SCENES.GAME_MANAGER);
    this.gameManager = gameManager;

    this.gameManager.events.on(EVENTS.UPDATE_HP, () => {
      this.updateHearts();
    });

    this.initHearts();
  }

  /**
   * Initializes the heart sprites in the HUD.
   * Creates empty hearts for maximum health and filled hearts for current health.
   */
  private initHearts() {
    Array(Player.MAX_HP)
      .fill(0)
      .map((_, i) => {
        return this.add
          .sprite(
            (i + 1) * DISTANCE_BETWEEN_HEARTS,
            DISTANCE_BETWEEN_HEARTS,
            ASSETS.IMAGES.HEART_EMPTY,
          )
          .setScrollFactor(0)
          .setDepth(50);
      });

    this.hearts = Array(this.gameManager.playerHp)
      .fill(0)
      .map((_, i) => {
        return this.add
          .sprite((i + 1) * DISTANCE_BETWEEN_HEARTS, DISTANCE_BETWEEN_HEARTS, ASSETS.IMAGES.HEART)
          .setScrollFactor(0)
          .setDepth(100);
      });
  }

  private updateHearts() {
    this.hearts.map((heart, index) => {
      if (index >= this.gameManager.playerHp) {
        heart.setAlpha(0);
      }
    });
  }
}
