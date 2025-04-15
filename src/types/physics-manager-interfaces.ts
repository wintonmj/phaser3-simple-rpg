/**
 * @fileoverview Extended interfaces for physics management with new entity hierarchy
 */

import { MapLayers } from './scene-types';
import { Player } from '../game-objects/Player';
import { IFriendlyEntity, IHostileEntity } from './entities/entity-interfaces';

/**
 * Extended interface for physics and collision management with new entity hierarchy
 * This is a transitional interface that will eventually replace IPhysicsManager
 */
export interface IExtendedPhysicsManager {
  /**
   * Initialize physics settings
   * @param mapWidth - Width of the map in pixels
   * @param mapHeight - Height of the map in pixels
   */
  initialize(mapWidth: number, mapHeight: number): void;

  /**
   * Add collision handlers between objects and layers
   * @param player - The player object
   * @param layers - Map layers with collision
   * @param friendlyEntities - Friendly entities (NPCs)
   * @param hostileEntities - Hostile entities (monsters)
   */
  setupColliders(
    player: Player,
    layers: MapLayers,
    friendlyEntities: IFriendlyEntity[],
    hostileEntities: IHostileEntity[]
  ): void;

  /**
   * Queue a physics operation for batch processing
   * @param operation - Function representing a physics operation
   */
  queuePhysicsOperation(operation: () => void): void;

  /**
   * Process all queued physics operations
   */
  processBatchedPhysics(): void;

  /**
   * Create a physics group for game objects
   * @param objects - Objects to include in the group
   */
  createGroup(objects: Phaser.GameObjects.GameObject[]): Phaser.Physics.Arcade.Group;

  /**
   * Clean up physics resources
   */
  shutdown(): void;
} 