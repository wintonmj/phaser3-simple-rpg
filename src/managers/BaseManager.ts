/**
 * @fileoverview Base manager class that all specialized managers will extend
 */

/**
 * Base manager class with common functionality for all managers
 */
export abstract class BaseManager {
  /** Reference to the scene this manager belongs to */
  protected scene: Phaser.Scene;

  /**
   * Create a new manager
   * @param scene - The scene this manager belongs to
   */
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
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