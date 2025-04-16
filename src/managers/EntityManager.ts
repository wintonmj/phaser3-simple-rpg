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
 * - {@link NonPlayerEntity} - Base class for all non-player entities
 * 
 * Enemy types:
 * - {@link Treant} - Concrete implementation of tree monster
 * - {@link Mole} - Concrete implementation of mole monster
 * 
 * Constants:
 * - {@link MAP_CONTENT_KEYS} - Keys for map content objects
 * - {@link MONSTERS} - Dictionary of monster types (needed for monster creation)
 * 
 * Scene classes:
 * - {@link AbstractScene} - Base scene class
 * 
 * Managers:
 * - {@link BaseManager} - Base manager class
 */
import { IEntityManager, ISpatialManager, IInputManager } from '../types/manager-interfaces';
import { InterSceneData, CustomTilemapObject } from '../types/scene-types';
import { Player } from '../game-objects/Player';
import { NonPlayerEntity } from '../game-objects/entities/NonPlayerEntity';
import { Treant } from '../game-objects/enemies/Treant';
import { Mole } from '../game-objects/enemies/Mole';
import { MAP_CONTENT_KEYS } from '../constants/map-content-keys';
import { MONSTERS } from '../constants/entities';
import { AbstractScene } from '../scenes/AbstractScene';
import { INonPlayerEntity } from '../types/entities/entity-interfaces';
import { BaseManager } from './BaseManager';
import { PlayerInputBehavior } from '../behaviors/input/PlayerInputBehavior';

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
 */
export class EntityManager extends BaseManager implements IEntityManager {
  private map: Phaser.Tilemaps.Tilemap;
  private player: Player;
  
  /** 
   * Collection of all non-player entities
   * 
   * Typed with INonPlayerEntity interface for type safety,
   * but contains instances of concrete classes like Treant and Mole
   * that implements the interface
   * 
   * Note: EntityManager creates and stores non-player entities
   * SpatialManager handles their activation/deactivation based on position
   */
  private nonPlayerEntities: INonPlayerEntity[] = [];

  /** Injected manager dependencies */
  protected inputManager: IInputManager;
  protected spatialManager: ISpatialManager;

  private playerInputBehavior: PlayerInputBehavior;

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
    
    // Create player at the appropriate position
    this.player = new Player(this.scene as AbstractScene, playerX, playerY);
    
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

    /**
     * Factory function to create monster instances
     * 
     * This requires importing concrete monster classes (Treant, Mole)
     * even though we're typing with INonPlayerEntity interface.
     * 
     * @param {string} type - Monster type from MONSTERS constant
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {NonPlayerEntity|null} The created monster or null
     */
    const createMonster = (type: string, x: number, y: number): NonPlayerEntity | null => {
      if (!(this.scene instanceof AbstractScene)) {
        console.warn('EntityManager: Creating monster with non-AbstractScene');
        return null;
      }
      
      switch (type) {
        case MONSTERS.treant:
          return new Treant(this.scene, x, y);
        case MONSTERS.mole:
          return new Mole(this.scene, x, y);
        default:
          return null;
      }
    };

    // Batch monster creation
    const monsterCreationOperations: NonPlayerEntity[] = [];
    
    monsters.forEach((monster: CustomTilemapObject) => {
      // Skip invalid monsters
      if (!monster.name || !(monster.name in MONSTERS)) {
        return;
      }
      
      const newMonster = createMonster(monster.name, monster.x, monster.y);
      if (newMonster) {
        monsterCreationOperations.push(newMonster);
      }
    });
    
    this.nonPlayerEntities = monsterCreationOperations.filter(Boolean) as INonPlayerEntity[];
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
   * @returns {INonPlayerEntity[]} Array of non-player entities typed as the interface,
   * though each element is an instance of a concrete class (Treant, Mole)
   * that implements the interface
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
        if (entity instanceof Phaser.GameObjects.Sprite) {
          entity.setVisible(false);
        }
      }
    });
    
    // Clear collections
    this.nonPlayerEntities = [];
  }
} 