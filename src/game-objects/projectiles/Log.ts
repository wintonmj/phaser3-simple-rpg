/**
 * @fileoverview Log projectile class for the Treant's attack.
 */

import { Projectile } from './Projectile';
import { ASSETS } from '../../constants/assets';
import { AbstractScene } from '../../scenes/AbstractScene';

/**
 * Log projectile class for the Treant's attack.
 * Represents a log that appears instantly at the target location.
 * 
 * @class Log
 * @extends {Projectile}
 */
export class Log extends Projectile {
    /**
     * Creates an instance of Log.
     * 
     * @param {AbstractScene} scene - The scene the log belongs to
     * @param {number} x - Initial x position
     * @param {number} y - Initial y position
     */
    constructor(scene: AbstractScene, x: number, y: number) {
        super(scene, x, y, ASSETS.IMAGES.TREANT_ATTACK);
        this.speed = 0; // Log doesn't move
        this.damage = 1;
        this.lifetime = 200;
        this.initialize();
        this.update(); // Start the lifetime timer
    }

    /**
     * Initialize the log's properties and behavior.
     */
    protected initialize(): void {
        // Add collision with player
        this.scene.physics.add.collider(this, this.scene.player, () => {
            if (this.scene.player.canGetHit()) {
                this.scene.player.loseHp(this.damage);
                this.destroy();
            }
        });
    }
} 