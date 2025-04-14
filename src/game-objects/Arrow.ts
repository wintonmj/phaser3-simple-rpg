/**
 * @fileoverview Arrow projectile class that can be shot by the player.
 * Handles arrow movement, rotation, and physics.
 */

import { Orientation } from '../geometry/orientation';
import { Player } from './Player';
import { ASSETS } from '../constants/assets';

/** Speed at which arrows travel */
const ARROW_SPEED = 150;

/**
 * Arrow projectile class that can be shot by the player.
 * Handles arrow movement, rotation, and physics.
 * 
 * @class Arrow
 * @extends {Phaser.Physics.Arcade.Sprite}
 */
export class Arrow extends Phaser.Physics.Arcade.Sprite {
  /** Reference to the scene the arrow belongs to */
  public scene: Phaser.Scene;

  /**
   * Creates an instance of Arrow.
   * 
   * @param {Phaser.Scene} scene - The scene the arrow belongs to
   * @param {Player} player - The player who shot the arrow
   * @param {Orientation} direction - The direction the arrow should travel
   */
  constructor(scene: Phaser.Scene, player: Player, direction: Orientation) {
    super(scene, player.x, player.y, ASSETS.IMAGES.ARROW);
    this.scene = scene;

    this.scene.physics.add.existing(this);
    this.scene.add.existing(this);

    this.setDepth(1000);

    switch (direction) {
      case Orientation.Up:
        this.setVelocityY(-ARROW_SPEED);
        break;
      case Orientation.Down:
        this.setVelocityY(ARROW_SPEED);
        this.setRotation(Math.PI);
        break;
      case Orientation.Left:
        this.setVelocityX(-ARROW_SPEED);
        this.setRotation(-Math.PI / 2);
        break;
      case Orientation.Right:
        this.setVelocityX(ARROW_SPEED);
        this.setRotation(Math.PI / 2);
        break;
      default:
        break;
    }
  }
}
