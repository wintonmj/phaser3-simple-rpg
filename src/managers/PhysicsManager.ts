/**
 * @fileoverview Physics manager for collision handling and physics operations
 */

import { IPhysicsManager } from '../types/manager-interfaces';
import { MapLayers } from '../types/scene-types';
import { Player } from '../game-objects/Player';
import { Monster } from '../game-objects/enemies/Monster';
import { Npc } from '../game-objects/Npc';

/**
 * Manages physics operations and collision handling
 */
export class PhysicsManager implements IPhysicsManager {
  private scene: Phaser.Scene;
  private pendingPhysicsOperations: Array<() => void> = [];

  /**
   * Create a new PhysicsManager
   * @param scene - The scene this manager belongs to
   */
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Initialize physics settings
   * @param mapWidth - Width of the map in pixels
   * @param mapHeight - Height of the map in pixels
   */
  public initialize(mapWidth: number, mapHeight: number): void {
    this.setupPhysicsWorld(mapWidth, mapHeight);
  }

  /**
   * Set up the physics world bounds
   */
  private setupPhysicsWorld(mapWidth: number, mapHeight: number): void {
    this.scene.physics.world.setBounds(0, 0, mapWidth, mapHeight);
    
    // Set physics debug configuration if in development mode
    if (process.env.NODE_ENV === 'development') {
      this.scene.physics.world.drawDebug = false; // Only enable when needed
    }
  }

  /**
   * Add collision handlers between objects and layers
   * @param player - The player object
   * @param layers - Map layers with collision
   * @param monsters - Monster entities
   * @param npcs - NPC entities
   */
  public setupColliders(
    player: Player,
    layers: MapLayers,
    monsters: Monster[],
    npcs: Npc[]
  ): void {
    // Create groups once and reuse
    const monsterGroup = this.createGroup(monsters);
    const npcGroup = this.createGroup(npcs);
    
    // Create composite collider for solid world objects
    const solidLayers = [layers.terrain, layers.deco];
    
    // Queue all colliders for batch processing
    solidLayers.forEach(layer => {
      // Add collider for player
      this.queuePhysicsOperation(() => {
        this.scene.physics.add.collider(player, layer);
      });
      
      // Add collider for all monsters
      this.queuePhysicsOperation(() => {
        this.scene.physics.add.collider(monsterGroup, layer);
      });
      
      // Add collider for NPCs
      this.queuePhysicsOperation(() => {
        this.scene.physics.add.collider(npcGroup, layer);
      });
    });
    
    // Entity collisions - use a single collider with a callback
    // Optimize by using a processing callback to early-exit unnecessary collision checks
    this.queuePhysicsOperation(() => {
      this.scene.physics.add.collider(
        monsterGroup, 
        player, 
        // Collision callback
        (_player: Player, monster: Monster) => {
          monster.attack();
        },
        // Process callback for early filtering
        (_player: Player, monster: Monster) => {
          // Only process collision if monster is active
          if (!monster.active) return false;
          
          // Efficient squared distance check
          const dx = _player.x - monster.x;
          const dy = _player.y - monster.y;
          const distanceSq = dx * dx + dy * dy;
          
          // Quick body width calculation
          const radiusSum = monster.body.width * 0.75; // Half width * 1.5
          const radiusSumSq = radiusSum * radiusSum;
          
          return distanceSq <= radiusSumSq;
        }
      );
    });
    
    // NPC collisions
    this.queuePhysicsOperation(() => {
      this.scene.physics.add.collider(npcGroup, npcGroup);
    });
    
    this.queuePhysicsOperation(() => {
      this.scene.physics.add.collider(npcGroup, player);
    });
    
    // NPC interactions - use a single overlap handler for all NPCs with process callback
    this.queuePhysicsOperation(() => {
      this.scene.physics.add.overlap(
        npcGroup, 
        player, 
        (_player: Player, npc: Npc) => {
          npc.talk();
        },
        // Process callback to check if player is facing the NPC
        (_player: Player, npc: Npc) => {
          // Efficient squared distance check for interaction
          const dx = _player.x - npc.x;
          const dy = _player.y - npc.y;
          const distanceSq = dx * dx + dy * dy;
          
          return distanceSq < 1600; // 40^2
        }
      );
    });
    
    // Process all the batched physics operations at once
    this.processBatchedPhysics();
  }

  /**
   * Queue a physics operation for batch processing
   * @param operation - Function representing a physics operation
   */
  public queuePhysicsOperation(operation: () => void): void {
    this.pendingPhysicsOperations.push(operation);
  }

  /**
   * Process all queued physics operations
   */
  public processBatchedPhysics(): void {
    // Early exit if no operations
    if (this.pendingPhysicsOperations.length === 0) return;
    
    // Process all operations in a single batch
    for (const operation of this.pendingPhysicsOperations) {
      operation();
    }
    
    // Clear the queue
    this.pendingPhysicsOperations = [];
  }

  /**
   * Create a physics group for game objects
   * @param objects - Objects to include in the group
   */
  public createGroup(objects: Phaser.GameObjects.GameObject[]): Phaser.Physics.Arcade.Group {
    return this.scene.physics.add.group(objects);
  }

  /**
   * Clean up physics resources
   */
  public shutdown(): void {
    // Clear pending physics operations
    this.pendingPhysicsOperations = [];
    
    // Destroy physics colliders
    if (this.scene.physics.world.colliders.getActive().length > 0) {
      this.scene.physics.world.colliders.destroy();
    }
  }
} 