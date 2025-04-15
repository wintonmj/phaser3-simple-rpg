/**
 * @fileoverview Spatial manager for entity culling and spatial partitioning
 */

import { ISpatialManager } from '../types/manager-interfaces';
import { QuadTree, QUADTREE } from '../utils/QuadTree';
import { Monster } from '../game-objects/enemies/Monster';

/** Distance threshold for monster updates (in pixels) */
const MONSTER_UPDATE_DISTANCE = 400;
/** Square of monster update distance for more efficient distance checks */
const MONSTER_UPDATE_DISTANCE_SQ = MONSTER_UPDATE_DISTANCE * MONSTER_UPDATE_DISTANCE;

/**
 * Manages spatial partitioning and entity culling
 */
export class SpatialManager implements ISpatialManager {
  private quadTree: QuadTree;
  private entities: Phaser.GameObjects.GameObject[] = [];
  private activeEntities: Set<Phaser.GameObjects.GameObject> = new Set();

  /**
   * Create a new SpatialManager
   * 
   * Note: scene parameter is required by interface but unused in this implementation
   */
  // @ts-ignore: Unused parameter - required by interface
  constructor(scene: Phaser.Scene) {
    // Initialize with a small default size, will be replaced in initialize()
    this.quadTree = new QuadTree(
      new Phaser.Geom.Rectangle(0, 0, 1000, 1000),
      QUADTREE.MAX_OBJECTS,
      QUADTREE.MAX_LEVELS
    );
  }

  /**
   * Initialize the spatial manager
   * @param mapWidth - Width of the map in pixels
   * @param mapHeight - Height of the map in pixels
   */
  public initialize(mapWidth: number, mapHeight: number): void {
    // Create a quadtree that covers the entire map
    this.quadTree = new QuadTree(
      new Phaser.Geom.Rectangle(0, 0, mapWidth, mapHeight),
      QUADTREE.MAX_OBJECTS,
      QUADTREE.MAX_LEVELS
    );
  }

  /**
   * Register entities to be tracked in the spatial system
   * @param entities - Entities to register
   */
  public registerEntities(entities: Phaser.GameObjects.GameObject[]): void {
    this.entities = entities;
  }

  /**
   * Update the spatial partitioning structure
   * @param cameraBounds - The current camera view bounds
   * @param playerPosition - The current player position
   */
  public update(cameraBounds: Phaser.Geom.Rectangle, playerPosition: Phaser.Math.Vector2): void {
    // Clear existing quadtree
    this.quadTree.clear();
    
    // Get expanded bounds to include monsters just outside the camera view
    const expandedBounds = new Phaser.Geom.Rectangle(
      cameraBounds.x - MONSTER_UPDATE_DISTANCE,
      cameraBounds.y - MONSTER_UPDATE_DISTANCE,
      cameraBounds.width + MONSTER_UPDATE_DISTANCE * 2,
      cameraBounds.height + MONSTER_UPDATE_DISTANCE * 2
    );
    
    // Only insert monsters that are active and within expanded bounds
    this.entities.forEach(entity => {
      if (!entity.active) return;
      
      // Only insert Monster types into the quadtree
      if (entity instanceof Monster) {
        // Use rectangle contains for faster boundary check
        if (Phaser.Geom.Rectangle.Contains(expandedBounds, entity.x, entity.y)) {
          this.quadTree.insert(entity);
        }
      }
    });
    
    // Update active entities based on distance to player
    this.updateActiveEntities(playerPosition);
  }

  /**
   * Updates which entities are considered active based on distance to player
   * @param playerPosition - The current player position
   */
  private updateActiveEntities(playerPosition: Phaser.Math.Vector2): void {
    // Clear previous active set
    this.activeEntities.clear();
    
    // Get query area around player for monster activation
    const playerQueryArea = new Phaser.Geom.Rectangle(
      playerPosition.x - MONSTER_UPDATE_DISTANCE,
      playerPosition.y - MONSTER_UPDATE_DISTANCE,
      MONSTER_UPDATE_DISTANCE * 2,
      MONSTER_UPDATE_DISTANCE * 2
    );
    
    // Query quadtree for monsters in range
    const nearbyEntities = this.quadTree.retrieveInBounds(playerQueryArea);
    
    // Final squared distance check and activate monsters
    nearbyEntities.forEach(entity => {
      if (!entity.active) return;
      
      // Efficient squared distance check
      const dx = entity.x - playerPosition.x;
      const dy = entity.y - playerPosition.y;
      const distanceSq = dx * dx + dy * dy;
      
      if (distanceSq <= MONSTER_UPDATE_DISTANCE_SQ) {
        this.activeEntities.add(entity);
        
        // If the entity is a monster, update it
        if (entity instanceof Monster) {
          entity.updateMonster();
        }
      }
    });
  }

  /**
   * Get active entities within range of the player
   * @returns Set of currently active entities
   */
  public getActiveEntities(): Set<Phaser.GameObjects.GameObject> {
    return this.activeEntities;
  }

  /**
   * Get the quadtree data structure
   */
  public getQuadTree(): QuadTree {
    return this.quadTree;
  }

  /**
   * Clear spatial data when shutting down
   */
  public shutdown(): void {
    this.quadTree.clear();
    this.activeEntities.clear();
    this.entities = [];
  }
} 