/**
 * @fileoverview Base manager class that all specialized managers will extend
 */

import { ISpatialManager, IObjectPoolManager } from '../types/manager-interfaces';

/**
 * Base manager class with common functionality for all managers
 */
export abstract class BaseManager {
  /** Reference to the scene this manager belongs to */
  protected scene: Phaser.Scene;
  
  /** Shared references to other managers (using interfaces to avoid circular dependencies) */
  protected spatialManager?: ISpatialManager;
  protected objectPoolManager?: IObjectPoolManager;

  /**
   * Create a new manager
   * @param scene - The scene this manager belongs to
   */
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Set reference to spatial manager
   * @param spatialManager - The spatial manager instance
   */
  public setSpatialManager(spatialManager: ISpatialManager): void {
    this.spatialManager = spatialManager;
  }

  /**
   * Get the spatial manager
   */
  public getSpatialManager(): ISpatialManager | undefined {
    return this.spatialManager;
  }

  /**
   * Set reference to object pool manager
   * @param objectPoolManager - The object pool manager instance
   */
  public setObjectPoolManager(objectPoolManager: IObjectPoolManager): void {
    this.objectPoolManager = objectPoolManager;
  }

  /**
   * Get the object pool manager
   */
  public getObjectPoolManager(): IObjectPoolManager | undefined {
    return this.objectPoolManager;
  }

  /**
   * Initialize the manager
   * Must be implemented by derived classes
   */
  abstract initialize(...args: unknown[]): void;

  /**
   * Clean up when the scene is shutdown
   * Must be implemented by derived classes
   */
  abstract shutdown(): void;
} 