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
 * - {@link ObjectPoolManager} - Manager for object pools
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
import { ObjectPoolManager } from './ObjectPoolManager';

/** Default player position if no scene data is available */
const DEFAULT_PLAYER_POSITION = {
  x: 50,
  y: 200
};

// Type for our necessary scene functionality, without requiring AbstractScene
type SceneType = Phaser.Scene & {
  physics: Phaser.Physics.Arcade.ArcadePhysics;
};

/**
 * Manages game entities including player, NPCs, and monsters
 */
export class EntityManager implements IEntityManager {
  private scene: SceneType;
  private map: Phaser.Tilemaps.Tilemap;
  private player: Player;
  
  /** 
   * Collection of all monster entities
   * 
   * Typed with INonPlayerEntity interface for type safety,
   * but contains instances of concrete classes like Treant and Mole
   * that implements the interface
   */
  private monsters: INonPlayerEntity[] = [];
  
  /** Object pool manager for reusable game objects */
  private objectPoolManager: ObjectPoolManager;

  /**
   * Create a new EntityManager
   * @param scene - The scene this manager belongs to
   */
  constructor(scene: Phaser.Scene) {
    this.scene = scene as SceneType;
    this.objectPoolManager = new ObjectPoolManager(scene);
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

    // Using type casting for compatibility during refactoring
    // In a complete implementation, the game classes would be updated
    this.player = new Player(this.scene as AbstractScene, position.x, position.y);
    return this.player;
  }

  /**
   * Create monsters from map data
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
      // Using type casting for compatibility during refactoring
      switch (type) {
        case MONSTERS.treant:
          return new Treant(this.scene as AbstractScene, x, y);
        case MONSTERS.mole:
          return new Mole(this.scene as AbstractScene, x, y);
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
    
    // Note: Spatial activation of monsters is now handled by SpatialManager
  }

  /**
   * Create object pools for reusable game objects
   * @deprecated This method is kept for compatibility but delegates to ObjectPoolManager
   */
  public createObjectPools(): void {
    // This method is maintained for backwards compatibility
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
    return this.objectPoolManager.getObjectPool(poolName);
  }

  /**
   * Update entity states
   */
  public update(): void {
    // Get current key state from InputManager and update player
    if (this.scene instanceof AbstractScene && this.player) {
      const keyState = this.scene.getInputManager().getKeyState();
      this.player.updatePlayer(keyState);
    }
    
    // Monster updates are handled by the SpatialManager
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
    
    // Clean up object pools
    this.objectPoolManager.shutdown();
    
    // Clear collections
    this.monsters = [];
  }
} 