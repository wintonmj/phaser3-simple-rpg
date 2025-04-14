/**
 * @fileoverview Base class for all projectiles in the game.
 * Provides common functionality for physics, lifetime, and damage.
 */

import { AbstractScene } from '../../scenes/AbstractScene';

/**
 * Base class for all projectiles in the game.
 * Provides common functionality for physics, lifetime, and damage.
 * 
 * @abstract
 * @class Projectile
 * @extends {Phaser.Physics.Arcade.Sprite}
 */
export abstract class Projectile extends Phaser.Physics.Arcade.Sprite {
    /** Reference to the scene the projectile belongs to */
    protected scene: AbstractScene;
    /** Speed at which the projectile travels */
    protected speed: number;
    /** Amount of damage the projectile deals */
    protected damage: number;
    /** How long the projectile exists before being destroyed (in ms) */
    protected lifetime: number;

    /**
     * Creates an instance of Projectile.
     * 
     * @param {AbstractScene} scene - The scene the projectile belongs to
     * @param {number} x - Initial x position
     * @param {number} y - Initial y position
     * @param {string} texture - The texture key to use for the projectile
     */
    constructor(scene: AbstractScene, x: number, y: number, texture: string) {
        super(scene, x, y, texture);
        this.scene = scene;
        this.scene.physics.add.existing(this);
        this.scene.add.existing(this);
    }

    /**
     * Initialize the projectile's properties and behavior.
     * Must be implemented by child classes.
     */
    protected abstract initialize(): void;

    /**
     * Update the projectile's state.
     * Handles lifetime and cleanup.
     */
    public update(): void {
        if (this.lifetime) {
            this.scene.time.addEvent({
                delay: this.lifetime,
                callback: () => this.destroy(),
                callbackScope: this
            });
        }
    }
} 