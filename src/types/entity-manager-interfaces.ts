/**
 * @fileoverview Extended interfaces for entity management with new entity hierarchy
 */

import { InterSceneData } from './scene-types';
import { Player } from '../game-objects/Player';
import { NonPlayerEntity } from '../game-objects/entities/NonPlayerEntity';
import { INonPlayerEntity } from './entities/entity-interfaces';

/**
 * Extended interface for entity management with new entity hierarchy
 * This is a transitional interface that will eventually replace IEntityManager
 */
export interface IExtendedEntityManager {
  /**
   * Initialize entity creation
   * @param map - The tilemap containing entity data
   * @param sceneData - Data from previous scene if any
   */
  initialize(map: Phaser.Tilemaps.Tilemap, sceneData: InterSceneData): void;

  /**
   * Create the player at the appropriate position
   * @param sceneData - Data from the previous scene
   */
  createPlayer(sceneData: InterSceneData): Player;

  /**
   * Create all non-player entities (both friendly and hostile)
   */
  createNonPlayerEntities(): void;

  /**
   * Create friendly entities (NPCs) from map data
   */
  createFriendlyEntities(): void;

  /**
   * Create hostile entities (monsters) from map data
   */
  createHostileEntities(): void;

  /**
   * Create object pools for reusable game objects
   * @deprecated This method is deprecated. Object pools are now managed by ObjectPoolManager
   */
  createObjectPools(): void;

  /**
   * Get the player instance
   */
  getPlayer(): Player;

  /**
   * Get all friendly entities (NPCs) in the scene
   */
  getFriendlyEntities(): INonPlayerEntity[];

  /**
   * Get all hostile entities (monsters) in the scene
   */
  getHostileEntities(): INonPlayerEntity[];

  /**
   * Get all monsters in the scene (backwards compatibility)
   */
  getMonsters(): NonPlayerEntity[];

  /**
   * Get an object pool by name
   * @param poolName - The name of the object pool
   */
  getObjectPool(poolName: string): Phaser.GameObjects.Group | undefined;

  /**
   * Update entity states
   */
  update(): void;

  /**
   * Clean up entities when scene is shutdown
   */
  shutdown(): void;
} 