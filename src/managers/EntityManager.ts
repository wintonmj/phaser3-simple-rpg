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
import { IEntityManager } from '../types/manager-interfaces';
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
 * Works in conjunction with:
 * - SpatialManager: Handles activation/deactivation and spatial operations for entities
 * - ObjectPoolManager: Manages reusable game objects
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
   * Note: Active state of these entities is managed by SpatialManager
   */
  private monsters: INonPlayerEntity[] = [];

  /**
   * Create a new EntityManager
   * @param scene - The scene this manager belongs to
   */
  constructor(scene: Phaser.Scene) {
    super(scene);
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
    
    // Note: After creation, entities should be registered with SpatialManager
    // in the AbstractScene.init method to manage their activation/deactivation
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
   * Note: After creation, monsters need to be registered with SpatialManager
   * for spatial partitioning and activation/deactivation
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
    
    // Note: After creation, monsters need to be registered with SpatialManager
    // This happens in AbstractScene.init() via spatialManager.registerEntities()
  }

  /**
   * Create object pools for reusable game objects
   * @deprecated This method is deprecated. Object pools are now managed by ObjectPoolManager
   */
  public createObjectPools(): void {
    // This method is maintained for interface compatibility
    // All object pool logic is now in ObjectPoolManager
    console.warn('EntityManager.createObjectPools is deprecated. Object pools are managed automatically by ObjectPoolManager');
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
   * Get an object pool by name
   * @param poolName - The name of the object pool
   */
  public getObjectPool(poolName: string): Phaser.GameObjects.Group | undefined {
    const objectPoolManager = this.getObjectPoolManager();
    if (!objectPoolManager) {
      console.warn('EntityManager.getObjectPool: No ObjectPoolManager available');
      return undefined;
    }
    return objectPoolManager.getObjectPool(poolName);
  }

  /**
   * Update entity states
   * 
   * Note: This only updates the player. Monster updates are handled by 
   * the SpatialManager based on proximity to the player.
   */
  public update(): void {
    // Get current key state from InputManager and update player
    if (this.scene instanceof AbstractScene && this.player) {
      const keyState = this.scene.getInputManager().getKeyState();
      this.player.updatePlayer(keyState);
    }
    
    // Monster updates are handled by the SpatialManager in its update method
    // See SpatialManager.updateActiveEntities() for entity update logic
  }

  /**
   * Clean up entities when scene is shutdown
   */
  public shutdown(): void {
    // Return monsters to object pool instead of destroying
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