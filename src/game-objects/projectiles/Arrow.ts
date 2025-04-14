/**
 * @fileoverview Arrow projectile class that can be shot by the player.
 */

import { Projectile } from './Projectile';
import { Orientation } from '../../geometry/orientation';
import { ASSETS } from '../../constants/assets';
import { AbstractScene } from '../../scenes/AbstractScene';

/**
 * Arrow projectile class that can be shot by the player.
 * Handles arrow movement, rotation, and physics.
 * 
 * @class Arrow
 * @extends {Projectile}
 */
export class Arrow extends Projectile {
    /** Direction the arrow is traveling */
    private direction: Orientation;

    /**
     * Creates an instance of Arrow.
     * 
     * @param {AbstractScene} scene - The scene the arrow belongs to
     * @param {number} x - Initial x position
     * @param {number} y - Initial y position
     * @param {Orientation} direction - The direction the arrow should travel
     */
    constructor(scene: AbstractScene, x: number, y: number, direction: Orientation) {
        super(scene, x, y, ASSETS.IMAGES.ARROW);
        this.direction = direction;
        this.speed = 150;
        this.damage = 1;
        this.lifetime = 2000; // Arrow will live for 2 seconds if it doesn't hit anything
        this.initialize();
        this.update(); // Start the lifetime timer
    }

    /**
     * Initialize the arrow's properties and behavior.
     */
    protected initialize(): void {
        switch (this.direction) {
            case Orientation.Up:
                this.setVelocityY(-this.speed);
                break;
            case Orientation.Down:
                this.setVelocityY(this.speed);
                this.setRotation(Math.PI);
                break;
            case Orientation.Left:
                this.setVelocityX(-this.speed);
                this.setRotation(-Math.PI / 2);
                break;
            case Orientation.Right:
                this.setVelocityX(this.speed);
                this.setRotation(Math.PI / 2);
                break;
        }
    }
} 