/**
 * @fileoverview Entity manager for player, NPCs, and monsters
 */

/**
 * Import section for EntityManager
 * 
 * Interfaces:
 * - {@link IEntityManager} - The manager interface this class implements
 * - {@link INonPlayerEntity} - Interface for non-player entities (used for typing)
 * 
 * Game objects:
 * - {@link Player} - Player character constructor
 * 
 * Constants:
 * - {@link MAP_CONTENT_KEYS} - Keys for map content objects
 * - {@link ENTITIES} - Dictionary of entity types
 * 
 * Scene classes:
 * - {@link AbstractScene} - Base scene class
 * 
 * Managers:
 * - {@link BaseManager} - Base manager class
 * 
 * Factories:
 * - {@link EntityFactory} - Factory for creating game entities
 */
import { IEntityManager, ISpatialManager, IInputManager } from '../types/manager-interfaces';
import { InterSceneData, CustomTilemapObject } from '../types/scene-types';
import { Player } from '../game-objects/Player';
import { MAP_CONTENT_KEYS } from '../constants/map-content-keys';
import { ENTITIES } from '../constants/entities';
import { AbstractScene } from '../scenes/AbstractScene';
import { INonPlayerEntity } from '../types/entities/entity-interfaces';
import { BaseManager } from './BaseManager';
import { PlayerInputBehavior } from '../behaviors/input/PlayerInputBehavior';
import { EntityFactory } from '../factories/EntityFactory';

/** Default player position if no scene data is available */
const DEFAULT_PLAYER_POSITION = {
  x: 50,
  y: 200
};

/**
 * Manages game entities including player, NPCs, and monsters
 * 
 * Responsibilities:
 * - Creating and storing entities (player, monsters)
 * - Providing access to these entities
 * - Basic entity lifecycle management
 * - Updating the player entity
 * 
 * Collaborators:
 * - SpatialManager: Handles activation/deactivation of entities based on spatial partitioning
 * - InputManager: Provides input state for player controls
 * - EntityFactory: Creates entity instances
 */
export class EntityManager extends BaseManager implements IEntityManager {
  private map: Phaser.Tilemaps.Tilemap;
  private player: Player;
  
  /** 
   * Collection of all non-player entities
   * 
   * Typed with INonPlayerEntity interface for type safety,
   * but contains instances of concrete classes that implement the interface
   * 
   * Note: EntityManager creates and stores non-player entities
   * SpatialManager handles their activation/deactivation based on position
   */
  private nonPlayerEntities: INonPlayerEntity[] = [];

  /** Injected manager dependencies */
  protected inputManager: IInputManager;
  protected spatialManager: ISpatialManager;

  private playerInputBehavior: PlayerInputBehavior;
  
  /** Entity factory for creating game entities */
  private entityFactory: EntityFactory;

  /**
   * Create a new EntityManager
   * @param scene - The scene this manager belongs to
   * @param inputManager - The input manager for player controls
   * @param spatialManager - The spatial manager for entity activation
   */
  constructor(
    scene: Phaser.Scene,
    inputManager?: IInputManager,
    spatialManager?: ISpatialManager
  ) {
    super(scene);
    
    if (inputManager) this.inputManager = inputManager;
    if (spatialManager) this.spatialManager = spatialManager;
    
    // Initialize the entity factory if we have a proper scene
    if (scene instanceof AbstractScene) {
      this.entityFactory = new EntityFactory(scene);
    }
  }

  /**
   * Set the required dependencies directly
   * @param inputManager - The input manager for player controls
   * @param spatialManager - The spatial manager for entity activation
   */
  public setDependencies(
    inputManager: IInputManager,
    spatialManager: ISpatialManager
  ): void {
    this.inputManager = inputManager;
    this.spatialManager = spatialManager;
  }

  /**
   * Initialize entity creation
   * @param map - The tilemap containing entity data
   * @param sceneData - Data from previous scene if any
   */
  public initialize(map: Phaser.Tilemaps.Tilemap, sceneData: InterSceneData): void {
    this.map = map;
    
    // Ensure we have a entity factory
    if (!this.entityFactory && this.scene instanceof AbstractScene) {
      this.entityFactory = new EntityFactory(this.scene);
    }
    
    this.createPlayer(sceneData);
    this.createMonsters();
  }

  /**
   * Create the player at the appropriate position
   * @param sceneData - Data from the previous scene
   */
  public createPlayer(sceneData: InterSceneData): Player {
    if (this.player) {
      console.warn('EntityManager.createPlayer: Player already exists');
      return this.player;
    }
    
    // Calculate player position from scene transition or use default
    const playerX = DEFAULT_PLAYER_POSITION.x;
    const playerY = DEFAULT_PLAYER_POSITION.y;
    
    // If we have scene data with a previous scene, we can use that for position
    if (sceneData && sceneData.comesFrom) {
      // In a real implementation, we would calculate position based on transition
      console.log(`Player transitioning from ${sceneData.comesFrom}`);
      
      // For now, just using default position
    }
    
    // Ensure that we have an entity factory
    if (!this.entityFactory && this.scene instanceof AbstractScene) {
      this.entityFactory = new EntityFactory(this.scene);
    }
    
    // Create the player using the factory to ensure scaling is applied
    if (this.entityFactory) {
      this.player = this.entityFactory.createPlayer(playerX, playerY);
    } else {
      console.error('EntityManager: Cannot create player without AbstractScene');
      return null;
    }
    
    // Create the input behavior for the player
    this.playerInputBehavior = new PlayerInputBehavior();
    this.player.setInputBehavior(this.playerInputBehavior);
    
    return this.player;
  }

  /**
   * Create monsters from map data
   * 
   * EntityManager responsibility: Create and store non-player entities
   * SpatialManager responsibility: Register non-player entities for spatial partitioning
   * and handle their activation/deactivation based on position
   */
  public createMonsters(): void {
    const monstersMapObjects = this.map.objects.find(
      o => o.name === MAP_CONTENT_KEYS.objects.MONSTERS,
    );
    const monsters = (monstersMapObjects?.objects || []) as unknown as CustomTilemapObject[];

    // Batch monster creation
    const monsterCreationOperations: INonPlayerEntity[] = [];
    
    // Define which entities are hostile (monsters)
    const hostileEntityValues = [ENTITIES.TREANT, ENTITIES.MOLE];
    
    monsters.forEach((monster: CustomTilemapObject) => {
      // Skip invalid entities
      if (!monster.name) {
        return;
      }
      
      // Check if this is a valid monster type
      const monsterType = monster.name;
      const isValidHostileEntity = hostileEntityValues.includes(monsterType as typeof ENTITIES.TREANT | typeof ENTITIES.MOLE);
      
      if (!isValidHostileEntity) {
        return;
      }
      
      // Use factory to create entity
      if (this.entityFactory) {
        const entity = this.entityFactory.createEntity(monsterType, monster.x, monster.y);
        if (entity) {
          monsterCreationOperations.push(entity);
        }
      }
    });
    
    this.nonPlayerEntities = monsterCreationOperations;
  }

  /**
   * Get the player instance
   */
  public getPlayer(): Player {
    return this.player;
  }

  /**
   * Get all non-player entities in the scene
   * 
   * @returns {INonPlayerEntity[]} Array of non-player entities typed as the interface
   */
  public getMonsters(): INonPlayerEntity[] {
    return this.nonPlayerEntities;
  }

  /**
   * Update entity states
   * 
   * EntityManager provides a consistent approach to entity updates:
   * - Processes player input
   * - Delegates spatial activation/deactivation to SpatialManager
   * - Updates both player and non-player entities in a uniform way
   */
  public update(): void {
    // Check if dependencies are available
    if (!this.player || !this.inputManager || !this.spatialManager) {
      console.warn('EntityManager.update: Required dependencies not available');
      return;
    }
    
    // Get current input state for the frame
    const keyState = this.inputManager.getKeyState();
    
    // Update player input behavior with the current key state
    this.playerInputBehavior.setKeyState(keyState);
    
    // Trigger the player's update method to process input
    this.player.update();
    
    // SpatialManager maintains a set of active entities based on position
    // We retrieve only the active entities within player range
    const ACTIVATION_RANGE = 300;
    
    // For performance, only update non-player entities that are within activation range
    // SpatialManager filters the entities based on spatial criteria
    const activeEntities = this.spatialManager.getActiveEntities(ACTIVATION_RANGE);
    
    // Filter our non-player entities to find those that are in the active set
    // This avoids updating entities that are far from player
    this.nonPlayerEntities.forEach(entity => {
      // Process active entities only
      if (entity.active && activeEntities.has(entity as unknown as Phaser.GameObjects.GameObject)) {
        entity.update();
      }
    });
    
    // This approach is more consistent because:
    // 1. SpatialManager determines which entities are active (spatial concern)
    // 2. EntityManager updates only relevant entities (performance optimization)
    // 3. Each entity type handles its own specific update logic
  }

  /**
   * Clean up entities when scene is shutdown
   */
  public shutdown(): void {
    // Deactivate non-player entities
    this.nonPlayerEntities.forEach(entity => {
      if (entity.active) {
        entity.setActive(false);
        if ('visible' in entity) {
          entity['setVisible'](false);
        }
      }
    });
    
    // Clear collections
    this.nonPlayerEntities = [];
  }
} 