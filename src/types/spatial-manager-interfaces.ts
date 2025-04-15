/**
 * @fileoverview Extended interfaces for spatial management with new entity hierarchy
 */

import { QuadTree } from '../utils/QuadTree';
import { INonPlayerEntity } from './entities/entity-interfaces';

/**
 * Extended interface for spatial management and entity culling with new entity hierarchy
 * This is a transitional interface that will eventually replace ISpatialManager
 */
export interface IExtendedSpatialManager {
  /**
   * Initialize the spatial manager
   * @param mapWidth - Width of the map in pixels
   * @param mapHeight - Height of the map in pixels
   */
  initialize(mapWidth: number, mapHeight: number): void;

  /**
   * Register non-player entities to be tracked in the spatial system
   * @param entities - Non-player entities to register
   */
  registerEntities(entities: INonPlayerEntity[]): void;

  /**
   * Update the spatial partitioning structure
   * @param cameraBounds - The current camera view bounds
   * @param playerPosition - The current player position
   */
  update(cameraBounds: Phaser.Geom.Rectangle, playerPosition: Phaser.Math.Vector2): void;

  /**
   * Get active entities within range of the player
   * @param range - Distance from player to consider entities active
   * @param entityType - Optional entity type filter (friendly, hostile, or both)
   */
  getActiveEntities(
    range: number, 
    entityType?: 'friendly' | 'hostile'
  ): Set<INonPlayerEntity>;

  /**
   * Get the quadtree data structure
   */
  getQuadTree(): QuadTree;

  /**
   * Clear spatial data when shutting down
   */
  shutdown(): void;
} 