/**
 * @fileoverview Interfaces for scene manager components used to refactor AbstractScene
 */

import { Orientation } from '../geometry/orientation';
import { InterSceneData, MapLayers, KeyState } from './scene-types';
import { Player } from '../game-objects/Player';
import { NonPlayerEntity } from '../game-objects/entities/NonPlayerEntity';
import { QuadTree } from '../utils/QuadTree';

/**
 * Interface for map creation and management
 */
export interface IMapManager {
  /**
   * Initialize the map with layers
   * @param mapKey - The key for the map asset
   */
  initialize(mapKey: string): void;

  /**
   * Get the created tilemap
   */
  getMap(): Phaser.Tilemaps.Tilemap;

  /**
   * Get map layers
   */
  getLayers(): MapLayers;

  /**
   * Get spawn points for various entities from object layers
   * @param layerName - The name of the object layer
   */
  getObjectLayer(layerName: string): Phaser.Tilemaps.ObjectLayer | undefined;

  /**
   * Clean up resources when scene is shutdown
   */
  shutdown(): void;
}

/**
 * Interface for entity management (players, NPCs, monsters)
 */
export interface IEntityManager {
  /**
   * Initialize entity creation
   * @param map - The tilemap containing entity data
   * @param sceneData - Data from previous scene if any
   */
  initialize(map: Phaser.Tilemaps.Tilemap, sceneData: InterSceneData): void;

  /**
   * Create the player at the appropriate position
   * @param position - Starting position or null to use default
   * @param sceneData - Data from the previous scene
   */
  createPlayer(sceneData: InterSceneData): Player;

  /**
   * Create monsters from map data
   */
  createMonsters(): void;

  /**
   * Create object pools for reusable game objects
   */
  createObjectPools(): void;

  /**
   * Get the player instance
   */
  getPlayer(): Player;

  /**
   * Get all monsters in the scene
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

/**
 * Interface for spatial management and entity culling
 */
export interface ISpatialManager {
  /**
   * Initialize the spatial manager
   * @param mapWidth - Width of the map in pixels
   * @param mapHeight - Height of the map in pixels
   */
  initialize(mapWidth: number, mapHeight: number): void;

  /**
   * Register entities to be tracked in the spatial system
   * @param entities - Entities to register
   */
  registerEntities(entities: Phaser.GameObjects.GameObject[]): void;

  /**
   * Update the spatial partitioning structure
   * @param cameraBounds - The current camera view bounds
   * @param playerPosition - The current player position
   */
  update(cameraBounds: Phaser.Geom.Rectangle, playerPosition: Phaser.Math.Vector2): void;

  /**
   * Get active entities within range of the player
   * @param range - Distance from player to consider entities active
   */
  getActiveEntities(range: number): Set<Phaser.GameObjects.GameObject>;

  /**
   * Get the quadtree data structure
   */
  getQuadTree(): QuadTree;

  /**
   * Clear spatial data when shutting down
   */
  shutdown(): void;
}

/**
 * Interface for physics and collision management
 */
export interface IPhysicsManager {
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
   * @param monsters - Monster entities
   */
  setupColliders(
    player: Player,
    layers: MapLayers,
    monsters: NonPlayerEntity[]
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

/**
 * Interface for input handling
 */
export interface IInputManager {
  /**
   * Initialize input handlers
   */
  initialize(): void;

  /**
   * Set up keyboard shortcuts
   * @param scene - Reference to the current scene for scene switching
   */
  setupKeyboardShortcuts(scene: Phaser.Scene): void;

  /**
   * Get the current key state
   */
  getKeyState(): KeyState;

  /**
   * Update the key state based on current input
   */
  update(): void;

  /**
   * Get cursor key objects
   */
  getCursors(): CursorKeys;

  /**
   * Remove event listeners when shutting down
   */
  shutdown(): void;
}

/**
 * Interface for camera management
 */
export interface ICameraManager {
  /**
   * Initialize the camera
   * @param mapWidth - Width of the map in pixels
   * @param mapHeight - Height of the map in pixels
   * @param target - The object for the camera to follow
   */
  initialize(mapWidth: number, mapHeight: number, target: Phaser.GameObjects.GameObject): void;

  /**
   * Update camera position and bounds
   */
  update(): void;

  /**
   * Get current camera bounds
   */
  getCameraBounds(): Phaser.Geom.Rectangle;

  /**
   * Clean up camera resources
   */
  shutdown(): void;
}

/**
 * Interface for scene flow and transition management
 */
export interface ISceneFlowManager {
  /**
   * Initialize scene transition zones
   * @param map - The tilemap containing zone data
   * @param player - The player object for overlap detection
   */
  initialize(map: Phaser.Tilemaps.Tilemap, player: Player): void;

  /**
   * Set up scene transition zones from map data
   */
  setupTransitionZones(): void;

  /**
   * Get player's initial position based on where they came from
   * @param sceneData - Data from the previous scene
   */
  getPlayerInitialPosition(sceneData: InterSceneData): Phaser.Math.Vector2;

  /**
   * Calculate the position shift when transitioning between scenes
   * @param orientation - Direction the player is coming from
   */
  calculateTransitionShift(orientation: Orientation): Phaser.Math.Vector2;

  /**
   * Clean up transition zones and resources
   */
  shutdown(): void;
} 