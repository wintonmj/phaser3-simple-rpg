/**
 * @fileoverview Entity manager for player, NPCs, and monsters
 */

import { IEntityManager } from '../types/manager-interfaces';
import { InterSceneData, CustomTilemapObject } from '../types/scene-types';
import { Player } from '../game-objects/Player';
import { Npc } from '../game-objects/Npc';
import { Monster } from '../game-objects/enemies/Monster';
import { Treant } from '../game-objects/enemies/Treant';
import { Mole } from '../game-objects/enemies/Mole';
import { MAP_CONTENT_KEYS } from '../constants/map-content-keys';
import { MONSTERS } from '../constants/monsters';
import { AbstractScene } from '../scenes/AbstractScene';

/** Distance threshold for monster updates (in pixels) */
const MONSTER_UPDATE_DISTANCE = 400;
/** Square of monster update distance for more efficient distance checks */
const MONSTER_UPDATE_DISTANCE_SQ = MONSTER_UPDATE_DISTANCE * MONSTER_UPDATE_DISTANCE;

/** Default player position if no scene data is available */
const DEFAULT_PLAYER_POSITION = {
  x: 50,
  y: 200
};

/** Object pool sizes */
const POOL_SIZES = {
  PARTICLES: 50,
  PROJECTILES: 20,
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
  private npcs: Npc[] = [];
  private monsters: Monster[] = [];
  private objectPools: Record<string, Phaser.GameObjects.Group> = {};

  /**
   * Create a new EntityManager
   * @param scene - The scene this manager belongs to
   */
  constructor(scene: Phaser.Scene) {
    this.scene = scene as SceneType;
  }

  /**
   * Initialize entity creation
   * @param map - The tilemap containing entity data
   * @param sceneData - Data from previous scene if any
   */
  public initialize(map: Phaser.Tilemaps.Tilemap, sceneData: InterSceneData): void {
    this.map = map;
    this.createObjectPools();
    this.createPlayer(sceneData);
    this.createNPCs();
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
    this.player = new Player(this.scene as any, position.x, position.y);
    return this.player;
  }

  /**
   * Create NPCs from map data
   */
  public createNPCs(): void {
    const npcsMapObjects = this.map.objects.find(o => o.name === MAP_CONTENT_KEYS.objects.NPCS);
    const npcs = (npcsMapObjects?.objects || []) as unknown as CustomTilemapObject[];
    
    // Create extended camera bounds for culling
    const extendedBounds = new Phaser.Geom.Rectangle(
      0, 0, 
      this.scene.cameras.main.width + MONSTER_UPDATE_DISTANCE*2, 
      this.scene.cameras.main.height + MONSTER_UPDATE_DISTANCE*2
    );
    
    // Batch NPC creation
    const npcCreationOperations: Npc[] = [];
    
    npcs
      // Pre-filter NPCs by distance to camera to reduce object creation
      .filter(npc => Phaser.Geom.Rectangle.Contains(extendedBounds, npc.x, npc.y))
      .forEach(npc => {
        // Using type casting for compatibility during refactoring
        const newNpc = new Npc(
          this.scene as any, 
          npc.x, 
          npc.y, 
          npc.properties.message || ''
        );
        npcCreationOperations.push(newNpc);
      });
    
    this.npcs = npcCreationOperations;
  }

  /**
   * Create monsters from map data
   */
  public createMonsters(): void {
    const monstersMapObjects = this.map.objects.find(
      o => o.name === MAP_CONTENT_KEYS.objects.MONSTERS,
    );
    const monsters = (monstersMapObjects?.objects || []) as unknown as CustomTilemapObject[];

    // Object pooling factory function to reuse monster instances
    const createMonster = (type: string, x: number, y: number): Monster | null => {
      // Using type casting for compatibility during refactoring
      switch (type) {
        case MONSTERS.treant:
          return new Treant(this.scene as any, x, y);
        case MONSTERS.mole:
          return new Mole(this.scene as any, x, y);
        default:
          return null;
      }
    };

    // Batch monster creation
    const monsterCreationOperations: Monster[] = [];
    
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
    
    this.monsters = monsterCreationOperations.filter(Boolean);
      
    // Initially deactivate monsters that are far from player
    if (this.player) {
      const playerX = this.player.x;
      const playerY = this.player.y;
      
      this.monsters.forEach(monster => {
        // Efficient squared distance check
        const dx = monster.x - playerX;
        const dy = monster.y - playerY;
        const distanceSq = dx * dx + dy * dy;
        
        // Set initial active state based on distance
        if (distanceSq > MONSTER_UPDATE_DISTANCE_SQ * 2.25) { // 1.5^2 = 2.25
          monster.setActive(false);
          if (monster instanceof Phaser.GameObjects.Sprite) {
            monster.setVisible(false);
          }
        }
      });
    }
  }

  /**
   * Create object pools for reusable game objects
   */
  public createObjectPools(): void {
    // Create pools with specific recycling behavior
    this.objectPools.particles = this.scene.add.group({
      maxSize: POOL_SIZES.PARTICLES,
      active: false,
      createCallback: (particle) => {
        this.scene.physics.world.enable(particle);
        if (particle.body) {
          (particle.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
        }
      },
      removeCallback: (particle) => {
        // Reset particle state when removed from active use
        particle.setActive(false);
        if (particle instanceof Phaser.GameObjects.Sprite) {
          particle.setVisible(false);
        }
        if (particle.body) {
          (particle.body as Phaser.Physics.Arcade.Body).reset(0, 0);
        }
      }
    });
    
    this.objectPools.projectiles = this.scene.add.group({
      maxSize: POOL_SIZES.PROJECTILES,
      active: false,
      createCallback: (projectile) => {
        this.scene.physics.world.enable(projectile);
      },
      removeCallback: (projectile) => {
        // Reset projectile state when removed from active use
        projectile.setActive(false);
        if (projectile instanceof Phaser.GameObjects.Sprite) {
          projectile.setVisible(false);
        }
        if (projectile.body) {
          (projectile.body as Phaser.Physics.Arcade.Body).reset(0, 0);
        }
      }
    });
  }

  /**
   * Get the player instance
   */
  public getPlayer(): Player {
    return this.player;
  }

  /**
   * Get all NPCs in the scene
   */
  public getNPCs(): Npc[] {
    return this.npcs;
  }

  /**
   * Get all monsters in the scene
   */
  public getMonsters(): Monster[] {
    return this.monsters;
  }

  /**
   * Get an object pool by name
   * @param poolName - The name of the object pool
   */
  public getObjectPool(poolName: string): Phaser.GameObjects.Group | undefined {
    return this.objectPools[poolName];
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
    // Clear NPCs
    this.npcs.forEach(npc => {
      if (npc.active) {
        npc.destroy();
      }
    });
    
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
    this.npcs = [];
  }
} 