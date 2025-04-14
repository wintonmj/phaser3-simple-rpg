/**
 * @fileoverview Main entry point for the Phaser 3 Simple RPG game.
 * This file initializes the game with the appropriate configuration and scenes.
 */

import 'phaser';
import { FirstLevel } from './scenes/levels/FirstLevel';
import { SecondLevel } from './scenes/levels/SecondLevel';
import { Preloader } from './scenes/Preloader';
import { GameManager } from './scenes/GameManager';
import { HUD } from './scenes/HUD';

/**
 * Main game class that extends Phaser.Game.
 * Configures and initializes the game with all necessary scenes.
 * 
 * @class PhaserGame
 * @extends {Phaser.Game}
 */
class PhaserGame extends Phaser.Game {
  /**
   * Creates an instance of PhaserGame.
   * Sets up the game configuration including physics, scenes, and display settings.
   * 
   * @constructor
   */
  constructor() {
    const config = {
      type: Phaser.AUTO,
      parent: 'game-container',
      width: 400,
      height: 250,
      zoom: 2.5,
      pixelArt: true,
      physics: {
        default: 'arcade',
        // arcade: {
        //   debug: true,
        // },
      },
      scene: [Preloader, FirstLevel, SecondLevel, GameManager, HUD],
    };
    super(config);
  }
}

// tslint:disable-next-line
new PhaserGame();
