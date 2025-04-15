/**
 * @fileoverview Manager for object pools of reusable game objects
 */

import { IObjectPoolManager } from '../types/manager-interfaces';
import { BaseManager } from './BaseManager';

/** Object pool sizes */
const POOL_SIZES = {
  PARTICLES: 50,
  PROJECTILES: 20,
};

/**
 * Manages object pools for reusable game objects like particles and projectiles
 */
export class ObjectPoolManager extends BaseManager implements IObjectPoolManager {
  private objectPools: Record<string, Phaser.GameObjects.Group> = {};

  /**
   * Create a new ObjectPoolManager
   * @param scene - The scene this manager belongs to
   */
  constructor(scene: Phaser.Scene) {
    super(scene);
    this.initialize();
  }

  /**
   * Initialize object pools
   */
  public initialize(): void {
    this.createObjectPools();
  }

  /**
   * Create object pools for reusable game objects
   */
  private createObjectPools(): void {
    // Create pools with specific recycling behavior
    this.objectPools.particles = this.scene.add.group({
      maxSize: POOL_SIZES.PARTICLES,
      active: false,
      createCallback: (particle) => {
        this.scene.physics.world.enable(particle);
        if (particle.body) {
          (particle.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
        }
      },
      removeCallback: (particle) => {
        // Reset particle state when removed from active use
        particle.setActive(false);
        if (particle instanceof Phaser.GameObjects.Sprite) {
          particle.setVisible(false);
        }
        if (particle.body) {
          (particle.body as Phaser.Physics.Arcade.Body).reset(0, 0);
        }
      }
    });
    
    this.objectPools.projectiles = this.scene.add.group({
      maxSize: POOL_SIZES.PROJECTILES,
      active: false,
      createCallback: (projectile) => {
        this.scene.physics.world.enable(projectile);
      },
      removeCallback: (projectile) => {
        // Reset projectile state when removed from active use
        projectile.setActive(false);
        if (projectile instanceof Phaser.GameObjects.Sprite) {
          projectile.setVisible(false);
        }
        if (projectile.body) {
          (projectile.body as Phaser.Physics.Arcade.Body).reset(0, 0);
        }
      }
    });
  }

  /**
   * Get an object pool by name
   * @param poolName - The name of the object pool
   */
  public getObjectPool(poolName: string): Phaser.GameObjects.Group | undefined {
    return this.objectPools[poolName];
  }

  /**
   * Clean up object pools when scene is shutdown
   */
  public shutdown(): void {
    // Clear and destroy all pools
    Object.values(this.objectPools).forEach(pool => {
      pool.clear(true, true);
    });
    
    this.objectPools = {};
  }
} 