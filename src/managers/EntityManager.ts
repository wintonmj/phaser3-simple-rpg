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
   * Collection of all monster entities
   * 
   * Typed with INonPlayerEntity interface for type safety,
   * but contains instances of concrete classes like Treant and Mole
   * that implements the interface
   * 
   * Note: EntityManager creates and stores monsters
   * SpatialManager handles their activation/deactivation based on position
   */
  private monsters: INonPlayerEntity[] = [];

  /** Injected manager dependencies */
  protected inputManager: IInputManager;
  protected spatialManager: ISpatialManager;

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
    // In a real implementation, we would use sceneData for more sophisticated positioning
    const position = sceneData?.comesFrom 
      ? { x: 50, y: 200 } // Using default position but acknowledging sceneData
      : DEFAULT_PLAYER_POSITION;

    // Create player instance
    if (this.scene instanceof AbstractScene) {
      this.player = new Player(this.scene, position.x, position.y);
    } else {
      // Fallback for non-AbstractScene (should not happen in practice)
      // Using unknown as intermediate type to avoid direct any usage
      this.player = new Player(this.scene as unknown as AbstractScene, position.x, position.y);
      console.warn('EntityManager: Creating player with non-AbstractScene');
    }
    
    return this.player;
  }

  /**
   * Create monsters from map data
   * 
   * EntityManager responsibility: Create and store monster entities
   * SpatialManager responsibility: Register monsters for spatial partitioning
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
    
    this.monsters = monsterCreationOperations.filter(Boolean) as INonPlayerEntity[];
  }

  /**
   * Get the player instance
   */
  public getPlayer(): Player {
    return this.player;
  }

  /**
   * Get all monsters in the scene
   * 
   * @returns {INonPlayerEntity[]} Array of monsters typed as the interface,
   * though each element is an instance of a concrete class (Treant, Mole)
   * that implements the interface
   */
  public getMonsters(): INonPlayerEntity[] {
    return this.monsters;
  }

  /**
   * Update entity states
   * 
   * EntityManager responsibility: Update the player based on input
   * SpatialManager responsibility: Handle monster activation/deactivation and updates
   */
  public update(): void {
    // Check if the player and inputManager are available
    if (!this.player || !this.inputManager) {
      console.warn('EntityManager.update: Player or InputManager not available');
      return;
    }
    
    // Get key state from InputManager and update player
    const keyState = this.inputManager.getKeyState();
    this.player.updatePlayer(keyState);
    
    // Note: Monster updates are handled by the SpatialManager in its update method
    // SpatialManager determines which monsters are active based on position
    // and only updates active monsters
  }

  /**
   * Clean up entities when scene is shutdown
   */
  public shutdown(): void {
    // Deactivate monsters
    this.monsters.forEach(monster => {
      if (monster.active) {
        monster.setActive(false);
        if (monster instanceof Phaser.GameObjects.Sprite) {
          monster.setVisible(false);
        }
      }
    });
    
    // Clear collections
    this.monsters = [];
  }
} 